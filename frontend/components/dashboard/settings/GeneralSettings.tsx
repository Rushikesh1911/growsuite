"use client";

import { useState, useEffect, useCallback } from "react";
import { FormSkeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/ui/image-upload";
import { TriangleAlert } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function GeneralSettings({ token, workspaceId }: { token: string; workspaceId: number }) {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [brandColor, setBrandColor] = useState("var(--gs-fg)");
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWorkspace = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/workspaces/current`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString()
        },
      });
      const data = await res.json();
      if (res.ok && data) {
        setWorkspaceName(data.name);
        setBrandColor(data.brandColor || "var(--gs-fg)");
        setLogoUrl(data.logoUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const handleSaveGeneral = async () => {
    if (!workspaceName.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ name: workspaceName, brandColor }),
      });
      const data = await res.json();
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Settings saved", type: "success" } }));
      } else {
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: data.error || "Failed to save", type: "error" } }));
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Network error", type: "error" } }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (deleteConfirmText !== workspaceName) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        localStorage.removeItem("growsuite_workspace_id");
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setIsDeleting(false);
    }
  };

  if (loading) return <FormSkeleton />;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* General Settings Card */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-[16px] font-medium text-[var(--gs-fg)] mb-1">General Settings</h2>
          <p className="text-[13px] text-[var(--gs-muted)]">Manage your workspace identity and brand.</p>
        </div>

        {/* Workspace Name */}
        <div className="flex flex-col gap-2 max-w-xl">
          <label className="text-[11px] uppercase text-[var(--gs-muted)] tracking-wide">Workspace Name</label>
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="w-full bg-[#141414] border border-[#262626] rounded-md px-3 h-10 text-[14px] text-[var(--gs-fg)] placeholder:text-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
          />
        </div>

        {/* Brand Color */}
        <div className="flex flex-col gap-2 max-w-xl">
          <label className="text-[11px] uppercase text-[var(--gs-muted)] tracking-wide">Brand Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="w-10 h-10 rounded-md cursor-pointer bg-transparent border-0 p-0"
            />
            <input
              type="text"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="w-32 bg-[#141414] border border-[#262626] rounded-md px-3 h-10 text-[14px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors uppercase"
            />
          </div>
          <p className="text-[13px] text-[var(--gs-muted)] mt-1">Used for public links, invoices, and emails.</p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSaveGeneral}
            disabled={isSaving || !workspaceName.trim()}
            className="bg-[var(--gs-fg)] text-black px-4 py-2 rounded-md text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 outline-none"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[var(--gs-bg-alt)] border border-[#F04438] rounded-xl p-6 flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#F04438] mb-1">
            <TriangleAlert className="h-4 w-4" />
            <h3 className="text-[16px] font-medium">Danger Zone</h3>
          </div>
          <p className="text-[13px] text-[var(--gs-muted)]">
            Deleting a workspace is permanent and cannot be undone. All projects, clients, and data will be lost.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-[var(--gs-fg)]">
            Type <strong className="text-[#F04438] font-medium">{workspaceName}</strong> to confirm deletion.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={workspaceName}
              className="w-full max-w-sm bg-[#141414] border border-[#262626] rounded-md px-3 h-10 text-[14px] text-[var(--gs-fg)] focus:outline-none focus:border-[#F04438] transition-colors"
            />
            <button
              onClick={handleDeleteWorkspace}
              disabled={isDeleting || deleteConfirmText !== workspaceName}
              className="shrink-0 bg-transparent text-[#F04438] border border-[#F04438] hover:bg-[#F04438]/10 px-4 py-2 rounded-md text-[13px] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none"
            >
              {isDeleting ? "Deleting..." : "Delete Workspace"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
