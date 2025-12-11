import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    const clientId = (form.get("user_id") as string) || null;
    if (!file) return new Response("No file uploaded", { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const key = `uploads/${Date.now()}-${file.name}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${key}`;
    
    // Store metadata in Supabase (client_files table)
    if (clientId) {
      const { error } = await supabaseAdmin
        .from("client_files")
        .insert({
          user_id: clientId,
          file_url: publicUrl,
          file_name: file.name,
        });
      if (error) {
        console.error("Supabase insert error:", error);
        // continue to return URL even if DB insert fails
      }
    }

    return Response.json({ url: publicUrl, user_id: clientId });
  } catch (err) {
    console.error(err);
    return new Response("Upload failed", { status: 500 });
  }
}
