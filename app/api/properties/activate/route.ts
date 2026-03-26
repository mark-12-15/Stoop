import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { propertyIds } = (await request.json()) as { propertyIds: string[] };

  if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
    return NextResponse.json({ error: "No properties selected" }, { status: 400 });
  }

  // Enforce free plan limit
  const { data: profile } = await supabase
    .from("users")
    .select("max_properties, subscription_plan")
    .eq("id", session.user.id)
    .single();

  const maxAllowed = profile?.max_properties ?? 3;
  if (propertyIds.length > maxAllowed) {
    return NextResponse.json(
      { error: `Free plan allows ${maxAllowed} active properties` },
      { status: 400 }
    );
  }

  // Freeze all → then activate selected
  await supabase
    .from("properties")
    .update({ status: "frozen" })
    .eq("status", "active");

  await supabase
    .from("properties")
    .update({ status: "active" })
    .in("id", propertyIds)
    .eq("status", "frozen");

  return NextResponse.json({ success: true });
}
