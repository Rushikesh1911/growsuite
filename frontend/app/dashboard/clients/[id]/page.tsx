"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, Mail, Phone, MapPin, MoreHorizontal, FileText, CheckCircle2, Clock, Plus, Receipt, ExternalLink, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CreateProjectModal } from "@/components/dashboard/projects/CreateProjectModal";
import { CreateInvoiceModal } from "@/components/dashboard/finance/CreateInvoiceModal";
import { EditClientModal } from "@/components/dashboard/clients/EditClientModal";
import { Topbar } from "@/components/dashboard/Topbar";
import { EventToast } from "@/components/ui/event-toast";
import { TimelineFeed } from "@/components/dashboard/crm/TimelineFeed";
import { RichNoteEditor } from "@/components/dashboard/shared/RichNoteEditor";
import { useDashboard } from "../../DashboardContext";
import { formatCurrency } from "@/lib/currency";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Client {
  id: number;
  name: string;
  company: string;
  email: string | null;
  phone: string | null;
  billingAddress: string | null;
  createdAt: string;
  updatedAt: string;
  projects?: { id: number; name: string; status: string; description?: string; deadline?: string; createdAt: string }[];
  invoices?: { 
    id: number; 
    invoiceNumber: string; 
    amountPaid: string; 
    balanceDue: string; 
    total: string;
    status: string;
    issueDate: string;
    dueDate: string;
    currency: string;
    payments?: { id: number; amount: string; date: string; method?: string; reference?: string }[];
  }[];
  activities?: any[];
  clientNotes?: any[];
  emails?: any[];
  originalDeal?: { id: number; title: string; estimatedValue: string };
}

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = parseInt(params.id as string, 10);
  
  const { token, workspaceId } = useDashboard();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "invoices" | "payments" | "activity">("overview");

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const fetchClient = async () => {
    if (!token || !workspaceId || isNaN(clientId)) return;
    try {
      const res = await fetch(`${API_URL}/api/clients/${clientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setClient(data);
      } else {
        router.push("/dashboard/clients");
      }
    } catch (err) {
      console.error("Failed to fetch client details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [clientId, token, workspaceId, router]);

  const handleArchiveClient = async () => {
    try {
      const res = await fetch(`${API_URL}/api/clients/${clientId}/archive`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Client archived", type: "success" } }));
        router.push("/dashboard/clients");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Topbar />
        <main className="flex-1 flex items-center justify-center relative z-0">
          <div className="animate-spin h-6 w-6 border-2 border-[var(--gs-fg)] border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  if (!client) return null;

  const activeProjectsCount = client.projects?.filter(p => p.status === 'ACTIVE' || p.status === 'PLANNING').length || 0;
  
  const outstandingBalance = client.invoices 
    ? client.invoices.reduce((acc, inv) => acc + (Number(inv.balanceDue) || 0), 0)
    : 0;

  const lifetimeRevenue = client.invoices
    ? client.invoices.filter(inv => inv.status === 'PAID').reduce((acc, inv) => acc + (Number(inv.total) || 0), 0)
    : 0;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Topbar 
          breadcrumbs={
            <>
              <span className="text-[13px] font-medium text-[var(--gs-muted)] cursor-pointer hover:text-[var(--gs-fg)] transition-colors" onClick={() => router.push("/dashboard/clients")}>Clients</span>
              <span className="text-[13px] text-[var(--gs-muted-light)]">/</span>
              <span className="text-[13px] font-medium text-[var(--gs-fg)] truncate max-w-[200px]">{client.name}</span>
            </>
          }
        />
        
        <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative z-0 bg-[var(--gs-bg)] animate-in fade-in duration-200">
          
          {/* Compact Header */}
          <div className="px-8 py-5 border-b border-[var(--gs-border)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push("/dashboard?view=clients")}
                className="h-8 w-8 rounded-[6px] border border-[var(--gs-border)] flex items-center justify-center hover:bg-[var(--gs-bg-alt)] hover:text-[var(--gs-fg)] text-[var(--gs-muted)] transition-colors shrink-0 outline-none"
                title="Back to Clients"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              
              <div className="h-10 w-10 rounded-[8px] bg-[var(--gs-surface)] border border-[var(--gs-border)] flex items-center justify-center text-[13px] font-bold text-[var(--gs-fg)] shadow-sm shrink-0">
                {getInitials(client.name)}
              </div>
              
              <div className="flex flex-col min-w-0">
                <h1 className="text-[16px] font-bold text-[var(--gs-fg)] tracking-tight truncate flex items-center gap-2">
                  {client.name}
                </h1>
                <div className="flex items-center gap-3 text-[12px] text-[var(--gs-muted)] mt-0.5 truncate font-medium">
                  {client.company && (
                    <span className="truncate">{client.company}</span>
                  )}
                  {client.company && client.email && <span>•</span>}
                  {client.email && (
                    <div className="flex items-center gap-1.5 group/contact">
                      <a href={`mailto:${client.email}`} className="truncate hover:text-[var(--gs-fg)] transition-colors outline-none cursor-pointer">{client.email}</a>
                      <button onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(client.email!); window.dispatchEvent(new CustomEvent('showToast', {detail:{message:'Email copied', type:'info'}})); }} className="opacity-0 group-hover/contact:opacity-100 text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-opacity outline-none" title="Copy email">
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {client.phone && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1.5 group/contact">
                        <a href={`tel:${client.phone.replace(/[^0-9+]/g, '')}`} className="truncate hover:text-[var(--gs-fg)] transition-colors outline-none cursor-pointer">{client.phone}</a>
                        <button onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(client.phone!); window.dispatchEvent(new CustomEvent('showToast', {detail:{message:'Phone copied', type:'info'}})); }} className="opacity-0 group-hover/contact:opacity-100 text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-opacity outline-none" title="Copy phone">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsProjectModalOpen(true)}
                className="flex items-center gap-1.5 bg-[var(--gs-fg)] hover:opacity-90 text-[var(--gs-bg)] px-3 py-1.5 rounded-[6px] text-[12px] font-bold transition-colors shadow-sm outline-none"
              >
                <Plus className="h-3.5 w-3.5" /> Create Project
              </button>
              <button 
                onClick={() => setIsInvoiceModalOpen(true)}
                className="flex items-center gap-1.5 bg-[var(--gs-surface)] hover:bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] text-[var(--gs-fg)] px-3 py-1.5 rounded-[6px] text-[12px] font-bold transition-colors shadow-sm outline-none"
              >
                <Receipt className="h-3.5 w-3.5" /> Create Invoice
              </button>
              <div className="relative" ref={actionMenuRef}>
                <button 
                  onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                  className="flex items-center gap-1.5 bg-[var(--gs-surface)] hover:bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] text-[var(--gs-muted)] hover:text-[var(--gs-fg)] px-2 py-1.5 rounded-[6px] transition-colors shadow-sm outline-none cursor-pointer"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {isActionMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px] shadow-2xl py-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    <button 
                      onClick={() => { setIsActionMenuOpen(false); window.dispatchEvent(new CustomEvent('showToast', {detail:{message:'Add Note coming soon', type:'info'}})); }}
                      className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg-secondary)] hover:text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors flex items-center gap-2 outline-none"
                    >
                      <FileText className="h-3.5 w-3.5" /> Add note
                    </button>
                    <button 
                      onClick={() => { setIsActionMenuOpen(false); setIsEditModalOpen(true); }}
                      className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg-secondary)] hover:text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors flex items-center gap-2 outline-none"
                    >
                      <Building2 className="h-3.5 w-3.5" /> Edit client
                    </button>
                    <div className="h-px bg-[var(--gs-border)] my-1"></div>
                    <button 
                      onClick={() => { setIsActionMenuOpen(false); handleArchiveClient(); }}
                      className="w-full text-left px-3 py-1.5 text-[12px] text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 font-medium outline-none"
                    >
                      Archive client
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-8 border-b border-[var(--gs-border)] bg-[var(--gs-bg)] sticky top-0 z-10">
            <div className="flex items-center gap-6">
              {(["overview", "projects", "invoices", "payments", "activity"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 text-[12px] font-bold tracking-wide uppercase transition-colors relative outline-none ${activeTab === tab ? 'text-[var(--gs-fg)]' : 'text-[var(--gs-muted)] hover:text-[var(--gs-fg)]'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--gs-fg)] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-8">
            {activeTab === "overview" && (
              <div className="grid grid-cols-[65%_1fr] gap-10 max-w-[1200px]">
                {/* Left Column (65%) */}
                <div className="flex flex-col gap-10">
                  {/* Compact Metrics Strip */}
                  <div className="flex items-center gap-6 text-[13px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--gs-fg)]">{activeProjectsCount}</span>
                      <span className="text-[var(--gs-muted)]">Active projects</span>
                    </div>
                    <div className="w-px h-3 bg-[var(--gs-border)]" />
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--gs-fg)]">{formatCurrency(outstandingBalance)}</span>
                      <span className="text-[var(--gs-muted)]">Outstanding</span>
                    </div>
                    <div className="w-px h-3 bg-[var(--gs-border)]" />
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--gs-fg)]">{formatCurrency(lifetimeRevenue)}</span>
                      <span className="text-[var(--gs-muted)]">Lifetime revenue</span>
                    </div>
                  </div>

                  {/* Dense Activity Timeline */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[14px] font-bold text-[var(--gs-fg)] tracking-tight">Recent activity</h3>
                    
                    {!client.activities || client.activities.length === 0 ? (
                      <div className="py-4 text-left">
                        <span className="text-[13px] font-medium text-[var(--gs-muted)]">No recent activity found for this client.</span>
                      </div>
                    ) : (
                      <div className="relative border-l border-[var(--gs-border)] ml-[5px] pl-5 flex flex-col gap-6 py-2">
                        {client.activities.slice(0, 10).map((activity, idx) => (
                          <div key={idx} className="relative flex flex-col justify-center min-h-[50px]">
                            {/* Timeline dot */}
                            <div className="absolute -left-[25px] top-1.5 h-[11px] w-[11px] rounded-full bg-[var(--gs-bg-alt)] border-2 border-[var(--gs-bg)] ring-1 ring-[var(--gs-border)]" />
                            
                            <div className="flex flex-col">
                              <span className="text-[13px] font-semibold text-[var(--gs-fg)] truncate">
                                {activity.title}
                              </span>
                              {activity.description && (
                                <span className="text-[12px] text-[var(--gs-muted)] leading-tight mt-1 max-w-md line-clamp-2">
                                  {activity.description}
                                </span>
                              )}
                              <span className="text-[11px] text-[var(--gs-muted-light)] mt-1.5 font-bold uppercase tracking-wider">
                                {new Date(activity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column (35%) */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[14px] font-bold text-[var(--gs-fg)] tracking-tight">Details</h3>
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-[12px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  
                  <div className="bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px] p-5 flex flex-col gap-4 text-[13px]">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Company</span>
                      <span className="font-medium text-[var(--gs-fg)]">{client.company || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Email</span>
                      <span className="font-medium text-[var(--gs-fg)]">{client.email || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Phone</span>
                      <span className="font-medium text-[var(--gs-fg)]">{client.phone || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Billing Address</span>
                      <span className="font-medium text-[var(--gs-fg)]">{client.billingAddress || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1 mt-2 pt-4 border-t border-[var(--gs-border)]">
                      <span className="text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Client Since</span>
                      <span className="font-medium text-[var(--gs-fg)]">{new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    
                    {client.originalDeal && (
                      <div className="flex flex-col gap-1.5 mt-2 pt-4 border-t border-[var(--gs-border)]">
                        <span className="text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Originating Deal</span>
                        <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => router.push('/dashboard/pipeline')}>
                          <span className="font-medium text-[var(--gs-fg)] group-hover:underline decoration-[var(--gs-muted)] underline-offset-4">
                            {client.originalDeal.title} · {formatCurrency(Number(client.originalDeal.estimatedValue))}
                          </span>
                          <ExternalLink className="h-3 w-3 text-[var(--gs-muted)] group-hover:text-[var(--gs-fg)] transition-colors" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes removed and moved to Activity tab */}
                </div>
              </div>
            )}

            {activeTab === "projects" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-bold text-[var(--gs-fg)] tracking-tight">Projects</h3>
                </div>
                
                {!client.projects || client.projects.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center border border-dashed border-[var(--gs-border)] rounded-[8px] bg-[var(--gs-surface)]">
                    <span className="text-[13px] font-medium text-[var(--gs-muted)]">No projects found.</span>
                  </div>
                ) : (
                  <div className="border border-[var(--gs-border)] rounded-[8px] overflow-hidden bg-[var(--gs-surface)]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--gs-border)] bg-[var(--gs-bg-alt)]">
                          <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Project Name</th>
                          <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Status</th>
                          <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Created</th>
                          <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Deadline</th>
                        </tr>
                      </thead>
                      <tbody>
                        {client.projects.map((project) => (
                          <tr key={project.id} className="border-b border-[var(--gs-border)] last:border-b-0 hover:bg-[var(--gs-bg-alt)] transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/projects`)}>
                            <td className="px-4 py-3 text-[13px] font-medium text-[var(--gs-fg)]">{project.name}</td>
                            <td className="px-4 py-3 text-[12px]"><span className="px-2 py-1 bg-[var(--gs-border)] rounded-[4px]">{project.status}</span></td>
                            <td className="px-4 py-3 text-[12px] text-[var(--gs-muted)]">{new Date(project.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-[12px] text-[var(--gs-muted)]">{project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "invoices" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-bold text-[var(--gs-fg)] tracking-tight">Invoices</h3>
                </div>
                
                {!client.invoices || client.invoices.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center border border-dashed border-[var(--gs-border)] rounded-[8px] bg-[var(--gs-surface)]">
                    <span className="text-[13px] font-medium text-[var(--gs-muted)]">No invoices found.</span>
                  </div>
                ) : (
                  <div className="border border-[var(--gs-border)] rounded-[8px] overflow-hidden bg-[var(--gs-surface)]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--gs-border)] bg-[var(--gs-bg-alt)]">
                          <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Invoice #</th>
                          <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Status</th>
                          <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider text-right">Total</th>
                          <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider text-right">Balance Due</th>
                          <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Issue Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {client.invoices.map((invoice) => (
                          <tr key={invoice.id} className="border-b border-[var(--gs-border)] last:border-b-0 hover:bg-[var(--gs-bg-alt)] transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/finance`)}>
                            <td className="px-4 py-3 text-[13px] font-bold text-[var(--gs-fg)]">{invoice.invoiceNumber}</td>
                            <td className="px-4 py-3 text-[12px]"><span className="px-2 py-1 bg-[var(--gs-border)] rounded-[4px]">{invoice.status}</span></td>
                            <td className="px-4 py-3 text-[13px] font-medium text-[var(--gs-fg)] text-right">{formatCurrency(Number(invoice.total))}</td>
                            <td className="px-4 py-3 text-[13px] font-bold text-[var(--gs-fg)] text-right">{formatCurrency(Number(invoice.balanceDue))}</td>
                            <td className="px-4 py-3 text-[12px] text-[var(--gs-muted)]">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "payments" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-bold text-[var(--gs-fg)] tracking-tight">Payments</h3>
                </div>
                
                {(!client.invoices || !client.invoices.some(inv => inv.payments && inv.payments.length > 0)) ? (
                  <div className="py-12 flex flex-col items-center justify-center border border-dashed border-[var(--gs-border)] rounded-[8px] bg-[var(--gs-surface)]">
                    <span className="text-[13px] font-medium text-[var(--gs-muted)]">No payments found.</span>
                  </div>
                ) : (
                  <div className="border border-[var(--gs-border)] rounded-[8px] overflow-hidden bg-[var(--gs-surface)]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--gs-border)] bg-[var(--gs-bg-alt)]">
                          <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Date</th>
                          <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Invoice #</th>
                          <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider text-right">Amount</th>
                          <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {client.invoices.flatMap(inv => 
                          (inv.payments || []).map(payment => ({ ...payment, invoiceNumber: inv.invoiceNumber }))
                        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((payment) => (
                          <tr key={payment.id} className="border-b border-[var(--gs-border)] last:border-b-0 hover:bg-[var(--gs-bg-alt)] transition-colors">
                            <td className="px-4 py-3 text-[12px] text-[var(--gs-fg)]">{new Date(payment.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-[12px] text-[var(--gs-muted)]">{payment.invoiceNumber}</td>
                            <td className="px-4 py-3 text-[13px] font-bold text-[var(--gs-fg)] text-right">{formatCurrency(Number(payment.amount))}</td>
                            <td className="px-4 py-3 text-[12px] text-[var(--gs-muted)]">{payment.method || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div className="py-6 flex flex-col items-start h-full max-w-[800px] w-full mx-auto">
                <div className="w-full flex flex-col gap-4">
                  <TimelineFeed 
                    token={token!}
                    workspaceId={workspaceId!}
                    entityType="clients"
                    entityId={client.id}
                    activities={client.activities}
                    notes={client.clientNotes}
                    emails={client.emails}
                    onSuccess={() => {
                      fetchClient();
                      window.dispatchEvent(new Event("refreshData"));
                    }}
                  />
                </div>
              </div>
            )}
          </div>

        </main>
      </div>
      <CreateProjectModal
        token={token}
        workspaceId={workspaceId}
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        initialClientId={client.id}
        onSuccess={(project) => {
          setIsProjectModalOpen(false);
          window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Project created successfully", type: "success" } }));
          router.push(`/dashboard/projects/${project.id}`);
        }}
      />
      <CreateInvoiceModal
        token={token}
        workspaceId={workspaceId}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        initialClientId={client.id}
        onSuccess={() => {
          setIsInvoiceModalOpen(false);
          window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Invoice created successfully", type: "success" } }));
        }}
      />
      <EventToast />
    </>
  );
}
