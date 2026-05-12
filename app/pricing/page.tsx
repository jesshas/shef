import { Check, Sparkles } from "lucide-react";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";

const FEATURES_FREE = [
  "4 AI-generated meal plans",
  "Nutrition summaries",
  "Grocery lists",
  "Save up to 4 plans",
];

const FEATURES_PRO = [
  "Unlimited AI meal plan generations",
  "Nutrition summaries",
  "Grocery lists",
  "Full plan history",
  "Dietary preference settings",
  "Priority support",
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="font-serif tracking-tighter text-5xl sm:text-6xl text-espresso mb-4">
            Simple pricing
          </h1>
          <p className="text-espresso/60 font-sans text-lg max-w-md mx-auto">
            Start free. Upgrade when you're ready for more. Shef users save over $500/year on groceries — and we think meal planning should be accessible to everyone.
          </p>
        </div>

        {/* Plans */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-white/60 border border-rose/30 rounded-3xl p-8">
            <div className="mb-6">
              <p className="font-sans text-sm font-semibold text-espresso/50 uppercase tracking-wider mb-2">
                Free
              </p>
              <div className="flex items-end gap-1">
                <span className="font-serif tracking-tighter text-5xl text-espresso">$0</span>
                <span className="text-espresso/50 font-sans text-sm mb-1.5">forever</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {FEATURES_FREE.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm font-sans text-espresso/70">
                  <Check size={16} className="text-sage-dark mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="/plan/new"
              className="block text-center w-full py-3.5 border border-espresso/20 text-espresso font-sans font-semibold text-sm rounded-2xl hover:bg-linen transition-colors"
            >
              Get started free
            </a>
          </div>

          {/* Pro */}
          <div className="bg-espresso border border-espresso rounded-3xl p-8 relative overflow-hidden">
            {/* subtle texture */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose to-transparent pointer-events-none" />

            <div className="relative mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-rose" />
                <p className="font-sans text-sm font-semibold text-rose/80 uppercase tracking-wider">
                  Pro
                </p>
              </div>

              {/* Monthly / Annual toggle handled via two separate forms */}
              <div className="space-y-1">
                <div className="flex items-end gap-1">
                  <span className="font-serif tracking-tighter text-5xl text-cream">$4.99</span>
                  <span className="text-cream/50 font-sans text-sm mb-1.5">/month</span>
                </div>
                <p className="text-cream/50 font-sans text-sm">
                  or <span className="text-cream/80 font-semibold">$49/year</span>{" "}
                  <span className="text-sage-light text-xs">(save 18%)</span>
                </p>
              </div>
            </div>

            <ul className="relative space-y-3 mb-8">
              {FEATURES_PRO.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm font-sans text-cream/80">
                  <Check size={16} className="text-sage-light mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="relative space-y-3">
              <a
                href="/upgrade?plan=monthly"
                className="block text-center w-full py-3.5 bg-cream text-espresso font-sans font-semibold text-sm rounded-2xl hover:bg-rose-light transition-colors"
              >
                Subscribe monthly — $4.99/mo
              </a>
              <a
                href="/upgrade?plan=annual"
                className="block text-center w-full py-3 text-cream/60 font-sans text-sm hover:text-cream transition-colors"
              >
                Subscribe annually — $49/yr
              </a>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-lg mx-auto space-y-6">
          <h2 className="font-serif tracking-tighter text-2xl text-espresso text-center mb-8">
            Questions
          </h2>
          {[
            {
              q: "Can I cancel anytime?",
              a: "Yes. Cancel from your account settings and you'll keep Pro access until the end of your billing period.",
            },
            {
              q: "What counts as a generation?",
              a: "Each time you generate a full 7-day meal plan counts as one generation.",
            },
            {
              q: "Do unused free generations roll over?",
              a: "Free plan generations don't reset — you get 4 total. Pro is unlimited.",
            },
          ].map(({ q, a }) => (
            <div key={q}>
              <p className="font-sans font-semibold text-espresso mb-1">{q}</p>
              <p className="font-sans text-sm text-espresso/60 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
