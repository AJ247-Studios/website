/**
 * Admin Media API - Single Portfolio Item operations
 * PATCH /api/admin/media/portfolio-items/[itemId] - Update portfolio item
 * DELETE /api/admin/media/portfolio-items/[itemId] - Delete portfolio item
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = await verifyAdmin(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { itemId } = await params;
    
    const { data: item, error } = await supabaseAdmin
      .from('portfolio_items')
      .select(`
        *,
        cover_image:site_images!portfolio_items_cover_image_id_fkey(*),
        thumbnail_image:site_images!portfolio_items_thumbnail_image_id_fkey(*),
        hover_image:site_images!portfolio_items_hover_image_id_fkey(*)
      `)
      .eq('id', itemId)
      .single();
    
    if (error || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    return NextResponse.json(item);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = await verifyAdmin(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { itemId } = await params;
    const updates = await req.json();
    
    // Only allow specific fields to be updated
    const allowedFields = [
      'title', 'slug', 'short_description', 'full_description',
      'cover_image_id', 'thumbnail_image_id', 'hover_image_id',
      'categories', 'tags', 'client_name', 'project_date',
      'is_published', 'is_featured', 'sort_order',
      'link_type', 'external_url'
    ];
    
    const filteredUpdates: Record<string, unknown> = {
      updated_by: user.id,
    };
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    }
    
    // If slug is being changed, check uniqueness
    if (filteredUpdates.slug) {
      const { data: existing } = await supabaseAdmin
        .from('portfolio_items')
        .select('id')
        .eq('slug', filteredUpdates.slug as string)
        .neq('id', itemId)
        .single();
      
      if (existing) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
      }
    }
    
    // Get current item for logging
    const { data: currentItem } = await supabaseAdmin
      .from('portfolio_items')
      .select('*')
      .eq('id', itemId)
      .single();
    
    if (!currentItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Update the item
    const { data: item, error } = await supabaseAdmin
      .from('portfolio_items')
      .update(filteredUpdates)
      .eq('id', itemId)
      .select(`
        *,
        cover_image:site_images!portfolio_items_cover_image_id_fkey(*),
        thumbnail_image:site_images!portfolio_items_thumbnail_image_id_fkey(*),
        hover_image:site_images!portfolio_items_hover_image_id_fkey(*)
      `)
      .single();
    
    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }
    
    // Log the edit (fire and forget - don't await)
    supabaseAdmin.rpc('log_image_edit', {
      p_entity_type: 'portfolio_items',
      p_entity_id: itemId,
      p_action: 'update',
      p_field_changed: Object.keys(updates).join(','),
      p_old_value: { title: currentItem.title, cover_image_id: currentItem.cover_image_id },
      p_new_value: filteredUpdates,
    });
    
    return NextResponse.json(item);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = await verifyAdmin(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { itemId } = await params;
    
    // Get item for logging
    const { data: item } = await supabaseAdmin
      .from('portfolio_items')
      .select('title, slug')
      .eq('id', itemId)
      .single();
    
    // Delete gallery items first (cascade should handle this, but be safe)
    await supabaseAdmin
      .from('portfolio_gallery')
      .delete()
      .eq('portfolio_item_id', itemId);
    
    // Delete the item
    const { error } = await supabaseAdmin
      .from('portfolio_items')
      .delete()
      .eq('id', itemId);
    
    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
    
    // Log the deletion (fire and forget - don't await)
    if (item) {
      supabaseAdmin.rpc('log_image_edit', {
        p_entity_type: 'portfolio_items',
        p_entity_id: itemId,
        p_action: 'delete',
        p_old_value: item,
      });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
