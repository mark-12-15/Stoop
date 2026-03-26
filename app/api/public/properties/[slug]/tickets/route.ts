import { createAdminClient } from "@/lib/supabase/admin";
import { sendNewTicketNotification } from "@/lib/email/sendNewTicketNotification";
import { NextResponse } from "next/server";

type Ctx = { params: { slug: string } };

const TICKET_FIELDS =
  "id, status, is_emergency, tenant_raw_text, tenant_photo_urls, landlord_notes, final_cost, created_at, updated_at, closed_at, viewed_at";

export async function GET(request: Request, { params }: Ctx) {
  const tenantId = request.headers.get("X-Tenant-Identifier");
  if (!tenantId) return NextResponse.json({ error: "Missing tenant identifier" }, { status: 400 });

  const supabase = createAdminClient();

  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("slug", params.slug)
    .single();

  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  const { data: tickets } = await supabase
    .from("tickets")
    .select(TICKET_FIELDS)
    .eq("property_id", property.id)
    .eq("tenant_identifier", tenantId)
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  return NextResponse.json(tickets ?? []);
}

export async function POST(request: Request, { params }: Ctx) {
  const supabase = createAdminClient();

  const { data: property } = await supabase
    .from("properties")
    .select("id, status, landlord_id, address, unit_number")
    .eq("slug", params.slug)
    .single();

  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });
  if (property.status !== "active") return NextResponse.json({ error: "Property unavailable" }, { status: 403 });

  const body = await request.json();
  const { tenant_identifier, tenant_raw_text, is_emergency, photo_urls, tenant_name, tenant_email, tenant_phone } = body;

  if (!tenant_raw_text?.trim()) return NextResponse.json({ error: "Description is required" }, { status: 400 });
  if (!tenant_identifier) return NextResponse.json({ error: "Tenant identifier is required" }, { status: 400 });

  const { data: ticket, error } = await supabase
    .from("tickets")
    .insert({
      property_id: property.id,
      property_slug: params.slug,
      tenant_identifier,
      tenant_raw_text: tenant_raw_text.trim(),
      description: tenant_raw_text.trim(),
      is_emergency: is_emergency ?? false,
      tenant_photo_urls: photo_urls ?? [],
      tenant_name: tenant_name || null,
      tenant_email: tenant_email || null,
      tenant_phone: tenant_phone || null,
      source: "tenant_submitted",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fire-and-forget email to landlord
  const propertyAddress = [property.address, property.unit_number].filter(Boolean).join(", ");
  supabase
    .from("users")
    .select("email, full_name")
    .eq("id", property.landlord_id)
    .single()
    .then(({ data: landlord }) => {
      if (!landlord?.email) return;
      sendNewTicketNotification({
        to: landlord.email,
        landlordName: landlord.full_name,
        propertyAddress,
        ticketId: ticket.id,
        tenantRawText: tenant_raw_text.trim(),
        isEmergency: is_emergency ?? false,
        tenantName: tenant_name || null,
        tenantEmail: tenant_email || null,
        tenantPhone: tenant_phone || null,
      }).catch((err) => {
        console.error("[email] Failed to send new ticket notification:", err);
      });
    });

  return NextResponse.json({ id: ticket.id }, { status: 201 });
}
