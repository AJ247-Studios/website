import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/utils/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createPresignedGetUrl, isPublicPath, getPublicUrl } from "@/lib/r2";

/**
 * GET /api/download/[objectId]
 * 
 * Generates a presigned download URL for a storage object.
 * Validates user permissions before generating URL.
 * 
 * For public files, returns the public CDN URL directly.
 * For private files, generates a short-lived presigned URL.
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

    // Fetch the storage object
    const { data: storageObject, error: fetchError } = await supabaseAdmin
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

    if (fetchError || !storageObject) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Public files - return public URL directly
    if (storageObject.is_public && isPublicPath(storageObject.r2_path)) {
      return NextResponse.json({
        url: getPublicUrl(storageObject.r2_path),
        filename: storageObject.filename,
        isPublic: true,
        expiresAt: null,
      });
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

    // Generate presigned URL (1 hour expiry for downloads)
    const presignedUrl = await createPresignedGetUrl(storageObject.r2_path, 3600);
    const expiresAt = new Date(Date.now() + 3600 * 1000);

    // Log download activity (non-critical, fire and forget)
    void supabaseAdmin.rpc('log_activity', {
      p_user_id: user.id,
      p_action: 'download',
      p_entity_type: 'storage_object',
      p_entity_id: objectId,
      p_metadata: {
        filename: storageObject.filename,
      }
    });

    return NextResponse.json({
      url: presignedUrl,
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
