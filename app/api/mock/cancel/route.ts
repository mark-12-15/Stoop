import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Downgrade plan
  const { error } = await supabase
    .from("users")
    .update({
      subscription_plan: "free",
      subscription_status: "canceled",
      max_properties: 3,
      tickets_limit_per_month: 3,
    })
    .eq("id", session.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get all active properties ordered oldest-first (RLS scopes to current user)
  const { data: activeProps } = await supabase
    .from("properties")
    .select("id")
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if ((activeProps?.length ?? 0) > 3) {
    // Keep the 3 oldest active; freeze the rest
    const toFreeze = (activeProps ?? []).slice(3).map((p) => p.id);
    await supabase
      .from("properties")
      .update({ status: "frozen" })
      .in("id", toFreeze);
  }

  return NextResponse.json({ success: true });
}
