/**
 * Project & Media Management Service
 * 
 * Core frontend wiring for:
 * - Project creation (admin/team)
 * - Project member management
 * - File uploads to Supabase Storage
 * - Media asset fetching with RLS
 * - Signed URL generation for downloads
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { STORAGE_BUCKET, buildStoragePath, type AssetType } from "./supabase-storage";
import type { MediaAsset } from "./types/storage";

// ============================================
// Types
// ============================================

export type ProjectRole = 'client' | 'team' | 'admin';

export interface Project {
  id: string;
  title: string;
  description?: string;
  client_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  created_at: string;
}

export interface CreateProjectInput {
  title: string;
  description?: string;
  client_id: string;
}

export interface AddMembersInput {
  project_id: string;
  members: Array<{
    user_id: string;
    role: ProjectRole;
  }>;
}

export interface UploadMediaInput {
  file: File;
  projectId: string;
  assetType: AssetType;
  uploadedBy: string;
  title?: string;
  caption?: string;
  tags?: string[];
}

// ============================================
// Project Operations
// ============================================

/**
 * Create a new project
 * 
 * Usage:
 * ```ts
 * const project = await createProject(supabase, {
 *   title: 'Client Shoot – December',
 *   client_id: clientUserId
 * });
 * ```
 */
export async function createProject(
  supabase: SupabaseClient,
  input: CreateProjectInput
): Promise<{ project: Project | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      title: input.title,
      description: input.description,
      client_id: input.client_id,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    return { project: null, error: new Error(error.message) };
  }

  return { project: data as Project, error: null };
}

/**
 * Add members to a project
 * 
 * This is the key step that unlocks RLS access.
 * 
 * Usage:
 * ```ts
 * await addProjectMembers(supabase, {
 *   project_id: project.id,
 *   members: [
 *     { user_id: adminId, role: 'admin' },
 *     { user_id: teamId, role: 'team' },
 *     { user_id: clientUserId, role: 'client' }
 *   ]
 * });
 * ```
 */
export async function addProjectMembers(
  supabase: SupabaseClient,
  input: AddMembersInput
): Promise<{ success: boolean; error: Error | null }> {
  const members = input.members.map(m => ({
    project_id: input.project_id,
    user_id: m.user_id,
    role: m.role,
  }));

  const { error } = await supabase
    .from('project_members')
    .insert(members);

  if (error) {
    return { success: false, error: new Error(error.message) };
  }

  return { success: true, error: null };
}

/**
 * Create a project with members in one operation
 * 
 * Convenience function that creates a project and adds all members.
 * 
 * Usage:
 * ```ts
 * const result = await createProjectWithMembers(supabase, {
 *   title: 'Client Shoot – December',
 *   client_id: clientUserId,
 * }, [
 *   { user_id: adminId, role: 'admin' },
 *   { user_id: teamId, role: 'team' },
 * ]);
 * ```
 */
export async function createProjectWithMembers(
  supabase: SupabaseClient,
  projectInput: CreateProjectInput,
  additionalMembers: Array<{ user_id: string; role: ProjectRole }> = []
): Promise<{ project: Project | null; error: Error | null }> {
  // Step 1: Create the project
  const { project, error: projectError } = await createProject(supabase, projectInput);
  
  if (projectError || !project) {
    return { project: null, error: projectError };
  }

  // Step 2: Add members (always include client as 'client' role)
  const allMembers = [
    { user_id: projectInput.client_id, role: 'client' as ProjectRole },
    ...additionalMembers,
  ];

  const { error: membersError } = await addProjectMembers(supabase, {
    project_id: project.id,
    members: allMembers,
  });

  if (membersError) {
    // Consider: should we delete the project if member insertion fails?
    console.error('Failed to add project members:', membersError);
    return { project, error: membersError };
  }

  return { project, error: null };
}

/**
 * Get all projects for the current user
 * 
 * RLS ensures users only see projects they're members of.
 */
export async function getUserProjects(
  supabase: SupabaseClient
): Promise<{ projects: Project[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { projects: [], error: new Error(error.message) };
  }

  return { projects: data as Project[], error: null };
}

/**
 * Get a single project by ID
 * 
 * RLS ensures only members can access.
 */
export async function getProject(
  supabase: SupabaseClient,
  projectId: string
): Promise<{ project: Project | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    return { project: null, error: new Error(error.message) };
  }

  return { project: data as Project, error: null };
}

// ============================================
// Media Operations
// ============================================

/**
 * Upload a file to a project
 * 
 * Flow:
 * 1. Upload file to Supabase Storage (bucket: 'media')
 * 2. Save metadata to media_assets table
 * 
 * Usage:
 * ```ts
 * const path = `projects/${projectId}/raw/${file.name}`;
 * 
 * // Or use the helper:
 * const result = await uploadProjectMedia(supabase, {
 *   file,
 *   projectId,
 *   assetType: 'raw',
 *   uploadedBy: user.id
 * });
 * ```
 */
