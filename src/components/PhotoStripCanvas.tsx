"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { THEMES, FILTERS } from "@/lib/themes";

export interface PlacedSticker {
  id: string;
  content: string;
  x: number; // percentage (0 to 100)
  y: number; // percentage (0 to 100)
  scale: number;
  rotation: number;
}

interface PhotoStripCanvasProps {
  themeId: string;
  layoutId: string;
  photos: string[];
  filterId: string;
  frameColor: string;
  framePattern: string;
  coupleTitle: string;
  dateText: string;
  stickers: PlacedSticker[];
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  width?: number;
  height?: number;
  onPointerDown?: React.PointerEventHandler<HTMLCanvasElement>;
  onPointerMove?: React.PointerEventHandler<HTMLCanvasElement>;
  onPointerUp?: React.PointerEventHandler<HTMLCanvasElement>;
  onPointerLeave?: React.PointerEventHandler<HTMLCanvasElement>;
}

export default function PhotoStripCanvas({
  themeId,
  layoutId,
  photos,
  filterId,
  frameColor,
  framePattern,
  coupleTitle,
  dateText,
  stickers,
  onCanvasReady,
  width = 600,
  height = 1600,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerLeave,
}: PhotoStripCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Snapshot of canvas WITHOUT stickers — used for fast sticker overlay
  const baseSnapshotRef = useRef<ImageData | null>(null);
  const canvasDimsRef = useRef<{ w: number; h: number }>({ w: 600, h: 1600 });

  const theme = THEMES[themeId] || THEMES.korean_pastel;
  const activeFilter = FILTERS.find((f) => f.id === filterId) || FILTERS[0];

  // Draws stickers on top of the saved base snapshot (fast, no image reload)
  const drawStickersOnBase = useCallback((ctx: CanvasRenderingContext2D, currentStickers: PlacedSticker[]) => {
    const { w, h } = canvasDimsRef.current;
    if (baseSnapshotRef.current) {
      ctx.putImageData(baseSnapshotRef.current, 0, 0);
    }
    currentStickers.forEach((st) => {
      ctx.save();
      ctx.translate((st.x / 100) * w, (st.y / 100) * h);
      ctx.rotate((st.rotation * Math.PI) / 180);
      ctx.font = `${w * 0.08 * st.scale}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(st.content, 0, 0);
      ctx.restore();
    });
  }, []);

  // Heavy base render (photos + frame + branding — no stickers yet)
  const renderBase = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let canvasW = 600, canvasH = 1600;
    if (layoutId === "2x2_grid")      { canvasW = 1000; canvasH = 1200; }
    else if (layoutId === "polaroid_duo") { canvasW = 800;  canvasH = 1100; }
    else if (layoutId === "6_cut_strip")  { canvasW = 1000; canvasH = 1400; }

    canvas.width = canvasW;
    canvas.height = canvasH;
    canvasDimsRef.current = { w: canvasW, h: canvasH };

    // 1. Background
    ctx.fillStyle = frameColor || "#ffffff";
    ctx.fillRect(0, 0, canvasW, canvasH);

    // 2. Frame Pattern
    if (framePattern === "hearts") {
      ctx.font = "14px sans-serif";
      for (let x = 20; x < canvasW; x += 40)
        for (let y = 20; y < canvasH; y += 40)
          ctx.fillText("♡", x, y);
    } else if (framePattern === "polka") {
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      for (let x = 15; x < canvasW; x += 30)
        for (let y = 15; y < canvasH; y += 30) {
          ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
        }
    } else if (framePattern === "pixels" || framePattern === "checkerboard") {
      ctx.fillStyle = "rgba(0,0,0,0.10)";
      for (let x = 0; x < canvasW; x += 20)
        for (let y = 0; y < canvasH; y += 20)
          if ((x / 20 + y / 20) % 2 === 0) ctx.fillRect(x, y, 20, 20);
    } else if (framePattern === "stars") {
      ctx.font = "13px sans-serif";
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      for (let x = 18; x < canvasW; x += 36)
        for (let y = 18; y < canvasH; y += 36)
          ctx.fillText("✦", x, y);
    } else if (framePattern === "stripes") {
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      for (let y = 0; y < canvasH; y += 20)
        ctx.fillRect(0, y, canvasW, 10);
    } else if (framePattern === "diamonds") {
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.font = "16px sans-serif";
      for (let x = 20; x < canvasW; x += 40)
        for (let y = 20; y < canvasH; y += 40)
          ctx.fillText("◆", x, y);
    }

    // 3. Photos
    const loadedImages: (HTMLImageElement | null)[] = await Promise.all(
      photos.map((src) => new Promise<HTMLImageElement | null>((resolve) => {
        if (!src) return resolve(null);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      }))
    );

    const padding = canvasW * 0.06;
    const headerSpace = canvasW * 0.15;
    const footerSpace = canvasW * 0.22;

    const drawImg = (img: HTMLImageElement, x: number, y: number, slotW: number, slotH: number, radius = 12) => {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, slotW, slotH, radius);
      ctx.clip();
      const imgRatio = img.width / img.height;
      const slotRatio = slotW / slotH;
      let dw = slotW, dh = slotH, dx = x, dy = y;
      if (imgRatio > slotRatio) { dw = slotH * imgRatio; dx = x - (dw - slotW) / 2; }
      else { dh = slotW / imgRatio; dy = y - (dh - slotH) / 2; }
      ctx.drawImage(img, dx, dy, dw, dh);
      if (activeFilter.canvasFilter) activeFilter.canvasFilter(ctx, canvasW, canvasH);
      ctx.restore();
      ctx.strokeStyle = "rgba(0,0,0,0.07)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(x, y, slotW, slotH, radius); ctx.stroke();
    };

    if (layoutId === "4_cut_strip") {
      const slotH = (canvasH - headerSpace - footerSpace - padding * 3) / 4;
      const slotW = canvasW - padding * 2;
      loadedImages.forEach((img, i) => { if (img) drawImg(img, padding, headerSpace + i * (slotH + padding), slotW, slotH); });
    } else if (layoutId === "2x2_grid" || layoutId === "6_cut_strip") {
      const slotW = (canvasW - padding * 3) / 2;
      const slotH = slotW * 0.75;
      loadedImages.forEach((img, i) => {
        if (!img) return;
        const col = i % 2, row = Math.floor(i / 2);
        drawImg(img, padding + col * (slotW + padding), headerSpace + row * (slotH + padding), slotW, slotH, 10);
      });
    } else if (layoutId === "polaroid_duo") {
      const slotW = canvasW - padding * 2;
      const slotH = (canvasH - footerSpace - padding * 3) / 2;
      loadedImages.forEach((img, i) => { if (img) drawImg(img, padding, padding + i * (slotH + padding), slotW, slotH, 8); });
    }

    // 4. DuoSnap Header Branding
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const isDark = ["#18181b","#0f172a","#1c1917","#000000","#011827","#1e1b4b","#311042","#022c22","#450a0a"].includes(frameColor);
    const brandColor = isDark ? "rgba(255,255,255,0.92)" : "rgba(25,25,25,0.78)";
    const accentColor = isDark ? "rgba(255,190,215,0.85)" : (theme.primaryColor || "#ec4899");

    // Pill background
    const pillH = headerSpace * 0.68;
    const pillW = canvasW * 0.52;
    const pillX = (canvasW - pillW) / 2;
    const pillY = (headerSpace - pillH) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fillStyle = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)";
    ctx.fill();
    ctx.restore();

    // Wordmark
    ctx.font = `bold ${canvasW * 0.036}px Georgia, serif`;
    ctx.fillStyle = brandColor;
    ctx.fillText("DuoSnap", canvasW / 2 - canvasW * 0.055, headerSpace / 2);
    ctx.font = `${canvasW * 0.02}px Arial, sans-serif`;
    ctx.fillStyle = accentColor;
    ctx.fillText("PHOTOBOOTH", canvasW / 2 + canvasW * 0.105, headerSpace / 2 + 1);

    // 5. Footer
    ctx.fillStyle = isDark ? "#ffffff" : "#1c1917";
    ctx.font = `bold ${canvasW * 0.042}px Georgia, serif`;
    ctx.fillText(coupleTitle || "Forever & Always", canvasW / 2, canvasH - footerSpace * 0.55);
    ctx.fillStyle = isDark ? "#a1a1aa" : "#71717a";
    ctx.font = `${canvasW * 0.028}px monospace`;
    ctx.fillText(dateText || new Date().toLocaleDateString(), canvasW / 2, canvasH - footerSpace * 0.28);

    // Save base snapshot (no stickers yet)
    baseSnapshotRef.current = ctx.getImageData(0, 0, canvasW, canvasH);
  }, [themeId, layoutId, photos, filterId, frameColor, framePattern, coupleTitle, dateText, width, height, theme, activeFilter, onCanvasReady]);

  // When base changes, re-render base then draw stickers
  useEffect(() => {
    (async () => {
      await renderBase();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawStickersOnBase(ctx, stickers);
      if (onCanvasReady) onCanvasReady(canvas);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderBase]);

  // When ONLY stickers change (drag/add/remove), just redraw sticker overlay — no full re-render
  const stickersRef = useRef(stickers);
  useEffect(() => {
    stickersRef.current = stickers;
    const canvas = canvasRef.current;
    if (!canvas || !baseSnapshotRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawStickersOnBase(ctx, stickers);
    if (onCanvasReady) onCanvasReady(canvas);
  }, [stickers, drawStickersOnBase, onCanvasReady]);

  return (
    <div className="w-full flex justify-center items-center">
      <canvas
        ref={canvasRef}
        className={`max-w-full h-auto rounded-2xl shadow-2xl border-4 border-stone-200 ${onPointerDown ? "cursor-grab active:cursor-grabbing touch-none" : ""}`}
        style={{ maxHeight: "75vh" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
      />
    </div>
  );
}
