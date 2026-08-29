"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Layers, Users, FolderKanban, Receipt, CreditCard, Activity, LayoutDashboard, CheckSquare, Calendar, LineChart, Settings, LifeBuoy } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

// ─── Chapter Data ────────────────────────────────────────────
const CHAPTERS = [
  {
    id: "capture",
    number: "01",
    tag: "CAPTURE",
    headline: "Every opportunity, in one place.",
    body: "A new lead comes in from your website form. GrowSuite captures it instantly — name, company, source, and context — so nothing falls through the cracks.",
    navHighlight: "Leads",
  },
  {
    id: "move",
    number: "02",
    tag: "MOVE",
    headline: "Move deals forward without losing context.",
    body: "The lead becomes a deal in your pipeline. Drag it through stages, track the value, set close dates — every conversation and detail stays connected.",
    navHighlight: "Pipeline",
  },
  {
    id: "deliver",
    number: "03",
    tag: "DELIVER",
    headline: "Keep the work connected to the deal.",
    body: "The deal is won. A project is created automatically under the client. Tasks are assigned, deadlines are set, progress is tracked.",
    navHighlight: "Projects",
  },
  {
    id: "bill",
    number: "04",
    tag: "BILL",
    headline: "Turn completed work into revenue.",
    body: "Generate an invoice directly from the project. Line items, amounts, due dates — everything auto-fills from the work you already tracked.",
    navHighlight: "Invoices",
  },
  {
    id: "paid",
    number: "05",
    tag: "GET PAID",
    headline: "Know when the money arrives.",
    body: "Payment is recorded. The invoice status updates. The activity log captures it. From first conversation to paid invoice — one connected system.",
    navHighlight: "Payments",
  },
] as const;

type ChapterId = typeof CHAPTERS[number]["id"];

// ─── Sidebar Nav Items ───────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard },
  { type: "divider" as const },
  { label: "Leads", icon: Target },
  { label: "Pipeline", icon: Layers },
  { label: "Clients", icon: Users },
  { type: "divider" as const },
  { label: "Projects", icon: FolderKanban },
  { label: "Tasks", icon: CheckSquare },
  { label: "Calendar", icon: Calendar },
  { type: "divider" as const },
  { label: "Invoices", icon: Receipt },
  { label: "Payments", icon: CreditCard },
  { type: "divider" as const },
  { label: "Analytics", icon: LineChart },
  { label: "Activity", icon: Activity },
];

const BOTTOM_NAV = [
  { label: "Settings", icon: Settings },
  { label: "Support", icon: LifeBuoy },
];

// ─── Step UI Panels (faithful to real dashboard) ─────────────

