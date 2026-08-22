"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface OutcomesDonutProps {
  data: {
    wonDeals: number;
    openDeals: number;
    totalDeals: number;
    distribution: Record<string, number>;
  };
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] p-3 shadow-xl rounded-[6px]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
          <span className="text-[12px] font-semibold text-[var(--gs-muted)]">{payload[0].name}</span>
          <span className="text-[13px] font-bold text-[var(--gs-fg)]">{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function OutcomesDonut({ data }: OutcomesDonutProps) {
  const lostDeals = data.totalDeals - data.wonDeals - data.openDeals;

  const chartData = [
    { name: "Won", value: data.wonDeals, color: "var(--gs-fg)" },
    { name: "Open", value: data.openDeals, color: "var(--gs-border-strong)" },
    { name: "Lost", value: lostDeals, color: "#EF4444" },
  ];

  if (chartData.reduce((acc, d) => acc + d.value, 0) === 0) {
    return (
      <div className="h-[240px] w-full flex flex-col items-center justify-center bg-[var(--gs-bg-alt)] rounded-[8px]">
        <span className="text-[13px] font-medium text-[var(--gs-muted)]">No deal outcomes available.</span>
      </div>
    );
  }

  const conversionRate = data.totalDeals > 0 
    ? Math.round((data.wonDeals / (data.wonDeals + lostDeals || 1)) * 100) 
    : 0;

  return (
    <div className="w-full h-[240px] relative flex flex-col items-center">
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 pointer-events-none">
        <span className="text-[11px] font-semibold text-[var(--gs-muted)] uppercase tracking-wider cursor-help" title="Won deals ÷ all closed deals">Win Rate</span>
        <span className="text-3xl font-bold text-[var(--gs-fg)] tracking-tight">{conversionRate}%</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 mt-4 pb-2">
        {chartData.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
             <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
             <span className="text-[12px] font-medium text-[var(--gs-muted)]">{d.name} <span className="text-[var(--gs-fg)] font-bold ml-1">{d.value}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}
