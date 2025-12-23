import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { STORAGE_BUCKET } from "@/lib/supabase-storage";
import { 
  buildThumbnailPath, 
  canGenerateThumbnail, 
  isThumbnailPath,
  THUMBNAIL_SIZES,
  type ThumbnailSize 
} from "@/lib/thumbnails";
import sharp from "sharp";

/**
 * POST /api/thumbnails/generate
 * 
 * Generates a thumbnail for a media asset.
 * Called after upload completes (can be triggered by webhook or direct call).
 * 
 * Body: { mediaId: string, size?: 'small' | 'medium' | 'large' }
 * 
 * Uses service role to bypass RLS for admin operations.
 */

interface GenerateRequest {
  mediaId: string;
  size?: ThumbnailSize;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { mediaId, size = 'medium' } = body;

    if (!mediaId) {
      return NextResponse.json(
        { error: "Missing required field: mediaId" },
        { status: 400 }
      );
    }

    // Fetch the media asset record
    const { data: asset, error: fetchError } = await supabaseAdmin
      .from('media_assets')
      .select('id, storage_path, mime_type, thumbnail_path, thumbnail_status')
      .eq('id', mediaId)
      .single();

    if (fetchError || !asset) {
      return NextResponse.json(
        { error: "Media asset not found" },
        { status: 404 }
      );
    }

    // Skip if already has thumbnail
    if (asset.thumbnail_path && asset.thumbnail_status === 'ready') {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: "Thumbnail already exists",
        thumbnailPath: asset.thumbnail_path,
      });
    }

    // Skip if not an image
    if (!canGenerateThumbnail(asset.mime_type)) {
      await supabaseAdmin
        .from('media_assets')
        .update({ thumbnail_status: 'skipped' })
        .eq('id', mediaId);

      return NextResponse.json({
        success: true,
        skipped: true,
        message: "File type does not support thumbnails",
      });
    }

    // Skip if this IS a thumbnail (prevent loops)
    if (isThumbnailPath(asset.storage_path)) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: "Cannot generate thumbnail of a thumbnail",
      });
    }

    // Mark as processing
    await supabaseAdmin
      .from('media_assets')
      .update({ thumbnail_status: 'processing' })
      .eq('id', mediaId);

    // Download the original file
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(asset.storage_path);

    if (downloadError || !fileData) {
      await supabaseAdmin
        .from('media_assets')
        .update({ thumbnail_status: 'failed' })
        .eq('id', mediaId);

      return NextResponse.json(
        { error: "Failed to download original file" },
        { status: 500 }
      );
    }

    // Convert to buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate thumbnail with sharp
    const { width, height } = THUMBNAIL_SIZES[size];
    let thumbnailBuffer: Buffer;

    try {
      thumbnailBuffer = await sharp(buffer)
        .resize(width, height, { 
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ 
          quality: 80,
          progressive: true,
        })
        .toBuffer();
    } catch (sharpError) {
      console.error('Sharp processing error:', sharpError);
      
      await supabaseAdmin
        .from('media_assets')
        .update({ thumbnail_status: 'failed' })
        .eq('id', mediaId);

      return NextResponse.json(
        { error: "Failed to process image" },
        { status: 500 }
      );
    }

    // Build thumbnail path and upload
    const thumbnailPath = buildThumbnailPath(mediaId, size);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
        cacheControl: '31536000', // 1 year cache
      });

    if (uploadError) {
      console.error('Thumbnail upload error:', uploadError);
      
      await supabaseAdmin
        .from('media_assets')
        .update({ thumbnail_status: 'failed' })
        .eq('id', mediaId);

      return NextResponse.json(
        { error: "Failed to upload thumbnail" },
        { status: 500 }
      );
    }

    // Update the media asset record
    const { error: updateError } = await supabaseAdmin
      .from('media_assets')
      .update({ 
        thumbnail_path: thumbnailPath,
        thumbnail_status: 'ready',
      })
      .eq('id', mediaId);

    if (updateError) {
      console.error('DB update error:', updateError);
      // Thumbnail exists but DB not updated - still return success
    }

    return NextResponse.json({
      success: true,
      thumbnailPath,
      size: { width, height },
    });

  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
