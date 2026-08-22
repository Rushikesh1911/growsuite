"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";

// ── Demo Data ──────────────────────────────────────────────
const DEMO_STAGES = ["QUALIFIED", "PROPOSAL", "NEGOTIATION"] as const;
type Stage = typeof DEMO_STAGES[number];

interface DemoCard {
  id: number;
  title: string;
  company: string;
  value: string;
  probability: number;
  close: string;
  stage: Stage;
  contactName: string;
  note: string;
}

const DEMO_CARDS: DemoCard[] = [
  { id: 1, title: "Website Redesign", company: "Meridian Studio", value: "₹75,000", probability: 65, close: "Sep 30", stage: "QUALIFIED", contactName: "Priya Mehta", note: "Interested in full brand refresh. Budget confirmed." },
  { id: 2, title: "Annual Retainer", company: "Nexus Labs", value: "₹1,20,000", probability: 50, close: "Oct 15", stage: "QUALIFIED", contactName: "Arjun Sharma", note: "Needs approval from finance team." },
  { id: 3, title: "Platform Integration", company: "Bloom Ventures", value: "₹2,40,000", probability: 75, close: "Oct 05", stage: "PROPOSAL", contactName: "Sara Kapoor", note: "Proposal sent. Follow-up call scheduled for Monday." },
  { id: 4, title: "Q4 Consulting", company: "Vanta Systems", value: "₹90,000", probability: 80, close: "Sep 25", stage: "NEGOTIATION", contactName: "Vikram Nair", note: "Final terms under review. Likely to close this week." },
];

const STAGE_LABELS: Record<Stage, string> = {
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
};

const STAGE_TOTALS: Record<Stage, string> = {
  QUALIFIED: "₹1,95,000",
  PROPOSAL: "₹2,40,000",
  NEGOTIATION: "₹90,000",
};

// ── Sidebar Nav Items ──────────────────────────────────────
const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
        <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
      </svg>
    ),
  },
  {
    id: "leads",
    label: "Leads",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
  {
    id: "pipeline",
    label: "Pipeline",
    active: true,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
      </svg>
    ),
  },
  {
    id: "clients",
    label: "Clients",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: "projects",
    label: "Projects",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
];

