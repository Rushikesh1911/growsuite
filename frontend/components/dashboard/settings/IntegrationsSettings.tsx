"use client";

import { useState, useEffect, useCallback } from "react";
import { FormSkeleton } from "@/components/ui/skeleton";
import { Plug, CheckCircle2, Copy } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function IntegrationsSettings({ token, workspaceId }: { token: string; workspaceId: number }) {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [hasRazorpay, setHasRazorpay] = useState(false);
  const [hasGoogleCalendar, setHasGoogleCalendar] = useState(false);

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
        setRazorpayKeyId(data.razorpayKeyId || "");
        setRazorpayKeySecret(data.razorpayKeySecret ? "••••••••••••••••" : "");
        setHasRazorpay(!!data.razorpayKeyId);
      }
      
      const userRes = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await userRes.json();
      if (userRes.ok && userData) {
        setHasGoogleCalendar(userData.hasGoogleCalendar || false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId]);

  useEffect(() => {
    fetchWorkspace();
    
    // Check URL params for google connect success/error
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "google_connected") {
       window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Google Calendar connected successfully", type: "success" } }));
       window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get("error")) {
       window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Failed to connect Google Calendar", type: "error" } }));
       window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [fetchWorkspace]);

  const handleSaveRazorpay = async () => {
    setIsSaving(true);
    try {
      // Don't send secret if it's just the masked placeholder
      const payload: any = { razorpayKeyId };
      if (razorpayKeySecret !== "••••••••••••••••") {
        payload.razorpayKeySecret = razorpayKeySecret;
      }

      const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Razorpay settings saved", type: "success" } }));
        setHasRazorpay(true);
      } else {
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: data.error || "Failed to save", type: "error" } }));
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Network error", type: "error" } }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await fetch(`${API_URL}/api/google/login`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Failed to initiate connection", type: "error" } }));
      }
    } catch (error) {
      window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Network error", type: "error" } }));
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      const res = await fetch(`${API_URL}/api/google/disconnect`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setHasGoogleCalendar(false);
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Google Calendar disconnected", type: "success" } }));
      }
    } catch (error) {
      window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Network error", type: "error" } }));
    }
  };

  if (loading) return <FormSkeleton />;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h2 className="text-[16px] font-medium text-[var(--gs-fg)] mb-1">Integrations</h2>
        <p className="text-[13px] text-[var(--gs-muted)]">Connect GrowSuite with your favorite tools.</p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        
        {/* Razorpay Card */}
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-[8px] bg-[#02042B] flex items-center justify-center shrink-0 border border-black">
                <span className="text-white font-bold text-[18px]">R</span>
              </div>
              <div className="flex flex-col">
                <h3 className="text-[14px] font-medium text-[var(--gs-fg)] flex items-center gap-2">
                  Razorpay
                </h3>
                <p className="text-[13px] text-[var(--gs-muted)]">Payment Gateway</p>
              </div>
            </div>
            {hasRazorpay ? (
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--gs-muted)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--gs-fg)]" />
                Connected
              </div>
            ) : (
              <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--gs-muted)]">
                Not Connected
              </div>
            )}
          </div>
          
          <p className="text-[13px] text-[var(--gs-muted)]">
            Connect your Razorpay account to accept client payments directly through invoices.
          </p>

          <div className="flex flex-col gap-4 mt-2 border-t border-[#262626] pt-4">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-medium text-[var(--gs-muted)] uppercase tracking-wide">Key ID</label>
              <input
                type="text"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                placeholder="rzp_live_..."
                className="w-full bg-[#141414] border border-[#262626] rounded-md h-10 px-3 text-[14px] text-[var(--gs-fg)] placeholder:text-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-medium text-[var(--gs-muted)] uppercase tracking-wide">Key Secret</label>
              <input
                type="password"
                value={razorpayKeySecret}
                onChange={(e) => setRazorpayKeySecret(e.target.value)}
                placeholder="Required"
                className="w-full bg-[#141414] border border-[#262626] rounded-md h-10 px-3 text-[14px] text-[var(--gs-fg)] placeholder:text-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
              />
            </div>
            <button
              onClick={handleSaveRazorpay}
              disabled={isSaving || !razorpayKeyId}
              className="mt-2 bg-transparent border border-[#262626] text-[var(--gs-fg)] hover:bg-[#141414] px-4 py-2 rounded-md text-[13px] font-medium transition-colors disabled:opacity-50 w-full outline-none"
            >
              {isSaving ? "Connecting..." : "Connect Razorpay"}
            </button>
          </div>
        </div>

        {/* Google Calendar */}
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-[8px] bg-white flex items-center justify-center shrink-0">
                <span className="text-[#4285F4] font-bold text-[18px]">G</span>
              </div>
              <div className="flex flex-col">
                <h3 className="text-[14px] font-medium text-[var(--gs-fg)]">Google Calendar</h3>
                <p className="text-[13px] text-[var(--gs-muted)]">Calendar Sync</p>
              </div>
            </div>
            {hasGoogleCalendar ? (
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--gs-muted)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--gs-fg)]" />
                Connected
              </div>
            ) : (
              <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--gs-muted)]">
                Not Connected
              </div>
            )}
          </div>
          
          <p className="text-[13px] text-[var(--gs-muted)]">
            Sync your GrowSuite tasks and meetings directly with your Google Calendar.
          </p>

          <div className="flex flex-col gap-3 mt-auto border-t border-[#262626] pt-4">
            {hasGoogleCalendar ? (
              <button
                onClick={handleDisconnectGoogle}
                className="bg-transparent border border-[#262626] text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-md text-[13px] font-medium w-full transition-colors outline-none"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnectGoogle}
                className="bg-transparent border border-[#262626] text-[var(--gs-fg)] hover:bg-[#1f1f1f] px-4 py-2 rounded-md text-[13px] font-medium w-full transition-colors outline-none"
              >
                Connect Google Calendar
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
