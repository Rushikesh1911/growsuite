"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { ArrowRight } from "lucide-react";

// --- Types for Reusable Component ---
interface AccordionItem {
  id: string;
  label: string;
  eyebrow: string;
  heading: string;
  description: string;
  meta: string;
  cta: string;
  glow: string; // Dynamic background ambient glow color
  ui?: (isActive: boolean) => React.ReactNode;
}

interface ExpandingAccordionProps {
  items: AccordionItem[];
  activeIndex: number;
  setActiveIndex: (idx: number) => void;
  userInteracted: boolean;
  setUserInteracted: (val: boolean) => void;
}

// --- Magnetic Wrapper for Collapsed Tabs ---
function MagneticTab({ children, isActive }: { children: React.ReactNode; isActive: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Extremely snappy but smooth spring for the magnetic pull
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (isActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // Calculate distance from center of the collapsed tab
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left - centerX;
    const mouseY = e.clientY - rect.top - centerY;
    
    // Pull the content slightly towards the mouse (30% intensity)
    x.set(mouseX * 0.3);
    y.set(mouseY * 0.3);
  }

  return (
    <div 
      onMouseMove={handleMouse} 
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="absolute inset-0 z-20 flex items-center justify-center"
    >
      <motion.div
        style={{ x: springX, y: springY }}
        className="flex flex-col items-center justify-between h-full w-full py-10 pointer-events-none"
      >
        {children}
      </motion.div>
    </div>
  );
}

// --- Reusable Component ---
function ExpandingAccordion({ items, activeIndex, setActiveIndex, userInteracted, setUserInteracted }: ExpandingAccordionProps) {
  return (
    <div className="w-full flex gap-3 h-[420px] md:h-[500px] relative z-10">
      {items.map((item, index) => {
        const isActive = activeIndex === index;
        const numberLabel = `0${index + 1}`;

        return (
          <motion.div
            key={item.id}
            layout
            onMouseEnter={() => {
              setActiveIndex(index);
              setUserInteracted(true);
            }}
            onClick={() => {
              setActiveIndex(index);
              setUserInteracted(true);
            }}
            initial={false}
            animate={{
              flexGrow: isActive ? 1 : 0,
              flexBasis: isActive ? "0%" : "100px",
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`relative rounded-[28px] overflow-hidden cursor-pointer transition-colors duration-500 ${
              isActive 
                ? "bg-[var(--gs-bg-alt)] shadow-2xl ring-1 ring-white/10" 
                : "bg-white/80 backdrop-blur-sm border border-[rgba(0,0,0,0.06)] hover:bg-white"
            }`}
          >
            {/* Auto-advance Progress Indicator */}
            {isActive && !userInteracted && (
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 6, ease: "linear" }}
                className="absolute top-0 left-0 h-[3px] bg-white/20 z-50"
              />
            )}

            {/* Collapsed State: Magnetic Vertical Text & Number */}
            <AnimatePresence>
              {!isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <MagneticTab isActive={isActive}>
                    <span className="text-[12px] font-[700] text-[#AFAFAF]">{numberLabel}</span>
                    <div className="flex-1 flex items-center justify-center">
                      <span className="whitespace-nowrap -rotate-90 origin-center text-[13px] font-[700] uppercase tracking-[0.15em] text-[var(--gs-muted-light)]">
                        {item.label}
                      </span>
                    </div>
                  </MagneticTab>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded State: Full Content */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 p-10 md:p-14 flex items-center justify-between overflow-hidden"
                >
                  <div className="flex flex-col h-full justify-between max-w-[340px] shrink-0 z-10">
                    <div className="flex flex-col gap-4">
                      <motion.span 
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="text-[11px] font-[700] text-[var(--gs-muted)] uppercase tracking-[0.15em]"
                      >
                        {item.eyebrow}
                      </motion.span>
                      <motion.h3 
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="text-[32px] md:text-[40px] font-[800] tracking-[-0.04em] text-white leading-[1.05]"
                      >
                        {item.heading}
                      </motion.h3>
                      <motion.p 
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="text-[15px] text-[#AFAFAF] leading-[1.6] font-[400]"
                      >
                        {item.description}
                      </motion.p>
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-3 inline-flex"
                      >
                        <span className="text-[11px] font-[600] px-3.5 py-1.5 rounded-full bg-white/[0.04] text-[var(--gs-fg)] border border-white/[0.08]">
                          {item.meta}
                        </span>
                      </motion.div>
                    </div>
                    
                    <motion.button 
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-8 flex items-center gap-2 text-[14px] font-[600] text-white hover:text-[#AFAFAF] transition-colors self-start group"
                    >
                      {item.cta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>

                  {/* Right side: Alive UI visualization */}
                  {item.ui && (
                    <motion.div 
                      initial={{ opacity: 0, x: 30, scale: 0.95 }} 
                      animate={{ opacity: 1, x: 0, scale: 1 }} 
                      transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="hidden lg:flex w-full max-w-[380px] ml-10"
                    >
                      <div className="w-full">
                        <div className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] border-b-0 rounded-t-[14px] h-7 flex items-center px-4 gap-1.5 shadow-sm">
                          <div className="w-2.5 h-2.5 rounded-full bg-white/[0.15]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-white/[0.15]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-white/[0.15]" />
                        </div>
                        <div className="w-full bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-b-[14px] p-5 shadow-[0_32px_64px_rgba(0,0,0,0.5)] relative overflow-hidden">
                          {/* Inner glowing orb mapped to the item's theme */}
                          <div 
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[60%] blur-[40px] rounded-full pointer-events-none transition-colors duration-1000"
                            style={{ backgroundColor: item.glow }}
                          />
                          <div className="relative z-10">
                            {item.ui(isActive)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}


// --- GrowSuite Specific Data and Alive UI Components ---

type TagColor = "emerald" | "blue" | "amber" | "neutral";
const TAG_COLORS: Record<TagColor, string> = {
  emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  blue:    "bg-blue-500/15 text-blue-400 border-blue-500/20",
  amber:   "bg-amber-500/15 text-amber-400 border-amber-500/20",
  neutral: "bg-[var(--gs-surface-raised)] text-[#AFAFAF] border-[#333]",
};

// A row that staggers in
function AnimatedDarkUIRow({ icon, label, tag, tagColor, delayIndex, isActive }: { icon: string; label: string; tag: string; tagColor: TagColor, delayIndex: number, isActive: boolean }) {
  const iconMap: Record<string, React.ReactElement> = {
    client:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    project:  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    invoice:  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    payment:  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    deal:     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    task:     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    activity: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
      transition={{ duration: 0.4, delay: 0.3 + (delayIndex * 0.1), ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-between p-4 bg-[#141414] border border-[#2A2A2A] rounded-[14px] shadow-sm"
    >
      <div className="flex items-center gap-3.5">
        <div className="h-8 w-8 rounded-[10px] bg-[var(--gs-border)] flex items-center justify-center text-[var(--gs-muted)]">
          {iconMap[icon]}
        </div>
        <span className="text-[13px] font-[600] text-[var(--gs-fg)]">{label}</span>
      </div>
      <span className={`px-2.5 py-0.5 rounded-[6px] border text-[10px] font-[700] uppercase tracking-wider ${TAG_COLORS[tagColor]}`}>
        {tag}
      </span>
    </motion.div>
  );
}

// A metric card that counts up when active
function AnimatedDarkMiniMetric({ label, value, numericValue, prefix = "", suffix = "", delayIndex, isActive }: { label: string; value?: string, numericValue?: number, prefix?: string, suffix?: string, delayIndex: number, isActive: boolean }) {
  const count = useMotionValue(0);
  const displayValue = useTransform(count, (latest) => {
    return prefix + Math.round(latest).toLocaleString("en-IN") + suffix;
  });

  useEffect(() => {
    if (isActive && numericValue !== undefined) {
      count.set(0);
      animate(count, numericValue, { duration: 1.2, delay: 0.4 + (delayIndex * 0.1), ease: [0.16, 1, 0.3, 1] });
    }
  }, [isActive, numericValue, delayIndex, count]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: 0.3 + (delayIndex * 0.1), ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#141414] border border-[#2A2A2A] rounded-[14px] p-4 shadow-sm flex flex-col justify-center"
    >
      <p className="text-[10px] font-[600] uppercase tracking-wider text-[var(--gs-muted-light)] mb-1.5">{label}</p>
      {numericValue !== undefined ? (
        <motion.p className="text-[17px] font-[800] tracking-tight text-[var(--gs-fg)] tabular-nums">
          {displayValue}
        </motion.p>
      ) : (
        <p className="text-[17px] font-[800] tracking-tight text-[var(--gs-fg)] tabular-nums">{value}</p>
      )}
    </motion.div>
  );
}

const GROWSUITE_AUDIENCES: AccordionItem[] = [
  {
    id: "freelancers",
    label: "Freelancers",
    eyebrow: "01 — Solo",
    heading: "One person. Every moving part.",
    description: "Stay completely on top of your clients without dropping a single task. Everything in one unified view.",
    meta: "Leads • Projects • Invoices",
    cta: "Start your solo operation",
    glow: "rgba(16, 185, 129, 0.08)", // Emerald glow
    ui: (isActive) => (
      <div className="flex flex-col gap-3">
        <AnimatedDarkUIRow isActive={isActive} delayIndex={0} icon="client"  label="Meridian Studio"   tag="Active"      tagColor="emerald" />
        <AnimatedDarkUIRow isActive={isActive} delayIndex={1} icon="project" label="Brand Refresh"     tag="In progress" tagColor="blue" />
        <AnimatedDarkUIRow isActive={isActive} delayIndex={2} icon="invoice" label="Invoice #GS-1043"  tag="₹75,000"     tagColor="neutral" />
        <AnimatedDarkUIRow isActive={isActive} delayIndex={3} icon="payment" label="Payment received"  tag="Paid"        tagColor="emerald" />
      </div>
    ),
  },
  {
    id: "teams",
    label: "Small Teams",
    eyebrow: "02 — Teams",
    heading: "Everyone knows what happens next.",
    description: "Hand off projects, assign tasks, and track your entire sales pipeline together in real-time.",
    meta: "Kanban • Assignments • Activity",
    cta: "Align your team",
    glow: "rgba(59, 130, 246, 0.08)", // Blue glow
    ui: (isActive) => (
      <div className="flex flex-col gap-3">
        <AnimatedDarkUIRow isActive={isActive} delayIndex={0} icon="deal"     label="Platform Integration" tag="₹2,40,000" tagColor="neutral" />
        <AnimatedDarkUIRow isActive={isActive} delayIndex={1} icon="task"     label="Review proposal"      tag="Assigned"  tagColor="amber"   />
        <AnimatedDarkUIRow isActive={isActive} delayIndex={2} icon="deal"     label="Sent Proposal"        tag="Pending"   tagColor="blue" />
        <AnimatedDarkUIRow isActive={isActive} delayIndex={3} icon="activity" label="Team sync logged"     tag="Just now"  tagColor="neutral" />
      </div>
    ),
  },
  {
    id: "agencies",
    label: "Agencies",
    eyebrow: "03 — Agencies",
    heading: "See the business, not scattered tools.",
    description: "Track revenue, monitor team capacity, and scale your operations without the friction of 10 different apps.",
    meta: "Dashboards • Metrics • Payouts",
    cta: "Scale your agency",
    glow: "rgba(245, 158, 11, 0.08)", // Amber glow
    ui: (isActive) => (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3 mb-1">
          <AnimatedDarkMiniMetric isActive={isActive} delayIndex={0} label="Revenue"    numericValue={525000} prefix="₹" />
          <AnimatedDarkMiniMetric isActive={isActive} delayIndex={1} label="Pipeline"   numericValue={14} suffix=" Deals" />
          <AnimatedDarkMiniMetric isActive={isActive} delayIndex={2} label="Conversion" numericValue={34} suffix="%" />
          <AnimatedDarkMiniMetric isActive={isActive} delayIndex={3} label="Payments"   numericValue={240000} prefix="₹" />
        </div>
        <AnimatedDarkUIRow isActive={isActive} delayIndex={4} icon="payment" label="Monthly payout" tag="Settled" tagColor="emerald" />
      </div>
    ),
  },
];

export function MadeFor() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const activeGlow = GROWSUITE_AUDIENCES[activeIndex].glow;

  // Auto-advance logic wrapper (handles interval)
  useEffect(() => {
    if (userInteracted) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % GROWSUITE_AUDIENCES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [userInteracted]);

  return (
    <section className="py-32 md:py-40 bg-[#FAFAF8] border-t border-[rgba(0,0,0,0.05)] relative overflow-hidden">
      
      {/* Dynamic Ambient Background Glow that reacts to the active tab */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none opacity-60"
        animate={{ backgroundColor: activeGlow }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="flex flex-col gap-3 mb-16 text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-[0.1em]">Who is this for?</span>
          <h2 className="text-[32px] sm:text-[44px] font-[800] tracking-[-0.04em] text-[var(--gs-bg-alt)] leading-[1.08]">
            Built for how you actually work.
          </h2>
        </div>

        <ExpandingAccordion 
          items={GROWSUITE_AUDIENCES} 
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          userInteracted={userInteracted}
          setUserInteracted={setUserInteracted}
        />
        
      </div>
    </section>
  );
}
