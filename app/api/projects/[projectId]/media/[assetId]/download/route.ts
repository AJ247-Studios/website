import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { STORAGE_BUCKET } from '@/lib/supabase-storage';

export const runtime = 'nodejs';

type RouteParams = { params: Promise<{ projectId: string; assetId: string }> };

/**
 * GET /api/projects/[projectId]/media/[assetId]/download
 * 
 * Creates a signed download URL for a media asset.
 * RLS ensures only project members can access.
 * 
 * Query params:
 *   expires: Expiration time in seconds (default: 3600 = 1 hour)
 */

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { projectId, assetId } = await params;
    const { searchParams } = new URL(req.url);
    const expiresIn = parseInt(searchParams.get('expires') || '3600');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Auth via Authorization header
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authData.user.id;

    // Check access - admin or project member
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isAdmin = profile?.role === 'admin';

    if (!isAdmin) {
      const { data: membership } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      if (!membership) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Get the asset and verify it belongs to this project
    const { data: asset, error: assetError } = await supabase
      .from('media_assets')
      .select('id, storage_path, filename, project_id, download_count')
      .eq('id', assetId)
      .eq('project_id', projectId)
      .single();

    if (assetError || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Create signed URL
    const { data: signedData, error: signError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(asset.storage_path, expiresIn);

    if (signError || !signedData) {
      return NextResponse.json({ error: 'Failed to create download URL' }, { status: 500 });
    }

    // Increment download count
    await supabase
      .from('media_assets')
      .update({ 
        download_count: (asset.download_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assetId);

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return NextResponse.json({
      url: signedData.signedUrl,
      filename: asset.filename,
      expires_at: expiresAt.toISOString(),
      expires_in: expiresIn,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
