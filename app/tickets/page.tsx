import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TicketsClient from "@/components/tickets/TicketsClient";

export const metadata = { title: "Tickets — StoopKeep" };

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: {
    filter?: string;
    sort?: string;
    page?: string;
    property?: string;
    view?: string;
    ticket?: string;
  };
}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, subscription_plan")
    .eq("id", session.user.id)
    .single();

  const displayName = profile?.full_name ?? session.user.email?.split("@")[0] ?? "there";

  // Build query
  const filter = searchParams.filter ?? "all";
  const sort = searchParams.sort ?? "date_desc";
  const propertyId = searchParams.property;
  const viewParam = searchParams.view;

  let query = supabase
    .from("tickets")
    .select(
      "id, status, source, description, ai_summary, ai_category, is_emergency, final_cost, closed_at, created_at, updated_at, properties(id, address, unit_number)"
    );

  if (propertyId) query = query.eq("property_id", propertyId);

  if (filter === "todo") {
    query = query.in("status", ["new", "action_required", "pending_receipt"]);
  } else if (filter === "pending_receipt") {
    query = query.eq("status", "pending_receipt");
  } else if (filter === "closed") {
    query = query.eq("status", "closed");
  } else if (filter === "archived") {
    query = query.eq("status", "archived");
  } else {
    query = query.neq("status", "archived");
  }

  if (sort === "date_asc") {
    query = query.order("created_at", { ascending: true });
  } else if (sort === "cost_desc") {
    query = query.order("final_cost", { ascending: false, nullsFirst: false });
  } else if (sort === "cost_asc") {
    query = query.order("final_cost", { ascending: true, nullsFirst: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: allTickets } = await query;
  const tickets = allTickets ?? [];

  const autoView = tickets.length > 15 ? "table" : "cards";
  const currentView = viewParam ?? autoView;
  const perPage = currentView === "table" ? 20 : 10;
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const total = tickets.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const paged = tickets.slice((page - 1) * perPage, page * perPage);

  let propertyName: string | null = null;
  if (propertyId) {
    const { data: prop } = await supabase
      .from("properties")
      .select("address, unit_number")
      .eq("id", propertyId)
      .maybeSingle();
    if (prop) {
      propertyName = prop.unit_number
        ? `${prop.address}, Unit ${prop.unit_number}`
        : prop.address;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        userName={displayName}
        userEmail={session.user.email ?? ""}
        subscriptionPlan={(profile?.subscription_plan ?? "free") as "free" | "monthly" | "annual"}
      />
      <Suspense fallback={null}>
        <TicketsClient
          tickets={paged as unknown as TicketRow[]}
          total={total}
          page={page}
          totalPages={totalPages}
          perPage={perPage}
          currentFilter={filter}
          currentSort={sort}
          currentView={currentView}
          propertyId={propertyId ?? null}
          propertyName={propertyName}
        />
      </Suspense>
    </div>
  );
}

export type TicketRow = {
  id: string;
  status: string;
  source: string;
  description: string | null;
  ai_summary: string | null;
  ai_category: string | null;
  is_emergency: boolean;
  final_cost: number | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  properties: { id: string; address: string; unit_number: string | null } | null;
};
