"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { SidebarFooter } from "./SidebarFooter";
import { LayoutDashboard, Target, Layers, Users, FolderKanban, CheckSquare, Calendar, Receipt, CreditCard, LineChart, Activity, ChevronsUpDown, Settings, Menu, LifeBuoy, Timer } from "lucide-react";

export type DashboardView = "dashboard" | "leads" | "pipeline" | "clients" | "projects" | "tasks" | "time-tracking" | "calendar" | "invoices" | "payments" | "analytics" | "activity" | "settings" | "profile" | "help";

interface SidebarProps {
  currentView: DashboardView;
  setView: (view: DashboardView) => void;
}

export function Sidebar({ currentView, setView }: SidebarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [workspaceName, setWorkspaceName] = useState<string>("Loading...");
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("growsuite_token");
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.workspaceMemberships && data.workspaceMemberships.length > 0) {
          setWorkspaces(data.workspaceMemberships);
          const currentId = localStorage.getItem("growsuite_workspace_id");
          let currentWs = data.workspaceMemberships.find((m: any) => m.workspace.id.toString() === currentId);
          if (!currentWs) {
            currentWs = data.workspaceMemberships[0];
            localStorage.setItem("growsuite_workspace_id", currentWs.workspace.id.toString());
          }
          setWorkspaceName(currentWs.workspace.name);
        } else {
          setWorkspaceName("My Workspace");
        }
      })
      .catch(() => setWorkspaceName("My Workspace"));
    } else {
      setWorkspaceName("My Workspace");
    }
  }, []);

  // Helper for Nav Items
  const NavItem = ({ id, label, icon: Icon }: { id: DashboardView, label: string, icon: any }) => (
    <button
      onClick={() => setView(id)}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center ${collapsed ? "justify-center px-0 py-2" : "gap-2.5 px-3 py-1.5"} rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer outline-none ${
        currentView === id
          ? "bg-[var(--gs-surface)] text-[var(--gs-fg)]"
          : "text-[var(--gs-muted)] hover:bg-[var(--gs-surface)] hover:text-[var(--gs-fg)]"
      }`}
    >
      <Icon strokeWidth={1.5} className={`h-[18px] w-[18px] shrink-0 ${currentView === id ? "text-[var(--gs-fg)]" : "text-[var(--gs-muted)]"}`} />
      {!collapsed && <span>{label}</span>}
    </button>
  );

  const Divider = () => (
    <div className="w-full px-3 py-1 flex justify-center">
      <div className={`h-px bg-[#1A1A1A] ${collapsed ? "w-6" : "w-full"}`} />
    </div>
  );

  const handleSwitchWorkspace = (id: number) => {
    localStorage.setItem("growsuite_workspace_id", id.toString());
    window.location.reload();
  };

  return (
    <aside 
      className={`${collapsed ? "w-[68px]" : "w-[260px]"} bg-[var(--gs-bg)] border-r border-[var(--gs-border)] flex flex-col h-screen shrink-0 text-[var(--gs-fg)] transition-all duration-300 ease-[var(--gs-ease)] relative z-20`} 
      aria-label="Main Navigation"
    >
      {/* Top Brand Logo */}
      <div className={`p-4 pb-2 flex items-center ${collapsed ? "justify-center" : "justify-start"} h-[64px]`}>
        <Logo theme="dark" showWordmark={!collapsed} className={collapsed ? "justify-center w-full" : ""} />
      </div>

      {/* Workspace Selector & Hamburger */}
      <div className={`px-4 pb-4 pt-2 flex flex-col gap-4 relative group`} ref={switcherRef}>
        
        {/* Header Block with Hamburger Menu */}
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} relative`}>
          <div className="flex items-center gap-3 w-full">
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="h-7 w-7 rounded-[6px] hover:bg-[var(--gs-surface)] flex items-center justify-center text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none shrink-0"
              title="Toggle Sidebar"
            >
              <Menu className="h-4 w-4" strokeWidth={2} />
            </button>
            {!collapsed && (
              <div 
                className="flex items-center justify-between flex-1 min-w-0 cursor-pointer hover:bg-[var(--gs-surface)] p-1.5 -ml-1.5 rounded-[6px] transition-colors"
                onClick={() => setSwitcherOpen(!switcherOpen)}
              >
                <span className="text-[14px] font-semibold tracking-tight leading-tight truncate text-[var(--gs-fg)] max-w-[130px]">{workspaceName}</span>
                <div className="h-5 w-5 rounded-[4px] border border-[var(--gs-border)] hover:border-[var(--gs-muted-light)] flex items-center justify-center transition-colors bg-[var(--gs-bg-alt)] shrink-0">
                  <ChevronsUpDown className="h-3 w-3 text-[var(--gs-muted)]" strokeWidth={2} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Workspace Switcher Dropdown */}
        {!collapsed && switcherOpen && (
          <div className="absolute top-[60px] left-4 w-[228px] bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[8px] shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1.5 mb-1">
              <span className="text-[10px] font-bold text-[var(--gs-muted-light)] tracking-wider uppercase">Workspaces</span>
            </div>
            
            <div className="max-h-[200px] overflow-y-auto">
              {workspaces.map((m: any) => (
                <button
                  key={m.workspace.id}
                  onClick={() => handleSwitchWorkspace(m.workspace.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[13px] text-[var(--gs-fg)] hover:bg-[#1A1A1A] transition-colors text-left"
                >
                  <span className="truncate">{m.workspace.name}</span>
                  {workspaceName === m.workspace.name && (
                    <span className="text-[#007CF0]">✓</span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="h-px bg-[var(--gs-border)] my-1" />
            
            <button
              onClick={() => {
                setSwitcherOpen(false);
                router.push('/dashboard/workspaces/new');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[#1A1A1A] transition-colors text-left"
            >
              <span className="text-lg leading-none mb-0.5">+</span> Create workspace
            </button>
            <button
              onClick={() => {
                setSwitcherOpen(false);
                setView('settings');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[#1A1A1A] transition-colors text-left"
            >
              <Settings className="h-3.5 w-3.5" />
              Manage workspace
            </button>
          </div>
        )}
      </div>

      {/* Main Nav */}
      <nav className={`flex-1 ${collapsed ? "px-2" : "px-3"} pb-4 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden`}>
        
        <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
        <Divider />
        
        <NavItem id="leads" label="Leads" icon={Target} />
        <NavItem id="pipeline" label="Pipeline" icon={Layers} />
        <NavItem id="clients" label="Clients" icon={Users} />
        <Divider />

        <NavItem id="projects" label="Projects" icon={FolderKanban} />
        <NavItem id="tasks" label="Tasks" icon={CheckSquare} />
        <NavItem id="time-tracking" label="Time Tracking" icon={Timer} />
        <NavItem id="calendar" label="Calendar" icon={Calendar} />
        <Divider />

        <NavItem id="invoices" label="Invoices" icon={Receipt} />
        <NavItem id="payments" label="Payments" icon={CreditCard} />
        <Divider />

        <NavItem id="analytics" label="Analytics" icon={LineChart} />
        <NavItem id="activity" label="Activity" icon={Activity} />
      </nav>

      {/* Bottom Footer Area */}
      <SidebarFooter collapsed={collapsed} />

    </aside>
  );
}
