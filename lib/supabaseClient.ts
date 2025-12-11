import { createClientBrowser } from "@/utils/supabase-browser";

/**
 * Re-export the singleton browser client for backward compatibility.
 * 
 * IMPORTANT: This uses the singleton from supabase-browser.ts to prevent
 * "Multiple GoTrueClient instances" warnings in the browser.
 * 
 * For new code, prefer using `useSupabase()` hook from SupabaseProvider
 * which gives you access to the same singleton instance.
 */
export const supabase = createClientBrowser();

export interface Media {
  id: string;
  filename: string;
  url: string;
  title?: string;
  description?: string;
  youtube_id?: string;
  uploaded_by?: string;
  created_at: string;
}

export interface FileRecord {
  id: string;
  user_id: string | null;
  filename: string;
  mime_type: string;
  size: number;
  url: string;
  bucket: string;
  created_at: string;
  updated_at: string;
}
