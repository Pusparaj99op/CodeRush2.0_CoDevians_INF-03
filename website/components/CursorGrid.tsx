"use client";

import { useRef, useEffect } from "react";
import "./CursorGrid.css";

// ─── Exact React Bits CursorGrid source (TypeScript port) ───────────────────

type FalloffType = "linear" | "smooth" | "sharp";

const FALLOFF_CURVES: Record<FalloffType, (t: number) => number> = {
  linear: (t) => t,
  smooth: (t) => t * t * (3 - 2 * t),
  sharp: (t) => t * t * t,
};

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(v.slice(0, 6), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

interface CursorGridProps {
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
  className?: string;
}

const CursorGrid = ({
  cellSize = 70,
  color = "#D946EF",
  radius = 140,
  falloff = "smooth",
  holdTime = 400,
  fadeDuration = 800,
  lineWidth = 1.2,
  maxOpacity = 1,
  fillOpacity = 0,
  gridOpacity = 0,
  cellRadius = 0,
  clickPulse = true,
  pulseSpeed = 600,
  className = "",
}: CursorGridProps) => {
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

    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Grid state: one alpha + timestamp pair per cell, indexed row-major.
    let cols = 0, rows = 0, offX = 0, offY = 0;
    let alphas = new Float32Array(0);
    let touched = new Float64Array(0);
    let w = 0, h = 0;
    const pulses: { x: number; y: number; t0: number }[] = [];
    let raf = 0, running = false, lastFrame = 0;

    const rebuild = () => {
      const p = propsRef.current;
      w = container.offsetWidth;
      h = container.offsetHeight;
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
      const cx = offX + (i % cols) * cs + cs / 2;
      const cy = offY + Math.floor(i / cols) * cs + cs / 2;
      return [cx, cy];
    };

    const energize = (x: number, y: number, boost?: number) => {
      const p = propsRef.current;
      const r = Math.max(p.radius as number, 1);
      const cs = p.cellSize as number;
      const ease = FALLOFF_CURVES[p.falloff as FalloffType] ?? FALLOFF_CURVES.linear;
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
          if (level > alphas[i]) { alphas[i] = level; touched[i] = now; }
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
        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${p.gridOpacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let cCol = 0; cCol <= cols; cCol++) {
          const x = Math.round(offX + cCol * (p.cellSize as number)) + 0.5;
          ctx.moveTo(x, 0); ctx.lineTo(x, h);
        }
        for (let cRow = 0; cRow <= rows; cRow++) {
          const y = Math.round(offY + cRow * (p.cellSize as number)) + 0.5;
          ctx.moveTo(0, y); ctx.lineTo(w, y);
        }
        ctx.stroke();
      }

      for (let pi = pulses.length - 1; pi >= 0; pi--) {
        const pulse = pulses[pi];
        const age = (now - pulse.t0) / 1000;
        const ringR = age * (p.pulseSpeed as number);
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
            const dist = Math.hypot(cx - pulse.x, cy - pulse.y);
            if (Math.abs(dist - ringR) < band / 2 && (p.maxOpacity as number) > alphas[i]) {
              alphas[i] = p.maxOpacity as number; touched[i] = now;
            }
          }
        }
      }

      let anyVisible = pulses.length > 0;
      const fadeStep = dt / Math.max(p.fadeDuration as number, 16);
      const half = (p.cellSize as number) / 2;

      for (let i = 0; i < alphas.length; i++) {
        let a = alphas[i];
        if (a <= 0) continue;
        if (now - touched[i] > (p.holdTime as number)) {
          a = Math.max(0, a - fadeStep); alphas[i] = a;
          if (a <= 0) continue;
        }
        anyVisible = true;
        const [cx, cy] = cellCenter(i);
        const cs = p.cellSize as number;
        const gradient = ctx.createRadialGradient(cx, cy, half * 0.1, cx, cy, cs);
        gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${a})`);
        gradient.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
        const x = cx - half + 0.5, y = cy - half + 0.5, s = cs - 1;
        ctx.beginPath();
        if ((p.cellRadius as number) > 0 && typeof ctx.roundRect === "function") {
          ctx.roundRect(x, y, s, s, p.cellRadius as number);
        } else { ctx.rect(x, y, s, s); }
        if ((p.fillOpacity as number) > 0) {
          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${a * (p.fillOpacity as number)})`;
          ctx.fill();
        }
        ctx.strokeStyle = gradient;
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

    // Shared coord converter: works for both container events and external calls
    const toLocal = (clientX: number, clientY: number): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      return [clientX - rect.left, clientY - rect.top];
    };

    const isInBounds = (x: number, y: number) => x >= 0 && y >= 0 && x <= w && y <= h;

    // Original React Bits container listeners
    const onPointerMove = (e: PointerEvent) => {
      const [x, y] = toLocal(e.clientX, e.clientY);
      energize(x, y); wake();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!propsRef.current.clickPulse) return;
      const [x, y] = toLocal(e.clientX, e.clientY);
      pulses.push({ x, y, t0: performance.now() }); wake();
    };
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerdown", onPointerDown);

    // Window-level listeners so the grid reacts even when the cursor is over
    // z-index-stacked content (nav, text, cards) sitting above the canvas.
    const onWindowMove = (e: MouseEvent) => {
      const [x, y] = toLocal(e.clientX, e.clientY);
      if (!isInBounds(x, y)) return;
      energize(x, y); wake();
    };
    const onWindowClick = (e: MouseEvent) => {
      if (!propsRef.current.clickPulse) return;
      const [x, y] = toLocal(e.clientX, e.clientY);
      if (!isInBounds(x, y)) return;
      pulses.push({ x, y, t0: performance.now() }); wake();
    };
    window.addEventListener("mousemove", onWindowMove);
    window.addEventListener("click", onWindowClick);

    const ro = new ResizeObserver(() => { rebuild(); wake(); });
    ro.observe(container);
    rebuild();
    wake();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("mousemove", onWindowMove);
      window.removeEventListener("click", onWindowClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellSize]);

  // Repaint static layers when visual props change while idle
  useEffect(() => {
    wakeRef.current?.();
  }, [gridOpacity, color, lineWidth, maxOpacity, fillOpacity, cellRadius]);

  return (
    <div ref={containerRef} className={`cursor-grid${className ? ` ${className}` : ""}`}>
      <canvas ref={canvasRef} className="cursor-grid__canvas" />
    </div>
  );
};

export default CursorGrid;
