"use client";

import { createBillingPortalSession } from "../../../lib/actions/createBillingPortalSession";
import { Sparkles } from "lucide-react";

interface BillingSectionProps {
  plan: "free" | "pro";
  hasSubscription: boolean;
}

export function BillingSection({ plan, hasSubscription }: BillingSectionProps) {
  return (
    <section>
      <h2 className="font-serif tracking-tighter text-2xl text-espresso mb-1">Billing</h2>
      <p className="text-sm text-espresso/60 font-sans mb-6">
        Manage your plan and billing details.
      </p>

      <div className="border border-rose/30 rounded-2xl p-6 bg-white/40">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {plan === "pro" && (
                <Sparkles size={14} className="text-rose-dark" />
              )}
              <span className="font-sans font-semibold text-espresso">
                {plan === "pro" ? "Pro plan" : "Free plan"}
              </span>
              <span
                className={`text-xs font-sans px-2 py-0.5 rounded-full ${
                  plan === "pro"
                    ? "bg-sage/20 text-sage-dark"
                    : "bg-rose/20 text-espresso/60"
                }`}
              >
                {plan === "pro" ? "Active" : "4 generations"}
              </span>
            </div>
            <p className="text-sm text-espresso/60 font-sans">
              {plan === "pro"
                ? "You have unlimited AI generations."
                : "Upgrade to Pro for unlimited generations."}
            </p>
          </div>

          {plan === "pro" && hasSubscription ? (
            <form action={createBillingPortalSession}>
              <button
                type="submit"
                className="px-5 py-2.5 border border-espresso/20 text-espresso font-sans text-sm font-medium rounded-xl hover:bg-linen transition-colors"
              >
                Manage subscription
              </button>
            </form>
          ) : (
            <a
              href="/pricing"
              className="px-5 py-2.5 bg-espresso text-cream font-sans text-sm font-semibold rounded-xl hover:bg-espresso-light transition-colors"
            >
              Upgrade to Pro
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
