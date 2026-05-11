# Shef 🌿

AI-powered weekly meal planning that feels like a beautiful recipe journal — not a clinical SaaS dashboard.

Plan your week, get a smart consolidated grocery list, and see your nutrition at a glance. No sign-up required to start.

---

## Features

- **No sign-up wall** — start planning immediately as a guest; results are fully usable without an account
- **AI generation** — one click produces a full week of meals, a nutrition breakdown, and a consolidated grocery list (via Claude or GPT-4o)
- **Duplicate meals & quick-add** — copy any meal to another slot; add Leftovers in one hover click
- **Guest → account import** — sign up after planning and your week is automatically saved
- **Dietary preferences** — set vegetarian, vegan, gluten-free, dairy-free, low-carb, or high-protein; passed to the AI on every generation
- **Saved recipes** — bookmark meals with tag filtering (4 free, Pro unlimited)
- **Mobile-friendly** — responsive grid; iOS & Android install-to-home-screen prompt

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, Turbopack) |
| Styling | Tailwind CSS v4 with custom design tokens |
| Auth | Clerk (optional — only required to persist data) |
| Database | Neon (PostgreSQL) + Drizzle ORM |
| AI | Anthropic Claude (`claude-sonnet-4-6`) or OpenAI (`gpt-4o`) |
| Toasts | Sonner |
| Icons | Lucide React |
| Validation | Zod |

---

## Getting started

### Prerequisites

- **Node.js 20.9+** (recommend 22 via `nvm use 22`)
- A [Neon](https://neon.tech) database
- An [Anthropic](https://console.anthropic.com) or [OpenAI](https://platform.openai.com) API key
- A [Clerk](https://clerk.com) app (or use keyless dev mode — Clerk starts automatically without keys in local dev)

### 1. Clone & install

```bash
git clone https://github.com/jesshas/shef.git
cd shef
npm install
```

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon connection string (postgres://...) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | No* | Clerk publishable key |
| `CLERK_SECRET_KEY` | No* | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | No* | Clerk webhook signing secret |
| `AI_PROVIDER` | No | `anthropic` (default) or `openai` |
| `ANTHROPIC_API_KEY` | No** | Required if `AI_PROVIDER=anthropic` |
| `OPENAI_API_KEY` | No** | Required if `AI_PROVIDER=openai` |
| `OPENAI_MODEL` | No | Override OpenAI model (default: `gpt-4o`) |
| `ANTHROPIC_MODEL` | No | Override Claude model (default: `claude-sonnet-4-6`) |

\* Clerk runs in keyless dev mode locally if omitted — auth is fully functional without API keys in development.  
\*\* AI generation returns a friendly error toast if no key is configured.

### 3. Push database schema

```bash
npx drizzle-kit push
```

### 4. Run

```bash
nvm use 22    # ensure Node 20.9+
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## AI provider

Switch between Anthropic and OpenAI with one env var:

```bash
# Default — Anthropic Claude
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini   # optional, defaults to gpt-4o
```

Both providers run nutrition and grocery list generation in parallel for speed.

---

## Database commands

```bash
npx drizzle-kit push       # Push schema directly (dev)
npx drizzle-kit generate   # Generate migration files
npx drizzle-kit migrate    # Run pending migrations
npx drizzle-kit studio     # Open Drizzle Studio UI
```

---

## Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/plan/new` | Public | Weekly meal planner (guests welcome) |
| `/plan/[weekId]` | Auth | Saved week view |
| `/dashboard` | Auth | User home — stats and past weeks |
| `/recipes` | Auth | Saved recipe bookmarks |
| `/settings` | Auth | Account profile + dietary preferences |

---

## Clerk webhook (production)

In your Clerk dashboard, create a webhook pointing to:

```
https://your-domain.com/api/webhooks/clerk
```

Subscribe to: `user.created`, `user.updated`, `user.deleted`

Copy the signing secret into `CLERK_WEBHOOK_SECRET` in your production environment.

---

## Project structure

```
app/
  page.tsx                     # Landing page
  plan/new/page.tsx            # Planner (guests + signed-in)
  plan/[weekId]/page.tsx       # Saved week view
  (auth)/dashboard/            # Dashboard
  (auth)/recipes/              # Saved recipes
  (auth)/settings/             # Settings
  api/webhooks/clerk/route.ts  # Clerk → Neon user sync

components/
  ui/                          # Button, Card, SlideOver, Badge, Input, Accordion
  meal-grid/                   # WeekGrid, MealCell, MealSlideOver
  results/                     # NutritionSummary, GroceryList, DayByDayBreakdown
  recipes/                     # RecipeCard, SaveRecipePanel, UpgradePrompt
  layout/                      # Navbar, Footer, MobileInstallBanner

lib/
  db/                          # Drizzle schema + Neon client
  ai/                          # AI generation (Anthropic + OpenAI)
  actions/                     # Server actions
  guest/                       # localStorage helpers
  utils/                       # Macros, week helpers, limit checks
  validations/                 # Zod schemas

hooks/
  useWeekPlan.ts               # Meal state (guest + signed-in)
  useMealSlideOver.ts          # Slide-over open/close
  useGuestPlan.ts              # Auto-import guest plan on sign-in
```

---

## Deployment

### Vercel (recommended)

```bash
vercel deploy
```

Set all environment variables in **Vercel → Project Settings → Environment Variables**.

Make sure `DATABASE_URL` ends with `?sslmode=require` for Neon.

---

## Security notes

- `.env.local` and `.clerk/` are gitignored and will never be committed
- No API keys or secrets are hardcoded anywhere in the source
- See `.env.local.example` for a full list of required variables with placeholder values only

---

## License

MIT
