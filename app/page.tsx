import Link from "next/link";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

const FEATURES = [
  {
    emoji: "✨",
    title: "Meal Planning",
    description:
      "Tell shef what you love to eat and it builds your week — balanced, beautiful, and entirely yours.",
  },
  {
    emoji: "🛒",
    title: "Smart Grocery Lists",
    description:
      "Every ingredient, perfectly consolidated by category. Copy it, print it, check it off as you shop.",
  },
  {
    emoji: "🥗",
    title: "Nutrition at a Glance",
    description:
      "See calories, protein, carbs, and more for every meal — broken down daily and weekly.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 sm:py-32 text-center relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-rose/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-sage/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          {/* Pre-headline badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cream border border-rose/40 rounded-full text-xs font-sans font-medium text-espresso/70 mb-8 shadow-sm">
            <span>🌿</span>
            No sign-up required — start planning in seconds
          </div>

          {/* Headline */}
          <h1 className="font-serif tracking-tighter text-5xl sm:text-6xl lg:text-7xl text-espresso leading-tight mb-6">
            Your week,{" "}
            <span className=" text-rose-dark">beautifully</span>{" "}
            planned.
          </h1>

          <p className="text-lg sm:text-xl text-espresso/60 font-sans leading-relaxed max-w-xl mx-auto mb-10">
            shef turns your favorite meals into a full week plan — complete with a smart grocery list and nutrition breakdown. No account needed to start.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/plan/new"
              className="inline-flex items-center gap-3 px-8 py-4 bg-espresso text-cream font-sans font-semibold text-base rounded-2xl hover:bg-espresso-light transition-all hover:-translate-y-1 hover:shadow-lg shadow-espresso/20 shadow-md"
            >
              <span className="text-xl">✨</span>
              Start Planning — No Sign Up Needed
            </Link>
            <p className="text-sm text-espresso/40 font-sans">Free forever. No credit card.</p>
          </div>
        </div>

        {/* Hero illustration */}
        <div className="mt-16 sm:mt-24 max-w-4xl w-full mx-auto">
          <div className="relative bg-white/60 backdrop-blur border border-rose/20 rounded-3xl shadow-xl p-6 sm:p-8">
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-sans font-semibold text-espresso/40 uppercase tracking-wider py-1"
                >
                  {d}
                </div>
              ))}
              {/* Sample meal cells */}
              {DEMO_MEALS.map((meal, i) => (
                <div
                  key={i}
                  className={[
                    "rounded-lg p-2 text-center text-[10px] font-sans leading-tight",
                    meal.empty
                      ? "border-2 border-dashed border-rose/20"
                      : "bg-white border border-rose/30 shadow-sm",
                  ].join(" ")}
                >
                  {!meal.empty && (
                    <span className="text-espresso/70 line-clamp-2">{meal.title}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-espresso/50 font-sans">
                21 meals · 3 days filled
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-espresso text-cream text-xs font-sans font-semibold rounded-xl">
                ✨ Generate My Week
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-linen/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl text-espresso mb-4">
              Everything you need, nothing you don&apos;t.
            </h2>
            <p className="text-espresso/60 font-sans text-lg">
              Built for people who love food but are busy living.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="bg-cream rounded-2xl p-8 border border-rose/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="text-4xl mb-5">{feature.emoji}</div>
                <h3 className="font-serif text-xl text-espresso mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-espresso/60 font-sans leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Final CTA */}
      <section className="py-24 px-6 text-center bg-espresso text-cream">
        <div className="max-w-xl mx-auto">
          <div className="text-5xl mb-6">🌿</div>
          <h2 className="font-serif text-4xl text-cream mb-4">
            Ready to plan something delicious?
          </h2>
          <p className="text-cream/60 font-sans mb-8 text-lg">
            Start in 30 seconds. No account. No friction. Just a beautiful week ahead.
          </p>
          <Link
            href="/plan/new"
            className="inline-flex items-center gap-3 px-8 py-4 bg-rose text-espresso font-sans font-semibold text-base rounded-2xl hover:bg-rose-light transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <span>✨</span>
            Start Planning Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Demo meal grid data
const DEMO_MEALS = [
  { title: "Avocado toast", empty: false },
  { title: "", empty: true },
  { title: "Greek yogurt bowl", empty: false },
  { title: "", empty: true },
  { title: "Smoothie", empty: false },
  { title: "Eggs & sourdough", empty: false },
  { title: "", empty: true },

  { title: "Caesar salad", empty: false },
  { title: "Grain bowl", empty: false },
  { title: "", empty: true },
  { title: "Leftovers", empty: false },
  { title: "Soup & bread", empty: false },
  { title: "", empty: true },
  { title: "Brunch out", empty: false },

  { title: "", empty: true },
  { title: "Pasta arrabbiata", empty: false },
  { title: "Roast chicken", empty: false },
  { title: "Thai curry", empty: false },
  { title: "", empty: true },
  { title: "Salmon & veg", empty: false },
  { title: "Roast dinner", empty: false },
];


