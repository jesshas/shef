import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "../../../../lib/db/db";
import { users } from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string; id: string }[];
    first_name?: string | null;
    last_name?: string | null;
    primary_email_address_id?: string | null;
  };
};

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: ClerkWebhookEvent;
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookEvent;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id: clerkId, email_addresses, first_name, last_name, primary_email_address_id } = evt.data;

    const primaryEmail = primary_email_address_id
      ? email_addresses.find((e) => e.id === primary_email_address_id)?.email_address
      : email_addresses[0]?.email_address;

    if (!primaryEmail) {
      return new Response("No email found", { status: 400 });
    }

    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    if (evt.type === "user.created") {
      await db.insert(users).values({
        clerkId,
        email: primaryEmail,
        name,
      });
    } else {
      await db
        .update(users)
        .set({ email: primaryEmail, name })
        .where(eq(users.clerkId, clerkId));
    }
  }

  if (evt.type === "user.deleted") {
    const { id: clerkId } = evt.data;
    await db.delete(users).where(eq(users.clerkId, clerkId));
  }

  return new Response("OK", { status: 200 });
}
