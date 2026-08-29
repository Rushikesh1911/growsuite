import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  theme?: "light" | "dark";
  showWordmark?: boolean;
}

export function Logo({ className = "", theme = "light", showWordmark = true }: LogoProps) {
  const isDark = theme === "dark";
  
  // The primary fill of the stacked diamonds
  const fillColor = isDark ? "white" : "var(--gs-bg-alt)";
  
  // The stroke color acts as a cutout border where the shapes overlap.
  // It should match the background the logo is sitting on.
  const strokeColor = isDark ? "var(--gs-bg)" : "#FAFAF8";
  
  const textColor = isDark ? "text-white" : "text-[var(--gs-bg-alt)]";

  return (
    <div className={`flex items-center gap-2.5 group shrink-0 ${className}`}>
      {/* The Icon */}
      <div className={`h-[28px] w-[28px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox="140 150 66 66" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="158" y="179.414" width="22" height="22" rx="4" transform="rotate(45 158 179.414)" fill={fillColor} stroke={strokeColor} strokeWidth="2"/>
          <rect x="168" y="169.414" width="22" height="22" rx="4" transform="rotate(45 168 169.414)" fill={fillColor} stroke={strokeColor} strokeWidth="2"/>
          <g filter="url(#filter0_d_2_4)">
            <rect x="178" y="158" width="24" height="24" rx="5" transform="rotate(45 178 158)" fill={fillColor}/>
            <rect x="178" y="159.414" width="22" height="22" rx="4" transform="rotate(45 178 159.414)" stroke={strokeColor} strokeWidth="2"/>
          </g>
          <defs>
            <filter id="filter0_d_2_4" x="151.1" y="152.071" width="53.799" height="53.799" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dy="4"/>
              <feGaussianBlur stdDeviation="6"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2_4"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2_4" result="shape"/>
            </filter>
          </defs>
        </svg>
      </div>
      
      {/* The Wordmark */}
      {showWordmark && (
        <span className={`text-[17px] font-[800] tracking-[-0.03em] ${textColor}`}>
          GrowSuite
        </span>
      )}
    </div>
  );
}
