"use client";

import React, { useState, useRef } from "react";
import { Heart, Link2, Users, ArrowRight, Loader2, Check, Copy, QrCode, Wifi } from "lucide-react";
import { soundEngine } from "@/lib/audio";

interface RoomLobbyProps {
  onRoomReady: (roomCode: string, role: "host" | "guest") => void;
  onSkipRemote: () => void;
}

export default function RoomLobby({ onRoomReady, onSkipRemote }: RoomLobbyProps) {
  const [mode, setMode] = useState<"choose" | "hosting" | "joining">("choose");
  const [roomCode, setRoomCode] = useState("");
  const [joinInput, setJoinInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inviteLink = roomCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}?join=${roomCode}`
    : "";

  const handleCreateRoom = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/signal/create-room");
      const json = await resp.json();
      if (json.success && json.code) {
        setRoomCode(json.code);
        setMode("hosting");
        soundEngine.playFanfare();
      } else {
        setError("Failed to create room. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    const code = joinInput.trim().toUpperCase();
    if (!code) return setError("Please enter your partner's room code.");
    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/signal/check-room?code=${code}`);
      const json = await resp.json();
      if (json.exists) {
        soundEngine.playPop();
        onRoomReady(code, "guest");
      } else {
        setError("Room code not found. Check with your partner and try again!");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inviteLink);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      try { document.execCommand('copy'); } catch (err) {}
      document.body.removeChild(textArea);
    }
    setIsCopied(true);
    soundEngine.playPop();
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 shadow-lg shadow-pink-300/50 mb-2">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900">Remote Couple Studio</h2>
          <p className="text-sm text-stone-500 max-w-sm mx-auto">
            Both of you on different laptops? Connect online — your cameras will appear side-by-side for a real couple photobooth experience!
          </p>
        </div>

        {mode === "choose" && (
          <div className="space-y-4">
            {/* Create Room Card */}
            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="w-full p-5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white text-left transition-all hover:scale-[1.01] hover:shadow-xl shadow-lg shadow-pink-300/40 disabled:opacity-60 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-base">Invite My Partner 💕</div>
                    <div className="text-xs text-pink-100 mt-0.5">Create a room & share the code with your partner</div>
                  </div>
                </div>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </div>
            </button>

            {/* Join Room Card */}
            <div className="p-5 rounded-2xl bg-white border-2 border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center border border-pink-200">
                  <Wifi className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <div className="font-bold text-stone-900 text-sm">Join Partner's Room</div>
                  <div className="text-xs text-stone-500">Enter the code your partner shared with you</div>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinInput}
                  onChange={(e) => { setJoinInput(e.target.value.toUpperCase()); setError(null); }}
                  placeholder="e.g. ROSE-4821"
                  maxLength={9}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-stone-200 focus:border-pink-400 focus:outline-none font-mono font-bold text-sm tracking-wider uppercase"
                  onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={isLoading || !joinInput}
                  className="px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join →"}
                </button>
              </div>
              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
            </div>

            {/* Skip to Solo Mode */}
            <button
              onClick={onSkipRemote}
              className="w-full py-3 text-sm text-stone-500 hover:text-pink-600 font-medium transition-colors"
            >
              → Skip: Use my own camera only (Solo Mode)
            </button>
          </div>
        )}

        {mode === "hosting" && roomCode && (
          <div className="space-y-4">
            {/* Room Code Display */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 text-center space-y-3">
              <div className="text-xs font-bold text-pink-600 uppercase tracking-wider">Your Room Code</div>
              <div className="text-4xl font-extrabold tracking-widest text-stone-900 font-mono">{roomCode}</div>
              <p className="text-xs text-stone-500">Share this code with your partner — they'll enter it to join!</p>

              <button
                onClick={copyInviteLink}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-pink-50 text-pink-700 font-semibold text-xs border border-pink-200 transition-all cursor-pointer shadow-xs"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? "Copied!" : "Copy Invite Link"}
              </button>
            </div>

            {/* Waiting Animation */}
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="relative w-12 h-12">
                <Heart className="w-12 h-12 text-pink-200" />
                <Heart className="w-12 h-12 text-pink-400 absolute inset-0 animate-ping opacity-50" />
              </div>
              <p className="text-sm text-stone-600 font-medium">Waiting for your partner to join…</p>
              <p className="text-xs text-stone-400">Once they connect, your cameras will appear side-by-side!</p>
            </div>

            {/* Enter as host */}
            <button
              onClick={() => onRoomReady(roomCode, "host")}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm shadow-lg shadow-pink-300 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Studio & Wait for Partner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
