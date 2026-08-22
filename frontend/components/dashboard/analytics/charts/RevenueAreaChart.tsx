"use client";

import { formatCurrency } from "@/lib/currency";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface RevenueAreaChartProps {
  data: Array<{ date: string; invoiced: number; collected: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] p-3 shadow-xl rounded-[6px]">
        <p className="text-[12px] font-semibold text-[var(--gs-muted)] mb-2">{label}</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[12px] font-medium text-[var(--gs-muted)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--gs-border-strong)]" /> Invoiced
            </span>
            <span className="text-[13px] font-bold text-[var(--gs-fg)]">{formatCurrency(payload[0].value)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[12px] font-medium text-[var(--gs-muted)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--gs-fg)]" /> Collected
            </span>
            <span className="text-[13px] font-bold text-[var(--gs-fg)]">{formatCurrency(payload[1].value)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function RevenueAreaChart({ data }: RevenueAreaChartProps) {
  if (!data || data.length < 2) {
    return (
      <div className="h-[120px] w-full flex flex-col items-center justify-center bg-[var(--gs-bg-alt)] rounded-[8px]">
        <span className="text-[14px] font-semibold text-[var(--gs-fg)] mb-1">Not enough revenue history yet.</span>
        <span className="text-[13px] font-medium text-[var(--gs-muted)]">Check back once you have recorded payments.</span>
      </div>
    );
  }

  // Format dates for display
  const chartData = data.map(d => {
    const dateObj = new Date(d.date);
    let formattedDate = d.date;
    if (!isNaN(dateObj.getTime())) {
       // If it looks like a month string "YYYY-MM"
       if (d.date.length === 7) {
         formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
       } else {
         formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
       }
    }
    return { ...d, displayDate: formattedDate };
  });

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--gs-fg)" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="var(--gs-fg)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--gs-border-strong)" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="var(--gs-border-strong)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--gs-border)" opacity={0.5} />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: 'var(--gs-muted)' }} 
            dy={10}
            minTickGap={30}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: 'var(--gs-muted)' }} 
            tickFormatter={(value) => value === 0 ? '0' : formatCurrency(value).split('.')[0]} 
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--gs-border)', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area 
            type="monotone" 
            dataKey="invoiced" 
            stroke="var(--gs-border-strong)" 
            strokeDasharray="4 4"
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorInvoiced)" 
            activeDot={{ r: 4, fill: 'var(--gs-surface)', stroke: 'var(--gs-border-strong)', strokeWidth: 2 }}
          />
          <Area 
            type="monotone" 
            dataKey="collected" 
            stroke="var(--gs-fg)" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCollected)" 
            activeDot={{ r: 4, fill: 'var(--gs-surface)', stroke: 'var(--gs-fg)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
