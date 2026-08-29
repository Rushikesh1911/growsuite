"use client";

import { useState } from "react";
import { Shield, Key, LogOut } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface SecuritySettingsProps {
  token: string;
}

export function SecuritySettings({ token }: SecuritySettingsProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "New passwords do not match", type: "error" } }));
      return;
    }
    
    setIsChanging(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Password updated successfully", type: "success" } }));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: data.error || "Failed to update password", type: "error" } }));
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Network error", type: "error" } }));
    } finally {
      setIsChanging(false);
    }
  };

  const handleLogoutAll = () => {
    // Simulated behavior since JWTs are stateless in the current architecture.
    // In a production app, we would increment a token version or blacklist current tokens.
    if (confirm("This will log you out of all devices. You will need to log in again. Proceed?")) {
      setIsLoggingOut(true);
      // Simulate API call then clear local token
      setTimeout(() => {
        localStorage.removeItem("growsuite_token");
        window.location.href = "/auth/sign-in";
      }, 800);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 flex flex-col gap-8">
        <div>
          <h2 className="text-[16px] font-medium text-[var(--gs-fg)] mb-1">Security</h2>
          <p className="text-[13px] text-[var(--gs-muted)]">Protect your account and manage active sessions.</p>
        </div>

        {/* Change Password */}
        <div className="flex flex-col gap-5">
          <h3 className="text-[14px] font-medium text-[var(--gs-fg)] border-b border-[#262626] pb-2">Change Password</h3>
          
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase text-[var(--gs-muted)] tracking-wide mb-1.5">Current Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gs-muted)]" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-md h-10 pl-9 pr-3 text-[14px] text-[var(--gs-fg)] placeholder:text-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-[11px] uppercase text-[var(--gs-muted)] tracking-wide mb-1.5">New Password</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gs-muted)]" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#141414] border border-[#262626] rounded-md h-10 pl-9 pr-3 text-[14px] text-[var(--gs-fg)] placeholder:text-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-[11px] uppercase text-[var(--gs-muted)] tracking-wide mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gs-muted)]" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#141414] border border-[#262626] rounded-md h-10 pl-9 pr-3 text-[14px] text-[var(--gs-fg)] placeholder:text-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isChanging || !currentPassword || !newPassword || !confirmPassword}
                className="bg-[var(--gs-fg)] text-black px-4 py-2 rounded-md text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 outline-none"
              >
                {isChanging ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>

        {/* Sessions */}
        <div className="flex flex-col gap-5">
          <h3 className="text-[14px] font-medium text-[var(--gs-fg)] border-b border-[#262626] pb-2">Active Sessions</h3>
          
          <div className="p-4 rounded-md border border-[#262626] bg-[var(--gs-bg-alt)] flex flex-col gap-3">
            <p className="text-[13px] text-[var(--gs-muted)]">
              If you notice suspicious activity, you can sign out of all active sessions across all devices. 
              You will be required to log in again.
            </p>
            <button
              onClick={handleLogoutAll}
              disabled={isLoggingOut}
              className="self-start flex items-center gap-2 mt-2 bg-transparent border border-[#262626] text-[var(--gs-fg)] hover:bg-[#141414] px-4 py-2 rounded-md text-[13px] font-medium transition-colors disabled:opacity-50 outline-none"
            >
              <LogOut className="h-4 w-4 text-[var(--gs-muted)]" />
              {isLoggingOut ? "Signing out..." : "Sign out of all devices"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
