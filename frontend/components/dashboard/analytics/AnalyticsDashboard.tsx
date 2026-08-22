"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { formatCurrency } from "@/lib/currency";
import { ChevronDown, Check, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { RevenueAreaChart } from "./charts/RevenueAreaChart";
import { CashFlowBarChart } from "./charts/CashFlowBarChart";
import { OutcomesDonut } from "./charts/OutcomesDonut";
import { PipelineFunnel } from "./charts/PipelineFunnel";
import { DeliverySegmentedBar } from "./charts/DeliverySegmentedBar";
import { DashboardSkeleton } from "@/components/ui/skeleton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AnalyticsData {
  period: string;
  hasPreviousPeriod: boolean;
  kpis: {
    revenue: { current: number, previous: number | null };
    pipeline: { current: number, previous: number | null };
    projects: { current: number, previous: number | null };
    clients: { current: number, previous: number | null };
    taskCompletion: { current: number, done: number, total: number };
  };
  revenueSeries: Array<{ date: string, invoiced: number, collected: number }>;
  pipeline: {
    distribution: Record<string, number>;
    conversionRate: number | null;
    openDeals: number;
    wonDeals: number;
    totalDeals: number;
  };
  delivery: {
    distribution: Record<string, number>;
    overdue: number;
    total: number;
    completed: number;
    inProgress: number;
  };
  performance: {
    revenue: { current: number, previous: number | null };
    invoicesIssued: { current: number, previous: number | null };
    paymentsReceived: { current: number, previous: number | null };
    dealsWon: { current: number, previous: number | null };
    tasksCompleted: { current: number, previous: number | null };
  };
  projects: {
    distribution: Record<string, number>;
    active: number;
    total: number;
    completed: number;
  };
}

interface AnalyticsDashboardProps {
  token: string;
  workspaceId: number;
}

const PERIODS = [
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'this_quarter', label: 'This quarter' },
  { value: 'this_year', label: 'This year' },
  { value: 'all', label: 'All Time' },
];

