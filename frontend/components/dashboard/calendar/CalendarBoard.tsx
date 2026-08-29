"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Calendar, Clock, CheckSquare, Receipt, MoreHorizontal, Plus, Circle, Signal, User2, AlignLeft, CalendarDays, LayoutGrid, KanbanSquare, Video, FolderGit2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { BoardSkeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/currency";
import { DndContext, DragEndEvent, DragStartEvent, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";

interface CalendarEvent {
  id: string;
  type: "TASK" | "INVOICE" | "PROJECT";
  title: string;
  description: string;
  date: string;
  metadata?: any;
}

interface CalendarBoardProps {
  token: string;
  workspaceId: number;
}

type Timeframe = "OVERDUE" | "TODAY" | "TOMORROW" | "THIS_WEEK" | "LATER";

const extractMeetingLink = (text: string) => {
  if (!text) return null;
  const match = text.match(/(https:\/\/(?:meet\.google\.com|zoom\.us\/j|teams\.microsoft\.com)\/[^\s]+)/);
  return match ? match[1] : null;
};

// --- DND Kanban Components ---
function DroppableColumn({ id, title, iconColor, count, children }: any) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div 
      ref={setNodeRef} 
      className={`w-[340px] flex flex-col gap-3 rounded-[6px] bg-[var(--gs-bg)] transition-colors ${isOver ? 'bg-[var(--gs-bg-alt)]' : ''}`}
    >
      <div className="flex items-center justify-between px-1 mb-1">
        <div className="flex items-center gap-2">
          <Circle className={`h-3.5 w-3.5 ${iconColor}`} strokeWidth={2.5} />
          <h3 className="text-[13px] font-medium text-[var(--gs-fg)]">{title}</h3>
          <span className="text-[13px] text-[var(--gs-muted)] ml-1">{count}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto max-h-full pb-4 min-h-[200px]">
        {children}
      </div>
    </div>
  );
}

