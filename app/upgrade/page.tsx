import { redirect } from "next/navigation";
import { getOrCreateDbUser } from "../../lib/utils/getOrCreateDbUser";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { UpgradeForm } from "./UpgradeForm";

interface UpgradePageProps {
  searchParams: Promise<{ plan?: string }>;
}

const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    label: "Pro · Monthly",
    priceLabel: "$4.99/month",
  },
  annual: {
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID!,
    label: "Pro · Annual",
    priceLabel: "$49/year",
  },
} as const;

export default async function UpgradePage({ searchParams }: UpgradePageProps) {
  const user = await getOrCreateDbUser();
  if (!user) redirect("/sign-in");

  if (user.plan === "pro") redirect("/dashboard");

  const { plan } = await searchParams;
  const selected = plan === "annual" ? PLANS.annual : PLANS.monthly;

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="font-serif tracking-tighter text-4xl text-espresso mb-2">
              Upgrade to Pro
            </h1>
            <p className="font-sans text-sm text-espresso/60">
              Unlimited meal plan generations, starting today.
            </p>
          </div>

          <div className="bg-white border border-rose/30 rounded-3xl p-8 shadow-sm">
            <UpgradeForm
              priceId={selected.priceId}
              planLabel={selected.label}
              priceLabel={selected.priceLabel}
            />
          </div>

          <p className="text-center mt-6 text-sm font-sans text-espresso/40">
            <a href="/pricing" className="hover:text-espresso transition-colors underline underline-offset-2">
              Compare plans
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
