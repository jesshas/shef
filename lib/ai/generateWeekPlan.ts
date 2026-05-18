import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { MealInput, WeekResults } from "../validations/schemas";
import { weekResultsSchema } from "../validations/schemas";

// ---------------------------------------------------------------------------
// Provider selection
// ---------------------------------------------------------------------------

type Provider = "anthropic" | "openai";

function getProvider(): Provider {
  const p = process.env.AI_PROVIDER?.toLowerCase();
  if (p === "openai") return "openai";
  return "anthropic";
}

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

// ---------------------------------------------------------------------------
// Shared prompt builders
// ---------------------------------------------------------------------------

function nutritionPrompt(mealsText: string, preferencesText: string, servingSize: number): string {
  const servingNote = servingSize > 1
    ? `This meal plan is for ${servingSize} people. Estimate nutrition per person (i.e. per 1 serving out of ${servingSize}).`
    : "Estimate nutrition per serving (1 person).";
  return `For each of these meals, estimate the nutritional information per serving. If a recipe URL is provided, use it for accuracy. If estimating without a URL, set isEstimate to true.

${servingNote}

Meals:
${mealsText}

Dietary preferences: ${preferencesText}

Return ONLY valid JSON with no markdown, no explanation, just the JSON object:
{
  "mealNutrition": [
    {
      "mealId": "the meal's ID from the list above",
      "title": "meal title",
      "calories": number,
      "protein": number (grams),
      "carbs": number (grams),
      "fat": number (grams),
      "fiber": number (grams),
      "sugar": number (grams),
      "sodium": number (milligrams),
      "isEstimate": boolean
    }
  ]
}`;
}

function groceryPrompt(mealsText: string, preferencesText: string, servingSize: number): string {
  const servingNote = servingSize > 1
    ? `This meal plan is for ${servingSize} people. Scale all ingredient quantities accordingly.`
    : "This meal plan is for 1 person.";
  return `Given these meals for the week, generate a consolidated grocery list grouped by category. Combine duplicate ingredients and consolidate quantities. Respect dietary preferences.

${servingNote}

Meals:
${mealsText}

Dietary preferences: ${preferencesText}

Return ONLY valid JSON with no markdown, no explanation, just the JSON object:
{
  "categories": [
    {
      "name": "category name (e.g. Produce, Protein, Dairy, Pantry, Frozen, Other)",
      "items": [
        {
          "name": "ingredient name",
          "quantity": "amount as string (e.g. '2', '1/2')",
          "unit": "unit (e.g. 'lbs', 'cups', 'oz', 'cloves', 'each')"
        }
      ]
    }
  ]
}`;
}

function recipeUrlPrompt(url: string): string {
  return `Given this recipe URL: ${url}

Extract the recipe information and return ONLY valid JSON:
{
  "title": "recipe name",
  "servings": number,
  "nutrition": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number
  }
}

If you cannot access the URL or determine the information, return null for each field.`;
}

function recipeDetailsPrompt(title: string, recipeUrl?: string, notes?: string): string {
  const context = [
    recipeUrl ? `Recipe URL: ${recipeUrl}` : null,
    notes ? `Notes: ${notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `Generate a concise recipe for: "${title}"
${context}

Return ONLY valid JSON, no markdown:
{
  "ingredients": [
    "quantity + unit + ingredient (e.g. '2 cups all-purpose flour')"
  ],
  "steps": [
    "Brief step (1-2 sentences)"
  ]
}

Requirements:
- 6–12 ingredients
- 4–7 steps, each 1–2 sentences, practical and actionable
- Match the dish — don't invent unrelated ingredients
- If a URL was provided, use exact recipe from URL.`;
}

export interface RecipeDetails {
  ingredients: string[];
  steps: string[];
}

export async function generateRecipeDetails(
  title: string,
  recipeUrl?: string,
  notes?: string
): Promise<RecipeDetails> {
  const text = await complete(recipeDetailsPrompt(title, recipeUrl, notes));
  const parsed = JSON.parse(text) as RecipeDetails;
  if (!Array.isArray(parsed.ingredients) || !Array.isArray(parsed.steps)) {
    throw new Error("Invalid recipe details response");
  }
  return parsed;
}

// ---------------------------------------------------------------------------
// Provider-specific completions
// ---------------------------------------------------------------------------

async function completeWithAnthropic(prompt: string): Promise<string> {
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}

async function completeWithOpenAI(prompt: string): Promise<string> {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  return response.choices[0]?.message?.content ?? "";
}

async function complete(prompt: string): Promise<string> {
  const provider = getProvider();
  return provider === "openai"
    ? completeWithOpenAI(prompt)
    : completeWithAnthropic(prompt);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface GenerateWeekPlanInput {
  meals: MealInput[];
  dietaryPreferences?: string[];
  servingSize?: number;
}

/**
 * Generate a full week plan: nutrition per meal + grocery list.
 * Runs two parallel AI calls for speed. Supports Anthropic and OpenAI.
 */
export async function generateWeekPlan(
  input: GenerateWeekPlanInput
): Promise<WeekResults> {
  const { meals, dietaryPreferences = [], servingSize = 1 } = input;

  const mealsText = meals
    .map(
      (m) =>
        `- [ID: ${m.id}] ${m.dayOfWeek} ${m.mealType}: "${m.title}"${
          m.recipeUrl ? ` (recipe: ${m.recipeUrl})` : ""
        }${m.notes ? ` — Notes: ${m.notes}` : ""}`
    )
    .join("\n");

  const preferencesText =
    dietaryPreferences.length > 0
      ? dietaryPreferences.join(", ")
      : "no specific restrictions";

  const [nutritionText, groceryText] = await Promise.all([
    complete(nutritionPrompt(mealsText, preferencesText, servingSize)),
    complete(groceryPrompt(mealsText, preferencesText, servingSize)),
  ]);

  const nutritionData = JSON.parse(nutritionText);
  const groceryData = JSON.parse(groceryText);

  return weekResultsSchema.parse({
    mealNutrition: nutritionData.mealNutrition,
    categories: groceryData.categories,
  });
}

/**
 * Parse a recipe URL to extract name, servings, and estimated macros.
 */
export async function parseRecipeUrl(url: string) {
  const text = await complete(recipeUrlPrompt(url));
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
