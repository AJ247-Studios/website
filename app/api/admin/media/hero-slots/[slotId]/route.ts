/**
 * Admin Media API - Single Hero Slot operations
 * PATCH /api/admin/media/hero-slots/[slotId] - Update hero slot
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || req.cookies.get('sb-access-token')?.value;
  
  if (!token) return null;
  
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') return null;
  
  return user;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const user = await verifyAdmin(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { slotId } = await params;
    const updates = await req.json();
    
    // Only allow specific fields to be updated
    const allowedFields = [
      'image_id', 'mobile_image_id', 'alt_text_override',
      'aspect_ratio', 'object_fit', 'hide_on_mobile', 'is_active', 'sort_order'
    ];
    
    const filteredUpdates: Record<string, unknown> = {
      updated_by: user.id,
    };
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    }
    
    // Get current slot for logging
    const { data: currentSlot } = await supabaseAdmin
      .from('hero_slots')
      .select('*')
      .eq('id', slotId)
      .single();
    
    if (!currentSlot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }
    
    // Update the slot
    const { data: slot, error } = await supabaseAdmin
      .from('hero_slots')
      .update(filteredUpdates)
      .eq('id', slotId)
      .select(`
        *,
        image:site_images!hero_slots_image_id_fkey(*),
        mobile_image:site_images!hero_slots_mobile_image_id_fkey(*)
      `)
      .single();
    
    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update slot' }, { status: 500 });
    }
    
    // Log the edit (fire and forget - don't await)
    supabaseAdmin.rpc('log_image_edit', {
      p_entity_type: 'hero_slots',
      p_entity_id: slotId,
      p_action: 'update',
      p_field_changed: Object.keys(updates).join(','),
      p_old_value: { image_id: currentSlot.image_id },
      p_new_value: filteredUpdates,
    });
    
    return NextResponse.json(slot);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const user = await verifyAdmin(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { slotId } = await params;
    
    // Delete the slot
    const { error } = await supabaseAdmin
      .from('hero_slots')
      .delete()
      .eq('id', slotId);
    
    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete slot' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
