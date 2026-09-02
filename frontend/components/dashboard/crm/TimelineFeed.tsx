"use client";

import { useState } from "react";
import { Send, Activity, MessageSquare, Phone, Calendar, Mail, Clock, CheckCircle2, XCircle, PhoneCall, PhoneForwarded, PhoneOff } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { RichNoteEditor } from "../shared/RichNoteEditor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type TimelineFeedProps = {
  token: string;
  workspaceId: number;
  entityType: "leads" | "deals" | "clients" | "projects";
  entityId: number;
  activities?: any[];
  notes?: any[];
  emails?: any[];
  onSuccess: () => void;
};

export function TimelineFeed({ token, workspaceId, entityType, entityId, activities = [], notes = [], emails = [], onSuccess }: TimelineFeedProps) {
  const [activeTab, setActiveTab] = useState<"note" | "call" | "meeting">("note");
  
  // Note state
  const [noteContent, setNoteContent] = useState("");
  
  // Call state
  const [callOutcome, setCallOutcome] = useState<"Connected" | "Left Voicemail" | "No Answer">("Connected");
  const [callNotes, setCallNotes] = useState("");
  
  // Meeting state
  const [meetingOutcome, setMeetingOutcome] = useState<"Completed" | "Scheduled" | "No Show">("Completed");
  const [meetingNotes, setMeetingNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/${entityType}/${entityId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ content: noteContent }),
      });
      
      if (res.ok) {
        setNoteContent("");
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitActivity = async (action: string, title: string, description: string, metadata: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/${entityType}/${entityId}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ action, title, description, metadata }),
      });
      
      if (res.ok) {
        if (action === 'CALL_LOGGED') {
          setCallNotes("");
          setCallOutcome("Connected");
        } else {
          setMeetingNotes("");
          setMeetingOutcome("Completed");
        }
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogCall = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitActivity("CALL_LOGGED", "Logged a call", callNotes, { outcome: callOutcome });
  };

  const handleLogMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitActivity("MEETING_LOGGED", "Logged a meeting", meetingNotes, { outcome: meetingOutcome });
  };

  const timelineItems = [
    ...activities.map(a => ({ ...a, itemType: 'activity', date: new Date(a.createdAt) })),
    ...notes.map(n => ({ ...n, itemType: 'note', date: new Date(n.createdAt) })),
    ...emails.map(e => ({ ...e, itemType: 'email', date: new Date(e.sentAt || e.createdAt) }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

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

  return (
    <div className="flex flex-col gap-6">
      
      {/* Input Box */}
      <div className="bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[12px] overflow-hidden flex flex-col shadow-sm">
        <div className="flex items-center gap-1 border-b border-[var(--gs-border)] bg-[var(--gs-bg-alt)] px-2 py-2">
          <button 
            onClick={() => setActiveTab("note")}
            className={`px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors flex items-center gap-2 ${activeTab === 'note' ? 'bg-[var(--gs-surface)] text-[var(--gs-fg)] shadow-sm border border-[var(--gs-border)]' : 'text-[var(--gs-muted)] hover:text-[var(--gs-fg)] border border-transparent'}`}
          >
            <MessageSquare className="h-3.5 w-3.5" /> Note
          </button>
          <button 
            onClick={() => setActiveTab("call")}
            className={`px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors flex items-center gap-2 ${activeTab === 'call' ? 'bg-[var(--gs-surface)] text-[var(--gs-fg)] shadow-sm border border-[var(--gs-border)]' : 'text-[var(--gs-muted)] hover:text-[var(--gs-fg)] border border-transparent'}`}
          >
            <Phone className="h-3.5 w-3.5" /> Log Call
          </button>
          <button 
            onClick={() => setActiveTab("meeting")}
            className={`px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors flex items-center gap-2 ${activeTab === 'meeting' ? 'bg-[var(--gs-surface)] text-[var(--gs-fg)] shadow-sm border border-[var(--gs-border)]' : 'text-[var(--gs-muted)] hover:text-[var(--gs-fg)] border border-transparent'}`}
          >
            <Calendar className="h-3.5 w-3.5" /> Log Meeting
          </button>
        </div>

        <div className="p-4 bg-[var(--gs-surface)]">
          {activeTab === "note" && (
            <div className="flex flex-col gap-3">
              <RichNoteEditor
                value={noteContent}
                onChange={setNoteContent}
                onSubmit={() => {
                  const e = new Event("submit") as unknown as React.FormEvent;
                  handleSubmitNote(e);
                }}
                placeholder="Start typing to leave a note... Use @ to tag someone."
                submitting={isSubmitting}
              />
              <div className="flex justify-end pt-2 border-t border-[var(--gs-border)]">
                <Button onClick={handleSubmitNote} disabled={isSubmitting || !noteContent.trim()} className="h-[32px] px-4 text-xs font-semibold bg-[var(--gs-fg)] text-[var(--gs-bg)] hover:bg-[var(--gs-fg)]">Save Note</Button>
              </div>
            </div>
          )}

          {activeTab === "call" && (
            <form onSubmit={handleLogCall} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <label className="text-[12px] font-semibold text-[var(--gs-muted)] uppercase tracking-wider shrink-0">Outcome</label>
                <select 
                  value={callOutcome}
                  onChange={(e: any) => setCallOutcome(e.target.value)}
                  className="bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[6px] px-2 py-1.5 text-[13px] text-[var(--gs-fg)] focus:outline-none"
                >
                  <option value="Connected">Connected</option>
                  <option value="Left Voicemail">Left Voicemail</option>
                  <option value="No Answer">No Answer</option>
                </select>
              </div>
              <textarea 
                rows={2} 
                placeholder="Describe the call..."
                value={callNotes}
                onChange={e => setCallNotes(e.target.value)}
                className="w-full bg-transparent border-none text-[13px] text-[var(--gs-fg)] focus:ring-0 focus:outline-none resize-none placeholder:text-[var(--gs-muted)]"
              />
              <div className="flex justify-end pt-2 border-t border-[var(--gs-border)]">
                <Button type="submit" disabled={isSubmitting || (!callNotes.trim() && callOutcome !== "Left Voicemail" && callOutcome !== "No Answer")} className="h-[32px] px-4 text-xs font-semibold bg-[var(--gs-fg)] text-[var(--gs-bg)] hover:bg-[var(--gs-fg)]">Log Call</Button>
              </div>
            </form>
          )}

          {activeTab === "meeting" && (
            <form onSubmit={handleLogMeeting} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <label className="text-[12px] font-semibold text-[var(--gs-muted)] uppercase tracking-wider shrink-0">Outcome</label>
                <select 
                  value={meetingOutcome}
                  onChange={(e: any) => setMeetingOutcome(e.target.value)}
                  className="bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[6px] px-2 py-1.5 text-[13px] text-[var(--gs-fg)] focus:outline-none"
                >
                  <option value="Completed">Completed</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="No Show">No Show</option>
                </select>
              </div>
              <textarea 
                rows={2} 
                placeholder="Describe the meeting..."
                value={meetingNotes}
                onChange={e => setMeetingNotes(e.target.value)}
                className="w-full bg-transparent border-none text-[13px] text-[var(--gs-fg)] focus:ring-0 focus:outline-none resize-none placeholder:text-[var(--gs-muted)]"
              />
              <div className="flex justify-end pt-2 border-t border-[var(--gs-border)]">
                <Button type="submit" disabled={isSubmitting || !meetingNotes.trim()} className="h-[32px] px-4 text-xs font-semibold bg-[var(--gs-fg)] text-[var(--gs-bg)] hover:bg-[var(--gs-fg)]">Log Meeting</Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Feed List */}
      <div className="flex flex-col mt-4">
        {timelineItems.length === 0 && (
          <div className="text-center py-10 text-[var(--gs-muted)] text-[13px] border border-dashed border-[var(--gs-border)] rounded-[12px]">
            No activity yet.
          </div>
        )}
        
        {timelineItems.map((item, i) => {
          const isLast = i === timelineItems.length - 1;
          
          let iconClass = 'border-[var(--gs-border)]';
          let bgClass = 'bg-[var(--gs-surface)]';
          
          if (item.itemType === 'note') {
            iconClass = 'border-[#007CF0]/30';
            bgClass = 'bg-[#007CF0]/10';
          } else if (item.itemType === 'email') {
            iconClass = 'border-[#F5A623]/30';
            bgClass = 'bg-[#F5A623]/10';
          } else if (item.action === 'CALL_LOGGED') {
            iconClass = 'border-[#7928CA]/30';
            bgClass = 'bg-[#7928CA]/10';
          } else if (item.action === 'MEETING_LOGGED') {
            iconClass = 'border-[#10B981]/30';
            bgClass = 'bg-[#10B981]/10';
          }

          return (
            <div key={`${item.itemType}-${item.id}`} className="flex gap-4 group">
              {/* Vertical Line & Icon */}
              <div className="flex flex-col items-center">
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 z-10 shadow-sm transition-colors ${iconClass} ${bgClass}`}>
                  {item.itemType === 'note' ? <MessageSquare className="h-4 w-4 text-[#007CF0]" /> :
                   item.itemType === 'email' ? <Mail className="h-4 w-4 text-[#F5A623]" /> :
                   item.action === 'CALL_LOGGED' ? <Phone className="h-4 w-4 text-[#7928CA]" /> :
                   item.action === 'MEETING_LOGGED' ? <Calendar className="h-4 w-4 text-[#10B981]" /> :
                   <Activity className="h-4 w-4 text-[var(--gs-muted)]" />}
                </div>
                {!isLast && <div className="w-px h-full bg-[var(--gs-border)] my-1" />}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 min-w-0 pb-6">
                <div className="flex items-center justify-between gap-2 mb-1.5 mt-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[var(--gs-fg)] truncate">
                      {item.itemType === 'note' ? (item.author?.user?.name || item.author?.user?.email || "Unknown User") : 
                       item.itemType === 'email' ? 'Sent an email' : 
                       item.title}
                    </span>
                    
                    {/* Outcome Badges */}
                    {item.action === 'CALL_LOGGED' && item.metadata?.outcome && (
                      <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-wider ${
                        item.metadata.outcome === 'Connected' ? 'bg-[#10B981]/10 text-[#10B981]' : 
                        item.metadata.outcome === 'Left Voicemail' ? 'bg-[#F5A623]/10 text-[#F5A623]' : 
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {item.metadata.outcome}
                      </span>
                    )}
                    {item.action === 'MEETING_LOGGED' && item.metadata?.outcome && (
                      <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-wider ${
                        item.metadata.outcome === 'Completed' ? 'bg-[#10B981]/10 text-[#10B981]' : 
                        item.metadata.outcome === 'Scheduled' ? 'bg-[#007CF0]/10 text-[#007CF0]' : 
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {item.metadata.outcome}
                      </span>
                    )}
                  </div>
                  
                  <span className="text-[11px] text-[var(--gs-muted)] whitespace-nowrap flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(item.date)}
                  </span>
                </div>
                
                {(item.content || item.description || item.body) && (
                  <div className="text-[13px] text-[var(--gs-fg)] bg-[var(--gs-surface)] p-3.5 rounded-[8px] border border-[var(--gs-border)] whitespace-pre-wrap leading-relaxed mt-1">
                    {item.itemType === 'note' ? parseMentions(item.content || "") : 
                     item.itemType === 'email' ? (
                       <div className="flex flex-col gap-2">
                         <span className="font-semibold text-[var(--gs-fg)]">{item.subject}</span>
                         <span className="text-[var(--gs-muted)] line-clamp-3">{item.body}</span>
                       </div>
                     ) : 
                     item.description}
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
