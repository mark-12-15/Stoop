import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("tickets")
    .select("*, properties(id, address, unit_number, slug)")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

const UPDATABLE = [
  "status", "landlord_notes", "final_cost", "closed_at", "closed_reason",
  "receipt_photo_urls", "receipt_vendor_name", "receipt_ai_confidence",
  "receipt_ai_recognized", "description", "expense_category",
];

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const update: Record<string, unknown> = {};
  for (const key of UPDATABLE) {
    if (key in body) update[key] = body[key];
  }
  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const { error } = await supabase.from("tickets").update(update).eq("id", params.id);
  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("tickets").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
