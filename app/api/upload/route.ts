import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildStoragePath, STORAGE_BUCKET } from "@/lib/supabase-storage";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    const clientId = (form.get("user_id") as string) || null;
    const projectId = (form.get("project_id") as string) || null;
    
    if (!file) return new Response("No file uploaded", { status: 400 });

    // Build storage path
    const storagePath = buildStoragePath({
      assetType: 'deliverable',
      projectId: projectId || undefined,
      filename: file.name,
    });

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return new Response("Upload failed", { status: 500 });
    }

    // Store metadata in Supabase (media_assets table)
    const { data: mediaAsset, error: dbError } = await supabaseAdmin
      .from("media_assets")
      .insert({
        uploaded_by: clientId,
        project_id: projectId,
        filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: data.path,
        asset_type: 'deliverable',
        status: 'uploaded',
      })
      .select('id')
      .single();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      // continue to return path even if DB insert fails
    }

    return Response.json({ 
      storage_path: data.path, 
      id: mediaAsset?.id,
      user_id: clientId 
    });
  } catch (err) {
    console.error(err);
    return new Response("Upload failed", { status: 500 });
  }
}
