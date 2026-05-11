"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, Lock } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface UpgradeFormProps {
  priceId: string;
  planLabel: string;
  priceLabel: string;
}

// Inner form — rendered inside <Elements>
function PaymentForm({ planLabel, priceLabel }: { planLabel: string; priceLabel: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?upgraded=true`,
      },
    });

    // confirmPayment redirects on success — only reaches here on error
    if (confirmError) {
      setError(confirmError.message ?? "Payment failed.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="font-sans text-sm font-semibold text-espresso/60 mb-1 uppercase tracking-wider">
          {planLabel}
        </p>
        <p className="font-serif tracking-tighter text-3xl text-espresso">{priceLabel}</p>
      </div>

      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {error && (
        <p className="text-sm font-sans text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3.5 bg-espresso text-cream font-sans font-semibold text-sm rounded-2xl hover:bg-espresso-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Lock size={14} />
        )}
        {loading ? "Processing..." : `Subscribe — ${priceLabel}`}
      </button>

      <p className="text-center text-xs font-sans text-espresso/40 flex items-center justify-center gap-1.5">
        <Lock size={10} />
        Secured by Stripe · Cancel anytime
      </p>
    </form>
  );
}

// Outer component — fetches clientSecret, then mounts Elements
export function UpgradeForm({ priceId, planLabel, priceLabel }: UpgradeFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stripe/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setFetchError(data.error ?? "Could not load payment form.");
        }
      })
      .catch(() => setFetchError("Network error. Please try again."));
  }, [priceId]);

  if (fetchError) {
    return (
      <p className="text-sm font-sans text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        {fetchError}
      </p>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-espresso/30" />
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "flat",
          variables: {
            colorPrimary: "#2C1A0E",
            colorBackground: "#FFFFFF",
            colorText: "#2C1A0E",
            colorDanger: "#dc2626",
            fontFamily: '"DM Sans", system-ui, sans-serif',
            borderRadius: "12px",
            spacingUnit: "5px",
          },
          rules: {
            ".Input": {
              border: "1px solid #E8C4B8",
              boxShadow: "none",
              padding: "12px 14px",
            },
            ".Input:focus": {
              border: "1px solid #2C1A0E",
              boxShadow: "none",
            },
            ".Label": {
              fontWeight: "500",
              fontSize: "13px",
              color: "#2C1A0E",
              opacity: "0.6",
            },
            ".Tab": {
              border: "1px solid #E8C4B8",
            },
            ".Tab--selected": {
              border: "1px solid #2C1A0E",
            },
          },
        },
      }}
    >
      <PaymentForm planLabel={planLabel} priceLabel={priceLabel} />
    </Elements>
  );
}
