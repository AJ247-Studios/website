import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
