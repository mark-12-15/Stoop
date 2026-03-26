import { createClient } from "@/lib/supabase/server";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import PricingPageClient from "@/components/pricing/PricingPageClient";
import type { UserState, SubscriptionPlan } from "@/types/user";

export const metadata = { title: "Pricing — StoopKeep" };

export default async function PricingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userState: UserState = { isLoggedIn: false };

  if (user) {
    const { data } = await supabase
      .from("users")
      .select("subscription_plan")
      .eq("id", user.id)
      .single();

    userState = {
      isLoggedIn: true,
      email: user.email ?? "",
      initials: (user.user_metadata?.full_name?.[0] ?? user.email?.[0] ?? "U").toUpperCase(),
      avatarUrl: user.user_metadata?.avatar_url ?? undefined,
      subscriptionPlan: (data?.subscription_plan as SubscriptionPlan) ?? "free",
    };
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={userState} />
      <div className="flex-1">
        <PricingPageClient user={userState} />
      </div>
      <Footer />
    </div>
  );
}
