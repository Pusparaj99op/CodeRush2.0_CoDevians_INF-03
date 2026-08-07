"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export function VeldarCard3D() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (py - 0.5) * -18,
      y: (px - 0.5) * 18,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="flex items-center justify-center w-full py-4">
      <style>{`
        @keyframes veldar-float {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-14px); }
          100% { transform: translateY(0px); }
        }
        .veldar-float {
          animation: veldar-float 3.6s ease-in-out infinite;
        }
        .veldar-card-wrap {
          transition: transform 0.15s ease-out;
        }
      `}</style>
      <div
        ref={cardRef}
        className="veldar-float"
        style={{ perspective: "900px" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="veldar-card-wrap"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
        >
          <Image
            src="/veldar_card.svg"
            alt="Veldar Card"
            width={520}
            height={312}
            priority
            style={{ display: "block", borderRadius: "1.25rem" }}
          />
        </div>
      </div>
    </div>
  );
}
