"use client";

import { useState, useEffect, useRef } from "react";
import { X, User, MessageSquare, Activity, Clock, Send } from "lucide-react";
import { PopoverSelect } from "@/components/ui/popover-select";
import { formatDate } from "@/lib/formatters";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface WorkspaceMember {
  id: number;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}

export function LeadDrawer({ token, workspaceId, leadId, onClose, onSuccess }: any) {
  const [activeTab, setActiveTab] = useState<"details" | "activity">("details");
  const [lead, setLead] = useState<any>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    contactName: "",
    company: "",
    email: "",
    phone: "",
    source: "",
    assigneeId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Note State
  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/workspaces/current`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "x-workspace-id": workspaceId.toString()
          }
        });
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);
        }
      } catch (err) {}
    };

    const fetchLead = async () => {
      try {
        const res = await fetch(`${API_URL}/api/leads/${leadId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "x-workspace-id": workspaceId.toString()
          }
        });
        if (res.ok) {
          const data = await res.json();
          setLead(data);
          setFormData({
            contactName: data.contactName || "",
            company: data.company || "",
            email: data.email || "",
            phone: data.phone || "",
            source: data.source || "",
            assigneeId: data.assigneeId || "",
          });
        }
      } catch (err) {} finally {
        setLoading(false);
      }
    };

    fetchMembers();
    fetchLead();
  }, [token, workspaceId, leadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contactName) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API_URL}/api/leads/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        onSuccess();
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Lead updated", type: "success" } }));
      }
    } catch (error) {} finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSubmittingNote(true);

    try {
      const res = await fetch(`${API_URL}/api/leads/${leadId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ content: newNote }),
      });
      
      if (res.ok) {
        const note = await res.json();
        setLead((prev: any) => ({
          ...prev,
          leadNotes: [note, ...(prev.leadNotes || [])]
        }));
        setNewNote("");
      }
    } catch (error) {} finally {
      setIsSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-[100] flex justify-end">
        <div className="w-[500px] h-full bg-[var(--gs-bg)] border-l border-[var(--gs-border)] flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-[var(--gs-fg)] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const timelineItems = [
    ...(lead.activities || []).map((a: any) => ({ ...a, type: 'activity', date: new Date(a.createdAt) })),
    ...(lead.leadNotes || []).map((n: any) => ({ ...n, type: 'note', date: new Date(n.createdAt) }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-[100] flex justify-end">
      <div className="w-full max-w-[500px] h-full bg-[var(--gs-bg)] border-l border-[var(--gs-border)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--gs-border)] flex flex-col gap-4 bg-[var(--gs-surface)] shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold text-[var(--gs-fg)]">{lead.contactName}</h2>
            <button onClick={onClose} className="text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-6 border-b border-[var(--gs-border)] pb-0">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-3 text-[13px] font-medium transition-colors border-b-2 ${activeTab === 'details' ? 'border-[var(--gs-fg)] text-[var(--gs-fg)]' : 'border-transparent text-[var(--gs-muted)] hover:text-[var(--gs-fg)]'}`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`pb-3 text-[13px] font-medium transition-colors border-b-2 ${activeTab === 'activity' ? 'border-[var(--gs-fg)] text-[var(--gs-fg)]' : 'border-transparent text-[var(--gs-muted)] hover:text-[var(--gs-fg)]'}`}
            >
              Activity Feed
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "details" ? (
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="flex gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[12px] font-medium text-[var(--gs-muted)]">Contact Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.contactName}
                    onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                    className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[12px] font-medium text-[var(--gs-muted)]">Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)]"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[12px] font-medium text-[var(--gs-muted)]">Email</label>
                  <input
                    type="email"
                    placeholder="e.g. rahul@acme.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[12px] font-medium text-[var(--gs-muted)]">Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98..."
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)]"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[12px] font-medium text-[var(--gs-muted)]">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)]"
                  >
                    <option value="">Select source</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[12px] font-medium text-[var(--gs-muted)]">Assign To</label>
                  <PopoverSelect
                    value={formData.assigneeId ? formData.assigneeId.toString() : ""}
                    onChange={(val) => setFormData({...formData, assigneeId: val ? val : ""} as any)}
                    placeholder="Unassigned"
                    className="w-full justify-between"
                    options={[
                      { label: "Unassigned", value: "", icon: <div className="h-4 w-4 rounded-full border border-dashed border-[var(--gs-border-strong)] bg-transparent shrink-0" /> },
                      ...members.map(m => ({
                        label: m.user.name || m.user.email.split('@')[0],
                        value: m.id.toString(),
                        icon: m.user.avatarUrl ? (
                          <img src={m.user.avatarUrl} alt="avatar" className="h-4 w-4 rounded-full object-cover" />
                        ) : (
                          <div className="h-4 w-4 rounded-full bg-[var(--gs-border)] flex items-center justify-center shrink-0">
                            <span className="text-[8px] font-bold text-[var(--gs-fg)]">
                              {(m.user.name || m.user.email).substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )
                      }))
                    ]}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-[var(--gs-border)] flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[var(--gs-fg)] hover:bg-[#FFFFFF] text-[#000000] px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col h-full relative">
              {/* Timeline */}
              <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto pb-24">
                {timelineItems.length === 0 && (
                  <div className="text-center py-8 text-[var(--gs-muted)] text-[13px]">
                    No activity yet.
                  </div>
                )}
                {timelineItems.map((item: any, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 shrink-0">
                      {item.type === 'activity' ? (
                        <div className="h-8 w-8 rounded-full bg-[var(--gs-surface)] border border-[var(--gs-border)] flex items-center justify-center">
                          <Activity className="h-4 w-4 text-[var(--gs-muted)]" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-[#007CF0]/10 border border-[#007CF0]/20 flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-[#007CF0]" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[13px] font-medium text-[var(--gs-fg)] truncate">
                          {item.type === 'activity' ? item.title : item.author?.user?.name || item.author?.user?.email}
                        </span>
                        <span className="text-[11px] text-[var(--gs-muted)] whitespace-nowrap flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <div className="text-[13px] text-[var(--gs-muted)] bg-[var(--gs-surface)] p-3 rounded-[8px] border border-[var(--gs-border)] whitespace-pre-wrap">
                        {item.type === 'activity' ? item.description : item.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Note Input */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-[var(--gs-bg)] border-t border-[var(--gs-border)]">
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a note..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    className="flex-1 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-4 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !newNote.trim()}
                    className="bg-[var(--gs-fg)] hover:bg-[#FFFFFF] text-[#000000] h-[38px] w-[38px] flex items-center justify-center rounded-[6px] transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
