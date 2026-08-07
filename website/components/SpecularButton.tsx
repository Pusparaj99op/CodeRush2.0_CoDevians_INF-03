"use client";

import React from "react";
import "./SpecularButton.css";

export interface SpecularButtonProps {
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
}

export default function SpecularButton({
  children = "Get Started",
  size = "lg",
  radius = 9999,
  tint = "#ff5228",
  tintOpacity = 0.15,
  textColor = "#ffffff",
  lineColor = "#ff7a59",
  baseColor = "#ff5228",
  disabled = false,
  onClick,
  className = "",
  type = "button",
  style,
}: SpecularButtonProps) {
  // Accent orange detection
  const isAccent =
    baseColor?.toLowerCase().includes("ff5228") ||
    tint?.toLowerCase().includes("ff5228") ||
    lineColor?.toLowerCase().includes("ff7a59") ||
    baseColor?.toLowerCase().includes("ff4a1f");

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`specular-button specular-button--${size}${isAccent ? " specular-button--accent" : ""}${
        className ? ` ${className}` : ""
      }`}
      style={{
        "--sb-radius": `${radius}px`,
        "--sb-text-color": textColor,
        ...style,
      } as React.CSSProperties}
    >
      <span className="specular-button__label">{children}</span>
    </button>
  );
}
