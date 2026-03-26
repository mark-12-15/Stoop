import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BillingClient from "@/components/settings/BillingClient";

export const metadata = { title: "Billing — StoopKeep" };

export default async function BillingPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, subscription_plan, subscription_status, subscription_end_date, trial_tickets_used, max_properties")
    .eq("id", session.user.id)
    .single();

  const displayName = profile?.full_name ?? session.user.email?.split("@")[0] ?? "there";
  const plan = (profile?.subscription_plan ?? "free") as "free" | "monthly" | "annual";

  // Properties count (active only)
  const { count: propertiesCount } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  // Tenant-submitted tickets count
  const { count: tenantTicketsCount } = await supabase
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .eq("source", "tenant_submitted");

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        userName={displayName}
        userEmail={session.user.email ?? ""}
        subscriptionPlan={plan}
      />
      <BillingClient
        plan={plan}
        status={profile?.subscription_status ?? "inactive"}
        endDate={profile?.subscription_end_date ?? null}
        propertiesCount={propertiesCount ?? 0}
        tenantTicketsCount={tenantTicketsCount ?? 0}
        maxProperties={profile?.max_properties ?? 3}
      />
    </div>
  );
}
