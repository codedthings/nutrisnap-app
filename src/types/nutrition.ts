export interface MacroNutrient {
  grams: number;
  percentage: number;
}

export interface MacroBreakdown {
  protein: MacroNutrient;
  carbs: MacroNutrient;
  fat: MacroNutrient;
  fiber: {
    grams: number;
  };
  sugar: {
    grams: number;
  };
  sodium: {
    milligrams: number;
  };
}

export interface IngredientItem {
  id?: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthRating: 'high' | 'moderate' | 'indulgent';
  notes?: string;
}

export interface MealAnalysisResult {
  id: string;
  mealName: string;
  cuisineType: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  estimatedPortion: string;
  totalCalories: number;
  confidenceScore: number;
  healthScore: number; // 1-100
  glycemicImpact: 'Low' | 'Medium' | 'High';
  macros: MacroBreakdown;
  ingredients: IngredientItem[];
  dietaryTags: string[];
  insights: string[];
  allergenWarnings: string[];
  timestamp: string;
  imageUrl?: string;
  notes?: string;
  portionMultiplier?: number;
}

export interface DailyNutritionGoals {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  waterMl?: number;
}

export interface LoggedMeal extends MealAnalysisResult {
  loggedAt: string;
  dateKey: string; // YYYY-MM-DD
}

export interface SampleMeal {
  id: string;
  name: string;
  category: 'Breakfast' | 'Salad' | 'Bowl' | 'Comfort' | 'Snack';
  calories: number;
  imageUrl: string;
  description: string;
  sampleAnalysis: MealAnalysisResult;
}
