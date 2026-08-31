"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, Building2, MoreHorizontal, User, UserPlus, FileText, X, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Topbar } from "@/components/dashboard/Topbar";
import { useDashboard } from "../../DashboardContext";
import { ConvertDealModal } from "@/components/dashboard/crm/ConvertDealModal";
import { LeadDrawer } from "@/components/dashboard/crm/LeadDrawer";
import { TimelineFeed } from "@/components/dashboard/crm/TimelineFeed";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LeadProfilePage() {
  const params = useParams();
  const router = useRouter();
  const leadId = parseInt(params.id as string, 10);
  
  const { token, workspaceId } = useDashboard();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLead = async () => {
    try {
      const res = await fetch(`${API_URL}/api/leads/${leadId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setLead(data);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && workspaceId && leadId) {
      fetchLead();
    }
  }, [token, workspaceId, leadId]);

  const handleUpdateStatus = async (status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/leads/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchLead();
        setIsActionMenuOpen(false);
        window.dispatchEvent(new Event("refreshData"));
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead?.email || !emailSubject || !emailBody) return;
    
    setSendingEmail(true);
    try {
      const res = await fetch(`${API_URL}/api/leads/${lead.id}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({
          subject: emailSubject,
          body: emailBody
        }),
      });
      
      if (res.ok) {
        setIsEmailModalOpen(false);
        setEmailSubject("");
        setEmailBody("");
        fetchLead();
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Email sent successfully", type: "success" } }));
      } else {
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Failed to send email", type: "error" } }));
      }
    } catch (error) {
      console.error("Failed to send email:", error);
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar currentView="leads" />
        <main className="flex-1 overflow-y-auto bg-[var(--gs-bg)] p-8 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[var(--gs-fg)] border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar currentView="leads" />
      
      <main className="flex-1 overflow-y-auto px-8 py-8 bg-[var(--gs-bg)] relative z-0">
        <div className="max-w-4xl w-full mx-auto animate-fade animate-duration-150">
          
          <button 
            onClick={() => router.push('/dashboard/leads')}
            className="flex items-center gap-2 text-[13px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Leads
          </button>

          <div className="flex items-start justify-between mb-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-[var(--gs-fg)] tracking-tight">
                {lead.contactName}
              </h1>
              <div className="flex items-center gap-3 text-[13px]">
                {lead.company && (
                  <span className="flex items-center gap-1.5 text-[var(--gs-muted)] font-medium">
                    <Building2 className="h-3.5 w-3.5" />
                    {lead.company}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-wider ${
                  lead.status === 'NEW' ? 'bg-blue-500/10 text-blue-400' :
                  lead.status === 'CONTACTED' ? 'bg-yellow-500/10 text-yellow-400' :
                  lead.status === 'QUALIFIED' ? 'bg-green-500/10 text-green-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {lead.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 relative" ref={actionMenuRef}>
              {lead.email && (
                <button 
                  onClick={() => setIsEmailModalOpen(true)}
                  className="h-[32px] px-3 flex items-center justify-center rounded-[6px] gap-2 text-xs font-semibold bg-[var(--gs-surface)] border-[var(--gs-border)] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] border transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Send Email
                </button>
              )}
              
              {lead.convertedDealId ? (
                <button 
                  onClick={() => router.push('/dashboard/pipeline')}
                  className="h-[32px] px-3 flex items-center justify-center rounded-[6px] text-xs font-semibold bg-[var(--gs-fg)] text-[var(--gs-bg)] hover:bg-[var(--gs-fg)] transition-colors"
                >
                  View Deal
                </button>
              ) : lead.status === 'QUALIFIED' && (
                <button 
                  onClick={() => setIsConvertModalOpen(true)}
                  className="h-[32px] px-3 flex items-center justify-center rounded-[6px] text-xs font-semibold bg-[var(--gs-fg)] text-[var(--gs-bg)] hover:bg-[var(--gs-fg)] transition-colors"
                >
                  Create Deal
                </button>
              )}
              
              <button 
                onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                className="h-[32px] w-[32px] flex items-center justify-center rounded-[6px] bg-[var(--gs-surface)] border-[var(--gs-border)] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] border transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {isActionMenuOpen && (
                <div className="absolute right-0 top-10 w-40 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] shadow-xl z-10 py-1 overflow-hidden">
                  <button onClick={() => { setIsEditModalOpen(true); setIsActionMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors">Edit lead</button>
                  <div className="h-px w-full bg-[var(--gs-border)] my-1" />
                  
                  {lead.status === 'NEW' && <button onClick={() => handleUpdateStatus('CONTACTED')} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors">Mark Contacted</button>}
                  {(lead.status === 'NEW' || lead.status === 'CONTACTED') && <button onClick={() => handleUpdateStatus('QUALIFIED')} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors">Qualify</button>}
                  {lead.status !== 'DISQUALIFIED' && (
                    <>
                      <div className="h-px w-full bg-[var(--gs-border)] my-1" />
                      <button onClick={() => handleUpdateStatus('DISQUALIFIED')} className="w-full text-left px-3 py-1.5 text-[12px] text-red-400 hover:bg-[var(--gs-bg-alt)] transition-colors">Disqualify</button>
                    </>
                  )}
                  {lead.status === 'DISQUALIFIED' && (
                    <>
                      <button onClick={() => handleUpdateStatus('NEW')} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors">Reopen lead</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-6">
              <Card className="bg-[var(--gs-surface)] border-[var(--gs-border)] p-5 flex flex-col gap-5 rounded-[12px]">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--gs-muted)]">Overview</h3>
                
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-[var(--gs-muted)] flex items-center gap-1.5"><Mail className="h-3 w-3" /> Email</span>
                    <span className="text-[13px] font-medium text-[var(--gs-fg)]">{lead.email || "—"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-[var(--gs-muted)] flex items-center gap-1.5"><Phone className="h-3 w-3" /> Phone</span>
                    <span className="text-[13px] font-medium text-[var(--gs-fg)]">{lead.phone || "—"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-[var(--gs-muted)] flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Source</span>
                    <span className="text-[13px] font-medium text-[var(--gs-fg)]">{lead.source || "—"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-[var(--gs-muted)] flex items-center gap-1.5"><User className="h-3 w-3" /> Assigned to</span>
                    <span className="text-[13px] font-medium text-[var(--gs-fg)]">{lead.assignee?.user?.name || lead.assignee?.user?.email || "Unassigned"}</span>
                  </div>
                </div>
              </Card>

            </div>

            <div className="lg:col-span-2">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--gs-muted)] mb-4">Activity Feed</h3>
              <TimelineFeed 
                token={token!}
                workspaceId={workspaceId!}
                entityType="leads"
                entityId={lead.id}
                activities={lead.activities}
                notes={lead.leadNotes}
                emails={lead.emails}
                onSuccess={() => {
                  fetchLead();
                  window.dispatchEvent(new Event("refreshData"));
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {isConvertModalOpen && (
        <ConvertDealModal 
          token={token} 
          workspaceId={workspaceId} 
          lead={lead} 
          onClose={() => setIsConvertModalOpen(false)} 
          onSuccess={() => {
            fetchLead();
            window.dispatchEvent(new Event("refreshData"));
          }}
        />
      )}

      {isEditModalOpen && (
        <LeadDrawer
          token={token}
          workspaceId={workspaceId}
          leadId={lead.id}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => fetchLead()}
        />
      )}

      {/* Send Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-[var(--gs-bg)]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[12px] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--gs-border)] flex items-center justify-between bg-[var(--gs-surface)]">
              <h2 className="text-[15px] font-semibold text-[var(--gs-fg)]">Send Email to {lead.contactName}</h2>
              <button onClick={() => { setIsEmailModalOpen(false); setEmailSubject(""); setEmailBody(""); }} className="text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSendEmail} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[var(--gs-muted)]">To</label>
                <input
                  type="text"
                  disabled
                  value={lead.email || ""}
                  className="w-full bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-muted)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[var(--gs-muted)]">Subject <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Following up on our conversation"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[var(--gs-muted)]">Message <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={8}
                  placeholder="Type your message here..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)] resize-none font-mono"
                />
              </div>

              <div className="pt-4 mt-2 border-t border-[var(--gs-border)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="bg-[var(--gs-fg)] hover:bg-[var(--gs-fg)] text-[var(--gs-bg)] px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {sendingEmail ? "Sending..." : "Send Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
