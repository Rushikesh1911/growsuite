"use client";

import { Activity, Target, Users, Folder, Receipt, CreditCard, CheckSquare, CircleDollarSign, FileText, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export interface TimelineEvent {
  id: string | number;
  type: 'ACTIVITY' | 'NOTE';
  createdAt: string | Date;
  
  // For ACTIVITY
  action?: string;
  title?: string;
  description?: string;
  actor?: { name?: string; email?: string };
  
  // For NOTE
  content?: string;
  author?: { name?: string; email?: string };
}

interface TimelineFeedProps {
  events: TimelineEvent[];
}

export function TimelineFeed({ events }: TimelineFeedProps) {
  const searchParams = useSearchParams();
  const highlightNoteId = searchParams?.get("highlightNote");
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  
  // Sort events newest first
  const sortedEvents = [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const eventRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (highlightNoteId) {
      const targetId = `note-${highlightNoteId}`;
      const element = eventRefs.current[targetId];
      if (element) {
        // Scroll into view
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        setActiveHighlight(targetId);
        
        // Remove highlight after 3 seconds
        const timer = setTimeout(() => {
          setActiveHighlight(null);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [highlightNoteId, events]);

  const getIconForAction = (action: string) => {
    if (action.includes("LEAD")) return <Target className="h-4 w-4 text-[#007CF0]" />;
    if (action.includes("DEAL")) return <CircleDollarSign className="h-4 w-4 text-[#10B981]" />;
    if (action.includes("CLIENT")) return <Users className="h-4 w-4 text-[#7928CA]" />;
    if (action.includes("PROJECT")) return <Folder className="h-4 w-4 text-[#F5A623]" />;
    if (action.includes("TASK")) return <CheckSquare className="h-4 w-4 text-[var(--gs-muted)]" />;
    if (action.includes("INVOICE")) return <Receipt className="h-4 w-4 text-[#FF0080]" />;
    if (action.includes("PAYMENT")) return <CreditCard className="h-4 w-4 text-[var(--gs-fg)]" />;
    return <Activity className="h-4 w-4 text-[var(--gs-muted)]" />;
  };

  const getActionLabel = (action: string) => {
    const map: Record<string, string> = {
      LEAD_CREATED: "Lead created",
      LEAD_UPDATED: "Lead updated",
      DEAL_CREATED: "Deal created",
      DEAL_STAGE_UPDATED: "Deal stage updated",
      DEAL_NOTE_ADDED: "Note added",
      CLIENT_NOTE_ADDED: "Note added",
      LEAD_NOTE_ADDED: "Note added",
    };
    return map[action] || action.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase());
  };

  // Parses text like "Hello @[John Doe](12) how are you?" into React nodes
  const parseMentions = (text: string) => {
    const mentionRegex = /@\[(.*?)\]\((.*?)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const display = match[1];
      const id = match[2];
      parts.push(
        <span key={match.index} className="text-[var(--gs-fg)] font-bold bg-[var(--gs-bg-alt)] border border-[var(--gs-border-strong)] px-1.5 py-0.5 rounded-[4px]">
          @{display}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px]">
        <Activity className="h-5 w-5 text-[var(--gs-border-strong)] mb-2" />
        <span className="text-[11px] text-[var(--gs-muted)] font-medium">No activity yet.</span>
      </div>
    );
  }

  return (
    <div className="relative pl-6">
      {/* Vertical Line */}
      <div className="absolute left-[15px] top-4 bottom-0 w-px bg-[var(--gs-border)] z-0" />

      <div className="flex flex-col gap-6">
        {sortedEvents.map((event) => {
          const isNote = event.type === 'NOTE';
          const isHighlighted = activeHighlight === event.id;
          
          return (
            <div 
              key={`${event.type}-${event.id}`} 
              ref={(el) => { eventRefs.current[event.id] = el; }}
              className={`relative flex items-start gap-4 z-10 group rounded-md transition-all duration-[2000ms] ${isHighlighted ? "bg-yellow-500/10 p-2 -mx-2 shadow-[0_0_15px_rgba(234,179,8,0.2)]" : ""}`}
            >
              {/* Timeline Node */}
              <div className={`relative shrink-0 w-[30px] h-[30px] rounded-full border bg-[var(--gs-surface)] flex flex-shrink-0 items-center justify-center ml-[-15px] shadow-sm transition-colors ${isNote ? 'border-[var(--gs-border-strong)]' : 'border-[var(--gs-border)]'}`}>
                {isNote ? (
                  <FileText className="h-3.5 w-3.5 text-[var(--gs-fg)]" />
                ) : (
                  getIconForAction(event.action || "")
                )}
              </div>

              {/* Content Box */}
              <div className="flex-1 flex flex-col min-w-0 pt-[2px]">
                {isNote ? (
                  <div className="flex flex-col gap-1.5 p-3 bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[6px] rounded-tl-none">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold text-[var(--gs-fg)]">
                        {event.author?.name || event.author?.email?.split('@')[0] || 'Unknown User'}
                      </span>
                      <span className="text-[10px] text-[var(--gs-muted)] whitespace-nowrap">
                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="text-[12px] text-[var(--gs-muted)] leading-relaxed whitespace-pre-wrap">
                      {parseMentions(event.content || "")}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-semibold text-[var(--gs-fg)]">
                        {getActionLabel(event.action || "")}
                      </span>
                      <span className="text-[10px] text-[var(--gs-muted)] whitespace-nowrap">
                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {(event.title || event.description) && (
                      <div className="text-[12px] text-[var(--gs-muted)] mt-0.5">
                        {event.description || event.title}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] font-medium text-[var(--gs-muted-light)]">
                        by {event.actor?.name || event.actor?.email?.split('@')[0] || 'System'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
