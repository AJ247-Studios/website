import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/leads
 * 
 * Handles contact form submissions with:
 * - Rate limiting (5 requests per IP per hour)
 * - Input validation
 * - Spam detection (honeypot)
 * - CRM integration hook
 * - Email notification hook
 */

// Rate limiting store (in production, use Redis/Upstash)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = 5; // Max requests per window
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

interface LeadData {
  name: string;
  email: string;
  phone?: string;
  service: string;
  eventDate?: string;
  message?: string;
  projectSlug?: string;
  source?: string;
  honeypot?: string; // Spam trap field
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(ip);

  // Clean up old entries
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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateLeadData(data: LeadData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name is required (min 2 characters)");
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push("Valid email address is required");
  }

  if (!data.service) {
    errors.push("Service type is required");
  }

  const validServices = [
    "sports",
    "wedding",
    "product",
    "real-estate",
    "portrait",
    "corporate",
    "other"
  ];

  if (data.service && !validServices.includes(data.service)) {
    errors.push("Invalid service type");
  }

  // Phone validation (optional but if provided, check format)
  if (data.phone && !/^[\d\s\-+()]{7,20}$/.test(data.phone)) {
    errors.push("Invalid phone number format");
  }

  // Message length limit
  if (data.message && data.message.length > 2000) {
    errors.push("Message too long (max 2000 characters)");
  }

  return { valid: errors.length === 0, errors };
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  // Rate limiting check
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { 
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimit.resetAt),
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
        }
      }
    );
  }

  try {
    const body: LeadData = await request.json();

    // Honeypot spam check - if this field is filled, it's likely a bot
    if (body.honeypot) {
      // Silently accept but don't process (fool the bot)
      return NextResponse.json(
        { success: true, message: "Thank you for your inquiry. We'll be in touch soon!" },
        { status: 200 }
      );
    }

    // Validate input
    const validation = validateLeadData(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    // Initialize Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare lead data for database
    const leadRecord = {
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      phone: body.phone?.trim() || null,
      service: body.service,
      event_date: body.eventDate || null,
      message: body.message?.trim() || null,
      project_slug: body.projectSlug || null,
      source: body.source || "contact_form",
      ip_address: ip,
      user_agent: request.headers.get("user-agent") || null,
      status: "new",
      created_at: new Date().toISOString()
    };

    // Insert into database
    const { data, error } = await supabase
      .from("leads")
      .insert([leadRecord])
      .select("id")
      .single();

    if (error) {
      console.error("Database error:", error);
      
      // Check for duplicate email in recent time (anti-spam)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You've already submitted an inquiry recently. We'll get back to you soon!" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to save your inquiry. Please try again." },
        { status: 500 }
      );
    }

    // TODO: Send notification email to team
    // await sendNotificationEmail(leadRecord);

    // TODO: Send confirmation email to customer
    // await sendConfirmationEmail(leadRecord);

    // TODO: Push to CRM webhook
    // await pushToCRM(leadRecord);

    // Analytics event
    // analytics.track("lead_submitted", { service: body.service, source: body.source });

    return NextResponse.json(
      { 
        success: true, 
        message: "Thank you for your inquiry! We'll contact you within 2 hours during business hours.",
        leadId: data.id
      },
      { 
        status: 201,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(rateLimit.resetAt)
        }
      }
    );

  } catch (error) {
    console.error("Lead submission error:", error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint for checking rate limit status
export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  const existing = rateLimitStore.get(ip);
  const now = Date.now();

  if (!existing || existing.resetAt < now) {
    return NextResponse.json({
      remaining: RATE_LIMIT,
      limit: RATE_LIMIT,
      resetAt: null
    });
  }

  return NextResponse.json({
    remaining: Math.max(0, RATE_LIMIT - existing.count),
    limit: RATE_LIMIT,
    resetAt: existing.resetAt
  });
}
