import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/utils/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSignedUrl, STORAGE_BUCKET } from "@/lib/supabase-storage";

/**
 * GET /api/download/[objectId]
 * 
 * Generates a signed download URL for a storage object using Supabase Storage.
 * Validates user permissions before generating URL.
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ objectId: string }> }
) {
  try {
    const { objectId } = await params;

    // Get authenticated user
    const supabase = await createClientServer();
    const { data: { user } } = await supabase.auth.getUser();

    // First try to find in media_assets (new Supabase Storage flow)
    let storageObject: {
      id: string;
      storage_path?: string;
      r2_path?: string;
      filename?: string;
      is_public?: boolean;
      access_level?: string;
      uploaded_by?: string;
      project_id?: string;
      projects?: { id: string; client_id: string } | null;
    } | null = null;

    const { data: mediaAsset, error: mediaError } = await supabaseAdmin
      .from("media_assets")
      .select(`
        id,
        storage_path,
        filename,
        uploaded_by,
        project_id,
        projects (
          id,
          client_id
        )
      `)
      .eq("id", objectId)
      .single();

    if (mediaAsset) {
      // Handle projects join - Supabase may return array or single object
      const projectData = Array.isArray(mediaAsset.projects) 
        ? mediaAsset.projects[0] 
        : mediaAsset.projects;
      
      storageObject = {
        id: mediaAsset.id,
        storage_path: mediaAsset.storage_path,
        filename: mediaAsset.filename,
        uploaded_by: mediaAsset.uploaded_by,
        project_id: mediaAsset.project_id,
        projects: projectData as { id: string; client_id: string } | null,
        is_public: false, // All media assets use signed URLs
        access_level: 'private',
      };
    } else {
      // Fallback to storage_objects table (legacy R2 data)
      const { data: legacyObject, error: fetchError } = await supabaseAdmin
        .from("storage_objects")
        .select(`
          *,
          projects (
            id,
            client_id
          )
        `)
        .eq("id", objectId)
        .single();

      if (fetchError || !legacyObject) {
        return NextResponse.json(
          { error: "File not found" },
          { status: 404 }
        );
      }
      storageObject = legacyObject;
    }

    // Ensure storageObject is not null at this point
    if (!storageObject) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Private files require authentication
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's role and client associations
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role || "client";

    // Check permissions based on access level
    let hasAccess = false;

    // Admins and team can access everything
    if (['admin', 'team'].includes(role)) {
      hasAccess = true;
    }
    // Check if user is the uploader
    else if (storageObject.uploaded_by === user.id) {
      hasAccess = true;
    }
    // Check client access for deliverables
    else if (storageObject.access_level === 'client' && storageObject.projects?.client_id) {
      const { data: clientUser } = await supabaseAdmin
        .from("client_users")
        .select("id")
        .eq("user_id", user.id)
        .eq("client_id", storageObject.projects.client_id)
        .single();

      hasAccess = !!clientUser;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Generate signed URL (1 hour expiry for downloads)
    const storagePath = storageObject.storage_path || storageObject.r2_path;
    
    if (!storagePath) {
      return NextResponse.json(
        { error: "File path not found" },
        { status: 404 }
      );
    }

    const { url: signedUrl, error: signError } = await createSignedUrl(
      supabaseAdmin,
      storagePath,
      3600 // 1 hour
    );

    if (signError || !signedUrl) {
      console.error("Failed to create signed URL:", signError);
      return NextResponse.json(
        { error: "Failed to generate download URL" },
        { status: 500 }
      );
    }

    const expiresAt = new Date(Date.now() + 3600 * 1000);

    // Log download activity (non-critical, fire and forget)
    void supabaseAdmin.rpc('log_activity', {
      p_user_id: user.id,
      p_action: 'download',
      p_entity_type: 'media_asset',
      p_entity_id: objectId,
      p_metadata: {
        filename: storageObject.filename,
      }
    });

    return NextResponse.json({
      url: signedUrl,
      filename: storageObject.filename,
      isPublic: false,
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error("Download URL generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }
}
