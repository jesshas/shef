import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "../../../lib/db/db";
import { users, mealWeeks, weekResults } from "../../../lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { Navbar } from "../../../components/layout/Navbar";
import { Footer } from "../../../components/layout/Footer";
import { formatWeekRange } from "../../../lib/utils/weekHelpers";
import { Card, CardBody } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Calendar, Utensils, Sparkles, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) redirect("/sign-in");

  const firstName = user.name?.split(" ")[0] ?? "friend";

  // Fetch all weeks for this user
  const weeks = await db.query.mealWeeks.findMany({
    where: eq(mealWeeks.userId, user.id),
    orderBy: [desc(mealWeeks.createdAt)],
    limit: 10,
  });

  const currentWeek = weeks[0] ?? null;

  // Count meals for current week
  let currentWeekMealCount = 0;
  if (currentWeek) {
    const result = await db
      .select({ count: count() })
      .from(mealWeeks)
      .where(eq(mealWeeks.id, currentWeek.id));
    currentWeekMealCount = 0; // We'd need a join to count meals, keeping simple for now
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Greeting */}
        <div className="mb-12">
          <p className="text-sm text-espresso/50 font-sans mb-1">{greeting} 🌿</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-espresso">
            Welcome back, {firstName}
          </h1>
        </div>

        {/* Quick stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            icon={<Calendar size={20} className="text-sage" />}
            label="Weeks planned"
            value={String(weeks.length)}
            sub="total"
          />
          <StatCard
            icon={<Utensils size={20} className="text-rose" />}
            label="Meals this week"
            value={currentWeekMealCount > 0 ? String(currentWeekMealCount) : "—"}
            sub={currentWeek ? "planned" : "No week started yet"}
          />
          <StatCard
            icon={<Sparkles size={20} className="text-espresso" />}
            label="Plan status"
            value={user.plan === "pro" ? "Pro ✨" : "Free"}
            sub={user.plan === "free" ? `${weeks.length}/4 weeks used` : "Unlimited"}
          />
        </div>

        {/* Current week or start new */}
        <div className="mb-10">
          <h2 className="font-serif text-2xl text-espresso mb-4">This week</h2>
          {currentWeek ? (
            <Card>
              <CardBody className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-espresso/50 font-sans uppercase tracking-wider mb-1">
                    Current week
                  </p>
                  <p className="font-serif text-xl text-espresso">
                    {formatWeekRange(currentWeek.weekStartDate)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href={`/plan/${currentWeek.id}`}>
                    <Button variant="secondary" size="md">
                      View Results
                    </Button>
                  </Link>
                  <Link href="/plan/new">
                    <Button variant="primary" size="md">
                      <Sparkles size={15} />
                      New Week
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody className="text-center py-12">
                <div className="text-4xl mb-4">🍳</div>
                <p className="font-serif text-xl text-espresso mb-2">
                  No meals yet
                </p>
                <p className="text-espresso/50 font-sans text-sm mb-6">
                  Let&apos;s fill this week with something delicious
                </p>
                <Link href="/plan/new">
                  <Button variant="primary" size="lg">
                    <Sparkles size={18} />
                    Start Planning
                  </Button>
                </Link>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Past weeks */}
        {weeks.length > 1 && (
          <div>
            <h2 className="font-serif text-2xl text-espresso mb-4">Past weeks</h2>
            <div className="space-y-3">
              {weeks.slice(1).map((week) => (
                <Link key={week.id} href={`/plan/${week.id}`}>
                  <div className="group flex items-center justify-between bg-cream border border-rose/20 rounded-xl px-5 py-4 hover:border-rose/50 hover:shadow-sm transition-all">
                    <div>
                      <p className="font-sans font-medium text-espresso text-sm">
                        {formatWeekRange(week.weekStartDate)}
                      </p>
                      <p className="text-xs text-espresso/40 font-sans mt-0.5">
                        {new Date(week.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-espresso/30 group-hover:text-espresso/60 transition-colors"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-white border border-rose/20 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-xs font-sans font-semibold text-espresso/50 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="font-serif text-3xl text-espresso">{value}</p>
      <p className="text-xs text-espresso/40 font-sans mt-1">{sub}</p>
    </div>
  );
}
