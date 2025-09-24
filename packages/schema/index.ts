import { z } from "zod";

/** Core "Thermomix JSON" */
export const Ingredient = z.object({
  name: z.string(),
  amount_g: z.number().nonnegative().optional(), // prefer grams
  amount_ml: z.number().nonnegative().optional(), // or mL
  note: z.string().optional()
});

export const Step = z.object({
  text: z.string(), // human text
  // machine hints for Guided Cooking mapping
  temperature_c: z.number().int().min(37).max(160).optional(),
  speed: z.union([z.number().min(0).max(10), z.literal("Turbo")]).optional(),
  time_s: z.number().int().min(0).optional(),
  mode: z.enum(["Stir", "Knead", "Whisk", "Blend", "Heat", "Weigh"]).optional(),
  safety: z.boolean().default(false)
});

export const Recipe = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  servings: z.number().int().min(1).max(12).default(2),
  total_time_min: z.number().int().min(0).default(0),
  ingredients: z.array(Ingredient),
  steps: z.array(Step).min(1),
  tags: z.array(z.string()).optional()
});

export type Recipe = z.infer<typeof Recipe>;