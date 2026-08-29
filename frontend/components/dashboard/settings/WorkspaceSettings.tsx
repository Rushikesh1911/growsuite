"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Users, Shield, Mail, Plus, UserPlus, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FormSkeleton } from "@/components/ui/skeleton";
import { PopoverSelect } from "@/components/ui/popover-select";
import { ImageUpload } from "@/components/ui/image-upload";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface WorkspaceMember {
  id: number;
  role: string;
  user: {
    id: number;
    name: string | null;
    email: string;
  };
}

interface Workspace {
  id: number;
  name: string;
  logoUrl?: string;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  members: WorkspaceMember[];
}

interface WorkspaceSettingsProps {
  token: string;
  workspaceId: number;
}

export function WorkspaceSettings({ token, workspaceId }: WorkspaceSettingsProps) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"general" | "payments" | "members" | "danger">("general");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [isInviting, setIsInviting] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchWorkspace = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/workspaces/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspace(data);
        setWorkspaceName(data.name);
        setRazorpayKeyId(data.razorpayKeyId || "");
        setRazorpayKeySecret(data.razorpayKeySecret ? "********" : ""); // mask secret
      }
    } catch (err) {
      console.error("Failed to fetch workspace settings", err);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const handleUpdateWorkspace = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const payload: any = { name: workspaceName };
      if (razorpayKeyId) payload.razorpayKeyId = razorpayKeyId;
      if (razorpayKeySecret && razorpayKeySecret !== "********") payload.razorpayKeySecret = razorpayKeySecret;

      const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Settings saved successfully", type: "success" } }));
        fetchWorkspace();
      } else {
        const data = await res.json();
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: data.error || "Failed to save settings", type: "error" } }));
      }
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Network error occurred", type: "error" } }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (deleteConfirmText !== workspace?.name) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete workspace");
      }

      // Deletion successful
      localStorage.removeItem("growsuite_workspace_id");
      
      setDeleteConfirmText("");
      window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Workspace deleted successfully", type: "success" } }));
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Failed to delete workspace", type: "error" } }));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsInviting(true);
    
    try {
      const res = await fetch(`${API_URL}/api/workspaces/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: data.message || "Invitation sent!", type: "success" } }));
        setIsInviteModalOpen(false);
        setInviteEmail("");
        setInviteRole("MEMBER");
        fetchWorkspace();
      } else {
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: data.error || "Failed to invite member", type: "error" } }));
      }
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Network error occurred", type: "error" } }));
    } finally {
      setIsInviting(false);
    }
  };

  if (loading || !workspace) {
    return <FormSkeleton />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate-fade">
      
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-[var(--gs-border)] pb-6">
        <h1 className="text-2xl font-bold text-[var(--gs-fg)] tracking-tight">Workspace Settings</h1>
        <p className="text-[14px] text-[var(--gs-muted)]">Manage your organization's profile, members, and billing.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[var(--gs-border)]">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-3 text-[14px] font-medium transition-colors relative ${
            activeTab === "general" ? "text-[var(--gs-fg)]" : "text-[var(--gs-muted)] hover:text-[var(--gs-fg)]"
          }`}
        >
          General
          {activeTab === "general" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--gs-fg)] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-3 text-[14px] font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === "payments" ? "text-[var(--gs-fg)]" : "text-[var(--gs-muted)] hover:text-[var(--gs-fg)]"
          }`}
        >
          Payments (Razorpay)
          {workspace?.razorpayKeyId && (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          )}
          {activeTab === "payments" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--gs-fg)] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`pb-3 text-[14px] font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === "members" ? "text-[var(--gs-fg)]" : "text-[var(--gs-muted)] hover:text-[var(--gs-fg)]"
          }`}
        >
          Team Members
          <span className="bg-[var(--gs-border)] text-[var(--gs-fg)] px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold">
            {workspace.members.length}
          </span>
          {activeTab === "members" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--gs-fg)] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("danger")}
          className={`pb-3 text-[14px] font-medium transition-colors relative ${
            activeTab === "danger" ? "text-red-500" : "text-[var(--gs-muted)] hover:text-red-500"
          }`}
        >
          Danger Zone
          {activeTab === "danger" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6">
        
        {activeTab === "general" && (
          <div className="flex flex-col gap-6">
            <Card className="bg-[var(--gs-bg)] border-[var(--gs-border)] overflow-hidden flex flex-col p-6">
              <h3 className="text-[16px] font-semibold text-[var(--gs-fg)] mb-1">Workspace Logo</h3>
              <p className="text-[13px] text-[var(--gs-muted)] mb-6">Upload a logo to brand your workspace and client-facing pages.</p>
              <ImageUpload 
                token={token} 
                workspaceId={workspaceId} 
                endpoint="/api/uploads/workspace-logo" 
                currentImageUrl={workspace.logoUrl} 
                onUploadSuccess={(url) => {
                  setWorkspace(prev => prev ? { ...prev, logoUrl: url } : null);
                  // Also trigger a global event so the sidebar can update if needed
                  window.dispatchEvent(new CustomEvent('workspaceUpdated'));
                }} 
              />
            </Card>

            <Card className="bg-[var(--gs-bg)] border-[var(--gs-border)] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-[var(--gs-border)]">
                <h3 className="text-[16px] font-semibold text-[var(--gs-fg)] mb-1">Workspace Name</h3>
                <p className="text-[13px] text-[var(--gs-muted)] mb-4">This is your organization's visible name within GrowSuite.</p>
                
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full max-w-md bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[14px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-muted-light)] transition-colors"
                />
              </div>
              <div className="bg-[var(--gs-bg-alt)] px-6 py-3 flex items-center justify-between">
                <span className="text-[12px] text-[var(--gs-muted)]">Please use 32 characters at maximum.</span>
                <button 
                  onClick={() => handleUpdateWorkspace()}
                  disabled={isSaving}
                  className="bg-[var(--gs-fg)] hover:bg-[var(--gs-fg)] disabled:opacity-50 text-[var(--gs-bg)] px-4 py-1.5 rounded-[6px] text-[13px] font-semibold transition-colors"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "payments" && (
          <Card className="bg-[var(--gs-bg)] border-[var(--gs-border)] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[var(--gs-border)] flex flex-col gap-6">
              <div>
                <h3 className="text-[16px] font-semibold text-[var(--gs-fg)] mb-1">Razorpay Integration</h3>
                <p className="text-[13px] text-[var(--gs-muted)] max-w-2xl">
                  Connect your Razorpay account to seamlessly collect payments from your clients. When clients pay an invoice, the funds will go directly into your linked bank account.
                </p>
              </div>

              <div className="flex flex-col gap-4 max-w-md">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[var(--gs-muted)]">Razorpay Key ID</label>
                  <input
                    type="text"
                    value={razorpayKeyId}
                    onChange={(e) => setRazorpayKeyId(e.target.value)}
                    placeholder="rzp_live_..."
                    className="w-full bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[14px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-muted-light)] transition-colors"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[var(--gs-muted)]">Razorpay Key Secret</label>
                  <input
                    type="password"
                    value={razorpayKeySecret}
                    onChange={(e) => setRazorpayKeySecret(e.target.value)}
                    placeholder="Enter your secret key"
                    className="w-full bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[14px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-muted-light)] transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="bg-[var(--gs-bg-alt)] px-6 py-3 flex items-center justify-between">
              <span className="text-[12px] text-[var(--gs-muted)]">Your keys are stored securely.</span>
              <button 
                onClick={() => handleUpdateWorkspace()}
                disabled={isSaving}
                className="bg-[#3366FF] hover:bg-[#4D7CFF] disabled:opacity-50 text-white px-4 py-1.5 rounded-[6px] text-[13px] font-semibold transition-colors flex items-center gap-2"
              >
                {isSaving ? "Saving..." : (
                  <>Save Configuration <CheckCircle2 className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </Card>
        )}

        {activeTab === "members" && (
          <Card className="bg-[var(--gs-bg)] border-[var(--gs-border)] overflow-hidden">
            <div className="p-6 border-b border-[var(--gs-border)] flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-[var(--gs-fg)] mb-1">Team Members</h3>
                <p className="text-[13px] text-[var(--gs-muted)]">Manage who has access to this workspace and their roles.</p>
              </div>
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-2 bg-[var(--gs-fg)] hover:bg-[var(--gs-fg)] text-[var(--gs-bg)] px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Invite Member
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-[var(--gs-border)]">
                  {workspace.members.map((member) => (
                    <tr key={member.id} className="hover:bg-[var(--gs-bg-alt)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[var(--gs-surface)] border border-[var(--gs-border)] flex items-center justify-center shrink-0">
                            <span className="text-[14px] font-bold text-[var(--gs-fg)]">
                              {member.user.name ? member.user.name.charAt(0).toUpperCase() : member.user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-semibold text-[var(--gs-fg)]">
                              {member.user.name || "Unknown User"}
                            </span>
                            <span className="text-[12px] text-[var(--gs-muted)]">{member.user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          member.role === "OWNER" 
                            ? "bg-[#7928CA]/20 text-[#7928CA]" 
                            : member.role === "ADMIN" 
                              ? "bg-[#F5A623]/20 text-[#F5A623]" 
                              : "bg-[var(--gs-border)] text-[var(--gs-fg)]"
                        }`}>
                          {member.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

      </div>

      {activeTab === "danger" && (
        <Card className="bg-red-500/5 border-red-500/20 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-red-500/20">
            <h3 className="text-[16px] font-semibold text-red-500 mb-1">Delete Workspace</h3>
            <p className="text-[13px] text-red-500/80 mb-6 max-w-[600px]">
              Permanently delete this workspace and all associated leads, clients, projects, invoices, payments, and activities. This action cannot be undone.
            </p>
            
            <div className="bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] p-4 rounded-[8px] mb-4">
              <label className="block text-[12px] font-medium text-[var(--gs-muted)] mb-2">
                Type <strong className="text-[var(--gs-fg)] font-mono">"{workspace.name}"</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full max-w-md bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[14px] text-[var(--gs-fg)] focus:outline-none focus:border-red-500/50 transition-colors"
                placeholder={workspace.name}
              />
            </div>
            
            <button
              onClick={handleDeleteWorkspace}
              disabled={isDeleting || deleteConfirmText !== workspace.name}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center min-w-[140px]"
            >
              {isDeleting ? "Deleting..." : "Delete workspace"}
            </button>
          </div>
        </Card>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-[var(--gs-bg)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="bg-[var(--gs-bg)] border-[var(--gs-border)] w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[var(--gs-fg)] mb-2">Invite Team Member</h3>
            <p className="text-[13px] text-[var(--gs-muted)] mb-6">Send an email invitation to collaborate in this workspace.</p>
            
            <form onSubmit={handleInviteMember} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-[var(--gs-muted)]">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[14px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-muted)] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-[var(--gs-muted)]">Role</label>
                <PopoverSelect
                  value={inviteRole}
                  onChange={(val) => setInviteRole(val as "MEMBER" | "ADMIN")}
                  options={[
                    { value: "MEMBER", label: "Member (Can view and edit items)" },
                    { value: "ADMIN", label: "Admin (Can manage settings and billing)" },
                  ]}
                  className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] py-2 px-3 !ml-0 text-[14px] text-[var(--gs-fg)] font-normal justify-between hover:bg-[#1a1a1a]"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting || !inviteEmail}
                  className="bg-[var(--gs-fg)] hover:bg-[var(--gs-fg)] disabled:opacity-50 disabled:hover:bg-[var(--gs-fg)] text-[var(--gs-bg)] px-6 py-2 rounded-[6px] text-[13px] font-semibold transition-colors flex items-center justify-center min-w-[120px]"
                >
                  {isInviting ? (
                    <div className="h-4 w-4 border-2 border-[var(--gs-bg)]/20 border-t-[var(--gs-bg)] rounded-full animate-spin" />
                  ) : (
                    "Send Invite"
                  )}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
