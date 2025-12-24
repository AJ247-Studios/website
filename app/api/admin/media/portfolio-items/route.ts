/**
 * Admin Media API - Portfolio Items
 * GET /api/admin/media/portfolio-items - List all portfolio items with images
 * POST /api/admin/media/portfolio-items - Create a new portfolio item
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

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get('published') === 'true';
    
    // Fetch portfolio items with joined image data
    let query = supabaseAdmin
      .from('portfolio_items')
      .select(`
        *,
        cover_image:site_images!portfolio_items_cover_image_id_fkey(*),
        thumbnail_image:site_images!portfolio_items_thumbnail_image_id_fkey(*),
        hover_image:site_images!portfolio_items_hover_image_id_fkey(*)
      `)
      .order('sort_order')
      .order('created_at', { ascending: false });
    
    if (publishedOnly) {
      query = query.eq('is_published', true);
    }
    
    const { data: items, error } = await query;
    
    if (error) {
      console.error('Portfolio items query error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json({ 
        error: 'Failed to fetch portfolio items',
        detail: error.message,
        code: error.code,
        hint: error.hint,
      }, { status: 500 });
    }
    
    return NextResponse.json(items || []);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { title, slug, ...rest } = body;
    
    if (!title || !slug) {
      return NextResponse.json({ error: 'title and slug are required' }, { status: 400 });
    }
    
    // Check slug uniqueness
    const { data: existing } = await supabaseAdmin
      .from('portfolio_items')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }
    
    const { data: item, error } = await supabaseAdmin
      .from('portfolio_items')
      .insert({
        title,
        slug,
        ...rest,
        created_by: user.id,
        updated_by: user.id,
      })
      .select(`
        *,
        cover_image:site_images!portfolio_items_cover_image_id_fkey(*),
        thumbnail_image:site_images!portfolio_items_thumbnail_image_id_fkey(*),
        hover_image:site_images!portfolio_items_hover_image_id_fkey(*)
      `)
      .single();
    
    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create portfolio item' }, { status: 500 });
    }
    
    // Log the creation (fire and forget - don't await)
    supabaseAdmin.rpc('log_image_edit', {
      p_entity_type: 'portfolio_items',
      p_entity_id: item.id,
      p_action: 'create',
      p_new_value: { title, slug },
    });
    
    return NextResponse.json(item);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create portfolio item' }, { status: 500 });
  }
}
