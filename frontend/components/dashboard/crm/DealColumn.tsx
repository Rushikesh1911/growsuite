import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Deal } from "./types";
import { DealCard } from "./DealCard";
import { formatCurrency } from "@/lib/currency";

interface DealColumnProps {
  stage: Deal["stage"];
  deals: Deal[];
  selectedDealId: number | null;
  onSelectDeal: (id: number) => void;
}

export function DealColumn({ stage, deals, selectedDealId, onSelectDeal }: DealColumnProps) {
  const { setNodeRef } = useDroppable({
    id: stage,
    data: {
      type: "Column",
      stage,
    },
  });

  const totalValue = deals.reduce((sum, deal) => sum + Number(deal.estimatedValue), 0);
  const formattedTotal = formatCurrency(totalValue);

  return (
    <div className="flex flex-col gap-3 min-w-[260px] w-[260px] flex-shrink-0">
      <div className="flex items-center justify-between border-b border-[var(--gs-border)] pb-2 select-none">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-[var(--gs-fg)] uppercase tracking-wider">
            {stage}
          </span>
          <span className="text-[10px] font-bold text-[var(--gs-muted)]">
            {deals.length}
          </span>
        </div>
        <span className="text-[11px] font-bold text-[var(--gs-muted)]">
          {formattedTotal}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-col gap-3 min-h-[150px] pb-4"
      >
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard 
              key={deal.id} 
              deal={deal} 
              isSelected={selectedDealId === deal.id}
              onSelect={onSelectDeal}
            />
          ))}
        </SortableContext>
        
        {deals.length === 0 && (
          <div className="border border-dashed border-[var(--gs-border)] rounded-[8px] h-20 flex items-center justify-center text-[11px] text-[var(--gs-muted-light)]">
            No deals
          </div>
        )}
      </div>
    </div>
  );
}
