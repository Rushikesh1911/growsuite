"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { CheckSquare, CreditCard, Users, LineChart, Check, Calendar } from "lucide-react";

export function ProductStory() {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Different parallax speeds for the cards to create depth
  // Removed parallax on individual cards to maintain strict grid alignment
  // const yFast = useTransform(scrollYProgress, [0, 1], [60, -60]);
  // const yMedium = useTransform(scrollYProgress, [0, 1], [30, -30]);
  // const ySlow = useTransform(scrollYProgress, [0, 1], [10, -10]);

  return (
    <section ref={containerRef} className="dark-section relative w-full bg-black py-32 z-10 border-y border-[#222]" id="product">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <h2 className="text-[36px] md:text-[48px] font-medium tracking-tight text-[#EDEDED] leading-[1.1] max-w-[600px]">
            One Workspace.<br/>
            <span className="text-[#888]">Every part of the client journey.</span>
          </h2>
        </div>  

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[420px]">
        
        {/* Task Management (2 columns on large screens) */}
        <motion.div 
          className="lg:col-span-2 bg-[#0A0A0A] border border-[#222] rounded-[16px] overflow-hidden flex flex-col group relative"
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`, backgroundSize: "32px 32px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)" }} />
          <div className="p-8 pb-0 relative z-10">
            <h3 className="text-[20px] font-medium text-[#EDEDED] tracking-tight mb-2">Task management? Check.</h3>
            <p className="text-[14px] text-[#888] max-w-[400px]">
              Set tasks and assign to members of your team to streamline communication and make sure nothing is missed.
            </p>
          </div>
          
          <div className="flex-1 relative px-8 flex items-end justify-center pb-0">
            <div className="w-full max-w-[500px] bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-t-[16px] shadow-lg p-5 pb-8 relative translate-y-8 group-hover:translate-y-4 transition-transform duration-500">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[14px] font-semibold text-[var(--gs-fg)]">My tasks</span>
                <div className="flex gap-2">
                  <span className="text-[11px] font-medium text-[#666] border border-[var(--gs-border)] bg-[var(--gs-bg)] px-2 py-1 rounded-[6px]">Add Task</span>
                  <span className="text-[11px] font-medium text-white bg-[var(--gs-status-overdue)] px-2 py-1 rounded-[6px]">All Tasks</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4 text-[11px] text-[var(--gs-muted-light)]">
                <span>Sort by:</span>
                <span className="border border-[var(--gs-border)] bg-[var(--gs-surface)] px-2 py-1 rounded-[4px] flex items-center gap-1">Date: Oct 15 <span className="ml-1">×</span></span>
                <span className="border border-[var(--gs-border)] bg-[var(--gs-surface)] px-2 py-1 rounded-[4px]">+</span>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px] p-3">
                  <div className="flex items-start gap-2 mb-3">
                    <div className="w-3.5 h-3.5 rounded-full border border-[var(--gs-border)] mt-0.5"></div>
                    <span className="text-[12px] font-medium text-[var(--gs-fg)] leading-tight">Send Tax Reports to Accountant</span>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <div className="text-[10px] text-[var(--gs-muted-light)] mb-1">Deadline</div>
                      <div className="text-[10px] text-[#666]">12am, Oct 15</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--gs-muted-light)] mb-1">Status</div>
                      <div className="text-[10px] font-medium text-[var(--gs-status-overdue)] bg-[var(--gs-status-overdue)]/10 px-1.5 py-0.5 rounded-[4px]">Urgent</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px] p-3 opacity-60">
                  <div className="flex items-start gap-2 mb-3">
                    <div className="w-3.5 h-3.5 rounded-full border border-[var(--gs-border)] mt-0.5"></div>
                    <span className="text-[12px] font-medium text-[var(--gs-fg)] leading-tight">Activate Business MasterCard</span>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <div className="text-[10px] text-[var(--gs-muted-light)] mb-1">Deadline</div>
                      <div className="text-[10px] text-[#666]">11am, Oct 15</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--gs-muted-light)] mb-1">Status</div>
                      <div className="text-[10px] font-medium text-[#666] bg-[var(--gs-border)] px-1.5 py-0.5 rounded-[4px]">Non-urgent</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Invoices & Payments */}
        <motion.div 
          className="bg-[#0A0A0A] border border-[#222] rounded-[16px] overflow-hidden flex flex-col group relative"
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`, backgroundSize: "32px 32px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)" }} />
          <div className="p-8 pb-0 relative z-10">
            <h3 className="text-[20px] font-medium text-[#EDEDED] tracking-tight mb-2">Fast, easy payments</h3>
            <p className="text-[14px] text-[#888]">
              Send beautiful invoices and get paid via credit card or ACH directly from your clients.
            </p>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center p-8">
            <div className="w-full max-w-[280px] aspect-[1.6/1] bg-[#EDEDED] rounded-[16px] shadow-lg p-5 relative overflow-hidden group-hover:scale-105 group-hover:rotate-[-2deg] transition-transform duration-500">
              <div className="flex justify-between items-start h-full flex-col relative z-10 text-[#111111]">
                <div className="flex justify-between w-full">
                  <span className="text-[18px] font-bold tracking-tight">Invoice #1024</span>
                  <div className="flex gap-1">
                    <div className="w-6 h-6 rounded-full bg-black/10"></div>
                    <div className="w-6 h-6 rounded-full bg-black/10 -ml-3"></div>
                  </div>
                </div>
                
                <div className="w-full mt-auto">
                  <div className="flex justify-between items-end">
                    <div className="flex gap-3 text-[14px] font-medium tracking-widest font-mono opacity-80">
                      <span>****</span>
                      <span>2719</span>
                    </div>
                    <span className="text-[24px] font-medium tracking-tight">₹4,200</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Real-time Pipeline */}
        <motion.div 
          className="bg-[#0A0A0A] border border-[#222] rounded-[16px] overflow-hidden flex flex-col group relative"
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`, backgroundSize: "32px 32px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)" }} />
          <div className="p-8 pb-0 relative z-10">
            <h3 className="text-[20px] font-medium text-[#EDEDED] tracking-tight mb-2">Pipeline visibility</h3>
            <p className="text-[14px] text-[#888]">
              Get more bang for your buck by closing deals faster with an organized, visual sales pipeline.
            </p>
          </div>
          
          <div className="flex-1 relative px-8 flex items-end justify-center">
             <div className="w-full bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-t-[12px] p-5 pb-0 shadow-lg translate-y-4 group-hover:translate-y-2 transition-transform duration-500">
                <div className="flex items-center justify-between mb-4 border-b border-[var(--gs-border)] pb-3">
                  <span className="text-[12px] font-semibold text-[var(--gs-fg)]">Pipeline Value</span>
                  <div className="flex flex-col items-end">
                    <span className="text-[16px] font-bold text-[var(--gs-fg)]">₹16,073.49</span>
                    <span className="text-[10px] font-medium text-[var(--gs-status-positive)]">+ 9.3%</span>
                  </div>
                </div>
                
                <div className="h-[80px] w-full flex items-end justify-between gap-1 pb-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--gs-status-positive)]/10 to-transparent"></div>
                  {[40, 70, 45, 90, 60, 85, 100].map((h, i) => (
                    <div key={i} className="w-full bg-[var(--gs-status-positive)] rounded-t-[2px] opacity-80" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
             </div>
          </div>
        </motion.div>

        {/* Team & Permissions */}
        <motion.div 
          className="bg-[#0A0A0A] border border-[#222] rounded-[16px] overflow-hidden flex flex-col group relative"
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`, backgroundSize: "32px 32px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)" }} />
          <div className="p-8 pb-0 relative z-10">
            <h3 className="text-[20px] font-medium text-[#EDEDED] tracking-tight mb-2">Manage your team</h3>
            <p className="text-[14px] text-[#888]">
              Give your team authority to manage projects, clients, and deals with robust access control.
            </p>
          </div>
          
          <div className="flex-1 relative p-6 flex flex-col justify-end">
            <div className="bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[12px] p-4 shadow-sm mb-4 translate-y-2 group-hover:-translate-y-1 transition-transform duration-500">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[12px] font-bold text-indigo-600 overflow-hidden relative">
                   <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Dwayne Tatum" className="w-full h-full object-cover" />
                 </div>
                 <div>
                   <div className="text-[13px] font-medium text-[var(--gs-fg)]">Dwayne Tatum</div>
                   <div className="text-[11px] text-[#666]">Project Manager</div>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded-[4px] border border-[var(--gs-border)] flex items-center justify-center"></div>
                   <span className="text-[11px] text-[var(--gs-fg)]">Manage Billing</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded-[4px] bg-[var(--gs-status-info)] flex items-center justify-center text-white">
                     <Check className="w-3 h-3" strokeWidth={3} />
                   </div>
                   <span className="text-[11px] text-[var(--gs-fg)]">Manage Tasks</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded-[4px] bg-[var(--gs-status-info)] flex items-center justify-center text-white">
                     <Check className="w-3 h-3" strokeWidth={3} />
                   </div>
                   <span className="text-[11px] text-[var(--gs-fg)]">View Pipeline</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded-[4px] border border-[var(--gs-border)] flex items-center justify-center"></div>
                   <span className="text-[11px] text-[var(--gs-fg)]">Export Data</span>
                 </div>
               </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--gs-surface)] bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold z-30 overflow-hidden relative">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User 1" className="w-full h-full object-cover" />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[var(--gs-surface)] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold -ml-3 z-20 overflow-hidden relative">
                <img src="https://randomuser.me/api/portraits/men/46.jpg" alt="User 2" className="w-full h-full object-cover" />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[var(--gs-surface)] bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px] font-bold -ml-3 z-10 overflow-hidden relative">
                <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="User 3" className="w-full h-full object-cover" />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[var(--gs-surface)] bg-[var(--gs-bg-alt)] text-[var(--gs-fg)] flex items-center justify-center -ml-3 z-0 text-[10px] font-medium shadow-sm">+3</div>
            </div>
          </div>
        </motion.div>

        {/* CTA Highlight Block */}
        <motion.div 
          className="bg-black border border-[#222] rounded-[16px] overflow-hidden flex flex-col relative group text-[var(--gs-fg)] p-8 shadow-2xl"
        >
           <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-50"></div>
           
           <h3 className="text-[24px] font-medium tracking-tight mb-4 leading-tight relative z-10 text-[#EDEDED]">
             What would you do with an extra 10 hours / week?
           </h3>
           
           <p className="text-[14px] text-[#888] leading-relaxed mb-8 relative z-10 max-w-[280px]">
             Our clients save on average 520 hours every year by using GrowSuite instead of scattered tools. Join them.
           </p>
           
           <div className="mt-auto flex flex-col sm:flex-row gap-3 relative z-10">
              <Link href="/auth/sign-up" className="flex-1 bg-white hover:bg-gray-100 text-black font-bold rounded-[8px] py-3 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-px hover:shadow-md text-[14px]">
               Sign up
             </Link>
             <button className="group flex-1 bg-black/20 hover:bg-black/30 text-white font-semibold rounded-[8px] py-3 flex items-center justify-center gap-2 transition-colors text-[14px] border border-white/20">
               <Calendar className="w-4 h-4" />
               <div className="relative overflow-hidden h-[20px]">
                 <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1/2">
                   <span className="flex items-center justify-center h-[20px]">Book Call</span>
                   <span className="flex items-center justify-center h-[20px]">Book Call</span>
                 </div>
               </div>
             </button>
           </div>
        </motion.div>

      </div>
      </div>
    </section>
  );
}