export function Hero() {
  const [visible, setVisible] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<DemoCard | null>(null);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const openDeal = useCallback((card: DemoCard) => {
    setSelectedDeal(card);
    setTimeout(() => setDrawerMounted(true), 10);
  }, []);

  const closeDeal = useCallback(() => {
    setDrawerMounted(false);
    setTimeout(() => setSelectedDeal(null), 250);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeDeal();
      }
    };
    if (selectedDeal) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [selectedDeal, closeDeal]);

  const cardsByStage = useCallback((stage: Stage) =>
    DEMO_CARDS.filter(c => c.stage === stage), []);

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-[#FAFAF8] pt-28 pb-0 min-h-screen">

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.016) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.016) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[1100px] mx-auto px-6 flex flex-col items-center text-center">

        {/* ── Eyebrow ─────────────────────────────────── */}
        <div
          className="transition-[opacity,transform] duration-500 ease-out mb-6"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(10px)" }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(0,0,0,0.1)] bg-white text-[11.5px] font-[500] text-[#666]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8A8A8A]" aria-hidden="true" />
            Simple business management for real teams
          </span>
        </div>

        {/* ── Headline ─────────────────────────────────── */}
        <h1
          className="text-[52px] sm:text-[72px] md:text-[88px] font-[800] tracking-[-0.05em] text-[#0A0A0A] leading-[0.95] max-w-[820px] transition-[opacity,transform] duration-600 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(18px)",
            transitionDelay: "80ms",
          }}
        >
          Run your business.
          <br />
          <span style={{ color: "#8A8A8A" }}>Not your CRM.</span>
        </h1>

        {/* ── Subtitle ─────────────────────────────────── */}
        <p
          className="mt-7 text-[17px] text-[#5A5A5A] max-w-[520px] leading-[1.65] font-[400] transition-[opacity,transform] duration-500 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(12px)",
            transitionDelay: "160ms",
            letterSpacing: "-0.01em",
          }}
        >
          GrowSuite keeps your clients, deals, projects and invoices
          connected — so you can focus on the work, not the admin.
        </p>

        {/* ── CTAs ─────────────────────────────────────── */}
        <div
          className="mt-8 flex flex-col sm:flex-row items-center gap-3 transition-[opacity,transform] duration-500 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(10px)",
            transitionDelay: "240ms",
          }}
        >
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A0A0A] hover:bg-[#2A2A2A] text-white text-[14px] font-[500] rounded-full shadow-sm hover:-translate-y-px transition-all duration-150"
          >
            Start for free
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 6h7M6 2.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <a
            href="#product"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#F5F5F0] text-[#0A0A0A] text-[14px] font-[500] rounded-full border border-[rgba(0,0,0,0.1)] shadow-sm hover:-translate-y-px transition-all duration-150"
          >
            See how it works
          </a>
        </div>

        {/* ── Product Demo — Pipeline ────────────────────────── */}
        <div
          className="relative w-full mt-10 transition-[opacity,transform] duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(24px)",
            transitionDelay: "360ms",
          }}
          aria-label="GrowSuite Pipeline demo"
        >
          {/* Browser chrome frame */}
          <div className="w-full rounded-t-[14px] overflow-hidden border border-b-0 border-[rgba(0,0,0,0.1)] shadow-[0_-4px_40px_rgba(0,0,0,0.07)] bg-white">
            {/* Title bar */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#F8F8F6] border-b border-[rgba(0,0,0,0.07)]">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-[#FF5F57] opacity-80" />
                <span className="h-3 w-3 rounded-full bg-[#FFBD2E] opacity-80" />
                <span className="h-3 w-3 rounded-full bg-[#28CA41] opacity-80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-6 w-[200px] rounded-[5px] bg-white border border-[rgba(0,0,0,0.08)] flex items-center px-2.5 gap-1.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#AFAFAF" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <span className="text-[10px] text-[#AFAFAF] font-[400] truncate">app.growsuite.io/pipeline</span>
                </div>
              </div>
            </div>

            {/* App shell */}
            <div className="flex h-[480px] overflow-hidden text-left" role="application">

              {/* Sidebar */}
              <aside className="w-[200px] bg-[#080808] border-r border-[#1F1F1F] flex flex-col shrink-0 p-3 gap-0.5" aria-label="Navigation">
                {/* Workspace */}
                <div className="flex items-center gap-2.5 px-2.5 py-2 mb-3 rounded-[7px] bg-[#141414]">
                  <div className="w-5 h-5 rounded-[4px] bg-[#2A2A2A] border border-[#333] flex items-center justify-center text-[9px] font-[700] text-[#888] shrink-0">G</div>
                  <span className="text-[12px] font-[500] text-[#EDEDED] truncate leading-none">GrowSuite Demo</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" className="shrink-0 ml-auto" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
                </div>

                {/* Nav links */}
                <nav className="flex flex-col gap-0.5">
                  {NAV_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-[6px] text-[12px] font-[500] select-none ${
                        item.active
                          ? "bg-[#1A1A1A] text-[#EDEDED]"
                          : "text-[#6B6B6B]"
                      }`}
                    >
                      <span className={item.active ? "text-[#EDEDED]" : "text-[#4A4A4A]"} aria-hidden="true">
                        {item.icon}
                      </span>
                      {item.label}
                    </div>
                  ))}
                </nav>
              </aside>

              {/* Main area */}
              <div className="flex-1 flex flex-col bg-[#FAFAF8] overflow-hidden">

                {/* Topbar */}
                <div className="h-[52px] border-b border-[rgba(0,0,0,0.07)] flex items-center justify-between px-5 bg-white shrink-0">
                  <div className="flex items-center gap-3">
                    <h2 className="text-[14px] font-[600] text-[#0A0A0A] tracking-[-0.02em]">Sales Pipeline</h2>
                    <span className="text-[11px] text-[#AFAFAF] font-[400]">4 deals · ₹5,25,000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 text-[12px] font-[500] text-[#6B6B6B] px-2.5 py-1.5 border border-[rgba(0,0,0,0.08)] rounded-[7px] bg-white hover:bg-[#F5F5F0] transition-colors" aria-label="Filter deals">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                      Filter
                    </button>
                    <button className="flex items-center gap-1.5 text-[12px] font-[500] text-white px-3 py-1.5 bg-[#0A0A0A] rounded-[7px] hover:bg-[#2A2A2A] transition-colors" aria-label="Create new deal">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 1v10M1 6h10"/></svg>
                      New deal
                    </button>
                  </div>
                </div>

                {/* Kanban */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                  <div className="flex gap-4 p-5 h-full min-w-max">
                    {DEMO_STAGES.map((stage) => {
                      const cards = cardsByStage(stage);
                      return (
                        <div key={stage} className="w-[260px] flex flex-col shrink-0">
                          <div className="flex items-center justify-between mb-3 px-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-[600] text-[#0A0A0A] uppercase tracking-[0.06em]">
                                {STAGE_LABELS[stage]}
                              </span>
                              <span className="text-[10px] text-[#AFAFAF] font-[400] tabular-nums">{cards.length}</span>
                            </div>
                            <span className="text-[11px] font-[500] text-[#8A8A8A] tabular-nums">{STAGE_TOTALS[stage]}</span>
                          </div>

                          <div className="flex flex-col gap-2.5">
                            {cards.map((card) => (
                              <button
                                key={card.id}
                                onClick={() => openDeal(card)}
                                className={`group w-full text-left p-3.5 bg-white border rounded-[10px] flex flex-col gap-2.5 transition-all duration-150 cursor-pointer hover:border-[rgba(0,0,0,0.15)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-1 ${
                                  selectedDeal?.id === card.id
                                    ? "border-[#0A0A0A] shadow-sm ring-1 ring-[#0A0A0A]/10"
                                    : "border-[rgba(0,0,0,0.08)]"
                                }`}
                                aria-label={`Open deal: ${card.title} at ${card.company}`}
                              >
                                <div>
                                  <p className="text-[12.5px] font-[600] text-[#0A0A0A] leading-snug">{card.title}</p>
                                  <p className="text-[11px] text-[#8A8A8A] mt-0.5 font-[400]">{card.company}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[12px] font-[700] text-[#0A0A0A] tabular-nums">{card.value}</span>
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-1 w-14 rounded-full bg-[#F0F0EC] overflow-hidden" aria-hidden="true">
                                      <div
                                        className="h-full rounded-full bg-[#0A0A0A] transition-all duration-500"
                                        style={{ width: `${card.probability}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] text-[#AFAFAF] font-[400] tabular-nums">{card.probability}%</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#AFAFAF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                  <span className="text-[10px] text-[#AFAFAF] font-[400]">Close {card.close}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Deal Drawer — slides in from right */}
              {selectedDeal && (
                <div
                  ref={drawerRef}
                  className="w-[280px] border-l border-[rgba(0,0,0,0.08)] bg-white flex flex-col shrink-0 transition-all duration-250 ease-out overflow-y-auto"
                  style={{
                    opacity: drawerMounted ? 1 : 0,
                    transform: drawerMounted ? "translateX(0)" : "translateX(20px)",
                  }}
                  role="dialog"
                  aria-label={`Deal: ${selectedDeal.title}`}
                >
                  {/* Drawer header */}
                  <div className="flex items-start justify-between p-4 border-b border-[rgba(0,0,0,0.07)]">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-[13px] font-[600] text-[#0A0A0A] leading-snug truncate">{selectedDeal.title}</p>
                      <p className="text-[11px] text-[#8A8A8A] mt-0.5">{selectedDeal.company}</p>
                    </div>
                    <button
                      onClick={closeDeal}
                      className="h-6 w-6 rounded-[5px] flex items-center justify-center text-[#AFAFAF] hover:text-[#0A0A0A] hover:bg-[#F5F5F0] transition-colors shrink-0"
                      aria-label="Close deal drawer"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11"/></svg>
                    </button>
                  </div>

                  {/* Drawer fields */}
                  <div className="flex flex-col gap-0 divide-y divide-[rgba(0,0,0,0.05)]">
                    <DrawerField label="Value" value={selectedDeal.value} mono />
                    <DrawerField label="Stage" value={STAGE_LABELS[selectedDeal.stage]} />
                    <DrawerField label="Probability" value={`${selectedDeal.probability}%`} />
                    <DrawerField label="Close date" value={selectedDeal.close} />
                    <DrawerField label="Contact" value={selectedDeal.contactName} />
                  </div>

                  {/* Note */}
                  <div className="p-4 flex-1">
                    <p className="text-[10px] font-[600] text-[#AFAFAF] uppercase tracking-[0.07em] mb-2">Note</p>
                    <p className="text-[12px] text-[#5A5A5A] leading-[1.6]">{selectedDeal.note}</p>
                  </div>

                  {/* Actions */}
                  <div className="p-4 border-t border-[rgba(0,0,0,0.07)] flex flex-col gap-2">
                    <button className="w-full h-8 rounded-[7px] bg-[#0A0A0A] text-white text-[12px] font-[500] hover:bg-[#2A2A2A] transition-colors">
                      Move to next stage
                    </button>
                    <button className="w-full h-8 rounded-[7px] border border-[rgba(0,0,0,0.1)] text-[#5A5A5A] text-[12px] font-[400] hover:bg-[#F5F5F0] transition-colors">
                      Add note
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hint below frame */}
          <p className="text-center text-[11px] text-[#AFAFAF] font-[400] mt-4 pb-12 transition-[opacity] duration-500" style={{ opacity: visible ? 1 : 0, transitionDelay: "700ms" }}>
            Click any deal to inspect it. This is the real GrowSuite interface.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Helper ─────────────────────────────────────────────────
function DrawerField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 gap-3">
      <span className="text-[10px] font-[500] text-[#AFAFAF] uppercase tracking-[0.06em] shrink-0">{label}</span>
      <span className={`text-[12px] font-[500] text-[#0A0A0A] text-right truncate ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
