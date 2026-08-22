"use client";

import { useState, useEffect } from "react";
import { X, MessageSquare, Activity, Clock, Send, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { Input } from "@/components/ui/input";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function DealDrawer({ token, workspaceId, dealId, onClose, onSuccess }: any) {
  const [activeTab, setActiveTab] = useState<"details" | "activity">("details");
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    estimatedValue: "",
    probability: "",
    expectedClose: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Note State
  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const res = await fetch(`${API_URL}/api/deals`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "x-workspace-id": workspaceId.toString()
          }
        });
        if (res.ok) {
          const data = await res.json();
          const currentDeal = data.find((d: any) => d.id === dealId);
          if (currentDeal) {
            setDeal(currentDeal);
            setFormData({
              title: currentDeal.title || "",
              company: currentDeal.company || "",
              estimatedValue: currentDeal.estimatedValue?.toString() || "",
              probability: currentDeal.probability?.toString() || "",
              expectedClose: currentDeal.expectedClose ? new Date(currentDeal.expectedClose).toISOString().split('T')[0] : "",
              contactName: currentDeal.contactName || "",
              contactEmail: currentDeal.contactEmail || "",
              contactPhone: currentDeal.contactPhone || "",
            });
          }
        }
      } catch (err) {} finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [token, workspaceId, dealId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API_URL}/api/deals/${dealId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({
          ...formData,
          probability: formData.probability ? parseInt(formData.probability, 10) : null,
          expectedClose: formData.expectedClose || null,
        }),
      });
      
      if (res.ok) {
        onSuccess();
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Deal updated", type: "success" } }));
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
      const res = await fetch(`${API_URL}/api/deals/${dealId}/notes`, {
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
        setDeal((prev: any) => ({
          ...prev,
          dealNotes: [note, ...(prev.dealNotes || [])]
        }));
        setNewNote("");
      }
    } catch (error) {} finally {
      setIsSubmittingNote(false);
    }
  };

  if (loading || !deal) {
    return (
      <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-[100] flex justify-end">
        <div className="w-[500px] h-full bg-[var(--gs-bg)] border-l border-[var(--gs-border)] flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-[var(--gs-fg)] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const timelineItems = [
    ...(deal.activities || []).map((a: any) => ({ ...a, type: 'activity', date: new Date(a.createdAt) })),
    ...(deal.dealNotes || []).map((n: any) => ({ ...n, type: 'note', date: new Date(n.createdAt) }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-[100] flex justify-end">
      <div className="w-full max-w-[500px] h-full bg-[var(--gs-bg)] border-l border-[var(--gs-border)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--gs-border)] flex flex-col gap-4 bg-[var(--gs-surface)] shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold text-[var(--gs-fg)]">{deal.title}</h2>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[var(--gs-muted)] uppercase tracking-wider">Deal Title *</label>
                  <Input 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="h-9 bg-[var(--gs-surface)] text-[var(--gs-fg)] border-[var(--gs-border)] focus:border-[var(--gs-border-strong)]" 
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[var(--gs-muted)] uppercase tracking-wider">Company *</label>
                  <Input 
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="h-9 bg-[var(--gs-surface)] text-[var(--gs-fg)] border-[var(--gs-border)] focus:border-[var(--gs-border-strong)]" 
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[var(--gs-muted)] uppercase tracking-wider">Value ($)</label>
                  <Input 
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({...formData, estimatedValue: e.target.value})}
                    className="h-9 bg-[var(--gs-surface)] text-[var(--gs-fg)] border-[var(--gs-border)] focus:border-[var(--gs-border-strong)] font-mono" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[var(--gs-muted)] uppercase tracking-wider">Probability (%)</label>
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({...formData, probability: e.target.value})}
                    className="h-9 bg-[var(--gs-surface)] text-[var(--gs-fg)] border-[var(--gs-border)] focus:border-[var(--gs-border-strong)]" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[var(--gs-muted)] uppercase tracking-wider">Close Date</label>
                  <Input 
                    type="date"
                    value={formData.expectedClose}
                    onChange={(e) => setFormData({...formData, expectedClose: e.target.value})}
                    className="h-9 bg-[var(--gs-surface)] text-[var(--gs-fg)] border-[var(--gs-border)] focus:border-[var(--gs-border-strong)]" 
                  />
                </div>
              </div>

              <div className="h-px w-full bg-[var(--gs-border)] my-1" />
              
              <h3 className="text-[11px] font-bold text-[var(--gs-fg)] uppercase tracking-wider -mb-1">Contact Information</h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[var(--gs-muted)]">Contact Name</label>
                <Input 
                  value={formData.contactName}
                  onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                  className="h-9 bg-[var(--gs-surface)] text-[var(--gs-fg)] border-[var(--gs-border)] focus:border-[var(--gs-border-strong)]" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[var(--gs-muted)]">Email</label>
                  <Input 
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    className="h-9 bg-[var(--gs-surface)] text-[var(--gs-fg)] border-[var(--gs-border)] focus:border-[var(--gs-border-strong)]" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[var(--gs-muted)]">Phone</label>
                  <Input 
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    className="h-9 bg-[var(--gs-surface)] text-[var(--gs-fg)] border-[var(--gs-border)] focus:border-[var(--gs-border-strong)]" 
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
