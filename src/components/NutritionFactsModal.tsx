import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { MealAnalysisResult } from '../types/nutrition';

interface NutritionFactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: MealAnalysisResult | null;
}

export const NutritionFactsModal: React.FC<NutritionFactsModalProps> = ({
  isOpen,
  onClose,
  analysis,
}) => {
  if (!isOpen || !analysis) return null;

  const totalFat = analysis.macros.fat.grams;
  const fatDV = Math.round((totalFat / 78) * 100);

  const carbs = analysis.macros.carbs.grams;
  const carbsDV = Math.round((carbs / 275) * 100);

  const fiber = analysis.macros.fiber?.grams || 0;
  const fiberDV = Math.round((fiber / 28) * 100);

  const sodium = analysis.macros.sodium?.milligrams || 0;
  const sodiumDV = Math.round((sodium / 2300) * 100);

  const protein = analysis.macros.protein.grams;
  const proteinDV = Math.round((protein / 50) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-300">Standardized Nutrition Facts</div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nutrition Facts Label Container */}
        <div className="p-4 overflow-y-auto">
          <div className="bg-white text-black p-4 rounded-xl font-sans border-2 border-black">
            {/* Title */}
            <h1 className="text-3xl font-black tracking-tight leading-none">Nutrition Facts</h1>
            <div className="text-xs font-medium border-b border-black pb-1 mt-1">
              Serving size: <span className="font-bold">{analysis.estimatedPortion}</span>
            </div>

            {/* Calories section */}
            <div className="border-b-8 border-black py-2">
              <div className="text-[11px] font-bold">Amount Per Serving</div>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-2xl font-black">Calories</span>
                <span className="text-4xl font-black">{analysis.totalCalories}</span>
              </div>
            </div>

            {/* Daily Value Header */}
            <div className="text-right text-[10px] font-bold border-b border-black py-1">
              % Daily Value*
            </div>

            {/* Nutrients List */}
            <div className="divide-y divide-black/20 text-xs">
              <div className="py-1 flex justify-between">
                <span>
                  <strong className="font-extrabold">Total Fat</strong> {totalFat}g
                </span>
                <strong className="font-bold">{fatDV}%</strong>
              </div>

              <div className="py-1 flex justify-between">
                <span>
                  <strong className="font-extrabold">Sodium</strong> {sodium}mg
                </span>
                <strong className="font-bold">{sodiumDV}%</strong>
              </div>

              <div className="py-1 flex justify-between">
                <span>
                  <strong className="font-extrabold">Total Carbohydrate</strong> {carbs}g
                </span>
                <strong className="font-bold">{carbsDV}%</strong>
              </div>

              <div className="py-0.5 pl-4 flex justify-between text-slate-700">
                <span>Dietary Fiber {fiber}g</span>
                <span className="font-bold">{fiberDV}%</span>
              </div>

              <div className="py-0.5 pl-4 flex justify-between text-slate-700">
                <span>Total Sugars {analysis.macros.sugar?.grams || 0}g</span>
                <span></span>
              </div>

              <div className="py-1 flex justify-between border-b-4 border-black">
                <span>
                  <strong className="font-extrabold">Protein</strong> {protein}g
                </span>
                <strong className="font-bold">{proteinDV}%</strong>
              </div>
            </div>

            {/* Footer note */}
            <div className="text-[9px] text-slate-600 leading-tight pt-2">
              * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet of 2,000 calories a day used for general nutrition advice.
            </div>
          </div>
        </div>

        {/* Modal Close Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
          >
            Close Label
          </button>
        </div>
      </div>
    </div>
  );
};
