import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/utils/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { r2Client } from "@/lib/r2";
import { CreateMultipartUploadCommand, UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

/**
 * POST /api/uploads/init
 * 
 * Initialize a chunked/multipart upload for large files.
 * Returns uploadId and presigned URLs for each chunk.
 * 
 * ACCEPTANCE CRITERIA:
 * - Resume uploads after network loss for 95% of cases
 * - Support files up to 5GB
 * - Chunk size: 5MB default (configurable)
 */

interface InitUploadBody {
  filename: string;
  contentType: string;
  totalSize: number;
  projectId?: string;
  clientId?: string;
  fileType: 'raw' | 'deliverable' | 'portfolio' | 'team-wip';
  chunkSize?: number; // bytes, default 5MB
}

const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CHUNK_SIZE = 100 * 1024 * 1024; // 100MB max chunk
const MIN_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB min (R2/S3 requirement)
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

// Allowed MIME types
const ALLOWED_MIMES: Record<string, string[]> = {
  'raw': ['video/*', 'image/*', 'application/zip', 'application/x-rar-compressed'],
  'deliverable': ['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/zip'],
  'portfolio': ['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp'],
  'team-wip': ['video/*', 'image/*', 'application/zip', 'application/x-rar-compressed', 'application/pdf'],
};

function isAllowedMime(contentType: string, fileType: string): boolean {
  const allowed = ALLOWED_MIMES[fileType] || [];
  return allowed.some(pattern => {
    if (pattern.endsWith('/*')) {
      return contentType.startsWith(pattern.slice(0, -1));
    }
    return contentType === pattern;
  });
}

function generateStoragePath(params: {
  fileType: string;
  filename: string;
  projectId?: string;
  clientId?: string;
  userId: string;
}): string {
  const { fileType, filename, projectId, clientId, userId } = params;
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueFilename = `${timestamp}_${sanitizedFilename}`;
  
  switch (fileType) {
    case 'portfolio':
      return projectId 
        ? `public/portfolio/${projectId}/${uniqueFilename}`
        : `public/portfolio/general/${uniqueFilename}`;
    case 'deliverable':
      if (clientId && projectId) {
        return `clients/${clientId}/${projectId}/deliverables/${uniqueFilename}`;
      }
      return `deliverables/${projectId || 'general'}/${uniqueFilename}`;
    case 'raw':
      if (clientId && projectId) {
        return `clients/${clientId}/${projectId}/raw/${uniqueFilename}`;
      }
      return `raw/${projectId || 'general'}/${uniqueFilename}`;
    case 'team-wip':
      return `team/${userId}/work_in_progress/${uniqueFilename}`;
    default:
      return `uploads/${uniqueFilename}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClientServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    
    const role = profile?.role || "client";
    
    // Only team/admin can upload
    if (!['admin', 'team'].includes(role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Parse body
    const body: InitUploadBody = await request.json();
    const { 
      filename, 
      contentType, 
      totalSize, 
      projectId, 
      clientId, 
      fileType,
      chunkSize: requestedChunkSize 
    } = body;

    // Validate required fields
    if (!filename || !contentType || !totalSize || !fileType) {
      return NextResponse.json(
        { error: "Missing required fields: filename, contentType, totalSize, fileType" },
        { status: 400 }
      );
    }

    // Validate file size
    if (totalSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024 * 1024)}GB` },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!isAllowedMime(contentType, fileType)) {
      return NextResponse.json(
        { error: `File type ${contentType} not allowed for ${fileType} uploads` },
        { status: 400 }
      );
    }

    // Calculate chunk size
    let chunkSize = requestedChunkSize || DEFAULT_CHUNK_SIZE;
    chunkSize = Math.max(MIN_CHUNK_SIZE, Math.min(MAX_CHUNK_SIZE, chunkSize));
    
    const totalChunks = Math.ceil(totalSize / chunkSize);
    
    // Generate storage path
    const r2Path = generateStoragePath({
      fileType,
      filename,
      projectId,
      clientId,
      userId: user.id,
    });

    // Create multipart upload
    const createCommand = new CreateMultipartUploadCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: r2Path,
      ContentType: contentType,
    });
    
    const multipartUpload = await r2Client.send(createCommand);
    const uploadId = multipartUpload.UploadId;
    
    if (!uploadId) {
      throw new Error("Failed to create multipart upload");
    }

    // Generate presigned URLs for each chunk
    const chunkUrls: { partNumber: number; url: string }[] = [];
    
    for (let i = 1; i <= totalChunks; i++) {
      const uploadPartCommand = new UploadPartCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: r2Path,
        UploadId: uploadId,
        PartNumber: i,
      });
      
      const presignedUrl = await getSignedUrl(r2Client, uploadPartCommand, {
        expiresIn: 3600, // 1 hour per chunk
      });
      
      chunkUrls.push({ partNumber: i, url: presignedUrl });
    }

    // Store upload record for resume support
    const internalUploadId = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { error: insertError } = await supabaseAdmin
      .from("chunked_uploads")
      .insert({
        id: internalUploadId,
        upload_id: uploadId,
        user_id: user.id,
        project_id: projectId || null,
        filename,
        mime_type: contentType,
        total_size: totalSize,
        total_chunks: totalChunks,
        chunk_size: chunkSize,
        r2_path: r2Path,
        file_type: fileType,
        status: 'in_progress',
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Failed to store upload record:", insertError);
      // Continue anyway - upload can still work
    }

    // Log analytics event
    void supabaseAdmin.rpc('log_audit_event', {
      p_user_id: user.id,
      p_action: 'upload_started',
      p_action_category: 'media',
      p_metadata: {
        uploadId: internalUploadId,
        filename,
        totalSize,
        totalChunks,
        fileType,
      }
    });

    return NextResponse.json({
      uploadId: internalUploadId,
      r2UploadId: uploadId,
      r2Path,
      chunkSize,
      totalChunks,
      chunkUrls,
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error("Upload init error:", error);
    return NextResponse.json(
      { error: "Failed to initialize upload" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/uploads/init?uploadId=xxx
 * 
 * Get existing upload status and resume URLs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get('uploadId');
    
    if (!uploadId) {
      return NextResponse.json({ error: "uploadId required" }, { status: 400 });
    }

    // Authenticate
    const supabase = await createClientServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get upload record
    const { data: upload, error } = await supabaseAdmin
      .from("chunked_uploads")
      .select("*")
      .eq("id", uploadId)
      .eq("user_id", user.id)
      .single();

    if (error || !upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    // Check if expired
    if (new Date(upload.expires_at) < new Date()) {
      return NextResponse.json({ error: "Upload expired" }, { status: 410 });
    }

    // Generate new presigned URLs for remaining chunks
    const uploadedParts = (upload.uploaded_parts || []) as { partNumber: number; etag: string }[];
    const uploadedPartNumbers = new Set(uploadedParts.map(p => p.partNumber));
    
    const remainingChunkUrls: { partNumber: number; url: string }[] = [];
    
    for (let i = 1; i <= upload.total_chunks; i++) {
      if (!uploadedPartNumbers.has(i)) {
        const uploadPartCommand = new UploadPartCommand({
          Bucket: process.env.R2_BUCKET!,
          Key: upload.r2_path,
          UploadId: upload.upload_id,
          PartNumber: i,
        });
        
        const presignedUrl = await getSignedUrl(r2Client, uploadPartCommand, {
          expiresIn: 3600,
        });
        
        remainingChunkUrls.push({ partNumber: i, url: presignedUrl });
      }
    }

    return NextResponse.json({
      uploadId: upload.id,
      r2UploadId: upload.upload_id,
      r2Path: upload.r2_path,
      filename: upload.filename,
      totalSize: upload.total_size,
      chunkSize: upload.chunk_size,
      totalChunks: upload.total_chunks,
      chunksUploaded: upload.chunks_uploaded,
      bytesUploaded: upload.bytes_uploaded,
      uploadedParts,
      remainingChunkUrls,
      status: upload.status,
      expiresAt: upload.expires_at,
    });

  } catch (error) {
    console.error("Get upload status error:", error);
    return NextResponse.json(
      { error: "Failed to get upload status" },
      { status: 500 }
    );
  }
}
