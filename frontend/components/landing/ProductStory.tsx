"use client";

import { useState, useEffect, useRef } from "react";

// ─── Constants ──────────────────────────────────────────────
const TABS = [
  { id: "pipeline" as const, label: "Sales & Pipeline", number: "01" },
  { id: "clients"  as const, label: "Clients & Projects", number: "02" },
  { id: "invoices" as const, label: "Invoices & Payments", number: "03" },
  { id: "overview" as const, label: "Business Overview", number: "04" },
];
type TabId = typeof TABS[number]["id"];

const AUTOPLAY_MS = 5000;

// ─── Types ──────────────────────────────────────────────────
type Task = { title: string; done: boolean };
type InvoiceStatus = "DRAFT" | "SENT" | "PAID";

// ─── Pipeline Demo ──────────────────────────────────────────
const PIPELINE_COLS = [
  {
    stage: "Qualified",
    cards: [
      { title: "Website Redesign", company: "Meridian Studio", value: "₹75,000", prob: 65, close: "Sep 30" },
      { title: "Annual Retainer",  company: "Nexus Labs",       value: "₹1,20,000", prob: 50, close: "Oct 15" },
    ],
    total: "₹1,95,000",
  },
  {
    stage: "Proposal",
    cards: [
      { title: "Platform Integration", company: "Bloom Ventures", value: "₹2,40,000", prob: 75, close: "Oct 05", highlight: true },
    ],
    total: "₹2,40,000",
  },
  {
    stage: "Negotiation",
    cards: [
      { title: "Q4 Consulting", company: "Vanta Systems", value: "₹90,000", prob: 80, close: "Sep 25" },
    ],
    total: "₹90,000",
  },
];

