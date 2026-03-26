import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCards from "@/components/dashboard/StatCards";
import TaxSeasonBanner from "@/components/dashboard/TaxSeasonBanner";
import FreePlanBanner from "@/components/dashboard/FreePlanBanner";
import RecentActivity, { type ActivityTicket } from "@/components/dashboard/RecentActivity";
import EmptyState from "@/components/dashboard/EmptyState";
import UpgradeSuccessToast from "@/components/dashboard/UpgradeSuccessToast";
import FrozenPropertiesBanner from "@/components/dashboard/FrozenPropertiesBanner";

export const metadata = { title: "Dashboard — StoopKeep" };

type Profile = {
  full_name: string | null;
  subscription_plan: string;
  trial_tickets_used: number;
  trial_tickets_limit: number;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { upgraded?: string };
}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // Fetch profile; insert on first login (trigger handles new signups, this is a fallback)
  const { data: profile } = await supabase
    .from("users")
    .select("full_name, subscription_plan, trial_tickets_used, trial_tickets_limit")
    .eq("id", session.user.id)
    .maybeSingle() as { data: Profile | null };

  if (!profile) {
    await supabase.from("users").insert({
      id: session.user.id,
      email: session.user.email,
      full_name: session.user.user_metadata?.full_name ?? null,
      avatar_url: session.user.user_metadata?.avatar_url ?? null,
    });
  }

  // Check if user has any properties (determines empty state)
  const { count: propertiesCount } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true });

  const isEmpty = (propertiesCount ?? 0) === 0;

  // Count frozen properties (only relevant for free plan users)
  const { count: frozenCount } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("status", "frozen");

  // Fetch all non-archived tickets with property info (RLS scopes to this landlord)
  const { data: rawTickets } = await supabase
    .from("tickets")
    .select("id, status, is_emergency, final_cost, closed_at, updated_at, description, ai_summary, properties(address, unit_number)")
    .neq("status", "archived")
    .order("updated_at", { ascending: false });

  const tickets = (rawTickets ?? []) as unknown as ActivityTicket[];

  // Stats
  const now = new Date();
  const isTaxSeason = now.getMonth() <= 3; // Jan–Apr (month 0–3)
  const defaultYear = isTaxSeason ? now.getFullYear() - 1 : now.getFullYear();

  const todoCount = tickets.filter((t) =>
    ["new", "action_required", "pending_receipt"].includes(t.status)
  ).length;
  const urgentCount = tickets.filter(
    (t) => ["new", "action_required"].includes(t.status) && t.is_emergency
  ).length;
  const missingCount = tickets.filter((t) => t.status === "pending_receipt").length;
  const closedTickets = tickets.filter((t) => t.status === "closed");

  const taxBanner = isTaxSeason
    ? {
        taxYear: defaultYear,
        ticketCount: closedTickets.filter(
          (t) => t.closed_at && new Date(t.closed_at).getFullYear() === defaultYear
        ).length,
        missingCount,
        hasTickets: closedTickets.some(
          (t) => t.closed_at && new Date(t.closed_at).getFullYear() === defaultYear
        ),
      }
    : null;

  const isFreePlan = !profile || profile.subscription_plan === "free";
  const hasDowngradeBanner = isFreePlan && (frozenCount ?? 0) > 0;
  const displayName =
    profile?.full_name ?? session.user.email?.split("@")[0] ?? "there";

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        userName={displayName}
        userEmail={session.user.email ?? ""}
        subscriptionPlan={(profile?.subscription_plan ?? "free") as "free" | "monthly" | "annual"}
      />

      <UpgradeSuccessToast show={searchParams.upgraded === "true"} />

      <div className="max-w-5xl mx-auto px-6">
        {taxBanner && !isEmpty && !hasDowngradeBanner && (
          <div className="pt-6">
            <TaxSeasonBanner {...taxBanner} />
          </div>
        )}

        {isFreePlan && (frozenCount ?? 0) > 0 && (
          <div className="pt-6">
            <FrozenPropertiesBanner frozenCount={frozenCount ?? 0} />
          </div>
        )}

        <main className="py-6">
          <div className="flex items-center gap-4 mb-5 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            {isFreePlan && !isEmpty && (
              <FreePlanBanner
                used={profile?.trial_tickets_used ?? 0}
                limit={profile?.trial_tickets_limit ?? 3}
              />
            )}
          </div>

          {isEmpty ? (
            <EmptyState />
          ) : (
            <>
              <StatCards
                todoCount={todoCount}
                urgentCount={urgentCount}
                missingCount={missingCount}
                closedTickets={closedTickets}
                defaultYear={defaultYear}
              />
              <div className="border-t border-gray-100 pt-6">
                <RecentActivity tickets={tickets.slice(0, 5)} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
