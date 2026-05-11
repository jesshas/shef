import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe/stripe";
import { getOrCreateDbUser } from "../../../../lib/utils/getOrCreateDbUser";
import { db } from "../../../../lib/db/db";
import { users } from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceId } = await req.json() as { priceId: string };
  if (!priceId) {
    return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
  }

  // Reuse or create Stripe customer
  let customerId = user.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { clerkId: user.clerkId, dbUserId: user.id },
    });
    customerId = customer.id;
    await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, user.id));
  }

  // Create an incomplete subscription — Stripe holds payment until confirmed
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.confirmation_secret"],
    metadata: { dbUserId: user.id },
  });

  const invoice = subscription.latest_invoice as import("stripe").Stripe.Invoice;
  const clientSecret = invoice.confirmation_secret?.client_secret;

  if (!clientSecret) {
    return NextResponse.json({ error: "Could not create payment intent" }, { status: 500 });
  }

  // Store the subscription ID immediately (status = incomplete until paid)
  await db
    .update(users)
    .set({ stripeSubscriptionId: subscription.id })
    .where(eq(users.id, user.id));

  return NextResponse.json({
    clientSecret,
    subscriptionId: subscription.id,
  });
}
