"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Flame, Clock, Play, RotateCcw } from "lucide-react";

interface StepByStepCookModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeTitle: string;
  recipeImage: string;
  steps: string[];
  cookTimeMins: number;
}

export default function StepByStepCookModal({
  isOpen,
  onClose,
  recipeTitle,
  recipeImage,
  steps = [],
  cookTimeMins
}: StepByStepCookModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const totalSteps = steps.length;
  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-border flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Top Bar */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-card text-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Guided Step-by-Step Cooking
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground transition-colors"
            aria-label="Close guided cooking"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        {!isCompleted && (
          <div className="w-full bg-muted h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 flex flex-col justify-between">
          {!isCompleted ? (
            <div className="space-y-6">
              {/* Recipe Meta Header */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/40">
                <span className="font-semibold text-foreground line-clamp-1">{recipeTitle}</span>
                <span className="font-bold bg-primary-light text-primary px-2.5 py-0.5 rounded-full">
                  Step {currentStep + 1} of {totalSteps}
                </span>
              </div>

              {/* Step Title & Instruction */}
              <div className="bg-primary-light/30 border border-primary/20 rounded-3xl p-6 shadow-2xs">
                <div className="w-10 h-10 rounded-2xl bg-primary text-white font-extrabold text-lg flex items-center justify-center mb-4 shadow-sm">
                  {currentStep + 1}
                </div>
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                  Instruction
                </h4>
                <p className="text-base sm:text-lg md:text-xl font-medium text-foreground leading-relaxed">
                  {steps[currentStep]}
                </p>
              </div>

              {/* Cooking Tip Box */}
              <div className="bg-muted/60 rounded-2xl p-4 border border-border/80 text-xs text-muted-foreground flex items-start gap-3">
                <Flame className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-foreground block mb-0.5">Chef's Pro Tip</span>
                  Keep heat controlled and take your time. Trapping steam ensures rich local flavors.
                </div>
              </div>
            </div>
          ) : (
            /* Cooking Finished Celebration */
            <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
              </div>

              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-widest block mb-1">
                  Dish Completed! 🎉
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
                  {recipeTitle} is Ready!
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  You cooked an amazing meal with what you had. Take a photo and share your creation with the kitchen community!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link
                  href="/post"
                  onClick={onClose}
                  className="bg-gradient-to-r from-primary to-accent hover:brightness-105 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Share What I Cooked</span>
                </Link>
                <button
                  onClick={handleRestart}
                  className="bg-card border border-border hover:bg-muted text-foreground font-semibold py-3.5 px-5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Cook Again</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        {!isCompleted && (
          <div className="p-4 sm:p-5 border-t border-border bg-card flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition-all ${
                currentStep === 0
                  ? "opacity-30 cursor-not-allowed border-transparent text-muted-foreground"
                  : "border-border hover:bg-muted text-foreground"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Step Dots */}
            <div className="hidden sm:flex items-center gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentStep
                      ? "w-6 bg-primary"
                      : i < currentStep
                      ? "w-2 bg-primary/40"
                      : "w-2 bg-muted"
                  }`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent text-white font-bold px-6 py-2.5 rounded-2xl shadow-sm hover:brightness-105 active:scale-95 transition-all text-xs sm:text-sm"
            >
              <span>{currentStep === totalSteps - 1 ? "Finish Cooking 🎉" : "Next Step"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
