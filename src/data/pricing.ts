export interface PricingTier {
  tier: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  featured: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    tier: "Starter",
    price: 99,
    period: "month",
    description:
      "Perfect for small teams getting started with hiring. Everything you need to post jobs and find great candidates.",
    features: [
      "3 active job posts",
      "Basic analytics dashboard",
      "Email support",
      "Public job listings",
      "Candidate management",
    ],
    ctaText: "Get Started",
    featured: false,
  },
  {
    tier: "Pro",
    price: 299,
    period: "month",
    description:
      "For growing teams that need advanced tools to scale their hiring. Includes AI-powered matching and priority support.",
    features: [
      "15 active job posts",
      "Advanced analytics and insights",
      "AI-powered candidate matching",
      "Priority support",
      "Custom branding",
      "Team collaboration tools",
    ],
    ctaText: "Start Free Trial",
    featured: true,
  },
  {
    tier: "Enterprise",
    price: 0,
    period: "custom",
    description:
      "For organizations with unique hiring needs. Get a tailored solution with dedicated support and enterprise-grade features.",
    features: [
      "Unlimited job posts",
      "Dedicated account manager",
      "API access and integrations",
      "White-label platform",
      "SSO and SAML authentication",
      "Custom integrations",
    ],
    ctaText: "Contact Sales",
    featured: false,
  },
];
