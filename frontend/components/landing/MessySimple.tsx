"use client";

import React, { useEffect, useRef, useState } from "react";

const SCATTERED = [
  "WhatsApp threads",
  "Google Sheets",
  "Email drafts",
  "Sticky notes",
  "Notion pages",
  "Separate invoicing tool",
  "Another project app",
  "Calendar reminders",
  "Excel files",
  "Paper receipts",
];

const UNIFIED = [
  { label: "Clients",   icon: "clients"  },
  { label: "Deals",     icon: "deals"    },
  { label: "Projects",  icon: "projects" },
  { label: "Tasks",     icon: "tasks"    },
  { label: "Invoices",  icon: "invoices" },
  { label: "Payments",  icon: "payments" },
  { label: "Activity",  icon: "activity" },
];

function ItemIcon({ type }: { type: string }) {
  const cls = "w-3 h-3 text-[#5A5A5A]";
  const icons: Record<string, React.ReactElement> = {
    clients:  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    deals:    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
    projects: <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    tasks:    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    invoices: <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    payments: <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    activity: <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  };
  return icons[type] || <span />;
}

export function MessySimple() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [converged, setConverged] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setConverged(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-28 bg-[#FAFAF8] border-t border-[rgba(0,0,0,0.06)]">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start">

          {/* Left — Messy */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-[600] text-[#AFAFAF] uppercase tracking-[0.08em]">The problem</span>
              <h2 className="text-[30px] sm:text-[40px] font-[800] tracking-[-0.04em] text-[#0A0A0A] leading-[1.1]">
                Too many places<br />to run one business.
              </h2>
              <p className="text-[15px] text-[#5A5A5A] leading-[1.65]">
                Running a business often means jumping between too many tools. Context gets lost. Time gets wasted. Things fall through the gaps.
              </p>
            </div>

            {/* Scattered tools — subtle convergence on scroll */}
            <div className="flex flex-wrap gap-2" aria-label="Scattered tools">
              {SCATTERED.map((tool, i) => (
                <span
                  key={tool}
                  className="px-3 py-1.5 rounded-full border border-[rgba(0,0,0,0.08)] bg-white text-[12px] font-[400] text-[#5A5A5A] transition-all duration-600 ease-out"
                  style={{
                    opacity: converged ? 0.25 + (i % 4) * 0.1 : 0.6 + (i % 4) * 0.1,
                    transform: converged
                      ? `translate(${(i % 3 - 1) * 8}px, ${(i % 2) * 4}px) rotate(${(i % 3 - 1) * 2}deg)`
                      : `rotate(${(i % 3 - 1) * 1}deg)`,
                    transitionDelay: `${i * 40}ms`,
                  }}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Simple */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-[600] text-[#AFAFAF] uppercase tracking-[0.08em]">The solution</span>
              <h2 className="text-[30px] sm:text-[40px] font-[800] tracking-[-0.04em] text-[#0A0A0A] leading-[1.1]">
                One workspace.<br /><span className="text-[#8A8A8A]">Less chasing.</span>
              </h2>
              <p className="text-[15px] text-[#5A5A5A] leading-[1.65]">
                GrowSuite connects every part of your business. Clients, deals, projects and invoices — all together. Nothing to stitch. Nothing to sync.
              </p>
            </div>

            {/* GrowSuite unified — appears when converged */}
            <div
              className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] overflow-hidden shadow-sm transition-all duration-500 ease-out"
              style={{
                opacity: converged ? 1 : 0.4,
                transform: converged ? "translateY(0)" : "translateY(12px)",
                transitionDelay: "200ms",
              }}
              aria-label="GrowSuite unified workspace"
            >
              <div className="px-4 py-3 border-b border-[rgba(0,0,0,0.06)] flex items-center gap-2">
                <div className="h-5 w-5 rounded-[5px] bg-[#0A0A0A] flex items-center justify-center" aria-hidden="true">
                  <svg width="10" height="8" viewBox="0 0 18 14" fill="none">
                    <path d="M7.2 1C4.1 1 1.6 3.5 1.6 6.9C1.6 10.3 4.1 12.8 7.2 12.8C9.5 12.8 11.3 11.6 12 9.8H7.8V7.8H14.2V9C14.2 11.8 11.1 14 7.2 14C3.2 14 0 10.8 0 6.9C0 3 3.2 0 7.2 0C9.5 0 11.5 1 12.7 2.6L11.3 3.9C10.4 2.7 8.9 2 7.2 2" fill="white" transform="scale(0.7) translate(0.5, 0)"/>
                    <text x="12.5" y="8.5" fontSize="5.5" fontWeight="700" fill="white" fontFamily="ui-sans-serif, sans-serif">s</text>
                  </svg>
                </div>
                <span className="text-[12px] font-[600] text-[#0A0A0A]">GrowSuite</span>
              </div>
              <div className="divide-y divide-[rgba(0,0,0,0.05)]">
                {UNIFIED.map((item, i) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-4 py-2.5 transition-all duration-300 ease-out"
                    style={{
                      opacity: converged ? 1 : 0,
                      transform: converged ? "translateX(0)" : "translateX(-8px)",
                      transitionDelay: converged ? `${250 + i * 60}ms` : "0ms",
                    }}
                  >
                    <div className="h-6 w-6 rounded-[5px] bg-[#F5F5F0] flex items-center justify-center shrink-0" aria-hidden="true">
                      <ItemIcon type={item.icon} />
                    </div>
                    <span className="text-[12.5px] font-[500] text-[#0A0A0A]">{item.label}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#AFAFAF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
