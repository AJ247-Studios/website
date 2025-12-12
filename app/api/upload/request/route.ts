import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/utils/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createPresignedPutUrl, generateStorageKey } from "@/lib/r2";
import { randomUUID } from "crypto";

/**
 * POST /api/upload/request
 * 
 * Generates a presigned PUT URL for direct client-to-R2 uploads.
 * This is the secure way to upload files without exposing R2 credentials.
 * 
 * Flow:
 * 1. Client requests upload permission with file metadata
 * 2. Server validates user permissions
 * 3. Server generates presigned URL and unique storage path
 * 4. Server creates upload_token record for tracking
 * 5. Client uploads directly to R2 using presigned URL
 * 6. Client calls /api/upload/complete to finalize
 */

interface UploadRequestBody {
  filename: string;
  contentType: string;
  size: number;
  projectId?: string;
  clientId?: string;
  fileType: 'raw' | 'deliverable' | 'avatar' | 'portfolio' | 'public-asset' | 'team-wip';
}

// Max file sizes by type (in bytes)
const MAX_FILE_SIZES: Record<string, number> = {
  'raw': 5 * 1024 * 1024 * 1024,        // 5GB for raw video files
  'deliverable': 1024 * 1024 * 1024,    // 1GB for deliverables
  'avatar': 5 * 1024 * 1024,            // 5MB for avatars
  'portfolio': 500 * 1024 * 1024,       // 500MB for portfolio items
  'public-asset': 50 * 1024 * 1024,     // 50MB for website assets
  'team-wip': 2 * 1024 * 1024 * 1024,   // 2GB for team WIP
};

// Allowed MIME types by file type
const ALLOWED_MIMES: Record<string, string[]> = {
  'raw': ['video/*', 'image/*', 'application/zip', 'application/x-rar-compressed'],
  'deliverable': ['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/zip'],
  'avatar': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  'portfolio': ['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp'],
  'public-asset': ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4'],
  'team-wip': ['video/*', 'image/*', 'application/zip', 'application/x-rar-compressed', 'application/pdf'],
};

function isAllowedMime(contentType: string, fileType: string): boolean {
  const allowed = ALLOWED_MIMES[fileType] || [];
  return allowed.some(pattern => {
    if (pattern.endsWith('/*')) {
      return contentType.startsWith(pattern.slice(0, -1));
    }
    return contentType === pattern;
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClientServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's role
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    
    const role = profile?.role || "client";

    // Parse request body
    const body: UploadRequestBody = await request.json();
    const { filename, contentType, size, projectId, clientId, fileType } = body;

    // Validate required fields
    if (!filename || !contentType || !size || !fileType) {
      return NextResponse.json(
        { error: "Missing required fields: filename, contentType, size, fileType" },
        { status: 400 }
      );
    }

    // Check file size limits
    const maxSize = MAX_FILE_SIZES[fileType] || MAX_FILE_SIZES['deliverable'];
    if (size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size for ${fileType}: ${Math.round(maxSize / 1024 / 1024)}MB` },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!isAllowedMime(contentType, fileType)) {
      return NextResponse.json(
        { error: `File type not allowed for ${fileType} uploads` },
        { status: 400 }
      );
    }

    // Permission checks based on file type and role
    if (fileType === 'raw' || fileType === 'deliverable' || fileType === 'team-wip') {
      // Only admin/team can upload these
      if (!['admin', 'team'].includes(role)) {
        return NextResponse.json(
          { error: "Insufficient permissions for this upload type" },
          { status: 403 }
        );
      }
    }

    if (fileType === 'portfolio' || fileType === 'public-asset') {
      // Only admin can upload public assets
      if (role !== 'admin') {
        return NextResponse.json(
          { error: "Only admins can upload portfolio and public assets" },
          { status: 403 }
        );
      }
    }

    // Avatar: users can upload their own
    if (fileType === 'avatar') {
      // This is fine for any authenticated user
    }

    // Generate storage key based on file type
    let storageKey: string;
    
    try {
      storageKey = generateStorageKey({
        type: fileType,
        filename,
        projectId,
        clientId,
        userId: user.id,
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to generate storage path" },
        { status: 400 }
      );
    }

    // Generate presigned PUT URL (15 minute expiry)
    const presignedUrl = await createPresignedPutUrl(storageKey, contentType, 900);

    // Create upload token for tracking
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const { error: tokenError } = await supabaseAdmin
      .from("upload_tokens")
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        token,
        r2_path: storageKey,
        max_size_bytes: size,
        allowed_mimes: [contentType],
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error("Failed to create upload token:", tokenError);
      // Continue anyway - upload can still work, just won't be tracked
    }

    return NextResponse.json({
      presignedUrl,
      key: storageKey,
      token,
      expiresAt: expiresAt.toISOString(),
      maxSize: maxSize,
    });

  } catch (error) {
    console.error("Upload request error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
