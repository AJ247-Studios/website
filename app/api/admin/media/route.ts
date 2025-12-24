/**
 * Admin Media API - List and manage images
 * GET /api/admin/media - List all site images
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function GET(req: NextRequest) {
  try {
    // Verify admin auth
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || req.cookies.get('sb-access-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    // Parse query params
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const tagsParam = searchParams.get('tags');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    
    // Build query
    let query = supabaseAdmin
      .from('site_images')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    if (tagsParam) {
      const tags = tagsParam.split(',');
      query = query.overlaps('tags', tags);
    }
    
    if (search) {
      query = query.or(`filename.ilike.%${search}%,alt_text.ilike.%${search}%,caption.ilike.%${search}%`);
    }
    
    const { data: images, error, count } = await query;
    
    if (error) {
      console.error('Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
    }
    
    return NextResponse.json({
      images: images || [],
      total: count || 0,
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
