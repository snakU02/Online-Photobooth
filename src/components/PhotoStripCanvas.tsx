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
}: PhotoStripCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = THEMES[themeId] || THEMES.korean_pastel;
  const activeFilter = FILTERS.find((f) => f.id === filterId) || FILTERS[0];

  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Determine canvas dimensions according to layout ratio
    let canvasW = width;
    let canvasH = height;

    if (layoutId === "2x2_grid") {
      canvasW = 1000;
      canvasH = 1200;
    } else if (layoutId === "polaroid_duo") {
      canvasW = 800;
      canvasH = 1100;
    } else if (layoutId === "6_cut_strip") {
      canvasW = 1000;
      canvasH = 1400;
    } else {
      // 4_cut_strip
      canvasW = 600;
      canvasH = 1600;
    }

    canvas.width = canvasW;
    canvas.height = canvasH;

    // 1. Draw Background Frame Color
    ctx.fillStyle = frameColor || "#ffffff";
    ctx.fillRect(0, 0, canvasW, canvasH);

    // 2. Draw Frame Patterns if selected
    if (framePattern === "hearts") {
      ctx.fillStyle = "rgba(244, 114, 182, 0.15)";
      for (let x = 20; x < canvasW; x += 40) {
        for (let y = 20; y < canvasH; y += 40) {
          ctx.font = "14px sans-serif";
          ctx.fillText("💕", x, y);
        }
      }
    } else if (framePattern === "polka") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      for (let x = 15; x < canvasW; x += 30) {
        for (let y = 15; y < canvasH; y += 30) {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (framePattern === "pixels") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      for (let x = 10; x < canvasW; x += 25) {
        for (let y = 10; y < canvasH; y += 25) {
          ctx.fillRect(x, y, 4, 4);
        }
      }
    }

    // 3. Load & Render Photos
    const loadedImages: (HTMLImageElement | null)[] = await Promise.all(
      photos.map((src) => {
        return new Promise<HTMLImageElement | null>((resolve) => {
          if (!src) return resolve(null);
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        });
      })
    );

    // Calculate Photo slot bounds
    const padding = canvasW * 0.06;
    const headerSpace = canvasW * 0.15;
    const footerSpace = canvasW * 0.22;

    if (layoutId === "4_cut_strip") {
      const availableH = canvasH - headerSpace - footerSpace;
      const slotH = (availableH - padding * 3) / 4;
      const slotW = canvasW - padding * 2;

      loadedImages.forEach((img, idx) => {
        if (!img) return;
        const x = padding;
        const y = headerSpace + idx * (slotH + padding);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, slotW, slotH, 12);
        ctx.clip();

        // Draw image cover mode
        const imgRatio = img.width / img.height;
        const slotRatio = slotW / slotH;
        let dw = slotW;
        let dh = slotH;
        let dx = x;
        let dy = y;

        if (imgRatio > slotRatio) {
          dw = slotH * imgRatio;
          dx = x - (dw - slotW) / 2;
        } else {
          dh = slotW / imgRatio;
          dy = y - (dh - slotH) / 2;
        }

        ctx.drawImage(img, dx, dy, dw, dh);

        // Apply canvas filter if active
        if (activeFilter.canvasFilter) {
          activeFilter.canvasFilter(ctx, canvasW, canvasH);
        }

        ctx.restore();

        // Photo slot outline border
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
        ctx.beginPath();
        ctx.roundRect(x, y, slotW, slotH, 12);
        ctx.stroke();
      });
    } else if (layoutId === "2x2_grid") {
      const availableW = canvasW - padding * 3;
      const slotW = availableW / 2;
      const slotH = slotW * 0.75;
      const startY = headerSpace;

      loadedImages.forEach((img, idx) => {
        if (!img) return;
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = padding + col * (slotW + padding);
        const y = startY + row * (slotH + padding);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, slotW, slotH, 12);
        ctx.clip();
        ctx.drawImage(img, x, y, slotW, slotH);
        if (activeFilter.canvasFilter) {
          activeFilter.canvasFilter(ctx, canvasW, canvasH);
        }
        ctx.restore();
      });
    } else if (layoutId === "polaroid_duo") {
      const slotW = canvasW - padding * 2;
      const slotH = (canvasH - footerSpace - padding * 3) / 2;

      loadedImages.forEach((img, idx) => {
        if (!img) return;
        const x = padding;
        const y = padding + idx * (slotH + padding);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, slotW, slotH, 8);
        ctx.clip();
        ctx.drawImage(img, x, y, slotW, slotH);
        if (activeFilter.canvasFilter) {
          activeFilter.canvasFilter(ctx, canvasW, canvasH);
        }
        ctx.restore();
      });
    } else if (layoutId === "6_cut_strip") {
      const availableW = canvasW - padding * 3;
      const slotW = availableW / 2;
      const slotH = slotW * 0.75;
      const startY = headerSpace;

      loadedImages.forEach((img, idx) => {
        if (!img) return;
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = padding + col * (slotW + padding);
        const y = startY + row * (slotH + padding);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, slotW, slotH, 10);
        ctx.clip();
        ctx.drawImage(img, x, y, slotW, slotH);
        if (activeFilter.canvasFilter) {
          activeFilter.canvasFilter(ctx, canvasW, canvasH);
        }
        ctx.restore();
      });
    }

    // 4. Render Header Title Banner (Top)
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Text color contrast check
    const isDarkFrame = frameColor === "#18181b" || frameColor === "#0f172a" || frameColor === "#1c1917" || frameColor === "#000000";
    ctx.fillStyle = isDarkFrame ? "#f472b6" : theme.primaryColor || "#ec4899";

    ctx.font = `bold ${canvasW * 0.05}px sans-serif`;
    ctx.fillText("DUOSNAP • PHOTOBOOTH", canvasW / 2, headerSpace * 0.55);

    // 5. Render Footer Couple Title & Date (Bottom)
    ctx.fillStyle = isDarkFrame ? "#ffffff" : "#1c1917";
    ctx.font = `bold ${canvasW * 0.045}px Georgia, serif`;
    ctx.fillText(coupleTitle || "Forever & Always 💕", canvasW / 2, canvasH - footerSpace * 0.55);

    ctx.fillStyle = isDarkFrame ? "#a1a1aa" : "#71717a";
    ctx.font = `semibold ${canvasW * 0.032}px monospace`;
    ctx.fillText(dateText || new Date().toLocaleDateString(), canvasW / 2, canvasH - footerSpace * 0.28);

    // 6. Render Placed Stickers
    stickers.forEach((st) => {
      ctx.save();
      const sx = (st.x / 100) * canvasW;
      const sy = (st.y / 100) * canvasH;

      ctx.translate(sx, sy);
      ctx.rotate((st.rotation * Math.PI) / 180);

      const fontSize = canvasW * 0.08 * st.scale;
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(st.content, 0, 0);

      ctx.restore();
    });

    if (onCanvasReady) {
      onCanvasReady(canvas);
    }
  }, [
    themeId,
    layoutId,
    photos,
    filterId,
    frameColor,
    framePattern,
    coupleTitle,
    dateText,
    stickers,
    width,
    height,
    theme,
    activeFilter,
    onCanvasReady,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  return (
    <div className="w-full flex justify-center items-center">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto rounded-2xl shadow-2xl border-4 border-stone-200"
        style={{ maxHeight: "75vh" }}
      />
    </div>
  );
}