function LeadsUI() {
  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      <div className="px-5 py-3 border-b border-[var(--gs-border)] text-[10px] text-[var(--gs-muted-light)] flex items-center gap-1.5">
        <span>Workspace</span><span>/</span><span className="text-[var(--gs-fg)]">Leads</span>
      </div>
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-bold text-[var(--gs-fg)] tracking-tight">Leads</h3>
            <p className="text-[10px] text-[var(--gs-muted-light)] mt-0.5">Capture and qualify new business opportunities.</p>
          </div>
          <div className="h-7 px-3 bg-[var(--gs-fg)] text-[var(--gs-bg)] rounded-[6px] flex items-center text-[10px] font-semibold gap-1">
            <span>+</span> New Lead
          </div>
        </div>
        {/* Search */}
        <div className="h-8 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] flex items-center px-3 mb-4">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gs-muted-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <span className="text-[10px] text-[#555] ml-2">Search leads...</span>
        </div>
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_100px_70px_60px] gap-2 px-3 py-2 text-[9px] font-bold text-[#555] uppercase tracking-wider border-b border-[var(--gs-border)]">
          <span>Contact</span>
          <span>Company</span>
          <span>Source</span>
          <span>Status</span>
        </div>
        {/* Lead Rows */}
        <motion.div
          initial={{ backgroundColor: "transparent" }}
          animate={{ backgroundColor: ["transparent", "rgba(237,237,237,0.04)", "transparent"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="grid grid-cols-[1fr_100px_70px_60px] gap-2 px-3 py-2.5 items-center border-b border-[#1a1a1a] rounded-[4px]"
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-[var(--gs-surface-raised)] flex items-center justify-center text-[9px] font-bold text-[var(--gs-fg)] shrink-0">P</div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--gs-fg)]">Priya Mehta</p>
              <p className="text-[9px] text-[var(--gs-muted-light)]">priya@meridian.io</p>
            </div>
          </div>
          <span className="text-[10px] text-[var(--gs-muted)]">Meridian Studio</span>
          <span className="text-[10px] text-[var(--gs-muted)]">Website</span>
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 uppercase tracking-wider">New</span>
        </motion.div>
        {[
          { name: "Arjun Sharma", email: "arjun@nexus.io", initials: "A", company: "Nexus Labs", source: "Referral", status: "Contacted" },
          { name: "Sara Kapoor", email: "sara@bloom.vc", initials: "S", company: "Bloom VC", source: "LinkedIn", status: "Qualified" },
        ].map((lead) => (
          <div key={lead.name} className="grid grid-cols-[1fr_100px_70px_60px] gap-2 px-3 py-2.5 items-center border-b border-[#1a1a1a]">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[var(--gs-surface-raised)] flex items-center justify-center text-[9px] font-bold text-[var(--gs-muted)] shrink-0">{lead.initials}</div>
              <div>
                <p className="text-[11px] font-medium text-[#999]">{lead.name}</p>
                <p className="text-[9px] text-[#555]">{lead.email}</p>
              </div>
            </div>
            <span className="text-[10px] text-[var(--gs-muted-light)]">{lead.company}</span>
            <span className="text-[10px] text-[var(--gs-muted-light)]">{lead.source}</span>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--gs-border)] text-[var(--gs-muted)] uppercase tracking-wider">{lead.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineUI() {
  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      <div className="px-5 py-3 border-b border-[var(--gs-border)] text-[10px] text-[var(--gs-muted-light)] flex items-center gap-1.5">
        <span>Workspace</span><span>/</span><span className="text-[var(--gs-fg)]">Pipeline</span>
      </div>
      <div className="p-4 flex-1 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-bold text-[var(--gs-fg)] tracking-tight">Pipeline</h3>
            <p className="text-[10px] text-[var(--gs-muted-light)] mt-0.5">3 deals · ₹3,90,000</p>
          </div>
        </div>
        {/* Kanban Columns */}
        <div className="flex gap-3 overflow-hidden flex-1">
          {/* Qualified */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[var(--gs-border)]">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-[var(--gs-fg)] uppercase tracking-wider">Qualified</span>
                <span className="text-[9px] font-bold text-[var(--gs-muted-light)]">1</span>
              </div>
              <span className="text-[9px] font-bold text-[var(--gs-muted-light)]">₹75,000</span>
            </div>
            <div className="p-2.5 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px] flex flex-col gap-1.5">
              <div>
                <p className="text-[10px] font-bold text-[var(--gs-muted)]">Annual Retainer</p>
                <p className="text-[8px] text-[#555]">Nexus Labs</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-[var(--gs-muted)]">₹1,20,000</span>
                <span className="text-[#555]">·</span>
                <span className="text-[8px] text-[#555]">50%</span>
              </div>
            </div>
          </div>
          {/* Proposal — highlighted */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[var(--gs-border)]">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-[var(--gs-fg)] uppercase tracking-wider">Proposal</span>
                <span className="text-[9px] font-bold text-[var(--gs-muted-light)]">1</span>
              </div>
              <span className="text-[9px] font-bold text-[var(--gs-muted-light)]">₹75,000</span>
            </div>
            <motion.div
              initial={{ borderColor: "var(--gs-border)" }}
              animate={{ borderColor: ["var(--gs-border)", "var(--gs-fg)", "var(--gs-border)"] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              className="p-2.5 bg-[var(--gs-surface-raised)] border rounded-[8px] flex flex-col gap-1.5 ring-1 ring-[var(--gs-fg)]/10"
            >
              <div>
                <p className="text-[10px] font-bold text-[var(--gs-fg)]">Website Redesign</p>
                <p className="text-[8px] text-[var(--gs-muted)]">Meridian Studio</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-[var(--gs-fg)]">₹75,000</span>
                <span className="text-[#555]">·</span>
                <span className="text-[8px] text-[var(--gs-muted)]">75%</span>
              </div>
              <div className="flex items-center gap-1 pt-1 border-t border-[#333]">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--gs-muted-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span className="text-[8px] text-[var(--gs-muted-light)]">Close Sep 30</span>
              </div>
            </motion.div>
          </div>
          {/* Negotiation */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[var(--gs-border)]">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-[var(--gs-fg)] uppercase tracking-wider">Negotiation</span>
                <span className="text-[9px] font-bold text-[var(--gs-muted-light)]">1</span>
              </div>
              <span className="text-[9px] font-bold text-[var(--gs-muted-light)]">₹1,95,000</span>
            </div>
            <div className="p-2.5 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px] flex flex-col gap-1.5">
              <div>
                <p className="text-[10px] font-bold text-[var(--gs-muted)]">Platform Integration</p>
                <p className="text-[8px] text-[#555]">Bloom Ventures</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-[var(--gs-muted)]">₹1,95,000</span>
                <span className="text-[#555]">·</span>
                <span className="text-[8px] text-[#555]">80%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectUI() {
  const tasks = [
    { title: "Design homepage mockups", status: "done" },
    { title: "Review brand guidelines", status: "done" },
    { title: "Develop staging environment", status: "progress" },
    { title: "Final client walkthrough", status: "todo" },
  ];
  const doneCount = tasks.filter(t => t.status === "done").length;

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      <div className="px-5 py-3 border-b border-[var(--gs-border)] text-[10px] text-[var(--gs-muted-light)] flex items-center gap-1.5">
        <span>Projects</span><span>/</span><span className="text-[var(--gs-fg)]">Brand Identity Refresh</span>
      </div>
      <div className="p-5 flex-1">
        {/* Project Header */}
        <div className="flex items-center gap-3 mb-5">
          <h3 className="text-[14px] font-bold text-[var(--gs-fg)] tracking-tight">Brand Identity Refresh</h3>
          <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 uppercase tracking-wider">Active</span>
          <span className="text-[10px] text-[var(--gs-muted-light)]">Meridian Studio</span>
          <span className="text-[10px] text-[#555]">·</span>
          <span className="text-[10px] text-[var(--gs-muted-light)]">Due Oct 15</span>
        </div>
        {/* Tabs */}
        <div className="flex gap-4 border-b border-[var(--gs-border)] mb-4">
          <span className="text-[11px] font-semibold text-[var(--gs-fg)] pb-2 border-b-2 border-[var(--gs-fg)]">Tasks</span>
          <span className="text-[11px] font-medium text-[#555] pb-2">Invoices</span>
          <span className="text-[11px] font-medium text-[#555] pb-2">Activity</span>
        </div>
        {/* Progress */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-1.5 rounded-full bg-[var(--gs-border)] overflow-hidden">
            <motion.div
              className="h-full bg-[var(--gs-fg)] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${(doneCount / tasks.length) * 100}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <span className="text-[10px] text-[var(--gs-muted)] tabular-nums shrink-0">{doneCount} of {tasks.length}</span>
        </div>
        {/* Task Groups */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Done</span>
              <span className="text-[9px] font-bold text-[#555]">{doneCount}</span>
            </div>
            {tasks.filter(t => t.status === "done").map((t) => (
              <div key={t.title} className="flex items-center gap-2.5 py-1.5 pl-1">
                <div className="h-4 w-4 rounded-[4px] bg-[var(--gs-fg)] flex items-center justify-center shrink-0">
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="var(--gs-bg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5"/></svg>
                </div>
                <span className="text-[11px] text-[#555] line-through">{t.title}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">In Progress</span>
              <span className="text-[9px] font-bold text-[#555]">1</span>
            </div>
            {tasks.filter(t => t.status === "progress").map((t) => (
              <motion.div
                key={t.title}
                animate={{ backgroundColor: ["transparent", "rgba(237,237,237,0.03)", "transparent"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                className="flex items-center gap-2.5 py-1.5 pl-1 rounded-[4px]"
              >
                <div className="h-4 w-4 rounded-[4px] border-2 border-[var(--gs-muted)] shrink-0" />
                <span className="text-[11px] text-[var(--gs-fg)] font-medium">{t.title}</span>
              </motion.div>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Todo</span>
              <span className="text-[9px] font-bold text-[#555]">1</span>
            </div>
            {tasks.filter(t => t.status === "todo").map((t) => (
              <div key={t.title} className="flex items-center gap-2.5 py-1.5 pl-1">
                <div className="h-4 w-4 rounded-[4px] border border-[#333] shrink-0" />
                <span className="text-[11px] text-[var(--gs-muted)]">{t.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceUI() {
  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      <div className="px-5 py-3 border-b border-[var(--gs-border)] text-[10px] text-[var(--gs-muted-light)] flex items-center gap-1.5">
        <span>Invoices</span><span>/</span><span className="text-[var(--gs-fg)]">GS-1043</span>
      </div>
      <div className="p-5 flex-1">
        {/* Action Bar */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] text-[var(--gs-muted)] cursor-pointer hover:text-[var(--gs-fg)] transition-colors">← Back to Invoices</span>
          <div className="flex-1" />
          <div className="h-7 px-3 bg-[var(--gs-surface)] border border-[#333] text-[var(--gs-fg)] rounded-[6px] flex items-center text-[9px] font-medium gap-1.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            Share
          </div>
          <div className="h-7 px-3 bg-[var(--gs-fg)] text-[var(--gs-bg)] rounded-[6px] flex items-center text-[9px] font-semibold gap-1.5">
            $ Record Payment
          </div>
        </div>
        {/* Invoice Document */}
        <div className="bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[10px] p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-[16px] font-bold text-[var(--gs-fg)] italic">Invoice</h4>
              <p className="text-[10px] text-[var(--gs-muted-light)] mt-0.5">GS-1043</p>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-block mt-1.5 text-[8px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 uppercase tracking-wider"
              >
                Sent
              </motion.span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-[var(--gs-fg)]">GrowSuite Workspace</p>
              <p className="text-[9px] text-[var(--gs-muted-light)]">Invoice Date: Sep 20, 2026</p>
              <p className="text-[9px] text-[var(--gs-muted-light)]">Due Date: Oct 05, 2026</p>
            </div>
          </div>
          <div className="border-t border-[var(--gs-border)] pt-3 mt-3 flex justify-between">
            <div>
              <p className="text-[8px] text-[#555] uppercase tracking-wider font-bold mb-1">Bill To</p>
              <p className="text-[11px] font-semibold text-[var(--gs-fg)]">Meridian Studio</p>
              <p className="text-[9px] text-[var(--gs-muted-light)]">priya@meridian.io</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-[#555] uppercase tracking-wider font-bold mb-1">Amount Due</p>
              <p className="text-[20px] font-bold text-[var(--gs-fg)] tabular-nums">₹75,000</p>
            </div>
          </div>
          {/* Line Items */}
          <div className="mt-4 border-t border-[var(--gs-border)] pt-3">
            <div className="grid grid-cols-[1fr_40px_70px_70px] gap-2 text-[8px] font-bold text-[#555] uppercase tracking-wider mb-2 px-1">
              <span>Description</span><span>Qty</span><span>Price</span><span className="text-right">Amount</span>
            </div>
            <div className="grid grid-cols-[1fr_40px_70px_70px] gap-2 text-[10px] py-1.5 px-1 border-b border-[#1a1a1a]">
              <span className="text-[var(--gs-fg)] font-medium">Brand Identity Refresh</span>
              <span className="text-[var(--gs-muted)]">1</span>
              <span className="text-[var(--gs-muted)] tabular-nums">₹75,000</span>
              <span className="text-[var(--gs-fg)] text-right font-semibold tabular-nums">₹75,000</span>
            </div>
            <div className="flex justify-end mt-3 space-y-1 text-right">
              <div>
                <div className="flex items-center justify-between gap-8 text-[10px]">
                  <span className="text-[var(--gs-muted-light)]">Total</span>
                  <span className="text-[var(--gs-fg)] font-bold tabular-nums">₹75,000</span>
                </div>
                <div className="flex items-center justify-between gap-8 text-[10px] mt-1">
                  <span className="text-amber-400 font-semibold">Balance Due</span>
                  <span className="text-amber-400 font-bold tabular-nums">₹75,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentUI() {
  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      <div className="px-5 py-3 border-b border-[var(--gs-border)] text-[10px] text-[var(--gs-muted-light)] flex items-center gap-1.5">
        <span>Workspace</span><span>/</span><span className="text-[var(--gs-fg)]">Activity</span>
      </div>
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[14px] font-bold text-[var(--gs-fg)] tracking-tight">Activity Log</h3>
            <p className="text-[10px] text-[var(--gs-muted-light)] mt-0.5">Real-time timeline of workspace events.</p>
          </div>
        </div>
        {/* Timeline */}
        <div className="space-y-0">
          <p className="text-[9px] font-bold text-[#555] uppercase tracking-wider mb-3">Today</p>

          {/* Payment received - highlighted */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-start gap-3 py-2.5 border-b border-[#1a1a1a]"
          >
            <span className="text-[9px] text-[#555] tabular-nums shrink-0 w-14 pt-0.5 font-mono">10:42 AM</span>
            <div className="h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-[var(--gs-fg)]">Payment received</p>
              <p className="text-[9px] text-[var(--gs-muted)]">Meridian Studio · ₹75,000 · Bank Transfer</p>
              <span className="inline-block mt-1 text-[8px] font-semibold px-1.5 py-0.5 rounded bg-[var(--gs-surface-raised)] text-[var(--gs-muted)]">GrowSuite</span>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
              className="text-[12px] font-bold text-emerald-400 tabular-nums shrink-0"
            >
              ₹75,000
            </motion.div>
          </motion.div>

          {/* Invoice sent */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-start gap-3 py-2.5 border-b border-[#1a1a1a]">
            <span className="text-[9px] text-[#555] tabular-nums shrink-0 w-14 pt-0.5 font-mono">10:15 AM</span>
            <div className="h-5 w-5 rounded-full bg-[var(--gs-surface-raised)] flex items-center justify-center shrink-0">
              <Receipt className="h-2.5 w-2.5 text-[var(--gs-muted)]" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-[#ccc]">Invoice sent</p>
              <p className="text-[9px] text-[var(--gs-muted-light)]">GS-1043 · Meridian Studio · ₹75,000</p>
            </div>
          </motion.div>

          {/* Project created */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-start gap-3 py-2.5 border-b border-[#1a1a1a]">
            <span className="text-[9px] text-[#555] tabular-nums shrink-0 w-14 pt-0.5 font-mono">09:30 AM</span>
            <div className="h-5 w-5 rounded-full bg-[var(--gs-surface-raised)] flex items-center justify-center shrink-0">
              <FolderKanban className="h-2.5 w-2.5 text-[var(--gs-muted)]" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-[#ccc]">Project created</p>
              <p className="text-[9px] text-[var(--gs-muted-light)]">Brand Identity Refresh · Meridian Studio</p>
            </div>
          </motion.div>

          {/* Deal converted */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-start gap-3 py-2.5 border-b border-[#1a1a1a]">
            <span className="text-[9px] text-[#555] tabular-nums shrink-0 w-14 pt-0.5 font-mono">09:15 AM</span>
            <div className="h-5 w-5 rounded-full bg-[var(--gs-surface-raised)] flex items-center justify-center shrink-0">
              <Layers className="h-2.5 w-2.5 text-[var(--gs-muted)]" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-[#ccc]">Deal converted</p>
              <p className="text-[9px] text-[var(--gs-muted-light)]">Website Redesign · Moved to WON · ₹75,000</p>
            </div>
          </motion.div>

          {/* Lead captured */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex items-start gap-3 py-2.5">
            <span className="text-[9px] text-[#555] tabular-nums shrink-0 w-14 pt-0.5 font-mono">08:42 AM</span>
            <div className="h-5 w-5 rounded-full bg-[var(--gs-surface-raised)] flex items-center justify-center shrink-0">
              <Target className="h-2.5 w-2.5 text-[var(--gs-muted)]" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-[#ccc]">New lead captured</p>
              <p className="text-[9px] text-[var(--gs-muted-light)]">Priya Mehta · Meridian Studio · via website form</p>
            </div>
          </motion.div>
        </div>

        {/* Final summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-5 pt-4 border-t border-[var(--gs-border)]"
        >
          <div className="flex items-center gap-2 text-[10px] text-[#555]">
            <span className="text-[var(--gs-muted)]">Lead</span>
            <span>→</span>
            <span className="text-[var(--gs-muted)]">Deal</span>
            <span>→</span>
            <span className="text-[var(--gs-muted)]">Project</span>
            <span>→</span>
            <span className="text-[var(--gs-muted)]">Invoice</span>
            <span>→</span>
            <span className="text-emerald-400 font-semibold">Paid ✓</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Map chapter IDs to UI components
const CHAPTER_UIS: Record<ChapterId, () => React.JSX.Element> = {
  capture: LeadsUI,
  move: PipelineUI,
  deliver: ProjectUI,
  bill: InvoiceUI,
  paid: PaymentUI,
};

// ─── Main Component ─────────────────────────────────────────
export function ConnectedJourney() {
  const [activeChapter, setActiveChapter] = useState(0);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(idx)) setActiveChapter(idx);
          }
        });
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: 0 }
    );

    chapterRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const chapter = CHAPTERS[activeChapter] || CHAPTERS[0];
  const ChapterUI = CHAPTER_UIS[chapter.id];

  return (
    <section className="bg-[#FAFAF8]" style={{ scrollMarginTop: "64px" }}>
      {/* Header */}
      <div className="max-w-[1200px] mx-auto px-6 pt-32 md:pt-40 pb-16 md:pb-24">
        <div className="flex flex-col gap-4 text-center items-center">
          <span className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-[0.1em]">How your business moves</span>
          <h2 className="text-[36px] sm:text-[48px] md:text-[56px] font-[800] tracking-tighter text-[var(--gs-bg-alt)] leading-[1.05] max-w-3xl">
            From first conversation.
            <br />
            <span className="text-[var(--gs-muted)]">To paid invoice.</span>
          </h2>
          <p className="text-[16px] text-[#5A5A5A] leading-[1.65] max-w-[560px] mt-2 font-[400] tracking-tight">
            Every step stays connected, so you always know what happened, what&apos;s next, and what needs your attention.
          </p>
        </div>
      </div>

      {/* Scrollytelling Area */}
      <div className="max-w-[1200px] mx-auto px-6 pb-32 md:pb-40">
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start relative">

          {/* ── Left: Chapter Text Blocks ── */}
          <div className="flex-1 flex flex-col w-full md:w-[38%] md:max-w-[420px]">
            {CHAPTERS.map((ch, i) => (
              <div
                key={ch.id}
                ref={(el) => { chapterRefs.current[i] = el; }}
                data-index={i}
                className="min-h-[80vh] flex flex-col justify-center py-16 md:py-24"
              >
                <div className={`transition-all duration-700 ease-out ${activeChapter === i ? "opacity-100 translate-y-0" : "opacity-[0.12] translate-y-6"}`}>
                  {/* Chapter number + tag */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[28px] md:text-[36px] font-[800] text-[var(--gs-bg-alt)] tracking-tighter tabular-nums leading-none">{ch.number}</span>
                    <span className="text-[10px] font-[700] text-[var(--gs-bg-alt)] bg-white border border-[rgba(0,0,0,0.08)] px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">{ch.tag}</span>
                  </div>
                  {/* Headline */}
                  <h3 className="text-[24px] md:text-[32px] font-[800] tracking-tighter text-[var(--gs-bg-alt)] leading-[1.1] mb-4">
                    {ch.headline}
                  </h3>
                  {/* Body */}
                  <p className="text-[15px] text-[#5A5A5A] leading-[1.65] max-w-[360px] tracking-tight font-[400]">
                    {ch.body}
                  </p>
                </div>
              </div>
            ))}
            {/* Bottom breathing space */}
            <div className="min-h-[30vh]" />
          </div>

          {/* ── Right: Sticky Product Window ── */}
          <div className="w-full md:w-[58%] lg:w-[62%] shrink-0 sticky top-24 h-[70vh] md:h-[80vh] max-h-[680px]">

            {/* Dark Application Window */}
            <div className="bg-[var(--gs-bg-alt)] rounded-[20px] border border-[rgba(255,255,255,0.08)] shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-full w-full">

              {/* ── Window Chrome ── */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[var(--gs-bg-alt)] border-b border-[var(--gs-border)] shrink-0">
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57] opacity-50" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E] opacity-50" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28CA41] opacity-50" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="h-5 w-[200px] rounded-[5px] bg-[var(--gs-surface)] border border-[var(--gs-border)] flex items-center justify-center">
                    <span className="text-[9px] font-medium text-[#555] flex items-center gap-1.5">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      app.growsuite.io/{chapter.id === "capture" ? "leads" : chapter.id === "move" ? "pipeline" : chapter.id === "deliver" ? "projects/12" : chapter.id === "bill" ? "invoices/1043" : "activity"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── App Layout ── */}
              <div className="flex-1 flex overflow-hidden">

                {/* Sidebar */}
                <div className="w-[160px] bg-[var(--gs-bg)] border-r border-[var(--gs-border)] shrink-0 hidden md:flex flex-col">
                  {/* Workspace */}
                  <div className="p-3 pb-2 flex items-center">
                    <div className="scale-[0.65] origin-left">
                      <Logo theme="dark" />
                    </div>
                  </div>

                  {/* Nav Items */}
                  <nav className="flex-1 px-2 pb-3 flex flex-col gap-[1px] overflow-y-auto">
                    {NAV_ITEMS.map((item, i) => {
                      if ("type" in item && item.type === "divider") {
                        return <div key={`d-${i}`} className="h-px bg-[#1A1A1A] my-1.5 mx-1" />;
                      }
                      const navItem = item as { label: string; icon: any };
                      const isActive = navItem.label === chapter.navHighlight;
                      const Icon = navItem.icon;
                      return (
                        <div
                          key={navItem.label}
                          className={`flex items-center gap-2 px-2.5 py-[5px] rounded-[6px] text-[11px] font-medium transition-colors ${
                            isActive ? "bg-[var(--gs-surface)] text-[var(--gs-fg)]" : "text-[var(--gs-muted)]"
                          }`}
                        >
                          <Icon className={`h-[14px] w-[14px] shrink-0 ${isActive ? "text-[var(--gs-fg)]" : "text-[var(--gs-muted)]"}`} strokeWidth={1.5} />
                          <span>{navItem.label}</span>
                        </div>
                      );
                    })}
                  </nav>

                  {/* Bottom Nav */}
                  <div className="px-2 py-2 border-t border-[#1A1A1A] flex flex-col gap-[1px]">
                    {BOTTOM_NAV.map((item) => (
                      <div key={item.label} className="flex items-center gap-2 px-2.5 py-[5px] rounded-[6px] text-[11px] font-medium text-[var(--gs-muted)]">
                        <item.icon className="h-[14px] w-[14px] shrink-0 text-[var(--gs-muted)]" strokeWidth={1.5} />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-[var(--gs-bg)] relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeChapter}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.98 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0"
                    >
                      <ChapterUI />
                    </motion.div>
                  </AnimatePresence>
                </div>

              </div>
            </div>

            {/* Progress indicator below window */}
            <div className="flex items-center justify-center gap-2 mt-5">
              {CHAPTERS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    activeChapter === i ? "w-8 bg-[var(--gs-bg-alt)]" : activeChapter > i ? "w-3 bg-[var(--gs-bg-alt)]/30" : "w-3 bg-[var(--gs-bg-alt)]/10"
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Final Statement */}
      <div className="max-w-[1200px] mx-auto px-6 pb-32 md:pb-40 text-center">
        <p className="text-[20px] md:text-[28px] font-[800] tracking-tighter text-[var(--gs-bg-alt)]">
          One system. Every part of your business.
        </p>
        <p className="text-[15px] text-[#5A5A5A] mt-3 font-[400] tracking-tight">
          Lead → Deal → Project → Invoice → Payment. All connected. All in GrowSuite.
        </p>
      </div>
    </section>
  );
}
