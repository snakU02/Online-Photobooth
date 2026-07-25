"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Sparkles, FlipHorizontal, Play, ArrowRight, Heart, ImagePlus, Upload } from "lucide-react";
import { THEMES, FILTERS, COUPLE_POSES } from "@/lib/themes";
import { soundEngine } from "@/lib/audio";

interface CameraStudioProps {
  themeId: string;
  photoCount: number;
  capturedPhotos: string[];
  onPhotosChange: (photos: string[]) => void;
  selectedFilterId: string;
  onSelectFilter: (filterId: string) => void;
  onNextStep: () => void;
}

export default function CameraStudio({
  themeId,
  photoCount,
  capturedPhotos,
  onPhotosChange,
  selectedFilterId,
  onSelectFilter,
  onNextStep,
}: CameraStudioProps) {
  const theme = THEMES[themeId] || THEMES.korean_pastel;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isMirrored, setIsMirrored] = useState(true);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isAutoSequenceRunning, setIsAutoSequenceRunning] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string | null>(null);

  // Active filter object
  const activeFilter = FILTERS.find((f) => f.id === selectedFilterId) || FILTERS[0];

  // Start Webcam Stream
  const startCamera = useCallback(async () => {
    try {
      setCameraErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasCameraPermission(true);
    } catch (err) {
      console.warn("Camera access denied or unavailable:", err);
      setHasCameraPermission(false);
      setCameraErrorMsg("Webcam permission denied or camera not found. You can upload photos below!");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      // Stop media stream on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  // Capture current video frame to Data URL
  const captureFrame = useCallback(() => {
    if (!videoRef.current) return null;
    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Apply mirror if enabled
    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Reset transform before filter overlay
    if (isMirrored) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // Apply canvas filter shader if applicable
    if (activeFilter.canvasFilter) {
      activeFilter.canvasFilter(ctx, canvas.width, canvas.height);
    }

    // Flash visual feedback
    setShowFlash(true);
    soundEngine.playShutter();
    setTimeout(() => setShowFlash(false), 300);

    return canvas.toDataURL("image/jpeg", 0.95);
  }, [isMirrored, activeFilter]);

  // Handle single photo capture with 3s countdown
  const triggerCapture = useCallback(() => {
    if (countdown !== null) return;

    let count = 3;
    setCountdown(count);
    soundEngine.playBeep(false);

    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        soundEngine.playBeep(false);
      } else {
        clearInterval(timer);
        setCountdown(null);
        soundEngine.playBeep(true);

        const photoData = captureFrame();
        if (photoData) {
          const newPhotos = [...capturedPhotos, photoData];
          onPhotosChange(newPhotos);

          // Advance pose prompt
          if (currentPoseIndex < photoCount - 1) {
            setCurrentPoseIndex((prev) => prev + 1);
          }
        }
      }
    }, 1000);
  }, [countdown, captureFrame, capturedPhotos, onPhotosChange, currentPoseIndex, photoCount]);

  // Start automated 4-shot series hands-free countdown!
  const startAutoSequence = useCallback(async () => {
    if (isAutoSequenceRunning) return;
    setIsAutoSequenceRunning(true);
    let remainingToCapture = photoCount - capturedPhotos.length;
    if (remainingToCapture <= 0) {
      onPhotosChange([]);
      remainingToCapture = photoCount;
      setCurrentPoseIndex(0);
    }

    let currentPhotos = [...capturedPhotos];

    for (let i = currentPhotos.length; i < photoCount; i++) {
      setCurrentPoseIndex(i);

      // Countdown 3, 2, 1
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        soundEngine.playBeep(false);
        await new Promise((res) => setTimeout(res, 1000));
      }

      setCountdown(null);
      soundEngine.playBeep(true);

      const frame = captureFrame();
      if (frame) {
        currentPhotos = [...currentPhotos, frame];
        onPhotosChange([...currentPhotos]);
      }

      // 1.5 second pause between poses to allow couples to read next pose prompt!
      if (i < photoCount - 1) {
        await new Promise((res) => setTimeout(res, 1500));
      }
    }

    setIsAutoSequenceRunning(false);
    soundEngine.playFanfare();
  }, [isAutoSequenceRunning, photoCount, capturedPhotos, onPhotosChange, captureFrame]);

  // Handle image upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newUploaded: string[] = [];
    const readPromises = Array.from(files).map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((results) => {
      const combined = [...capturedPhotos, ...results].slice(0, photoCount);
      onPhotosChange(combined);
      soundEngine.playPop();
    });
  };

  const removePhoto = (index: number) => {
    soundEngine.playPop();
    const updated = capturedPhotos.filter((_, i) => i !== index);
    onPhotosChange(updated);
    if (currentPoseIndex >= updated.length) {
      setCurrentPoseIndex(updated.length);
    }
  };

  const currentPose = COUPLE_POSES[currentPoseIndex % COUPLE_POSES.length];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Pose Prompt Banner */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl sm:text-4xl animate-bounce">{currentPose.emoji}</span>
          <div>
            <span className="text-xs uppercase tracking-wider text-pink-200 font-bold">
              Pose {currentPoseIndex + 1} of {photoCount} Prompt:
            </span>
            <h3 className="text-lg sm:text-xl font-bold">{currentPose.title}</h3>
            <p className="text-xs sm:text-sm text-pink-100">{currentPose.subtitle}</p>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full font-bold text-xs sm:text-sm border border-white/30">
          {capturedPhotos.length} / {photoCount} Snapped
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Camera Studio Area */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-stone-900 border-4 border-stone-800 shadow-2xl aspect-video flex items-center justify-center">
            {/* Shutter Flash Effect */}
            {showFlash && (
              <div className="absolute inset-0 bg-white z-30 animate-shutter-flash pointer-events-none" />
            )}

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs z-20 flex items-center justify-center">
                <span className="text-8xl sm:text-9xl font-extrabold text-white animate-ping drop-shadow-[0_0_20px_rgba(244,114,182,0.8)]">
                  {countdown}
                </span>
              </div>
            )}

            {/* Live Video Feed */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover transition-all duration-200 ${
                isMirrored ? "scale-x-[-1]" : ""
              }`}
              style={{ filter: activeFilter.css }}
            />

            {/* Camera Unavailable Fallback Display */}
            {hasCameraPermission === false && (
              <div className="absolute inset-0 bg-stone-900 flex flex-col items-center justify-center p-6 text-center text-stone-300 space-y-4 z-10">
                <Camera className="w-16 h-16 text-pink-400 opacity-60" />
                <p className="text-sm max-w-xs leading-relaxed text-stone-300">{cameraErrorMsg}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Couple Photos</span>
                </button>
              </div>
            )}

            {/* Video Controls Overlay */}
            {hasCameraPermission && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                <button
                  onClick={() => setIsMirrored(!isMirrored)}
                  className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all text-xs font-semibold flex items-center gap-1.5"
                  title="Toggle Mirror View"
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">{isMirrored ? "Mirrored" : "Normal"}</span>
                </button>

                <span className="text-xs px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-pink-300 font-semibold border border-pink-500/30">
                  {activeFilter.name}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {hasCameraPermission && (
              <>
                {/* Single Snap Button */}
                <button
                  disabled={countdown !== null || isAutoSequenceRunning || capturedPhotos.length >= photoCount}
                  onClick={triggerCapture}
                  className="flex-1 sm:flex-initial px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-5 h-5" />
                  <span>Snap Photo (3s)</span>
                </button>

                {/* Auto Sequence Hands-Free Snap */}
                <button
                  disabled={countdown !== null || isAutoSequenceRunning}
                  onClick={startAutoSequence}
                  className="flex-1 sm:flex-initial px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Hands-Free Auto 4-Snap ✨</span>
                </button>
              </>
            )}

            {/* Upload Fallback Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-300"
            >
              <ImagePlus className="w-4 h-4 text-stone-600" />
              <span className="hidden sm:inline">Upload Photos</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Filter Toolbar */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Live Filter Shaders
            </h4>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {FILTERS.map((f) => {
                const isSelected = selectedFilterId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      soundEngine.playPop();
                      onSelectFilter(f.id);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                      isSelected
                        ? "bg-pink-500 text-white border-pink-500 shadow-sm"
                        : "bg-white text-stone-700 border-stone-200 hover:border-pink-300 hover:bg-pink-50"
                    }`}
                  >
                    {f.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Captured Film Strip Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white/90 rounded-3xl p-5 border-2 border-pink-100 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" /> Photobooth Film
              </h3>
              {capturedPhotos.length > 0 && (
                <button
                  onClick={() => {
                    soundEngine.playPop();
                    onPhotosChange([]);
                  }}
                  className="text-xs text-rose-500 hover:underline font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Film Frames Grid */}
            <div className="grid grid-cols-2 gap-3 min-h-[220px]">
              {Array.from({ length: photoCount }).map((_, idx) => {
                const photo = capturedPhotos[idx];
                return (
                  <div
                    key={idx}
                    className={`relative rounded-xl overflow-hidden border-2 aspect-square flex items-center justify-center transition-all ${
                      photo
                        ? "border-pink-300 bg-black shadow-xs group"
                        : "border-dashed border-stone-300 bg-stone-50 text-stone-400"
                    }`}
                  >
                    {photo ? (
                      <>
                        <img src={photo} alt={`Pose ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-rose-600"
                        >
                          ✕
                        </button>
                        <span className="absolute bottom-1 left-1.5 text-[10px] px-1.5 py-0.5 rounded-sm bg-black/60 text-white font-mono">
                          #{idx + 1}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-stone-400">Pose #{idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Next Step Button */}
            <button
              disabled={capturedPhotos.length < photoCount}
              onClick={() => {
                soundEngine.playPop();
                onNextStep();
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white font-bold text-sm shadow-lg shadow-pink-300 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Decorate Strip ({capturedPhotos.length}/{photoCount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
