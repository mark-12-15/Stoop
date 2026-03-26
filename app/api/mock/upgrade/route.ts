import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { interval } = (await request.json()) as { interval: "year" | "month" };

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const endDate = new Date(now);
  if (interval === "year") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  const { error } = await supabase
    .from("users")
    .update({
      subscription_plan: interval === "year" ? "annual" : "monthly",
      subscription_status: "active",
      subscription_start_date: now.toISOString(),
      subscription_end_date: endDate.toISOString(),
      max_properties: 9999,
      tickets_limit_per_month: null,
    })
    .eq("id", session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Unfreeze all frozen properties on upgrade
  await supabase
    .from("properties")
    .update({ status: "active" })
    .eq("status", "frozen");

  return NextResponse.json({ success: true });
}
