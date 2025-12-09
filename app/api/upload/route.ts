import { NextRequest, NextResponse } from "next/server";
import { uploadMediaFile } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const youtube_id = formData.get("youtube_id") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const result = await uploadMediaFile(file, {
      title,
      description,
      youtube_id,
    });

    if (result.success) {
      return NextResponse.json({ success: true, media: result.media });
    } else {
      return NextResponse.json(
        { error: result.error || "Upload failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
