"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import StepProgress from "@/components/StepProgress";
import ThemeSelector, { LAYOUT_OPTIONS } from "@/components/ThemeSelector";
import CameraStudio from "@/components/CameraStudio";
import RemoteStudio from "@/components/RemoteStudio";
import StickerDecorator from "@/components/StickerDecorator";
import ExportShareModal from "@/components/ExportShareModal";
import RoomLobby from "@/components/RoomLobby";
import { PlacedSticker } from "@/components/PhotoStripCanvas";
import { THEMES } from "@/lib/themes";
import { soundEngine } from "@/lib/audio";
import { Heart, Sparkles, Users, Camera } from "lucide-react";

type AppMode = "solo" | "remote" | "remote-lobby";
type PeerRole = "host" | "guest";

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode | null>(null);
  const [roomCode, setRoomCode] = useState<string>("");
  const [peerRole, setPeerRole] = useState<PeerRole>("host");

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedThemeId, setSelectedThemeId] = useState<string>("korean_pastel");
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>("4_cut_strip");
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedFilterId, setSelectedFilterId] = useState<string>("normal");
  const [frameColor, setFrameColor] = useState<string>("#ffffff");
  const [framePattern, setFramePattern] = useState<string>("solid");
  const [coupleTitle, setCoupleTitle] = useState<string>("Sarah & Alex 💕");
  const [dateText, setDateText] = useState<string>(
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }) + " • DuoSnap"
  );
  const [stickers, setStickers] = useState<PlacedSticker[]>([
    { id: "init_1", content: "💕", x: 78, y: 14, scale: 1.2, rotation: 12 },
    { id: "init_2", content: "✨", x: 18, y: 88, scale: 1.1, rotation: -8 },
  ]);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Auto-detect join code from URL (e.g., ?join=ROSE-4821)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get("join");
    if (joinCode) {
      setRoomCode(joinCode);
      setPeerRole("guest");
      setAppMode("remote");
      setCurrentStep(2);
    }
  }, []);

  const theme = THEMES[selectedThemeId] || THEMES.korean_pastel;
  const layout = LAYOUT_OPTIONS.find((l) => l.id === selectedLayoutId) || LAYOUT_OPTIONS[0];

  const canNavigateTo = (step: number) => {
    if (step === 1) return true;
    if (step === 2) return appMode !== null;
    if (step === 3) return photos.length >= layout.photoCount;
    if (step === 4) return photos.length >= layout.photoCount;
    return false;
  };

  const handleReset = () => {
    setPhotos([]);
    setCurrentStep(1);
    setAppMode(null);
    setRoomCode("");
    setStickers([
      { id: "init_1", content: "💕", x: 78, y: 14, scale: 1.2, rotation: 12 },
      { id: "init_2", content: "✨", x: 18, y: 88, scale: 1.1, rotation: -8 },
    ]);
  };

  const handleThemeChange = (themeId: string) => {
    setSelectedThemeId(themeId);
    const newTheme = THEMES[themeId];
    if (newTheme) {
      setFrameColor(newTheme.frameColors[0] || "#ffffff");
      setSelectedFilterId(newTheme.recommendedFilter || "normal");
    }
  };

  const handleRoomReady = (code: string, role: PeerRole) => {
    setRoomCode(code);
    setPeerRole(role);
    setAppMode("remote");
    setCurrentStep(2);
    soundEngine.playPop();
  };

  const handleSkipRemote = () => {
    setAppMode("solo");
    soundEngine.playPop();
  };

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br ${theme.bgGradient} transition-colors duration-500`}>
      {/* Header */}
      <Header
        currentThemeId={selectedThemeId}
        onThemeChange={handleThemeChange}
        audioEnabled={audioEnabled}
        onToggleAudio={() => {
          const next = !audioEnabled;
          setAudioEnabled(next);
          soundEngine.setEnabled(next);
        }}
        onReset={handleReset}
      />

      {/* Main Container — constrained width, no overflow */}
      <main className="w-full max-w-[1200px] mx-auto px-3 sm:px-6 py-4 pb-16 space-y-4 overflow-x-hidden">

        {/* Landing Hero + Mode Select — shown when no mode selected */}
        {appMode === null && currentStep === 1 && (
          <div className="space-y-6">
            {/* Hero */}
            <div className="text-center space-y-2 pt-2 pb-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-pink-700 font-bold text-xs shadow-sm border border-pink-200">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" /> DuoSnap Couple Studio
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                "Para sa prinsesa ko na si Princess Saldua"
              </h1>
              <p className="text-stone-600 text-sm max-w-md mx-auto font-medium">
                Pick a theme, snap cute poses — together in the same room or from different locations worldwide!
              </p>
            </div>

            {/* Mode Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <button
                onClick={() => { soundEngine.playPop(); setAppMode("solo"); }}
                className="group p-5 rounded-2xl bg-white border-2 border-pink-200 hover:border-pink-400 shadow-md hover:shadow-xl transition-all text-left cursor-pointer hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-400 to-rose-400 flex items-center justify-center mb-3 shadow-sm">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-stone-900 text-base">Solo / Same Room</h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">Both of you in front of the same camera on one device</p>
              </button>

              <button
                onClick={() => { soundEngine.playPop(); setAppMode("remote-lobby" as AppMode); }}
                className="group p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 shadow-md hover:shadow-xl transition-all text-left cursor-pointer hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center mb-3 shadow-sm">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  Remote Couple
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold border border-purple-200">New</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">Each person on their own device — cameras appear side-by-side!</p>
              </button>
            </div>

            {/* Theme Selector (below mode select) */}
            <ThemeSelector
              selectedThemeId={selectedThemeId}
              onSelectTheme={handleThemeChange}
              selectedLayout={selectedLayoutId}
              onSelectLayout={setSelectedLayoutId}
              onNextStep={() => {
                soundEngine.playPop();
                if (appMode === "remote-lobby") {
                  // keep as remote lobby
                } else {
                  setAppMode("solo");
                }
                setCurrentStep(2);
              }}
            />
          </div>
        )}

        {/* Remote Lobby: create/join room */}
        {appMode === "remote-lobby" && (
          <RoomLobby onRoomReady={handleRoomReady} onSkipRemote={handleSkipRemote} />
        )}

        {/* Steps 2-4: Photo wizard */}
        {appMode !== null && appMode !== "remote-lobby" && (
          <>
            <StepProgress
              currentStep={currentStep}
              onSelectStep={(step) => {
                soundEngine.playPop();
                setCurrentStep(step);
              }}
              canNavigateTo={canNavigateTo}
            />

            <div className="pt-1">
              {currentStep === 1 && (
                <ThemeSelector
                  selectedThemeId={selectedThemeId}
                  onSelectTheme={handleThemeChange}
                  selectedLayout={selectedLayoutId}
                  onSelectLayout={setSelectedLayoutId}
                  onNextStep={() => { soundEngine.playPop(); setCurrentStep(2); }}
                />
              )}

              {currentStep === 2 && appMode === "solo" && (
                <CameraStudio
                  themeId={selectedThemeId}
                  photoCount={layout.photoCount}
                  capturedPhotos={photos}
                  onPhotosChange={setPhotos}
                  selectedFilterId={selectedFilterId}
                  onSelectFilter={setSelectedFilterId}
                  onNextStep={() => setCurrentStep(3)}
                />
              )}

              {currentStep === 2 && appMode === "remote" && (
                <RemoteStudio
                  themeId={selectedThemeId}
                  photoCount={layout.photoCount}
                  capturedPhotos={photos}
                  onPhotosChange={setPhotos}
                  selectedFilterId={selectedFilterId}
                  onSelectFilter={setSelectedFilterId}
                  onNextStep={() => setCurrentStep(3)}
                  roomCode={roomCode}
                  role={peerRole}
                />
              )}

              {currentStep === 3 && (
                <StickerDecorator
                  themeId={selectedThemeId}
                  layoutId={selectedLayoutId}
                  photos={photos}
                  filterId={selectedFilterId}
                  frameColor={frameColor}
                  onFrameColorChange={setFrameColor}
                  framePattern={framePattern}
                  onFramePatternChange={setFramePattern}
                  coupleTitle={coupleTitle}
                  onCoupleTitleChange={setCoupleTitle}
                  dateText={dateText}
                  onDateTextChange={setDateText}
                  stickers={stickers}
                  onStickersChange={setStickers}
                  onNextStep={() => setCurrentStep(4)}
                />
              )}

              {currentStep === 4 && (
                <ExportShareModal
                  themeId={selectedThemeId}
                  layoutId={selectedLayoutId}
                  photos={photos}
                  filterId={selectedFilterId}
                  frameColor={frameColor}
                  framePattern={framePattern}
                  coupleTitle={coupleTitle}
                  dateText={dateText}
                  stickers={stickers}
                  onReset={handleReset}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-stone-400 py-5 border-t border-stone-200/50 flex items-center justify-center gap-1.5">
        <span>Made with</span>
        <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 inline" />
        <span>for Couples • DuoSnap Photobooth</span>
      </footer>
    </div>
  );
}
