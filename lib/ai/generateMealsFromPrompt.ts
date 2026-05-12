import type { MealInput } from "../validations/schemas";
import { DAYS_OF_WEEK, MEAL_TYPES } from "../validations/schemas";

// Re-use provider/client helpers from the existing module
type Provider = "anthropic" | "openai";

function getProvider(): Provider {
  return process.env.AI_PROVIDER?.toLowerCase() === "openai" ? "openai" : "anthropic";
}

async function complete(prompt: string): Promise<string> {
  const provider = getProvider();
  if (provider === "openai") {
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    return res.choices[0]?.message?.content ?? "";
  } else {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const res = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });
    return res.content[0].type === "text" ? res.content[0].text : "";
  }
}

export interface GeneratedMealSuggestion {
  dayOfWeek: typeof DAYS_OF_WEEK[number];
  mealType: typeof MEAL_TYPES[number];
  title: string;
  notes?: string;
}

function buildPrompt(userPrompt: string, dietaryPreferences: string[]): string {
  const prefsText =
    dietaryPreferences.length > 0
      ? dietaryPreferences.join(", ")
      : "no specific restrictions";

  return `You are a meal planning assistant. Based on the user's description and dietary preferences, suggest a full 7-day meal plan.

User's request:
${userPrompt}

Dietary preferences: ${prefsText}

Generate exactly 21 meals covering all 7 days (Monday–Sunday) and all 3 meal types (breakfast, lunch, dinner).

Requirements:
- Variety across the week (don't repeat meals)
- Practical, real recipe names (e.g. "Avocado toast with poached eggs", not "Healthy breakfast")
- Respect all dietary preferences strictly
- Match the user's stated preferences for cuisine, cooking time, skill level, etc.
- For notes, add a brief 1-sentence tip or substitution hint where useful (optional)

Return ONLY valid JSON, no markdown, no explanation:
{
  "meals": [
    {
      "dayOfWeek": "Monday",
      "mealType": "breakfast",
      "title": "meal name here",
      "notes": "optional tip"
    }
  ]
}

The "dayOfWeek" must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.
The "mealType" must be one of: breakfast, lunch, dinner.
Return all 21 meals.`;
}

export async function generateMealsFromPrompt(
  userPrompt: string,
  dietaryPreferences: string[] = []
): Promise<GeneratedMealSuggestion[]> {
  const text = await complete(buildPrompt(userPrompt, dietaryPreferences));

  let parsed: { meals: GeneratedMealSuggestion[] };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("AI returned invalid JSON for meal suggestions");
  }

  if (!Array.isArray(parsed.meals)) {
    throw new Error("AI response missing meals array");
  }

  // Validate and filter to only well-formed meals
  const valid = parsed.meals.filter(
    (m) =>
      DAYS_OF_WEEK.includes(m.dayOfWeek as typeof DAYS_OF_WEEK[number]) &&
      MEAL_TYPES.includes(m.mealType as typeof MEAL_TYPES[number]) &&
      typeof m.title === "string" &&
      m.title.length > 0
  );

  if (valid.length < 7) {
    throw new Error("AI returned too few valid meal suggestions");
  }

  return valid;
}
