import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

type Ctx = { params: { id: string } };

async function verifyOwnership(id: string, tenantId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("tickets")
    .select("id, status, tenant_identifier")
    .eq("id", id)
    .single();
  if (!data) return { error: "Not found", status: 404 };
  if (data.tenant_identifier !== tenantId) return { error: "Forbidden", status: 403 };
  if (data.status !== "new") return { error: "Cannot modify after landlord has viewed", status: 403 };
  return { ticket: data };
}

export async function PUT(request: Request, { params }: Ctx) {
  const tenantId = request.headers.get("X-Tenant-Identifier");
  if (!tenantId) return NextResponse.json({ error: "Missing tenant identifier" }, { status: 400 });

  const result = await verifyOwnership(params.id, tenantId);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const { tenant_raw_text, is_emergency, photo_urls } = await request.json();
  if (!tenant_raw_text?.trim()) return NextResponse.json({ error: "Description is required" }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("tickets")
    .update({
      tenant_raw_text: tenant_raw_text.trim(),
      description: tenant_raw_text.trim(),
      is_emergency: is_emergency ?? false,
      tenant_photo_urls: photo_urls ?? [],
    })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const tenantId = request.headers.get("X-Tenant-Identifier");
  if (!tenantId) return NextResponse.json({ error: "Missing tenant identifier" }, { status: 400 });

  const result = await verifyOwnership(params.id, tenantId);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const supabase = createAdminClient();
  const { error } = await supabase.from("tickets").delete().eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
