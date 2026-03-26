import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function generateSlug(address: string): string {
  const base = address
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { address, unit_number, city, state, zip_code, notes } = body;

  if (!address || !city || !state || !zip_code) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!/^\d{5}$/.test(zip_code)) {
    return NextResponse.json({ error: "ZIP code must be 5 digits" }, { status: 400 });
  }

  // Try up to 3 times to get a unique slug
  for (let i = 0; i < 3; i++) {
    const slug = generateSlug(address);
    const { data, error } = await supabase
      .from("properties")
      .insert({
        landlord_id: session.user.id,
        address,
        unit_number: unit_number || null,
        city,
        state,
        zip_code,
        notes: notes || null,
        slug,
      })
      .select("id, address, unit_number, city, state, zip_code, slug, notes, created_at")
      .single();

    if (!error) return NextResponse.json(data, { status: 201 });
    if (!error.message.includes("unique")) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Could not generate unique slug" }, { status: 500 });
}
