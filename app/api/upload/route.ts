import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // This endpoint is for general upload handling
    // Specific upload operations are handled by:
    // - /api/upload/request (for presigned URLs)
    // - /api/upload/complete (for upload completion)
    
    return NextResponse.json(
      { error: "Use /api/upload/request or /api/upload/complete" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: "Use POST to /api/upload/request or /api/upload/complete" },
    { status: 405 }
  );
}
