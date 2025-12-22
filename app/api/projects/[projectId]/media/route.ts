import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildStoragePath, STORAGE_BUCKET } from '@/lib/supabase-storage';

export const runtime = 'nodejs';

type RouteParams = { params: Promise<{ projectId: string }> };

/**
 * GET /api/projects/[projectId]/media - List media assets for a project
 * POST /api/projects/[projectId]/media - Upload a new media asset
 * 
 * RLS ensures only project members can access.
 */

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(req.url);
    
    const assetType = searchParams.get('asset_type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
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
        .select('id, role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      if (!membership) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Build query
    let query = supabase
      .from('media_assets')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (assetType) {
      query = query.eq('asset_type', assetType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: assets, count, error: assetsError } = await query;

    if (assetsError) {
      return NextResponse.json({ error: assetsError.message }, { status: 500 });
    }

    return NextResponse.json({
      assets: assets || [],
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    
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

    // Check role - only admin/team can upload
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile || !['admin', 'team'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden - team/admin only' }, { status: 403 });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const assetType = (formData.get('asset_type') as string) || 'raw';
    const title = formData.get('title') as string | null;
    const caption = formData.get('caption') as string | null;
    const tagsRaw = formData.get('tags') as string | null;
    const tags = tagsRaw ? JSON.parse(tagsRaw) : null;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Build storage path
    const storagePath = buildStoragePath({
      assetType: assetType as 'raw' | 'deliverable' | 'wip',
      projectId,
      filename: file.name,
    });

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Save metadata to media_assets table
    const { data: asset, error: dbError } = await supabase
      .from('media_assets')
      .insert({
        project_id: projectId,
        uploaded_by: userId,
        storage_path: uploadData.path,
        filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        asset_type: assetType,
        status: 'uploaded',
        title,
        caption,
        tags,
      })
      .select()
      .single();

    if (dbError) {
      // Cleanup uploaded file
      await supabase.storage.from(STORAGE_BUCKET).remove([uploadData.path]);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Create signed URL for immediate use
    const { data: signedData } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(uploadData.path, 3600);

    return NextResponse.json({
      asset,
      signed_url: signedData?.signedUrl,
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
