"use client";

interface DeliverySegmentedBarProps {
  distribution: Record<string, number>;
  completionRate: number;
  overdue: number;
}

export function DeliverySegmentedBar({ distribution, completionRate, overdue }: DeliverySegmentedBarProps) {
  const formatStage = (stage: string) => {
    return stage.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const stages = [
    { key: "TODO", color: "bg-[var(--gs-border-strong)]" },
    { key: "IN_PROGRESS", color: "bg-[var(--gs-muted)]" },
    { key: "REVIEW", color: "bg-[var(--gs-fg-secondary)]" },
    { key: "DONE", color: "bg-[var(--gs-fg)]" },
  ];

  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <div className="h-[240px] w-full flex flex-col items-center justify-center bg-[var(--gs-bg-alt)] rounded-[8px]">
        <span className="text-[13px] font-medium text-[var(--gs-muted)]">No tasks available.</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-[240px]">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[13px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Task completion</span>
        <span className="text-[16px] font-bold text-[var(--gs-fg)]">{completionRate}%</span>
      </div>

      <div className="w-full h-3 flex gap-0.5 rounded-full overflow-hidden bg-[var(--gs-bg-alt)] mb-8">
        {stages.map((stage) => {
          const val = distribution[stage.key] || 0;
          const pct = (val / total) * 100;
          if (pct === 0) return null;
          return (
            <div 
              key={stage.key}
              className={`h-full ${stage.color} transition-all duration-500`}
              style={{ width: `${pct}%` }}
              title={`${formatStage(stage.key)}: ${val}`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stages.map((stage) => {
          const val = distribution[stage.key] || 0;
          return (
            <div key={stage.key} className="flex justify-between items-center py-2 border-b border-[var(--gs-border)] last:border-0">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                <span className="text-[13px] font-medium text-[var(--gs-muted)]">{formatStage(stage.key)}</span>
              </div>
              <span className="text-[14px] font-bold text-[var(--gs-fg)]">{val}</span>
            </div>
          );
        })}
        {overdue > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-[var(--gs-border)] last:border-0 col-span-2 mt-1 bg-[#EF4444]/10 rounded-[6px] px-3">
             <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
               <span className="text-[13px] font-semibold text-[#EF4444]">Overdue</span>
             </div>
             <span className="text-[14px] font-bold text-[#EF4444]">{overdue}</span>
          </div>
        )}
      </div>
    </div>
  );
}
