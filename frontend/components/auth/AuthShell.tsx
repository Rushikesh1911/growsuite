"use client";

import React from "react";
import Link from "next/link";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-16 selection:bg-black/10">
      
      {/* ── Top-left floating logo (Desktop) ── */}
      <div className="absolute top-8 left-8 hidden md:block">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-[28px] w-[28px] rounded-[7.5px] bg-[#0F0F0F] flex items-center justify-center group-hover:bg-[#222] transition-colors duration-150 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1.5L14 5v6L8 14.5 2 11V5L8 1.5Z" stroke="white" strokeOpacity="0.8" strokeWidth="1"/>
              <path d="M8 4.5L11.5 8 8 11.5 4.5 8 8 4.5Z" fill="white" fillOpacity="1"/>
            </svg>
          </div>
          <span className="text-[14px] font-[700] tracking-[-0.025em] text-[#111111]">GrowSuite</span>
        </Link>
      </div>

      <div className="w-full max-w-[360px] animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        {children}
      </div>
      
    </div>
  );
}
