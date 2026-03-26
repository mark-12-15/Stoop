export type SubscriptionPlan = "free" | "monthly" | "annual";

export type UserState =
  | { isLoggedIn: false }
  | {
      isLoggedIn: true;
      email: string;
      initials: string;
      avatarUrl?: string;
      subscriptionPlan: SubscriptionPlan;
    };
