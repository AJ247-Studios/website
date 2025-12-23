/**
 * Client Deliverable Approve API Endpoint
 * POST /api/client/deliverables/[id]/approve
 * 
 * Allows clients to approve a deliverable.
 * Creates a notification record and updates status.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyDeliverableAccess } from '@/utils/getClientPreviewUrl';

export const runtime = 'nodejs';

export async function POST(
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
    
    // Check if deliverable can be approved
    if (deliverable.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Only delivered items can be approved. Current status: ' + deliverable.status },
        { status: 400 }
      );
    }
    
    // Update deliverable status
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('deliverables')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      })
      .eq('id', deliverableId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating deliverable:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve deliverable' },
        { status: 500 }
      );
    }
    
    // Log activity
    await supabaseAdmin.from('activity_log').insert({
      user_id: user.id,
      action: 'deliverable_approved',
      entity_type: 'deliverable',
      entity_id: deliverableId,
      metadata: {
        project_id: deliverable.project_id,
        deliverable_title: deliverable.title,
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
      type: 'deliverable_approved' as const,
      title: `${profile?.display_name || 'Client'} approved: ${deliverable.title}`,
      body: `The deliverable "${deliverable.title}" has been approved.`,
      entity_type: 'deliverable',
      entity_id: deliverableId,
      payload: {
        project_id: deliverable.project_id,
        approved_by: user.id,
        approved_by_name: profile?.display_name,
      },
    }));
    
    if (notifications.length > 0) {
      await supabaseAdmin.from('notifications').insert(notifications);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Deliverable approved successfully',
      deliverable: {
        id: updated.id,
        status: updated.status,
        approved_at: updated.approved_at,
      },
    });
  } catch (error: any) {
    console.error('Approve deliverable error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
