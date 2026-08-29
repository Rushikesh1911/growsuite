"use client";

import { useState, useEffect } from "react";
import { Clock, Plus, Play, Square, CheckCircle2, FileText, Trash2, ArrowRight, MoreVertical } from "lucide-react";
import { PopoverSelect } from "@/components/ui/popover-select";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { CreateInvoiceModal } from "@/components/dashboard/finance/CreateInvoiceModal";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface TimeEntry {
  id: number;
  description: string | null;
  duration: number;
  startTime: string | null;
  endTime: string | null;
  billable: boolean;
  createdAt: string;
  project?: { id: number; name: string; hourlyRate: number | null } | null;
  task?: { id: number; title: string } | null;
  invoice?: { id: number; invoiceNumber: string } | null;
  user?: { id: number; hourlyRate: number | null } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function TimeTracker() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  // Invoice Generation State
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceTimeEntryIds, setInvoiceTimeEntryIds] = useState<number[]>([]);
  const [invoiceInitialItems, setInvoiceInitialItems] = useState<{ id: string; description: string; quantity: number; unitPrice: number; }[]>([]);
  const [invoiceClientId, setInvoiceClientId] = useState<number | undefined>(undefined);
  const [invoiceProjectId, setInvoiceProjectId] = useState<number | undefined>(undefined);

  // Manual entry state
  const [isAdding, setIsAdding] = useState(false);
  const [desc, setDesc] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [durationMins, setDurationMins] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [dateStr, setDateStr] = useState(new Date().toISOString().split("T")[0]);
  const [billable, setBillable] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    if (!projectId) {
      setBillable(false);
    }
  }, [projectId]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("growsuite_token");
      const workspaceId = localStorage.getItem("growsuite_workspace_id");
      if (!token || !workspaceId) return;

      const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}/time-entries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }

      // Fetch projects for the dropdown
      const projRes = await fetch(`${API_URL}/api/projects`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId
        }
      });
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = async () => {
    try {
      const token = localStorage.getItem("growsuite_token");
      const workspaceId = localStorage.getItem("growsuite_workspace_id");
      if (!token || !workspaceId) return;

      // Parse duration
      const hrs = parseInt(durationHours) || 0;
      const mins = parseInt(durationMins) || 0;
      const durationInSeconds = (hrs * 3600) + (mins * 60);

      if (isNaN(durationInSeconds) || durationInSeconds <= 0) return;

      const startTime = dateStr ? new Date(dateStr) : new Date();

      const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}/time-entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          isTimer: false,
          description: desc,
          duration: durationInSeconds,
          startTime: startTime.toISOString(),
          projectId: projectId ? parseInt(projectId) : undefined,
          billable: billable,
        })
      });

      if (res.ok) {
        setDesc("");
        setDurationHours("");
        setDurationMins("");
        setProjectId("");
        setIsAdding(false);
        fetchEntries();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("growsuite_token");
      const workspaceId = localStorage.getItem("growsuite_workspace_id");
      if (!token || !workspaceId) return;

      const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}/time-entries/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setEntries(entries.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const generateInvoiceForEntries = (entriesToInvoice: TimeEntry[]) => {
    const unbilled = entriesToInvoice.filter(e => !e.invoice && e.billable);
    if (unbilled.length === 0) {
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "No unbilled entries selected.", type: "error" } }));
      return;
    }

    const projIds = Array.from(new Set(unbilled.map(e => e.project?.id).filter(Boolean)));
    if (projIds.length > 1) {
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Please select entries from the same project.", type: "error" } }));
      return;
    }
    if (projIds.length === 0) {
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Please assign a project to these entries first.", type: "error" } }));
      return;
    }

    const projId = projIds[0];
    const project = projects.find(p => p.id === projId);
    if (!project) return;

    const initialItems = unbilled.map(entry => {
      const rateInCents = entry.project?.hourlyRate || entry.user?.hourlyRate || 0;
      const rate = rateInCents / 100;
      const hours = parseFloat((entry.duration / 3600).toFixed(2));
      return {
        id: Date.now().toString() + Math.random(),
        description: entry.description || "General Work",
        quantity: hours,
        unitPrice: rate,
      };
    });

    setInvoiceTimeEntryIds(unbilled.map(e => e.id));
    setInvoiceInitialItems(initialItems);
    setInvoiceClientId(project.clientId);
    setInvoiceProjectId(project.id);
    setInvoiceModalOpen(true);
  };

  const generateInvoice = async () => {
    const selectedEntries = entries.filter(e => selectedIds.has(e.id));
    generateInvoiceForEntries(selectedEntries);
  };

  return (
    <div className="flex flex-col gap-6 text-[var(--gs-fg)]">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--gs-border)]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Time Tracking</h1>
          <p className="text-[13px] text-[var(--gs-muted)] mt-1">Review timesheets and log hours.</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <button
              onClick={generateInvoice}
              className="bg-[var(--gs-fg)] text-black px-4 py-2 rounded-md text-[13px] font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Generate Invoice ({selectedIds.size})
            </button>
          )}
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-[var(--gs-surface)] border border-[var(--gs-border)] hover:border-[var(--gs-border-strong)] hover:bg-[var(--gs-bg-alt)] text-[var(--gs-fg)] px-4 py-2 rounded-[6px] text-[13px] font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Log Time
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {isAdding && (
          <div className="bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-xl p-4 flex flex-col gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
            
            <div className="flex items-end gap-4">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[var(--gs-muted)] font-medium">What did you work on?</label>
                <input 
                  type="text" 
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="e.g. Design reviews"
                  className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] h-10 px-3 text-[13px] text-[var(--gs-fg)] placeholder:text-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
                />
              </div>

              <div className="w-48 flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[var(--gs-muted)] font-medium">Project</label>
                <div className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] h-10 flex items-center">
                  <PopoverSelect
                    value={projectId}
                    onChange={(val) => setProjectId(val)}
                    placeholder="No Project"
                    className="w-full justify-between px-3 h-full text-[13px] text-[var(--gs-fg)] bg-transparent hover:bg-transparent font-normal"
                    options={[
                      { label: "No Project", value: "" },
                      ...projects.map(p => ({
                        label: p.name,
                        value: p.id.toString(),
                      }))
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-end gap-4">
              <div className="w-40 flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[var(--gs-muted)] font-medium">Date</label>
                <input 
                  type="date"
                  value={dateStr}
                  onChange={e => setDateStr(e.target.value)}
                  className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] h-10 px-3 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
                />
              </div>

              <div className="w-32 flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[var(--gs-muted)] font-medium">Duration</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    min="0"
                    placeholder="HH"
                    value={durationHours}
                    onChange={e => setDurationHours(e.target.value)}
                    className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] h-10 px-2 text-center text-[13px] text-[var(--gs-fg)] placeholder:text-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
                  />
                  <span className="text-[var(--gs-muted)] font-bold">:</span>
                  <input 
                    type="number"
                    min="0"
                    max="59"
                    placeholder="MM"
                    value={durationMins}
                    onChange={e => setDurationMins(e.target.value)}
                    className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] h-10 px-2 text-center text-[13px] text-[var(--gs-fg)] placeholder:text-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 h-10 px-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={billable}
                  onClick={() => projectId && setBillable(!billable)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none outline-none mt-0.5 ${!projectId ? 'opacity-50 cursor-not-allowed bg-[var(--gs-border)]' : billable ? 'bg-[#28CA41]' : 'bg-[#262626]'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out bg-white ${billable ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
                <label className={`text-[13px] font-medium ${!projectId ? 'text-[var(--gs-muted)] cursor-not-allowed' : 'text-[var(--gs-fg)] cursor-pointer'}`} onClick={() => projectId && setBillable(!billable)}>Billable</label>
              </div>

              <div className="flex-1" />

              <button 
                onClick={handleManualAdd}
                disabled={(!durationHours && !durationMins) || !desc}
                className="bg-[var(--gs-fg)] text-[var(--gs-bg)] h-10 px-6 rounded-[6px] text-[13px] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Add Entry
              </button>
            </div>
          </div>
        )}

        <div className="bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--gs-border)] bg-[var(--gs-bg-alt)]">
                <th className="w-12 px-4 py-3 rounded-tl-xl"></th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-[var(--gs-muted)] font-semibold">Description</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-[var(--gs-muted)] font-semibold">Project</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-[var(--gs-muted)] font-semibold text-right">Duration</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-[var(--gs-muted)] font-semibold text-right">Amount</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-[var(--gs-muted)] font-semibold">Status</th>
                <th className="w-16 px-4 py-3 rounded-tr-xl"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-[var(--gs-muted)]">
                    Loading entries...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Clock className="h-8 w-8 text-[var(--gs-muted)] mb-3 opacity-50" />
                      <p className="text-[13px] text-[var(--gs-fg)] font-medium">No time entries yet</p>
                      <p className="text-[13px] text-[var(--gs-muted)] mt-1">Start the timer or log time manually.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                entries.map(entry => (
                  <tr key={entry.id} className="border-b border-[var(--gs-border)] last:border-0 hover:bg-[var(--gs-bg-alt)] transition-colors group">
                    <td className="px-4 py-3">
                      {!entry.invoice && (
                        <div 
                          onClick={() => toggleSelect(entry.id)}
                          className={`w-4 h-4 rounded-[4px] border cursor-pointer flex items-center justify-center transition-colors ${selectedIds.has(entry.id) ? 'bg-[var(--gs-fg)] border-[var(--gs-fg)]' : 'border-[var(--gs-border-strong)] group-hover:border-[var(--gs-muted)]'}`}
                        >
                          {selectedIds.has(entry.id) && <CheckCircle2 className="h-3 w-3 text-[var(--gs-bg)]" strokeWidth={3} />}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[var(--gs-fg)] font-medium">
                      {entry.description || <span className="text-[var(--gs-muted)] italic">No description</span>}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[var(--gs-muted)]">
                      {entry.project?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[var(--gs-fg)] text-right font-medium">
                      {entry.startTime && !entry.endTime ? (
                        <span className="text-amber-500 flex items-center justify-end gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          Running
                        </span>
                      ) : (
                        formatDuration(entry.duration)
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[var(--gs-muted)] text-right font-medium">
                      {entry.billable ? (() => {
                        const rate = entry.project?.hourlyRate || entry.user?.hourlyRate || 0;
                        if (rate === 0) return (
                          <Link href={entry.project ? `/dashboard/projects` : `/dashboard/settings`} className="text-[11px] italic text-[var(--gs-fg)] underline hover:text-[var(--gs-muted)]">
                            No rate set
                          </Link>
                        );
                        const amt = (entry.duration / 3600) * rate;
                        return formatCurrency(amt);
                      })() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {entry.invoice ? (
                        <StatusBadge label="Billed" status="positive" />
                      ) : entry.billable ? (
                        <StatusBadge label="Unbilled" status="neutral" />
                      ) : (
                        <StatusBadge label="Non-billable" status="neutral" showDot={false} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right relative">
                      <button 
                        onClick={() => setMenuOpenId(menuOpenId === entry.id ? null : entry.id)}
                        className="p-1 rounded-[4px] hover:bg-[var(--gs-bg-alt)] text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {menuOpenId === entry.id && (
                        <div className="absolute right-4 top-10 w-44 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px] shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
                          {!entry.invoice && entry.billable && (
                            <button
                              onClick={() => {
                                setMenuOpenId(null);
                                generateInvoiceForEntries([entry]);
                              }}
                              className="w-full text-left px-3 py-1.5 text-[13px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4 text-[var(--gs-muted)]" />
                              Generate Invoice
                            </button>
                          )}
                          {!entry.invoice && entry.billable && (
                            <div className="px-1 my-1">
                              <div className="h-px bg-[#262626] w-full" />
                            </div>
                          )}
                          {!entry.invoice && (
                            <button
                              onClick={() => {
                                setMenuOpenId(null);
                                handleDelete(entry.id);
                              }}
                              className="w-full text-left px-3 py-1.5 text-[13px] hover:bg-[var(--gs-bg-alt)] transition-colors text-red-500 flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                              Delete Entry
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {invoiceModalOpen && (
        <CreateInvoiceModal
          token={localStorage.getItem("growsuite_token") || ""}
          workspaceId={parseInt(localStorage.getItem("growsuite_workspace_id") || "0")}
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          onSuccess={() => {
            setInvoiceModalOpen(false);
            fetchEntries();
            setSelectedIds(new Set());
            window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Invoice generated successfully", type: "success" } }));
          }}
          initialClientId={invoiceClientId}
          initialProjectId={invoiceProjectId}
          initialItems={invoiceInitialItems}
          timeEntryIds={invoiceTimeEntryIds}
        />
      )}
    </div>
  );
}
