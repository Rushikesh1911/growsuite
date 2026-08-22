import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/app/dashboard/DashboardContext";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealId: number;
  onSuccess: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function CreateTaskModal({
  isOpen, onClose, dealId, onSuccess
}: CreateTaskModalProps) {
  const { token, workspaceId } = useDashboard();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ 
          title, 
          dealId,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null
        }),
      });

      if (res.ok) {
        setSuccessMsg("Task created successfully!");
        setTimeout(() => {
          onSuccess();
          onClose();
          setTitle("");
          setDueDate("");
          setSuccessMsg("");
        }, 1000);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to create task.");
      }
    } catch (err) {
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true">
      <div className="bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[12px] p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
        <div>
          <h3 className="text-lg font-bold text-[var(--gs-fg)] tracking-tight">Create Follow-up Task</h3>
          <p className="text-xs text-[var(--gs-muted)] mt-1">Assign a task to this deal.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[var(--gs-muted)]">Task Title</label>
            <Input
              placeholder="e.g. Call back next Tuesday"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[var(--gs-surface)] text-[var(--gs-fg)] border-[var(--gs-border)] focus:border-[var(--gs-fg-secondary)] h-[32px] text-xs"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[var(--gs-muted)]">Due Date (Optional)</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-[var(--gs-surface)] text-[var(--gs-fg)] border-[var(--gs-border)] focus:border-[var(--gs-fg-secondary)] h-[32px] text-xs"
            />
          </div>
          
          {errorMsg && <div className="text-xs text-[var(--gs-accent)] font-semibold p-2 bg-red-900/20 rounded-[6px]">{errorMsg}</div>}
          {successMsg && <div className="text-xs text-green-400 font-semibold p-2 bg-green-900/20 rounded-[6px]">{successMsg}</div>}
          
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting} className="h-[32px] text-xs font-semibold bg-[var(--gs-surface)] text-[var(--gs-fg)] hover:bg-[var(--gs-surface-raised)] border border-[var(--gs-border)]">Cancel</Button>
            <Button type="submit" disabled={submitting} className="h-[32px] text-xs font-semibold bg-[var(--gs-fg)] text-[var(--gs-bg)] hover:bg-[var(--gs-fg-secondary)]">
              {submitting ? "Creating..." : "Save Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
