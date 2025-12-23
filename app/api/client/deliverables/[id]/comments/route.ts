/**
 * Client Deliverable Comments API Endpoint
 * GET/POST /api/client/deliverables/[id]/comments
 * 
 * GET: Fetch all comments for a deliverable
 * POST: Add a new comment (supports video timecodes)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyDeliverableAccess } from '@/utils/getClientPreviewUrl';

export const runtime = 'nodejs';

interface NewComment {
  body: string;
  timecode?: number;      // Video timestamp in seconds
  x_position?: number;    // Image annotation X (0-100)
  y_position?: number;    // Image annotation Y (0-100)
  media_asset_id?: string; // Optional: comment on specific asset
  parent_id?: string;     // Optional: reply to another comment
}

// GET: Fetch comments for a deliverable
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deliverableId } = await params;
    
    // Get auth token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }
    
    // Verify deliverable access
    const hasAccess = await verifyDeliverableAccess(user.id, deliverableId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Fetch comments
    const { data: comments, error } = await supabaseAdmin
      .from('comments')
      .select(`
        id,
        deliverable_id,
        media_asset_id,
        body,
        timecode,
        x_position,
        y_position,
        parent_id,
        resolved,
        resolved_at,
        created_at,
        updated_at,
        user:profiles!user_id(
          id,
          display_name,
          avatar_path,
          role
        )
      `)
      .eq('deliverable_id', deliverableId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }
    
    // Transform comments
    const transformed = (comments || []).map(c => ({
      id: c.id,
      deliverable_id: c.deliverable_id,
      media_asset_id: c.media_asset_id,
      body: c.body,
      timecode: c.timecode,
      x_position: c.x_position,
      y_position: c.y_position,
      parent_id: c.parent_id,
      resolved: c.resolved,
      resolved_at: c.resolved_at,
      created_at: c.created_at,
      updated_at: c.updated_at,
      author: {
        id: c.user?.id,
        name: c.user?.display_name || 'Unknown',
        avatar: c.user?.avatar_path,
        is_team: c.user?.role === 'admin' || c.user?.role === 'team',
      },
      is_own: c.user?.id === user.id,
    }));
    
    return NextResponse.json({
      comments: transformed,
      total: transformed.length,
    });
  } catch (error: any) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// POST: Add a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deliverableId } = await params;
    
    // Parse request body
    let body: NewComment;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Validate comment body
    if (!body.body || body.body.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment body is required' },
        { status: 400 }
      );
    }
    
    if (body.body.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Comment is too long (max 2000 characters)' },
        { status: 400 }
      );
    }
    
    // Get auth token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }
    
    // Verify deliverable access
    const hasAccess = await verifyDeliverableAccess(user.id, deliverableId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Verify deliverable exists
    const { data: deliverable } = await supabaseAdmin
      .from('deliverables')
      .select('id, title, project_id')
      .eq('id', deliverableId)
      .single();
    
    if (!deliverable) {
      return NextResponse.json(
        { error: 'Deliverable not found' },
        { status: 404 }
      );
    }
    
    // Create comment
    const { data: comment, error: insertError } = await supabaseAdmin
      .from('comments')
      .insert({
        deliverable_id: deliverableId,
        media_asset_id: body.media_asset_id || null,
        user_id: user.id,
        body: body.body.trim(),
        timecode: body.timecode,
        x_position: body.x_position,
        y_position: body.y_position,
        parent_id: body.parent_id || null,
      })
      .select(`
        id,
        deliverable_id,
        media_asset_id,
        body,
        timecode,
        x_position,
        y_position,
        parent_id,
        resolved,
        created_at
      `)
      .single();
    
    if (insertError) {
      console.error('Error creating comment:', insertError);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }
    
    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('display_name, avatar_path, role')
      .eq('id', user.id)
      .single();
    
    // Log activity
    await supabaseAdmin.from('activity_log').insert({
      user_id: user.id,
      action: 'comment_added',
      entity_type: 'comment',
      entity_id: comment.id,
      metadata: {
        project_id: deliverable.project_id,
        deliverable_id: deliverableId,
        deliverable_title: deliverable.title,
        comment_preview: body.body.trim().slice(0, 100),
        timecode: body.timecode,
      },
    });
    
    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        deliverable_id: comment.deliverable_id,
        media_asset_id: comment.media_asset_id,
        body: comment.body,
        timecode: comment.timecode,
        x_position: comment.x_position,
        y_position: comment.y_position,
        parent_id: comment.parent_id,
        resolved: comment.resolved,
        created_at: comment.created_at,
        author: {
          id: user.id,
          name: profile?.display_name || 'Unknown',
          avatar: profile?.avatar_path,
          is_team: profile?.role === 'admin' || profile?.role === 'team',
        },
        is_own: true,
      },
    });
  } catch (error: any) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
