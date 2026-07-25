"use client";

import React from "react";
import { Palette, Camera, Sticker, Download, Check } from "lucide-react";

interface StepProgressProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  canNavigateTo: (step: number) => boolean;
}

export default function StepProgress({ currentStep, onSelectStep, canNavigateTo }: StepProgressProps) {
  const steps = [
    { number: 1, title: "Theme & Layout", icon: Palette },
    { number: 2, title: "Pose & Snap", icon: Camera },
    { number: 3, title: "Decorate", icon: Sticker },
    { number: 4, title: "Save & Share", icon: Download },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto my-6 px-4">
      <div className="flex items-center justify-between relative">
        {/* Background Connection Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-pink-200/60 -z-10 rounded-full" />
        
        {/* Active Line Fill */}
        <div 
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-pink-500 to-rose-500 -z-10 transition-all duration-500 rounded-full"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isDisabled = !canNavigateTo(step.number);

          return (
            <button
              key={step.number}
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelectStep(step.number)}
              className={`flex flex-col items-center gap-1.5 transition-all ${
                isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 shadow-md ${
                  isCompleted
                    ? "bg-rose-500 text-white shadow-rose-300/50 scale-100"
                    : isActive
                    ? "bg-gradient-to-tr from-pink-500 to-rose-500 text-white ring-4 ring-pink-200 scale-110 shadow-pink-400/50"
                    : "bg-white text-stone-500 border-2 border-stone-200 shadow-xs hover:border-pink-300 hover:text-pink-600"
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={`text-xs font-semibold text-center transition-colors ${
                  isActive ? "text-pink-600 font-bold" : isCompleted ? "text-stone-700" : "text-stone-400"
                }`}
              >
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
