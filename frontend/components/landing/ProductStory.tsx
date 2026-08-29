"use client";

import React from "react";
import Link from "next/link";
import { CheckSquare, CreditCard, Users, LineChart, Check, Calendar } from "lucide-react";

export function ProductStory() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 py-24 z-10" id="product">
      <div className="flex flex-col items-center justify-center text-center mb-16">
        <h2 className="text-[32px] md:text-[40px] font-extrabold tracking-tight text-inherit leading-[1.1] max-w-[600px]">
          Everything you need.<br/>
          <span className="text-black/40 dark:text-[var(--gs-muted)]">Nothing you don't.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[420px]">
        {/* Task Management (2 columns on large screens) */}
        <div className="lg:col-span-2 bg-[var(--gs-surface)] rounded-[24px] border border-[var(--gs-border)] overflow-hidden flex flex-col group relative">
          <div className="p-8 pb-4">
            <h3 className="text-[24px] font-bold text-[var(--gs-fg)] tracking-tight mb-2">Task management? Check.</h3>
            <p className="text-[15px] text-[var(--gs-muted)] max-w-[400px]">
              Set tasks and assign to members of your team to streamline communication and make sure nothing is missed.
            </p>
          </div>
          
          <div className="flex-1 relative px-8 flex items-end justify-center pb-0">
            <div className="w-full max-w-[500px] bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-t-[16px] shadow-lg p-5 pb-8 relative translate-y-8 group-hover:translate-y-4 transition-transform duration-500">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[14px] font-semibold text-[var(--gs-fg)]">My tasks</span>
                <div className="flex gap-2">
                  <span className="text-[11px] font-medium text-[var(--gs-muted)] border border-[var(--gs-border)] bg-[var(--gs-bg)] px-2 py-1 rounded-[6px]">Add Task</span>
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
                      <div className="text-[10px] text-[var(--gs-muted)]">12am, Oct 15</div>
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
                      <div className="text-[10px] text-[var(--gs-muted)]">11am, Oct 15</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--gs-muted-light)] mb-1">Status</div>
                      <div className="text-[10px] font-medium text-[var(--gs-muted)] bg-[var(--gs-border)] px-1.5 py-0.5 rounded-[4px]">Non-urgent</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices & Payments */}
        <div className="bg-[var(--gs-surface)] rounded-[24px] border border-[var(--gs-border)] overflow-hidden flex flex-col group relative">
          <div className="p-8 pb-4 relative z-10">
            <h3 className="text-[24px] font-bold text-[var(--gs-fg)] tracking-tight mb-2">Fast, easy payments</h3>
            <p className="text-[15px] text-[var(--gs-muted)]">
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
                    <span className="text-[24px] font-bold tracking-tighter">₹4,200</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Pipeline */}
        <div className="bg-[var(--gs-surface)] rounded-[24px] border border-[var(--gs-border)] overflow-hidden flex flex-col group relative">
          <div className="p-8 pb-4 relative z-10">
            <h3 className="text-[24px] font-bold text-[var(--gs-fg)] tracking-tight mb-2">Pipeline visibility</h3>
            <p className="text-[15px] text-[var(--gs-muted)]">
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
        </div>

        {/* Team & Permissions */}
        <div className="bg-[var(--gs-surface)] rounded-[24px] border border-[var(--gs-border)] overflow-hidden flex flex-col group relative">
          <div className="p-8 pb-4 relative z-10">
            <h3 className="text-[24px] font-bold text-[var(--gs-fg)] tracking-tight mb-2">Manage your team</h3>
            <p className="text-[15px] text-[var(--gs-muted)]">
              Give your team authority to manage projects, clients, and deals with robust access control.
            </p>
          </div>
          
          <div className="flex-1 relative p-6 flex flex-col justify-end">
            <div className="bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[12px] p-4 shadow-sm mb-4">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-[var(--gs-border)] overflow-hidden flex items-center justify-center text-[10px] font-bold text-[var(--gs-fg)]">
                   DT
                 </div>
                 <div>
                   <div className="text-[13px] font-medium text-[var(--gs-fg)]">Dwayne Tatum</div>
                   <div className="text-[11px] text-[var(--gs-muted)]">Project Manager</div>
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
            
            <div className="flex items-center gap-[-8px]">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--gs-surface)] bg-[#444444] z-30"></div>
              <div className="w-8 h-8 rounded-full border-2 border-[var(--gs-surface)] bg-[#666666] -ml-3 z-20"></div>
              <div className="w-8 h-8 rounded-full border-2 border-[var(--gs-surface)] bg-[#888888] -ml-3 z-10"></div>
              <div className="w-8 h-8 rounded-full border-2 border-[var(--gs-surface)] bg-[var(--gs-border)] flex items-center justify-center -ml-3 z-0 text-[10px] font-medium text-[var(--gs-muted)]">+3</div>
            </div>
          </div>
        </div>

        {/* CTA Highlight Block */}
        <div className="bg-[#0A0A0B] border border-[var(--gs-border)] rounded-[24px] overflow-hidden flex flex-col relative group text-[var(--gs-fg)] p-8 shadow-2xl">
           <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
           
           <h3 className="text-[28px] font-bold tracking-tight mb-4 leading-tight relative z-10 text-white">
             What would you do with an extra 10 hours / week?
           </h3>
           
           <p className="text-[15px] text-white/80 leading-relaxed mb-8 relative z-10 max-w-[280px]">
             Our clients save on average 520 hours every year by using GrowSuite instead of scattered tools. Join them.
           </p>
           
           <div className="mt-auto flex flex-col sm:flex-row gap-3 relative z-10">
              <Link href="/auth/sign-up" className="flex-1 bg-white hover:bg-gray-100 text-black font-bold rounded-[8px] py-3 flex items-center justify-center gap-2 transition-colors text-[14px]">
                Sign up
                <span className="text-[16px]">»</span>
             </Link>
             <button className="flex-1 bg-black/20 hover:bg-black/30 text-white font-semibold rounded-[8px] py-3 flex items-center justify-center gap-2 transition-colors text-[14px] border border-white/20">
               <Calendar className="w-4 h-4" />
               Book Call
             </button>
           </div>
        </div>

      </div>
    </section>
  );
}
