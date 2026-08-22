"use client";

import { useState } from "react";

interface PipelineFunnelProps {
  distribution: Record<string, number>;
}

export function PipelineFunnel({ distribution }: PipelineFunnelProps) {
  const [mode, setMode] = useState<'count'>('count'); // In future, support 'value' if backend provides it

  const formatStage = (stage: string) => {
    return stage.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const activeStages = [
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "PROPOSAL",
    "NEGOTIATION"
  ];
  
  const closedStages = [
    "WON",
    "LOST"
  ];

  const maxVal = Math.max(...activeStages.map(s => distribution[s] || 0), 1);

  return (
    <div className="w-full flex flex-col gap-4 min-h-[240px]">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[12px] font-semibold text-[var(--gs-muted)]">Stage breakdown</span>
        <div className="flex gap-2">
          <button className={`text-[11px] font-semibold px-2 py-0.5 rounded-[4px] ${mode === 'count' ? 'bg-[var(--gs-surface-raised)] text-[var(--gs-fg)]' : 'text-[var(--gs-muted)]'}`}>Count</button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {activeStages.map((stage) => {
          const val = distribution[stage] || 0;
          const pct = (val / maxVal) * 100;
          return (
            <div key={stage} className="flex items-center gap-4 group">
              <span className="w-24 text-[12px] font-medium text-[var(--gs-muted)] group-hover:text-[var(--gs-fg)] transition-colors">{formatStage(stage)}</span>
              <div className="flex-1 flex items-center">
                <div 
                  className={`h-5 transition-all duration-500 rounded-r-[4px] flex items-center bg-[var(--gs-border-strong)]`}
                  style={{ width: `${pct}%`, minWidth: pct > 0 ? '4px' : '0' }}
                />
              </div>
              <span className="w-8 text-[13px] font-bold text-[var(--gs-fg)] text-right">{val}</span>
            </div>
          );
        })}
        
        <div className="h-px bg-[var(--gs-border)] w-full my-1" />
        
        {closedStages.map((stage) => {
          const val = distribution[stage] || 0;
          return (
            <div key={stage} className="flex items-center gap-4 group">
              <span className="w-24 text-[12px] font-medium text-[var(--gs-muted)] group-hover:text-[var(--gs-fg)] transition-colors">{formatStage(stage)}</span>
              <div className="flex-1 flex items-center justify-end">
                <div className={`h-2 w-2 rounded-full ${stage === 'WON' ? 'bg-[var(--gs-fg)]' : 'bg-[#EF4444]'}`} />
              </div>
              <span className="w-8 text-[13px] font-bold text-[var(--gs-fg)] text-right">{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
