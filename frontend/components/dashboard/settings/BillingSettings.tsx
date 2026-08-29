"use client";

import { useState, useEffect, useCallback } from "react";
import { FormSkeleton } from "@/components/ui/skeleton";
import { CreditCard, CheckCircle2, Zap, LayoutDashboard, Target, Users } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function BillingSettings({ token, workspaceId }: { token: string; workspaceId: number }) {
  const [loading, setLoading] = useState(true);
  const [billingState, setBillingState] = useState<any>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const fetchBilling = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/billing`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString()
        },
      });
      const data = await res.json();
      if (res.ok && data && !data.error) {
        setBillingState(data);
      } else {
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: data.error || "Failed to fetch billing", type: "error" } }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]);

  const handleUpgrade = async () => {
    setIsCheckoutLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/billing/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString()
        },
        body: JSON.stringify({ plan: "PRO", cycle: "MONTHLY" })
      });
      
      const data = await res.json();
      if (res.ok) {
        // In a real Razorpay integration, we'd initialize the Razorpay SDK here
        // e.g. new Razorpay({ key, order_id: data.orderId, ... }).open()
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: `Simulating Razorpay checkout... Order: ${data.orderId}`, type: "success" } }));
      } else {
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: data.error || "Checkout failed", type: "error" } }));
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Network error", type: "error" } }));
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (loading || !billingState) return <FormSkeleton />;

  const { plan, limits, usage, subscription } = billingState;
  const isPro = plan === "PRO";

  const UsageBar = ({ label, current, max }: { label: string, current: number, max: number }) => {
    const percentage = Math.min((current / max) * 100, 100);
    const isWarning = percentage > 80;
    
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-[var(--gs-fg)] font-medium">{label}</span>
          <span className="text-[var(--gs-muted)]">
            {current} / {max === 999999 ? "∞" : max}
          </span>
        </div>
        <div className="h-2 w-full bg-[#262626] rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${isWarning ? 'bg-[#F5A623]' : 'bg-[var(--gs-fg)]'}`}
            style={{ width: `${max === 999999 ? 10 : percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h2 className="text-[16px] font-medium text-[var(--gs-fg)] mb-1">Billing & Plans</h2>
        <p className="text-[13px] text-[var(--gs-muted)]">Manage your workspace subscription and usage limits.</p>
      </div>

      {/* Current Plan Card */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className={`flex-1 rounded-xl p-6 border ${isPro ? 'border-[#262626] bg-[#141414]' : 'border-[#262626] bg-[#141414]'} relative overflow-hidden flex flex-col justify-between`}>
          {!isPro && (
            <div className="absolute top-0 right-0 bottom-0 w-1/2 pointer-events-none hidden sm:block">
              {/* Decorative scattered badges */}
              <div className="absolute top-8 right-12 w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#262626] flex items-center justify-center opacity-50 shadow-sm">
                <Target className="w-4 h-4 text-[var(--gs-muted)]" />
              </div>
              <div className="absolute top-24 right-28 w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#262626] flex items-center justify-center opacity-40 shadow-sm">
                <Users className="w-3.5 h-3.5 text-[var(--gs-muted)]" />
              </div>
              <div className="absolute bottom-10 right-8 w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#262626] flex items-center justify-center opacity-60 shadow-sm">
                <LayoutDashboard className="w-5 h-5 text-[var(--gs-muted)]" />
              </div>
            </div>
          )}
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wide text-[var(--gs-muted)] uppercase">Current Plan</span>
                {isPro && <span className="text-[var(--gs-fg)] text-[10px] font-bold uppercase tracking-wider leading-none">Active</span>}
              </div>
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-[var(--gs-fg)] tracking-tight">{isPro ? 'Pro' : 'Free'}</span>
            </div>
            
            <p className="text-[13px] text-[var(--gs-muted)] max-w-[280px] mb-8">
              {isPro ? 'You have access to all premium features and unlimited usage.' : 'You are currently on the free tier with limited usage.'}
            </p>

            <div className="mt-auto">
              {!isPro ? (
                <button 
                  onClick={handleUpgrade}
                  disabled={isCheckoutLoading}
                  className="bg-[var(--gs-fg)] text-black px-4 py-2.5 rounded-md text-[13px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 outline-none w-max"
                >
                  <Zap className="h-4 w-4 shrink-0" />
                  {isCheckoutLoading ? "Loading checkout..." : "Upgrade to Pro"}
                </button>
              ) : (
                <div className="flex flex-col gap-3 max-w-[280px]">
                  <div className="text-[13px] text-[var(--gs-muted)] flex items-center justify-between border-t border-[#262626] pt-4">
                    <span>Billing Cycle</span>
                    <span className="text-[var(--gs-fg)] font-medium capitalize">{subscription?.billingCycle?.toLowerCase() || 'Monthly'}</span>
                  </div>
                  <div className="text-[13px] text-[var(--gs-muted)] flex items-center justify-between">
                    <span>Renews On</span>
                    <span className="text-[var(--gs-fg)] font-medium">
                      {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <button className="mt-4 w-full bg-transparent border border-[#262626] text-[var(--gs-fg)] px-4 py-2 rounded-md text-[13px] font-medium hover:bg-[#141414] transition-colors outline-none">
                    Manage Subscription
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Usage Card */}
        <div className="flex-1 rounded-xl p-6 border border-[#262626] bg-[#141414]">
          <h3 className="text-[16px] font-medium text-[var(--gs-fg)] mb-6">Workspace Usage</h3>
          
          <div className="flex flex-col gap-5">
            <UsageBar label="Projects" current={usage.projects} max={limits.projects} />
            <UsageBar label="Clients" current={usage.clients} max={limits.clients} />
            <UsageBar label="Team Members" current={usage.teamMembers} max={limits.teamMembers} />
          </div>

          {!isPro && (
            <div className="mt-6 p-4 rounded-md bg-[var(--gs-bg-alt)] border border-[#262626]">
              <p className="text-[13px] text-[var(--gs-muted)] leading-relaxed">
                Need more limits? <button onClick={handleUpgrade} className="text-[var(--gs-fg)] hover:underline outline-none">Upgrade to Pro</button> to get unlimited projects, clients, and team members.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
