import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateClientModalProps {
  token: string;
  workspaceId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function CreateClientModal({
  token, workspaceId, onClose, onSuccess
}: CreateClientModalProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ name, company, email }),
      });

      if (res.ok) {
        setSuccessMsg("Client created successfully!");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to create client.");
      }
    } catch (err) {
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[12px] p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
        <div>
          <h3 id="modal-title" className="text-lg font-bold text-[var(--gs-fg)] tracking-tight">Create New Client</h3>
          <p className="text-xs text-[var(--gs-muted)] mt-1">Add a direct client outside of the CRM pipeline.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="client-name" className="text-[11px] font-semibold text-[var(--gs-muted)]">Client Name</label>
            <Input
              id="client-name"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[var(--gs-surface)] text-[var(--gs-fg)] border-[var(--gs-border)] focus:border-[var(--gs-fg-secondary)] h-[32px] text-xs"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="client-company" className="text-[11px] font-semibold text-[var(--gs-muted)]">Company</label>
            <Input
              id="client-company"
              placeholder="Company Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="bg-[var(--gs-surface)] text-[var(--gs-fg)] border-[var(--gs-border)] focus:border-[var(--gs-fg-secondary)] h-[32px] text-xs"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="client-email" className="text-[11px] font-semibold text-[var(--gs-muted)]">Email Address</label>
            <Input
              id="client-email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[var(--gs-surface)] text-[var(--gs-fg)] border-[var(--gs-border)] focus:border-[var(--gs-fg-secondary)] h-[32px] text-xs"
            />
          </div>
          
          {errorMsg && <div className="text-xs text-[var(--gs-accent)] font-semibold p-2 bg-red-900/20 rounded-[6px]" role="alert">{errorMsg}</div>}
          {successMsg && <div className="text-xs text-green-400 font-semibold p-2 bg-green-900/20 rounded-[6px]" role="alert">{successMsg}</div>}
          
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting} className="h-[32px] text-xs font-semibold bg-[var(--gs-surface)] text-[var(--gs-fg)] hover:bg-[var(--gs-surface-raised)] border border-[var(--gs-border)]">Cancel</Button>
            <Button type="submit" disabled={submitting} className="h-[32px] text-xs font-semibold bg-[var(--gs-fg)] text-[var(--gs-bg)] hover:bg-[var(--gs-fg-secondary)]">
              {submitting ? "Creating..." : "Save Client"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
