import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Unsubscribe API
 * 
 * POST /api/unsubscribe
 * Body: { email: string }
 * 
 * Uses admin client to bypass RLS and mark subscriber as unsubscribed.
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Find subscriber by email
    const { data: subscriber, error: findError } = await supabaseAdmin
      .from("email_subscribers")
      .select("id, email, unsubscribed_at")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (findError) {
      return NextResponse.json(
        { error: "Email not found on our mailing list." },
        { status: 404 }
      );
    }

    // Already unsubscribed
    if (subscriber.unsubscribed_at) {
      return NextResponse.json(
        { message: "This email has already been unsubscribed.", alreadyUnsubscribed: true },
        { status: 200 }
      );
    }

    // Mark as unsubscribed
    const { error: updateError } = await supabaseAdmin
      .from("email_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Unsubscribe update error:", updateError);
      return NextResponse.json(
        { error: "Failed to unsubscribe. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "You have been successfully unsubscribed." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unsubscribe API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
