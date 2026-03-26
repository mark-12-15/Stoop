import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { frozenId, activeId } = (await request.json()) as { frozenId: string; activeId: string };
  if (!frozenId || !activeId) {
    return NextResponse.json({ error: "frozenId and activeId are required" }, { status: 400 });
  }

  // Verify frozenId belongs to user and is frozen (RLS enforces ownership)
  const { data: frozenProp } = await supabase
    .from("properties")
    .select("id")
    .eq("id", frozenId)
    .eq("status", "frozen")
    .single();
  if (!frozenProp) return NextResponse.json({ error: "Property not found or not frozen" }, { status: 404 });

  // Verify activeId belongs to user and is active
  const { data: activeProp } = await supabase
    .from("properties")
    .select("id")
    .eq("id", activeId)
    .eq("status", "active")
    .single();
  if (!activeProp) return NextResponse.json({ error: "Property not found or not active" }, { status: 404 });

  // Atomic swap
  const [r1, r2] = await Promise.all([
    supabase.from("properties").update({ status: "frozen" }).eq("id", activeId),
    supabase.from("properties").update({ status: "active" }).eq("id", frozenId),
  ]);

  if (r1.error || r2.error) {
    return NextResponse.json({ error: "Swap failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
