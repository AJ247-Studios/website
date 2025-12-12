import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/utils/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { headObject, isPublicPath, getPublicUrl } from "@/lib/r2";

/**
 * POST /api/upload/complete
 * 
 * Called after client successfully uploads a file to R2 via presigned URL.
 * Verifies the upload and creates the storage_objects record.
 * 
 * Flow:
 * 1. Client completes upload to R2
 * 2. Client calls this endpoint with token
 * 3. Server verifies file exists in R2 (HEAD request)
 * 4. Server validates size/type matches expectations
 * 5. Server creates storage_objects record
 * 6. Server marks upload_token as used
 */

interface UploadCompleteBody {
  token: string;
  checksum?: string;  // Optional client-provided checksum
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClientServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: UploadCompleteBody = await request.json();
    const { token, checksum } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Missing required field: token" },
        { status: 400 }
      );
    }

    // Find and validate upload token
    const { data: uploadToken, error: tokenError } = await supabaseAdmin
      .from("upload_tokens")
      .select("*")
      .eq("token", token)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .single();

    if (tokenError || !uploadToken) {
      return NextResponse.json(
        { error: "Invalid or expired upload token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date(uploadToken.expires_at) < new Date()) {
      // Mark as expired
      await supabaseAdmin
        .from("upload_tokens")
        .update({ status: "expired" })
        .eq("id", uploadToken.id);

      return NextResponse.json(
        { error: "Upload token has expired" },
        { status: 400 }
      );
    }

    // Verify file exists in R2
    const fileMetadata = await headObject(uploadToken.r2_path);
    
    if (!fileMetadata) {
      return NextResponse.json(
        { error: "File not found in storage. Upload may have failed." },
        { status: 404 }
      );
    }

    // Validate file size
    if (fileMetadata.contentLength > uploadToken.max_size_bytes) {
      return NextResponse.json(
        { error: "Uploaded file exceeds maximum allowed size" },
        { status: 400 }
      );
    }

    // Determine file type and access level from path
    const r2Path = uploadToken.r2_path;
    let fileType: string = 'other';
    let accessLevel: string = 'private';
    let isPublic = false;

    if (r2Path.startsWith('public/')) {
      isPublic = true;
      accessLevel = 'public';
      if (r2Path.includes('/portfolio/')) {
        fileType = 'deliverable';
      } else {
        fileType = 'asset';
      }
    } else if (r2Path.includes('/deliverables/')) {
      fileType = 'deliverable';
      accessLevel = 'client';
    } else if (r2Path.includes('/raw/')) {
      fileType = 'raw';
      accessLevel = 'team';
    } else if (r2Path.startsWith('profiles/') && r2Path.includes('avatar')) {
      fileType = 'avatar';
      accessLevel = 'public';
      isPublic = true;
    } else if (r2Path.startsWith('team/')) {
      fileType = 'other';
      accessLevel = 'team';
    } else if (r2Path.startsWith('transcodes/')) {
      fileType = 'transcode';
      accessLevel = 'client';
    }

    // Extract filename from path
    const filename = r2Path.split('/').pop() || 'unknown';

    // Get project info from token if available
    let clientId: string | null = null;
    
    if (uploadToken.project_id) {
      const { data: project } = await supabaseAdmin
        .from("projects")
        .select("client_id")
        .eq("id", uploadToken.project_id)
        .single();
      
      clientId = project?.client_id || null;
    }

    // Create storage_objects record
    const { data: storageObject, error: insertError } = await supabaseAdmin
      .from("storage_objects")
      .insert({
        project_id: uploadToken.project_id,
        client_id: clientId,
        uploaded_by: user.id,
        r2_path: r2Path,
        r2_bucket: process.env.R2_BUCKET!,
        filename,
        mime_type: fileMetadata.contentType || uploadToken.allowed_mimes?.[0],
        size_bytes: fileMetadata.contentLength,
        checksum: checksum || fileMetadata.etag?.replace(/"/g, ''),
        is_public: isPublic,
        access_level: accessLevel,
        file_type: fileType,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create storage_objects record:", insertError);
      return NextResponse.json(
        { error: "Failed to save file metadata" },
        { status: 500 }
      );
    }

    // Mark upload token as used
    await supabaseAdmin
      .from("upload_tokens")
      .update({ 
        status: "used",
        used_at: new Date().toISOString()
      })
      .eq("id", uploadToken.id);

    // Log activity (non-critical, fire and forget)
    void supabaseAdmin.rpc('log_activity', {
      p_user_id: user.id,
      p_action: 'upload',
      p_entity_type: 'storage_object',
      p_entity_id: storageObject.id,
      p_metadata: {
        filename,
        size: fileMetadata.contentLength,
        mime_type: fileMetadata.contentType,
        project_id: uploadToken.project_id,
      }
    });

    // Build response
    const response: {
      id: string;
      filename: string;
      size: number;
      mimeType: string | undefined;
      isPublic: boolean;
      url?: string;
    } = {
      id: storageObject.id,
      filename,
      size: fileMetadata.contentLength,
      mimeType: fileMetadata.contentType,
      isPublic,
    };

    // Include public URL for public files
    if (isPublic && isPublicPath(r2Path)) {
      response.url = getPublicUrl(r2Path);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error("Upload complete error:", error);
    return NextResponse.json(
      { error: "Failed to complete upload" },
      { status: 500 }
    );
  }
}
