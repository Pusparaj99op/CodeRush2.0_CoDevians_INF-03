"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function VeldarCard3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── 1. High-DPI Texture Generation (2048 x 1296) ───────────────────────
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1296;
    const ctx = canvas.getContext("2d");

    const drawCardTexture = () => {
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      // Rich Red/Crimson Background Gradient matching reference image
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, "#1f0101");
      bgGrad.addColorStop(0.2, "#3a0303");
      bgGrad.addColorStop(0.45, "#7a0700");
      bgGrad.addColorStop(0.75, "#cf1b04");
      bgGrad.addColorStop(1, "#f23400");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Atmospheric Texture Flare / Soft Glow
      const glowGrad = ctx.createRadialGradient(w * 0.75, h * 0.7, 80, w * 0.75, h * 0.7, 750);
      glowGrad.addColorStop(0, "rgba(255, 120, 40, 0.45)");
      glowGrad.addColorStop(0.4, "rgba(210, 30, 0, 0.2)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      // --- TOP LEFT: VELDAR Title ---
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 130px system-ui, -apple-system, sans-serif";
      ctx.letterSpacing = "4px";
      ctx.fillText("VELDAR", 130, 230);

      // --- SUBTITLE: BUILD • COLLABORATE • INNOVATE ---
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.font = "700 42px system-ui, -apple-system, sans-serif";
      ctx.letterSpacing = "3px";
      ctx.fillText("BUILD  •  COLLABORATE  •  INNOVATE", 130, 320);

      // --- DOMAIN PILL BADGE: (🌐) codevians.online ---
      const badgeX = 130;
      const badgeY = 385;
      const badgeW = 400;
      const badgeH = 80;
      const badgeR = 40;

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeR);
      ctx.fillStyle = "rgba(10, 2, 2, 0.55)";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#ff5228";
      ctx.stroke();

      // Globe Icon
      const iconCenterX = badgeX + 45;
      const iconCenterY = badgeY + 40;
      const iconR = 17;

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(iconCenterX, iconCenterY, iconR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(iconCenterX, iconCenterY, iconR * 0.45, iconR, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(iconCenterX - iconR, iconCenterY);
      ctx.lineTo(iconCenterX + iconR, iconCenterY);
      ctx.stroke();

      // Badge Domain Text
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 32px system-ui, -apple-system, sans-serif";
      ctx.letterSpacing = "1px";
      ctx.fillText("codevians.online", badgeX + 80, badgeY + 51);

      // --- EMV GOLD CHIP (Middle Right) ---
      const chipX = w - 430;
      const chipY = 320;
      const chipW = 230;
      const chipH = 175;
      const chipR = 28;

      // Chip Base Gradient
      const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
      chipGrad.addColorStop(0, "#f7d983");
      chipGrad.addColorStop(0.25, "#e3b64b");
      chipGrad.addColorStop(0.65, "#b58721");
      chipGrad.addColorStop(1, "#7d5910");

      ctx.beginPath();
      ctx.roundRect(chipX, chipY, chipW, chipH, chipR);
      ctx.fillStyle = chipGrad;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#5e4206";
      ctx.stroke();

      // Chip Inner Grid Pattern
      ctx.strokeStyle = "rgba(50, 30, 2, 0.75)";
      ctx.lineWidth = 3.5;

      // Horizontal divide lines
      ctx.beginPath();
      ctx.moveTo(chipX, chipY + chipH * 0.35);
      ctx.lineTo(chipX + chipW, chipY + chipH * 0.35);
      ctx.moveTo(chipX, chipY + chipH * 0.65);
      ctx.lineTo(chipX + chipW, chipY + chipH * 0.65);
      ctx.stroke();

      // Center pad rectangle
      ctx.beginPath();
      ctx.roundRect(chipX + chipW * 0.28, chipY + chipH * 0.22, chipW * 0.44, chipH * 0.56, 8);
      ctx.stroke();

      // Vertical divide lines
      ctx.beginPath();
      ctx.moveTo(chipX + chipW * 0.5, chipY);
      ctx.lineTo(chipX + chipW * 0.5, chipY + chipH * 0.22);
      ctx.moveTo(chipX + chipW * 0.5, chipY + chipH * 0.78);
      ctx.lineTo(chipX + chipW * 0.5, chipY + chipH);
      ctx.stroke();

      // --- BOTTOM TYPOGRAPHY: Massive Outlined "veldar" ---
      const veldarTextY = h - 70;
      ctx.font = "900 450px system-ui, -apple-system, sans-serif";
      ctx.letterSpacing = "-8px";

      // Golden Orange Stroke
      ctx.lineWidth = 11;
      ctx.strokeStyle = "#ffa500";
      ctx.strokeText("veldar", 80, veldarTextY);

      // Subtle translucent inner fill
      ctx.fillStyle = "rgba(255, 120, 20, 0.04)";
      ctx.fillText("veldar", 80, veldarTextY);
    };

    drawCardTexture();

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
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;

    // Create 3D Rounded Card Geometry
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

    // Front Material (Card Face with crisp reflection)
    const frontMaterial = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.28,
      metalness: 0.12,
      clearcoat: 0.7,
      clearcoatRoughness: 0.15,
      reflectivity: 0.8,
    });

    // Back / Side Material
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d0303,
      metalness: 0.3,
      roughness: 0.35,
    });

    const cardMesh = new THREE.Mesh(geometry, [frontMaterial, sideMaterial]);
    scene.add(cardMesh);

    // ── 4. Balanced Lighting ────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.6);
    mainLight.position.set(4, 5, 6);
    scene.add(mainLight);

    // Soft specular tracking light (subtle highlight, not blinding)
    const shineLight = new THREE.PointLight(0xff7a59, 1.8, 10);
    shineLight.position.set(2, 2, 4);
    scene.add(shineLight);

    // Bottom Rim Fill Light
    const fillLight = new THREE.DirectionalLight(0xff4400, 0.8);
    fillLight.position.set(-3, -4, 2);
    scene.add(fillLight);

    // ── 5. Mouse Interaction & Animation Loop ──────────────────────────────
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

      targetRotY = mouseX * 0.42;
      targetRotX = -mouseY * 0.32;

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

      // Smooth tilt lerp
      cardMesh.rotation.x += (targetRotX - cardMesh.rotation.x) * 0.07;
      cardMesh.rotation.y += (targetRotY - cardMesh.rotation.y) * 0.07;

      // Idle float animation
      cardMesh.position.y = Math.sin(elapsedTime * 1.6) * 0.06;
      cardMesh.rotation.z = Math.sin(elapsedTime * 1.1) * 0.015;

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
      texture.dispose();
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
      {/* Background Ambient Glow */}
      <div
        className={`absolute inset-6 rounded-[2rem] bg-gradient-to-tr from-[#ff3b00]/25 via-[#ff6a2e]/15 to-transparent blur-3xl transition-opacity duration-700 pointer-events-none ${
          isHovered ? "opacity-100" : "opacity-50"
        }`}
      />
    </div>
  );
}