export function AnalyticsDashboard({ token, workspaceId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const periodRef = useRef<HTMLDivElement>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/analytics/overview?period=${period}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId, period]);

  useEffect(() => {
    fetchAnalytics();
    const handleRefresh = () => fetchAnalytics();
    window.addEventListener("refreshData", handleRefresh);
    return () => window.removeEventListener("refreshData", handleRefresh);
  }, [fetchAnalytics]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calculateChange = (current: number, previous: number | null) => {
    if (previous === null || previous === 0) return null;
    const diff = current - previous;
    return (diff / previous) * 100;
  };

  const renderTrend = (change: number | null, isTable = false, current = 0, previous: number | null = null) => {
    if (change === null) {
      if (previous === 0 && current > 0) return <span className={`flex items-center text-[13px] font-medium ${isTable ? 'text-[var(--gs-fg)]' : 'text-[#10B981]'} mt-1`}>New</span>;
      return isTable ? <span className="flex items-center text-[13px] font-medium text-[var(--gs-muted)] mt-1">—</span> : null;
    }
    const isPositive = change > 0;
    const isNegative = change < 0;
    const colorClass = isPositive ? "text-[#10B981]" : isNegative ? "text-[#EF4444]" : "text-[var(--gs-muted)]";
    return (
      <div className={`flex items-center gap-1.5 text-[13px] font-medium ${colorClass} mt-1`}>
        {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : isNegative ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
        {isPositive ? "+" : ""}{change.toFixed(1)}% vs previous period
      </div>
    );
  };

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-10 animate-fade p-6 lg:p-8 xl:p-10 pb-20">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-transparent">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-[var(--gs-fg)] tracking-tight">Analytics</h1>
          <p className="text-[14px] text-[var(--gs-muted)]">Performance across revenue, sales, clients, and delivery.</p>
        </div>
        <div className="relative" ref={periodRef}>
          <button 
            onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
            className="flex items-center justify-between gap-3 bg-[var(--gs-surface)] border border-[var(--gs-border)] hover:border-[var(--gs-border-strong)] px-4 py-2 rounded-[8px] text-[14px] font-semibold text-[var(--gs-fg)] transition-all outline-none min-w-[160px] shadow-sm"
          >
            {PERIODS.find(p => p.value === period)?.label || "Select period"}
            <ChevronDown className="h-4 w-4 text-[var(--gs-muted)]" />
          </button>
          {periodDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] rounded-[8px] shadow-xl overflow-hidden z-50">
              <div className="flex flex-col p-1">
                {PERIODS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => { setPeriod(p.value); setPeriodDropdownOpen(false); }}
                    className={`flex items-center justify-between px-3 py-2.5 text-[13px] rounded-[6px] font-medium transition-colors ${
                      period === p.value ? "bg-[var(--gs-bg-alt)] text-[var(--gs-fg)]" : "text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)]"
                    }`}
                  >
                    {p.label}
                    {period === p.value && <Check className="h-4 w-4 text-[var(--gs-fg)]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {data && (
        <>
          {/* 2. KPI Metric Strip */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] rounded-[12px] shadow-sm overflow-hidden">
            <div className="flex flex-col p-6 md:p-8 md:border-r border-[var(--gs-border)] relative">
              <span className="text-[13px] font-bold text-[var(--gs-muted)] uppercase tracking-wider mb-4">Revenue</span>
              <span className="text-3xl lg:text-4xl font-bold text-[var(--gs-fg)] tracking-tight mb-1">{formatCurrency(data.kpis.revenue.current)}</span>
              <span className="text-[14px] font-medium text-[var(--gs-muted)] mb-3">{data.performance.paymentsReceived.current} payments</span>
              {renderTrend(calculateChange(data.kpis.revenue.current, data.kpis.revenue.previous), false, data.kpis.revenue.current, data.kpis.revenue.previous)}
            </div>
            
            <div className="flex flex-col p-6 md:p-8 md:border-r border-[var(--gs-border)] relative">
              <span className="text-[13px] font-bold text-[var(--gs-muted)] uppercase tracking-wider mb-4">Pipeline</span>
              <span className="text-3xl lg:text-4xl font-bold text-[var(--gs-fg)] tracking-tight mb-1">{formatCurrency(data.kpis.pipeline.current)}</span>
              <span className="text-[14px] font-medium text-[var(--gs-muted)] mb-3">{data.pipeline.openDeals} open deals</span>
              {renderTrend(calculateChange(data.kpis.pipeline.current, data.kpis.pipeline.previous), false, data.kpis.pipeline.current, data.kpis.pipeline.previous)}
            </div>

            <div className="flex flex-col p-6 md:p-8 md:border-r border-[var(--gs-border)] relative">
              <span className="text-[13px] font-bold text-[var(--gs-muted)] uppercase tracking-wider mb-4">Active Projects</span>
              <span className="text-3xl lg:text-4xl font-bold text-[var(--gs-fg)] tracking-tight mb-1">{data.kpis.projects?.current ?? 0}</span>
              <span className="text-[14px] font-medium text-[var(--gs-muted)] mb-3">Total active</span>
              {renderTrend(calculateChange(data.kpis.projects?.current ?? 0, data.kpis.projects?.previous ?? null), false, data.kpis.projects?.current ?? 0, data.kpis.projects?.previous ?? null)}
            </div>

            <div className="flex flex-col p-6 md:p-8 relative">
              <span className="text-[13px] font-bold text-[var(--gs-muted)] uppercase tracking-wider mb-4">Task completion</span>
              <span className="text-3xl lg:text-4xl font-bold text-[var(--gs-fg)] tracking-tight mb-1">{data.kpis.taskCompletion.current}%</span>
              <span className="text-[14px] font-medium text-[var(--gs-muted)] mb-3">{data.kpis.taskCompletion.done} of {data.kpis.taskCompletion.total} completed</span>
              {renderTrend(null)}
            </div>
          </div>

          {/* 3. Revenue Section */}
          <section className="flex flex-col bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] rounded-[12px] p-6 lg:p-8 shadow-sm mt-4">
            <div className="flex flex-col gap-1.5 mb-2">
              <h3 className="text-[18px] font-bold text-[var(--gs-fg)] tracking-tight">Revenue Performance</h3>
              <p className="text-[14px] text-[var(--gs-muted)]">Invoiced and collected revenue over time.</p>
            </div>
            <RevenueAreaChart data={data.revenueSeries} />
          </section>

          {/* 4. Secondary Analytics Grid - Sales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
            
            {/* Pipeline Funnel */}
            <section className="flex flex-col gap-8 bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] shadow-sm rounded-[12px] p-6 lg:p-8">
              <h3 className="text-[16px] font-bold text-[var(--gs-fg)] tracking-tight">Sales Pipeline</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <span className="text-[13px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Pipeline value</span>
                  <span className="text-2xl font-bold text-[var(--gs-fg)]">{formatCurrency(data.pipeline.openDeals > 0 ? data.kpis.pipeline.current : 0)}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[13px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Open deals</span>
                  <span className="text-2xl font-bold text-[var(--gs-fg)]">{data.pipeline.openDeals}</span>
                </div>
              </div>
              <div className="h-px bg-[var(--gs-border)] w-full" />
              <PipelineFunnel distribution={data.pipeline.distribution} />
            </section>

            {/* Deal Outcomes Donut */}
            <section className="flex flex-col gap-8 bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] shadow-sm rounded-[12px] p-6 lg:p-8">
              <h3 className="text-[16px] font-bold text-[var(--gs-fg)] tracking-tight">Deal Outcomes</h3>
              <OutcomesDonut data={data.pipeline} />
            </section>
          </div>

          {/* 5. Secondary Analytics Grid - Operations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
            
            {/* Cash Flow */}
            <section className="flex flex-col gap-8 bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] shadow-sm rounded-[12px] p-6 lg:p-8">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[16px] font-bold text-[var(--gs-fg)] tracking-tight">Cash Flow</h3>
                <p className="text-[13px] text-[var(--gs-muted)]">Invoiced vs Collected.</p>
              </div>
              <CashFlowBarChart data={data.revenueSeries} />
            </section>

            {/* Work Delivery */}
            <section className="flex flex-col gap-8 bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] shadow-sm rounded-[12px] p-6 lg:p-8">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[16px] font-bold text-[var(--gs-fg)] tracking-tight">Work Delivery</h3>
                <p className="text-[13px] text-[var(--gs-muted)]">Task distribution and execution.</p>
              </div>
              <DeliverySegmentedBar distribution={data.delivery.distribution} completionRate={data.kpis.taskCompletion.current} overdue={data.delivery.overdue} />
            </section>

          </div>

          {/* 6. Period Comparison Table */}
          <section className="flex flex-col mt-4 bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] shadow-sm rounded-[12px] overflow-hidden">
            <div className="p-6 lg:p-8 border-b border-[var(--gs-border)]">
              <h3 className="text-[16px] font-bold text-[var(--gs-fg)] tracking-tight">Period Comparison</h3>
              <p className="text-[14px] text-[var(--gs-muted)] mt-1">Changes vs previous period.</p>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--gs-bg-alt)] border-b border-[var(--gs-border-strong)]">
                    <th className="py-4 px-6 text-[12px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Metric</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-[var(--gs-muted)] uppercase tracking-wider text-right">Current Period</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-[var(--gs-muted)] uppercase tracking-wider text-right">Previous Period</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-[var(--gs-muted)] uppercase tracking-wider text-right">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--gs-border)]">
                  <tr className="hover:bg-[var(--gs-bg-alt)] transition-colors">
                    <td className="py-3 px-6 text-[14px] font-bold text-[var(--gs-fg)]">Revenue</td>
                    <td className="py-3 px-6 text-[14px] font-medium text-[var(--gs-fg)] text-right">{formatCurrency(data.performance.revenue.current)}</td>
                    <td className="py-3 px-6 text-[14px] font-medium text-[var(--gs-muted)] text-right">{data.hasPreviousPeriod && data.performance.revenue.previous !== null ? formatCurrency(data.performance.revenue.previous) : '—'}</td>
                    <td className="py-3 px-6 flex justify-end">{renderTrend(calculateChange(data.performance.revenue.current, data.performance.revenue.previous), true, data.performance.revenue.current, data.performance.revenue.previous)}</td>
                  </tr>
                  <tr className="hover:bg-[var(--gs-bg-alt)] transition-colors">
                    <td className="py-3 px-6 text-[14px] font-bold text-[var(--gs-fg)]">Invoices issued</td>
                    <td className="py-3 px-6 text-[14px] font-medium text-[var(--gs-fg)] text-right">{data.performance.invoicesIssued.current}</td>
                    <td className="py-3 px-6 text-[14px] font-medium text-[var(--gs-muted)] text-right">{data.hasPreviousPeriod ? data.performance.invoicesIssued.previous : '—'}</td>
                    <td className="py-3 px-6 flex justify-end">{renderTrend(calculateChange(data.performance.invoicesIssued.current, data.performance.invoicesIssued.previous), true, data.performance.invoicesIssued.current, data.performance.invoicesIssued.previous)}</td>
                  </tr>
                  <tr className="hover:bg-[var(--gs-bg-alt)] transition-colors">
                    <td className="py-3 px-6 text-[14px] font-bold text-[var(--gs-fg)]">Payments received</td>
                    <td className="py-3 px-6 text-[14px] font-medium text-[var(--gs-fg)] text-right">{data.performance.paymentsReceived.current}</td>
                    <td className="py-3 px-6 text-[14px] font-medium text-[var(--gs-muted)] text-right">{data.hasPreviousPeriod ? data.performance.paymentsReceived.previous : '—'}</td>
                    <td className="py-3 px-6 flex justify-end">{renderTrend(calculateChange(data.performance.paymentsReceived.current, data.performance.paymentsReceived.previous), true, data.performance.paymentsReceived.current, data.performance.paymentsReceived.previous)}</td>
                  </tr>
                  <tr className="hover:bg-[var(--gs-bg-alt)] transition-colors">
                    <td className="py-3 px-6 text-[14px] font-bold text-[var(--gs-fg)]">Deals won</td>
                    <td className="py-3 px-6 text-[14px] font-medium text-[var(--gs-fg)] text-right">{data.performance.dealsWon.current}</td>
                    <td className="py-3 px-6 text-[14px] font-medium text-[var(--gs-muted)] text-right">{data.hasPreviousPeriod ? data.performance.dealsWon.previous : '—'}</td>
                    <td className="py-3 px-6 flex justify-end">{renderTrend(calculateChange(data.performance.dealsWon.current, data.performance.dealsWon.previous), true, data.performance.dealsWon.current, data.performance.dealsWon.previous)}</td>
                  </tr>
                  <tr className="hover:bg-[var(--gs-bg-alt)] transition-colors">
                    <td className="py-3 px-6 text-[14px] font-bold text-[var(--gs-fg)]">Tasks completed</td>
                    <td className="py-3 px-6 text-[14px] font-medium text-[var(--gs-fg)] text-right">{data.performance.tasksCompleted.current}</td>
                    <td className="py-3 px-6 text-[14px] font-medium text-[var(--gs-muted)] text-right">{data.hasPreviousPeriod ? data.performance.tasksCompleted.previous : '—'}</td>
                    <td className="py-3 px-6 flex justify-end">{renderTrend(calculateChange(data.performance.tasksCompleted.current, data.performance.tasksCompleted.previous), true, data.performance.tasksCompleted.current, data.performance.tasksCompleted.previous)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
