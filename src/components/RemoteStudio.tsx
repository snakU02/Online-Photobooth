"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera, Play, FlipHorizontal, ImagePlus, Sparkles, ArrowRight,
  Heart, Wifi, WifiOff, Loader2, User, Users
} from "lucide-react";
import { THEMES, FILTERS, COUPLE_POSES } from "@/lib/themes";
import { soundEngine } from "@/lib/audio";
import { DuoSnapWebRTC, PeerRole, ConnectionStatus } from "@/lib/webrtc";

interface RemoteStudioProps {
  themeId: string;
  photoCount: number;
  capturedPhotos: string[];
  onPhotosChange: (photos: string[]) => void;
  selectedFilterId: string;
  onSelectFilter: (filterId: string) => void;
  onNextStep: () => void;
  roomCode: string;
  role: PeerRole;
}

export default function RemoteStudio({
  themeId,
  photoCount,
  capturedPhotos,
  onPhotosChange,
  selectedFilterId,
  onSelectFilter,
  onNextStep,
  roomCode,
  role,
}: RemoteStudioProps) {
  const theme = THEMES[themeId] || THEMES.korean_pastel;
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const webrtcRef = useRef<DuoSnapWebRTC | null>(null);

  const [isMirrored, setIsMirrored] = useState(true);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [remoteConnected, setRemoteConnected] = useState(false);

  const activeFilter = FILTERS.find((f) => f.id === selectedFilterId) || FILTERS[0];

  // Initialize local camera + WebRTC
  useEffect(() => {
    let localStream: MediaStream | null = null;

    const init = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: false,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
          localVideoRef.current.play().catch(() => {});
        }

        setHasCameraPermission(true);

        // Initialize WebRTC
        const rtc = new DuoSnapWebRTC({
          roomCode,
          role,
          onRemoteStream: (stream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream;
              remoteVideoRef.current.play().catch(() => {});
            }
            setRemoteConnected(true);
            soundEngine.playFanfare();
          },
          onStatusChange: (status) => {
            setConnectionStatus(status);
            if (status === "connected") setRemoteConnected(true);
          },
          onGuestJoined: () => {
            setConnectionStatus("connecting");
          },
        });

        webrtcRef.current = rtc;
        await rtc.start(localStream);
      } catch {
        setHasCameraPermission(false);
      }
    };

    init();

    return () => {
      if (webrtcRef.current) webrtcRef.current.destroy();
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
    };
  }, [roomCode, role]);

  // Capture frame from BOTH cameras and combine side-by-side
  const captureRemoteFrame = useCallback(() => {
    const localVideo = localVideoRef.current;
    const remoteVideo = remoteVideoRef.current;

    const canvas = document.createElement("canvas");
    const hasRemote = remoteConnected && remoteVideo && remoteVideo.readyState >= 2;

    if (hasRemote) {
      // Side-by-side composite: local | remote
      const w = localVideo ? localVideo.videoWidth || 640 : 640;
      const h = localVideo ? localVideo.videoHeight || 480 : 480;
      canvas.width = w * 2;
      canvas.height = h;

      const ctx = canvas.getContext("2d")!;

      // Draw local (left)
      if (localVideo) {
        if (isMirrored) {
          ctx.save();
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(localVideo, 0, 0, w, h);
          ctx.restore();
        } else {
          ctx.drawImage(localVideo, 0, 0, w, h);
        }
      }

      // Draw remote (right)
      ctx.drawImage(remoteVideo!, w, 0, w, h);

      // Divider line
      ctx.strokeStyle = "rgba(244, 114, 182, 0.8)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w, 0);
      ctx.lineTo(w, h);
      ctx.stroke();

      // Apply filter
      if (activeFilter.canvasFilter) {
        activeFilter.canvasFilter(ctx, canvas.width, canvas.height);
      }
    } else {
      // Solo capture
      if (!localVideo) return null;
      const w = localVideo.videoWidth || 640;
      const h = localVideo.videoHeight || 480;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;

      if (isMirrored) {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(localVideo, 0, 0, w, h);

      if (isMirrored) ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (activeFilter.canvasFilter) activeFilter.canvasFilter(ctx, w, h);
    }

    // Flash + sound
    setShowFlash(true);
    soundEngine.playShutter();
    setTimeout(() => setShowFlash(false), 300);

    return canvas.toDataURL("image/jpeg", 0.95);
  }, [isMirrored, activeFilter, remoteConnected]);

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
        const photo = captureRemoteFrame();
        if (photo) {
          const updated = [...capturedPhotos, photo];
          onPhotosChange(updated);
          if (currentPoseIndex < photoCount - 1) setCurrentPoseIndex((p) => p + 1);
        }
      }
    }, 1000);
  }, [countdown, captureRemoteFrame, capturedPhotos, onPhotosChange, currentPoseIndex, photoCount]);

  const startAutoSequence = useCallback(async () => {
    if (isAutoRunning) return;
    setIsAutoRunning(true);
    let currentPhotos = [...capturedPhotos];

    for (let i = currentPhotos.length; i < photoCount; i++) {
      setCurrentPoseIndex(i);
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        soundEngine.playBeep(false);
        await new Promise((res) => setTimeout(res, 1000));
      }
      setCountdown(null);
      soundEngine.playBeep(true);
      const photo = captureRemoteFrame();
      if (photo) {
        currentPhotos = [...currentPhotos, photo];
        onPhotosChange([...currentPhotos]);
      }
      if (i < photoCount - 1) await new Promise((res) => setTimeout(res, 1500));
    }

    setIsAutoRunning(false);
    soundEngine.playFanfare();
  }, [isAutoRunning, photoCount, capturedPhotos, onPhotosChange, captureRemoteFrame]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Promise.all(
      Array.from(files).map(
        (file) => new Promise<string>((res) => {
          const reader = new FileReader();
          reader.onload = (ev) => res(ev.target?.result as string);
          reader.readAsDataURL(file);
        })
      )
    ).then((results) => {
      onPhotosChange([...capturedPhotos, ...results].slice(0, photoCount));
      soundEngine.playPop();
    });
  };

  const removePhoto = (index: number) => {
    soundEngine.playPop();
    const updated = capturedPhotos.filter((_, i) => i !== index);
    onPhotosChange(updated);
  };

  const currentPose = COUPLE_POSES[currentPoseIndex % COUPLE_POSES.length];

  const statusBadge = () => {
    if (remoteConnected) return { color: "bg-emerald-500", text: "Partner Connected ✓", icon: <Wifi className="w-3 h-3" /> };
    if (connectionStatus === "waiting") return { color: "bg-amber-400", text: "Waiting for partner…", icon: <Loader2 className="w-3 h-3 animate-spin" /> };
    if (connectionStatus === "connecting") return { color: "bg-blue-400", text: "Connecting…", icon: <Loader2 className="w-3 h-3 animate-spin" /> };
    if (connectionStatus === "error" || connectionStatus === "disconnected") return { color: "bg-rose-500", text: "Disconnected", icon: <WifiOff className="w-3 h-3" /> };
    return { color: "bg-stone-400", text: "Setting up…", icon: <Loader2 className="w-3 h-3 animate-spin" /> };
  };

  const badge = statusBadge();

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 animate-fadeIn">
      {/* Pose Prompt Banner */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-bounce">{currentPose.emoji}</span>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-pink-200 font-bold">
              Pose {currentPoseIndex + 1} of {photoCount}:
            </span>
            <h3 className="text-base sm:text-lg font-bold leading-tight">{currentPose.title}</h3>
            <p className="text-xs text-pink-100">{currentPose.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Connection Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold ${badge.color}`}>
            {badge.icon} {badge.text}
          </div>
          {/* Photo counter */}
          <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full font-bold text-xs">
            {capturedPhotos.length} / {photoCount}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Cameras Area */}
        <div className="lg:col-span-8 space-y-3">
          {/* Dual Camera View */}
          <div className={`relative rounded-3xl overflow-hidden bg-stone-900 border-4 border-stone-800 shadow-2xl ${remoteConnected ? "aspect-[2/1]" : "aspect-video"} flex items-center justify-center`}>

            {/* Flash */}
            {showFlash && <div className="absolute inset-0 bg-white z-30 animate-shutter-flash pointer-events-none" />}

            {/* Countdown */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center">
                <span className="text-8xl font-extrabold text-white animate-ping drop-shadow-[0_0_20px_rgba(244,114,182,0.8)]">
                  {countdown}
                </span>
              </div>
            )}

            {/* Local Video (left half or full) */}
            <div className={`${remoteConnected ? "absolute left-0 top-0 w-1/2 h-full" : "absolute inset-0"} overflow-hidden`}>
              <video
                ref={localVideoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${isMirrored ? "scale-x-[-1]" : ""}`}
                style={{ filter: activeFilter.css }}
              />
              {/* Local label */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg font-semibold backdrop-blur-sm">
                <User className="w-3 h-3 text-pink-400" />
                <span>You</span>
              </div>
            </div>

            {/* Remote Video (right half, shown when connected) */}
            {remoteConnected && (
              <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden peer-ring">
                <video
                  ref={remoteVideoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ filter: activeFilter.css }}
                />
                {/* Partner label */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg font-semibold backdrop-blur-sm">
                  <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                  <span>Partner</span>
                </div>
                {/* Divider */}
                <div className="absolute left-0 inset-y-0 w-px bg-pink-400/80 shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
              </div>
            )}

            {/* Waiting for partner overlay */}
            {!remoteConnected && (
              <div className="absolute right-4 bottom-4 w-28 h-20 rounded-xl bg-stone-800/90 border-2 border-dashed border-pink-400/60 flex flex-col items-center justify-center gap-1 text-pink-300 z-10">
                <Heart className="w-6 h-6 animate-pulse" />
                <span className="text-[10px] font-bold text-center leading-tight">Waiting for<br/>partner…</span>
              </div>
            )}

            {/* Controls */}
            {hasCameraPermission && (
              <div className="absolute bottom-3 left-3 z-20">
                <button
                  onClick={() => setIsMirrored(!isMirrored)}
                  className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md text-xs flex items-center gap-1"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Room code badge */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg backdrop-blur-sm font-mono font-bold border border-pink-500/30">
              Room: {roomCode}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              disabled={countdown !== null || isAutoRunning || capturedPhotos.length >= photoCount}
              onClick={triggerCapture}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-4 h-4" /> Snap (3s)
            </button>

            <button
              disabled={countdown !== null || isAutoRunning}
              onClick={startAutoSequence}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" /> Auto {photoCount}-Snap ✨
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold border border-stone-300 transition-all cursor-pointer flex items-center gap-2"
            >
              <ImagePlus className="w-4 h-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
          </div>

          {/* Filter Bar */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Filters:</span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { soundEngine.playPop(); onSelectFilter(f.id); }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer border transition-all ${selectedFilterId === f.id ? "bg-pink-500 text-white border-pink-500" : "bg-white text-stone-700 border-stone-200 hover:border-pink-300"}`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Film Strip Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white/90 rounded-3xl p-4 border-2 border-pink-100 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" /> Couple Shots
              </h3>
              {capturedPhotos.length > 0 && (
                <button onClick={() => onPhotosChange([])} className="text-xs text-rose-500 font-medium hover:underline">Clear</button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 min-h-[180px]">
              {Array.from({ length: photoCount }).map((_, idx) => {
                const photo = capturedPhotos[idx];
                return (
                  <div
                    key={idx}
                    className={`relative rounded-xl overflow-hidden border-2 aspect-square flex items-center justify-center ${photo ? "border-pink-300 bg-black group" : "border-dashed border-stone-300 bg-stone-50 text-stone-400"}`}
                  >
                    {photo ? (
                      <>
                        <img src={photo} alt={`Shot ${idx + 1}`} className="w-full h-full object-cover" />
                        <button onClick={() => removePhoto(idx)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 text-[10px] hover:bg-rose-600 transition-opacity">✕</button>
                        <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1 rounded font-mono">#{idx + 1}</span>
                      </>
                    ) : (
                      <span className="text-[10px] font-semibold text-stone-400">#{idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              disabled={capturedPhotos.length < photoCount}
              onClick={() => { soundEngine.playPop(); onNextStep(); }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white font-bold text-sm shadow-lg shadow-pink-300 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
