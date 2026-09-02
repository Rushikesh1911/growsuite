"use client";

import { useState, useEffect } from "react";
import { Plus, Settings, Copy, Trash2, Edit2, LayoutTemplate } from "lucide-react";
import { WebToLeadFormBuilder } from "./WebToLeadFormBuilder";

interface Form {
  id: number;
  publicId: string;
  name: string;
  defaultStatus: string;
  defaultAssigneeId: number | null;
  submitText: string;
  themeColor: string;
  createdAt: string;
}

export function WebToLeadSettings({ token, workspaceId }: { token: string; workspaceId: number }) {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "builder">("list");
  const [editingFormId, setEditingFormId] = useState<number | null>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchForms = async () => {
    try {
      const res = await fetch(`${API_URL}/api/web-to-lead`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString()
        }
      });
      if (res.ok) {
        const data = await res.json();
        setForms(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "list") {
      fetchForms();
    }
  }, [view]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this form?')) return;
    
    try {
      await fetch(`${API_URL}/api/web-to-lead/${id}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString()
        }
      });
      fetchForms();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCode = (publicId: string) => {
    const embedCode = `<iframe\n  src="${window.location.origin}/f/${publicId}"\n  width="100%"\n  height="600"\n  frameborder="0">\n</iframe>`;
    navigator.clipboard.writeText(embedCode);
    const event = new CustomEvent('showToast', {
      detail: { message: "Embed code copied to clipboard", type: "success" }
    });
    window.dispatchEvent(event);
  };

  if (view === "builder") {
    return (
      <WebToLeadFormBuilder
        token={token}
        workspaceId={workspaceId}
        formId={editingFormId}
        onBack={() => setView("list")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold text-[var(--gs-fg)] tracking-tight mb-1">Web-to-Lead Forms</h2>
          <p className="text-[14px] text-[var(--gs-muted)]">Embed lead capture forms on your external websites to automatically create leads in GrowSuite.</p>
        </div>
        <button 
          onClick={() => { setEditingFormId(null); setView("builder"); }}
          className="bg-[var(--gs-fg)] text-[var(--gs-bg)] hover:bg-[var(--gs-fg)]/90 px-4 py-2 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Form
        </button>
      </div>

      <div className="bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-[var(--gs-muted)] text-[13px]">Loading...</div>
        ) : forms.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-[var(--gs-border)] flex items-center justify-center mb-4 text-[var(--gs-fg)]">
              <LayoutTemplate className="h-6 w-6" />
            </div>
            <h3 className="text-[15px] font-medium text-[var(--gs-fg)] mb-1">No forms yet</h3>
            <p className="text-[14px] text-[var(--gs-muted)] mb-6 max-w-[300px]">Create your first Web-to-Lead form to start capturing leads from your website.</p>
            <button 
              onClick={() => { setEditingFormId(null); setView("builder"); }}
              className="bg-[#1A1A1A] text-[var(--gs-fg)] border border-[var(--gs-border)] hover:bg-[#222] px-4 py-2 rounded-md text-[13px] font-medium transition-colors"
            >
              Create Form
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--gs-border)]">
            {forms.map(form => (
              <div key={form.id} className="p-6 flex items-center justify-between hover:bg-[#1A1A1A]/30 transition-colors">
                <div>
                  <h3 className="text-[15px] font-medium text-[var(--gs-fg)] mb-1">{form.name}</h3>
                  <div className="flex items-center gap-4 text-[12px] text-[var(--gs-muted)]">
                    <span>ID: {form.publicId}</span>
                    <span>•</span>
                    <span>Status: {form.defaultStatus}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleCopyCode(form.publicId)}
                    className="p-2 text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[var(--gs-bg)] rounded-md transition-colors"
                    title="Copy Embed Code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => { setEditingFormId(form.id); setView("builder"); }}
                    className="p-2 text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[var(--gs-bg)] rounded-md transition-colors"
                    title="Edit Form"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(form.id)}
                    className="p-2 text-[var(--gs-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
