"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Plus, Target, CheckSquare, Users, CreditCard, ChevronRight, Activity, ArrowRight, CircleDollarSign, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/currency";

interface OverviewProps {
  token: string;
  workspaceId: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function Overview({ token, workspaceId }: OverviewProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setCreateMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "x-workspace-id": workspaceId.toString(),
      };

      const [userRes, analyticsRes, tasksRes, invoicesRes, paymentsRes, activityRes] = await Promise.all([
        fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/analytics/overview?period=30d`, { headers }),
        fetch(`${API_URL}/api/tasks`, { headers }),
        fetch(`${API_URL}/api/invoices`, { headers }),
        fetch(`${API_URL}/api/payments`, { headers }),
        fetch(`${API_URL}/api/activity?limit=5`, { headers }),
      ]);

      if (userRes.ok) setUser(await userRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (invoicesRes.ok) setInvoices(await invoicesRes.json());
      if (paymentsRes.ok) setPayments(await paymentsRes.json());
      if (activityRes.ok) setActivity(await activityRes.json());

    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId]);

  useEffect(() => {
    fetchDashboardData();
    const handleRefresh = () => fetchDashboardData();
    window.addEventListener("refreshData", handleRefresh);
    return () => window.removeEventListener("refreshData", handleRefresh);
  }, [fetchDashboardData]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const firstName = user?.name ? user.name.split(" ")[0] : "there";

  if (loading || !analytics) {
    return <DashboardSkeleton />;
  }

  // --- Process Data ---
  const pendingTasks = tasks.filter(t => t.status !== 'DONE')
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);
    
  const outstandingAmount = invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE')
    .reduce((sum, i) => sum + Number(i.total), 0);
  
  const overdueAmount = invoices.filter(i => i.status === 'OVERDUE')
    .reduce((sum, i) => sum + Number(i.total), 0);
    
  const recentPayments = payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

  const getIconForAction = (action: string) => {
    if (action.includes("LEAD")) return <Target className="h-3.5 w-3.5 text-[#007CF0]" />;
    if (action.includes("DEAL")) return <CircleDollarSign className="h-3.5 w-3.5 text-[#10B981]" />;
    if (action.includes("CLIENT")) return <Users className="h-3.5 w-3.5 text-[var(--gs-fg)]" />;
    if (action.includes("TASK")) return <CheckSquare className="h-3.5 w-3.5 text-[var(--gs-fg)]" />;
    if (action.includes("INVOICE")) return <CreditCard className="h-3.5 w-3.5 text-[#FF0080]" />;
    return <Activity className="h-3.5 w-3.5 text-[var(--gs-fg)]" />;
  };

  const getSmartDescription = (log: any) => {
    const desc = log.description || log.title;
    const match = desc.match(/changed from (.*) to (.*)/i) || desc.match(/updated from (.*) to (.*)/i);
    let transition = "";
    if (match) {
       const from = match[1].replace(/_/g, ' ');
       const to = match[2].replace(/_/g, ' ');
       transition = `${from.charAt(0).toUpperCase() + from.slice(1).toLowerCase()} → ${to.charAt(0).toUpperCase() + to.slice(1).toLowerCase()}`;
    }

    let context = "";
    if (log.lead) context = log.lead.contactName || log.lead.company;
    else if (log.client) context = log.client.name;
    else if (log.project) context = log.project.name;
    else if (log.task) context = log.task.title;
    else if (log.invoice) context = `INV-${log.invoice.invoiceNumber}`;

    if (log.action === 'LEAD_CONVERTED' && log.lead) return `${context} → Deal`;
    if (log.action === 'DEAL_CREATED_FROM_LEAD' && log.lead) return `Generated from lead · ${context}`;
    
    if (transition) {
       if (context) return `${context} · ${transition}`;
       return transition;
    }
    
    const generic = desc.toLowerCase() === log.title.toLowerCase() || desc.toLowerCase() === log.action.replace(/_/g, ' ').toLowerCase();
    if (generic) return context;
    if (context && !desc.includes(context)) return `${context} · ${desc}`;
    return desc;
  };
  
  const activeStages = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION"];
  const maxPipelineVal = Math.max(...activeStages.map(s => analytics.pipeline.distribution[s] || 0), 1);

  // Common styles
  const panelClass = "bg-[var(--gs-surface)] border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)] shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[16px] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-[1px]";
  const panelHeaderClass = "flex items-center justify-between p-5 border-b border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.04)]";
  const panelTitleClass = "text-[15px] font-medium text-[var(--gs-fg)] tracking-tight";
  const viewAllClass = "text-[12px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] flex items-center gap-1 transition-colors group";
  const kpiValueClass = "text-[28px] md:text-[32px] tracking-tight font-medium text-[var(--gs-fg)] leading-none";

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto select-none animate-fade pb-16">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-2">
        <div className="flex flex-col">
          <h1 className="text-[28px] font-medium text-[var(--gs-fg)] tracking-tight">{greeting}, {firstName}</h1>
          <p className="text-[14px] text-[var(--gs-muted)] mt-1">Here's your business at a glance.</p>
        </div>
        <div className="relative" ref={createMenuRef}>
          <button
            onClick={() => setCreateMenuOpen(!createMenuOpen)}
            className="flex items-center justify-center gap-2 h-10 px-5 bg-[var(--gs-fg)] hover:opacity-90 text-[var(--gs-bg)] font-medium text-[13px] rounded-[10px] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] outline-none"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
          
          {createMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-[var(--gs-surface)] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-[0_16px_48px_rgba(0,0,0,0.12)] rounded-[12px] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-1.5 text-[11px] font-medium text-[var(--gs-muted)] uppercase tracking-widest">Quick Actions</div>
              <button onClick={() => { router.push("/dashboard/leads?create=true"); setCreateMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-left text-[13px] text-[var(--gs-fg)] hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                <Target className="h-4 w-4 text-[var(--gs-muted)]" /> New Lead
              </button>
              <button onClick={() => { router.push("/dashboard/pipeline?create=true"); setCreateMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-left text-[13px] text-[var(--gs-fg)] hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                <CircleDollarSign className="h-4 w-4 text-[var(--gs-muted)]" /> New Deal
              </button>
              <button onClick={() => { router.push("/dashboard/tasks?create=true"); setCreateMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-left text-[13px] text-[var(--gs-fg)] hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                <CheckSquare className="h-4 w-4 text-[var(--gs-muted)]" /> New Task
              </button>
              <button onClick={() => { router.push("/dashboard/clients?create=true"); setCreateMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-left text-[13px] text-[var(--gs-fg)] hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                <Users className="h-4 w-4 text-[var(--gs-muted)]" /> New Client
              </button>
              <button onClick={() => { router.push("/dashboard/projects?create=true"); setCreateMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-left text-[13px] text-[var(--gs-fg)] hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                <Briefcase className="h-4 w-4 text-[var(--gs-muted)]" /> New Project
              </button>
              <button onClick={() => { router.push("/dashboard/invoices?create=true"); setCreateMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-left text-[13px] text-[var(--gs-fg)] hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                <CreditCard className="h-4 w-4 text-[var(--gs-muted)]" /> New Invoice
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Bento KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={panelClass + " p-6"}>
          <div className="flex items-center gap-2 mb-4">
             <div className="p-2 bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px]">
               <Activity className="h-4 w-4 text-[var(--gs-fg)]" />
             </div>
             <span className="text-[13px] text-[var(--gs-muted)] font-medium tracking-tight">Revenue (30d)</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className={kpiValueClass}>{formatCurrency(analytics.kpis.revenue.current)}</span>
            <span className="text-[13px] text-[var(--gs-muted)] mt-1">Collected this period</span>
          </div>
        </div>
        <div className={panelClass + " p-6"}>
          <div className="flex items-center gap-2 mb-4">
             <div className="p-2 bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px]">
               <CircleDollarSign className="h-4 w-4 text-[var(--gs-fg)]" />
             </div>
             <span className="text-[13px] text-[var(--gs-muted)] font-medium tracking-tight">Pipeline Value</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className={kpiValueClass}>{formatCurrency(analytics.kpis.pipeline.current)}</span>
            <span className="text-[13px] text-[var(--gs-muted)] mt-1">Across {analytics.pipeline.openDeals} open deals</span>
          </div>
        </div>
        <div className={panelClass + " p-6"}>
          <div className="flex items-center gap-2 mb-4">
             <div className="p-2 bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px]">
               <Briefcase className="h-4 w-4 text-[var(--gs-fg)]" />
             </div>
             <span className="text-[13px] text-[var(--gs-muted)] font-medium tracking-tight">Active Projects</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className={kpiValueClass}>{analytics.kpis.projects?.current ?? 0}</span>
            <span className="text-[13px] text-[var(--gs-muted)] mt-1">Currently engaged</span>
          </div>
        </div>
        <div className={panelClass + " p-6"}>
          <div className="flex items-center gap-2 mb-4">
             <div className="p-2 bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px]">
               <CheckSquare className="h-4 w-4 text-[var(--gs-fg)]" />
             </div>
             <span className="text-[13px] text-[var(--gs-muted)] font-medium tracking-tight">Tasks</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className={kpiValueClass}>{analytics.kpis.taskCompletion.total - analytics.kpis.taskCompletion.done}</span>
            <span className="text-[13px] text-[var(--gs-muted)] mt-1">Pending tasks</span>
          </div>
        </div>
      </div>

      {/* Row 2: Your Work & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Your Work */}
        <div className={panelClass}>
          <div className={panelHeaderClass}>
            <h3 className={panelTitleClass}>Your Work</h3>
            <button onClick={() => router.push("/dashboard/tasks")} className={viewAllClass}>
              View all <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="flex flex-col p-1">
            {pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center gap-2 mt-4 mb-4">
                <span className="text-[14px] font-medium text-[var(--gs-fg)] tracking-tight">✓ You're all caught up</span>
                <span className="text-[13px] text-[var(--gs-muted)]">No pending tasks right now.</span>
              </div>
            ) : (
              pendingTasks.map((t) => (
                <div key={t.id} className="flex items-start justify-between gap-4 p-4 hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] border-b border-[rgba(0,0,0,0.03)] dark:border-[rgba(255,255,255,0.03)] last:border-0 transition-colors group cursor-pointer" onClick={() => router.push("/dashboard/tasks")}>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-medium text-[var(--gs-fg)] truncate group-hover:text-black dark:group-hover:text-white transition-colors">{t.title}</span>
                    <span className="text-[13px] text-[var(--gs-muted)] truncate mt-1">{t.project?.name || t.client?.name || "General"}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-1.5">
                    <StatusBadge 
                      label={t.status.replace("_", " ")} 
                      status={
                        t.status === 'DONE' ? 'positive' :
                        t.status === 'IN_PROGRESS' ? 'pending' :
                        t.status === 'REVIEW' ? 'info' : 'neutral'
                      } 
                    />
                    {t.dueDate && (
                      <span className={`text-[11px] font-medium ${new Date(t.dueDate) < new Date() ? "text-[#EF4444]" : "text-[var(--gs-muted)]"}`}>
                        {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pipeline Overview */}
        <div className={panelClass}>
          <div className={panelHeaderClass}>
            <h3 className={panelTitleClass}>Pipeline Distribution</h3>
            <button onClick={() => router.push("/dashboard/pipeline")} className={viewAllClass}>
              View pipeline <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="p-6 flex flex-col justify-center h-full gap-8">
            
            <div className="flex flex-col gap-4">
              {analytics.pipeline.openDeals === 0 ? (
                <div className="flex flex-col gap-2 mt-4 mb-4 items-center text-center">
                  <span className="text-[14px] font-medium text-[var(--gs-fg)]">No active deals</span>
                  <span className="text-[13px] text-[var(--gs-muted)]">Add a lead or create a deal to start building your pipeline.</span>
                </div>
              ) : (
                <>
                  <div className="flex w-full h-8 rounded-[8px] overflow-hidden gap-1">
                    {activeStages.map((stage, idx) => {
                      const val = analytics.pipeline.distribution[stage] || 0;
                      const flexBasis = val === 0 ? '0%' : `${(val / maxPipelineVal) * 100}%`;
                      if (val === 0) return null;
                      
                      // Gradual opacities to simulate a funnel
                      const opacity = 1 - (idx * 0.15);
                      
                      return (
                        <div 
                          key={stage} 
                          className="h-full bg-[var(--gs-fg)] min-w-[6px] transition-all hover:opacity-100 cursor-pointer" 
                          style={{ width: flexBasis, opacity }} 
                          title={`${stage}: ${val}`} 
                          onClick={() => router.push("/dashboard/pipeline")}
                        />
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {activeStages.map((stage, idx) => {
                       const val = analytics.pipeline.distribution[stage] || 0;
                       if (val === 0) return null;
                       const opacity = 1 - (idx * 0.15);
                       return (
                         <div key={stage} className="flex items-center gap-2">
                           <div className="w-2.5 h-2.5 rounded-full bg-[var(--gs-fg)]" style={{ opacity }} />
                           <span className="text-[12px] text-[var(--gs-muted)] uppercase tracking-wider">{stage.replace('_',' ')}</span>
                           <span className="text-[12px] font-medium text-[var(--gs-fg)]">{val}</span>
                         </div>
                       )
                    })}
                  </div>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.04)]">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-[var(--gs-muted)] font-medium tracking-tight">Total Pipeline Value</span>
                <span className="text-[24px] font-medium text-[var(--gs-fg)] tracking-tight">{formatCurrency(analytics.kpis.pipeline.current)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-[var(--gs-muted)] font-medium tracking-tight">Open Deals</span>
                <span className="text-[24px] font-medium text-[var(--gs-fg)] tracking-tight">{analytics.pipeline.openDeals}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Row 3: Financials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Revenue Snapshot */}
        <div className={panelClass}>
          <div className={panelHeaderClass}>
            <h3 className={panelTitleClass}>Revenue Trend</h3>
            <button onClick={() => router.push("/dashboard/analytics")} className={viewAllClass}>
              View reports <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="p-6 flex flex-col gap-6">
             <div className="flex items-baseline gap-3">
               <span className={kpiValueClass}>{formatCurrency(analytics.kpis.revenue.current)}</span>
               {analytics.kpis.revenue.previous > 0 && (
                 <span className={`text-[13px] font-medium px-2 py-1 rounded-[6px] ${analytics.kpis.revenue.current >= analytics.kpis.revenue.previous ? "bg-[#F0FDF4] text-[#16A34A] dark:bg-[rgba(22,163,74,0.1)]" : "bg-[#FEF2F2] text-[#EF4444] dark:bg-[rgba(239,68,68,0.1)]"}`}>
                   {analytics.kpis.revenue.current >= analytics.kpis.revenue.previous ? "+ " : ""}
                   {Math.round(((analytics.kpis.revenue.current - analytics.kpis.revenue.previous) / analytics.kpis.revenue.previous) * 100)}%
                 </span>
               )}
             </div>
             <div className="h-[160px] w-full mt-2">
               {analytics.revenueSeries && analytics.revenueSeries.length >= 2 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={analytics.revenueSeries} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                     <defs>
                       <linearGradient id="snapRev" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="var(--gs-fg)" stopOpacity={0.15} />
                         <stop offset="95%" stopColor="var(--gs-fg)" stopOpacity={0} />
                       </linearGradient>
                     </defs>
                     <Area type="monotone" dataKey="collected" stroke="var(--gs-fg)" strokeWidth={2.5} fillOpacity={1} fill="url(#snapRev)" />
                   </AreaChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="w-full h-full flex items-center justify-center border border-dashed border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[12px]">
                   <span className="text-[13px] text-[var(--gs-muted)]">Not enough data yet</span>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={panelClass}>
          <div className={panelHeaderClass}>
            <h3 className={panelTitleClass}>Activity Log</h3>
            <button onClick={() => router.push("/dashboard/activity")} className={viewAllClass}>
              View log <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="flex flex-col p-1">
            {activity.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-[var(--gs-muted)]">No recent activity.</div>
            ) : (
              activity.map((log, idx) => {
                const description = getSmartDescription(log);
                return (
                  <div key={log.id} className="flex items-start gap-4 p-4 border-b border-[rgba(0,0,0,0.03)] dark:border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-[rgba(0,0,0,0.015)] dark:hover:bg-[rgba(255,255,255,0.015)] transition-colors">
                    <div className="shrink-0 w-8 h-8 rounded-[8px] bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.03)] flex items-center justify-center mt-0.5">
                      {getIconForAction(log.action)}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[14px] font-medium text-[var(--gs-fg)] leading-snug tracking-tight">{log.action.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase())}</span>
                      <span className="text-[13px] text-[var(--gs-muted)] mt-0.5 truncate">{description}</span>
                    </div>
                    <span className="ml-auto text-[12px] text-[var(--gs-muted)] shrink-0 pt-1 tracking-tight">
                      {new Date(log.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
