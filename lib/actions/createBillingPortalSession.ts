"use server";

import { redirect } from "next/navigation";
import { stripe } from "../stripe/stripe";
import { getOrCreateDbUser } from "../utils/getOrCreateDbUser";

export async function createBillingPortalSession() {
  const user = await getOrCreateDbUser();
  if (!user) redirect("/sign-in");

  if (!user.stripeCustomerId) {
    redirect("/pricing");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  redirect(session.url);
}
