/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { CameraCapture } from './components/CameraCapture';
import { ScanningOverlay } from './components/ScanningOverlay';
import { NutritionCard } from './components/NutritionCard';
import { DailyTrackerModal } from './components/DailyTrackerModal';
import { NutritionFactsModal } from './components/NutritionFactsModal';
import { MealAnalysisResult, LoggedMeal, DailyNutritionGoals, SampleMeal } from './types/nutrition';
import { DEFAULT_DAILY_GOALS } from './utils/nutritionCalculations';
import { AlertCircle, RotateCcw, Utensils, Sparkles } from 'lucide-react';

export default function App() {
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>(() => {
    try {
      const saved = localStorage.getItem('nutrisnap_meals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dailyGoals, setDailyGoals] = useState<DailyNutritionGoals>(() => {
    try {
      const saved = localStorage.getItem('nutrisnap_goals');
      return saved ? JSON.parse(saved) : DEFAULT_DAILY_GOALS;
    } catch {
      return DEFAULT_DAILY_GOALS;
    }
  });

  const [currentAnalysis, setCurrentAnalysis] = useState<MealAnalysisResult | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Modals state
  const [isDiaryOpen, setIsDiaryOpen] = useState<boolean>(false);
  const [isGoalsOpen, setIsGoalsOpen] = useState<boolean>(false);
  const [isNutritionLabelOpen, setIsNutritionLabelOpen] = useState<boolean>(false);
  const [isCurrentMealLogged, setIsCurrentMealLogged] = useState<boolean>(false);

  // Save meals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nutrisnap_meals', JSON.stringify(loggedMeals));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }, [loggedMeals]);

  // Save goals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nutrisnap_goals', JSON.stringify(dailyGoals));
    } catch (e) {
      console.warn('Could not save goals to localStorage:', e);
    }
  }, [dailyGoals]);

  // Trigger Gemini Analysis
  const handleCaptureImage = async (imageBase64: string, notes?: string) => {
    setCurrentImage(imageBase64);
    setIsAnalyzing(true);
    setAnalysisError(null);
    setCurrentAnalysis(null);
    setIsCurrentMealLogged(false);

    try {
      const res = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
          contextNotes: notes,
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || `Analysis failed with status code ${res.status}`);
      }

      const data: MealAnalysisResult = await res.json();
      data.imageUrl = imageBase64;
      if (notes) data.notes = notes;

      setCurrentAnalysis(data);
    } catch (err: any) {
      console.error('Meal analysis error:', err);
      setAnalysisError(err.message || 'Failed to analyze meal image. Please try another photo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Immediate Sample Meal selection
  const handleSelectSampleMeal = (sample: SampleMeal) => {
    setAnalysisError(null);
    setCurrentImage(sample.imageUrl);
    setCurrentAnalysis({
      ...sample.sampleAnalysis,
      id: 'meal-' + Date.now(),
      timestamp: new Date().toISOString(),
      portionMultiplier: 1.0,
    });
    setIsCurrentMealLogged(false);
  };

  // Log meal to daily diary
  const handleLogMeal = (meal: MealAnalysisResult) => {
    const todayKey = new Date().toISOString().split('T')[0];
    const newLoggedMeal: LoggedMeal = {
      ...meal,
      id: 'logged-' + Date.now(),
      loggedAt: new Date().toISOString(),
      dateKey: todayKey,
    };

    setLoggedMeals((prev) => [newLoggedMeal, ...prev]);
    setIsCurrentMealLogged(true);

    // Celebratory Confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#14b8a6', '#06b6d4', '#f59e0b'],
      });
    } catch (e) {
      // Confetti fallback
    }
  };

  const handleDeleteMeal = (mealId: string) => {
    setLoggedMeals((prev) => prev.filter((m) => m.id !== mealId));
  };

  const handleResetScan = () => {
    setCurrentAnalysis(null);
    setCurrentImage(null);
    setAnalysisError(null);
    setIsCurrentMealLogged(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Sticky Top Header */}
      <Header
        loggedMeals={loggedMeals}
        dailyGoals={dailyGoals}
        onOpenDiary={() => setIsDiaryOpen(true)}
        onOpenGoals={() => setIsGoalsOpen(true)}
        onResetScan={handleResetScan}
        isScanningOrViewingResult={Boolean(currentAnalysis || isAnalyzing)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Error Message Alert */}
        {analysisError && (
          <div className="max-w-2xl mx-auto px-4 pt-4">
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start justify-between gap-3 text-rose-300">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-rose-400">Analysis Error</div>
                  <div className="text-xs">{analysisError}</div>
                </div>
              </div>

              <button
                onClick={handleResetScan}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl text-xs font-semibold text-rose-200 transition shrink-0"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* 1. Loading / Scanning State */}
        {isAnalyzing && currentImage && (
          <ScanningOverlay imagePreview={currentImage} />
        )}

        {/* 2. Analysis Result View */}
        {!isAnalyzing && currentAnalysis && (
          <NutritionCard
            analysis={currentAnalysis}
            dailyGoals={dailyGoals}
            onLogMeal={handleLogMeal}
            onOpenNutritionLabel={() => setIsNutritionLabelOpen(true)}
            onResetScan={handleResetScan}
            isLogged={isCurrentMealLogged}
          />
        )}

        {/* 3. Camera / Upload / Sample View */}
        {!isAnalyzing && !currentAnalysis && (
          <CameraCapture
            onCaptureImage={handleCaptureImage}
            onSelectSampleMeal={handleSelectSampleMeal}
            isLoading={isAnalyzing}
          />
        )}
      </main>

      {/* Modals */}
      <DailyTrackerModal
        isOpen={isDiaryOpen}
        onClose={() => setIsDiaryOpen(false)}
        loggedMeals={loggedMeals}
        dailyGoals={dailyGoals}
        onUpdateGoals={(goals) => {
          setDailyGoals(goals);
          setIsGoalsOpen(false);
        }}
        onDeleteMeal={handleDeleteMeal}
        onSelectMeal={(meal) => {
          setCurrentAnalysis(meal);
          setIsCurrentMealLogged(true);
        }}
      />

      <DailyTrackerModal
        isOpen={isGoalsOpen}
        onClose={() => setIsGoalsOpen(false)}
        loggedMeals={loggedMeals}
        dailyGoals={dailyGoals}
        onUpdateGoals={(goals) => {
          setDailyGoals(goals);
          setIsGoalsOpen(false);
        }}
        onDeleteMeal={handleDeleteMeal}
        onSelectMeal={(meal) => {
          setCurrentAnalysis(meal);
          setIsCurrentMealLogged(true);
        }}
      />

      <NutritionFactsModal
        isOpen={isNutritionLabelOpen}
        onClose={() => setIsNutritionLabelOpen(false)}
        analysis={currentAnalysis}
      />
    </div>
  );
}
