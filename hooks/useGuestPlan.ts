"use client";

import { useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  readGuestPlan,
  clearGuestPlan,
} from "../lib/guest/guestStorage";
import { saveGuestPlanAction } from "../lib/actions/saveGuestPlan";

/**
 * Hook that detects when a guest signs in and auto-saves their localStorage plan to DB.
 */
export function useGuestPlan() {
  const { isSignedIn, user } = useUser();

  const importGuestPlan = useCallback(async () => {
    const guestPlan = readGuestPlan();
    if (!guestPlan || guestPlan.meals.length === 0) return;

    const loadingToast = toast.loading("Saving your plan...", {
      description: "We're importing your meal plan to your account.",
    });

    try {
      const result = await saveGuestPlanAction(guestPlan);
      toast.dismiss(loadingToast);

      if (result.success) {
        clearGuestPlan();
        toast.success("Your plan has been saved! 🌿", {
          description: "You can access it anytime from your dashboard.",
        });
      } else {
        toast.error("Couldn't save your plan", {
          description: result.error,
        });
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Couldn't save your plan. Please try again.");
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      importGuestPlan();
    }
  }, [isSignedIn, importGuestPlan]);

  return { isGuest: !isSignedIn };
}
