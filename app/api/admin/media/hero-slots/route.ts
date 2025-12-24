/**
 * Admin Media API - Hero Slots
 * GET /api/admin/media/hero-slots - List all hero slots with images
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
    
    // Fetch hero slots with joined image data
    const { data: slots, error } = await supabaseAdmin
      .from('hero_slots')
      .select(`
        *,
        image:site_images!hero_slots_image_id_fkey(*),
        mobile_image:site_images!hero_slots_mobile_image_id_fkey(*)
      `)
      .order('page_key')
      .order('sort_order');
    
    if (error) {
      console.error('Hero slots query error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json({ 
        error: 'Failed to fetch hero slots',
        detail: error.message,
        code: error.code,
        hint: error.hint,
      }, { status: 500 });
    }
    
    return NextResponse.json(slots || []);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch hero slots' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { page_key, slot_key, ...rest } = body;
    
    if (!page_key || !slot_key) {
      return NextResponse.json({ error: 'page_key and slot_key are required' }, { status: 400 });
    }
    
    const { data: slot, error } = await supabaseAdmin
      .from('hero_slots')
      .insert({
        page_key,
        slot_key,
        ...rest,
        updated_by: user.id,
      })
      .select(`
        *,
        image:site_images!hero_slots_image_id_fkey(*),
        mobile_image:site_images!hero_slots_mobile_image_id_fkey(*)
      `)
      .single();
    
    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create hero slot' }, { status: 500 });
    }
    
    return NextResponse.json(slot);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create hero slot' }, { status: 500 });
  }
}
