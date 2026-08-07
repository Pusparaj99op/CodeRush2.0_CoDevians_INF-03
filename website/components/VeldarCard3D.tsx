"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function VeldarCard3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── 1. Three.js Scene Setup ─────────────────────────────────────────────
    const getContainerSize = () => ({
      w: container.clientWidth || 550,
      h: container.clientHeight || 400,
    });

    const initialSize = getContainerSize();
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, initialSize.w / initialSize.h, 0.1, 1000);
    camera.position.set(0, 0, 5.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(initialSize.w, initialSize.h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ── 2. Load Exact SVG Card Texture ──────────────────────────────────────
    const textureLoader = new THREE.TextureLoader();
    const frontMaterial = new THREE.MeshPhysicalMaterial({
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.6,
      clearcoatRoughness: 0.15,
      reflectivity: 0.8,
    });

    textureLoader.load("/veldar_card.svg", (texture) => {
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.colorSpace = THREE.SRGBColorSpace;
      frontMaterial.map = texture;
      frontMaterial.needsUpdate = true;
    });

    // ── 3. Create 3D Extruded Card Geometry (1000x600 Aspect Ratio = 1.667) ──
    const cardWidth = 4.6;
    const cardHeight = 2.76;
    const radius = 0.18;
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
      bevelSize: 0.015,
      bevelThickness: 0.015,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    // Dark crimson side material
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b0503,
      metalness: 0.4,
      roughness: 0.3,
    });

    const cardMesh = new THREE.Mesh(geometry, [frontMaterial, sideMaterial]);
    scene.add(cardMesh);

    // ── 4. Balanced Lighting ────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(3, 4, 5);
    scene.add(mainLight);

    // Soft specular tracking light
    const shineLight = new THREE.PointLight(0xff4a1f, 1.5, 10);
    shineLight.position.set(2, 2, 4);
    scene.add(shineLight);

    const rimLight = new THREE.DirectionalLight(0x8c1207, 0.8);
    rimLight.position.set(-3, -3, 2);
    scene.add(rimLight);

    // ── 5. Mouse Interaction & Parallax Animation ───────────────────────────
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

      // Smooth 3D tilt lerp
      cardMesh.rotation.x += (targetRotX - cardMesh.rotation.x) * 0.08;
      cardMesh.rotation.y += (targetRotY - cardMesh.rotation.y) * 0.08;

      // Idle float animation
      cardMesh.position.y = Math.sin(elapsedTime * 1.6) * 0.06;
      cardMesh.rotation.z = Math.sin(elapsedTime * 1.1) * 0.015;

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
      className="relative flex h-[380px] md:h-[420px] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c0a09]/80 shadow-[0_25px_60px_rgba(0,0,0,0.7)] backdrop-blur-md cursor-grab active:cursor-grabbing"
    >
      {/* Background Ambient Glow */}
      <div
        className={`absolute inset-6 rounded-[2rem] bg-gradient-to-tr from-[#ff3b0f]/30 via-[#e8280a]/15 to-transparent blur-3xl transition-opacity duration-700 pointer-events-none ${
          isHovered ? "opacity-100 scale-105" : "opacity-50 scale-100"
        }`}
      />
    </div>
  );
}
