import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("service_type");

    let query = supabase
      .from("employee_profiles")
      .select("*")
      .eq("is_available", true)
      .order("sort_order", { ascending: true });

    const { data: employees, error: empError } = await query;

    if (empError) {
      return NextResponse.json({ error: empError.message }, { status: 500 });
    }

    let result = employees || [];

    if (serviceType) {
      const { data: packages } = await supabase
        .from("service_packages")
        .select("*")
        .eq("service_type", serviceType)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      const { data: pricing } = await supabase
        .from("employee_pricing")
        .select("*")
        .eq("is_available", true);

      result = (employees || []).map((emp: any) => {
        const empPricing = (pricing || []).filter((p: any) => p.employee_id === emp.id);
        const packagesWithPrice = (packages || []).map((pkg: any) => {
          const custom = empPricing.find((p: any) => p.package_id === pkg.id);
          return {
            ...pkg,
            final_price_pln: custom?.custom_price_pln || pkg.base_price_pln,
            pricing_note: custom?.notes || null,
          };
        });
        return {
          ...emp,
          packages: packagesWithPrice,
        };
      });
    }

    return NextResponse.json({ employees: result });
  } catch (err: any) {
    console.error("Employees API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
