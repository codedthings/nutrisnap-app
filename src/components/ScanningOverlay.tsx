import React, { useState, useEffect } from 'react';
import { Sparkles, Scan, Loader2, Utensils } from 'lucide-react';

interface ScanningOverlayProps {
  imagePreview: string;
}

const SCAN_STEPS = [
  'Detecting visible ingredients & portions...',
  'Estimating preparation method & cooking oils...',
  'Calculating precise calories & macronutrients...',
  'Evaluating micronutrient density & health score...',
  'Finalizing personalized dietary insights...',
];

export const ScanningOverlay: React.FC<ScanningOverlayProps> = ({ imagePreview }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % SCAN_STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 flex flex-col items-center justify-center space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-pulse">
          <Scan className="w-3.5 h-3.5" />
          NutriSnap AI Vision Scanner
        </div>
        <h2 className="text-2xl font-bold text-white">Analyzing Your Meal</h2>
        <p className="text-slate-400 text-xs">Gemini 3.8 Flash is inspecting the portion & ingredients</p>
      </div>

      {/* Scanned Image with laser scanning animation */}
      <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/20 bg-slate-950">
        <img
          src={imagePreview}
          alt="Scanned Meal"
          className="w-full h-full object-cover filter brightness-95"
        />

        {/* Shading overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-slate-950/60 pointer-events-none" />

        {/* Laser Scanning Beam Line */}
        <div
          className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce pointer-events-none"
          style={{ animationDuration: '2.4s' }}
        />

        {/* Viewfinder crosshairs */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400" />

        {/* Center reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 rounded-full border border-emerald-400/40 flex items-center justify-center animate-spin" style={{ animationDuration: '8s' }}>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400" />
          </div>
        </div>

        {/* Ingredient detection tags that float */}
        <div className="absolute top-6 left-6 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-semibold text-emerald-300 flex items-center gap-1.5 shadow-lg">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          Portion Recognition
        </div>

        <div className="absolute bottom-6 right-6 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-[10px] font-semibold text-cyan-300 flex items-center gap-1.5 shadow-lg">
          <Utensils className="w-3 h-3 text-cyan-400" />
          Macro Breakdown
        </div>
      </div>

      {/* Animated Step indicator */}
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate">
              {SCAN_STEPS[currentStepIndex]}
            </div>
            <div className="text-[10px] text-slate-400">Step {currentStepIndex + 1} of {SCAN_STEPS.length}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${((currentStepIndex + 1) / SCAN_STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
