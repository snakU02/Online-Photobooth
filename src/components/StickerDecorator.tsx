"use client";

import React, { useState } from "react";
import { THEMES } from "@/lib/themes";
import PhotoStripCanvas, { PlacedSticker } from "./PhotoStripCanvas";
import { Sticker, Palette, Type, Sparkles, Trash2, RotateCw, ZoomIn, ZoomOut, ArrowRight, Heart } from "lucide-react";
import { soundEngine } from "@/lib/audio";

interface StickerDecoratorProps {
  themeId: string;
  layoutId: string;
  photos: string[];
  filterId: string;
  frameColor: string;
  onFrameColorChange: (color: string) => void;
  framePattern: string;
  onFramePatternChange: (pattern: string) => void;
  coupleTitle: string;
  onCoupleTitleChange: (title: string) => void;
  dateText: string;
  onDateTextChange: (date: string) => void;
  stickers: PlacedSticker[];
  onStickersChange: (stickers: PlacedSticker[]) => void;
  onNextStep: () => void;
}

export default function StickerDecorator({
  themeId,
  layoutId,
  photos,
  filterId,
  frameColor,
  onFrameColorChange,
  framePattern,
  onFramePatternChange,
  coupleTitle,
  onCoupleTitleChange,
  dateText,
  onDateTextChange,
  stickers,
  onStickersChange,
  onNextStep,
}: StickerDecoratorProps) {
  const theme = THEMES[themeId] || THEMES.korean_pastel;
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // Add new sticker to canvas center with default properties
  const addSticker = (content: string) => {
    soundEngine.playPop();
    const newSticker: PlacedSticker = {
      id: "sticker_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      content,
      x: 30 + Math.random() * 40, // 30% to 70% range
      y: 20 + Math.random() * 60, // 20% to 80% range
      scale: 1,
      rotation: (Math.random() - 0.5) * 30, // slight tilt
    };
    onStickersChange([...stickers, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const updateSticker = (id: string, updates: Partial<PlacedSticker>) => {
    const updated = stickers.map((st) => (st.id === id ? { ...st, ...updates } : st));
    onStickersChange(updated);
  };

  const removeSticker = (id: string) => {
    soundEngine.playPop();
    onStickersChange(stickers.filter((st) => st.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  const activeSticker = stickers.find((s) => s.id === selectedStickerId);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Photo Strip Canvas Preview */}
        <div className="lg:col-span-6 flex flex-col items-center space-y-3">
          <div className="text-center">
            <h3 className="font-bold text-stone-900 text-lg flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" /> Live Photo Strip Preview
            </h3>
            <p className="text-xs text-stone-500">Decorate with custom colors, titles & stickers!</p>
          </div>

          <PhotoStripCanvas
            themeId={themeId}
            layoutId={layoutId}
            photos={photos}
            filterId={filterId}
            frameColor={frameColor}
            framePattern={framePattern}
            coupleTitle={coupleTitle}
            dateText={dateText}
            stickers={stickers}
          />
        </div>

        {/* Right Side: Customization Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Frame Color & Pattern */}
          <div className="bg-white/90 rounded-3xl p-5 border border-pink-100 shadow-md space-y-4">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Palette className="w-4 h-4 text-pink-500" /> Frame Color & Background Pattern
            </h4>

            {/* Frame Colors */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-500">Select Frame Color:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {theme.frameColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      soundEngine.playPop();
                      onFrameColorChange(color);
                    }}
                    className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer shadow-xs ${
                      frameColor === color ? "ring-4 ring-pink-300 scale-110 border-pink-500" : "border-stone-200 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Frame Pattern */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <span className="text-xs font-semibold text-stone-500">Frame Pattern:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {theme.framePatterns.map((pat) => (
                  <button
                    key={pat.id}
                    onClick={() => {
                      soundEngine.playPop();
                      onFramePatternChange(pat.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      framePattern === pat.id
                        ? "bg-pink-500 text-white border-pink-500"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:border-pink-300"
                    }`}
                  >
                    {pat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Couple Text Stamp Customizer */}
          <div className="bg-white/90 rounded-3xl p-5 border border-pink-100 shadow-md space-y-4">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Type className="w-4 h-4 text-pink-500" /> Couple Title & Date Stamp
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1 block">Couple Title:</label>
                <input
                  type="text"
                  value={coupleTitle}
                  onChange={(e) => onCoupleTitleChange(e.target.value)}
                  placeholder="e.g. Sarah & Alex 💕"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1 block">Date / Memory Stamp:</label>
                <input
                  type="text"
                  value={dateText}
                  onChange={(e) => onDateTextChange(e.target.value)}
                  placeholder="e.g. 2026.07.25 • Anniversary"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Sticker Selector Tray */}
          <div className="bg-white/90 rounded-3xl p-5 border border-pink-100 shadow-md space-y-4">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Sticker className="w-4 h-4 text-pink-500" /> Couple Sticker Tray (Click to Add)
            </h4>

            <div className="flex flex-wrap gap-2.5 p-3 rounded-2xl bg-pink-50/50 border border-pink-100 max-h-36 overflow-y-auto">
              {theme.stickers.map((st, idx) => (
                <button
                  key={idx}
                  onClick={() => addSticker(st)}
                  className="text-2xl p-2 rounded-xl bg-white shadow-2xs hover:scale-125 hover:bg-pink-100 transition-all cursor-pointer"
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Active Sticker Adjustments */}
            {activeSticker && (
              <div className="pt-3 border-t border-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    Adjust Sticker <span className="text-xl">{activeSticker.content}</span>
                  </span>
                  <button
                    onClick={() => removeSticker(activeSticker.id)}
                    className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Position Sliders */}
                  <div>
                    <label className="text-stone-500 font-medium block">Position X ({Math.round(activeSticker.x)}%)</label>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={activeSticker.x}
                      onChange={(e) => updateSticker(activeSticker.id, { x: Number(e.target.value) })}
                      className="w-full accent-pink-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-500 font-medium block">Position Y ({Math.round(activeSticker.y)}%)</label>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={activeSticker.y}
                      onChange={(e) => updateSticker(activeSticker.id, { y: Number(e.target.value) })}
                      className="w-full accent-pink-500"
                    />
                  </div>

                  {/* Scale & Rotate */}
                  <div>
                    <label className="text-stone-500 font-medium block">Scale ({activeSticker.scale.toFixed(1)}x)</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.1"
                      value={activeSticker.scale}
                      onChange={(e) => updateSticker(activeSticker.id, { scale: Number(e.target.value) })}
                      className="w-full accent-pink-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-500 font-medium block">Rotation ({Math.round(activeSticker.rotation)}°)</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={activeSticker.rotation}
                      onChange={(e) => updateSticker(activeSticker.id, { rotation: Number(e.target.value) })}
                      className="w-full accent-pink-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Proceed to Share */}
          <button
            onClick={() => {
              soundEngine.playPop();
              onNextStep();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white font-bold text-base shadow-lg shadow-pink-300 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Finish & Save Photo Strip 🎁</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
