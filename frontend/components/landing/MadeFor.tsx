"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, User, Users, Briefcase, FileText, CheckCircle, Flame, CheckSquare } from "lucide-react";
import Link from "next/link";

function Cursor({ color, label }: { color: string; label: string }) {
  return (
    <div className="relative flex items-center justify-center pointer-events-none drop-shadow-xl">
      <svg width="20" height="20" viewBox="0 0 24 24" fill={color} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute top-0 left-0 origin-top-left -rotate-12">
        <path d="M3 3l7 19 2-8 8-2-19-9z"/>
      </svg>
      <div 
        className="absolute top-5 left-5 px-2.5 py-0.5 rounded-[6px] text-[12px] font-bold text-white shadow-lg whitespace-nowrap z-20"
        style={{ backgroundColor: color }}
      >
        {label}
      </div>
    </div>
  );
}

function CursorIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M4 2.69127C4 1.93067 4.8154 1.44851 5.48726 1.8118L22.4069 10.9609C23.0996 11.3354 23.0893 12.3415 22.3882 12.7001L15.3409 16.3056L11.7588 23.4158C11.4019 24.1245 10.383 24.1306 10.0163 23.4267L1.62473 7.32483C1.25866 6.62241 1.76569 5.8003 2.55394 5.8003H4V2.69127Z" /></svg>;
}
function EyeIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function BanknoteIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>;
}

