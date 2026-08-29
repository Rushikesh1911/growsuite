"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

// Pre-calculated random scattered properties for consistency
const SCATTERED_TAGS = [
  { label: "WhatsApp threads",        top: "10%", left: "8%",  rot: -4, size: 14, opacity: 0.9, delay: 0.1 },
  { label: "Google Sheets",           top: "22%", left: "68%", rot: 5,  size: 13, opacity: 0.6, delay: 0.4 },
  { label: "Email drafts",            top: "38%", left: "15%", rot: -2, size: 15, opacity: 1,   delay: 0.25 },
  { label: "Sticky notes",            top: "65%", left: "75%", rot: 6,  size: 12, opacity: 0.5, delay: 0.55 },
  { label: "Notion pages",            top: "75%", left: "10%", rot: -5, size: 13, opacity: 0.7, delay: 0.35 },
  { label: "Separate invoicing tool", top: "8%",  left: "45%", rot: 2,  size: 14, opacity: 0.8, delay: 0.2 },
  { label: "Another project app",     top: "45%", left: "48%", rot: -6, size: 12, opacity: 0.4, delay: 0.05 },
  { label: "Calendar reminders",      top: "52%", left: "20%", rot: 4,  size: 14, opacity: 0.85,delay: 0.45 },
  { label: "Excel files",             top: "80%", left: "45%", rot: -3, size: 15, opacity: 1,   delay: 0.15 },
  { label: "Paper receipts",          top: "88%", left: "70%", rot: 5,  size: 13, opacity: 0.6, delay: 0.6 },
  { label: "Slack messages",          top: "5%",  left: "75%", rot: -4, size: 12, opacity: 0.5, delay: 0.3 },
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
  const cls = "w-3.5 h-3.5 text-[#5A5A5A]";
  const icons: Record<string, React.ReactElement> = {
    clients:  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    deals:    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
    projects: <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    tasks:    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    invoices: <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    payments: <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    activity: <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  };
  return icons[type] || <span />;
}

export function MessySimple() {
  return (
    <section className="py-32 md:py-40 bg-[#FAFAF8] overflow-hidden">
      <div className="max-w-[1100px] mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-stretch">
          
          {/* Left — The Problem */}
          <div className="flex flex-col gap-10 h-full">
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest">The problem</span>
              <h2 className="text-[32px] sm:text-[42px] font-[800] tracking-tighter text-[var(--gs-bg-alt)] leading-[1.05]">
                Too many places<br />to run one business.
              </h2>
              <p className="text-[15px] text-[#5A5A5A] leading-[1.65] font-[400] max-w-md">
                Running a business often means jumping between too many tools. Context gets lost. Time gets wasted. Things fall through the gaps.
              </p>
            </div>

            {/* Chaotic Scattered Tags Box */}
            <div className="relative flex-1 min-h-[420px] bg-white bg-[radial-gradient(#E0E0E0_1px,transparent_1px)] bg-[size:16px_16px] border border-[rgba(0,0,0,0.06)] rounded-[24px] shadow-sm overflow-hidden p-6">
              {SCATTERED_TAGS.map((tag) => (
                <motion.div
                  key={tag.label}
                  initial={{ opacity: 0, y: -20, rotate: tag.rot + 10 }}
                  whileInView={{ opacity: tag.opacity, y: 0, rotate: tag.rot }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ 
                    duration: 0.6, 
                    delay: tag.delay, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  style={{
                    position: "absolute",
                    top: tag.top,
                    left: tag.left,
                    fontSize: `${tag.size}px`,
                  }}
                  className="px-3.5 py-1.5 rounded-full border border-[rgba(0,0,0,0.08)] bg-white font-[500] text-[#333] shadow-sm whitespace-nowrap"
                >
                  {tag.label}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right — The Solution */}
          <div className="flex flex-col gap-10 h-full">
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest">The solution</span>
              <h2 className="text-[32px] sm:text-[42px] font-[800] tracking-tighter text-[var(--gs-bg-alt)] leading-[1.05]">
                One workspace.<br /><span className="text-[#AFAFAF]">Less chasing.</span>
              </h2>
              <p className="text-[15px] text-[#5A5A5A] leading-[1.65] font-[400] max-w-md">
                GrowSuite connects every part of your business. Clients, deals, projects and invoices — all together. Nothing to stitch. Nothing to sync.
              </p>
            </div>

            {/* Unified App List Box */}
            <div className="flex-1 min-h-[420px] bg-white border border-[rgba(0,0,0,0.06)] rounded-[24px] shadow-xl flex flex-col overflow-hidden">
              {/* App Header */}
              <div className="px-5 py-4 border-b border-[rgba(0,0,0,0.05)] bg-[#FAFAF8] flex items-center gap-2.5">
                <div className="scale-[0.8] origin-left">
                  <Logo />
                </div>
              </div>
              
              {/* List */}
              <div className="flex-1 flex flex-col justify-center">
                {UNIFIED.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ 
                      duration: 0.4, 
                      delay: 0.6 + (i * 0.08), // Delay so problem chaos finishes first
                      ease: [0.16, 1, 0.3, 1] 
                    }}
                    className="flex items-center gap-3 px-5 py-3 transition-colors duration-200 hover:bg-[#FAFAF8] group border-b border-[rgba(0,0,0,0.03)] last:border-0 cursor-default"
                  >
                    <div className="h-7 w-7 rounded-[8px] bg-[#F5F5F0] flex items-center justify-center shrink-0">
                      <ItemIcon type={item.icon} />
                    </div>
                    <span className="text-[13px] font-[600] text-[var(--gs-bg-alt)]">{item.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#AFAFAF] ml-auto transition-transform duration-200 group-hover:translate-x-1" />
                  </motion.div>
                ))}
              </div>

              {/* Subtle Footer */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 1.4 }}
                className="px-5 py-3 bg-[#FAFAF8]/50 border-t border-[rgba(0,0,0,0.04)] flex justify-center"
              >
                <span className="text-[10px] font-[700] text-[#AFAFAF] uppercase tracking-[0.15em]">
                  + Everything else, in sync
                </span>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
