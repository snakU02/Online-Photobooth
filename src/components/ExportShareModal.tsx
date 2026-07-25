"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import confetti from "canvas-confetti";
import PhotoStripCanvas, { PlacedSticker } from "./PhotoStripCanvas";
import { Download, QrCode, Printer, RefreshCw, Sparkles, Film, Heart, Check, Share2 } from "lucide-react";
import { soundEngine } from "@/lib/audio";

interface ExportShareModalProps {
  themeId: string;
  layoutId: string;
  photos: string[];
  filterId: string;
  frameColor: string;
  framePattern: string;
  coupleTitle: string;
  dateText: string;
  stickers: PlacedSticker[];
  onReset: () => void;
}

export default function ExportShareModal({
  themeId,
  layoutId,
  photos,
  filterId,
  frameColor,
  framePattern,
  coupleTitle,
  dateText,
  stickers,
  onReset,
}: ExportShareModalProps) {
  const [renderedCanvas, setRenderedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [gifFrameIndex, setGifFrameIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Trigger celebration confetti on view load
  useEffect(() => {
    soundEngine.playFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff758c", "#fb7185", "#f472b6", "#a855f7"],
    });
  }, []);

  // Cycling GIF animation effect
  useEffect(() => {
    if (photos.length === 0) return;
    const interval = setInterval(() => {
      setGifFrameIndex((prev) => (prev + 1) % photos.length);
    }, 600);
    return () => clearInterval(interval);
  }, [photos]);

  const handleCanvasReady = (canvas: HTMLCanvasElement) => {
    setRenderedCanvas(canvas);
    const dataUrl = canvas.toDataURL("image/png", 1.0);
    setPngDataUrl(dataUrl);

    // Generate QR code for local data URL
    QRCode.toDataURL(dataUrl, { margin: 1, width: 200 }, (err, url) => {
      if (!err && url) {
        setQrCodeUrl(url);
      }
    });
  };

  // HD PNG Download
  const downloadPng = () => {
    if (!pngDataUrl) return;
    soundEngine.playPop();
    const link = document.createElement("a");
    const safeTitle = (coupleTitle || "duosnap_photobooth").toLowerCase().replace(/[^a-z0-9]/g, "_");
    link.download = `${safeTitle}_strip.png`;
    link.href = pngDataUrl;
    link.click();
  };

  // Launch Print Dialog
  const printStrip = () => {
    if (!pngDataUrl) return;
    soundEngine.playPop();
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print DuoSnap Strip</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
            img { max-height: 95vh; width: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            @media print {
              body { background: none; }
              img { max-height: 100vh; }
            }
          </style>
        </head>
        <body>
          <img src="${pngDataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Copy Image Link / Data
  const copyImageData = () => {
    if (!pngDataUrl) return;
    soundEngine.playPop();
    navigator.clipboard.writeText(pngDataUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Celebration Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 font-bold text-xs shadow-2xs">
          <Sparkles className="w-4 h-4 text-pink-500" /> Photobooth Strip Ready!
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
          Your Couple Memory Keepsake 💕
        </h2>
        <p className="text-sm text-stone-600 max-w-md mx-auto">
          Download HD photo strip, preview animated flipbook, scan QR code, or print on photo paper!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Photo Strip Canvas */}
        <div className="lg:col-span-6 flex flex-col items-center space-y-3">
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
            onCanvasReady={handleCanvasReady}
          />
        </div>

        {/* Right Side: Export Options & Animated Flipbook */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Action Buttons */}
          <div className="bg-white/90 rounded-3xl p-6 border border-pink-100 shadow-md space-y-4">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Download className="w-5 h-5 text-pink-500" /> Export & Save Options
            </h3>

            <div className="space-y-3">
              {/* HD Download Button */}
              <button
                onClick={downloadPng}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white font-bold text-base shadow-lg shadow-pink-300 hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Download High-Res PNG Strip</span>
              </button>

              {/* Print Layout */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={printStrip}
                  className="py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm border border-stone-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-stone-600" />
                  <span>Print 4x6 Layout</span>
                </button>

                <button
                  onClick={copyImageData}
                  className="py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm border border-stone-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-stone-600" />
                      <span>Copy Image Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Animated Boomerang Flipbook */}
          <div className="bg-white/90 rounded-3xl p-5 border border-pink-100 shadow-md space-y-3">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Film className="w-4 h-4 text-pink-500" /> Animated Boomerang Memory
            </h4>

            <div className="flex items-center gap-4 bg-pink-50/60 p-3 rounded-2xl border border-pink-100">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-black border-2 border-pink-300 flex-shrink-0 shadow-xs">
                {photos[gifFrameIndex] && (
                  <img
                    src={photos[gifFrameIndex]}
                    alt="Animated pose frame"
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                )}
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-pink-600 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-pink-500" /> Frame #{gifFrameIndex + 1}
                </span>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Your couple photo sequence is looping live! You can also save these poses individually.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile QR Transfer */}
          <div className="bg-white/90 rounded-3xl p-5 border border-pink-100 shadow-md flex items-center gap-4">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code Mobile Transfer" className="w-20 h-20 rounded-xl border border-stone-200 shadow-2xs" />
            ) : (
              <div className="w-20 h-20 bg-stone-100 rounded-xl flex items-center justify-center text-xs text-stone-400 font-medium">
                QR Code
              </div>
            )}
            <div className="space-y-1">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-pink-500" /> Instant Mobile Transfer
              </h4>
              <p className="text-xs text-stone-500 leading-tight">
                Scan QR code with your mobile camera to quickly view or save your photo strip on your phone!
              </p>
            </div>
          </div>

          {/* Reset New Strip */}
          <button
            onClick={() => {
              soundEngine.playPop();
              if (confirm("Start another photobooth session for more couple photos?")) {
                onReset();
              }
            }}
            className="w-full py-3.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-sm border border-pink-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Create Another Couple Photo Strip</span>
          </button>
        </div>
      </div>
    </div>
  );
}
