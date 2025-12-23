import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

type RouteParams = { params: Promise<{ projectId: string }> };

/**
 * GET /api/projects/[projectId]/assets - List media assets with faceted filtering
 * 
 * Query params:
 * - asset_types: comma-separated asset types (raw,wip,deliverable)
 * - statuses: comma-separated statuses (uploaded,processing,ready,failed)
 * - tags: comma-separated tags
 * - uploaders: comma-separated uploader IDs
 * - search: search term for filename/title
 * - date_from: ISO date string
 * - date_to: ISO date string
 * - sort: newest|oldest|largest|smallest|name_asc|name_desc
 * - limit: number (default 48)
 * - offset: number (default 0)
 * 
 * Returns:
 * - assets: MediaAsset[]
 * - counts: facet counts for filters
 * - pagination info
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(req.url);
    
    // Parse filter params
    const assetTypes = searchParams.get('asset_types')?.split(',').filter(Boolean) || [];
    const statuses = searchParams.get('statuses')?.split(',').filter(Boolean) || [];
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const uploaders = searchParams.get('uploaders')?.split(',').filter(Boolean) || [];
    const search = searchParams.get('search') || '';
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const sort = searchParams.get('sort') || 'newest';
    const limit = Math.min(parseInt(searchParams.get('limit') || '48'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Auth check
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authData.user.id;

    // Check access
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, display_name')
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

    // First, get ALL assets for this project to calculate facet counts
    // Include thumbnail_path and thumbnail_status for safe status fallback
    const { data: allAssets, error: allAssetsError } = await supabase
      .from('media_assets')
      .select('id, asset_type, status, thumbnail_status, thumbnail_path, tags, uploaded_by')
      .eq('project_id', projectId);

    if (allAssetsError) {
      return NextResponse.json({ error: allAssetsError.message }, { status: 500 });
    }

    // Safe status helper - handles missing status column gracefully
    const getSafeStatus = (asset: any): string => {
      if (asset?.status) return asset.status;
      if (asset?.thumbnail_status) return asset.thumbnail_status;
      if (asset?.thumbnail_path) return 'ready';
      return 'uploaded';
    };

    // Calculate facet counts from all assets
    const counts = {
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byTag: {} as Record<string, number>,
      byUploader: {} as Record<string, number>,
      total: allAssets?.length || 0,
      filtered: 0,
    };

    (allAssets || []).forEach(asset => {
      // Count by type
      counts.byType[asset.asset_type] = (counts.byType[asset.asset_type] || 0) + 1;
      
      // Count by status (using safe accessor)
      const status = getSafeStatus(asset);
      counts.byStatus[status] = (counts.byStatus[status] || 0) + 1;
      
      // Count by tags
      if (asset.tags && Array.isArray(asset.tags)) {
        asset.tags.forEach((tag: string) => {
          counts.byTag[tag] = (counts.byTag[tag] || 0) + 1;
        });
      }
      
      // Count by uploader
      if (asset.uploaded_by) {
        counts.byUploader[asset.uploaded_by] = (counts.byUploader[asset.uploaded_by] || 0) + 1;
      }
    });

    // Build filtered query
    let query = supabase
      .from('media_assets')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId);

    // Apply filters
    if (assetTypes.length > 0) {
      query = query.in('asset_type', assetTypes);
    }

    if (statuses.length > 0) {
      query = query.in('status', statuses);
    }

    if (uploaders.length > 0) {
      query = query.in('uploaded_by', uploaders);
    }

    if (search) {
      // Search in filename or title
      query = query.or(`filename.ilike.%${search}%,title.ilike.%${search}%`);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      // Add a day to include the full end date
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }

    // Tags filter - need to use contains for array column
    if (tags.length > 0) {
      // For each tag, filter assets that contain it
      query = query.contains('tags', tags);
    }

    // Apply sorting
    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'largest':
        query = query.order('file_size', { ascending: false, nullsFirst: false });
        break;
      case 'smallest':
        query = query.order('file_size', { ascending: true, nullsFirst: false });
        break;
      case 'name_asc':
        query = query.order('filename', { ascending: true });
        break;
      case 'name_desc':
        query = query.order('filename', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: assets, count, error: assetsError } = await query;

    if (assetsError) {
      return NextResponse.json({ error: assetsError.message }, { status: 500 });
    }

    // Update filtered count
    counts.filtered = count || 0;

    // Get uploader names for the response
    const uploaderIds = [...new Set((assets || []).map(a => a.uploaded_by).filter(Boolean))];
    let uploaderNames: Record<string, string> = {};
    
    if (uploaderIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, display_name, email')
        .in('id', uploaderIds);

      if (profiles) {
        uploaderNames = profiles.reduce((acc, p) => {
          acc[p.id] = p.display_name || p.email?.split('@')[0] || 'Unknown';
          return acc;
        }, {} as Record<string, string>);
      }
    }

    return NextResponse.json({
      assets: assets || [],
      counts,
      uploaderNames,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (err: unknown) {
    console.error('Assets API error:', err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/projects/[projectId]/assets - Bulk update assets
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    
    const { assetIds, updates } = body as {
      assetIds: string[];
      updates: {
        asset_type?: string;
        status?: string;
        tags?: string[];
        title?: string;
        caption?: string;
      };
    };

    if (!assetIds || assetIds.length === 0) {
      return NextResponse.json({ error: 'No asset IDs provided' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Auth check
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role - only admin/team can update
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (!profile || !['admin', 'team'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update assets
    const { data: updatedAssets, error: updateError } = await supabase
      .from('media_assets')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('project_id', projectId)
      .in('id', assetIds)
      .select();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      updated: updatedAssets?.length || 0,
      assets: updatedAssets,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[projectId]/assets - Bulk delete assets
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(req.url);
    const assetIds = searchParams.get('ids')?.split(',').filter(Boolean) || [];

    if (assetIds.length === 0) {
      return NextResponse.json({ error: 'No asset IDs provided' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Auth check
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role - only admin can delete
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - admin only' }, { status: 403 });
    }

    // Get storage paths before deletion
    const { data: assetsToDelete } = await supabase
      .from('media_assets')
      .select('id, storage_path, thumbnail_path')
      .eq('project_id', projectId)
      .in('id', assetIds);

    if (!assetsToDelete || assetsToDelete.length === 0) {
      return NextResponse.json({ error: 'No assets found' }, { status: 404 });
    }

    // Delete from storage
    const pathsToDelete = assetsToDelete.flatMap(a => 
      [a.storage_path, a.thumbnail_path].filter(Boolean)
    );

    if (pathsToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove(pathsToDelete);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with DB deletion anyway
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('media_assets')
      .delete()
      .eq('project_id', projectId)
      .in('id', assetIds);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      deleted: assetsToDelete.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
