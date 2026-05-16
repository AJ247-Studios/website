import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * GET /api/employees
 * Get all available employees with their pricing for a specific service
 * Query param: ?service_type=sports (optional)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("service_type");

    // Build the query
    let query = supabase
      .from("employee_profiles")
      .select("*")
      .eq("is_available", true)
      .order("sort_order", { ascending: true });

    const { data: employees, error: empError } = await query;

    if (empError) {
      return NextResponse.json({ error: empError.message }, { status: 500 });
    }

    // If service type is specified, get pricing for each employee
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

      // Merge pricing into employees
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
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
