"use client";

import { useState, useEffect, useRef } from "react";

const EVENTS = [
  {
    time: "10:42",
    title: "New lead",
    sub: "Priya Mehta — Meridian Studio, via website form",
    icon: "lead",
    delay: 0,
  },
  {
    time: "10:48",
    title: "Deal moved to Proposal",
    sub: "Platform Integration — Bloom Ventures — ₹2,40,000",
    icon: "deal",
    delay: 900,
  },
  {
    time: "11:03",
    title: "Invoice sent",
    sub: "#GS-1043 — Brand Identity Refresh — ₹75,000",
    icon: "invoice",
    delay: 1800,
  },
  {
    time: "11:27",
    title: "Payment received",
    sub: "#GS-1042 — Nexus Labs — ₹1,20,000",
    icon: "payment",
    delay: 2700,
  },
];

function EventIcon({ type }: { type: string }) {
  const cls = "w-3.5 h-3.5 text-[var(--gs-muted)]";
  if (type === "lead") return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
  if (type === "deal") return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
    </svg>
  );
  if (type === "invoice") return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"/><path d="M12 6v2m0 8v2"/>
    </svg>
  );
}

export function DarkActivity() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          EVENTS.forEach((ev, i) => {
            setTimeout(() => {
              setVisibleCount(c => Math.max(c, i + 1));
              setHighlightedIndex(i);
              
              // Remove highlight after a delay, UNLESS it's the final event
              if (i !== EVENTS.length - 1) {
                setTimeout(() => {
                  setHighlightedIndex(prev => prev === i ? null : prev);
                }, 800); 
              }
            }, ev.delay);
          });
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-[var(--gs-bg)] py-32 overflow-hidden" style={{ scrollMarginTop: "64px" }}>
      
      {/* Subtle radial ambient light behind the activity feed */}
      <div 
        className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.03] pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, var(--gs-fg) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[4fr_6fr] gap-16 md:gap-20 items-center">

          {/* Left - Copy */}
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-[600] text-[#3A3A3A] uppercase tracking-[0.09em]">Activity</span>
              <h2 className="text-[32px] sm:text-[40px] md:text-[46px] font-[800] tracking-tighter text-[var(--gs-fg)] leading-[1.05]">
                From first conversation.
                <br />
                <span className="text-[#77777A]">To paid invoice.</span>
              </h2>
              <p className="text-[16px] text-[#707070] leading-[1.6] max-w-sm font-[400] tracking-tight">
                GrowSuite automatically logs everything that happens in your business—from the first lead to the final payment.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {[
                "Every action captured automatically.",
                "One timeline from lead to payment.",
                "Complete visibility for your team.",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3.5">
                  <div className="h-4 w-4 rounded-full border border-[var(--gs-border)] flex items-center justify-center mt-0.5 shrink-0 bg-[#0E0E0E]" aria-hidden="true">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#555]" />
                  </div>
                  <span className="text-[14.5px] font-[500] text-[#808080] tracking-tight leading-[1.5]">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Activity Feed Demo */}
          <div
            className="flex flex-col bg-[#0D0F12] border border-[#1C1E22] rounded-[16px] overflow-hidden shadow-2xl"
            role="log"
            aria-label="Activity feed demo"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1C1E22]">
              <span className="text-[14px] font-[600] text-[#E0E0E0] tracking-tight">Activity feed</span>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse opacity-80" aria-hidden="true" />
                <span className="text-[10px] text-[var(--gs-muted)] font-[600] uppercase tracking-widest opacity-30">Live</span>
              </div>
            </div>

            {/* Events */}
            <div className="flex flex-col divide-y divide-[#16181C]">
              {EVENTS.map((event, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 px-6 py-6 transition-all duration-700 ease-out"
                  style={{
                    opacity: visibleCount > i ? 1 : 0,
                    transform: visibleCount > i ? "translateX(0)" : "translateX(12px)",
                    backgroundColor: highlightedIndex === i ? "rgba(255,255,255,0.02)" : "transparent",
                  }}
                >
                  <span className="text-[11px] text-[#404040] tabular-nums pt-1 shrink-0 w-10 font-mono tracking-tighter">
                    {event.time}
                  </span>
                  <div 
                    className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500" 
                    style={{
                      backgroundColor: highlightedIndex === i ? "var(--gs-border)" : "var(--gs-surface)",
                      border: "1px solid",
                      borderColor: highlightedIndex === i ? "#333" : "var(--gs-border)",
                    }}
                    aria-hidden="true"
                  >
                    <EventIcon type={event.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p 
                      className="text-[13.5px] font-[600] leading-snug tracking-tight transition-colors duration-500"
                      style={{ color: highlightedIndex === i ? "var(--gs-fg)" : "#AFAFAF" }}
                    >
                      {event.title}
                    </p>
                    <p className="text-[12.5px] text-[#606060] mt-1 leading-snug tracking-tight truncate">
                      {event.sub}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Empty state pad for bottom to ensure spacing */}
              <div className="px-6 py-2" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
