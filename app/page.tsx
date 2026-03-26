import { createClient } from "@/lib/supabase/server";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import TrustBand from "@/components/landing/TrustBand";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingCards from "@/components/landing/PricingCards";
import Footer from "@/components/landing/Footer";
import type { UserState, SubscriptionPlan } from "@/types/user";

export default async function LandingPage() {
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
    <div className="min-h-screen">
      <Header user={userState} />
      <Hero user={userState} />
      <TrustBand />
      <HowItWorks />
      <PricingCards user={userState} />
      <Footer />
    </div>
  );
}
