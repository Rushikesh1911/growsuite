"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Plus, Building2, MoreHorizontal, X, User, UserPlus, Filter, Mail, Phone, ExternalLink, Globe, Code } from "lucide-react";
import { downloadCSV } from "@/lib/csv";
import { PopoverSelect } from "@/components/ui/popover-select";
import { Card } from "@/components/ui/card";
import { ConvertDealModal } from "./ConvertDealModal";
import { LeadDrawer } from "./LeadDrawer";
import { ImportCsvModal } from "../shared/ImportCsvModal";
import { WebToLeadModal } from "./WebToLeadModal";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useSocket } from "@/components/providers/SocketProvider";

interface Lead {
  id: number;
  contactName: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  updatedAt: string;
  convertedDealId: number | null;
}

interface LeadDirectoryProps {
  token: string;
  workspaceId: number;
}

export function LeadDirectory({ token, workspaceId }: LeadDirectoryProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ contactName: "", company: "", email: "", phone: "", source: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isWebToLeadModalOpen, setIsWebToLeadModalOpen] = useState(false);

  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [emailModalLead, setEmailModalLead] = useState<Lead | null>(null);
  const [editModalLead, setEditModalLead] = useState<Lead | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams?.get("create") === "true") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/leads`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId]);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleLeadCreated = (lead: Lead) => {
      setLeads(prev => [lead, ...prev]);
    };

    const handleLeadUpdated = (updatedLead: Lead) => {
      setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    };

    const handleLeadDeleted = ({ id }: { id: number }) => {
      setLeads(prev => prev.filter(l => l.id !== id));
    };

    socket.on('lead_created', handleLeadCreated);
    socket.on('lead_updated', handleLeadUpdated);
    socket.on('lead_deleted', handleLeadDeleted);

    return () => {
      socket.off('lead_created', handleLeadCreated);
      socket.off('lead_updated', handleLeadUpdated);
      socket.off('lead_deleted', handleLeadDeleted);
    };
  }, [socket]);

  useEffect(() => {
    fetchLeads();
    const handleRefresh = () => fetchLeads();
    window.addEventListener("refreshData", handleRefresh);
    return () => window.removeEventListener("refreshData", handleRefresh);
  }, [fetchLeads]);

  // click outside action menu or filter menu to close
  useEffect(() => {
    const handleClick = () => {
      setActionMenuOpenId(null);
      setIsFilterOpen(false);
    };
    if (actionMenuOpenId !== null || isFilterOpen) {
      document.addEventListener('click', handleClick);
    }
    return () => document.removeEventListener('click', handleClick);
  }, [actionMenuOpenId, isFilterOpen]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify(newLead),
      });
      
      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewLead({ contactName: "", company: "", email: "", phone: "", source: "", notes: "" });
        fetchLeads();
        window.dispatchEvent(new Event("refreshData"));
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Lead added to directory", type: "success" } }));
      }
    } catch (error) {
      console.error("Failed to create lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportLeads = async (data: any[]) => {
    const res = await fetch(`http://localhost:5000/api/leads/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-workspace-id": workspaceId.toString(),
      },
      body: JSON.stringify({ leads: data }),
    });
    
    if (res.ok) {
      const result = await res.json();
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: `Successfully imported ${result.count} leads`, type: "success" } }));
      fetchLeads();
    } else {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to import leads");
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/leads/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchLeads();
        window.dispatchEvent(new Event("refreshData"));
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleConvertDeal = async (leadId: number, title: string, estimatedValue: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/leads/${leadId}/convert-to-deal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ title, estimatedValue }),
      });
      if (res.ok) {
        setConvertingLead(null);
        fetchLeads();
        window.dispatchEvent(new Event("refreshData"));
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Deal successfully created!", type: "success" } }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailModalLead) return;
    setSendingEmail(true);
    try {
      const res = await fetch(`http://localhost:5000/api/leads/${emailModalLead.id}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ subject: emailSubject, body: emailBody }),
      });
      if (res.ok) {
        setEmailModalLead(null);
        setEmailSubject("");
        setEmailBody("");
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Email sent successfully!", type: "success" } }));
      } else {
        const data = await res.json();
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: data.error || "Failed to send email", type: "error" } }));
      }
    } catch(err) {
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Network error", type: "error" } }));
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDeleteLead = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ archivedAt: new Date().toISOString() })
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Lead deleted", type: "success" } }));
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkArchive = async () => {
    if (!confirm(`Are you sure you want to archive ${selectedIds.length} lead(s)?`)) return;
    try {
      const res = await fetch(`/api/leads/bulk-archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Leads archived", type: "success" } }));
        setSelectedIds([]);
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkExport = () => {
    const selectedLeads = leads.filter(l => selectedIds.includes(l.id)).map(l => ({
      ID: l.id,
      Name: l.contactName,
      Company: l.company || "",
      Email: l.email || "",
      Phone: l.phone || "",
      Source: l.source || "",
      Status: l.status
    }));

    if (selectedLeads.length > 0) {
      downloadCSV(selectedLeads, `growsuite-leads-${new Date().toISOString().split('T')[0]}.csv`);
      window.dispatchEvent(new CustomEvent('showToast', {detail: {message: `Exported ${selectedLeads.length} leads`, type: "success"}}));
      setSelectedIds([]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.contactName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (l.company && l.company.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterStatus ? l.status === filterStatus : true;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: "bg-[var(--gs-bg-alt)] text-[var(--gs-fg)]",
      CONTACTED: "bg-[#007CF0]/20 text-[#007CF0]",
      QUALIFIED: "bg-[#F5A623]/20 text-[#F5A623]",
      DISQUALIFIED: "bg-red-500/20 text-red-500",
    };
    return colors[status] || colors.NEW;
  };

  const getTimeAgo = (dateStr: string) => {
    const ms = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--gs-border)] pb-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-[var(--gs-fg)] tracking-tight">Leads</h1>
          <p className="text-sm text-[var(--gs-muted)]">Manage prospects before they enter your sales pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsWebToLeadModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[var(--gs-surface)] border border-[var(--gs-border)] hover:bg-[var(--gs-bg-alt)] text-[var(--gs-fg)] px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors"
          >
            <Code className="h-4 w-4" />
            Web Form
          </button>
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[var(--gs-surface)] border border-[var(--gs-border)] hover:bg-[var(--gs-bg-alt)] text-[var(--gs-fg)] px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors"
          >
            Import CSV
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[var(--gs-fg)] hover:bg-[#FFFFFF] text-[var(--gs-bg)] px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gs-muted)]" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[6px] pl-9 pr-4 py-2 text-[13px] text-[var(--gs-fg)] placeholder-[var(--gs-muted-light)] focus:outline-none focus:border-[var(--gs-muted)] transition-all"
          />
        </div>
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); setActionMenuOpenId(null); }}
            className={`h-[38px] px-4 rounded-[6px] border border-[var(--gs-border)] text-[13px] font-medium transition-colors ${filterStatus ? 'bg-[var(--gs-fg)] text-[var(--gs-bg)]' : 'bg-[var(--gs-bg-alt)] text-[var(--gs-fg)] hover:bg-[var(--gs-border)]'}`}
          >
            {filterStatus ? `Status: ${filterStatus}` : 'Filter'}
          </button>
          
          {isFilterOpen && (
            <div className="absolute right-0 top-11 w-48 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] shadow-xl z-20 py-1" onClick={(e) => e.stopPropagation()}>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[var(--gs-muted)] uppercase tracking-wider">Filter by Status</div>
              <button onClick={() => { setFilterStatus(null); setIsFilterOpen(false); }} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors flex justify-between items-center">
                All Statuses {filterStatus === null && <span className="text-[10px]">✓</span>}
              </button>
              {['NEW', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED'].map(status => (
                <button 
                  key={status}
                  onClick={() => { setFilterStatus(status); setIsFilterOpen(false); }} 
                  className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors flex justify-between items-center"
                >
                  {status} {filterStatus === status && <span className="text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

        {/* Bulk action alert panel */}
        {selectedIds.length > 0 && (
          <div className="px-3 py-1.5 bg-[var(--gs-surface-raised)] border border-[var(--gs-border)] rounded-[8px] flex items-center justify-between text-[12px] text-[var(--gs-fg)] font-medium animate-in fade-in slide-in-from-top-2 duration-150" role="alert">
            <span className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-[var(--gs-fg)] text-[var(--gs-bg)] text-[10px] font-bold">
                {selectedIds.length}
              </span>
              lead{selectedIds.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-1.5">
              <button
                className="h-[24px] text-[11px] px-2 rounded-[4px] text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors outline-none"
                onClick={handleBulkExport}
              >
                Export
              </button>
              <button
                className="h-[24px] text-[11px] px-2 rounded-[4px] text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors outline-none"
                onClick={handleBulkArchive}
              >
                Archive
              </button>
              <div className="w-px h-3 bg-[var(--gs-border)] mx-1"></div>
              <button
                className="h-[24px] text-[11px] px-2 rounded-[4px] text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors outline-none"
                onClick={() => setSelectedIds([])}
              >
                Clear
              </button>
            </div>
          </div>
        )}

      {/* Table */}
      <div className="bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[12px] overflow-hidden shadow-sm">
        {loading ? (
          <TableSkeleton />
        ) : leads.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-[var(--gs-bg-alt)] flex items-center justify-center mb-4 border border-[var(--gs-border)]">
              <User className="h-5 w-5 text-[var(--gs-muted)]" />
            </div>
            <h3 className="text-[var(--gs-fg)] font-semibold text-sm">No leads found</h3>
            <p className="text-[var(--gs-muted)] text-xs mt-1">Add your first prospect.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--gs-border)] bg-[var(--gs-bg-alt)]">
                  <th className="w-[40px] px-4 py-3 text-left">
                    <input 
                      type="checkbox" 
                      className="h-3.5 w-3.5 rounded-[3px] border-[var(--gs-border-strong)] bg-transparent text-[var(--gs-fg)] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      checked={filteredLeads.length > 0 && selectedIds.length === filteredLeads.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider whitespace-nowrap">Contact</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[var(--gs-muted)] uppercase tracking-wider">Company</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[var(--gs-muted)] uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[var(--gs-muted)] uppercase tracking-wider">Source</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[var(--gs-muted)] uppercase tracking-wider text-right">Last Activity</th>
                  <th className="px-5 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gs-border)]">
                {filteredLeads.map((lead, index) => (
                  <tr key={lead.id} className={`border-b border-[var(--gs-border)] last:border-b-0 hover:bg-[var(--gs-bg-alt)] transition-colors ${selectedIds.includes(lead.id) ? 'bg-[var(--gs-bg-alt)]' : ''}`}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        className="h-3.5 w-3.5 rounded-[3px] border-[var(--gs-border-strong)] bg-transparent text-[var(--gs-fg)] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        checked={selectedIds.includes(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-[var(--gs-fg)]">{lead.contactName}</span>
                        <span className="text-[12px] text-[var(--gs-muted)]">{lead.email || "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 text-[13px] text-[var(--gs-muted)]">
                        {lead.company && <Building2 className="h-3.5 w-3.5 shrink-0" />}
                        {lead.company || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] text-[var(--gs-muted)]">{lead.source || "—"}</span>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-[var(--gs-muted)] text-right">
                      {getTimeAgo(lead.updatedAt)}
                    </td>
                    <td className="px-5 py-3 text-right relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActionMenuOpenId(actionMenuOpenId === lead.id ? null : lead.id); }}
                        className="text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none p-1"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      
                      {actionMenuOpenId === lead.id && (
                        <div className="absolute right-8 top-8 w-40 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] shadow-xl z-50 py-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                          {lead.convertedDealId ? (
                            <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'pipeline' }))} className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors flex items-center justify-between">
                              View Deal <span>→</span>
                            </button>
                          ) : (
                            <>
                              <button onClick={() => router.push(`/dashboard/leads/${lead.id}`)} className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors flex items-center justify-between">
                                View details <span>→</span>
                              </button>
                              <button onClick={() => { setEditModalLead(lead); setActionMenuOpenId(null); }} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors">Edit lead</button>
                              <div className="h-px w-full bg-[var(--gs-border)] my-1" />
                              
                              {lead.status === 'DISQUALIFIED' ? (
                                <>
                                  <button onClick={() => handleUpdateStatus(lead.id, 'NEW')} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors">Reopen lead</button>
                                  <div className="h-px w-full bg-[var(--gs-border)] my-1" />
                                  <button onClick={() => handleDeleteLead(lead.id)} className="w-full text-left px-3 py-1.5 text-[12px] text-red-400 hover:bg-[var(--gs-bg-alt)] transition-colors">Delete lead</button>
                                </>
                              ) : (
                                <>
                                  {lead.status === 'NEW' && (
                                    <button onClick={() => handleUpdateStatus(lead.id, 'CONTACTED')} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors">Mark Contacted</button>
                                  )}
                                  
                                  {lead.email && (
                                    <button onClick={() => { setEmailModalLead(lead); setActionMenuOpenId(null); }} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors flex items-center justify-between">
                                      Send Email <Mail className="h-3 w-3" />
                                    </button>
                                  )}

                                  {(lead.status === 'NEW' || lead.status === 'CONTACTED') && (
                                    <button onClick={() => handleUpdateStatus(lead.id, 'QUALIFIED')} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors">Qualify</button>
                                  )}
                                  {lead.status === 'QUALIFIED' && (
                                    <button onClick={() => { setConvertingLead(lead); setActionMenuOpenId(null); }} className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors flex items-center justify-between">
                                      Create Deal <span>→</span>
                                    </button>
                                  )}
                                  
                                  <div className="h-px w-full bg-[var(--gs-border)] my-1" />
                                  <button onClick={() => handleUpdateStatus(lead.id, 'DISQUALIFIED')} className="w-full text-left px-3 py-1.5 text-[12px] text-red-400 hover:bg-[var(--gs-bg-alt)] transition-colors">Disqualify</button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Spacer to prevent action menu clipping in overflow container */}
            {actionMenuOpenId !== null && <div className="h-48 w-full" />}
          </div>
        )}
      </div>

      <ConvertDealModal 
        lead={convertingLead}
        isOpen={!!convertingLead}
        onClose={() => setConvertingLead(null)}
        onConvert={handleConvertDeal}
      />

      {/* Create Lead Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[12px] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--gs-border)] flex items-center justify-between bg-[var(--gs-surface)]">
              <h2 className="text-[15px] font-semibold text-[var(--gs-fg)]">Add New Lead</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateLead} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[var(--gs-muted)]">Contact Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={newLead.contactName}
                  onChange={(e) => setNewLead({...newLead, contactName: e.target.value})}
                  className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)]"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[var(--gs-muted)]">Company</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={newLead.company}
                  onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                  className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[var(--gs-muted)]">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)]"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[var(--gs-muted)]">Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 555-0000"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                    className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)]"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[var(--gs-muted)]">Source</label>
                <div className="w-full border border-[var(--gs-border)] rounded-[6px] bg-[var(--gs-surface)]">
                  <PopoverSelect
                    value={newLead.source || ""}
                    onChange={(val) => setNewLead({...newLead, source: val})}
                    placeholder="Select source..."
                    className="w-full justify-between px-3 py-2 text-[13px] text-[var(--gs-fg)] bg-transparent hover:bg-transparent"
                    options={[
                      { label: "Website", value: "Website" },
                      { label: "Referral", value: "Referral" },
                      { label: "LinkedIn", value: "LinkedIn" },
                      { label: "Cold Outreach", value: "Cold Outreach" },
                      { label: "Other", value: "Other" },
                    ]}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[var(--gs-muted)]">Notes</label>
                <textarea
                  placeholder="Optional notes about this lead..."
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)] resize-none h-16"
                />
              </div>

              <div className="pt-4 mt-2 border-t border-[var(--gs-border)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[var(--gs-fg)] hover:bg-[#FFFFFF] text-[#000000] px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {emailModalLead && (
        <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[12px] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--gs-border)] flex items-center justify-between bg-[var(--gs-surface)]">
              <h2 className="text-[15px] font-semibold text-[var(--gs-fg)]">Send Email to {emailModalLead.contactName}</h2>
              <button onClick={() => { setEmailModalLead(null); setEmailSubject(""); setEmailBody(""); }} className="text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSendEmail} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[var(--gs-muted)]">To</label>
                <input
                  type="text"
                  disabled
                  value={emailModalLead.email || ""}
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
                  placeholder="Type your personal email message here..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)] resize-none h-48"
                />
              </div>

              <div className="pt-4 mt-2 border-t border-[var(--gs-border)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setEmailModalLead(null); setEmailSubject(""); setEmailBody(""); }}
                  className="px-4 py-2 text-[13px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail || !emailSubject || !emailBody}
                  className="bg-[var(--gs-fg)] hover:bg-[#FFFFFF] text-[#000000] px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {sendingEmail ? "Sending..." : "Send Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Lead Modal */}
      {editModalLead && (
        <LeadDrawer
          token={token}
          workspaceId={workspaceId}
          leadId={editModalLead.id}
          onClose={() => setEditModalLead(null)}
          onSuccess={() => {
            setEditModalLead(null);
            fetchLeads();
          }}
        />
      )}

      {/* Modals */}
      <ConvertDealModal
        isOpen={!!convertingLead}
        onClose={() => setConvertingLead(null)}
        onConfirm={handleConvertDeal}
        leadName={convertingLead?.contactName || ""}
      />
      <ImportCsvModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={async () => { window.dispatchEvent(new Event('refreshData')); }}
        type="leads"
      />
      <WebToLeadModal
        isOpen={isWebToLeadModalOpen}
        onClose={() => setIsWebToLeadModalOpen(false)}
        workspaceId={workspaceId}
      />
    </div>
  );
}
