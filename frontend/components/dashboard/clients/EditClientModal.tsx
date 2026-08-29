"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface EditClientModalProps {
  token: string;
  workspaceId: number;
  client: any;
  onClose: () => void;
  onSuccess: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function EditClientModal({ token, workspaceId, client, onClose, onSuccess }: EditClientModalProps) {
  const [formData, setFormData] = useState({
    name: client.name || "",
    company: client.company || "",
    email: client.email || "",
    phone: client.phone || "",
    billingAddress: client.billingAddress || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API_URL}/api/clients/${client.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        onSuccess();
        onClose();
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Client updated", type: "success" } }));
      }
    } catch (error) {
      console.error("Failed to update client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--gs-bg)]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[12px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[var(--gs-border)] flex items-center justify-between bg-[var(--gs-surface)] shrink-0">
          <h2 className="text-[15px] font-semibold text-[var(--gs-fg)]">Edit Client</h2>
          <button onClick={onClose} className="text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 flex flex-col gap-5 overflow-y-auto">
            
            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[12px] font-medium text-[var(--gs-muted)]">Contact Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)]"
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[12px] font-medium text-[var(--gs-muted)]">Company <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)]"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[12px] font-medium text-[var(--gs-muted)]">Email</label>
                <input
                  type="email"
                  placeholder="e.g. rahul@acme.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)]"
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[12px] font-medium text-[var(--gs-muted)]">Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98..."
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[var(--gs-muted)]">Billing Address</label>
              <textarea
                placeholder="Full billing address..."
                value={formData.billingAddress}
                onChange={(e) => setFormData({...formData, billingAddress: e.target.value})}
                className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)] resize-none h-20"
              />
            </div>

          </div>
          
          <div className="px-6 py-4 border-t border-[var(--gs-border)] flex justify-end gap-3 bg-[var(--gs-surface)] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[var(--gs-fg)] hover:bg-[var(--gs-fg)] text-[var(--gs-bg)] px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
