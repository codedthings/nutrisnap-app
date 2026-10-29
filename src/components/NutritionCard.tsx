import React, { useState } from 'react';
import {
  Flame,
  Award,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Plus,
  Trash2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  RotateCcw,
  Sliders,
  Share2,
  CalendarCheck
} from 'lucide-react';
import { MealAnalysisResult, DailyNutritionGoals, IngredientItem } from '../types/nutrition';
import { scaleMealAnalysis } from '../utils/nutritionCalculations';

interface NutritionCardProps {
  analysis: MealAnalysisResult;
  dailyGoals: DailyNutritionGoals;
  onLogMeal: (meal: MealAnalysisResult) => void;
  onOpenNutritionLabel: () => void;
  onResetScan: () => void;
  isLogged: boolean;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({
  analysis: initialAnalysis,
  dailyGoals,
  onLogMeal,
  onOpenNutritionLabel,
  onResetScan,
  isLogged,
}) => {
  const [multiplier, setMultiplier] = useState<number>(initialAnalysis.portionMultiplier || 1.0);
  const [activeIngredientIds, setActiveIngredientIds] = useState<string[]>(() =>
    initialAnalysis.ingredients.map((ing, idx) => ing.id || `ing-${idx}`)
  );
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientPortion, setNewIngredientPortion] = useState('');
  const [newIngredientCalories, setNewIngredientCalories] = useState('');
  const [newIngredientProtein, setNewIngredientProtein] = useState('');
  const [newIngredientCarbs, setNewIngredientCarbs] = useState('');
  const [newIngredientFat, setNewIngredientFat] = useState('');

  // Dynamically calculate current analysis based on multiplier and active ingredients
  const currentAnalysis = scaleMealAnalysis(initialAnalysis, multiplier, activeIngredientIds);

  const caloriePercentOfDaily = Math.round((currentAnalysis.totalCalories / dailyGoals.calories) * 100);

  // Toggle ingredient active state
  const toggleIngredient = (id: string) => {
    setActiveIngredientIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Add custom ingredient
  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredientName.trim() || !newIngredientCalories) return;

    const newId = `custom-ing-${Date.now()}`;
    const newIng: IngredientItem = {
      id: newId,
      name: newIngredientName.trim(),
      portion: newIngredientPortion.trim() || '1 serving',
      calories: Number(newIngredientCalories) || 0,
      protein: Number(newIngredientProtein) || 0,
      carbs: Number(newIngredientCarbs) || 0,
      fat: Number(newIngredientFat) || 0,
      healthRating: 'high',
      notes: 'Custom added item',
    };