export async function uploadProjectMedia(
  supabase: SupabaseClient,
  input: UploadMediaInput
): Promise<{ asset: MediaAsset | null; storagePath: string; error: Error | null }> {
  // Step 1: Build storage path
  const storagePath = buildStoragePath({
    assetType: input.assetType,
    projectId: input.projectId,
    filename: input.file.name,
  });

  // Step 2: Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, input.file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    return { asset: null, storagePath: '', error: new Error(uploadError.message) };
  }

  // Step 3: Save metadata to media_assets table
  const { data: assetData, error: dbError } = await supabase
    .from('media_assets')
    .insert({
      project_id: input.projectId,
      uploaded_by: input.uploadedBy,
      storage_path: uploadData.path,
      filename: input.file.name,
      file_size: input.file.size,
      mime_type: input.file.type,
      asset_type: input.assetType,
      status: 'uploaded',
      title: input.title,
      caption: input.caption,
      tags: input.tags,
    })
    .select()
    .single();

  if (dbError) {
    // Cleanup: remove uploaded file if DB insert fails
    await supabase.storage.from(STORAGE_BUCKET).remove([uploadData.path]);
    return { asset: null, storagePath: '', error: new Error(dbError.message) };
  }

  return { 
    asset: assetData as MediaAsset, 
    storagePath: uploadData.path, 
    error: null 
  };
}

/**
 * Get all media assets for a project
 * 
 * RLS guarantees:
 * - Client sees only their projects
 * - No accidental leaks
 * 
 * Usage:
 * ```ts
 * const { assets } = await getProjectMedia(supabase, projectId);
 * ```
 */
export async function getProjectMedia(
  supabase: SupabaseClient,
  projectId: string,
  options?: {
    assetType?: AssetType;
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ assets: MediaAsset[]; error: Error | null }> {
  let query = supabase
    .from('media_assets')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (options?.assetType) {
    query = query.eq('asset_type', options.assetType);
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 100) - 1);
  }

  const { data, error } = await query;

  if (error) {
    return { assets: [], error: new Error(error.message) };
  }

  return { assets: data as MediaAsset[], error: null };
}

/**
 * Get a single media asset by ID
 */
export async function getMediaAsset(
  supabase: SupabaseClient,
  assetId: string
): Promise<{ asset: MediaAsset | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .eq('id', assetId)
    .single();

  if (error) {
    return { asset: null, error: new Error(error.message) };
  }

  return { asset: data as MediaAsset, error: null };
}

// ============================================
// Signed URL Operations (Downloads)
// ============================================

/**
 * Create a signed URL for file download
 * 
 * This satisfies:
 * - Client can view & download files
 * - Links expire (default: 1 hour)
 * - Files are never public
 * 
 * Usage:
 * ```ts
 * const { url } = await createDownloadUrl(supabase, asset.storage_path);
 * window.open(url); // Opens download
 * ```
 */
export async function createDownloadUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresInSeconds: number = 3600 // 1 hour default
): Promise<{ url: string | null; expiresAt: Date | null; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error) {
    return { url: null, expiresAt: null, error: new Error(error.message) };
  }

  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  return { 
    url: data.signedUrl, 
    expiresAt, 
    error: null 
  };
}

/**
 * Create signed URLs for multiple files
 * 
 * Efficient batch operation for galleries/lists.
 */
export async function createBatchDownloadUrls(
  supabase: SupabaseClient,
  storagePaths: string[],
  expiresInSeconds: number = 3600
): Promise<{ urls: Map<string, string>; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrls(storagePaths, expiresInSeconds);

  if (error) {
    return { urls: new Map(), error: new Error(error.message) };
  }

  const urlMap = new Map<string, string>();
  data.forEach(item => {
    if (item.path && item.signedUrl) {
      urlMap.set(item.path, item.signedUrl);
    }
  });

  return { urls: urlMap, error: null };
}

/**
 * Download a file (opens in new tab or triggers download)
 * 
 * Convenience wrapper that creates a signed URL and opens it.
 */
export async function downloadFile(
  supabase: SupabaseClient,
  storagePath: string
): Promise<{ success: boolean; error: Error | null }> {
  const { url, error } = await createDownloadUrl(supabase, storagePath);

  if (error || !url) {
    return { success: false, error: error || new Error('Failed to create download URL') };
  }

  // Open in new tab (browser will handle download based on content-disposition)
  window.open(url, '_blank');

  return { success: true, error: null };
}

// ============================================
// Asset Management
// ============================================

/**
 * Update media asset metadata
 */
export async function updateMediaAsset(
  supabase: SupabaseClient,
  assetId: string,
  updates: Partial<Pick<MediaAsset, 'title' | 'caption' | 'tags' | 'status' | 'qa_status' | 'qa_notes'>>
): Promise<{ asset: MediaAsset | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('media_assets')
    .update(updates)
    .eq('id', assetId)
    .select()
    .single();

  if (error) {
    return { asset: null, error: new Error(error.message) };
  }

  return { asset: data as MediaAsset, error: null };
}

/**
 * Delete a media asset (and its storage file)
 */
export async function deleteMediaAsset(
  supabase: SupabaseClient,
  assetId: string
): Promise<{ success: boolean; error: Error | null }> {
  // First get the asset to find its storage path
  const { asset, error: fetchError } = await getMediaAsset(supabase, assetId);

  if (fetchError || !asset) {
    return { success: false, error: fetchError || new Error('Asset not found') };
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([asset.storage_path]);

  if (storageError) {
    console.error('Failed to delete from storage:', storageError);
    // Continue with DB delete anyway
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('media_assets')
    .delete()
    .eq('id', assetId);

  if (dbError) {
    return { success: false, error: new Error(dbError.message) };
  }

  return { success: true, error: null };
}

/**
 * Increment download count for an asset
 */
export async function trackDownload(
  supabase: SupabaseClient,
  assetId: string
): Promise<void> {
  await supabase.rpc('increment_download_count', { asset_id: assetId });
}
