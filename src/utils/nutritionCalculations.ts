import { MealAnalysisResult, IngredientItem } from '../types/nutrition';

export function scaleMealAnalysis(
  baseAnalysis: MealAnalysisResult,
  multiplier: number,
  activeIngredientIds?: string[]
): MealAnalysisResult {
  // Filter active ingredients if provided
  const ingredients = baseAnalysis.ingredients.map((ing, idx) => {
    const id = ing.id || `ing-${idx}`;
    return { ...ing, id };
  });

  const includedIngredients = activeIngredientIds
    ? ingredients.filter((ing) => activeIngredientIds.includes(ing.id!))
    : ingredients;

  // Calculate new totals based on included ingredients and multiplier
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  const scaledIngredients: IngredientItem[] = ingredients.map((ing) => {
    const isIncluded = activeIngredientIds ? activeIngredientIds.includes(ing.id!) : true;
    const ingCalories = Math.round(ing.calories * multiplier);
    const ingProtein = Math.round(ing.protein * multiplier * 10) / 10;
    const ingCarbs = Math.round(ing.carbs * multiplier * 10) / 10;
    const ingFat = Math.round(ing.fat * multiplier * 10) / 10;

    if (isIncluded) {
      totalCalories += ingCalories;
      totalProtein += ingProtein;
      totalCarbs += ingCarbs;
      totalFat += ingFat;
    }

    return {
      ...ing,
      calories: ingCalories,
      protein: ingProtein,
      carbs: ingCarbs,
      fat: ingFat,
    };
  });

  // Calculate macro percentages
  const totalMacroGrams = totalProtein + totalCarbs + totalFat || 1;
  const proteinPct = Math.round((totalProtein / totalMacroGrams) * 100);
  const carbsPct = Math.round((totalCarbs / totalMacroGrams) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

  const scaledFiber = Math.round((baseAnalysis.macros.fiber?.grams || 0) * multiplier * 10) / 10;
  const scaledSugar = Math.round((baseAnalysis.macros.sugar?.grams || 0) * multiplier * 10) / 10;
  const scaledSodium = Math.round((baseAnalysis.macros.sodium?.milligrams || 0) * multiplier);

  return {
    ...baseAnalysis,
    totalCalories: Math.max(0, totalCalories),
    portionMultiplier: multiplier,
    macros: {
      protein: { grams: Math.round(totalProtein * 10) / 10, percentage: proteinPct },
      carbs: { grams: Math.round(totalCarbs * 10) / 10, percentage: carbsPct },
      fat: { grams: Math.round(totalFat * 10) / 10, percentage: fatPct },
      fiber: { grams: scaledFiber },
      sugar: { grams: scaledSugar },
      sodium: { milligrams: scaledSodium },
    },
    ingredients: scaledIngredients,
  };
}

export const DEFAULT_DAILY_GOALS = {
  calories: 2000,
  protein: 130, // grams
  carbs: 220, // grams
  fat: 65, // grams
  waterMl: 2500,
};

export const MACRO_PRESETS = [
  {
    name: 'Balanced Wellness',
    description: '45% Carbs, 25% Protein, 30% Fat for sustained daily energy',
    calories: 2000,
    protein: 125,
    carbs: 225,
    fat: 65,
  },
  {
    name: 'Muscle Gain & Fitness',
    description: 'Higher protein intake to optimize recovery and lean muscle',
    calories: 2400,
    protein: 180,
    carbs: 240,
    fat: 80,
  },
  {
    name: 'Fat Loss & Deficit',
    description: 'Moderate calorie deficit prioritizing protein for satiety',
    calories: 1650,
    protein: 135,
    carbs: 140,
    fat: 55,
  },
  {
    name: 'Low Carb / Keto',
    description: 'Minimal carbs with healthy fats and adequate protein',
    calories: 1900,
    protein: 110,
    carbs: 35,
    fat: 145,
  },
];