function DraggableEventCard({ event, dateColor }: { event: CalendarEvent, dateColor: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: { event }
  });

  const meetingLink = extractMeetingLink(event.description);
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.4 : 1
  } : undefined;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[6px] p-3 flex flex-col gap-2.5 hover:border-[var(--gs-border-strong)] transition-colors cursor-grab active:cursor-grabbing group shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {event.type === 'TASK' && <CheckSquare className="h-[14px] w-[14px] text-[#F5A623] mt-[2px] shrink-0" strokeWidth={2} />}
          {event.type === 'INVOICE' && <Receipt className="h-[14px] w-[14px] text-[var(--gs-fg)] mt-[2px] shrink-0" strokeWidth={2} />}
          {event.type === 'PROJECT' && <FolderGit2 className="h-[14px] w-[14px] text-[#7928CA] mt-[2px] shrink-0" strokeWidth={2} />}
          <span className="text-[13px] font-medium text-[var(--gs-fg)] leading-snug truncate">
            {event.title}
          </span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Signal className="h-3 w-3 text-[var(--gs-muted-light)]" />
          {event.type === 'TASK' && event.metadata?.assignee && (
            <div className="h-[18px] w-[18px] rounded-full bg-[#F5A623] flex items-center justify-center shadow-sm" title={event.metadata.assignee}>
              <span className="text-[9px] font-bold text-[var(--gs-bg)]">{event.metadata.assignee.charAt(0)}</span>
            </div>
          )}
          {event.type === 'INVOICE' && (
            <div className="h-[18px] w-[18px] rounded-full bg-[#007CF0] flex items-center justify-center shadow-sm">
              <span className="text-[9px] font-bold text-[var(--gs-fg)]">₹</span>
            </div>
          )}
        </div>
      </div>

      {event.description && (
        <div className="flex flex-col gap-2 pl-5 mt-0.5">
          <div className="flex items-start gap-2">
            <AlignLeft className="h-3 w-3 text-[var(--gs-muted-light)] shrink-0 mt-0.5" />
            <span className="text-[12px] text-[var(--gs-muted)] line-clamp-2 leading-tight">
              {event.description}
            </span>
          </div>
          {meetingLink && (
            <a 
              href={meetingLink} 
              target="_blank" 
              rel="noreferrer"
              onPointerDown={(e) => e.stopPropagation()} 
              className="inline-flex items-center gap-1.5 bg-[var(--gs-border)] hover:bg-[#3C3C3E] text-[var(--gs-fg)] px-2 py-1 rounded text-[11px] font-medium transition-colors w-fit pointer-events-auto cursor-pointer"
            >
              <Video className="h-3 w-3 text-[#007CF0]" />
              Join Call
            </a>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 mt-1 pl-5">
        <div className={`flex items-center gap-1.5 text-[11px] font-medium ${dateColor}`}>
          <CalendarDays className="h-3 w-3" />
          {formatDate(event.date)}
        </div>
        
        {event.type === 'INVOICE' && event.metadata?.amount && (
          <span className="text-[11px] font-medium text-[var(--gs-muted)]">
            {formatCurrency(event.metadata.amount)}
          </span>
        )}
      </div>
    </div>
  );
}


export function CalendarBoard({ token, workspaceId }: CalendarBoardProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"BOARD" | "GRID">("GRID");
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  
  // Navigation State
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Board Scroll State
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'BOARD') {
      checkScroll();
      window.addEventListener('resize', checkScroll);
      return () => window.removeEventListener('resize', checkScroll);
    }
  }, [viewMode, events, checkScroll]);

  const scrollBoard = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const columnWidth = 356; // 340px width + 16px gap
      scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -columnWidth : columnWidth, behavior: 'smooth' });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchEvents = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/calendar`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch calendar events:", error);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId]);

  useEffect(() => {
    fetchEvents();
    const handleRefresh = () => fetchEvents();
    window.addEventListener("refreshData", handleRefresh);
    return () => window.removeEventListener("refreshData", handleRefresh);
  }, [fetchEvents]);

  const updateEventDate = async (eventId: string, newDate: string) => {
    try {
      const [type, id] = eventId.split('_');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const endpoint = type === 'task' ? `/api/tasks/${id}` : type === 'invoice' ? `/api/invoices/${id}` : `/api/projects/${id}`;
      const payload = type === 'project' ? { deadline: newDate } : { dueDate: newDate };
      
      await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDragStart = (e: DragStartEvent) => {
    const { active } = e;
    setActiveEvent(events.find(ev => ev.id === active.id) || null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveEvent(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const draggedEvent = events.find(ev => ev.id === active.id);
    if (!draggedEvent) return;

    let newDateObj = new Date();
    const overId = over.id as Timeframe;

    if (overId === 'TODAY') {
      // today
    } else if (overId === 'TOMORROW') {
      newDateObj.setDate(newDateObj.getDate() + 1);
    } else if (overId === 'THIS_WEEK') {
      newDateObj.setDate(newDateObj.getDate() + 3);
    } else if (overId === 'LATER') {
      newDateObj.setDate(newDateObj.getDate() + 14);
    } else if (overId === 'OVERDUE') {
      newDateObj.setDate(newDateObj.getDate() - 1);
    }

    const newDateStr = newDateObj.toISOString();

    // Optimistic UI update
    setEvents(prev => prev.map(ev => ev.id === active.id ? { ...ev, date: newDateStr } : ev));
    
    // API Call
    updateEventDate(active.id.toString(), newDateStr);
  };

  // Group events for Kanban Board
  const groupedEvents = useMemo(() => {
    const groups: Record<Timeframe, CalendarEvent[]> = {
      OVERDUE: [], TODAY: [], TOMORROW: [], THIS_WEEK: [], LATER: [],
    };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);

    events.forEach(event => {
      if (!event.date) return;
      const eventDate = new Date(event.date);
      const eDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

      if (eDateOnly < today) groups.OVERDUE.push(event);
      else if (eDateOnly.getTime() === today.getTime()) groups.TODAY.push(event);
      else if (eDateOnly.getTime() === tomorrow.getTime()) groups.TOMORROW.push(event);
      else if (eDateOnly > tomorrow && eDateOnly <= nextWeek) groups.THIS_WEEK.push(event);
      else groups.LATER.push(event);
    });
    return groups;
  }, [events]);

  const columns: { id: Timeframe; title: string; iconColor: string; dateColor: string }[] = [
    { id: "OVERDUE", title: "Overdue", iconColor: "text-red-500", dateColor: "text-red-400" },
    { id: "TODAY", title: "Today", iconColor: "text-yellow-500", dateColor: "text-yellow-400" },
    { id: "TOMORROW", title: "Tomorrow", iconColor: "text-blue-500", dateColor: "text-[var(--gs-muted)]" },
    { id: "THIS_WEEK", title: "This Week", iconColor: "text-purple-500", dateColor: "text-[var(--gs-muted)]" },
    { id: "LATER", title: "Later", iconColor: "text-[var(--gs-muted)]", dateColor: "text-[var(--gs-muted)]" },
  ];

  // Grid Navigation Methods
  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const handleToday = () => setCurrentMonth(new Date());

  // Grid Calculations
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const totalCells = firstDayOfMonth + daysInMonth;
  const numberOfWeeks = Math.ceil(totalCells / 7);

  // Selected Date Events for Drawer
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter(e => {
      if (!e.date) return false;
      const eDate = new Date(e.date);
      return eDate.getDate() === selectedDate.getDate() && 
             eDate.getMonth() === selectedDate.getMonth() && 
             eDate.getFullYear() === selectedDate.getFullYear();
    });
  }, [selectedDate, events]);

  const projectsForDay = selectedDateEvents.filter(e => e.type === 'PROJECT');
  const tasksForDay = selectedDateEvents.filter(e => e.type === 'TASK');
  const invoicesForDay = selectedDateEvents.filter(e => e.type === 'INVOICE');

  return (
    <div className="w-full h-full flex flex-col animate-fade bg-[var(--gs-bg)]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 shrink-0 border-b border-[var(--gs-surface-raised)] gap-4 sm:gap-0">
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-[var(--gs-muted)]" />
            <h1 className="text-[16px] font-semibold text-[var(--gs-fg)] hidden sm:block">Calendar</h1>
          </div>
          
          {/* Month Navigation */}
          {viewMode === 'GRID' && (
            <div className="flex items-center gap-1.5 pl-2 sm:pl-4 sm:border-l border-[var(--gs-surface-raised)] animate-fade-in">
              <button onClick={handleToday} className="px-2.5 py-1 text-[12px] font-medium text-[var(--gs-fg)] bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[4px] hover:bg-[#252528] transition-colors">Today</button>
              <div className="flex items-center bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[4px] ml-1">
                <button onClick={handlePrevMonth} className="p-1 text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors border-r border-[var(--gs-border)]"><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={handleNextMonth} className="p-1 text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors"><ChevronRight className="h-4 w-4" /></button>
              </div>
              <span className="text-[20px] font-semibold text-[var(--gs-fg)] ml-3 min-w-[140px] tracking-tight">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 bg-[var(--gs-bg-alt)] p-1 rounded-[6px] border border-[var(--gs-border)]">
          <button 
            onClick={() => setViewMode('BOARD')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[12px] font-medium transition-colors ${viewMode === 'BOARD' ? 'bg-[var(--gs-border)] text-[var(--gs-fg)]' : 'text-[var(--gs-muted)] hover:text-[var(--gs-fg)]'}`}
          >
            <KanbanSquare className="h-3.5 w-3.5" />
            Board
          </button>
          <button 
            onClick={() => setViewMode('GRID')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[12px] font-medium transition-colors ${viewMode === 'GRID' ? 'bg-[var(--gs-border)] text-[var(--gs-fg)]' : 'text-[var(--gs-muted)] hover:text-[var(--gs-fg)]'}`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Grid
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="p-8"><BoardSkeleton /></div>
      ) : (
        <div className="flex-1 overflow-hidden p-4 sm:p-6 flex flex-col h-full min-h-0 relative">
          {viewMode === 'BOARD' ? (
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="relative group w-full h-full flex flex-col min-h-0">
                {canScrollLeft && (
                  <button 
                    onClick={() => scrollBoard('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] flex items-center justify-center shadow-lg text-[var(--gs-fg)] hover:bg-[#252528] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 hidden sm:flex"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
                {canScrollRight && (
                  <button 
                    onClick={() => scrollBoard('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] flex items-center justify-center shadow-lg text-[var(--gs-fg)] hover:bg-[#252528] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 hidden sm:flex"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
                <div 
                  ref={scrollContainerRef}
                  onScroll={checkScroll}
                  className="w-full h-full overflow-x-auto custom-scrollbar pb-2"
                >
                  <div className="flex gap-4 min-w-max h-full">
                    {columns.map((col) => (
                      <DroppableColumn key={col.id} id={col.id} title={col.title} iconColor={col.iconColor} count={groupedEvents[col.id].length}>
                        {groupedEvents[col.id].map((event) => (
                          <DraggableEventCard key={event.id} event={event} dateColor={col.dateColor} />
                        ))}
                        {groupedEvents[col.id].length === 0 && (
                          <div className="w-full py-3 px-1">
                            <span className="text-[12px] text-[var(--gs-border)] font-medium select-none">No issues</span>
                          </div>
                        )}
                      </DroppableColumn>
                    ))}
                  </div>
                </div>
              </div>
              <DragOverlay>
                {activeEvent ? <DraggableEventCard event={activeEvent} dateColor="text-[var(--gs-fg)]" /> : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <div className="bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[8px] overflow-hidden flex flex-col flex-1 h-full min-h-[calc(100vh-180px)] shadow-sm min-w-[700px]">
              {/* Grid Header */}
              <div className="grid grid-cols-7 border-b border-[var(--gs-border)] bg-[var(--gs-bg)] shrink-0">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-2 text-center text-[11px] font-bold tracking-wider text-[var(--gs-muted)] uppercase border-r border-[var(--gs-border)] last:border-0">{day}</div>
                ))}
              </div>
              
              {/* Grid Body */}
              <div 
                className="grid grid-cols-7 flex-1 bg-[var(--gs-bg-alt)]"
                style={{ gridTemplateRows: `repeat(${numberOfWeeks}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: numberOfWeeks * 7 }).map((_, i) => {
                  const dayOffset = i - firstDayOfMonth + 1;
                  // dateObj will automatically underflow/overflow to the prev/next month correctly
                  const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayOffset);
                  
                  const isCurrentMonth = dateObj.getMonth() === currentMonth.getMonth();
                  const cellDayNum = dateObj.getDate();
                  
                  // Today check uses real-world Date()
                  const realToday = new Date();
                  const isToday = dateObj.getDate() === realToday.getDate() && dateObj.getMonth() === realToday.getMonth() && dateObj.getFullYear() === realToday.getFullYear();
                  
                  // Show events even if the cell is technically in the previous/next month
                  const dayEvents = events.filter(e => {
                    if (!e.date) return false;
                    const eDate = new Date(e.date);
                    return eDate.getDate() === cellDayNum && eDate.getMonth() === dateObj.getMonth() && eDate.getFullYear() === dateObj.getFullYear();
                  });

                  return (
                    <div 
                      key={i} 
                      onClick={() => setSelectedDate(dateObj)}
                      className={`group border-r border-b border-[var(--gs-border)] p-1.5 sm:p-2 flex flex-col gap-1 overflow-hidden transition-colors duration-150 cursor-pointer ${
                        !isCurrentMonth 
                          ? 'bg-[#121212] opacity-50 hover:bg-[#1A1A1C]' 
                          : isToday
                            ? 'bg-[var(--gs-surface-raised)] hover:bg-[#242424]'
                            : 'bg-[#191919] hover:bg-[#242424]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-0.5">
                         <div className={`text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[var(--gs-fg)] text-[var(--gs-bg)]' : !isCurrentMonth ? 'text-[var(--gs-muted-light)]' : 'text-[var(--gs-muted)]'}`}>
                           {cellDayNum}
                         </div>
                      </div>
                      
                      {/* Compact Event Pills */}
                      <div className="flex flex-col gap-[3px] overflow-y-auto custom-scrollbar flex-1 pb-1 pr-1">
                        {dayEvents.map(e => (
                          <div 
                            key={e.id} 
                            className={`text-[10px] font-medium px-1.5 py-0.5 sm:py-1 rounded-[4px] truncate leading-tight flex items-center gap-1 shadow-sm border transition-colors duration-150 bg-[var(--gs-surface-raised)] text-[var(--gs-fg)] border-[var(--gs-border)] group-hover:border-[var(--gs-border-strong)] group-hover:bg-[var(--gs-bg-alt)]`} 
                            title={e.title}
                          >
                            {e.type === 'PROJECT' && <FolderGit2 className="h-2.5 w-2.5 shrink-0 hidden sm:block" />}
                            <span className="truncate">{e.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Day Drawer Overlay */}
      {selectedDate && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 animate-fade-in" 
            onClick={() => setSelectedDate(null)} 
          />
          {/* Drawer */}
          <div className="relative w-full max-w-[420px] bg-[var(--gs-surface)] h-full border-l border-[var(--gs-border)] shadow-2xl flex flex-col animate-slide-in-right">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--gs-border)] shrink-0">
              <div>
                <h2 className="text-[18px] font-bold text-[var(--gs-fg)] tracking-tight">
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                <p className="text-[13px] text-[var(--gs-muted)] mt-1 font-medium">
                  {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'} scheduled
                </p>
              </div>
              <button 
                onClick={() => setSelectedDate(null)} 
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[var(--gs-border)] text-[var(--gs-muted)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
              
              {selectedDateEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-center border border-dashed border-[var(--gs-border)] rounded-[8px] p-6 bg-[#161618]">
                  <CalendarDays className="h-8 w-8 text-[var(--gs-muted-light)] mb-3" />
                  <p className="text-[var(--gs-fg)] font-medium text-[14px]">No events</p>
                  <p className="text-[var(--gs-muted)] text-[13px] mt-1">Nothing scheduled for this date.</p>
                </div>
              ) : (
                <>
                  {/* Projects Section */}
                  {projectsForDay.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="h-4 w-4 text-[var(--gs-muted)]" />
                        <h3 className="text-[12px] font-bold tracking-wider text-[var(--gs-muted)] uppercase">Projects Due</h3>
                      </div>
                      <div className="flex flex-col gap-2">
                        {projectsForDay.map(p => (
                          <a href={`/dashboard/projects/${p.id.split('_')[1]}`} key={p.id} className="bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[6px] p-3 shadow-sm hover:border-[var(--gs-border-strong)] hover:bg-[#252528] transition-colors cursor-pointer group">
                            <span className="text-[13px] font-medium text-[var(--gs-fg)] group-hover:text-[var(--gs-fg)] block">{p.title}</span>
                            {p.description && <span className="text-[12px] text-[var(--gs-muted)] mt-1 block">{p.description} &middot; {selectedDate.toDateString() === new Date().toDateString() ? 'Due today' : 'Scheduled'}</span>}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tasks Section */}
                  {tasksForDay.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-[var(--gs-muted)]" />
                        <h3 className="text-[12px] font-bold tracking-wider text-[var(--gs-muted)] uppercase">Tasks Due</h3>
                      </div>
                      <div className="flex flex-col gap-2">
                        {tasksForDay.map(t => (
                          <div key={t.id} className="bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[6px] p-3 shadow-sm flex flex-col gap-2 hover:border-[var(--gs-border-strong)] transition-colors">
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[13px] font-medium text-[var(--gs-fg)]">{t.title}</span>
                              {t.metadata?.assignee && (
                                <div className="h-5 w-5 rounded-full bg-[#F5A623] flex items-center justify-center shrink-0" title={t.metadata.assignee}>
                                  <span className="text-[10px] font-bold text-[var(--gs-bg)]">{t.metadata.assignee.charAt(0)}</span>
                                </div>
                              )}
                            </div>
                            {t.description && <span className="text-[12px] text-[var(--gs-muted)] leading-tight line-clamp-2">{t.description} &middot; {selectedDate.toDateString() === new Date().toDateString() ? 'Due today' : 'Scheduled'}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Invoices Section */}
                  {invoicesForDay.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-[var(--gs-muted)]" />
                        <h3 className="text-[12px] font-bold tracking-wider text-[var(--gs-muted)] uppercase">Invoices Due</h3>
                      </div>
                      <div className="flex flex-col gap-2">
                        {invoicesForDay.map(i => (
                          <a href={`/dashboard/invoices/${i.id.split('_')[1]}`} key={i.id} className="bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[6px] p-3 shadow-sm flex justify-between items-center gap-4 hover:border-[var(--gs-border-strong)] hover:bg-[#252528] transition-colors cursor-pointer group">
                            <div className="flex flex-col min-w-0">
                              <span className="text-[13px] font-medium text-[var(--gs-fg)] group-hover:text-[var(--gs-fg)] truncate">{i.title}</span>
                              <span className="text-[12px] text-[var(--gs-muted)] mt-0.5 truncate">{i.description} &middot; {selectedDate.toDateString() === new Date().toDateString() ? 'Due today' : 'Scheduled'}</span>
                            </div>
                            {i.metadata?.amount && (
                              <span className="text-[13px] font-bold text-[var(--gs-fg)] shrink-0">{formatCurrency(i.metadata.amount)}</span>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      , document.body)}

    </div>
  );
}
