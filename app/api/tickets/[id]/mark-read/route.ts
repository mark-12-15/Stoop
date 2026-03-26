import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await supabase
    .from("tickets")
    .update({ status: "action_required", viewed_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("status", "new");

  return NextResponse.json({ ok: true });
}
