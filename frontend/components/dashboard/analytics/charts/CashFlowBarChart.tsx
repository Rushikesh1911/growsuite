"use client";

import { formatCurrency } from "@/lib/currency";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface CashFlowBarChartProps {
  data: Array<{ date: string; invoiced: number; collected: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--gs-surface)] border border-[var(--gs-border)] p-3 shadow-xl rounded-[6px]">
        <p className="text-[12px] font-semibold text-[var(--gs-muted)] mb-2">{label}</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[12px] font-medium text-[var(--gs-muted)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-[2px] bg-[var(--gs-border)]" /> Invoiced
            </span>
            <span className="text-[13px] font-bold text-[var(--gs-fg)]">{formatCurrency(payload[0].value)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[12px] font-medium text-[var(--gs-muted)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-[2px] bg-[var(--gs-fg)]" /> Collected
            </span>
            <span className="text-[13px] font-bold text-[var(--gs-fg)]">{formatCurrency(payload[1].value)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function CashFlowBarChart({ data }: CashFlowBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[240px] w-full flex flex-col items-center justify-center bg-[var(--gs-bg-alt)] rounded-[8px]">
        <span className="text-[13px] font-medium text-[var(--gs-muted)]">No cash flow data available.</span>
      </div>
    );
  }

  // Format dates for display (month year)
  const chartData = data.map(d => {
    const dateObj = new Date(d.date);
    let formattedDate = d.date;
    if (!isNaN(dateObj.getTime())) {
       if (d.date.length === 7) {
         formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short' });
       } else {
         formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
       }
    }
    return { ...d, displayDate: formattedDate };
  });

  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={2} barSize={16}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--gs-border)" opacity={0.5} />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: 'var(--gs-muted)' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: 'var(--gs-muted)' }} 
            tickFormatter={(value) => value === 0 ? '0' : formatCurrency(value).split('.')[0]} 
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--gs-border)', opacity: 0.2 }} />
          <Bar dataKey="invoiced" fill="var(--gs-border)" radius={[2, 2, 0, 0]} />
          <Bar dataKey="collected" fill="var(--gs-fg)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="absolute top-0 right-0 flex items-center gap-4 text-[12px] font-medium text-[var(--gs-fg)] pt-1 pr-2">
         <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--gs-border)]" /> Invoiced</div>
         <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--gs-fg)]" /> Collected</div>
      </div>
    </div>
  );
}
