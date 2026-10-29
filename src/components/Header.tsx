import React from 'react';
import { Utensils, Calendar, Settings, Flame, Camera } from 'lucide-react';
import { LoggedMeal, DailyNutritionGoals } from '../types/nutrition';

interface HeaderProps {
  loggedMeals: LoggedMeal[];
  dailyGoals: DailyNutritionGoals;
  onOpenDiary: () => void;
  onOpenGoals: () => void;
  onResetScan: () => void;
  isScanningOrViewingResult: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  loggedMeals,
  dailyGoals,
  onOpenDiary,
  onOpenGoals,
  onResetScan,
  isScanningOrViewingResult,
}) => {
  const todayKey = new Date().toISOString().split('T')[0];
  const todayMeals = loggedMeals.filter((m) => m.dateKey === todayKey);
  const totalCaloriesToday = todayMeals.reduce((acc, m) => acc + m.totalCalories, 0);
  const remainingCalories = Math.max(0, dailyGoals.calories - totalCaloriesToday);
  const percentConsumed = Math.min(100, Math.round((totalCaloriesToday / dailyGoals.calories) * 100));

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div
          onClick={onResetScan}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Utensils className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">Nutri<span className="text-emerald-400">Snap</span></span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AI Vision
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">Snap & calculate meal calories</p>
          </div>
        </div>

        {/* Daily Calorie Quick Summary & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Calorie Pill */}
          <button
            onClick={onOpenDiary}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-full transition text-xs font-medium"
            title="View today's calorie diary"
          >
            <div className="flex items-center gap-1 text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-white">{totalCaloriesToday}</span>
              <span className="text-slate-400 text-[11px]">/ {dailyGoals.calories} kcal</span>
            </div>
            <div className="w-10 bg-slate-700 h-1.5 rounded-full overflow-hidden hidden xs:block">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentConsumed > 100
                    ? 'bg-rose-500'
                    : percentConsumed > 80
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${percentConsumed}%` }}
              />
            </div>
          </button>

          {/* New Scan button if currently viewing a result */}
          {isScanningOrViewingResult && (
            <button
              onClick={onResetScan}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full font-semibold text-xs shadow-md shadow-emerald-500/20 transition active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Snap</span>
            </button>
          )}

          {/* Diary Button */}
          <button
            onClick={onOpenDiary}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition relative"
            aria-label="Meal Diary"
            title="Open Meal Diary"
          >
            <Calendar className="w-5 h-5" />
            {todayMeals.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center">
                {todayMeals.length}
              </span>
            )}
          </button>

          {/* Goals Settings Button */}
          <button
            onClick={onOpenGoals}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Nutritional Goals"
            title="Set Daily Calorie & Macro Goals"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
