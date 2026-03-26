import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const tenantId = request.headers.get("X-Tenant-Identifier");
  if (!tenantId) return NextResponse.json({ tickets: [], property_deleted: true });

  const supabase = createAdminClient();

  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, status, is_emergency, tenant_raw_text, landlord_notes, final_cost, created_at, closed_at")
    .eq("property_slug", params.slug)
    .eq("tenant_identifier", tenantId)
    .in("status", ["closed", "archived"])
    .order("closed_at", { ascending: false });

  return NextResponse.json({
    tickets: tickets ?? [],
    property_deleted: true,
    message: "This property is no longer available",
  });
}
