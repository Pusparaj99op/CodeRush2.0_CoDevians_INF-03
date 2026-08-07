"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function VeldarCard3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── 1. Texture Generation (Canvas 2D) ──────────────────────────────────
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 648;
    const ctx = canvas.getContext("2d");

    const drawCardTexture = () => {
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      // Card Background: Rich Dark Red → Crimson → Bright Red Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, "#1a0101");
      bgGrad.addColorStop(0.25, "#3d0303");
      bgGrad.addColorStop(0.55, "#8c0900");
      bgGrad.addColorStop(0.82, "#d91e06");
      bgGrad.addColorStop(1, "#ff3b00");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Atmospheric Noise / Texture Overlay
      const radGrad = ctx.createRadialGradient(w * 0.7, h * 0.7, 50, w * 0.7, h * 0.7, 400);
      radGrad.addColorStop(0, "rgba(255, 100, 30, 0.35)");
      radGrad.addColorStop(0.5, "rgba(200, 20, 0, 0.15)");
      radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, w, h);

      // Top Left: VELDAR Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 58px system-ui, -apple-system, sans-serif";
      ctx.letterSpacing = "3px";
      ctx.fillText("VELDAR", 64, 115);

      // Subtitle: BUILD • COLLABORATE • INNOVATE
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.font = "600 21px system-ui, -apple-system, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("BUILD  •  COLLABORATE  •  INNOVATE", 64, 162);

      // Domain Pill Badge: (🌐) codevians.online
      const badgeX = 64;
      const badgeY = 195;
      const badgeW = 215;
      const badgeH = 40;
      const badgeR = 20;

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeR);
      ctx.fillStyle = "rgba(10, 5, 5, 0.4)";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#ff6a2e";
      ctx.stroke();

      // Globe Icon
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(badgeX + 22, badgeY + 20, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(badgeX + 22, badgeY + 20, 4, 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(badgeX + 14, badgeY + 20);
      ctx.lineTo(badgeX + 30, badgeY + 20);
      ctx.stroke();

      // Badge Text
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 16px system-ui, -apple-system, sans-serif";
      ctx.letterSpacing = "0.5px";
      ctx.fillText("codevians.online", badgeX + 38, badgeY + 25);

      // EMV Gold Chip (Middle Right)
      const chipX = w - 210;
      const chipY = 160;
      const chipW = 110;
      const chipH = 85;
      const chipR = 14;

      // Chip Base Gradient
      const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
      chipGrad.addColorStop(0, "#f5d77f");
      chipGrad.addColorStop(0.3, "#dbb048");
      chipGrad.addColorStop(0.7, "#be902b");
      chipGrad.addColorStop(1, "#8c6512");

      ctx.beginPath();
      ctx.roundRect(chipX, chipY, chipW, chipH, chipR);
      ctx.fillStyle = chipGrad;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#6b4b08";
      ctx.stroke();

      // Chip Contact Grid Lines
      ctx.strokeStyle = "rgba(70, 45, 5, 0.75)";
      ctx.lineWidth = 1.8;

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(chipX, chipY + chipH * 0.35);
      ctx.lineTo(chipX + chipW, chipY + chipH * 0.35);
      ctx.moveTo(chipX, chipY + chipH * 0.65);
      ctx.lineTo(chipX + chipW, chipY + chipH * 0.65);

      // Center rectangle box
      ctx.roundRect(chipX + chipW * 0.3, chipY + chipH * 0.25, chipW * 0.4, chipH * 0.5, 4);

      // Vertical lines
      ctx.moveTo(chipX + chipW * 0.5, chipY);
      ctx.lineTo(chipX + chipW * 0.5, chipY + chipH * 0.25);
      ctx.moveTo(chipX + chipW * 0.5, chipY + chipH * 0.75);
      ctx.lineTo(chipX + chipW * 0.5, chipY + chipH);
      ctx.stroke();

      // Bottom Typography: Large Outlined "veldar"
      ctx.font = "bold 210px system-ui, -apple-system, sans-serif";
      ctx.letterSpacing = "-2px";
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#ffb020";
      ctx.strokeText("veldar", 50, h - 50);

      // Inner subtle glow fill for "veldar" text
      ctx.fillStyle = "rgba(255, 100, 30, 0.08)";
      ctx.fillText("veldar", 50, h - 50);
    };

    drawCardTexture();

    // ── 2. Three.js Scene Setup ─────────────────────────────────────────────
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 350;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ── 3. Texture & Material ───────────────────────────────────────────────
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Create 3D Rounded Card Geometry using Shape & Extrude
    const cardWidth = 4.2;
    const cardHeight = 2.65;
    const radius = 0.25;
    const depth = 0.04;

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
      bevelSize: 0.015,
      bevelThickness: 0.015,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    // Front Material (Card Face)
    const frontMaterial = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.2,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });

    // Back / Side Material
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a0404,
      metalness: 0.4,
      roughness: 0.3,
    });

    const cardMesh = new THREE.Mesh(geometry, [frontMaterial, sideMaterial]);
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;
    scene.add(cardMesh);

    // ── 4. Lighting ────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(5, 5, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Interactive Point Light that tracks the mouse specular shine
    const shineLight = new THREE.PointLight(0xff6a2e, 4, 12);
    shineLight.position.set(0, 0, 4);
    scene.add(shineLight);

    // Soft Rim Backlight
    const rimLight = new THREE.PointLight(0xff2200, 3, 10);
    rimLight.position.set(-4, -3, -2);
    scene.add(rimLight);

    // ── 5. Mouse Interaction & Animation Loop ──────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      // Mouse normalized between -1 and 1
      mouseX = (px - 0.5) * 2;
      mouseY = (py - 0.5) * 2;

      // Tilt angles
      targetRotY = mouseX * 0.45;
      targetRotX = -mouseY * 0.35;

      // Move shine light with cursor
      shineLight.position.x = mouseX * 3;
      shineLight.position.y = -mouseY * 2;
    };

    const handlePointerLeave = () => {
      mouseX = 0;
      mouseY = 0;
      targetRotX = 0;
      targetRotY = 0;
      shineLight.position.set(0, 0, 4);
    };

    container.addEventListener("mousemove", handlePointerMove);
    container.addEventListener("mouseleave", handlePointerLeave);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth interpolation for 3D tilt
      cardMesh.rotation.x += (targetRotX - cardMesh.rotation.x) * 0.08;
      cardMesh.rotation.y += (targetRotY - cardMesh.rotation.y) * 0.08;

      // Idle floating animation
      cardMesh.position.y = Math.sin(elapsedTime * 1.8) * 0.08;
      cardMesh.rotation.z = Math.sin(elapsedTime * 1.2) * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // ── 6. Cleanup ──────────────────────────────────────────────────────────
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
      className="relative flex h-[380px] w-full items-center justify-center overflow-hidden rounded-[2rem] cursor-grab active:cursor-grabbing"
    >
      {/* Subtle Glow Ring behind the 3D card */}
      <div
        className={`absolute inset-4 rounded-[2rem] bg-gradient-to-tr from-[#ff3b00]/20 via-[#ff6a2e]/10 to-transparent blur-2xl transition-opacity duration-700 ${
          isHovered ? "opacity-100" : "opacity-60"
        }`}
      />
    </div>
  );
}
