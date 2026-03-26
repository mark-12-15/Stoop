import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LogExpenseForm, { type Property } from "@/components/tickets/LogExpenseForm";

export const metadata = { title: "Log Expense — StoopKeep" };

export default async function NewTicketPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const [profileResult, propertiesResult] = await Promise.all([
    supabase
      .from("users")
      .select("full_name, subscription_plan")
      .eq("id", session.user.id)
      .maybeSingle(),
    supabase
      .from("properties")
      .select("id, address, unit_number")
      .eq("status", "active")
      .order("address"),
  ]);

  const profile = profileResult.data;
  const properties = (propertiesResult.data ?? []) as Property[];
  const displayName = profile?.full_name ?? session.user.email?.split("@")[0] ?? "there";

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        userName={displayName}
        userEmail={session.user.email ?? ""}
        subscriptionPlan={(profile?.subscription_plan ?? "free") as "free" | "monthly" | "annual"}
      />

      <div className="max-w-xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Log Expense</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manually record a repair or expense for your tax records.
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-slate-600 mb-4">
              You need to add a property before logging expenses.
            </p>
            <Link
              href="/properties?add=true"
              className="inline-block bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Property
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <LogExpenseForm properties={properties} />
          </div>
        )}
      </div>
    </div>
  );
}
