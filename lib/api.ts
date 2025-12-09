import { supabase, Media } from "./supabaseClient";

export async function fetchPortfolioMedia(): Promise<Media[]> {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching media:", error);
    return [];
  }

  return data as Media[];
}

export async function uploadMediaFile(
  file: File,
  metadata: Partial<Media>
): Promise<{ success: boolean; media?: Media; error?: string }> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(filePath, file);

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from("portfolio")
      .getPublicUrl(filePath);

    const { data: insertData, error: insertError } = await supabase
      .from("media")
      .insert([
        {
          filename: fileName,
          url: publicUrlData.publicUrl,
          title: metadata.title || null,
          description: metadata.description || null,
          youtube_id: metadata.youtube_id || null,
          uploaded_by: metadata.uploaded_by || null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true, media: insertData as Media };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
