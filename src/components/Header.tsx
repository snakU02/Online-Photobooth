"use client";

import React from "react";
import { Heart, Volume2, VolumeX, Sparkles, RefreshCw } from "lucide-react";
import { soundEngine } from "@/lib/audio";

interface HeaderProps {
  currentThemeId: string;
  onThemeChange: (themeId: string) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onReset: () => void;
}

export default function Header({
  currentThemeId,
  audioEnabled,
  onToggleAudio,
  onReset,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/60 border-b border-pink-100/60 shadow-xs px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none" onClick={onReset}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-500 flex items-center justify-center shadow-md shadow-pink-300/50 animate-heart-pulse shrink-0">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent truncate">
              DuoSnap <span className="hidden sm:inline-block text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-semibold border border-pink-200">Couples</span>
            </h1>
            <p className="hidden sm:block text-xs text-stone-500 font-medium truncate">Romantic Online Photobooth</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              soundEngine.playPop();
              onToggleAudio();
            }}
            title={audioEnabled ? "Mute sound effects" : "Enable sound effects"}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-pink-100 text-stone-700 hover:text-pink-600 font-medium text-xs transition-all border border-stone-200"
          >
            {audioEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-pink-500" />
                <span className="hidden sm:inline">Sound On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-stone-400" />
                <span className="hidden sm:inline">Muted</span>
              </>
            )}
          </button>

          {/* Reset Session */}
          <button
            onClick={() => {
              soundEngine.playPop();
              if (confirm("Start a new photobooth session? Current unsaved photos will be cleared.")) {
                onReset();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 font-medium text-xs transition-all border border-pink-200 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Strip</span>
          </button>
        </div>
      </div>
    </header>
  );
}
