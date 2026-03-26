import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PropertiesClient, { type Property, type TicketStats } from "@/components/properties/PropertiesClient";

export const metadata = { title: "Properties — StoopKeep" };

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: { add?: string };
}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, subscription_plan, max_properties")
    .eq("id", session.user.id)
    .single();

  const isPro =
    profile?.subscription_plan === "monthly" ||
    profile?.subscription_plan === "annual";
  const maxProperties = profile?.max_properties ?? 3;
  const displayName = profile?.full_name ?? session.user.email?.split("@")[0] ?? "there";

  // Fetch active + frozen properties (exclude soft-deleted)
  const { data: rawProperties } = await supabase
    .from("properties")
    .select("id, address, unit_number, city, state, zip_code, slug, notes, status, created_at")
    .neq("status", "inactive")
    .order("created_at", { ascending: false });

  const propertyRows = rawProperties ?? [];

  // Fetch ticket stats for all properties in one query
  const propertyIds = propertyRows.map((p) => p.id);
  let statsMap = new Map<string, TicketStats>();

  if (propertyIds.length > 0) {
    const { data: ticketRows } = await supabase
      .from("tickets")
      .select("property_id, status")
      .in("property_id", propertyIds);

    for (const t of ticketRows ?? []) {
      const s = statsMap.get(t.property_id) ?? { total: 0, active: 0, closed: 0 };
      s.total++;
      if (["new", "action_required", "pending_receipt"].includes(t.status)) s.active++;
      if (t.status === "closed") s.closed++;
      statsMap.set(t.property_id, s);
    }
  }

  const properties: Property[] = propertyRows.map((p) => ({
    ...p,
    ticket_stats: statsMap.get(p.id) ?? { total: 0, active: 0, closed: 0 },
  }));

  return (
    <div className="min-h-screen">
      <DashboardHeader
        userName={displayName}
        userEmail={session.user.email ?? ""}
        subscriptionPlan={(profile?.subscription_plan ?? "free") as "free" | "monthly" | "annual"}
      />
      <PropertiesClient
        properties={properties}
        isPro={isPro}
        maxProperties={maxProperties}
        autoOpen={searchParams.add === "true"}
      />
    </div>
  );
}
