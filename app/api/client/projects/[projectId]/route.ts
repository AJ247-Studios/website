/**
 * Client Project API Endpoint
 * GET /api/client/projects/[projectId]
 * 
 * Returns project details with deliverables, assets, and activity for clients.
 * Enforces RLS - clients can only see their own projects.
 * All asset URLs are signed server-side.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { 
  batchGetAssetUrls, 
  verifyProjectAccess,
  URL_EXPIRY 
} from '@/utils/getClientPreviewUrl';

export const runtime = 'nodejs';

// Client-facing status labels
const STATUS_LABELS: Record<string, string> = {
  pending: 'In Progress',
  delivered: 'Needs Review',
  approved: 'Approved',
  revision_requested: 'Changes Requested',
  archived: 'Archived',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    
    // Get auth token from header or cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    // Also check cookie-based auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    });
    
    // Get current user from cookie/token
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }
    
    // Verify project access
    const hasAccess = await verifyProjectAccess(user.id, projectId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied - you do not have access to this project' },
        { status: 403 }
      );
    }
    
    // Fetch project details
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select(`
        id,
        title,
        description,
        status,
        project_type,
        shoot_date,
        deadline,
        created_at,
        updated_at,
        client:clients(
          id,
          name,
          company_name
        )
      `)
      .eq('id', projectId)
      .single();
    
    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Fetch deliverables with their assets
    const { data: deliverables, error: delivError } = await supabaseAdmin
      .from('deliverables')
      .select(`
        id,
        title,
        description,
        due_date,
        status,
        approved_at,
        revision_requested_at,
        revision_reason,
        delivered_at,
        sort_order,
        created_at,
        updated_at,
        deliverable_assets(
          id,
          sort_order,
          custom_title,
          media_asset:media_assets(
            id,
            title,
            caption,
            thumbnail_path,
            storage_object:storage_objects(
              id,
              r2_path,
              filename,
              mime_type,
              size_bytes,
              file_type
            ),
            width,
            height,
            duration_seconds,
            status
          )
        )
      `)
      .eq('project_id', projectId)
      .neq('status', 'archived')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (delivError) {
      console.error('Error fetching deliverables:', delivError);
      // Continue without deliverables if table doesn't exist yet
    }
    
    // Get all media assets that need signed URLs
    const allAssets: Array<{
      id: string;
      storage_path?: string;
      thumbnail_path?: string;
      r2_path?: string;
    }> = [];
    
    (deliverables || []).forEach(d => {
      (d.deliverable_assets || []).forEach((da: any) => {
        if (da.media_asset) {
          const asset = da.media_asset;
          allAssets.push({
            id: asset.id,
            thumbnail_path: asset.thumbnail_path,
            r2_path: asset.storage_object?.r2_path,
          });
        }
      });
    });
    
    // Batch generate signed URLs
    const assetUrls = await batchGetAssetUrls(allAssets);
    
    // Transform deliverables with signed URLs and client-facing status
    const transformedDeliverables = (deliverables || []).map(d => ({
      id: d.id,
      title: d.title,
      description: d.description,
      due_date: d.due_date,
      status: d.status,
      status_label: STATUS_LABELS[d.status] || d.status,
      approved_at: d.approved_at,
      revision_requested_at: d.revision_requested_at,
      revision_reason: d.revision_reason,
      delivered_at: d.delivered_at,
      created_at: d.created_at,
      updated_at: d.updated_at,
      assets: (d.deliverable_assets || []).map((da: any) => {
        const asset = da.media_asset;
        if (!asset) return null;
        
        const urls = assetUrls.get(asset.id) || {};
        const storageObj = asset.storage_object;
        
        return {
          id: asset.id,
          title: da.custom_title || asset.title || storageObj?.filename,
          caption: asset.caption,
          file_type: getFileType(storageObj?.mime_type || ''),
          mime_type: storageObj?.mime_type,
          file_size: storageObj?.size_bytes,
          width: asset.width,
          height: asset.height,
          duration: asset.duration_seconds,
          thumbnail_url: urls.thumbnail?.signedUrl,
          preview_url: urls.preview?.signedUrl,
          download_url: urls.download?.signedUrl,
        };
      }).filter(Boolean),
    }));
    
    // Fetch comments for all deliverables
    const deliverableIds = (deliverables || []).map(d => d.id);
    let comments: any[] = [];
    
    if (deliverableIds.length > 0) {
      const { data: commentsData } = await supabaseAdmin
        .from('comments')
        .select(`
          id,
          deliverable_id,
          media_asset_id,
          body,
          timecode,
          x_position,
          y_position,
          resolved,
          created_at,
          user:profiles!user_id(
            id,
            display_name,
            avatar_path,
            role
          )
        `)
        .in('deliverable_id', deliverableIds)
        .order('created_at', { ascending: true });
      
      comments = commentsData || [];
    }
    
    // Fetch recent activity
    const { data: activity } = await supabaseAdmin
      .from('activity_log')
      .select(`
        id,
        action,
        entity_type,
        entity_id,
        metadata,
        created_at,
        user:profiles!user_id(
          id,
          display_name,
          avatar_path,
          role
        )
      `)
      .or(`entity_id.eq.${projectId},metadata->project_id.eq.${projectId}`)
      .order('created_at', { ascending: false })
      .limit(20);
    
    // Compute summary stats
    const stats = {
      total_deliverables: (deliverables || []).length,
      pending_review: (deliverables || []).filter(d => d.status === 'delivered').length,
      approved: (deliverables || []).filter(d => d.status === 'approved').length,
      in_progress: (deliverables || []).filter(d => d.status === 'pending').length,
      revision_requested: (deliverables || []).filter(d => d.status === 'revision_requested').length,
      last_update: (deliverables || []).length > 0 
        ? (deliverables || []).reduce((latest, d) => 
            new Date(d.updated_at) > new Date(latest) ? d.updated_at : latest, 
            (deliverables || [])[0].updated_at
          )
        : project.updated_at,
    };
    
    // Compute overall project health status
    let project_health: 'on_track' | 'action_required' | 'delivered' = 'on_track';
    if (stats.pending_review > 0 || stats.revision_requested > 0) {
      project_health = 'action_required';
    } else if (stats.total_deliverables > 0 && stats.approved === stats.total_deliverables) {
      project_health = 'delivered';
    }
    
    return NextResponse.json({
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        project_type: project.project_type,
        shoot_date: project.shoot_date,
        deadline: project.deadline,
        client: project.client,
        project_health,
      },
      stats,
      deliverables: transformedDeliverables,
      comments: comments.map(c => {
        const author = Array.isArray(c.user) ? c.user[0] : c.user;
        return {
          id: c.id,
          deliverable_id: c.deliverable_id,
          media_asset_id: c.media_asset_id,
          body: c.body,
          timecode: c.timecode,
          x_position: c.x_position,
          y_position: c.y_position,
          resolved: c.resolved,
          created_at: c.created_at,
          author: {
            id: author?.id,
            name: author?.display_name || 'Unknown',
            avatar: author?.avatar_path,
            is_team: author?.role === 'admin' || author?.role === 'team',
          },
        };
      }),
      activity: (activity || []).map(a => {
        const actor = Array.isArray(a.user) ? a.user[0] : a.user;
        return {
          id: a.id,
          action: a.action,
          entity_type: a.entity_type,
          entity_id: a.entity_id,
          metadata: a.metadata,
          created_at: a.created_at,
          actor: {
            id: actor?.id,
            name: actor?.display_name || 'System',
            avatar: actor?.avatar_path,
            is_team: actor?.role === 'admin' || actor?.role === 'team',
          },
        };
      }),
    });
  } catch (error: any) {
    console.error('Client project API error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

function getFileType(mimeType: string): 'image' | 'video' | 'document' | 'archive' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return 'archive';
  return 'document';
}
