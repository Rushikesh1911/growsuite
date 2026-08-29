"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { LayoutDashboard, Target, Layers, Users, FolderKanban, CheckSquare, Calendar, Receipt, CreditCard, LineChart, Activity, ChevronsUpDown, Settings, LifeBuoy, Menu } from "lucide-react";

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

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads", label: "Leads", icon: Target },
  { id: "pipeline", label: "Pipeline", icon: Layers, active: true },
  { id: "clients", label: "Clients", icon: Users },
  { type: "divider" },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { type: "divider" },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "payments", label: "Payments", icon: CreditCard },
  { type: "divider" },
  { id: "analytics", label: "Analytics", icon: LineChart },
  { id: "activity", label: "Activity", icon: Activity },
];

export function Hero() {
  const [visible, setVisible] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<DemoCard | null>(null);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 400], [0.95, 1]);
  const rotateX = useTransform(scrollY, [0, 400], [8, 0]);
  const y = useTransform(scrollY, [0, 400], [40, 0]);

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
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(0,0,0,0.1)] bg-white text-[11.5px] font-[500] text-[var(--gs-muted-light)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#28CA41] opacity-40"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#28CA41]"></span>
            </span>
            Simple business management for real teams
          </span>
        </div>

        {/* ── Headline ─────────────────────────────────── */}
        <h1
          className="text-[52px] sm:text-[72px] md:text-[88px] font-extrabold tracking-tighter leading-[0.9] max-w-[820px] transition-[opacity,transform] duration-600 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(18px)",
            transitionDelay: "80ms",
          }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-[var(--gs-bg)] to-[#404040]">
            Grow your business.
          </span>
          <br />
          <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-b from-[var(--gs-muted)] to-[#B0B0B0]">
            Not your CRM.
          </span>
        </h1>

        {/* ── Subtitle ─────────────────────────────────── */}
        <p
          className="mt-6 text-[17px] text-[#5A5A5A] max-w-[520px] leading-[1.5] font-[500] tracking-tight transition-[opacity,transform] duration-500 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(12px)",
            transitionDelay: "160ms",
          }}
        >
          GrowSuite keeps your clients, deals, projects and invoices
          connected — so you can focus on the work, not the admin.
        </p>

        {/* ── CTAs ─────────────────────────────────────── */}
        <div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 transition-[opacity,transform] duration-500 ease-out w-full"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(10px)",
            transitionDelay: "240ms",
          }}
        >
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--gs-bg-alt)] hover:bg-[var(--gs-border)] text-white text-[15px] font-[600] rounded-[8px] shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-px transition-all duration-200 w-full sm:w-auto"
          >
            Start for free
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 6h7M6 2.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <a
            href="#product"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-[#FAFAF8] text-[var(--gs-bg-alt)] text-[15px] font-[600] rounded-[8px] border border-[rgba(0,0,0,0.1)] shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200 w-full sm:w-auto"
          >
            See how it works
          </a>
        </div>

        {/* ── Switching Cost Subtext ─────────────────────────────────────── */}
        <div
          className="mt-4 flex items-center justify-center gap-2 text-[12.5px] text-[var(--gs-muted)] font-medium transition-[opacity,transform] duration-500 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(10px)",
            transitionDelay: "280ms",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#28CA41]">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
          </svg>
          Import your clients via CSV in 60 seconds. Setup takes 5 minutes, not 5 weeks.
        </div>

        {/* ── Product Demo — Pipeline ────────────────────────── */}
        <motion.div
          className="relative w-full mt-10 transition-opacity duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            scale,
            rotateX,
            y,
            perspective: 1000,
            transformStyle: "preserve-3d"
          }}
          aria-label="GrowSuite Pipeline demo"
        >
          {/* Browser chrome frame */}
          <div className="w-full rounded-[14px] overflow-hidden border border-[var(--gs-border)] shadow-[0_16px_80px_-12px_rgba(0,0,0,0.25)] bg-[var(--gs-bg-alt)]">
            {/* Title bar */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[var(--gs-bg)] border-b border-[var(--gs-border)]">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-[#FF5F57] opacity-80" />
                <span className="h-3 w-3 rounded-full bg-[#FFBD2E] opacity-80" />
                <span className="h-3 w-3 rounded-full bg-[#28CA41] opacity-80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-6 w-[200px] rounded-[5px] bg-[var(--gs-surface)] border border-[var(--gs-border)] flex items-center px-2.5 gap-1.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--gs-muted-light)" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <span className="text-[10px] text-[var(--gs-muted)] font-[400] truncate">app.growsuite.io/pipeline</span>
                </div>
              </div>
            </div>

            {/* App shell */}
            <div className="flex h-[480px] overflow-hidden text-left" role="application">

              {/* Sidebar */}
              <aside className="w-[200px] bg-[var(--gs-bg)] border-r border-[var(--gs-border)] flex flex-col shrink-0 text-[var(--gs-fg)]" aria-label="Navigation">
                {/* Workspace */}
                <div className="p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-7 w-7 rounded-[6px] hover:bg-[var(--gs-surface)] flex items-center justify-center text-[var(--gs-muted)] transition-colors shrink-0">
                        <Menu className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <div className="flex items-center justify-between flex-1 min-w-0 p-1.5 -ml-1.5 rounded-[6px] bg-[var(--gs-surface)]">
                        <span className="text-[14px] font-semibold tracking-tight leading-tight truncate text-[var(--gs-fg)] max-w-[130px]">Rugved Workspace</span>
                        <div className="h-5 w-5 rounded-[4px] border border-[var(--gs-border)] flex items-center justify-center bg-[var(--gs-bg-alt)] shrink-0">
                          <ChevronsUpDown className="h-3 w-3 text-[var(--gs-muted)]" strokeWidth={2} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-3 pb-4 flex flex-col gap-0.5 overflow-hidden">
                  {NAV_ITEMS.map((item, idx) => {
                    if (item.type === "divider") {
                      return (
                        <div key={`div-${idx}`} className="w-full px-3 py-1 flex justify-center">
                          <div className="h-px bg-[#1A1A1A] w-full" />
                        </div>
                      );
                    }
                    const Icon = item.icon!;
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-[6px] text-[13px] font-medium select-none ${
                          item.active
                            ? "bg-[var(--gs-surface)] text-[var(--gs-fg)]"
                            : "text-[var(--gs-muted)]"
                        }`}
                      >
                        <Icon strokeWidth={1.5} className={`h-[18px] w-[18px] shrink-0 ${item.active ? "text-[var(--gs-fg)]" : "text-[var(--gs-muted)]"}`} />
                        {item.label}
                      </div>
                    );
                  })}
                </nav>

                {/* Bottom Settings Group */}
                <div className="p-3 border-t border-[var(--gs-border)] flex flex-col gap-1">
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-[6px] text-[13px] font-medium text-[var(--gs-muted)]">
                    <Settings strokeWidth={1.5} className="h-[18px] w-[18px] shrink-0" />
                    Settings
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-[6px] text-[13px] font-medium text-[var(--gs-muted)]">
                    <LifeBuoy strokeWidth={1.5} className="h-[18px] w-[18px] shrink-0" />
                    Support
                  </div>
                </div>
              </aside>

              {/* Main area */}
              <div className="flex-1 flex flex-col bg-[var(--gs-bg-alt)] overflow-hidden">

                {/* Topbar */}
                <div className="h-[52px] border-b border-[var(--gs-border)] flex items-center justify-between px-5 bg-[var(--gs-bg)] shrink-0">
                  <div className="flex items-center gap-3">
                    <h2 className="text-[14px] font-[600] text-[var(--gs-fg)] tracking-[-0.02em]">Sales Pipeline</h2>
                    <span className="text-[11px] text-[var(--gs-muted)] font-[400]">4 deals · ₹5,25,000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 text-[12px] font-[500] text-[#AFAFAF] px-2.5 py-1.5 border border-[var(--gs-border)] rounded-[7px] bg-[var(--gs-surface)] hover:bg-[#1A1A1A] transition-colors" aria-label="Filter deals">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                      Filters
                    </button>
                    <button className="flex items-center gap-1.5 text-[12px] font-[500] text-[var(--gs-bg)] px-3 py-1.5 bg-[var(--gs-fg)] rounded-[7px] hover:bg-white transition-colors" aria-label="Create new deal">
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
                              <span className="text-[11px] font-[600] text-[var(--gs-fg)] uppercase tracking-[0.06em]">
                                {STAGE_LABELS[stage]}
                              </span>
                              <span className="text-[10px] text-[var(--gs-muted)] font-[400] tabular-nums">{cards.length}</span>
                            </div>
                            <span className="text-[11px] font-[500] text-[var(--gs-muted-light)] tabular-nums">{STAGE_TOTALS[stage]}</span>
                          </div>

                          <div className="flex flex-col gap-2.5">
                            {cards.map((card) => (
                              <button
                                key={card.id}
                                onClick={() => openDeal(card)}
                                className={`group w-full text-left p-3.5 bg-[var(--gs-surface)] border rounded-[10px] flex flex-col gap-2.5 transition-all duration-150 cursor-pointer hover:border-[var(--gs-border-strong)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gs-fg)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--gs-bg-alt)] ${
                                  selectedDeal?.id === card.id
                                    ? "border-[var(--gs-muted-light)] shadow-sm"
                                    : "border-[var(--gs-border)]"
                                }`}
                                aria-label={`Open deal: ${card.title} at ${card.company}`}
                              >
                                <div>
                                  <p className="text-[12.5px] font-[600] text-[var(--gs-fg)] leading-snug">{card.title}</p>
                                  <p className="text-[11px] text-[var(--gs-muted)] mt-0.5 font-[400]">{card.company}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[12px] font-[700] text-[var(--gs-fg)] tabular-nums">{card.value}</span>
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-1 w-14 rounded-full bg-[var(--gs-border)] overflow-hidden" aria-hidden="true">
                                      <div
                                        className="h-full rounded-full bg-[var(--gs-fg)] transition-all duration-500"
                                        style={{ width: `${card.probability}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] text-[var(--gs-muted)] font-[400] tabular-nums">{card.probability}%</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--gs-muted-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                  <span className="text-[10px] text-[var(--gs-muted-light)] font-[400]">Close {card.close}</span>
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
                  className="w-[280px] border-l border-[var(--gs-border)] bg-[var(--gs-bg-alt)] flex flex-col shrink-0 transition-all duration-250 ease-out overflow-y-auto"
                  style={{
                    opacity: drawerMounted ? 1 : 0,
                    transform: drawerMounted ? "translateX(0)" : "translateX(20px)",
                  }}
                  role="dialog"
                  aria-label={`Deal: ${selectedDeal.title}`}
                >
                  {/* Drawer header */}
                  <div className="flex items-start justify-between p-4 border-b border-[var(--gs-border)]">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-[13px] font-[600] text-[var(--gs-fg)] leading-snug truncate">{selectedDeal.title}</p>
                      <p className="text-[11px] text-[var(--gs-muted)] mt-0.5">{selectedDeal.company}</p>
                    </div>
                    <button
                      onClick={closeDeal}
                      className="h-6 w-6 rounded-[5px] flex items-center justify-center text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[#1A1A1A] transition-colors shrink-0"
                      aria-label="Close deal drawer"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11"/></svg>
                    </button>
                  </div>

                  {/* Drawer fields */}
                  <div className="flex flex-col gap-0 divide-y divide-[#1A1A1A]">
                    <DrawerField label="Value" value={selectedDeal.value} mono />
                    <DrawerField label="Stage" value={STAGE_LABELS[selectedDeal.stage]} />
                    <DrawerField label="Probability" value={`${selectedDeal.probability}%`} />
                    <DrawerField label="Close date" value={selectedDeal.close} />
                    <DrawerField label="Contact" value={selectedDeal.contactName} />
                  </div>

                  {/* Note */}
                  <div className="p-4 flex-1">
                    <p className="text-[10px] font-[600] text-[var(--gs-muted-light)] uppercase tracking-[0.07em] mb-2">Note</p>
                    <p className="text-[12px] text-[var(--gs-muted)] leading-[1.6]">{selectedDeal.note}</p>
                  </div>

                  {/* Actions */}
                  <div className="p-4 border-t border-[var(--gs-border)] flex flex-col gap-2">
                    <button className="w-full h-8 rounded-[7px] bg-[var(--gs-fg)] text-[var(--gs-bg)] text-[12px] font-[500] hover:bg-white transition-colors">
                      Move to next stage
                    </button>
                    <button className="w-full h-8 rounded-[7px] border border-[var(--gs-border)] text-[#AFAFAF] text-[12px] font-[400] hover:bg-[#1A1A1A] transition-colors">
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
        </motion.div>
      </div>
    </section>
  );
}

// ── Helper ─────────────────────────────────────────────────
function DrawerField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 gap-3">
      <span className="text-[10px] font-[500] text-[var(--gs-muted)] uppercase tracking-[0.06em] shrink-0">{label}</span>
      <span className={`text-[12px] font-[500] text-[var(--gs-fg)] text-right truncate ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
