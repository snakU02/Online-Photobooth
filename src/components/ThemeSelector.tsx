"use client";

import React from "react";
import { THEMES } from "@/lib/themes";
import { Sparkles, LayoutGrid, ArrowRight, Heart } from "lucide-react";
import { soundEngine } from "@/lib/audio";

interface ThemeSelectorProps {
  selectedThemeId: string;
  onSelectTheme: (themeId: string) => void;
  selectedLayout: string;
  onSelectLayout: (layout: string) => void;
  onNextStep: () => void;
}

export interface StripLayoutOption {
  id: string;
  name: string;
  photoCount: number;
  description: string;
  previewClass: string;
}

export const LAYOUT_OPTIONS: StripLayoutOption[] = [
  {
    id: "4_cut_strip",
    name: "Classic 4-Cut Strip",
    photoCount: 4,
    description: "Traditional vertical photobooth strip with 4 poses",
    previewClass: "flex flex-col gap-1 w-12 h-28 bg-white p-1 rounded-sm border border-stone-300 shadow-xs",
  },
  {
    id: "2x2_grid",
    name: "2x2 Square Grid",
    photoCount: 4,
    description: "Cute balanced 4-photo square grid layout",
    previewClass: "grid grid-cols-2 gap-1 w-20 h-20 bg-white p-1 rounded-sm border border-stone-300 shadow-xs",
  },
  {
    id: "polaroid_duo",
    name: "Polaroid Duo",
    photoCount: 2,
    description: "Romantic double-photo classic polaroid snapshot with big bottom space for signatures",
    previewClass: "flex flex-col gap-1 w-20 h-24 bg-white p-1.5 rounded-sm border border-stone-300 shadow-xs pb-5",
  },
  {
    id: "6_cut_strip",
    name: "Mega 6-Cut Collage",
    photoCount: 6,
    description: "6 poses collage for super fun photo sessions",
    previewClass: "grid grid-cols-2 gap-1 w-20 h-26 bg-white p-1 rounded-sm border border-stone-300 shadow-xs",
  },
];

export default function ThemeSelector({
  selectedThemeId,
  onSelectTheme,
  selectedLayout,
  onSelectLayout,
  onNextStep,
}: ThemeSelectorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Theme Picker Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-500" />
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900">Choose Couple Aesthetic Theme</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(THEMES).map((theme) => {
            const isSelected = selectedThemeId === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => {
                  soundEngine.playPop();
                  onSelectTheme(theme.id);
                }}
                className={`group cursor-pointer rounded-2xl p-5 transition-all duration-300 border-2 relative overflow-hidden flex flex-col justify-between ${isSelected
                  ? "border-pink-500 ring-4 ring-pink-200/80 shadow-lg scale-[1.02]"
                  : "border-stone-200 hover:border-pink-300 bg-white/70 hover:bg-white shadow-xs"
                  }`}
              >
                {/* Background Tint */}
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-30 group-hover:opacity-40 transition-opacity -z-10`} />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-stone-900 flex items-center gap-1.5">
                      {theme.name}
                    </h3>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs shadow-xs animate-bounce">
                        <Heart className="w-3.5 h-3.5 fill-white" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 mb-4 leading-relaxed">{theme.description}</p>
                </div>

                {/* Color & Sticker Preview */}
                <div className="space-y-2 pt-2 border-t border-stone-200/60">
                  <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                    <span>Frame Palette:</span>
                    <div className="flex items-center gap-1">
                      {theme.frameColors.slice(0, 4).map((color, idx) => (
                        <span
                          key={idx}
                          className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-base overflow-hidden whitespace-nowrap">
                    {theme.stickers.slice(0, 6).map((st, i) => (
                      <span key={i} className="hover:scale-125 transition-transform">{st}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Layout Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-pink-500" />
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900">Select Photo Strip Format</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LAYOUT_OPTIONS.map((layout) => {
            const isSelected = selectedLayout === layout.id;
            return (
              <div
                key={layout.id}
                onClick={() => {
                  soundEngine.playPop();
                  onSelectLayout(layout.id);
                }}
                className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border-2 flex flex-col items-center text-center justify-between ${isSelected
                  ? "border-pink-500 bg-pink-50/60 ring-4 ring-pink-200 shadow-md scale-[1.02]"
                  : "border-stone-200 bg-white hover:border-pink-300 shadow-xs"
                  }`}
              >
                {/* Visual Layout Thumbnail */}
                <div className="my-3 flex items-center justify-center h-28">
                  <div className={layout.previewClass}>
                    {Array.from({ length: layout.photoCount }).map((_, idx) => (
                      <div key={idx} className="bg-pink-100/80 rounded-xs flex items-center justify-center text-[10px] text-pink-400 font-bold">
                        #{idx + 1}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-stone-900">{layout.name}</h4>
                  <p className="text-[11px] text-stone-500 mt-1 leading-tight">{layout.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={() => {
            soundEngine.playPop();
            onNextStep();
          }}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white font-bold text-base shadow-lg shadow-pink-300 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Start Posing & Snapping</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
