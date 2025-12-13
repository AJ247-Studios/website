import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/utils/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * PATCH /api/uploads/chunk
 * 
 * Update progress after each chunk upload.
 * Called by client after successful XHR upload to presigned URL.
 */

interface ChunkUpdateBody {
  uploadId: string;
  partNumber: number;
  etag: string;
  bytesUploaded: number;
}

export async function PATCH(request: NextRequest) {
  try {
    // Authenticate
    const supabase = await createClientServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse body
    const body: ChunkUpdateBody = await request.json();
    const { uploadId, partNumber, etag, bytesUploaded } = body;

    if (!uploadId || !partNumber || !etag) {
      return NextResponse.json(
        { error: "Missing uploadId, partNumber, or etag" },
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

    if (upload.status !== 'in_progress') {
      return NextResponse.json(
        { error: `Upload is ${upload.status}, cannot update` },
        { status: 400 }
      );
    }

    // Update uploaded parts
    const existingParts = (upload.uploaded_parts || []) as { partNumber: number; etag: string }[];
    
    // Check if part already uploaded (idempotent)
    const existingPartIndex = existingParts.findIndex(p => p.partNumber === partNumber);
    if (existingPartIndex >= 0) {
      // Already uploaded, return success
      return NextResponse.json({
        success: true,
        uploadId,
        partNumber,
        chunksUploaded: upload.chunks_uploaded,
        bytesUploaded: upload.bytes_uploaded,
        progress: Math.round((upload.chunks_uploaded / upload.total_chunks) * 100),
      });
    }

    // Add new part
    const updatedParts = [...existingParts, { partNumber, etag }];
    const newChunksUploaded = upload.chunks_uploaded + 1;
    const newBytesUploaded = upload.bytes_uploaded + (bytesUploaded || upload.chunk_size);

    // Update record
    const { error: updateError } = await supabaseAdmin
      .from("chunked_uploads")
      .update({
        uploaded_parts: updatedParts,
        chunks_uploaded: newChunksUploaded,
        bytes_uploaded: Math.min(newBytesUploaded, upload.total_size),
        last_activity: new Date().toISOString(),
      })
      .eq("id", uploadId);

    if (updateError) {
      console.error("Failed to update upload progress:", updateError);
      return NextResponse.json(
        { error: "Failed to update progress" },
        { status: 500 }
      );
    }

    const progress = Math.round((newChunksUploaded / upload.total_chunks) * 100);

    return NextResponse.json({
      success: true,
      uploadId,
      partNumber,
      chunksUploaded: newChunksUploaded,
      bytesUploaded: Math.min(newBytesUploaded, upload.total_size),
      totalChunks: upload.total_chunks,
      totalSize: upload.total_size,
      progress,
      isComplete: newChunksUploaded === upload.total_chunks,
    });

  } catch (error) {
    console.error("Chunk update error:", error);
    return NextResponse.json(
      { error: "Failed to update chunk progress" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/uploads/chunk?uploadId=xxx
 * 
 * Get list of uploaded parts (for resume scenarios)
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
      .select("id, total_chunks, chunk_size, chunks_uploaded, bytes_uploaded, total_size, uploaded_parts, status")
      .eq("id", uploadId)
      .eq("user_id", user.id)
      .single();

    if (error || !upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    const uploadedParts = (upload.uploaded_parts || []) as { partNumber: number; etag: string }[];
    
    return NextResponse.json({
      uploadId: upload.id,
      status: upload.status,
      totalChunks: upload.total_chunks,
      chunkSize: upload.chunk_size,
      chunksUploaded: upload.chunks_uploaded,
      bytesUploaded: upload.bytes_uploaded,
      totalSize: upload.total_size,
      uploadedParts: uploadedParts.map(p => p.partNumber),
      progress: Math.round((upload.chunks_uploaded / upload.total_chunks) * 100),
    });

  } catch (error) {
    console.error("Get chunks error:", error);
    return NextResponse.json(
      { error: "Failed to get chunk info" },
      { status: 500 }
    );
  }
}
