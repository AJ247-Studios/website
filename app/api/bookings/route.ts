import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Lazily create Supabase admin client with env validation.
 * This prevents the module from crashing at import time if env vars are missing.
 */
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * POST /api/bookings
 * Create a new booking (no auth required - anyone can book)
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    const {
      client_name,
      client_email,
      client_phone,
      employee_id,
      package_id,
      service_type,
      event_date,
      event_location,
      event_type,
      notes,
      guest_count,
      total_price_pln,
    } = body;

    // Validation
    if (!client_name || !client_email || !event_date || !service_type) {
      return NextResponse.json(
        { error: "Missing required fields: client_name, client_email, event_date, service_type" },
        { status: 400 }
      );
    }

    // Insert booking
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        client_id: null, // Anonymous booking - no auth required
        client_name,
        client_email,
        client_phone: client_phone || null,
        employee_id: employee_id || null,
        package_id: package_id || null,
        service_type,
        event_date,
        event_location: event_location || null,
        event_type: event_type || null,
        notes: notes || null,
        guest_count: guest_count ? parseInt(guest_count) : null,
        total_price_pln: total_price_pln || 0,
        deposit_pln: total_price_pln ? Math.round(total_price_pln * 0.3) : 0,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Booking insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ booking: data }, { status: 201 });
  } catch (err: any) {
    console.error("Booking API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings
 * List bookings (requires authentication)
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdmin();

    // Get auth token from header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's role
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "user";

    // Build query based on role
    let query = supabase.from("bookings").select("*").order("created_at", { ascending: false });

    if (role === "team") {
      query = query.eq("employee_id", user.id);
    } else if (role === "client" || role === "user") {
      query = query.eq("client_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookings: data || [] });
  } catch (err: any) {
    console.error("Booking API GET error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
