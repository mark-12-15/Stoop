import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_CATEGORIES = [
  "repair_maintenance", "insurance", "property_tax", "mortgage_interest",
  "utilities", "management_fees", "hoa_fees", "cleaning",
  "legal_professional", "advertising", "supplies", "travel_auto", "other",
];

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { property_id, description, expense_category, closed_at, final_cost } = body as {
    property_id: string;
    description: string;
    expense_category: string;
    closed_at: string;
    final_cost: number | null;
  };

  if (!property_id || !description?.trim() || !closed_at) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const category = VALID_CATEGORIES.includes(expense_category)
    ? expense_category
    : "repair_maintenance";

  // Verify the property belongs to this landlord (RLS also enforces this)
  const { data: property } = await supabase
    .from("properties")
    .select("id, slug")
    .eq("id", property_id)
    .maybeSingle();

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const { data: ticket, error } = await supabase
    .from("tickets")
    .insert({
      property_id,
      property_slug: property.slug,
      source: "landlord_manual",
      status: "closed",
      description: description.trim(),
      tenant_raw_text: description.trim(),
      expense_category: category,
      closed_at,
      final_cost: final_cost ?? null,
      is_emergency: false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create expense record:", error);
    return NextResponse.json({ error: "Failed to save expense" }, { status: 500 });
  }

  return NextResponse.json({ id: ticket.id }, { status: 201 });
}
