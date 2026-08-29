"use client";

import { useState } from "react";
import { User, Settings, Users, CreditCard, Shield, Sliders, Puzzle } from "lucide-react";
import { GeneralSettings } from "./GeneralSettings";
import { TeamSettings } from "./TeamSettings";
import { BillingSettings } from "./BillingSettings";
import { IntegrationsSettings } from "./IntegrationsSettings";
import { ProfileSettings } from "./ProfileSettings";
import { PreferencesSettings } from "./PreferencesSettings";
import { SecuritySettings } from "./SecuritySettings";

interface SettingsLayoutProps {
  token: string;
  workspaceId: number;
}

export type SettingsTab = 
  | "general" 
  | "team" 
  | "billing" 
  | "integrations" 
  | "profile" 
  | "preferences" 
  | "security";

export function SettingsLayout({ token, workspaceId }: SettingsLayoutProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const NavItem = ({ id, label, icon: Icon }: { id: SettingsTab; label: string; icon: any }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[14px] transition-all relative ${
          isActive 
            ? "bg-[#141414] text-[var(--gs-fg)] font-medium" 
            : "text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[#141414] font-medium"
        }`}
      >
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--gs-fg)] rounded-l-md" />}
        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[var(--gs-fg)]" : "text-[var(--gs-muted)]"}`} />
        {label}
      </button>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[var(--gs-bg-alt)] text-[var(--gs-fg)]">
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-12 animate-fade pb-20 pt-8 px-6">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-[240px] shrink-0 flex flex-col gap-6 md:sticky md:top-8 self-start">
          <div className="flex flex-col gap-1 px-1">
            <h1 className="text-[24px] font-semibold text-[var(--gs-fg)] tracking-tight">Settings</h1>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wide px-3 mb-1">Workspace</span>
            <NavItem id="general" label="General" icon={Settings} />
            <NavItem id="team" label="Team Members" icon={Users} />
            <NavItem id="billing" label="Billing & Plans" icon={CreditCard} />
            <NavItem id="integrations" label="Integrations" icon={Puzzle} />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wide px-3 mb-1 mt-2">Personal</span>
            <NavItem id="profile" label="Profile" icon={User} />
            <NavItem id="preferences" label="Preferences" icon={Sliders} />
            <NavItem id="security" label="Security" icon={Shield} />
          </div>
        </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {activeTab === "general" && <GeneralSettings token={token} workspaceId={workspaceId} />}
        {activeTab === "team" && <TeamSettings token={token} workspaceId={workspaceId} />}
        {activeTab === "billing" && <BillingSettings token={token} workspaceId={workspaceId} />}
        {activeTab === "integrations" && <IntegrationsSettings token={token} workspaceId={workspaceId} />}
        
        {activeTab === "profile" && <ProfileSettings token={token} />}
        {activeTab === "preferences" && <PreferencesSettings token={token} />}
        {activeTab === "security" && <SecuritySettings token={token} />}
      </main>
      </div>
    </div>
  );
}
