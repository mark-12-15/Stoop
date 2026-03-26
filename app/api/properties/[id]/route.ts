import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Ctx = { params: { id: string } };

export async function PUT(request: Request, { params }: Ctx) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { address, unit_number, city, state, zip_code, notes } = body;

  if (zip_code && !/^\d{5}$/.test(zip_code)) {
    return NextResponse.json({ error: "ZIP code must be 5 digits" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (address !== undefined)     updates.address     = address;
  if (unit_number !== undefined) updates.unit_number = unit_number || null;
  if (city !== undefined)        updates.city        = city;
  if (state !== undefined)       updates.state       = state;
  if (zip_code !== undefined)    updates.zip_code    = zip_code;
  if (notes !== undefined)       updates.notes       = notes || null;

  const { data, error } = await supabase
    .from("properties")
    .update(updates)
    .eq("id", params.id)
    .eq("landlord_id", session.user.id)
    .select("id, address, unit_number, city, state, zip_code, slug, notes, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: Ctx) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = (await request.json()) as { status: string };
  if (!["active", "frozen"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { error } = await supabase
    .from("properties")
    .update({ status })
    .eq("id", params.id)
    .eq("landlord_id", session.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check for active tickets
  const { count } = await supabase
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .eq("property_id", params.id)
    .in("status", ["new", "action_required", "pending_receipt"]);

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "Cannot delete property with active tickets", active_ticket_count: count },
      { status: 409 }
    );
  }

  // Soft delete
  const { error } = await supabase
    .from("properties")
    .update({ status: "inactive" })
    .eq("id", params.id)
    .eq("landlord_id", session.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
