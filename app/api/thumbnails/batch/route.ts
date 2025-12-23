import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { canGenerateThumbnail } from "@/lib/thumbnails";

/**
 * POST /api/thumbnails/batch
 * 
 * Triggers thumbnail generation for multiple media assets.
 * Useful for backfilling thumbnails for existing uploads.
 * 
 * Body: { mediaIds?: string[], limit?: number }
 * 
 * If mediaIds provided: generates for those specific assets
 * If no mediaIds: generates for assets with pending/null thumbnail_status
 */

interface BatchRequest {
  mediaIds?: string[];
  limit?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchRequest = await request.json();
    const { mediaIds, limit = 50 } = body;

    let assetsToProcess: { id: string; mime_type: string | null }[] = [];

    if (mediaIds && mediaIds.length > 0) {
      // Process specific assets
      const { data, error } = await supabaseAdmin
        .from('media_assets')
        .select('id, mime_type')
        .in('id', mediaIds);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      assetsToProcess = data || [];
    } else {
      // Find assets needing thumbnails
      const { data, error } = await supabaseAdmin
        .from('media_assets')
        .select('id, mime_type')
        .or('thumbnail_status.is.null,thumbnail_status.eq.pending,thumbnail_status.eq.failed')
        .limit(limit);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      assetsToProcess = data || [];
    }

    // Filter to only image types
    const imageAssets = assetsToProcess.filter(a => canGenerateThumbnail(a.mime_type));

    // Queue thumbnail generation for each (fire and forget)
    const baseUrl = request.nextUrl.origin;
    const results: { id: string; queued: boolean; reason?: string }[] = [];

    for (const asset of imageAssets) {
      try {
        // Call the generate endpoint for each
        const response = await fetch(`${baseUrl}/api/thumbnails/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaId: asset.id }),
        });

        const result = await response.json();
        results.push({
          id: asset.id,
          queued: response.ok,
          reason: result.error || result.message,
        });
      } catch (err) {
        results.push({
          id: asset.id,
          queued: false,
          reason: 'Request failed',
        });
      }
    }

    // Mark non-image assets as skipped
    const nonImageIds = assetsToProcess
      .filter(a => !canGenerateThumbnail(a.mime_type))
      .map(a => a.id);

    if (nonImageIds.length > 0) {
      await supabaseAdmin
        .from('media_assets')
        .update({ thumbnail_status: 'skipped' })
        .in('id', nonImageIds);
    }

    return NextResponse.json({
      processed: results.length,
      skipped: nonImageIds.length,
      results,
    });

  } catch (error) {
    console.error('Batch thumbnail error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/thumbnails/batch
 * 
 * Returns stats about thumbnail generation status
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('media_assets')
      .select('thumbnail_status');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const stats = {
      total: data.length,
      ready: data.filter(a => a.thumbnail_status === 'ready').length,
      pending: data.filter(a => a.thumbnail_status === 'pending' || !a.thumbnail_status).length,
      processing: data.filter(a => a.thumbnail_status === 'processing').length,
      failed: data.filter(a => a.thumbnail_status === 'failed').length,
      skipped: data.filter(a => a.thumbnail_status === 'skipped').length,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Batch stats error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
