"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Plus, Filter, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { downloadCSV } from "@/lib/csv";
import { useSocket } from "@/components/providers/SocketProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImportCsvModal } from "../shared/ImportCsvModal";
import { Client, SortField, SortOrder } from "./types";
import { ClientTable } from "./ClientTable";
import { CreateClientModal } from "./CreateClientModal";
import { EditClientModal } from "./EditClientModal";

interface ClientDirectoryProps {
  token: string;
  workspaceId: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function ClientDirectory({ token, workspaceId }: ClientDirectoryProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editModalClient, setEditModalClient] = useState<Client | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("create") === "true") {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  // Filtering State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterHasProjects, setFilterHasProjects] = useState(false);
  const [filterHasBalance, setFilterHasBalance] = useState(false);
  const activeFilterCount = (filterHasProjects ? 1 : 0) + (filterHasBalance ? 1 : 0);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-container')) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sorting
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Form State
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error("Failed to fetch clients", err);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId]);

  const { socket } = useSocket();

  useEffect(() => {
    fetchClients();
    
    const handleRefresh = () => fetchClients();
    window.addEventListener("refreshData", handleRefresh);

    if (socket) {
      socket.on('client_created', handleRefresh);
      socket.on('client_updated', handleRefresh);
      socket.on('client_deleted', handleRefresh);
    }

    return () => {
      window.removeEventListener("refreshData", handleRefresh);
      if (socket) {
        socket.off('client_created', handleRefresh);
        socket.off('client_updated', handleRefresh);
        socket.off('client_deleted', handleRefresh);
      }
    };
  }, [fetchClients, socket]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleArchiveClient = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/clients/${id}/archive`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        fetchClients();
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Client archived", type: "success" } }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch(`${API_URL}/api/clients/bulk-archive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ clientIds: selectedIds }),
      });
      if (res.ok) {
        fetchClients();
        setSelectedIds([]);
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Clients archived", type: "success" } }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportClients = async (data: any[]) => {
    const res = await fetch(`http://localhost:5000/api/clients/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-workspace-id": workspaceId.toString(),
      },
      body: JSON.stringify({ clients: data }),
    });
    
    if (res.ok) {
      const result = await res.json();
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: `Successfully imported ${result.count} clients`, type: "success" } }));
      fetchClients();
    } else {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to import clients");
    }
  };

  const handleBulkExport = () => {
    const selectedClients = clients.filter(c => selectedIds.includes(c.id)).map(c => ({
      ID: c.id,
      Name: c.name,
      Company: c.company || "",
      Email: c.email || "",
      Status: c.archivedAt ? "Archived" : "Active",
      Projects: c.projects?.length || 0,
      TotalValue: c.invoices?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0
    }));

    if (selectedClients.length > 0) {
      downloadCSV(selectedClients, `growsuite-clients-${new Date().toISOString().split('T')[0]}.csv`);
      window.dispatchEvent(new CustomEvent('showToast', {detail: {message: `Exported ${selectedClients.length} clients`, type: "success"}}));
      setSelectedIds([]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredClients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredClients.map((u) => u.id));
    }
  };

  const toggleSelectClient = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredClients = clients
    .filter((client) => {
      // 1. Keyword search
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        client.name.toLowerCase().includes(q) ||
        client.company.toLowerCase().includes(q) ||
        (client.email ? client.email.toLowerCase().includes(q) : false);
        
      if (!matchesSearch) return false;
      
      // 2. State filters
      if (filterHasProjects && (client.projects?.length || 0) === 0) return false;
      
      if (filterHasBalance) {
        const balance = client.invoices?.reduce((sum, inv) => sum + Number(inv.balanceDue), 0) || 0;
        if (balance === 0) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "company") {
        comparison = a.company.localeCompare(b.company);
      } else if (sortField === "updatedAt") {
        comparison = new Date(a.updatedAt || a.createdAt).getTime() - new Date(b.updatedAt || b.createdAt).getTime();
      } else if (sortField === "projects") {
        comparison = (a.projects?.length || 0) - (b.projects?.length || 0);
      } else if (sortField === "outstanding") {
        const outA = a.invoices?.reduce((sum, inv) => sum + Number(inv.balanceDue), 0) || 0;
        const outB = b.invoices?.reduce((sum, inv) => sum + Number(inv.balanceDue), 0) || 0;
        comparison = outA - outB;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      const res = await fetch(`${API_URL}/api/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        const added = await res.json();
        setClients([added, ...clients]);
        setName("");
        setIsModalOpen(false);
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Client successfully added", type: "success" } }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full select-none animate-fade animate-duration-150">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--gs-fg)] tracking-tight">Clients</h2>
          <p className="text-xs text-[var(--gs-muted)] mt-0.5">Manage customers, projects, billing, and relationships.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="h-[32px] rounded-[6px] gap-1.5 font-semibold text-xs border border-[var(--gs-border)] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] bg-[var(--gs-surface)]" onClick={() => setIsImportModalOpen(true)}>
            Import CSV
          </Button>
          <Button variant="default" size="sm" className="h-[32px] rounded-[6px] gap-1.5 font-semibold text-xs bg-[var(--gs-fg)] text-[var(--gs-bg)] hover:bg-[var(--gs-fg-secondary)]" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Filter and Grid Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm" role="search">
          <label htmlFor="client-search" className="sr-only">Search clients</label>
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--gs-muted-light)]" aria-hidden="true" />
          <input
            id="client-search"
            type="search"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px] pl-9 pr-3 py-1.5 text-xs text-[var(--gs-fg)] placeholder-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-fg)] transition-all h-[32px]"
          />
        </div>
        <div className="relative filter-container">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`h-[32px] px-3 flex items-center justify-center rounded-[6px] gap-1.5 text-xs border-[var(--gs-border)] transition-colors border outline-none ${
              isFilterOpen || activeFilterCount > 0 
                ? "bg-[var(--gs-surface-raised)] text-[var(--gs-fg)] border-[var(--gs-border-strong)]" 
                : "bg-[var(--gs-surface)] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)]"
            }`}
          >
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            Filters {activeFilterCount > 0 && <span className="ml-1 bg-[var(--gs-fg)] text-[var(--gs-bg)] rounded-[4px] h-[18px] w-[18px] flex items-center justify-center text-[10px] font-bold">{activeFilterCount}</span>}
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[var(--gs-surface-raised)] border border-[var(--gs-border-strong)] rounded-[8px] shadow-2xl z-50 p-3 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] font-bold text-[var(--gs-muted)] uppercase tracking-wider mb-2">Refine view</div>
              
              <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                <div 
                  role="checkbox"
                  aria-checked={filterHasProjects}
                  tabIndex={0}
                  onClick={() => setFilterHasProjects(!filterHasProjects)}
                  className={`w-4 h-4 rounded-[4px] border cursor-pointer flex items-center justify-center transition-colors ${filterHasProjects ? 'bg-[var(--gs-fg)] border-[var(--gs-fg)]' : 'border-[var(--gs-border-strong)] group-hover:border-[var(--gs-muted)]'}`}
                >
                  {filterHasProjects && <CheckCircle2 className="h-3 w-3 text-[var(--gs-bg)]" strokeWidth={3} />}
                </div>
                <span className="text-[13px] text-[var(--gs-fg)] group-hover:text-[var(--gs-fg-hover)] font-medium">Has active projects</span>
              </label>
              
              <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                <div 
                  role="checkbox"
                  aria-checked={filterHasBalance}
                  tabIndex={0}
                  onClick={() => setFilterHasBalance(!filterHasBalance)}
                  className={`w-4 h-4 rounded-[4px] border cursor-pointer flex items-center justify-center transition-colors ${filterHasBalance ? 'bg-[var(--gs-fg)] border-[var(--gs-fg)]' : 'border-[var(--gs-border-strong)] group-hover:border-[var(--gs-muted)]'}`}
                >
                  {filterHasBalance && <CheckCircle2 className="h-3 w-3 text-[var(--gs-bg)]" strokeWidth={3} />}
                </div>
                <span className="text-[13px] text-[var(--gs-fg)] group-hover:text-[var(--gs-fg-hover)] font-medium">Outstanding balance</span>
              </label>
              
              {activeFilterCount > 0 && (
                <div className="mt-2 pt-2 border-t border-[var(--gs-border)] text-right">
                  <button 
                    onClick={() => { setFilterHasProjects(false); setFilterHasBalance(false); setIsFilterOpen(false); }}
                    className="text-[11px] font-semibold text-[var(--gs-muted)] hover:text-[var(--gs-fg)] outline-none"
                  >
                    Clear filters
                  </button>
                </div>
              )}
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
            client{selectedIds.length > 1 ? "s" : ""} selected
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

      {/* Table Container */}
      <Card className="flex flex-col bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[12px] shadow-none">
        <ClientTable 
          filteredClients={filteredClients}
          selectedIds={selectedIds}
          loading={loading}
          toggleSelectAll={toggleSelectAll}
          toggleSelectClient={toggleSelectClient}
          handleSort={handleSort}
          onEdit={(c) => setEditModalClient(c)}
          onArchive={handleArchiveClient}
        />
      </Card>

      {/* Pagination representation - only show if there are enough items */}
      {clients.length > 20 && (
        <div className="flex items-center justify-between text-xs text-[var(--gs-muted)] font-semibold mt-2 select-none" aria-live="polite">
          <span>Showing {filteredClients.length} of {clients.length} clients</span>
          <div className="flex items-center gap-1">
            <Button aria-label="Previous page" variant="secondary" size="sm" className="h-[28px] w-[28px] p-0 rounded-[6px] bg-[var(--gs-surface)] border-[var(--gs-border)] opacity-50" disabled>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button aria-label="Next page" variant="secondary" size="sm" className="h-[28px] w-[28px] p-0 rounded-[6px] bg-[var(--gs-surface)] border-[var(--gs-border)] opacity-50" disabled>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <CreateClientModal 
          token={token}
          workspaceId={workspaceId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => fetchClients()}
        />
      )}

      {editModalClient && (
        <EditClientModal
          token={token}
          workspaceId={workspaceId}
          client={editModalClient}
          onClose={() => setEditModalClient(null)}
          onSuccess={() => fetchClients()}
        />
      )}

      <ImportCsvModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportClients}
        type="clients"
      />
    </div>
  );
}
