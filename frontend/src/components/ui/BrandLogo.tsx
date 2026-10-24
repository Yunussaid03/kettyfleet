import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  showWordmark?: boolean;
}

/**
 * KettyFleet Brand Mark & Wordmark
 * Inspired by dynamic logistics routes, forward kinetic motion, and fleet synergy.
 * Precision SVG vector with clean geometric geometry.
 */
export default function BrandLogo({
  className = "",
  size = "md",
  variant = "dark", // 'dark' = for dark backgrounds (Sidebar), 'light' = for white/light surfaces
  showWordmark = true,
}: LogoProps) {
  const iconDimensions = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  }[size];

  const titleSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  }[size];

  const subSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-xs",
  }[size];

  const textColor = variant === "dark" ? "text-white" : "text-slate-900";
  const subColor = variant === "dark" ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Precision Vector Fleet Icon */}
      <div
        className={`relative flex ${iconDimensions} shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 shadow-md shadow-blue-900/20`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-white"
        >
          {/* Kinetic Fleet Chevron / Wing */}
          <path
            d="M6 16.5L14 8.5L20 14.5L14 20.5L6 16.5Z"
            fill="currentColor"
            fillOpacity="0.4"
          />
          <path
            d="M13 14L21 6L27 12L19 20L13 14Z"
            fill="currentColor"
            fillOpacity="0.95"
          />
          <path
            d="M9 22L15 16L18 19L12 25L9 22Z"
            fill="currentColor"
            fillOpacity="0.75"
          />
          {/* Leading Route Node */}
          <circle cx="21" cy="6" r="2.2" fill="#60A5FA" />
        </svg>
      </div>

      {showWordmark && (
        <div className="leading-tight">
          <div className="flex items-center space-x-1.5">
            <span
              className={`font-black tracking-tight ${titleSizes} ${textColor}`}
            >
              Ketty<span className="text-blue-500">Fleet</span>
            </span>
          </div>
          <p
            className={`font-medium tracking-wide uppercase ${subSizes} ${subColor}`}
          >
            Fleet ERP &bull; Logistics
          </p>
        </div>
      )}
    </div>
  );
}
