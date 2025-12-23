/**
 * Client Deliverable Request Change API Endpoint
 * POST /api/client/deliverables/[id]/request-change
 * 
 * Allows clients to request changes/revisions to a deliverable.
 * Requires a reason/comment. Creates notification and updates status.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyDeliverableAccess } from '@/utils/getClientPreviewUrl';

export const runtime = 'nodejs';

interface RequestChangeBody {
  reason: string;
  timecode?: number;  // Optional video timestamp
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deliverableId } = await params;
    
    // Parse request body
    let body: RequestChangeBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const { reason, timecode } = body;
    
    // Validate reason
    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a reason for the change request' },
        { status: 400 }
      );
    }
    
    if (reason.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a more detailed reason (at least 10 characters)' },
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
        { error: 'Access denied - you do not have access to this deliverable' },
        { status: 403 }
      );
    }
    
    // Get current deliverable
    const { data: deliverable, error: fetchError } = await supabaseAdmin
      .from('deliverables')
      .select('id, title, status, project_id')
      .eq('id', deliverableId)
      .single();
    
    if (fetchError || !deliverable) {
      return NextResponse.json(
        { error: 'Deliverable not found' },
        { status: 404 }
      );
    }
    
    // Check if deliverable can have changes requested
    if (deliverable.status !== 'delivered' && deliverable.status !== 'approved') {
      return NextResponse.json(
        { error: 'Changes can only be requested on delivered or approved items. Current status: ' + deliverable.status },
        { status: 400 }
      );
    }
    
    // Update deliverable status
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('deliverables')
      .update({
        status: 'revision_requested',
        revision_requested_at: new Date().toISOString(),
        revision_requested_by: user.id,
        revision_reason: reason.trim(),
      })
      .eq('id', deliverableId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating deliverable:', updateError);
      return NextResponse.json(
        { error: 'Failed to request changes' },
        { status: 500 }
      );
    }
    
    // Create a comment with the revision reason
    const { data: comment, error: commentError } = await supabaseAdmin
      .from('comments')
      .insert({
        deliverable_id: deliverableId,
        user_id: user.id,
        body: reason.trim(),
        timecode: timecode,
        metadata: {
          type: 'revision_request',
        },
      })
      .select()
      .single();
    
    if (commentError) {
      console.error('Error creating comment:', commentError);
      // Non-fatal - continue without comment
    }
    
    // Log activity
    await supabaseAdmin.from('activity_log').insert({
      user_id: user.id,
      action: 'deliverable_revision_requested',
      entity_type: 'deliverable',
      entity_id: deliverableId,
      metadata: {
        project_id: deliverable.project_id,
        deliverable_title: deliverable.title,
        reason: reason.trim(),
        timecode,
      },
    });
    
    // Get user profile for notification
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();
    
    // Notify team members
    const { data: teamMembers } = await supabaseAdmin
      .from('project_team')
      .select('user_id')
      .eq('project_id', deliverable.project_id);
    
    // Also notify admins
    const { data: admins } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'admin');
    
    const notifyUsers = new Set([
      ...(teamMembers || []).map(t => t.user_id),
      ...(admins || []).map(a => a.id),
    ]);
    
    // Remove current user from notifications
    notifyUsers.delete(user.id);
    
    // Create notifications
    const notifications = Array.from(notifyUsers).map(userId => ({
      user_id: userId,
      type: 'deliverable_revision_requested' as const,
      title: `${profile?.display_name || 'Client'} requested changes: ${deliverable.title}`,
      body: reason.trim().slice(0, 200) + (reason.length > 200 ? '...' : ''),
      entity_type: 'deliverable',
      entity_id: deliverableId,
      payload: {
        project_id: deliverable.project_id,
        requested_by: user.id,
        requested_by_name: profile?.display_name,
        reason: reason.trim(),
        timecode,
      },
    }));
    
    if (notifications.length > 0) {
      await supabaseAdmin.from('notifications').insert(notifications);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Change request submitted successfully',
      deliverable: {
        id: updated.id,
        status: updated.status,
        revision_requested_at: updated.revision_requested_at,
        revision_reason: updated.revision_reason,
      },
      comment: comment ? {
        id: comment.id,
        body: comment.body,
        timecode: comment.timecode,
      } : null,
    });
  } catch (error: any) {
    console.error('Request change error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
