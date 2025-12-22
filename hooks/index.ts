/**
 * Hooks Index
 * 
 * Central export for all custom hooks
 */

// Auth & Supabase
export { useSupabase } from "@/components/SupabaseProvider";

// Projects
export { useProjects } from "./useProjects";
export type { UseProjectsReturn } from "./useProjects";

// Media & Uploads
export { useProjectMedia } from "./useProjectMedia";
export type { UseProjectMediaReturn, LoadAssetsOptions, MediaAssetUpdates } from "./useProjectMedia";

export { useUpload } from "./useUpload";
export type { UploadOptions, UploadResult, UploadError } from "./useUpload";

export { useSignedUrl } from "./useSignedUrl";
export type { SignedUrlResult, UseSignedUrlReturn } from "./useSignedUrl";
