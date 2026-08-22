import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Deal } from "./types";
import { MoreHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface DealCardProps {
  deal: Deal;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

export function DealCard({ deal, isSelected, onSelect }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: {
      type: "Deal",
      deal,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const formattedValue = formatCurrency(Number(deal.estimatedValue));

  const probability = deal.probability ? `${deal.probability}%` : "";
  const closeDate = deal.expectedClose 
    ? new Date(deal.expectedClose).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(deal.id)}
      className={`group p-3 bg-[var(--gs-surface)] border rounded-[8px] cursor-grab active:cursor-grabbing hover:border-[var(--gs-border-strong)] transition-all flex flex-col gap-2 shadow-sm ${
        isSelected 
          ? "border-[var(--gs-fg-secondary)] bg-[var(--gs-surface-raised)] ring-1 ring-[var(--gs-fg-secondary)]/20" 
          : "border-[var(--gs-border)]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <h4 className="text-xs font-bold text-[var(--gs-fg)] tracking-tight line-clamp-1">{deal.title}</h4>
          <p className="text-[10px] text-[var(--gs-muted)] font-medium line-clamp-1">{deal.company}</p>
        </div>
        <button 
          className="text-[var(--gs-muted-light)] hover:text-[var(--gs-fg)] opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Open action menu
          }}
        >
          <MoreHorizontal className="h-3 w-3" />
        </button>
      </div>

      <div className="flex flex-col gap-1 mt-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-[var(--gs-fg)]">{formattedValue}</span>
          {probability && (
            <>
              <span className="text-[var(--gs-muted-light)]">·</span>
              <span className="text-[10px] font-semibold text-[var(--gs-muted)]">{probability}</span>
            </>
          )}
        </div>
        
        {closeDate && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[9px] font-medium text-[var(--gs-muted-light)] uppercase tracking-wider">Close:</span>
            <span className="text-[10px] font-semibold text-[var(--gs-muted)]">{closeDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}