function AnimatedShowcase({ activeTab }: { activeTab: number }) {
  return (
    <div className="relative w-full max-w-4xl mx-auto mb-24 h-[300px] flex items-center justify-center perspective-[1000px]">
      {/* Ambient background glow - colors shift based on tab */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[300px] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: activeTab === 0 ? 'rgba(34, 197, 94, 0.15)' : activeTab === 1 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(168, 85, 247, 0.15)' }}
      />
      
      <div className="relative w-full h-full flex items-center justify-center z-10">
        
        {/* TAB 0: Multi-Window / Pills View (Solo) */}
        <motion.div
          initial={false}
          animate={{
            opacity: activeTab === 0 ? 1 : 0,
            scale: activeTab === 0 ? 1 : 0.95,
            pointerEvents: activeTab === 0 ? "auto" : "none"
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4"
        >
          {/* Pill 1 - Lead */}
          <motion.div 
            animate={{ 
              x: activeTab === 0 ? -40 : 0,
              y: activeTab === 0 ? [0, -6, 0] : 0
            }}
            transition={{ 
              x: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0 }
            }}
            whileHover={{ scale: 1.05, x: activeTab === 0 ? -30 : 0 }}
            className="flex items-center gap-6 bg-[#111111] border border-[#222] hover:border-[#333] rounded-full py-3 px-6 shadow-2xl z-30 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <span className="text-[14px] font-medium text-[#EDEDED]">New Lead: Sarah</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 text-[11px] font-bold flex items-center gap-1">
              <Flame className="w-3 h-3" /> Hot
            </div>
            <div className="flex items-center gap-4 text-[12px] font-medium">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                $12,000
              </div>
            </div>
          </motion.div>

          {/* Pill 2 - Project */}
          <motion.div 
            animate={{ 
              x: activeTab === 0 ? 20 : 0,
              y: activeTab === 0 ? [0, -8, 0] : 0
            }}
            transition={{ 
              x: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              y: { repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1 }
            }}
            whileHover={{ scale: 1.05, x: activeTab === 0 ? 30 : 0 }}
            className="flex items-center gap-6 bg-[#111111] border border-[#222] hover:border-[#333] rounded-full py-3 px-6 shadow-2xl z-20 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="text-[14px] font-medium text-[#EDEDED]">Website Redesign</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[11px] font-bold">In Progress</div>
            <div className="flex items-center gap-4 text-[12px] font-medium">
              <div className="flex items-center gap-1.5 text-[#888]">
                <CheckSquare className="w-3.5 h-3.5" /> 3/5 Tasks
              </div>
            </div>
          </motion.div>

          {/* Pill 3 - Invoice */}
          <motion.div 
            animate={{ 
              x: activeTab === 0 ? -20 : 0,
              y: activeTab === 0 ? [0, -5, 0] : 0
            }}
            transition={{ 
              x: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              y: { repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 2 }
            }}
            whileHover={{ scale: 1.05, x: activeTab === 0 ? -10 : 0 }}
            className="flex items-center gap-6 bg-[#111111] border border-[#222] hover:border-[#333] rounded-full py-3 px-6 shadow-2xl z-10 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-[14px] font-medium text-[#EDEDED]">Invoice #1042</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Paid
            </div>
            <div className="flex items-center gap-4 text-[12px] font-medium">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                $4,500
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* TAB 1: Collaborative Table View (Teams) */}
        <motion.div
          initial={false}
          animate={{
            opacity: activeTab === 1 ? 1 : 0,
            scale: activeTab === 1 ? 1 : 1.05,
            pointerEvents: activeTab === 1 ? "auto" : "none"
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute w-full rounded-2xl bg-[#0A0A0A] border border-[#222] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden p-6 md:p-8"
        >
          {/* Table Header */}
          <div className="flex text-[12px] font-medium text-[#666] pb-4 border-b border-[#222] mb-4 uppercase tracking-wider">
            <div className="flex-[2]">Client Name</div>
            <div className="flex-[1] hidden sm:block">Amount</div>
            <div className="flex-[1]">Country</div>
            <div className="flex-[1] text-right">Timestamp</div>
          </div>
          
          {/* Rows */}
          <div className="flex flex-col gap-2">
            {/* Row 1 - Jeff */}
            <div className={`flex items-center text-[14px] text-[#EDEDED] py-3 px-3 relative rounded-[8px] transition-colors ${activeTab === 1 ? 'border border-green-500/50 bg-green-500/5' : 'border border-transparent'}`}>
              <div className="flex-[2] font-medium text-[#888]">meridian@studio.com</div>
              <div className="flex-[1] hidden sm:block">₹84,250</div>
              <div className="flex-[1] text-[#888]">Canada</div>
              <div className="flex-[1] text-right text-[#666] text-[13px]">Feb 23, 12:34pm</div>
              
              {/* Cursor Jeff */}
              {activeTab === 1 && (
                <motion.div 
                  initial={{ x: -100, y: 100, opacity: 0 }}
                  animate={{ x: -20, y: -10, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 1, type: "spring", bounce: 0.2 }}
                  className="absolute left-[5%] sm:left-0 top-[60%] z-20"
                >
                  <Cursor color="#22c55e" label="Jeff" />
                </motion.div>
              )}
            </div>

            {/* Row 2 - You */}
            <div className={`flex items-center text-[14px] text-[#EDEDED] py-3 px-3 relative rounded-[8px] transition-colors ${activeTab === 1 ? 'border border-orange-500/50 bg-orange-500/5' : 'border border-transparent'}`}>
              <div className="flex-[2] font-medium text-[#888]">acme@corp.com</div>
              <div className="flex-[1] hidden sm:block">₹1,52,250</div>
              <div className="flex-[1] text-[#888]">USA</div>
              <div className="flex-[1] text-right text-[#666] text-[13px]">Feb 23, 12:34pm</div>
              
              {/* Cursor You */}
              {activeTab === 1 && (
                <motion.div 
                  initial={{ x: 200, y: -50, opacity: 0 }}
                  animate={{ x: 150, y: 15, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1, type: "spring", bounce: 0.2 }}
                  className="absolute left-[40%] top-[40%] z-30"
                >
                  <Cursor color="#f97316" label="You" />
                </motion.div>
              )}
            </div>
            
            {/* Row 3 - Inactive */}
            <div className="flex items-center text-[14px] text-[#EDEDED] py-3 px-3 relative rounded-[8px] border border-transparent">
              <div className="flex-[2] font-medium text-[#888]">globex@inc.com</div>
              <div className="flex-[1] hidden sm:block">₹26,000</div>
              <div className="flex-[1] text-[#888]">UK</div>
              <div className="flex-[1] text-right text-[#666] text-[13px]">Feb 23, 12:34pm</div>
            </div>

            {/* Row 4 - Michael */}
            <div className={`flex items-center text-[14px] text-[#EDEDED] py-3 px-3 relative rounded-[8px] transition-colors ${activeTab === 1 ? 'border border-purple-500/50 bg-purple-500/5' : 'border border-transparent'}`}>
              <div className="flex-[2] font-medium text-[#888]">stark@industries.com</div>
              <div className="flex-[1] hidden sm:block">₹67,830</div>
              <div className="flex-[1] text-[#888]">Australia</div>
              <div className="flex-[1] text-right text-[#666] text-[13px]">Feb 23, 12:34pm</div>
              
              {/* Cursor Michael */}
              {activeTab === 1 && (
                <motion.div 
                  initial={{ x: -50, y: 100, opacity: 0 }}
                  animate={{ x: 60, y: 15, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 1, type: "spring", bounce: 0.2 }}
                  className="absolute left-[20%] top-[30%] z-20"
                >
                  <Cursor color="#a855f7" label="Michael" />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* TAB 2: Metrics Grid (Agencies) */}
        <motion.div
          initial={false}
          animate={{
            opacity: activeTab === 2 ? 1 : 0,
            scale: activeTab === 2 ? 1 : 1.05,
            pointerEvents: activeTab === 2 ? "auto" : "none"
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute w-full max-w-2xl rounded-2xl bg-[#0A0A0A] border border-[#222] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden p-8 grid grid-cols-2 gap-4"
        >
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 flex flex-col justify-center">
            <p className="text-[12px] font-medium text-[#888] mb-1">Total Revenue</p>
            <p className="text-[28px] font-medium text-[#EDEDED]">₹5,24,000</p>
            <p className="text-[11px] text-emerald-400 mt-2 font-medium">+14.2% from last month</p>
          </div>
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 flex flex-col justify-center">
            <p className="text-[12px] font-medium text-[#888] mb-1">Active Pipeline</p>
            <p className="text-[28px] font-medium text-[#EDEDED]">₹1,85,000</p>
            <p className="text-[11px] text-emerald-400 mt-2 font-medium">12 active deals</p>
          </div>
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 flex flex-col justify-center">
            <p className="text-[12px] font-medium text-[#888] mb-1">Conversion Rate</p>
            <p className="text-[28px] font-medium text-[#EDEDED]">34%</p>
            <p className="text-[11px] text-orange-400 mt-2 font-medium">-2.1% from last month</p>
          </div>
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 flex flex-col justify-center">
            <p className="text-[12px] font-medium text-[#888] mb-1">Team Capacity</p>
            <p className="text-[28px] font-medium text-[#EDEDED]">82%</p>
            <p className="text-[11px] text-[#666] mt-2 font-medium">Optimal load</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// Tab Component for the Footer
function FeatureTab({ 
  index, 
  activeTab, 
  title, 
  desc, 
  icon, 
  onClick 
}: { 
  index: number; 
  activeTab: number; 
  title: string; 
  desc: string; 
  icon: React.ReactNode; 
  onClick: () => void;
}) {
  const isActive = activeTab === index;
  
  return (
    <div 
      onClick={onClick}
      className={`flex flex-col cursor-pointer transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-60'}`}
    >
      {/* Auto-progress line */}
      <div className="w-full h-[2px] bg-[#222] mb-6 overflow-hidden">
        {isActive && (
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 6, ease: "linear" }}
            className="h-full bg-white"
          />
        )}
      </div>

      <div className="flex items-center gap-3 mb-4 text-[#EDEDED]">
        {icon}
        <h3 className="text-[18px] font-medium tracking-tight">
          {title}
        </h3>
      </div>
      <p className="text-[15px] leading-relaxed text-[#888] pr-4">
        {desc}
      </p>
    </div>
  );
}

export function MadeFor() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  
  const [activeTab, setActiveTab] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);

  // Auto-advance logic
  useEffect(() => {
    if (userInteracted || !isInView) return;
    const timer = setInterval(() => {
      setActiveTab((current) => (current + 1) % 3);
    }, 6000); // 6 seconds per tab
    return () => clearInterval(timer);
  }, [userInteracted, isInView]);

  return (
    <section className="bg-[#050505] py-32 border-y border-[#222] overflow-hidden" id="made-for">
      <div className="max-w-[1200px] mx-auto px-6" ref={containerRef}>
        
        {/* Top Header Split */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-24 gap-8">
          <div className="flex flex-col gap-4 max-w-md">
            <h2 className="text-[36px] md:text-[48px] font-medium tracking-tight text-white leading-[1.1]">
              Built for how you actually work.
            </h2>
            <Link href="/auth/sign-up" className="flex items-center gap-2 text-[15px] font-semibold text-blue-500 hover:text-blue-400 transition-colors group w-fit">
              Explore capabilities
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="max-w-sm pt-2">
            <p className="text-[16px] text-[#888] leading-relaxed">
              Whether you're a solo freelancer or a growing agency, GrowSuite adapts to your workflow. Control every aspect of your pipeline seamlessly with your team.
            </p>
          </div>
        </div>

        {/* Center Stage: Interactive Collaborative UI */}
        <AnimatedShowcase activeTab={activeTab} />

        {/* Bottom Features Grid / Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-4 pt-4">
          <FeatureTab 
            index={0}
            activeTab={activeTab}
            onClick={() => { setActiveTab(0); setUserInteracted(true); }}
            title="Solo Freelancers"
            desc="Stay completely on top of your clients without dropping a single task. Keep every lead, invoice, and conversation in one unified view."
            icon={<User className="w-5 h-5" />}
          />
          <FeatureTab 
            index={1}
            activeTab={activeTab}
            onClick={() => { setActiveTab(1); setUserInteracted(true); }}
            title="Small Teams"
            desc="Hand off projects, assign tasks, and track your entire sales pipeline together in real-time. Everyone always knows what happens next."
            icon={<Users className="w-5 h-5" />}
          />
          <FeatureTab 
            index={2}
            activeTab={activeTab}
            onClick={() => { setActiveTab(2); setUserInteracted(true); }}
            title="Agencies"
            desc="Track revenue, monitor team capacity, and scale your operations without the friction of 10 different apps. See the business, not the tools."
            icon={<Briefcase className="w-5 h-5" />}
          />
        </div>
      </div>
    </section>
  );
}
