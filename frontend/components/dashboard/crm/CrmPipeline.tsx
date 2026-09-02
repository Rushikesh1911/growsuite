"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, Plus, X, Circle, CheckCircle2 } from "lucide-react";
import { Deal } from "./types";
import { DealForm } from "./DealForm";
import { DealList } from "./DealList";
import { DealDetail } from "./DealDetail";
import { DealListTable } from "./DealListTable";
import { DealDrawer } from "./DealDrawer";
import { ClientConversionModal } from "./ClientConversionModal";
import { useSocket } from "@/components/providers/SocketProvider";

interface CrmPipelineProps {
  token: string;
  workspaceId: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function CrmPipeline({ token, workspaceId }: CrmPipelineProps) {
  const [activeTab, setActiveTab] = useState<"pipeline" | "list">("pipeline");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isClientConversionModalOpen, setIsClientConversionModalOpen] = useState(false);
  const [convertingDeal, setConvertingDeal] = useState<Deal | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("create") === "true") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);
  
  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterHighProb, setFilterHighProb] = useState(false);
  const [filterHighValue, setFilterHighValue] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const activeFilterCount = (filterHighProb ? 1 : 0) + (filterHighValue ? 1 : 0) + (showArchived ? 1 : 0);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.deal-filter-container')) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Leads State
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/deals?includeArchived=${showArchived}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDeals(data);
      }
    } catch (err) {
      console.error("Failed to fetch leads", err);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId, showArchived]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Selected Deal for Inspector
  const [selectedDealId, setSelectedDealId] = useState<number | null>(null);
  
  // Auto-select deal from query params (e.g. from notifications)
  useEffect(() => {
    const dealParam = searchParams?.get("deal");
    if (dealParam && deals.length > 0 && !selectedDealId) {
      const id = parseInt(dealParam, 10);
      if (!isNaN(id) && deals.some(d => d.id === id)) {
        setSelectedDealId(id);
      }
    }
  }, [searchParams, deals, selectedDealId]);

  const selectedDeal = deals.find((d) => d.id === selectedDealId) || null;

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleDealCreated = (deal: Deal) => {
      setDeals(prev => [deal, ...prev]);
    };

    const handleDealUpdated = (updatedDeal: Deal) => {
      setDeals(prev => prev.map(d => d.id === updatedDeal.id ? updatedDeal : d));
    };

    const handleDealDeleted = ({ id }: { id: number }) => {
      setDeals(prev => prev.filter(d => d.id !== id));
      if (selectedDealId === id) setSelectedDealId(null);
    };

    socket.on('deal_created', handleDealCreated);
    socket.on('deal_updated', handleDealUpdated);
    socket.on('deal_deleted', handleDealDeleted);

    return () => {
      socket.off('deal_created', handleDealCreated);
      socket.off('deal_updated', handleDealUpdated);
      socket.off('deal_deleted', handleDealDeleted);
    };
  }, [socket, selectedDealId]);

  useEffect(() => {
    const handleRefresh = () => fetchLeads();
    window.addEventListener('refreshDeals', handleRefresh);
    return () => window.removeEventListener('refreshDeals', handleRefresh);
  }, [fetchLeads]);



  // New Deal Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newOwner, setNewOwner] = useState("Sarah Connor");

  // New Note State
  const [newNote, setNewNote] = useState("");

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCompany || !newValue) return;

    try {
      const res = await fetch(`${API_URL}/api/deals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({
          title: newTitle,
          company: newCompany,
          estimatedValue: newValue,
          contactName: newOwner,
          contactEmail: `${newOwner.toLowerCase().replace(" ", ".")}@example.com`
        }),
      });

      if (res.ok) {
        const added = await res.json();
        setDeals([added, ...deals]);
        setSelectedDealId(added.id);
        setNewTitle("");
        setNewCompany("");
        setNewValue("");
        setIsCreateModalOpen(false);
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Deal created", type: "success" } }));
      }
    } catch (err) {
      console.error("Failed to create deal", err);
    }
  };

  const handleUpdateStage = async (id: number, stage: Deal["stage"]) => {
    // Optimistic UI Update
    setDeals(
      deals.map((d) => {
        if (d.id === id) {
          return { ...d, stage };
        }
        return d;
      })
    );
    
    // Real API call
    try {
      await fetch(`${API_URL}/api/deals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ stage }),
      });
    } catch(err) {
      console.error("Failed to update deal stage", err);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedDealId) return;
    try {
      const res = await fetch(`${API_URL}/api/deals/${selectedDealId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ content: newNote.trim() }),
      });

      if (res.ok) {
        const updated = await res.json();
        setDeals(deals.map(d => d.id === selectedDealId ? updated : d));
        setNewNote("");
      } else {
        console.error("Failed to add note");
      }
    } catch(err) {
      console.error("Failed to add note", err);
    }
  };

  const handleEditDeal = async (id: number, updates: Partial<Deal>) => {
    try {
      const res = await fetch(`${API_URL}/api/deals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setDeals(deals.map(d => d.id === id ? updated : d));
        setIsEditModalOpen(false);
        window.dispatchEvent(new CustomEvent('showToast', {detail: {message: "Deal updated successfully", type: "success"}}));
      }
    } catch(err) {
      console.error("Failed to update deal", err);
    }
  };

  const handleArchiveDeal = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/deals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ archivedAt: new Date().toISOString() }),
      });
      if (res.ok) {
        setDeals(deals.map(d => d.id === id ? { ...d, archivedAt: new Date().toISOString() } : d));
        if (!showArchived) {
          setDeals(prev => prev.filter(d => d.id !== id));
          setSelectedDealId(null);
        }
        window.dispatchEvent(new CustomEvent('showToast', {detail: {message: "Deal archived", type: "success"}}));
      }
    } catch(err) {
      console.error("Failed to archive deal", err);
    }
  };

  const handleRestoreDeal = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/deals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ archivedAt: null }),
      });
      if (res.ok) {
        setDeals(deals.map(d => d.id === id ? { ...d, archivedAt: null } : d));
        window.dispatchEvent(new CustomEvent('showToast', {detail: {message: "Deal restored", type: "success"}}));
      }
    } catch(err) {
      console.error("Failed to restore deal", err);
    }
  };

  const handleConvertToClient = (id: number) => {
    const deal = deals.find(d => d.id === id);
    if (deal) {
      setConvertingDeal(deal);
      setIsClientConversionModalOpen(true);
    }
  };

  const stages: Deal["stage"][] = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];
  const kanbanStages: Deal["stage"][] = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];

  return (
    <div className="flex flex-col h-full w-full max-w-full min-w-0 animate-fade animate-duration-150">
      {/* Header */}
      <div className="flex flex-col gap-1 pb-4">
        <h1 className="text-xl font-bold text-[var(--gs-fg)] tracking-tight">Deals Pipeline</h1>
        <p className="text-sm text-[var(--gs-muted)]">Track opportunities from qualification to close.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-6 border-b border-[var(--gs-border)] mb-6">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gs-muted-light)]" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px] pl-9 pr-4 py-1.5 text-xs text-[var(--gs-fg)] placeholder-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-fg)] transition-all h-[32px]"
            />
          </div>
          {/* Filter */}
          <div className="relative deal-filter-container">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`h-[32px] px-3 flex items-center justify-center gap-1.5 rounded-[6px] text-xs border border-[var(--gs-border)] transition-colors outline-none ${
                isFilterOpen || activeFilterCount > 0
                  ? "bg-[var(--gs-surface-raised)] text-[var(--gs-fg)] border-[var(--gs-border-strong)]"
                  : "bg-[var(--gs-surface)] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)]"
              }`}
            >
              <Filter className="h-3.5 w-3.5" aria-hidden="true" />
              Filters {activeFilterCount > 0 && <span className="ml-1 bg-[var(--gs-fg)] text-[var(--gs-bg)] rounded-[4px] h-[18px] w-[18px] flex items-center justify-center text-[10px] font-bold">{activeFilterCount}</span>}
            </button>

            {isFilterOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-[var(--gs-surface-raised)] border border-[var(--gs-border-strong)] rounded-[8px] shadow-2xl z-50 p-3 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-bold text-[var(--gs-muted)] uppercase tracking-wider mb-2">Refine view</div>
                
                <div className="flex items-center gap-2.5 py-1.5 cursor-pointer group" onClick={() => setFilterHighProb(!filterHighProb)}>
                  <div className="inline-flex items-center justify-center w-4 h-4">
                    {filterHighProb ? <CheckCircle2 className="h-4 w-4 text-[var(--gs-fg)]" /> : <Circle className="h-4 w-4 text-[var(--gs-muted)]" />}
                  </div>
                  <span className="text-[13px] text-[var(--gs-fg)] group-hover:text-[var(--gs-fg-hover)] font-medium">High probability (&ge;75%)</span>
                </div>
                
                <div className="flex items-center gap-2.5 py-1.5 cursor-pointer group" onClick={() => setFilterHighValue(!filterHighValue)}>
                  <div className="inline-flex items-center justify-center w-4 h-4">
                    {filterHighValue ? <CheckCircle2 className="h-4 w-4 text-[var(--gs-fg)]" /> : <Circle className="h-4 w-4 text-[var(--gs-muted)]" />}
                  </div>
                  <span className="text-[13px] text-[var(--gs-fg)] group-hover:text-[var(--gs-fg-hover)] font-medium">Value &gt; ₹10k</span>
                </div>

                <div className="h-px w-full bg-[var(--gs-border)] my-2" />

                <div className="flex items-center gap-2.5 py-1.5 cursor-pointer group" onClick={() => setShowArchived(!showArchived)}>
                  <div className="inline-flex items-center justify-center w-4 h-4">
                    {showArchived ? <CheckCircle2 className="h-4 w-4 text-[var(--gs-fg)]" /> : <Circle className="h-4 w-4 text-[var(--gs-muted)]" />}
                  </div>
                  <span className="text-[13px] text-[var(--gs-fg)] group-hover:text-[var(--gs-fg-hover)] font-medium">Show Archived Deals</span>
                </div>

                {activeFilterCount > 0 && (
                  <button 
                    onClick={() => {
                      setFilterHighProb(false);
                      setFilterHighValue(false);
                      setShowArchived(false);
                      setIsFilterOpen(false);
                    }}
                    className="w-full mt-3 text-[11px] font-bold text-[var(--gs-muted)] hover:text-[var(--gs-fg)] text-center py-1 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex p-0.5 bg-[var(--gs-surface-raised)] border border-[var(--gs-border-strong)] rounded-[8px]">
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`px-3 py-1 text-xs font-semibold rounded-[6px] transition-colors outline-none ${
                activeTab === "pipeline" 
                  ? "bg-[var(--gs-bg-alt)] text-[var(--gs-fg)] shadow-sm" 
                  : "text-[var(--gs-muted)] hover:text-[var(--gs-fg)]"
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-3 py-1 text-xs font-semibold rounded-[6px] transition-colors outline-none ${
                activeTab === "list" 
                  ? "bg-[var(--gs-bg-alt)] text-[var(--gs-fg)] shadow-sm" 
                  : "text-[var(--gs-muted)] hover:text-[var(--gs-fg)]"
              }`}
            >
              List
            </button>
          </div>
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[var(--gs-fg)] hover:bg-[var(--gs-fg-secondary)] text-[var(--gs-bg)] px-4 py-1.5 h-[32px] rounded-[6px] text-xs font-semibold transition-colors"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            New Deal
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 min-w-0 flex gap-6 relative">
        {(() => {
          const filteredDeals = deals.filter(d => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = d.title.toLowerCase().includes(q) || d.company.toLowerCase().includes(q);
            if (!matchesSearch) return false;

            if (filterHighProb && (d.probability === null || d.probability === undefined || d.probability < 75)) return false;
            if (filterHighValue && Number(d.estimatedValue) <= 10000) return false;

            return true;
          });

          return (
            <div className={`flex-1 min-h-0 min-w-0 ${selectedDealId ? "hidden lg:block lg:max-w-[calc(100%-350px)]" : "w-full"}`}>
              {activeTab === "pipeline" ? (
                <DealList 
                  stages={kanbanStages} 
                  deals={filteredDeals} 
                  selectedDealId={selectedDealId} 
                  setSelectedDealId={setSelectedDealId} 
                  handleUpdateStage={handleUpdateStage}
                />
              ) : (
                <div className="pt-2 h-full min-w-[800px]">
                  <DealListTable 
                    deals={filteredDeals} 
                    selectedDealId={selectedDealId} 
                    onSelectDeal={setSelectedDealId} 
                  />
                </div>
              )}
            </div>
          );
        })()}

        {/* Inspector (Conditional side panel) */}
        {selectedDealId && selectedDeal && (
          <div className="w-full lg:w-[350px] shrink-0 border border-[var(--gs-border)] bg-[var(--gs-surface-raised)] rounded-[12px] overflow-hidden flex flex-col h-full absolute lg:relative top-0 right-0 bottom-0 z-10 shadow-2xl lg:shadow-none animate-in slide-in-from-right-4">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--gs-border)]">
              <h3 className="text-sm font-semibold text-[var(--gs-fg)]">Deal Details</h3>
              <button 
                onClick={() => setSelectedDealId(null)}
                className="p-1 text-[var(--gs-muted)] hover:text-[var(--gs-fg)] rounded-full hover:bg-[var(--gs-bg-alt)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DealDetail 
                selectedDeal={selectedDeal}
                stages={stages}
                handleUpdateStage={handleUpdateStage}
                newNote={newNote}
                setNewNote={setNewNote}
                handleAddNote={handleAddNote}
                handleConvertToClient={handleConvertToClient}
                onEdit={() => setIsEditModalOpen(true)}
                onArchive={handleArchiveDeal}
                handleRestoreDeal={handleRestoreDeal}
              />
            </div>
          </div>
        )}
      </div>

      {isEditModalOpen && selectedDeal && (
        <DealDrawer
          token={token}
          workspaceId={workspaceId}
          dealId={selectedDeal.id}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            window.dispatchEvent(new Event("refreshDeals"));
          }}
        />
      )}

      {isClientConversionModalOpen && convertingDeal && (
        <ClientConversionModal
          token={token}
          workspaceId={workspaceId}
          isOpen={isClientConversionModalOpen}
          onClose={() => setIsClientConversionModalOpen(false)}
          deal={convertingDeal}
          onSuccess={(clientId) => {
            setDeals(deals.map(d => d.id === convertingDeal.id ? { ...d, convertedToClientId: clientId } : d));
            window.location.href = `/dashboard/clients/${clientId}`;
          }}
        />
      )}

      {/* New Deal Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[var(--gs-surface-raised)] border border-[var(--gs-border-strong)] shadow-2xl rounded-[12px] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--gs-border)]">
              <h2 className="text-lg font-bold text-[var(--gs-fg)] tracking-tight">Create New Deal</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[var(--gs-muted)] hover:text-[var(--gs-fg)] p-1 rounded-[6px] hover:bg-[var(--gs-bg-alt)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">
              <DealForm 
                newTitle={newTitle} setNewTitle={setNewTitle}
                newCompany={newCompany} setNewCompany={setNewCompany}
                newValue={newValue} setNewValue={setNewValue}
                handleCreateDeal={handleCreateDeal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
