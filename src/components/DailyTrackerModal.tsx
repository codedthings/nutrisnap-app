import React, { useState } from 'react';
import {
  X,
  Flame,
  Trash2,
  Calendar,
  Settings,
  Plus,
  TrendingUp,
  Award,
  ChevronRight,
  Utensils
} from 'lucide-react';
import { LoggedMeal, DailyNutritionGoals } from '../types/nutrition';
import { MACRO_PRESETS } from '../utils/nutritionCalculations';

interface DailyTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  loggedMeals: LoggedMeal[];
  dailyGoals: DailyNutritionGoals;
  onUpdateGoals: (goals: DailyNutritionGoals) => void;
  onDeleteMeal: (mealId: string) => void;
  onSelectMeal: (meal: LoggedMeal) => void;
}

export const DailyTrackerModal: React.FC<DailyTrackerModalProps> = ({
  isOpen,
  onClose,
  loggedMeals,
  dailyGoals,
  onUpdateGoals,
  onDeleteMeal,
  onSelectMeal,
}) => {
  const [activeTab, setActiveTab] = useState<'diary' | 'goals'>('diary');

  // Goals edit state
  const [goalCalories, setGoalCalories] = useState(dailyGoals.calories);
  const [goalProtein, setGoalProtein] = useState(dailyGoals.protein);
  const [goalCarbs, setGoalCarbs] = useState(dailyGoals.carbs);
  const [goalFat, setGoalFat] = useState(dailyGoals.fat);

  if (!isOpen) return null;

  const todayKey = new Date().toISOString().split('T')[0];
  const todayMeals = loggedMeals.filter((m) => m.dateKey === todayKey);

  // Totals for today
  const totalCalories = todayMeals.reduce((acc, m) => acc + m.totalCalories, 0);
  const totalProtein = todayMeals.reduce((acc, m) => acc + m.macros.protein.grams, 0);
  const totalCarbs = todayMeals.reduce((acc, m) => acc + m.macros.carbs.grams, 0);
  const totalFat = todayMeals.reduce((acc, m) => acc + m.macros.fat.grams, 0);

  const remainingCalories = Math.max(0, dailyGoals.calories - totalCalories);
  const percentCalories = Math.min(100, Math.round((totalCalories / dailyGoals.calories) * 100));

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGoals({
      calories: Number(goalCalories),
      protein: Number(goalProtein),
      carbs: Number(goalCarbs),
      fat: Number(goalFat),
    });
    setActiveTab('diary');
  };

  const applyPreset = (preset: typeof MACRO_PRESETS[0]) => {
    setGoalCalories(preset.calories);
    setGoalProtein(preset.protein);
    setGoalCarbs(preset.carbs);
    setGoalFat(preset.fat);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Daily Calorie & Macro Tracker</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-5 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('diary')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'diary'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Today's Log ({todayMeals.length} meals)
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'goals'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Nutritional Targets
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'diary' ? (
            <>
              {/* Daily Progress Gauge Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Today's Balance</span>
                    <div className="text-3xl font-extrabold text-white mt-0.5">
                      {totalCalories} <span className="text-sm font-normal text-slate-400">/ {dailyGoals.calories} kcal</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Remaining</span>
                    <div className={`text-2xl font-bold ${remainingCalories === 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {remainingCalories} <span className="text-xs font-normal text-slate-400">kcal</span>
                    </div>
                  </div>
                </div>

                {/* Calorie bar */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentCalories > 100
                        ? 'bg-rose-500'
                        : percentCalories > 85
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${percentCalories}%` }}
                  />
                </div>

                {/* Macro Progress Bars */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                  {/* Protein */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-emerald-400">Protein</span>
                      <span className="text-white">{Math.round(totalProtein)}/{dailyGoals.protein}g</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{ width: `${Math.min(100, (totalProtein / dailyGoals.protein) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Carbs */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-amber-400">Carbs</span>
                      <span className="text-white">{Math.round(totalCarbs)}/{dailyGoals.carbs}g</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${Math.min(100, (totalCarbs / dailyGoals.carbs) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Fat */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-rose-400">Fat</span>
                      <span className="text-white">{Math.round(totalFat)}/{dailyGoals.fat}g</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-rose-400 h-full rounded-full"
                        style={{ width: `${Math.min(100, (totalFat / dailyGoals.fat) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Logged Meals List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Logged Meals ({todayMeals.length})</span>
                  <span>Calories</span>
                </div>

                {todayMeals.length === 0 ? (
                  <div className="bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-2">
                    <Utensils className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-300">No meals logged today yet</p>
                    <p className="text-xs text-slate-500">
                      Snap or upload a photo to calculate calories and save to your diary.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todayMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 flex items-center justify-between gap-3 group transition"
                      >
                        {/* Meal thumbnail & name */}
                        <div
                          onClick={() => {
                            onSelectMeal(meal);
                            onClose();
                          }}
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                        >
                          {meal.imageUrl ? (
                            <img
                              src={meal.imageUrl}
                              alt={meal.mealName}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 text-slate-500">
                              <Utensils className="w-5 h-5" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition">
                              {meal.mealName}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="capitalize">{meal.mealType}</span>
                              <span>•</span>
                              <span className="text-emerald-400">{meal.macros.protein.grams}g P</span>
                              <span className="text-amber-400">{meal.macros.carbs.grams}g C</span>
                              <span className="text-rose-400">{meal.macros.fat.grams}g F</span>
                            </div>
                          </div>
                        </div>

                        {/* Calories & delete */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-extrabold text-amber-400">{meal.totalCalories}</div>
                            <div className="text-[10px] text-slate-500">kcal</div>
                          </div>

                          <button
                            onClick={() => onDeleteMeal(meal.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
                            title="Remove meal from diary"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Nutritional Targets Settings Form */
            <form onSubmit={handleSaveGoals} className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Daily Target Preset</h3>
                <p className="text-xs text-slate-400">Choose a nutrition goal template or customize below:</p>
              </div>

              {/* Presets Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MACRO_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="p-3 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition space-y-1"
                  >
                    <div className="text-xs font-bold text-white">{preset.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{preset.description}</div>
                    <div className="text-[11px] font-mono font-semibold text-emerald-400 pt-1">
                      {preset.calories} kcal ({preset.protein}g P / {preset.carbs}g C / {preset.fat}g F)
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Inputs */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Daily Calorie Target (kcal)</label>
                  <input
                    type="number"
                    value={goalCalories}
                    onChange={(e) => setGoalCalories(Number(e.target.value))}
                    min="800"
                    max="6000"
                    required
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-emerald-400">Protein (g)</label>
                    <input
                      type="number"
                      value={goalProtein}
                      onChange={(e) => setGoalProtein(Number(e.target.value))}
                      min="20"
                      max="400"
                      required
                      className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-amber-400">Carbs (g)</label>
                    <input
                      type="number"
                      value={goalCarbs}
                      onChange={(e) => setGoalCarbs(Number(e.target.value))}
                      min="0"
                      max="600"
                      required
                      className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-rose-400">Fat (g)</label>
                    <input
                      type="number"
                      value={goalFat}
                      onChange={(e) => setGoalFat(Number(e.target.value))}
                      min="10"
                      max="300"
                      required
                      className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-95"
              >
                Save Daily Goals
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
