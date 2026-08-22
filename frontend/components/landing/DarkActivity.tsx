"use client";

import { useState, useEffect, useRef } from "react";

// Uses exact same event/action types as ActivityFeed.tsx
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
    sub: "Platform Integration · Bloom Ventures · ₹2,40,000",
    icon: "deal",
    delay: 400,
  },
  {
    time: "11:03",
    title: "Invoice sent",
    sub: "#GS-1043 · Brand Identity Refresh · ₹75,000",
    icon: "invoice",
    delay: 800,
  },
  {
    time: "11:27",
    title: "Payment received",
    sub: "#GS-1042 · Nexus Labs · ₹1,20,000",
    icon: "payment",
    delay: 1200,
  },
];

function EventIcon({ type }: { type: string }) {
  const cls = "w-3.5 h-3.5 text-[#9A9A9A]";
  if (type === "lead") return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
  if (type === "deal") return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
    </svg>
  );
  if (type === "invoice") return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"/><path d="M12 6v2m0 8v2"/>
    </svg>
  );
}

export function DarkActivity() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger events
          EVENTS.forEach((ev, i) => {
            setTimeout(() => setVisibleCount(c => Math.max(c, i + 1)), ev.delay);
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
    <section ref={sectionRef} className="bg-[#080808] py-28" style={{ scrollMarginTop: "64px" }}>
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center">

          {/* Left — Copy */}
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-[600] text-[#3A3A3A] uppercase tracking-[0.09em]">Activity</span>
              <h2 className="text-[32px] sm:text-[44px] font-[800] tracking-[-0.04em] text-[#EDEDED] leading-[1.1]">
                From first conversation.
                <br />
                <span className="text-[#555555]">To paid invoice.</span>
              </h2>
              <p className="text-[15px] text-[#707070] leading-[1.65] max-w-sm">
                GrowSuite automatically logs everything that happens in your business — every lead, deal, project update, invoice and payment.
              </p>
            </div>

            <div className="flex flex-col gap-3.5">
              {[
                "Every action logged automatically, in real time.",
                "Filter by leads, deals, clients, projects, invoices, payments.",
                "Complete visibility for you and your team.",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div className="h-4 w-4 rounded-full border border-[#2A2A2A] flex items-center justify-center mt-0.5 shrink-0" aria-hidden="true">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#5A5A5A]" />
                  </div>
                  <span className="text-[13px] text-[#707070] leading-[1.5]">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Activity Feed Demo (sequentially animated) */}
          <div
            className="flex flex-col bg-[#0E0E0E] border border-[#242424] rounded-[14px] overflow-hidden"
            role="log"
            aria-label="Activity feed demo"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E1E]">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                <span className="text-[13px] font-[600] text-[#E0E0E0]">Activity feed</span>
              </div>
              <span className="text-[10px] text-[#3A3A3A] font-[500] uppercase tracking-wider">Live</span>
            </div>

            {/* Events */}
            <div className="flex flex-col divide-y divide-[#161616]">
              {EVENTS.map((event, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 px-5 py-4 transition-all duration-400"
                  style={{
                    opacity: visibleCount > i ? 1 : 0,
                    transform: visibleCount > i ? "translateY(0)" : "translateY(6px)",
                    transitionDelay: `${event.delay}ms`,
                  }}
                >
                  <span className="text-[10px] text-[#4A4A4A] tabular-nums pt-0.5 shrink-0 w-10 font-mono">{event.time}</span>
                  <div className="h-7 w-7 rounded-full border border-[#2A2A2A] flex items-center justify-center shrink-0" aria-hidden="true">
                    <EventIcon type={event.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-[500] text-[#D8D8D8] leading-snug">{event.title}</p>
                    <p className="text-[11px] text-[#5A5A5A] mt-0.5 leading-snug">{event.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Final message */}
            <div
              className="px-5 py-4 border-t border-[#1A1A1A] transition-all duration-500"
              style={{
                opacity: visibleCount >= EVENTS.length ? 1 : 0,
                transitionDelay: "1600ms",
              }}
            >
              <p className="text-[11.5px] font-[500] text-[#5A5A5A] italic">
                From first conversation. To paid invoice. — All in one place.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
