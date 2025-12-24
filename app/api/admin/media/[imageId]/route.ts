/**
 * Admin Media API - Single image operations
 * PATCH /api/admin/media/[imageId] - Update image metadata
 * DELETE /api/admin/media/[imageId] - Delete image
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { deleteFromR2 } from "@/lib/r2";

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
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const user = await verifyAdmin(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { imageId } = await params;
    const updates = await req.json();
    
    // Only allow specific fields to be updated
    const allowedFields = ['focal_x', 'focal_y', 'alt_text', 'caption', 'tags', 'category'];
    const filteredUpdates: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    }
    
    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }
    
    // Get current image for logging
    const { data: currentImage } = await supabaseAdmin
      .from('site_images')
      .select('*')
      .eq('id', imageId)
      .single();
    
    if (!currentImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    
    // Update the image
    const { data: image, error } = await supabaseAdmin
      .from('site_images')
      .update(filteredUpdates)
      .eq('id', imageId)
      .select()
      .single();
    
    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update image' }, { status: 500 });
    }
    
    // Log the edit (fire and forget - don't await)
    supabaseAdmin.rpc('log_image_edit', {
      p_entity_type: 'site_images',
      p_entity_id: imageId,
      p_action: 'update',
      p_field_changed: Object.keys(filteredUpdates).join(','),
      p_old_value: currentImage,
      p_new_value: filteredUpdates,
    });
    
    return NextResponse.json(image);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const user = await verifyAdmin(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { imageId } = await params;
    
    // Get the image to find storage path
    const { data: image } = await supabaseAdmin
      .from('site_images')
      .select('storage_path, filename')
      .eq('id', imageId)
      .single();
    
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    
    // Check if image is in use
    const { count: heroCount } = await supabaseAdmin
      .from('hero_slots')
      .select('id', { count: 'exact' })
      .or(`image_id.eq.${imageId},mobile_image_id.eq.${imageId}`);
    
    const { count: portfolioCount } = await supabaseAdmin
      .from('portfolio_items')
      .select('id', { count: 'exact' })
      .or(`cover_image_id.eq.${imageId},thumbnail_image_id.eq.${imageId},hover_image_id.eq.${imageId}`);
    
    if ((heroCount || 0) > 0 || (portfolioCount || 0) > 0) {
      return NextResponse.json(
        { error: 'Image is in use. Remove it from hero slots or portfolio items first.' },
        { status: 400 }
      );
    }
    
    // Delete from R2
    try {
      await deleteFromR2(image.storage_path);
    } catch (r2Error) {
      console.warn('R2 delete failed (may already be deleted):', r2Error);
    }
    
    // Delete from database
    const { error } = await supabaseAdmin
      .from('site_images')
      .delete()
      .eq('id', imageId);
    
    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
    
    // Log the deletion (fire and forget - don't await)
    supabaseAdmin.rpc('log_image_edit', {
      p_entity_type: 'site_images',
      p_entity_id: imageId,
      p_action: 'delete',
      p_old_value: { filename: image.filename, storage_path: image.storage_path },
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