    initialAnalysis.ingredients.push(newIng);
    setActiveIngredientIds((prev) => [...prev, newId]);
    setNewIngredientName('');
    setNewIngredientPortion('');
    setNewIngredientCalories('');
    setNewIngredientProtein('');
    setNewIngredientCarbs('');
    setNewIngredientFat('');
    setShowAddIngredient(false);
  };

  // Health Score badge styling
  const getHealthBadge = (score: number) => {
    if (score >= 85) return { label: 'Optimal Density', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 70) return { label: 'Nutritious & Balanced', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' };
    if (score >= 50) return { label: 'Moderate / Balanced', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Indulgent Treat', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const healthBadge = getHealthBadge(currentAnalysis.healthScore);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner / Meal Meta */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
          {/* Meal Photo Thumbnail */}
          {currentAnalysis.imageUrl && (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border-2 border-slate-800 shadow-md bg-slate-950 relative group">
              <img
                src={currentAnalysis.imageUrl}
                alt={currentAnalysis.mealName}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] text-slate-300 font-mono">
                {currentAnalysis.confidenceScore}% AI
              </span>
            </div>
          )}

          {/* Title & Tags */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                {currentAnalysis.mealType}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {currentAnalysis.cuisineType}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${healthBadge.color}`}>
                Score: {currentAnalysis.healthScore}/100 • {healthBadge.label}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {currentAnalysis.mealName}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
              <span>Estimated Serving: <strong className="text-slate-200">{currentAnalysis.estimatedPortion}</strong></span>
              <span>•</span>
              <span>Glycemic: <strong className="text-slate-200">{currentAnalysis.glycemicImpact}</strong></span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Calorie Highlight Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Big Calories Display */}
        <div className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Energy</span>
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>

          <div className="py-4 text-center">
            <div className="text-5xl sm:text-6xl font-black tracking-tight text-white flex items-baseline justify-center gap-1.5">
              <span>{currentAnalysis.totalCalories}</span>
              <span className="text-xl sm:text-2xl font-bold text-amber-400">kcal</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              <span className="font-bold text-emerald-400">{caloriePercentOfDaily}%</span> of your {dailyGoals.calories} kcal daily target
            </p>
          </div>

          {/* Quick Dietary Tags */}
          <div className="flex flex-wrap gap-1.5 justify-center pt-2">
            {currentAnalysis.dietaryTags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Macronutrient Triad */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Macronutrient Split</h3>
            <span className="text-xs text-slate-400 font-mono">
              Net Carbs: {Math.max(0, Math.round(currentAnalysis.macros.carbs.grams - (currentAnalysis.macros.fiber?.grams || 0)))}g
            </span>
          </div>

          {/* 3 Macro Columns */}
          <div className="grid grid-cols-3 gap-3">
            {/* Protein */}
            <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-3.5 text-center space-y-1">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">Protein</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {currentAnalysis.macros.protein.grams}<span className="text-xs font-normal text-slate-400">g</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {currentAnalysis.macros.protein.percentage}% ({Math.round(currentAnalysis.macros.protein.grams * 4)} kcal)
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{ width: `${Math.min(100, currentAnalysis.macros.protein.percentage)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-3.5 text-center space-y-1">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide">Carbs</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {currentAnalysis.macros.carbs.grams}<span className="text-xs font-normal text-slate-400">g</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {currentAnalysis.macros.carbs.percentage}% ({Math.round(currentAnalysis.macros.carbs.grams * 4)} kcal)
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{ width: `${Math.min(100, currentAnalysis.macros.carbs.percentage)}%` }}
                />
              </div>
            </div>

            {/* Fats */}
            <div className="bg-slate-950/80 border border-rose-500/20 rounded-2xl p-3.5 text-center space-y-1">
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wide">Fat</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {currentAnalysis.macros.fat.grams}<span className="text-xs font-normal text-slate-400">g</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {currentAnalysis.macros.fat.percentage}% ({Math.round(currentAnalysis.macros.fat.grams * 9)} kcal)
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-rose-400 h-full rounded-full"
                  style={{ width: `${Math.min(100, currentAnalysis.macros.fat.percentage)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Secondary Micro/Macro details */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-center">
            <div>
              <div className="text-[10px] text-slate-400">Dietary Fiber</div>
              <div className="text-xs font-bold text-slate-200">{currentAnalysis.macros.fiber?.grams || 0}g</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Sugars</div>
              <div className="text-xs font-bold text-slate-200">{currentAnalysis.macros.sugar?.grams || 0}g</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Sodium</div>
              <div className="text-xs font-bold text-slate-200">{currentAnalysis.macros.sodium?.milligrams || 0}mg</div>
            </div>
          </div>
        </div>
      </div>

      {/* Portion Size Multiplier / Adjustment Control */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Adjust Portion Size</h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {multiplier}x Serving
          </span>
        </div>

        {/* Quick Multiplier Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: '0.5x (Half)', val: 0.5 },
            { label: '0.75x', val: 0.75 },
            { label: '1.0x (Standard)', val: 1.0 },
            { label: '1.25x', val: 1.25 },
            { label: '1.5x (Large)', val: 1.5 },
            { label: '2.0x (Double)', val: 2.0 },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setMultiplier(item.val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                multiplier === item.val
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Multiplier Slider */}
        <div className="pt-2 flex items-center gap-3">
          <span className="text-xs text-slate-500">0.25x</span>
          <input
            type="range"
            min="0.25"
            max="3"
            step="0.05"
            value={multiplier}
            onChange={(e) => setMultiplier(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <span className="text-xs text-slate-500">3.0x</span>
        </div>
      </div>

      {/* Ingredient by Ingredient Breakdown (Interactive Checklist) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Ingredients Breakdown</span>
              <span className="text-xs text-slate-400 font-normal">
                ({currentAnalysis.ingredients.length} items detected)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Uncheck items you skipped (e.g. sauce, bun) to instantly adjust total calories.
            </p>
          </div>

          <button
            onClick={() => setShowAddIngredient(!showAddIngredient)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Item
          </button>
        </div>

        {/* Add Item Form Dropdown */}
        {showAddIngredient && (
          <form
            onSubmit={handleAddIngredient}
            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3"
          >
            <div className="text-xs font-semibold text-slate-300">Add Extra Food / Ingredient</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Ingredient name (e.g. Olive Oil, Cheddar, Rice)"
                value={newIngredientName}
                onChange={(e) => setNewIngredientName(e.target.value)}
                required
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
              />
              <input
                type="text"
                placeholder="Portion (e.g. 1 tbsp, 50g, 1 slice)"
                value={newIngredientPortion}
                onChange={(e) => setNewIngredientPortion(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="number"
                placeholder="Calories"
                value={newIngredientCalories}
                onChange={(e) => setNewIngredientCalories(e.target.value)}
                required
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
              />
              <input
                type="number"
                placeholder="Protein (g)"
                value={newIngredientProtein}
                onChange={(e) => setNewIngredientProtein(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
              />
              <input
                type="number"
                placeholder="Carbs (g)"
                value={newIngredientCarbs}
                onChange={(e) => setNewIngredientCarbs(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
              />
              <input
                type="number"
                placeholder="Fat (g)"
                value={newIngredientFat}
                onChange={(e) => setNewIngredientFat(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddIngredient(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Add to Meal
              </button>
            </div>
          </form>
        )}

        {/* List of Ingredients */}
        <div className="divide-y divide-slate-800/80">
          {currentAnalysis.ingredients.map((ing, idx) => {
            const ingId = ing.id || `ing-${idx}`;
            const isChecked = activeIngredientIds.includes(ingId);

            return (
              <div
                key={ingId}
                onClick={() => toggleIngredient(ingId)}
                className={`py-3 flex items-start gap-3 cursor-pointer group transition ${
                  isChecked ? 'opacity-100' : 'opacity-40 bg-slate-950/20'
                }`}
              >
                {/* Custom Checkbox */}
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                    isChecked
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                      : 'border-slate-600 group-hover:border-slate-500'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                {/* Ingredient details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-semibold text-white ${!isChecked ? 'line-through text-slate-500' : ''}`}>
                      {ing.name}
                    </span>
                    <span className="text-sm font-bold text-amber-400">
                      {ing.calories} kcal
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-0.5">
                    <span>{ing.portion}</span>
                    <span>•</span>
                    <span className="text-emerald-400">P: {ing.protein}g</span>
                    <span className="text-amber-400">C: {ing.carbs}g</span>
                    <span className="text-rose-400">F: {ing.fat}g</span>
                  </div>

                  {ing.notes && (
                    <div className="text-[11px] text-slate-400 mt-1 italic">
                      {ing.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dietitian Insights & Allergens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Insights */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
            <Lightbulb className="w-4 h-4" />
            Dietitian Insights
          </div>
          <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
            {currentAnalysis.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Allergen & Dietary Warnings */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            Allergens & Dietary Notes
          </div>
          {currentAnalysis.allergenWarnings && currentAnalysis.allergenWarnings.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {currentAnalysis.allergenWarnings.map((allergen, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium"
                >
                  {allergen}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No common allergens flagged in this meal.</p>
          )}

          <div className="pt-2 border-t border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1.5 font-semibold">Dietary Badges:</div>
            <div className="flex flex-wrap gap-1.5">
              {currentAnalysis.dietaryTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[11px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons Bar */}
      <div className="sticky bottom-4 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Scan Another Button */}
          <button
            onClick={onResetScan}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Scan Another
          </button>

          {/* Nutrition Facts Label Button */}
          <button
            onClick={onOpenNutritionLabel}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            Nutrition Label
          </button>
        </div>

        {/* Log to Diary Button */}
        <button
          onClick={() => onLogMeal(currentAnalysis)}
          disabled={isLogged}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 ${
            isLogged
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
              : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/25'
          }`}
        >
          {isLogged ? (
            <>
              <Check className="w-4 h-4" />
              Logged to Today's Diary!
            </>
          ) : (
            <>
              <CalendarCheck className="w-4 h-4" />
              Log to Daily Diary ({currentAnalysis.totalCalories} kcal)
            </>
          )}
        </button>
      </div>
    </div>
  );
};
