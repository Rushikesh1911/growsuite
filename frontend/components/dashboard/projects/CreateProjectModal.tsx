import React, { useState, useEffect } from "react";
import { X, Building2, Calendar, Target, DollarSign } from "lucide-react";
import { PopoverSelect } from "@/components/ui/popover-select";

interface CreateProjectModalProps {
  token: string;
  workspaceId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: any) => void;
  initialClientId?: number;
  initialProjectName?: string;
  initialProject?: any;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function CreateProjectModal({
  token,
  workspaceId,
  isOpen,
  onClose,
  onSuccess,
  initialClientId,
  initialProjectName,
  initialProject,
}: CreateProjectModalProps) {
  const [clients, setClients] = useState<{id: number, name: string}[]>([]);
  const [newName, setNewName] = useState(initialProjectName || "");
  const [newClientId, setNewClientId] = useState(initialClientId ? initialClientId.toString() : "");
  const [newStatus, setNewStatus] = useState("PLANNING");
  const [newDeadline, setNewDeadline] = useState("");
  const [newHourlyRate, setNewHourlyRate] = useState<string>("");
  const [newDescription, setNewDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchClients = async () => {
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
        }
      };
      fetchClients();
    }
  }, [isOpen, token, workspaceId]);

  useEffect(() => {
    if (isOpen) {
      if (initialProject) {
        setNewName(initialProject.name);
        setNewClientId(initialProject.clientId.toString());
        setNewStatus(initialProject.status);
        setNewDeadline(initialProject.deadline ? initialProject.deadline.split('T')[0] : "");
        setNewHourlyRate(initialProject.hourlyRate ? (initialProject.hourlyRate / 100).toString() : "");
        setNewDescription(initialProject.description || "");
      } else {
        setNewName(initialProjectName || "");
        setNewClientId(initialClientId ? initialClientId.toString() : "");
        setNewStatus("PLANNING");
        setNewDeadline("");
        setNewHourlyRate("");
        setNewDescription("");
      }
      setErrorMsg("");
      setSubmitting(false);
    }
  }, [isOpen, initialProjectName, initialClientId, initialProject]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newClientId) {
      setErrorMsg("Project Name and Client are required");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    try {
      const url = initialProject 
        ? `${API_URL}/api/projects/${initialProject.id}`
        : `${API_URL}/api/projects`;
      
      const res = await fetch(url, {
        method: initialProject ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ 
          name: newName, 
          clientId: parseInt(newClientId),
          status: newStatus,
          deadline: newDeadline || undefined,
          hourlyRate: newHourlyRate ? Math.round(parseFloat(newHourlyRate) * 100) : null,
          description: newDescription || undefined
        }),
      });
      if (res.ok) {
        const newProject = await res.json();
        onSuccess(newProject);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || `Failed to ${initialProject ? "update" : "create"} project`);
      }
    } catch (err) {
      setErrorMsg("Connection error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--gs-bg)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] rounded-[12px] w-full max-w-[480px] shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[var(--gs-border)] bg-[var(--gs-bg-alt)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[8px] bg-[var(--gs-border)] flex items-center justify-center">
              <Target className="h-5 w-5 text-[var(--gs-fg)]" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[var(--gs-fg)] leading-tight">{initialProject ? "Edit project" : "Create new project"}</h2>
              <p className="text-[13px] text-[var(--gs-muted)]">Organize work, tasks, and billing.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleCreateProject} className="p-6 flex flex-col gap-5 bg-[var(--gs-surface)]">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[var(--gs-muted)]">Project Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. Website Redesign"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] placeholder-[var(--gs-muted-light)] focus:outline-none focus:border-[var(--gs-fg)]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[var(--gs-muted)]">Client <span className="text-red-500">*</span></label>
              {initialClientId ? (
                <div className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] flex items-center opacity-70 cursor-not-allowed">
                  {clients.find(c => c.id === initialClientId)?.name || "Selected Client"}
                </div>
              ) : (
                <div className="w-full border border-[var(--gs-border)] rounded-[6px] bg-[var(--gs-surface)]">
                  <PopoverSelect
                    value={newClientId}
                    onChange={(val) => setNewClientId(val)}
                    placeholder="Select a client..."
                    className="w-full justify-between px-3 py-2 text-[13px] text-[var(--gs-fg)] bg-transparent hover:bg-transparent"
                    options={clients.map(client => ({
                      label: client.name,
                      value: client.id.toString(),
                    }))}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[var(--gs-muted)]">Status</label>
              <div className="w-full border border-[var(--gs-border)] rounded-[6px] bg-[var(--gs-surface)]">
                <PopoverSelect
                  value={newStatus}
                  onChange={(val) => setNewStatus(val)}
                  className="w-full justify-between px-3 py-2 text-[13px] text-[var(--gs-fg)] bg-transparent hover:bg-transparent"
                  options={[
                    { label: "Planning", value: "PLANNING" },
                    { label: "Active", value: "ACTIVE" },
                    { label: "On Hold", value: "ON_HOLD" },
                    { label: "Completed", value: "COMPLETED" },
                  ]}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[var(--gs-muted)]">Hourly Rate</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--gs-muted)]">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={newHourlyRate}
                  onChange={(e) => setNewHourlyRate(e.target.value)}
                  className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 pl-6 py-2 text-[13px] text-[var(--gs-fg)] placeholder-[var(--gs-muted-light)] focus:outline-none focus:border-[var(--gs-fg)]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[var(--gs-muted)]">Due date</label>
            <input
              type="date"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-fg)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[var(--gs-muted)]">Description</label>
            <textarea
              placeholder="Briefly describe the project..."
              rows={2}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] placeholder-[var(--gs-muted-light)] focus:outline-none focus:border-[var(--gs-fg)] resize-none"
            />
          </div>

          {errorMsg && <p className="text-[12px] text-red-500 font-medium">{errorMsg}</p>}

          <div className="p-5 border-t border-[var(--gs-border)] bg-[var(--gs-bg-alt)] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-semibold text-[var(--gs-fg)] hover:bg-[var(--gs-border)] rounded-[6px] transition-colors outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-[13px] font-semibold text-[var(--gs-bg)] bg-[var(--gs-fg)] hover:bg-[var(--gs-fg-hover)] rounded-[6px] transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
            >
              {submitting && (
                <div className="h-3 w-3 rounded-full border-2 border-[var(--gs-bg)]/30 border-t-[var(--gs-bg)] animate-spin"></div>
              )}
              {initialProject ? "Save changes" : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