function PipelineDemo() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="flex flex-col h-full bg-[#FAFAF8]">
      <div className="h-11 border-b border-[rgba(0,0,0,0.07)] flex items-center justify-between px-5 bg-white shrink-0">
        <span className="text-[12.5px] font-[600] text-[#0A0A0A]">Sales Pipeline</span>
        <span className="text-[11px] text-[#AFAFAF]">4 deals · ₹5,25,000</span>
      </div>
      <div className="flex-1 flex gap-3.5 p-4 overflow-hidden">
        {PIPELINE_COLS.map((col) => (
          <div key={col.stage} className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              <span className="text-[9.5px] font-[600] text-[#0A0A0A] uppercase tracking-[0.07em]">
                {col.stage} <span className="text-[#AFAFAF] font-[400]">{col.cards.length}</span>
              </span>
              <span className="text-[10px] font-[500] text-[#8A8A8A] tabular-nums">{col.total}</span>
            </div>
            <div className="flex flex-col gap-2">
              {col.cards.map((card, i) => {
                const cardId = col.stage + i;
                const isSelected = selected === (col.stage.charCodeAt(0) + i);
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(isSelected ? null : col.stage.charCodeAt(0) + i)}
                    className={`w-full text-left p-3 bg-white rounded-[8px] flex flex-col gap-2 border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0A0A0A] ${
                      isSelected
                        ? "border-[#0A0A0A] shadow-sm"
                        : (card as any).highlight
                          ? "border-[rgba(0,0,0,0.2)] shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
                          : "border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.14)]"
                    }`}
                    aria-label={`${card.title} at ${card.company}`}
                  >
                    <div>
                      <p className="text-[11px] font-[600] text-[#0A0A0A] leading-snug">{card.title}</p>
                      <p className="text-[10px] text-[#8A8A8A] mt-0.5">{card.company}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-[700] text-[#0A0A0A] tabular-nums">{card.value}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1 w-10 rounded-full bg-[#F0F0EC] overflow-hidden" aria-hidden="true">
                          <div className="h-full bg-[#0A0A0A] rounded-full" style={{ width: `${card.prob}%` }} />
                        </div>
                        <span className="text-[9px] text-[#AFAFAF] tabular-nums">{card.prob}%</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="pt-1 border-t border-[rgba(0,0,0,0.06)] flex items-center gap-1 mt-1">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#AFAFAF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <span className="text-[9px] text-[#AFAFAF]">Close {card.close}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Clients Demo (interactive tasks) ───────────────────────
function ClientsDemo({ tasks, onToggle }: { tasks: Task[]; onToggle: (i: number) => void }) {
  const [openClient, setOpenClient] = useState("Meridian Studio");
  const doneCount = tasks.filter(t => t.done).length;
  const pct = Math.round((doneCount / tasks.length) * 100);

  const clients = [
    { name: "Meridian Studio", status: "Active" },
    { name: "Nexus Labs",      status: "Active" },
    { name: "Bloom Ventures",  status: "Active" },
  ];

  return (
    <div className="flex h-full bg-[#FAFAF8]">
      {/* Client list */}
      <div className="w-[190px] border-r border-[rgba(0,0,0,0.07)] bg-white flex flex-col shrink-0">
        <div className="h-11 border-b border-[rgba(0,0,0,0.07)] flex items-center px-4">
          <span className="text-[12.5px] font-[600] text-[#0A0A0A]">Clients</span>
        </div>
        <div className="flex flex-col p-2 gap-1">
          {clients.map(c => (
            <button
              key={c.name}
              onClick={() => setOpenClient(c.name)}
              className={`flex items-center gap-2 px-3 py-2 rounded-[6px] w-full text-left transition-colors ${
                openClient === c.name ? "bg-[#F0F0EC]" : "hover:bg-[#F8F8F6]"
              }`}
            >
              <div className="h-6 w-6 rounded-full bg-[#EAEAE6] flex items-center justify-center text-[10px] font-[600] text-[#5A5A5A] shrink-0">
                {c.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-[500] text-[#0A0A0A] truncate">{c.name}</p>
                <p className="text-[9px] text-[#8A8A8A]">{c.status}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-11 border-b border-[rgba(0,0,0,0.07)] flex items-center px-4 bg-white">
          <span className="text-[12.5px] font-[600] text-[#0A0A0A]">{openClient}</span>
        </div>
        {openClient === "Meridian Studio" ? (
          <div className="p-4 flex flex-col gap-3 flex-1">
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[9px] p-4">
              <div className="flex items-center gap-2 mb-4">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                <span className="text-[12px] font-[600] text-[#0A0A0A]">Brand Identity Refresh</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {tasks.map((task, i) => (
                  <button
                    key={i}
                    onClick={() => onToggle(i)}
                    className="flex items-center gap-2.5 text-left w-full group"
                    aria-label={`${task.done ? "Mark incomplete" : "Mark complete"}: ${task.title}`}
                  >
                    <div className={`h-4 w-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-all duration-150 ${
                      task.done ? "bg-[#0A0A0A] border-[#0A0A0A]" : "border-[rgba(0,0,0,0.2)] group-hover:border-[rgba(0,0,0,0.4)]"
                    }`}>
                      {task.done && (
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6l3 3 5-5"/></svg>
                      )}
                    </div>
                    <span className={`text-[11.5px] font-[400] transition-colors ${task.done ? "text-[#AFAFAF] line-through" : "text-[#0A0A0A]"}`}>
                      {task.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-1.5 rounded-full bg-[#EAEAEA] overflow-hidden">
                <div
                  className="h-full bg-[#0A0A0A] rounded-full transition-all duration-400 ease-out"
                  style={{ width: `${pct}%` }}
                  aria-hidden="true"
                />
              </div>
              <span className="text-[11px] text-[#8A8A8A] tabular-nums shrink-0 w-16 text-right">
                {doneCount} of {tasks.length} done
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[12px] text-[#AFAFAF]">No active projects</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Invoices Demo ──────────────────────────────────────────
const STATUS_STEPS: InvoiceStatus[] = ["DRAFT", "SENT", "PAID"];
const STATUS_LABEL: Record<InvoiceStatus, string> = { DRAFT: "Draft", SENT: "Sent", PAID: "Paid" };
const STATUS_COLOR: Record<InvoiceStatus, string> = {
  DRAFT: "bg-[#F5F5F0] text-[#8A8A8A] border-[rgba(0,0,0,0.08)]",
  SENT:  "bg-blue-50 text-blue-600 border-blue-100",
  PAID:  "bg-emerald-50 text-emerald-600 border-emerald-100",
};

function InvoicesDemo({ status, onAdvance }: { status: InvoiceStatus; onAdvance: () => void }) {
  const stepIdx = STATUS_STEPS.indexOf(status);
  const canAdvance = stepIdx < STATUS_STEPS.length - 1;

  return (
    <div className="flex h-full bg-[#FAFAF8]">
      {/* Invoice list */}
      <div className="w-[190px] border-r border-[rgba(0,0,0,0.07)] bg-white flex flex-col shrink-0">
        <div className="h-11 border-b border-[rgba(0,0,0,0.07)] flex items-center px-4">
          <span className="text-[12.5px] font-[600] text-[#0A0A0A]">Invoices</span>
        </div>
        <div className="flex flex-col p-2 gap-1">
          {[
            { num: "GS-1043", client: "Meridian Studio", val: "₹75,000",   s: status },
            { num: "GS-1042", client: "Nexus Labs",       val: "₹1,20,000", s: "PAID" as InvoiceStatus },
            { num: "GS-1041", client: "Bloom Ventures",   val: "₹2,40,000", s: "SENT" as InvoiceStatus },
          ].map((inv, i) => (
            <div key={i} className={`px-3 py-2.5 rounded-[6px] flex flex-col gap-1 transition-colors ${i === 0 ? "bg-[#F0F0EC]" : ""}`}>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10.5px] font-[600] text-[#0A0A0A] tabular-nums">#{inv.num}</span>
                <span className={`text-[9px] font-[600] px-1.5 py-0.5 rounded-full border uppercase tracking-wider transition-all duration-300 ${STATUS_COLOR[inv.s]}`}>
                  {STATUS_LABEL[inv.s]}
                </span>
              </div>
              <span className="text-[9.5px] text-[#8A8A8A]">{inv.client}</span>
              <span className="text-[10.5px] font-[600] text-[#0A0A0A] tabular-nums">{inv.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        {/* Invoice card */}
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[9px] p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] text-[#8A8A8A] mb-1">Invoice #GS-1043</p>
              <p className="text-[13px] font-[600] text-[#0A0A0A]">Brand Identity Refresh</p>
              <p className="text-[10.5px] text-[#8A8A8A] mt-0.5">Meridian Studio</p>
            </div>
            <span className={`text-[9.5px] font-[600] px-2 py-1 rounded-full border uppercase tracking-wider transition-all duration-300 ${STATUS_COLOR[status]} shrink-0`}>
              {STATUS_LABEL[status]}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[rgba(0,0,0,0.06)]">
            <span className="text-[11px] text-[#8A8A8A]">Total</span>
            <span className="text-[15px] font-[700] text-[#0A0A0A] tabular-nums">₹75,000</span>
          </div>
        </div>

        {/* Status trail */}
        <div className="flex items-center gap-1.5">
          {STATUS_STEPS.map((s, i) => {
            const done = stepIdx >= i;
            return (
              <div key={s} className="flex items-center gap-1.5 flex-1">
                <div className="flex items-center gap-1">
                  <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-all duration-300 ${done ? "bg-[#0A0A0A]" : "bg-[#EAEAEA]"}`}>
                    {done && (
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6l3 3 5-5"/></svg>
                    )}
                  </div>
                  <span className={`text-[10.5px] font-[500] transition-colors ${done ? "text-[#0A0A0A]" : "text-[#AFAFAF]"}`}>{STATUS_LABEL[s]}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-px transition-colors duration-300 ${stepIdx > i ? "bg-[#0A0A0A]" : "bg-[#EAEAEA]"}`} aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>

        {/* Action */}
        {canAdvance ? (
          <button
            onClick={onAdvance}
            className="self-start px-4 py-2 bg-[#0A0A0A] text-white text-[12px] font-[500] rounded-[7px] hover:bg-[#2A2A2A] transition-colors flex items-center gap-2"
          >
            {status === "DRAFT" ? "Send invoice" : "Record payment"}
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 6h7M6 2.5l3.5 3.5-3.5 3.5"/></svg>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-emerald-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span className="text-[12px] font-[500]">Payment of ₹75,000 received</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Overview Demo ──────────────────────────────────────────
const OVERVIEW_METRICS = [
  { label: "Revenue",      value: "₹5,25,000", change: "+12%",  up: true  },
  { label: "Active leads", value: "24",         change: "+3",    up: true  },
  { label: "Open deals",   value: "4",          change: "₹5.2L", up: null  },
  { label: "Conversion",   value: "34%",        change: "–2%",   up: false },
];

const OVERVIEW_ACTIVITY = [
  { time: "10:42", text: "Lead added",         sub: "Acme Corporation" },
  { time: "10:48", text: "Deal → Proposal",    sub: "Bloom Ventures · ₹2,40,000" },
  { time: "11:03", text: "Invoice sent",       sub: "#GS-1043 · ₹75,000" },
  { time: "11:27", text: "Payment received",   sub: "#GS-1042 · ₹1,20,000" },
];

const BAR_HEIGHTS = [35, 55, 42, 70, 48, 85, 62];

function OverviewDemo() {
  return (
    <div className="flex flex-col h-full bg-[#FAFAF8]">
      <div className="h-11 border-b border-[rgba(0,0,0,0.07)] flex items-center px-5 bg-white shrink-0">
        <span className="text-[12.5px] font-[600] text-[#0A0A0A]">Dashboard</span>
        <span className="ml-3 text-[10.5px] text-[#AFAFAF]">This month</span>
      </div>
      <div className="flex-1 p-4 flex gap-4 overflow-hidden">
        {/* Left: metrics + bar chart */}
        <div className="flex flex-col gap-3 flex-1">
          <div className="grid grid-cols-2 gap-2.5">
            {OVERVIEW_METRICS.map(m => (
              <div key={m.label} className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[8px] p-3">
                <p className="text-[9.5px] text-[#8A8A8A] mb-1">{m.label}</p>
                <p className="text-[13px] font-[700] text-[#0A0A0A] tabular-nums">{m.value}</p>
                <p className={`text-[9.5px] font-[500] mt-0.5 ${m.up === true ? "text-emerald-600" : m.up === false ? "text-red-500" : "text-[#8A8A8A]"}`}>{m.change}</p>
              </div>
            ))}
          </div>
          {/* Revenue bar chart */}
          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[8px] p-3 flex-1">
            <p className="text-[9.5px] text-[#8A8A8A] mb-3">Monthly revenue</p>
            <div className="flex items-end justify-between h-[52px] gap-1.5">
              {BAR_HEIGHTS.map((h, i) => (
                <div key={i} className="flex-1 rounded-t-[3px] bg-[#E8E8E6]" style={{ height: `${h}%` }} aria-hidden="true" />
              ))}
              {/* Last bar highlighted */}
            </div>
            <div className="flex justify-between mt-1.5">
              {["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"].map(m => (
                <span key={m} className="text-[8px] text-[#AFAFAF] flex-1 text-center">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: activity */}
        <div className="w-[190px] bg-white border border-[rgba(0,0,0,0.08)] rounded-[8px] flex flex-col overflow-hidden shrink-0">
          <div className="px-3 py-2.5 border-b border-[rgba(0,0,0,0.06)]">
            <span className="text-[10.5px] font-[600] text-[#0A0A0A]">Activity</span>
          </div>
          <div className="flex flex-col divide-y divide-[rgba(0,0,0,0.05)] overflow-y-auto">
            {OVERVIEW_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2.5">
                <span className="text-[9px] text-[#AFAFAF] tabular-nums shrink-0 w-9 pt-0.5 font-mono">{a.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10.5px] font-[500] text-[#0A0A0A] leading-snug">{a.text}</p>
                  <p className="text-[9.5px] text-[#8A8A8A] truncate">{a.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export function ProductStory() {
  const [activeTab, setActiveTab]       = useState<TabId>("pipeline");
  const [isPaused, setIsPaused]         = useState(false);
  const [animKey, setAnimKey]           = useState(0);
  const [tabTransition, setTabTransition] = useState(true);

  // Lifted state for interactive demos
  const [clientTasks, setClientTasks] = useState<Task[]>([
    { title: "Design homepage mockups",       done: true  },
    { title: "Review brand guidelines",       done: true  },
    { title: "Develop staging environment",   done: false },
    { title: "Final client walkthrough",      done: false },
  ]);
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>("DRAFT");

  // Autoplay: advance tab every AUTOPLAY_MS when not paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(() => {
      setTabTransition(false);
      setTimeout(() => {
        setActiveTab(prev => {
          const idx = TABS.findIndex(t => t.id === prev);
          return TABS[(idx + 1) % TABS.length].id;
        });
        setAnimKey(k => k + 1);
        setTabTransition(true);
      }, 50);
    }, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [activeTab, isPaused, animKey]);

  const selectTab = (id: TabId) => {
    if (activeTab === id) return;
    setIsPaused(true);
    setTabTransition(false);
    setTimeout(() => {
      setActiveTab(id);
      setAnimKey(k => k + 1);
      setTabTransition(true);
    }, 50);
  };

  const handleToggleTask = (i: number) =>
    setClientTasks(prev => prev.map((t, idx) => idx === i ? { ...t, done: !t.done } : t));

  const handleInvoiceAdvance = () =>
    setInvoiceStatus(prev =>
      prev === "DRAFT" ? "SENT" : prev === "SENT" ? "PAID" : prev
    );

  return (
    <section
      id="product"
      className="py-20 bg-white border-t border-[rgba(0,0,0,0.06)]"
      style={{ scrollMarginTop: "64px" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsPaused(false);
      }}
    >
      <div className="max-w-[1100px] mx-auto px-6">

        {/* ── Header (compact) ─────────────────────────── */}
        <div className="flex flex-col gap-3 mb-10 max-w-xl">
          <h2 className="text-[32px] sm:text-[44px] font-[800] tracking-[-0.04em] text-[#0A0A0A] leading-[1.08]">
            Everything you need.
            <br />
            <span className="text-[#8A8A8A]">Without everything getting in the way.</span>
          </h2>
          <p className="text-[15px] text-[#5A5A5A] leading-[1.65] font-[400]">
            Pipeline, clients, projects, invoices and payments. Everything connected by default.
          </p>
        </div>

        {/* ── Tab navigation ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row border-b border-[rgba(0,0,0,0.07)] mb-6" role="tablist" aria-label="Product features">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => selectTab(tab.id)}
                className={`relative flex items-center gap-2.5 px-5 py-3.5 text-left transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0A0A0A] overflow-hidden ${
                  isActive
                    ? "text-[#0A0A0A]"
                    : "text-[#8A8A8A] hover:text-[#3A3A3A]"
                }`}
              >
                <span className={`text-[10px] font-[700] tabular-nums tracking-[0.05em] shrink-0 transition-colors ${isActive ? "text-[#0A0A0A]" : "text-[#D0D0D0]"}`}>
                  {tab.number}
                </span>
                <span className="text-[12.5px] font-[500] whitespace-nowrap">{tab.label}</span>

                {/* Active underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-[#0A0A0A]" aria-hidden="true" />
                )}

                {/* Autoplay progress bar (runs when not paused and tab is active) */}
                {isActive && !isPaused && (
                  <span
                    key={`prog-${animKey}`}
                    className="absolute bottom-0 left-0 h-px bg-[#0A0A0A] w-full origin-left"
                    style={{ animation: `tabProgress ${AUTOPLAY_MS}ms linear forwards` }}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Product window ─────────────────────────────── */}
        <div
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="rounded-[12px] border border-[rgba(0,0,0,0.1)] overflow-hidden shadow-[0_4px_40px_rgba(0,0,0,0.06)] h-[400px] transition-opacity duration-200"
          style={{ opacity: tabTransition ? 1 : 0 }}
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#F8F8F6] border-b border-[rgba(0,0,0,0.07)] shrink-0">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57] opacity-60" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E] opacity-60" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28CA41] opacity-60" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="h-5 w-[160px] rounded-[4px] bg-white border border-[rgba(0,0,0,0.07)] flex items-center justify-center">
                <span className="text-[9.5px] text-[#AFAFAF]">app.growsuite.io</span>
              </div>
            </div>
          </div>

          {/* Demo content */}
          <div className="h-[calc(100%-37px)] overflow-hidden">
            {activeTab === "pipeline" && <PipelineDemo />}
            {activeTab === "clients"  && <ClientsDemo tasks={clientTasks} onToggle={handleToggleTask} />}
            {activeTab === "invoices" && <InvoicesDemo status={invoiceStatus} onAdvance={handleInvoiceAdvance} />}
            {activeTab === "overview" && <OverviewDemo />}
          </div>
        </div>

        {/* Autoplay hint */}
        <p className="text-center text-[11px] text-[#D0D0D0] mt-4 font-[400]">
          {isPaused ? "Autoplay paused — hover away to resume" : "Autoplaying · Click any tab to take over"}
        </p>

      </div>
    </section>
  );
}
