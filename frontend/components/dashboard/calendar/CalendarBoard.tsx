"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, Clock, CheckSquare, Receipt, MoreHorizontal, Plus, Circle, Signal, User2, AlignLeft, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BoardSkeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/currency";

interface CalendarEvent {
  id: string;
  type: "TASK" | "INVOICE";
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

export function CalendarBoard({ token, workspaceId }: CalendarBoardProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/calendar`, {
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

  // Group events by timeframe
  const groupedEvents = useMemo(() => {
    const groups: Record<Timeframe, CalendarEvent[]> = {
      OVERDUE: [],
      TODAY: [],
      TOMORROW: [],
      THIS_WEEK: [],
      LATER: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    events.forEach(event => {
      const eventDate = new Date(event.date);
      const eDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

      if (eDateOnly < today) {
        groups.OVERDUE.push(event);
      } else if (eDateOnly.getTime() === today.getTime()) {
        groups.TODAY.push(event);
      } else if (eDateOnly.getTime() === tomorrow.getTime()) {
        groups.TOMORROW.push(event);
      } else if (eDateOnly > tomorrow && eDateOnly <= nextWeek) {
        groups.THIS_WEEK.push(event);
      } else {
        groups.LATER.push(event);
      }
    });

    return groups;
  }, [events]);

  const columns: { id: Timeframe; title: string; iconColor: string; dateColor: string }[] = [
    { id: "OVERDUE", title: "Overdue", iconColor: "text-red-500", dateColor: "text-red-400" },
    { id: "TODAY", title: "Today", iconColor: "text-yellow-500", dateColor: "text-yellow-400" },
    { id: "TOMORROW", title: "Tomorrow", iconColor: "text-blue-500", dateColor: "text-[#8A8A93]" },
    { id: "THIS_WEEK", title: "This Week", iconColor: "text-purple-500", dateColor: "text-[#8A8A93]" },
    { id: "LATER", title: "Later", iconColor: "text-[#888888]", dateColor: "text-[#8A8A93]" },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade bg-[#0E0E0F]">
      
      {/* View Header (Linear Style: clean, borderless or very subtle) */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-[#1E1E1E]">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-[#8A8A93]" />
          <h1 className="text-[14px] font-medium text-[#EDEDED]">Calendar / All events</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-6 w-6 flex items-center justify-center rounded-[4px] hover:bg-[#1E1E1E] text-[#8A8A93] transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8"><BoardSkeleton /></div>
      ) : (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 min-w-max h-full">
            {columns.map((col) => (
              <div key={col.id} className="w-[340px] flex flex-col gap-3 rounded-[6px] bg-[#0E0E0F]">
                
                {/* Column Header */}
                <div className="flex items-center justify-between px-1 mb-1">
                  <div className="flex items-center gap-2">
                    <Circle className={`h-3.5 w-3.5 ${col.iconColor}`} strokeWidth={2.5} />
                    <h3 className="text-[13px] font-medium text-[#EDEDED]">{col.title}</h3>
                    <span className="text-[13px] text-[#8A8A93] ml-1">{groupedEvents[col.id].length}</span>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 hover:opacity-100 transition-opacity (opacity-100 to show them but keeping subtle)">
                    <button className="h-5 w-5 flex items-center justify-center rounded-[4px] hover:bg-[#1E1E1E] text-[#8A8A93] transition-colors">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button className="h-5 w-5 flex items-center justify-center rounded-[4px] hover:bg-[#1E1E1E] text-[#8A8A93] transition-colors">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="flex flex-col gap-2 overflow-y-auto max-h-full pb-4">
                  {groupedEvents[col.id].map((event) => (
                    <div 
                      key={event.id} 
                      className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-[6px] p-3 flex flex-col gap-2.5 hover:border-[#444444] transition-colors cursor-pointer group shadow-sm"
                    >
                      {/* Top Row: Icon, Title, Actions/Avatars */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {event.type === 'TASK' ? (
                            <CheckSquare className="h-[14px] w-[14px] text-[#F5A623] mt-[2px] shrink-0" strokeWidth={2} />
                          ) : (
                            <Receipt className="h-[14px] w-[14px] text-[var(--gs-fg)] mt-[2px] shrink-0" strokeWidth={2} />
                          )}
                          <span className="text-[13px] font-medium text-[#EDEDED] leading-snug truncate">
                            {event.title}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <Signal className="h-3 w-3 text-[#555555]" />
                          {event.type === 'TASK' && event.metadata?.assignee && (
                            <div className="h-[18px] w-[18px] rounded-full bg-[#F5A623] flex items-center justify-center shadow-sm" title={event.metadata.assignee}>
                              <span className="text-[9px] font-bold text-[#000000]">{event.metadata.assignee.charAt(0)}</span>
                            </div>
                          )}
                          {event.type === 'INVOICE' && (
                            <div className="h-[18px] w-[18px] rounded-full bg-[#007CF0] flex items-center justify-center shadow-sm">
                              <span className="text-[9px] font-bold text-[#FFFFFF]">₹</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Middle Row: Description */}
                      {event.description && (
                        <div className="flex items-center gap-2 pl-5">
                          <AlignLeft className="h-3 w-3 text-[#555555] shrink-0" />
                          <span className="text-[12px] text-[#8A8A93] truncate leading-tight">
                            {event.description}
                          </span>
                        </div>
                      )}

                      {/* Bottom Row: Date & Metadata */}
                      <div className="flex items-center gap-3 mt-0.5 pl-5">
                        <div className={`flex items-center gap-1.5 text-[11px] font-medium ${col.dateColor}`}>
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(event.date)}
                        </div>
                        
                        {event.type === 'INVOICE' && event.metadata?.amount && (
                          <span className="text-[11px] font-medium text-[#8A8A93]">
                            {formatCurrency(event.metadata.amount)}
                          </span>
                        )}
                        
                        {/* Hidden action on hover */}
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <span className="text-[10px] text-[#555555]">id: {event.id.split('-')[0]}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty State line */}
                  {groupedEvents[col.id].length === 0 && (
                    <div className="w-full py-3 px-1">
                       <span className="text-[12px] text-[#333333] font-medium select-none">No issues</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
