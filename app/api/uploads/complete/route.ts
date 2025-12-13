import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/utils/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { r2Client } from "@/lib/r2";
import { CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";

/**
 * POST /api/uploads/complete
 * 
 * Complete a multipart upload after all chunks are uploaded.
 * Combines all parts into final object.
 */

interface CompleteUploadBody {
  uploadId: string;
  parts: { partNumber: number; etag: string }[];
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const supabase = await createClientServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse body
    const body: CompleteUploadBody = await request.json();
    const { uploadId, parts } = body;

    if (!uploadId || !parts || parts.length === 0) {
      return NextResponse.json(
        { error: "Missing uploadId or parts" },
        { status: 400 }
      );
    }

    // Get upload record
    const { data: upload, error: fetchError } = await supabaseAdmin
      .from("chunked_uploads")
      .select("*")
      .eq("id", uploadId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    if (upload.status === 'completed') {
      return NextResponse.json({ error: "Upload already completed" }, { status: 400 });
    }

    // Verify all parts received
    if (parts.length !== upload.total_chunks) {
      return NextResponse.json(
        { error: `Expected ${upload.total_chunks} parts, received ${parts.length}` },
        { status: 400 }
      );
    }

    // Sort parts by part number (required by S3/R2)
    const sortedParts = parts.sort((a, b) => a.partNumber - b.partNumber);

    // Complete multipart upload
    const completeCommand = new CompleteMultipartUploadCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: upload.r2_path,
      UploadId: upload.upload_id,
      MultipartUpload: {
        Parts: sortedParts.map(part => ({
          PartNumber: part.partNumber,
          ETag: part.etag,
        })),
      },
    });

    const result = await r2Client.send(completeCommand);

    // Update upload record
    await supabaseAdmin
      .from("chunked_uploads")
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        uploaded_parts: sortedParts,
        chunks_uploaded: upload.total_chunks,
        bytes_uploaded: upload.total_size,
      })
      .eq("id", uploadId);

    // Create media_assets record
    const { data: mediaAsset, error: assetError } = await supabaseAdmin
      .from("media_assets")
      .insert({
        uploaded_by: user.id,
        project_id: upload.project_id,
        filename: upload.filename,
        r2_path: upload.r2_path,
        mime_type: upload.mime_type,
        file_size: upload.total_size,
        file_type: upload.file_type,
        upload_status: 'complete',
        storage_class: 'standard',
      })
      .select()
      .single();

    if (assetError) {
      console.error("Failed to create media asset:", assetError);
    }

    // Log audit event
    void supabaseAdmin.rpc('log_audit_event', {
      p_user_id: user.id,
      p_action: 'upload_completed',
      p_action_category: 'media',
      p_entity_type: 'media_asset',
      p_entity_id: mediaAsset?.id,
      p_metadata: {
        uploadId,
        filename: upload.filename,
        totalSize: upload.total_size,
        totalParts: parts.length,
        r2Path: upload.r2_path,
      }
    });

    // Queue processing job if video/image
    if (upload.mime_type.startsWith('video/') || upload.mime_type.startsWith('image/')) {
      const { error: jobError } = await supabaseAdmin
        .from("processing_jobs")
        .insert({
          media_asset_id: mediaAsset?.id,
          type: upload.mime_type.startsWith('video/') ? 'transcode' : 'thumbnail',
          status: 'pending',
          metadata: {
            original_path: upload.r2_path,
            mime_type: upload.mime_type,
          }
        });
      
      if (jobError) {
        console.error("Failed to queue processing job:", jobError);
      }
    }

    return NextResponse.json({
      success: true,
      uploadId,
      assetId: mediaAsset?.id,
      r2Path: upload.r2_path,
      location: result.Location,
      filename: upload.filename,
      totalSize: upload.total_size,
    });

  } catch (error) {
    console.error("Complete upload error:", error);
    return NextResponse.json(
      { error: "Failed to complete upload" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/uploads/complete
 * 
 * Abort a multipart upload (cancel/cleanup)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate
    const supabase = await createClientServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get('uploadId');
    
    if (!uploadId) {
      return NextResponse.json({ error: "uploadId required" }, { status: 400 });
    }

    // Get upload record
    const { data: upload, error: fetchError } = await supabaseAdmin
      .from("chunked_uploads")
      .select("*")
      .eq("id", uploadId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    // Abort multipart upload in R2
    if (upload.status === 'in_progress') {
      const abortCommand = new AbortMultipartUploadCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: upload.r2_path,
        UploadId: upload.upload_id,
      });
      
      await r2Client.send(abortCommand);
    }

    // Update upload record
    await supabaseAdmin
      .from("chunked_uploads")
      .update({
        status: 'aborted',
        completed_at: new Date().toISOString(),
      })
      .eq("id", uploadId);

    // Log audit event
    void supabaseAdmin.rpc('log_audit_event', {
      p_user_id: user.id,
      p_action: 'upload_aborted',
      p_action_category: 'media',
      p_metadata: {
        uploadId,
        filename: upload.filename,
        bytesUploaded: upload.bytes_uploaded,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Upload aborted",
    });

  } catch (error) {
    console.error("Abort upload error:", error);
    return NextResponse.json(
      { error: "Failed to abort upload" },
      { status: 500 }
    );
  }
}
