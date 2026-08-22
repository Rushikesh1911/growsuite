import { useMemo, useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Deal } from "./types";
import { DealColumn } from "./DealColumn";
import { DealCard } from "./DealCard";

interface DealListProps {
  stages: Deal["stage"][];
  deals: Deal[];
  selectedDealId: number | null;
  setSelectedDealId: (id: number | null) => void;
  handleUpdateStage: (id: number, stage: Deal["stage"]) => void;
}

export function DealList({ stages, deals, selectedDealId, setSelectedDealId, handleUpdateStage }: DealListProps) {
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { data } = active;
    if (data.current?.type === "Deal") {
      setActiveDeal(data.current.deal);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Only needed if you want real-time drag-over sorting, but for simple column moving we can handle it in DragEnd
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDeal(null);
    const { active, over } = event;

    if (!over) return;

    const activeDealId = active.id as number;
    let newStage = over.id as Deal["stage"];

    // If dropped over another deal, extract that deal's stage
    if (over.data.current?.type === "Deal") {
      newStage = over.data.current.deal.stage;
    }

    const currentDeal = deals.find(d => d.id === activeDealId);
    
    if (currentDeal && currentDeal.stage !== newStage) {
      handleUpdateStage(activeDealId, newStage);
    }
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [stages, deals]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const columnWidth = 284; // 260px width + 24px gap
      scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -columnWidth : columnWidth, behavior: 'smooth' });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="relative group w-full">
        {canScrollLeft && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] flex items-center justify-center shadow-lg text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 hidden sm:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        
        {canScrollRight && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] flex items-center justify-center shadow-lg text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 hidden sm:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <div 
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="w-full overflow-x-auto pb-4" 
        >
          <div className="flex gap-6 h-full items-start select-none w-max">
            {stages.map((stage) => {
              const stageDeals = deals.filter(d => d.stage === stage);
              return (
                <DealColumn 
                  key={stage} 
                  stage={stage} 
                  deals={stageDeals}
                  selectedDealId={selectedDealId}
                  onSelectDeal={setSelectedDealId}
                />
              );
            })}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="w-[260px]">
            <DealCard 
              deal={activeDeal} 
              isSelected={true} 
              onSelect={() => {}} 
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
