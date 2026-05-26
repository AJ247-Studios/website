import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendPricingGuideEmail } from "@/lib/email";

/**
 * POST /api/subscribe
 *
 * Handles email lead capture with:
 * - Rate limiting (3 requests per IP per hour)
 * - Input validation
 * - Supabase insert into email_subscribers
 * - Automated welcome email with pricing guide
 */

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIP) return realIP;
  return "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(ip);

  if (existing && existing.resetAt < now) {
    rateLimitStore.delete(ip);
  }

  const current = rateLimitStore.get(ip);

  if (!current) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetAt: now + RATE_WINDOW };
  }

  if (current.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - current.count, resetAt: current.resetAt };
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  // Rate limiting
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT),
          "X-RateLimit-Remaining": "0",
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const { data: existing } = await supabaseAdmin
      .from("email_subscribers")
      .select("id, unsubscribed_at")
      .eq("email", email)
      .maybeSingle();

    let isNewSubscriber = false;

    if (existing) {
      // Re-subscribing after unsubscribing? Clear the unsub date.
      if (existing.unsubscribed_at) {
        await supabaseAdmin
          .from("email_subscribers")
          .update({ unsubscribed_at: null, source: "homepage_lead_magnet", tags: ["pricing_guide", "2026"] })
          .eq("id", existing.id);
      }
    } else {
      isNewSubscriber = true;
      const { error: insertError } = await supabaseAdmin.from("email_subscribers").insert({
        email,
        source: "homepage_lead_magnet",
        tags: ["pricing_guide", "2026"],
      });

      if (insertError) {
        console.error("Subscriber insert error:", insertError);
        return NextResponse.json(
          { error: "Failed to save your subscription. Please try again." },
          { status: 500 }
        );
      }
    }

    // Send welcome email with pricing guide
    const emailSent = await sendPricingGuideEmail(email);

    if (!emailSent) {
      console.error(`Failed to send pricing guide email to ${email}`);
      // Still return success to user — we have their email, can retry manually if needed
    }

    return NextResponse.json(
      {
        success: true,
        message: isNewSubscriber
          ? "Check your inbox! The pricing guide is on its way."
          : "You're already on the list! Check your inbox for the guide.",
        emailSent,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(rateLimit.resetAt),
        },
      }
    );
  } catch (error) {
    console.error("Subscribe API error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
