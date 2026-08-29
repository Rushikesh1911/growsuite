"use client";

import { useState, useEffect, useCallback } from "react";
import { FormSkeleton } from "@/components/ui/skeleton";
import { UserPlus, Shield, X, Mail } from "lucide-react";
import { PopoverSelect } from "@/components/ui/popover-select";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface WorkspaceMember {
  id: number;
  role: string;
  user: {
    id: number;
    name: string | null;
    email: string;
    avatarUrl?: string | null;
  };
}

export function TeamSettings({ token, workspaceId }: { token: string; workspaceId: number }) {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("MEMBER");
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [isInviting, setIsInviting] = useState(false);

  const fetchWorkspace = useCallback(async () => {
    try {
      const [wsRes, meRes] = await Promise.all([
        fetch(`${API_URL}/api/workspaces/current`, { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "x-workspace-id": workspaceId.toString()
          } 
        }),
        fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const wsData = await wsRes.json();
      const meData = await meRes.json();
      
      if (wsRes.ok && wsData) {
        setMembers(wsData.members);
        
        // Find current user's role
        const meMembership = wsData.members.find((m: any) => m.user.id === meData.id);
        if (meMembership) {
          setCurrentUserRole(meMembership.role);
        }
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
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Invitation sent!", type: "success" } }));
        setIsInviteModalOpen(false);
        setInviteEmail("");
        setInviteRole("MEMBER");
        fetchWorkspace();
      } else {
        if (data.code === 'PLAN_LIMIT_REACHED') {
          // You could show an upgrade prompt here instead of a generic toast
          window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Plan limit reached. Upgrade to invite more members.", type: "error" } }));
        } else {
          window.dispatchEvent(new CustomEvent("showToast", { detail: { message: data.error || "Failed to invite member", type: "error" } }));
        }
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Network error occurred", type: "error" } }));
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}/members/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Member removed", type: "success" } }));
        fetchWorkspace();
      } else {
        const data = await res.json();
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: data.error || "Failed to remove member", type: "error" } }));
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Network error", type: "error" } }));
    }
  };

  if (loading) return <FormSkeleton />;

  const canManageMembers = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-medium text-[var(--gs-fg)] mb-1">Team Members</h2>
          <p className="text-[13px] text-[var(--gs-muted)]">Manage who has access to this workspace.</p>
        </div>
        {canManageMembers && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 bg-[var(--gs-fg)] text-black px-4 py-2 rounded-md text-[13px] font-medium hover:opacity-90 transition-opacity outline-none"
          >
            <UserPlus className="h-4 w-4 shrink-0" />
            Invite Member
          </button>
        )}
      </div>

      <div className="rounded-xl border border-[#262626] bg-[#141414] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#262626] bg-[var(--gs-bg-alt)]/50">
              <th className="px-4 py-3 text-[11px] font-medium text-[var(--gs-muted)] uppercase tracking-wide">Member</th>
              <th className="px-4 py-3 text-[11px] font-medium text-[var(--gs-muted)] uppercase tracking-wide">Role</th>
              <th className="px-4 py-3 text-[11px] font-medium text-[var(--gs-muted)] uppercase tracking-wide text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-[#262626] last:border-0 hover:bg-[#1A1A1A] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#262626] flex items-center justify-center text-[11px] font-bold text-[var(--gs-fg)] uppercase shrink-0">
                      {member.user.name ? member.user.name.charAt(0) : member.user.email.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-[var(--gs-fg)]">
                        {member.user.name || "Unknown"}
                      </span>
                      <span className="text-[12px] text-[var(--gs-muted)]">
                        {member.user.email}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {member.role === "OWNER" && <Shield className="h-3.5 w-3.5 text-[var(--gs-fg)]" />}
                    <span className="text-[13px] text-[var(--gs-muted)] capitalize">{member.role.toLowerCase()}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {canManageMembers && member.role !== "OWNER" && (
                    <button
                      onClick={() => handleRemoveMember(member.user.id)}
                      className="text-[13px] text-[#F04438] hover:text-[#F04438]/80 font-medium px-2 py-1 transition-colors outline-none"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--gs-bg-alt)]/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-[#262626] rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#262626]">
              <h3 className="text-[16px] font-medium text-[var(--gs-fg)]">Invite Team Member</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleInviteMember} className="p-4 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase text-[var(--gs-muted)] tracking-wide mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gs-muted)]" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="w-full bg-[#141414] border border-[#262626] rounded-md h-10 pl-9 pr-3 text-[14px] text-[var(--gs-fg)] placeholder:text-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase text-[var(--gs-muted)] tracking-wide mb-1.5">Role</label>
                <PopoverSelect
                  value={inviteRole}
                  onChange={(val) => setInviteRole(val as any)}
                  options={[
                    { label: "Member (Can edit data)", value: "MEMBER" },
                    { label: "Admin (Can manage settings)", value: "ADMIN" }
                  ]}
                  placeholder="Select role..."
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="bg-transparent border border-[#262626] text-[var(--gs-fg)] hover:bg-[#141414] px-4 py-2 rounded-md text-[13px] font-medium transition-colors outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting || !inviteEmail}
                  className="bg-[var(--gs-fg)] text-black px-4 py-2 rounded-md text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 outline-none"
                >
                  {isInviting ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
