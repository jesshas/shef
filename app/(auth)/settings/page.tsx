import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import { getOrCreateDbUser } from "../../../lib/utils/getOrCreateDbUser";
import { Navbar } from "../../../components/layout/Navbar";
import { Footer } from "../../../components/layout/Footer";
import { PreferencesForm } from "./PreferencesForm";

export default async function SettingsPage() {
  const user = await getOrCreateDbUser();
  if (!user) redirect("/sign-in");

  const preferences = (user.dietaryPreferences as string[]) ?? [];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1 className="font-serif tracking-tighter text-4xl text-espresso mb-2">Settings</h1>
          <p className="text-espresso/60 font-sans">
            Manage your account and preferences
          </p>
        </div>

        <div className="space-y-10">
          {/* Dietary preferences */}
          <section>
            <h2 className="font-serif tracking-tighter text-2xl text-espresso mb-1">
              Dietary Preferences
            </h2>
            <p className="text-sm text-espresso/60 font-sans mb-6">
              These are considered by shef when generating your meal plans.
            </p>
            <PreferencesForm currentPreferences={preferences} />
          </section>

          {/* Clerk UserProfile */}
          <section>
            <h2 className="font-serif tracking-tighter text-2xl text-espresso mb-6">
              Account
            </h2>
            <UserProfile
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-cream border border-rose/30 rounded-2xl shadow-none font-sans",
                  headerTitle: "font-serif tracking-tighter text-espresso",
                  headerSubtitle: "text-espresso/60",
                  formButtonPrimary:
                    "bg-espresso hover:bg-espresso-light text-cream font-sans rounded-xl",
                  formFieldInput:
                    "border-rose/30 rounded-xl font-sans bg-white focus:ring-rose",
                },
              }}
            />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
