"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { captureWaitlistEmailAction } from "../../lib/actions/captureWaitlistEmail";
import { toast } from "sonner";

interface UpgradePromptProps {
  context?: "recipes" | "weeks";
}

export function UpgradePrompt({ context = "recipes" }: UpgradePromptProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const contextCopy = {
    recipes: "You've saved 4 recipes — you've reached the free limit.",
    weeks: "You've planned 4 weeks — you've reached the free limit.",
  }[context];

  async function handleJoinWaitlist() {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setIsLoading(true);
    try {
      const result = await captureWaitlistEmailAction({ email });
      if (result.success) {
        setSubmitted(true);
        toast.success("You're on the list! 🌿", {
          description: "We'll email you when Pro launches.",
        });
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="border-2 border-dashed border-rose/40 rounded-2xl p-8 text-center bg-rose-light/20">
        <div className="text-3xl mb-3">🌿</div>
        <p className="font-serif tracking-tighter text-lg text-espresso mb-1">You&apos;re on the list!</p>
        <p className="text-sm text-espresso/60 font-sans">
          We&apos;ll email {email} when Pro launches.
        </p>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-rose/40 rounded-2xl p-8 text-center bg-cream">
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 bg-linen rounded-2xl flex items-center justify-center">
          <Lock size={22} className="text-espresso/60" />
        </div>
      </div>
      <h3 className="font-serif tracking-tighter text-xl text-espresso mb-2">
        Unlock Unlimited — Pro Coming Soon
      </h3>
      <p className="text-sm text-espresso/60 font-sans mb-6 leading-relaxed max-w-sm mx-auto">
        {contextCopy} Join the waitlist to get early access to Pro — unlimited saves, history, and PDF export.
      </p>

      <div className="flex gap-2 max-w-sm mx-auto">
        <Input
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="flex-1"
        />
        <Button
          variant="primary"
          size="md"
          onClick={handleJoinWaitlist}
          isLoading={isLoading}
        >
          Join
        </Button>
      </div>
    </div>
  );
}
