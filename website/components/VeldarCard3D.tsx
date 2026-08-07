"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function VeldarCard3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── 1. High-DPI Texture Generation with official veldar_logo.svg ───────
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1296;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = "/veldar_logo.svg";

    let texture: THREE.CanvasTexture | null = null;

    const drawCard = () => {
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      // Card Background: Sleek Dark Royal Red Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, "#0f0204");
      bgGrad.addColorStop(0.3, "#2b060b");
      bgGrad.addColorStop(0.65, "#610b17");
      bgGrad.addColorStop(1, "#a6192e");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle Ambient Shimmer Overlay
      const radGrad = ctx.createRadialGradient(w * 0.7, h * 0.6, 50, w * 0.7, h * 0.6, 800);
      radGrad.addColorStop(0, "rgba(230, 45, 70, 0.3)");
      radGrad.addColorStop(0.5, "rgba(166, 25, 46, 0.15)");
      radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, w, h);

      // Card Header Tag: VELDAR PLATINUM PROTOCOL
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "600 32px system-ui, -apple-system, sans-serif";
      ctx.letterSpacing = "6px";
      ctx.fillText("VELDAR  PLATINUM  PROTOCOL", 120, 150);

      // Draw Official Veldar Logo SVG Graphic in the Center-Left
      if (img.complete && img.naturalWidth > 0) {
        // Draw crisp SVG logo
        const logoSize = 420;
        const logoX = 120;
        const logoY = 220;

        // White background container for logo SVG
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(logoX, logoY, logoSize, logoSize, 36);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 15;
        ctx.fill();
        ctx.clip();
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
        ctx.restore();

        // Right side Title next to Logo
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 90px system-ui, -apple-system, sans-serif";
        ctx.letterSpacing = "4px";
        ctx.fillText("VELDAR", logoX + logoSize + 60, logoY + 160);

        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "600 32px system-ui, -apple-system, sans-serif";
        ctx.letterSpacing = "3px";
        ctx.fillText("CURRENCY  •  ORCHESTRATION", logoX + logoSize + 60, logoY + 230);

        // Domain Pill Badge
        const badgeX = logoX + logoSize + 60;
        const badgeY = logoY + 280;
        const badgeW = 360;
        const badgeH = 70;

        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 35);
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#a6192e";
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "600 28px system-ui, -apple-system, sans-serif";
        ctx.letterSpacing = "1px";
        ctx.fillText("codevians.online", badgeX + 45, badgeY + 45);
      }

      // EMV Gold Chip (Top Right)
      const chipX = w - 380;
      const chipY = 130;
      const chipW = 210;
      const chipH = 160;
      const chipR = 24;

      const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
      chipGrad.addColorStop(0, "#fce397");
      chipGrad.addColorStop(0.3, "#e3b64b");
      chipGrad.addColorStop(0.7, "#b58721");
      chipGrad.addColorStop(1, "#7d5910");

      ctx.beginPath();
      ctx.roundRect(chipX, chipY, chipW, chipH, chipR);
      ctx.fillStyle = chipGrad;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#5e4206";
      ctx.stroke();

      // Chip Details
      ctx.strokeStyle = "rgba(60, 35, 3, 0.75)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(chipX, chipY + chipH * 0.35);
      ctx.lineTo(chipX + chipW, chipY + chipH * 0.35);
      ctx.moveTo(chipX, chipY + chipH * 0.65);
      ctx.lineTo(chipX + chipW, chipY + chipH * 0.65);
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(chipX + chipW * 0.28, chipY + chipH * 0.22, chipW * 0.44, chipH * 0.56, 8);
      ctx.stroke();

      // Bottom Card Strip Details
      const bottomY = h - 140;
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "600 24px monospace";
      ctx.letterSpacing = "6px";
      ctx.fillText("4020 •••• •••• 2026", 120, bottomY);

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "500 20px system-ui";
      ctx.letterSpacing = "2px";
      ctx.fillText("ALGORAND  SETTLEMENT  ENGINE", 120, bottomY + 40);

      if (texture) texture.needsUpdate = true;
    };

    img.onload = () => {
      drawCard();
    };
    drawCard();

    // ── 2. Three.js Scene Setup ─────────────────────────────────────────────
    const getContainerSize = () => ({
      w: container.clientWidth || 550,
      h: container.clientHeight || 450,
    });

    const initialSize = getContainerSize();
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, initialSize.w / initialSize.h, 0.1, 1000);
    camera.position.set(0, 0, 5.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(initialSize.w, initialSize.h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ── 3. Texture & Material ───────────────────────────────────────────────
    texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const cardWidth = 4.6;
    const cardHeight = 2.9;
    const radius = 0.28;
    const depth = 0.05;

    const shape = new THREE.Shape();
    const x = -cardWidth / 2;
    const y = -cardHeight / 2;
    shape.moveTo(x + radius, y);
    shape.lineTo(x + cardWidth - radius, y);
    shape.quadraticCurveTo(x + cardWidth, y, x + cardWidth, y + radius);
    shape.lineTo(x + cardWidth, y + cardHeight - radius);
    shape.quadraticCurveTo(x + cardWidth, y + cardHeight, x + cardWidth - radius, y + cardHeight);
    shape.lineTo(x + radius, y + cardHeight);
    shape.quadraticCurveTo(x, y + cardHeight, x, y + cardHeight - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);

    const extrudeSettings = {
      depth,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    // Front Physical Material with Clearcoat Gloss
    const frontMaterial = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.2,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.85,
    });

    const sideMaterial = new THREE.MeshStandardMaterial({
      color: 0x610b17,
      metalness: 0.4,
      roughness: 0.3,
    });

    const cardMesh = new THREE.Mesh(geometry, [frontMaterial, sideMaterial]);
    scene.add(cardMesh);

    // ── 4. Lighting & Reflection ───────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(4, 5, 6);
    scene.add(mainLight);

    const shineLight = new THREE.PointLight(0xff4d6d, 2.2, 10);
    shineLight.position.set(2, 2, 4);
    scene.add(shineLight);

    const rimLight = new THREE.DirectionalLight(0xa6192e, 1.2);
    rimLight.position.set(-4, -4, 3);
    scene.add(rimLight);

    // ── 5. Mouse Interaction & 3D Parallax Tilt Animation ──────────────────
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      mouseX = (px - 0.5) * 2;
      mouseY = (py - 0.5) * 2;

      targetRotY = mouseX * 0.45;
      targetRotX = -mouseY * 0.35;

      shineLight.position.x = mouseX * 3.5;
      shineLight.position.y = -mouseY * 2.5;
    };

    const handlePointerLeave = () => {
      mouseX = 0;
      mouseY = 0;
      targetRotX = 0;
      targetRotY = 0;
      shineLight.position.set(2, 2, 4);
    };

    container.addEventListener("mousemove", handlePointerMove);
    container.addEventListener("mouseleave", handlePointerLeave);

    const handleResize = () => {
      if (!container) return;
      const size = getContainerSize();
      camera.aspect = size.w / size.h;
      camera.updateProjectionMatrix();
      renderer.setSize(size.w, size.h);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    let clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth 3D tilt lerp
      cardMesh.rotation.x += (targetRotX - cardMesh.rotation.x) * 0.08;
      cardMesh.rotation.y += (targetRotY - cardMesh.rotation.y) * 0.08;

      // Gentle floating animation
      cardMesh.position.y = Math.sin(elapsedTime * 1.7) * 0.07;
      cardMesh.rotation.z = Math.sin(elapsedTime * 1.2) * 0.018;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousemove", handlePointerMove);
      container.removeEventListener("mouseleave", handlePointerLeave);
      ro.disconnect();
      geometry.dispose();
      frontMaterial.dispose();
      sideMaterial.dispose();
      texture?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex h-[440px] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c0a09]/80 shadow-[0_25px_60px_rgba(0,0,0,0.7)] backdrop-blur-md cursor-grab active:cursor-grabbing"
    >
      {/* Dynamic Ambient Backlight Glow */}
      <div
        className={`absolute inset-6 rounded-[2rem] bg-gradient-to-tr from-[#a6192e]/30 via-[#ff4d6d]/15 to-transparent blur-3xl transition-opacity duration-700 pointer-events-none ${
          isHovered ? "opacity-100 scale-105" : "opacity-50 scale-100"
        }`}
      />
    </div>
  );
}
