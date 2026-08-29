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
  
  // Tasks (Upcoming / Urgent)
  const pendingTasks = tasks.filter(t => t.status !== 'DONE')
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);
    
  // Invoices computation
  const outstandingAmount = invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE')
    .reduce((sum, i) => sum + Number(i.total), 0);
  
  const overdueAmount = invoices.filter(i => i.status === 'OVERDUE')
    .reduce((sum, i) => sum + Number(i.total), 0);
    
  const recentPayments = payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

  // Activity semantics
  const getIconForAction = (action: string) => {
    if (action.includes("LEAD")) return <Target className="h-3.5 w-3.5 text-[#007CF0]" />;
    if (action.includes("DEAL")) return <CircleDollarSign className="h-3.5 w-3.5 text-[#10B981]" />;
    if (action.includes("CLIENT")) return <Users className="h-3.5 w-3.5 text-[var(--gs-muted)]" />;
    if (action.includes("TASK")) return <CheckSquare className="h-3.5 w-3.5 text-[var(--gs-muted)]" />;
    if (action.includes("INVOICE")) return <CreditCard className="h-3.5 w-3.5 text-[#FF0080]" />;
    return <Activity className="h-3.5 w-3.5 text-[var(--gs-muted)]" />;
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

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1100px] mx-auto select-none animate-fade pb-16">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-[var(--gs-fg)] tracking-tight">{greeting}, {firstName}</h1>
          <p className="text-[14px] text-[var(--gs-muted)] mt-1">Here's what's happening with your business today.</p>
        </div>
        <div className="relative" ref={createMenuRef}>
          <button
            onClick={() => setCreateMenuOpen(!createMenuOpen)}
            className="flex items-center justify-center gap-2 h-9 px-4 bg-[var(--gs-fg)] hover:opacity-90 text-[var(--gs-bg)] font-semibold text-[13px] rounded-[6px] transition-opacity outline-none"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
          
          {createMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--gs-surface)] border border-[var(--gs-border)] shadow-xl rounded-[8px] py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Global Quick Action</div>
              <button onClick={() => { router.push("/dashboard/leads?create=true"); setCreateMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[13px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors">
                <Target className="h-3.5 w-3.5 text-[var(--gs-muted)]" /> New Lead
              </button>
              <button onClick={() => { router.push("/dashboard/pipeline?create=true"); setCreateMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[13px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors">
                <CircleDollarSign className="h-3.5 w-3.5 text-[var(--gs-muted)]" /> New Deal
              </button>
              <button onClick={() => { router.push("/dashboard/tasks?create=true"); setCreateMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[13px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors">
                <CheckSquare className="h-3.5 w-3.5 text-[var(--gs-muted)]" /> New Task
              </button>
              <button onClick={() => { router.push("/dashboard/clients?create=true"); setCreateMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[13px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors">
                <Users className="h-3.5 w-3.5 text-[var(--gs-muted)]" /> New Client
              </button>
              <button onClick={() => { router.push("/dashboard/projects?create=true"); setCreateMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[13px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors">
                <Briefcase className="h-3.5 w-3.5 text-[var(--gs-muted)]" /> New Project
              </button>
              <button onClick={() => { router.push("/dashboard/invoices?create=true"); setCreateMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[13px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors">
                <CreditCard className="h-3.5 w-3.5 text-[var(--gs-muted)]" /> New Invoice
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Compact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 flex flex-col justify-between bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[10px] shadow-sm">
          <span className="text-[11px] text-[var(--gs-muted)] font-bold uppercase tracking-wider">Revenue (30d)</span>
          <div className="flex flex-col gap-1 mt-3">
            <span className="text-2xl font-bold tracking-tight text-[var(--gs-fg)]">{formatCurrency(analytics.kpis.revenue.current)}</span>
            <span className="text-[12px] text-[var(--gs-muted)] font-medium">Collected this period</span>
          </div>
        </div>
        <div className="p-5 flex flex-col justify-between bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[10px] shadow-sm">
          <span className="text-[11px] text-[var(--gs-muted)] font-bold uppercase tracking-wider">Pipeline</span>
          <div className="flex flex-col gap-1 mt-3">
            <span className="text-2xl font-bold tracking-tight text-[var(--gs-fg)]">{formatCurrency(analytics.kpis.pipeline.current)}</span>
            <span className="text-[12px] text-[var(--gs-muted)] font-medium">{analytics.pipeline.openDeals} open deals</span>
          </div>
        </div>
        <div className="p-5 flex flex-col justify-between bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[10px] shadow-sm">
          <span className="text-[11px] text-[var(--gs-muted)] font-bold uppercase tracking-wider">Active Projects</span>
          <div className="flex flex-col gap-1 mt-3">
            <span className="text-2xl font-bold tracking-tight text-[var(--gs-fg)]">{analytics.kpis.projects?.current ?? 0}</span>
            <span className="text-[12px] text-[var(--gs-muted)] font-medium">Currently engaged</span>
          </div>
        </div>
        <div className="p-5 flex flex-col justify-between bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[10px] shadow-sm">
          <span className="text-[11px] text-[var(--gs-muted)] font-bold uppercase tracking-wider">Tasks</span>
          <div className="flex flex-col gap-1 mt-3">
            <span className="text-2xl font-bold tracking-tight text-[var(--gs-fg)]">{analytics.kpis.taskCompletion.total - analytics.kpis.taskCompletion.done} pending</span>
            <span className="text-[12px] text-[var(--gs-muted)] font-medium">{analytics.kpis.taskCompletion.done} completed this period</span>
          </div>
        </div>
      </div>

      {/* Row 2: Your Work & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Your Work */}
        <div className="flex flex-col bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[12px] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[var(--gs-border)]">
            <h3 className="text-[15px] font-bold text-[var(--gs-fg)] tracking-tight">Your Work</h3>
            <button onClick={() => router.push("/dashboard/tasks")} className="text-[12px] font-semibold text-[var(--gs-muted)] hover:text-[var(--gs-fg)] flex items-center gap-1 transition-colors">
              View all tasks <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex flex-col p-2">
            {pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center gap-2 mt-2 mb-2">
                <span className="text-[13px] font-bold text-[var(--gs-fg)]">✓ You're all caught up</span>
                <span className="text-[12px] text-[var(--gs-muted)]">No pending tasks right now.</span>
                <button onClick={() => router.push("/dashboard/tasks")} className="text-[12px] font-semibold text-[var(--gs-fg)] flex items-center gap-1 mt-1 transition-colors hover:opacity-80">
                  Create task <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ) : (
              pendingTasks.map((t) => (
                <div key={t.id} className="flex items-start justify-between gap-4 p-3 hover:bg-[var(--gs-bg-alt)] rounded-[8px] transition-colors group cursor-pointer" onClick={() => router.push("/dashboard/tasks")}>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-semibold text-[var(--gs-fg)] truncate group-hover:text-[var(--gs-fg)]">{t.title}</span>
                    <span className="text-[12px] text-[var(--gs-muted)] truncate mt-0.5">{t.project?.name || t.client?.name || "General"}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-1">
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
        <div className="flex flex-col bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[12px] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[var(--gs-border)]">
            <h3 className="text-[15px] font-bold text-[var(--gs-fg)] tracking-tight">Pipeline</h3>
            <button onClick={() => router.push("/dashboard/pipeline")} className="text-[12px] font-semibold text-[var(--gs-muted)] hover:text-[var(--gs-fg)] flex items-center gap-1 transition-colors">
              View pipeline <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="p-5 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-medium text-[var(--gs-muted)]">Open Value</span>
                <span className="text-xl font-bold text-[var(--gs-fg)] tracking-tight">{formatCurrency(analytics.kpis.pipeline.current)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-medium text-[var(--gs-muted)]">Active Deals</span>
                <span className="text-xl font-bold text-[var(--gs-fg)] tracking-tight">{analytics.pipeline.openDeals}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Active Stages</span>
              {analytics.pipeline.openDeals === 0 ? (
                <div className="flex flex-col gap-2 mt-1 mb-1">
                  <span className="text-[13px] font-semibold text-[var(--gs-fg)]">No active deals</span>
                  <span className="text-[12px] text-[var(--gs-muted)] leading-relaxed">Add a lead or create a deal to start building your pipeline.</span>
                  <button onClick={() => router.push("/dashboard/leads")} className="text-[12px] font-semibold text-[var(--gs-fg)] flex items-center gap-1 mt-1 transition-colors hover:opacity-80 w-fit">
                    Create deal <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex w-full h-4 rounded-[4px] overflow-hidden gap-0.5">
                    {activeStages.map(stage => {
                      const val = analytics.pipeline.distribution[stage] || 0;
                      const flexBasis = val === 0 ? '0%' : `${(val / maxPipelineVal) * 100}%`;
                      if (val === 0) return null;
                      return (
                        <div key={stage} className="h-full bg-[var(--gs-border-strong)] hover:bg-[var(--gs-fg)] transition-colors min-w-[4px]" style={{ width: flexBasis }} title={`${stage}: ${val}`} />
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-[var(--gs-muted)]">New</span>
                    <span className="text-[10px] text-[var(--gs-muted)]">Negotiation</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Financials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Snapshot */}
        <div className="flex flex-col bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[12px] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[var(--gs-border)]">
            <h3 className="text-[15px] font-bold text-[var(--gs-fg)] tracking-tight">Revenue Snapshot</h3>
            <button onClick={() => router.push("/dashboard/analytics")} className="text-[12px] font-semibold text-[var(--gs-muted)] hover:text-[var(--gs-fg)] flex items-center gap-1 transition-colors">
              View analytics <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="p-5 flex flex-col gap-4">
             <div className="flex items-baseline gap-2">
               <span className="text-xl font-bold text-[var(--gs-fg)] tracking-tight">{formatCurrency(analytics.kpis.revenue.current)} <span className="text-[13px] font-medium text-[var(--gs-muted)] font-normal ml-1">collected</span></span>
               {analytics.kpis.revenue.previous > 0 && (
                 <span className={`text-[12px] font-medium ${analytics.kpis.revenue.current >= analytics.kpis.revenue.previous ? "text-[#10B981]" : "text-[var(--gs-muted)]"}`}>
                   {analytics.kpis.revenue.current >= analytics.kpis.revenue.previous ? "+" : ""}
                   {Math.round(((analytics.kpis.revenue.current - analytics.kpis.revenue.previous) / analytics.kpis.revenue.previous) * 100)}% vs prev 30d
                 </span>
               )}
             </div>
             <div className="h-[120px] w-full">
               {analytics.revenueSeries && analytics.revenueSeries.length >= 2 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={analytics.revenueSeries} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                     <defs>
                       <linearGradient id="snapRev" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="var(--gs-fg)" stopOpacity={0.2} />
                         <stop offset="95%" stopColor="var(--gs-fg)" stopOpacity={0} />
                       </linearGradient>
                     </defs>
                     <Area type="monotone" dataKey="collected" stroke="var(--gs-fg)" strokeWidth={2} fillOpacity={1} fill="url(#snapRev)" />
                   </AreaChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="w-full h-full flex items-center justify-center border border-dashed border-[var(--gs-border)] rounded-[8px]">
                   <span className="text-[12px] text-[var(--gs-muted)]">Not enough history</span>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Invoices & Payments */}
        <div className="flex flex-col bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[12px] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[var(--gs-border)]">
            <h3 className="text-[15px] font-bold text-[var(--gs-fg)] tracking-tight">Invoices & Payments</h3>
            <button onClick={() => router.push("/dashboard/invoices")} className="text-[12px] font-semibold text-[var(--gs-muted)] hover:text-[var(--gs-fg)] flex items-center gap-1 transition-colors">
              Manage billing <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex flex-col p-5 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-medium text-[var(--gs-muted)]">Outstanding</span>
                <span className="text-lg font-bold text-[var(--gs-fg)] tracking-tight">{formatCurrency(outstandingAmount)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={`text-[12px] font-medium ${overdueAmount > 0 ? "text-[#EF4444]" : "text-[var(--gs-muted)]"}`}>Overdue</span>
                <span className={`text-lg font-bold tracking-tight ${overdueAmount > 0 ? "text-[#EF4444]" : "text-[var(--gs-fg)]"}`}>{formatCurrency(overdueAmount)}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Recent Payments</span>
              {recentPayments.length === 0 ? (
                <span className="text-[12px] text-[var(--gs-muted)] mt-1">No recent payments.</span>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentPayments.map(p => (
                    <div key={p.id} className="flex justify-between items-center py-1.5 border-b border-[var(--gs-border)] last:border-0">
                       <span className="text-[13px] font-medium text-[var(--gs-fg)]">{p.client?.name || p.invoice?.invoiceNumber || "Payment"}</span>
                       <span className="text-[13px] font-bold text-[var(--gs-fg)]">{formatCurrency(Number(p.amount))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Row 4: Recent Activity */}
      <div className="flex flex-col bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[12px] shadow-sm overflow-hidden mt-2">
        <div className="flex items-center justify-between p-5 border-b border-[var(--gs-border)]">
          <h3 className="text-[15px] font-bold text-[var(--gs-fg)] tracking-tight">Recent Activity</h3>
          <button onClick={() => router.push("/dashboard/activity")} className="text-[12px] font-semibold text-[var(--gs-muted)] hover:text-[var(--gs-fg)] flex items-center gap-1 transition-colors">
            View all activity <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="flex flex-col p-2">
          {activity.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-[var(--gs-muted)]">No recent activity.</div>
          ) : (
            activity.map((log) => {
              const description = getSmartDescription(log);
              return (
                <div key={log.id} className="flex items-start gap-4 p-3 hover:bg-[var(--gs-bg-alt)] rounded-[8px] transition-colors">
                  <div className="shrink-0 w-8 h-8 rounded-full border border-[var(--gs-border-strong)] bg-[var(--gs-bg)] flex items-center justify-center mt-0.5">
                    {getIconForAction(log.action)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-semibold text-[var(--gs-fg)] leading-snug">{log.action.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase())}</span>
                    <span className="text-[13px] text-[var(--gs-muted)] mt-0.5 truncate">{description}</span>
                  </div>
                  <span className="ml-auto text-[11px] font-medium text-[var(--gs-muted)] shrink-0 pt-1">
                    {new Date(log.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
