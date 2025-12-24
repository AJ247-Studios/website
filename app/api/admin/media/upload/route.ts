/**
 * Admin Media API - Upload endpoint
 * POST /api/admin/media/upload
 * 
 * Handles image uploads for the visual editor, storing files in R2
 * and metadata in the site_images table.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { uploadToR2, generateStorageKey } from "@/lib/r2";

// Initialize admin Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    // Verify admin auth
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || req.cookies.get('sb-access-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user is admin
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
    
    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }
    
    // Get form fields
    const category = (formData.get('category') as string) || 'general';
    const altText = formData.get('alt_text') as string;
    const caption = formData.get('caption') as string;
    const tagsStr = formData.get('tags') as string;
    const focalX = parseFloat(formData.get('focal_x') as string) || 0.5;
    const focalY = parseFloat(formData.get('focal_y') as string) || 0.5;
    const width = parseInt(formData.get('width') as string) || null;
    const height = parseInt(formData.get('height') as string) || null;
    
    let tags: string[] = [];
    try {
      tags = tagsStr ? JSON.parse(tagsStr) : [];
    } catch {
      tags = [];
    }
    
    // Generate storage key
    const storageKey = generateStorageKey({
      type: 'public-asset',
      filename: file.name,
    });
    
    // Upload to R2
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadToR2(buffer, storageKey, file.type);
    
    // Insert metadata into site_images table
    const { data: image, error: dbError } = await supabaseAdmin
      .from('site_images')
      .insert({
        storage_path: storageKey,
        public_url: publicUrl,
        filename: file.name,
        mime_type: file.type,
        file_size: file.size,
        width,
        height,
        focal_x: focalX,
        focal_y: focalY,
        alt_text: altText || null,
        caption: caption || null,
        tags,
        category,
        uploaded_by: user.id,
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to save image metadata' }, { status: 500 });
    }
    
    // Log the upload action (fire and forget - don't await)
    supabaseAdmin.rpc('log_image_edit', {
      p_entity_type: 'site_images',
      p_entity_id: image.id,
      p_action: 'upload',
      p_new_value: { filename: file.name, category, public_url: publicUrl },
    });
    
    return NextResponse.json({
      image,
      url: publicUrl,
    });
    
  } catch (error) {
    console.error('Upload error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      // Log R2/S3 specific error details if present
      ...(error && typeof error === 'object' && '$metadata' in error 
        ? { httpStatusCode: (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode }
        : {}),
    });
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Upload failed',
        type: error instanceof Error ? error.name : 'UnknownError',
      },
      { status: 500 }
    );
  }
}
