"use client";

import React, { useRef, useEffect } from "react";
import "./CursorGrid.css";

type FalloffType = "linear" | "smooth" | "sharp";

const FALLOFF_CURVES: Record<FalloffType, (t: number) => number> = {
  linear: (t) => t,
  smooth: (t) => t * t * (3 - 2 * t),
  sharp: (t) => t * t * t,
};

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(v.slice(0, 6), 16) || 0;
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

export interface CursorGridProps {
  cellSize?: number;
  color?: string;
  radius?: number;
  falloff?: FalloffType;
  holdTime?: number;
  fadeDuration?: number;
  lineWidth?: number;
  maxOpacity?: number;
  fillOpacity?: number;
  gridOpacity?: number;
  cellRadius?: number;
  clickPulse?: boolean;
  pulseSpeed?: number;
  /**
   * When true, registers an additional window-level mousemove listener.
   * This makes the grid react to cursor position even when the pointer is
   * over z-index-stacked content sitting above the canvas.
   */
  trackWindow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface Pulse {
  x: number;
  y: number;
  t0: number;
}

export default function CursorGrid({
  cellSize = 70,
  color = "#ff5228",
  radius = 140,
  falloff = "smooth",
  holdTime = 400,
  fadeDuration = 800,
  lineWidth = 1.2,
  maxOpacity = 1,
  fillOpacity = 0.15,
  gridOpacity = 0.08,
  cellRadius = 6,
  clickPulse = true,
  pulseSpeed = 600,
  trackWindow = false,
  className = "",
  style,
}: CursorGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef<Record<string, unknown>>({});
  const wakeRef = useRef<(() => void) | null>(null);

  propsRef.current = {
    cellSize, color, radius, falloff, holdTime, fadeDuration,
    lineWidth, maxOpacity, fillOpacity, gridOpacity,
    cellRadius, clickPulse, pulseSpeed,
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use 1× DPR — grid cells are coarse; 2× costs 4× memory & GPU with no
    // visible gain on large hero canvases.
    const dpr = 1;

    let cols = 0, rows = 0, offX = 0, offY = 0;
    let alphas = new Float32Array(0);
    let touched = new Float64Array(0);
    let w = 0, h = 0;
    const pulses: Pulse[] = [];
    let raf = 0;
    let running = false;
    let lastFrame = 0;

    const rebuild = () => {
      if (!container || !canvas) return;
      const p = propsRef.current;
      w = container.offsetWidth || 300;
      h = container.offsetHeight || 300;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / (p.cellSize as number)) + 1;
      rows = Math.ceil(h / (p.cellSize as number)) + 1;
      offX = (w - cols * (p.cellSize as number)) / 2;
      offY = (h - rows * (p.cellSize as number)) / 2;
      alphas = new Float32Array(cols * rows);
      touched = new Float64Array(cols * rows);
    };

    const cellCenter = (i: number): [number, number] => {
      const p = propsRef.current;
      const cs = p.cellSize as number;
      return [offX + (i % cols) * cs + cs / 2, offY + Math.floor(i / cols) * cs + cs / 2];
    };

    const energize = (x: number, y: number, boost?: number) => {
      const p = propsRef.current;
      const r = Math.max(p.radius as number, 1);
      const cs = p.cellSize as number;
      const ease = FALLOFF_CURVES[(p.falloff as FalloffType)] ?? FALLOFF_CURVES.linear;
      const now = performance.now();
      const minCol = Math.max(0, Math.floor((x - r - offX) / cs));
      const maxCol = Math.min(cols - 1, Math.floor((x + r - offX) / cs));
      const minRow = Math.max(0, Math.floor((y - r - offY) / cs));
      const maxRow = Math.min(rows - 1, Math.floor((y + r - offY) / cs));
      for (let cRow = minRow; cRow <= maxRow; cRow++) {
        for (let cCol = minCol; cCol <= maxCol; cCol++) {
          const i = cRow * cols + cCol;
          const [cx, cy] = cellCenter(i);
          const dist = Math.hypot(cx - x, cy - y);
          if (dist > r) continue;
          const level = ease(1 - dist / r) * (p.maxOpacity as number) * (boost ?? 1);
          if (level > (alphas[i] ?? 0)) { alphas[i] = level; touched[i] = now; }
          else if (level > 0) { touched[i] = now; }
        }
      }
    };

    const draw = (now: number) => {
      const p = propsRef.current;
      const dt = Math.min(now - lastFrame, 50);
      lastFrame = now;
      ctx.clearRect(0, 0, w, h);
      const [cr, cg, cb] = hexToRgb(p.color as string);

      if ((p.gridOpacity as number) > 0) {
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${p.gridOpacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let c = 0; c <= cols; c++) {
          const x = Math.round(offX + c * (p.cellSize as number)) + 0.5;
          ctx.moveTo(x, 0); ctx.lineTo(x, h);
        }
        for (let r = 0; r <= rows; r++) {
          const y = Math.round(offY + r * (p.cellSize as number)) + 0.5;
          ctx.moveTo(0, y); ctx.lineTo(w, y);
        }
        ctx.stroke();
      }

      for (let pi = pulses.length - 1; pi >= 0; pi--) {
        const pulse = pulses[pi];
        if (!pulse) continue;
        const ringR = ((now - pulse.t0) / 1000) * (p.pulseSpeed as number);
        if (ringR > Math.hypot(w, h)) { pulses.splice(pi, 1); continue; }
        const band = p.cellSize as number;
        const minCol = Math.max(0, Math.floor((pulse.x - ringR - band - offX) / band));
        const maxCol = Math.min(cols - 1, Math.floor((pulse.x + ringR + band - offX) / band));
        const minRow = Math.max(0, Math.floor((pulse.y - ringR - band - offY) / band));
        const maxRow = Math.min(rows - 1, Math.floor((pulse.y + ringR + band - offY) / band));
        for (let cRow = minRow; cRow <= maxRow; cRow++) {
          for (let cCol = minCol; cCol <= maxCol; cCol++) {
            const i = cRow * cols + cCol;
            const [cx, cy] = cellCenter(i);
            if (Math.abs(Math.hypot(cx - pulse.x, cy - pulse.y) - ringR) < band / 2 &&
              (p.maxOpacity as number) > (alphas[i] ?? 0)) {
              alphas[i] = p.maxOpacity as number;
              touched[i] = now;
            }
          }
        }
      }

      let anyVisible = pulses.length > 0;
      const fadeStep = dt / Math.max(p.fadeDuration as number, 16);
      const half = (p.cellSize as number) / 2;

      for (let i = 0; i < alphas.length; i++) {
        let a = alphas[i] ?? 0;
        if (a <= 0) continue;
        if (now - (touched[i] ?? 0) > (p.holdTime as number)) {
          a = Math.max(0, a - fadeStep);
          alphas[i] = a;
          if (a <= 0) continue;
        }
        anyVisible = true;
        const [cx, cy] = cellCenter(i);
        const cs = p.cellSize as number;
        const grad = ctx.createRadialGradient(cx, cy, half * 0.1, cx, cy, cs);
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},${a})`);
        grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        const x = cx - half + 0.5;
        const y = cy - half + 0.5;
        const s = cs - 1;
        ctx.beginPath();
        if ((p.cellRadius as number) > 0 && typeof ctx.roundRect === "function") {
          ctx.roundRect(x, y, s, s, p.cellRadius as number);
        } else {
          ctx.rect(x, y, s, s);
        }
        if ((p.fillOpacity as number) > 0) {
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${a * (p.fillOpacity as number)})`;
          ctx.fill();
        }
        ctx.strokeStyle = grad;
        ctx.lineWidth = p.lineWidth as number;
        ctx.stroke();
      }

      if (anyVisible) {
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
        if ((propsRef.current.gridOpacity as number) <= 0) ctx.clearRect(0, 0, w, h);
      }
    };

    const wake = () => {
      if (running) return;
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(draw);
    };
    wakeRef.current = wake;

    // ── Convert page-level coords to canvas-local coords ────────────────────
    const toCanvas = (clientX: number, clientY: number): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      return [clientX - rect.left, clientY - rect.top];
    };

    const isInBounds = (x: number, y: number) => x >= 0 && y >= 0 && x <= w && y <= h;

    // ── Container-level listeners (cursor directly over canvas) ─────────────
    const onContainerMove = (e: PointerEvent) => {
      const [x, y] = toCanvas(e.clientX, e.clientY);
      if (!isInBounds(x, y)) return;
      energize(x, y);
      wake();
    };
    const onContainerDown = (e: PointerEvent) => {
      if (!propsRef.current.clickPulse) return;
      const [x, y] = toCanvas(e.clientX, e.clientY);
      if (!isInBounds(x, y)) return;
      pulses.push({ x, y, t0: performance.now() });
      wake();
    };
    container.addEventListener("pointermove", onContainerMove);
    container.addEventListener("pointerdown", onContainerDown);

    // ── Window-level listeners (cursor over stacked content above canvas) ────
    // These fire regardless of what element is under the pointer, so the grid
    // reacts even when the cursor is over text, buttons, or cards above it.
    let onWindowMove: ((e: MouseEvent) => void) | null = null;
    let onWindowClick: ((e: MouseEvent) => void) | null = null;

    if (trackWindow) {
      onWindowMove = (e: MouseEvent) => {
        const [x, y] = toCanvas(e.clientX, e.clientY);
        if (!isInBounds(x, y)) return;   // ignore if cursor is outside hero section
        energize(x, y);
        wake();
      };
      onWindowClick = (e: MouseEvent) => {
        if (!propsRef.current.clickPulse) return;
        const [x, y] = toCanvas(e.clientX, e.clientY);
        if (!isInBounds(x, y)) return;
        pulses.push({ x, y, t0: performance.now() });
        wake();
      };
      window.addEventListener("mousemove", onWindowMove);
      window.addEventListener("click", onWindowClick);
    }

    // ── ResizeObserver ───────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => { rebuild(); wake(); });
    ro.observe(container);
    rebuild();
    wake();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointermove", onContainerMove);
      container.removeEventListener("pointerdown", onContainerDown);
      if (onWindowMove) window.removeEventListener("mousemove", onWindowMove);
      if (onWindowClick) window.removeEventListener("click", onWindowClick);
    };
  // trackWindow is a closed-over value — re-run if it changes so we can
  // attach / detach the window listener correctly.
  }, [cellSize, trackWindow]);

  useEffect(() => {
    wakeRef.current?.();
  }, [gridOpacity, color, lineWidth, maxOpacity, fillOpacity, cellRadius]);

  return (
    <div
      ref={containerRef}
      className={`cursor-grid${className ? ` ${className}` : ""}`}
      style={style}
    >
      <canvas ref={canvasRef} className="cursor-grid__canvas" />
    </div>
  );
}
