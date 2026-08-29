"use client";

import {
  Users, Zap, BarChart3, GitBranch
} from "lucide-react";

export function Features() {
  return (
    <section id="features" className="py-32 md:py-40 bg-white">
      <div className="max-w-6xl w-full mx-auto px-6">
        
        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-16 gap-5">
          <h2 className="text-[40px] sm:text-[56px] font-[800] tracking-[-0.04em] text-[var(--gs-bg-alt)] leading-[1.05] max-w-2xl">
            Intelligence at every stage of your pipeline.
          </h2>
          <p className="text-[18px] text-[var(--gs-muted-light)] max-w-xl leading-[1.6] font-[400] tracking-[-0.01em]">
            A complete operations platform built for speed. GrowSuite brings intelligence to your revenue journey.
          </p>
        </div>

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Contact Intelligence (Spans 2 cols) */}
          <div className="md:col-span-2 bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row gap-8 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
            <div className="flex-1 flex flex-col justify-end z-10">
              <div className="h-10 w-10 rounded-[10px] bg-[var(--gs-surface)] border border-[var(--gs-border)] shadow-sm flex items-center justify-center mb-6">
                <Users className="h-5 w-5 text-[var(--gs-fg)]" strokeWidth={2.5} />
              </div>
              <h3 className="text-[24px] font-[700] tracking-tight text-[var(--gs-fg)] mb-3">Contact Intelligence</h3>
              <p className="text-[15px] text-[var(--gs-muted)] leading-[1.6]">
                Enrich every contact with activity history, communication logs, and relationship scoring — all in one clean view.
              </p>
            </div>
            
            {/* UI Mockup - Client Table snippet using real GS styles */}
            <div className="flex-1 relative min-h-[220px] bg-[var(--gs-surface)] rounded-[16px] border border-[var(--gs-border)] shadow-sm overflow-hidden transform group-hover:-translate-y-2 transition-all duration-500">
              <div className="p-3.5 border-b border-[var(--gs-border)] bg-[var(--gs-bg)] flex justify-between items-center">
                <div className="text-[12px] font-[600] text-[var(--gs-fg)]">Clients</div>
                <div className="bg-[var(--gs-surface)] border border-[var(--gs-border)] text-[var(--gs-fg)] text-[10px] px-2 py-1 rounded-[4px]">Filters</div>
              </div>
              <div className="flex flex-col">
                <div className="grid grid-cols-[1fr_80px_70px] gap-2 px-4 py-2 border-b border-[var(--gs-border)] text-[10px] font-[600] text-[var(--gs-muted-light)] uppercase tracking-wider bg-[var(--gs-surface)]">
                  <div>Name / Company</div><div>Status</div><div className="text-right">Value</div>
                </div>
                {[
                  { name: "Alice Walker", company: "Acme Corp", status: "Active", val: "₹120K", active: true },
                  { name: "John Smith", company: "Global Tech", status: "Active", val: "₹85K" },
                  { name: "Emma Davis", company: "Nexus LLC", status: "Inactive", val: "₹0" }
                ].map((c, i) => (
                  <div key={i} className={`grid grid-cols-[1fr_80px_70px] gap-2 px-4 py-2.5 items-center border-b border-[var(--gs-border)] ${c.active ? 'bg-[var(--gs-surface-raised)]' : 'bg-[var(--gs-surface)]'}`}>
                    <div className="flex flex-col">
                      <span className="font-[600] text-[11px] text-[var(--gs-fg)] truncate">{c.name}</span>
                      <span className="font-[500] text-[10px] text-[var(--gs-muted)] truncate">{c.company}</span>
                    </div>
                    <div>
                      <span className={`px-1.5 py-0.5 rounded-[4px] text-[9px] font-[600] ${c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-[var(--gs-border)] text-[var(--gs-muted)]'}`}>{c.status}</span>
                    </div>
                    <div className="font-[600] text-[11px] text-[var(--gs-muted)] font-mono text-right">{c.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Pipeline Analytics (Spans 1 col) */}
          <div className="md:col-span-1 bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[32px] p-8 md:p-10 flex flex-col justify-between overflow-hidden relative group hover:shadow-lg transition-all duration-300">
             {/* UI Mockup - Real Analytics chart */}
             <div className="relative h-[160px] w-full mb-8 transform group-hover:scale-[1.02] transition-transform duration-500 flex items-end justify-between px-2 gap-2">
                {[40, 65, 45, 80, 55, 95].map((height, i) => (
                  <div key={i} className="w-full bg-[var(--gs-border-strong)] rounded-t-[4px] relative group-hover:bg-[var(--gs-fg)] transition-colors duration-500" style={{ height: `${height}%`, transitionDelay: `${i * 50}ms` }}>
                  </div>
                ))}
             </div>
             <div className="flex flex-col z-10">
              <div className="h-10 w-10 rounded-[10px] bg-[var(--gs-surface)] border border-[var(--gs-border)] shadow-sm flex items-center justify-center mb-6">
                <BarChart3 className="h-5 w-5 text-[var(--gs-fg)]" strokeWidth={2.5} />
              </div>
              <h3 className="text-[20px] font-[700] tracking-tight text-[var(--gs-fg)] mb-2">Pipeline Analytics</h3>
              <p className="text-[14px] text-[var(--gs-muted)] leading-[1.6]">
                Real-time deal flow visualization with win-rate forecasting and revenue projections.
              </p>
            </div>
          </div>

          {/* Card 3: Workflow Automation (Spans 1 col) */}
          <div className="md:col-span-1 bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[32px] p-8 md:p-10 flex flex-col justify-between overflow-hidden relative group hover:shadow-lg transition-all duration-300">
             {/* UI Mockup */}
             <div className="relative h-[160px] w-full mb-8 transform group-hover:translate-x-2 transition-transform duration-500 flex flex-col gap-3 justify-center">
                <div className="bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px] p-2.5 shadow-sm flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center"><Zap className="w-3 h-3 text-amber-600 dark:text-amber-400"/></div>
                  <span className="text-[12px] font-[600] text-[var(--gs-fg)]">When deal is closed</span>
                </div>
                <div className="w-px h-4 bg-[var(--gs-border-strong)] ml-6"/>
                <div className="bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px] p-2.5 shadow-sm flex items-center gap-3">
                  <div className="w-6 h-6 rounded-[6px] bg-indigo-500/10 flex items-center justify-center"><svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4 12 14.01l-3-3"/></svg></div>
                  <span className="text-[12px] font-[600] text-[var(--gs-fg)]">Send welcome email</span>
                </div>
             </div>
             <div className="flex flex-col z-10">
              <div className="h-10 w-10 rounded-[10px] bg-[var(--gs-surface)] border border-[var(--gs-border)] shadow-sm flex items-center justify-center mb-6">
                <Zap className="h-5 w-5 text-[var(--gs-fg)]" strokeWidth={2.5} />
              </div>
              <h3 className="text-[20px] font-[700] tracking-tight text-[var(--gs-fg)] mb-2">Workflow Automation</h3>
              <p className="text-[14px] text-[var(--gs-muted)] leading-[1.6]">
                Trigger automated sequences across email, tasks, and notifications instantly.
              </p>
            </div>
          </div>

          {/* Card 4: Multi-pipeline CRM (Spans 2 cols) */}
          <div className="md:col-span-2 bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row-reverse gap-8 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
            <div className="flex-1 flex flex-col justify-end z-10">
              <div className="h-10 w-10 rounded-[10px] bg-[var(--gs-surface)] border border-[var(--gs-border)] shadow-sm flex items-center justify-center mb-6">
                <GitBranch className="h-5 w-5 text-[var(--gs-fg)]" strokeWidth={2.5} />
              </div>
              <h3 className="text-[24px] font-[700] tracking-tight text-[var(--gs-fg)] mb-3">Multi-pipeline CRM</h3>
              <p className="text-[15px] text-[var(--gs-muted)] leading-[1.6]">
                Manage multiple sales motions simultaneously. Customizable stages and drag-and-drop Kanban boards built for high-velocity teams.
              </p>
            </div>
            {/* UI Mockup - Mini Kanban */}
            <div className="flex-1 relative min-h-[220px] bg-[var(--gs-surface)] rounded-[16px] border border-[var(--gs-border)] shadow-sm p-4 overflow-hidden transform group-hover:scale-[1.02] transition-all duration-500 flex gap-4">
               
              <div className="flex-1 flex flex-col gap-2.5">
                 <h3 className="text-[10px] font-[600] text-[var(--gs-muted)] uppercase tracking-wider mb-1">Qualified</h3>
                 <div className="p-2.5 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] shadow-sm flex flex-col gap-1.5">
                   <h4 className="text-[11px] font-bold text-[var(--gs-fg)] tracking-tight">Enterprise Expansion</h4>
                   <p className="text-[9px] text-[var(--gs-muted)] font-medium">Acme Corp</p>
                 </div>
                 <div className="p-2.5 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] shadow-sm flex flex-col gap-1.5 mt-1">
                   <h4 className="text-[11px] font-bold text-[var(--gs-fg)] tracking-tight">Q4 Software License</h4>
                   <p className="text-[9px] text-[var(--gs-muted)] font-medium">TechFlow Inc.</p>
                 </div>
              </div>
              
              <div className="flex-1 flex flex-col gap-2.5 opacity-60">
                 <h3 className="text-[10px] font-[600] text-[var(--gs-muted)] uppercase tracking-wider mb-1">Proposal</h3>
                 <div className="p-2.5 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] shadow-sm flex flex-col gap-1.5">
                   <h4 className="text-[11px] font-bold text-[var(--gs-fg)] tracking-tight">Global Rollout</h4>
                   <p className="text-[9px] text-[var(--gs-muted)] font-medium">Stripe</p>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
