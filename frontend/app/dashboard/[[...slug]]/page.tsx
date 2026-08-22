"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { DashboardView } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Overview } from "@/components/dashboard/Overview";
import { CrmPipeline } from "@/components/dashboard/crm/CrmPipeline";
import { LeadDirectory } from "@/components/dashboard/crm/LeadDirectory";
import { ClientDirectory } from "@/components/dashboard/clients/ClientDirectory";
import { ProjectBoard } from "@/components/dashboard/projects/ProjectBoard";
import { TaskDirectory } from "@/components/dashboard/tasks/TaskDirectory";
import { CalendarBoard } from "@/components/dashboard/calendar/CalendarBoard";
import { FinanceDashboard } from "@/components/dashboard/finance/FinanceDashboard";
import { PaymentsDashboard } from "@/components/dashboard/finance/PaymentsDashboard";
import { ActivityFeed } from "@/components/dashboard/activity/ActivityFeed";
import { AnalyticsDashboard } from "@/components/dashboard/analytics/AnalyticsDashboard";
import { WorkspaceSettings } from "@/components/dashboard/settings/WorkspaceSettings";
import { ProfileSettings } from "@/components/dashboard/settings/ProfileSettings";
import { GettingStartedChecklist } from "@/components/dashboard/GettingStartedChecklist";
import { useDashboard } from "../DashboardContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DashboardSubRoute() {
  const params = useParams();
  const slug = params.slug as string[] | undefined;
  
  // Determine view from URL
  const currentView: DashboardView = (slug && slug.length > 0) ? (slug[0] as DashboardView) : "dashboard";
  
  const { token, workspaceId } = useDashboard();
  
  // Update document title dynamically based on view
  useEffect(() => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      leads: "Leads",
      pipeline: "Sales Pipeline",
      clients: "Clients",
      projects: "Projects",
      tasks: "Tasks",
      calendar: "Calendar",
      invoices: "Invoices",
      payments: "Payments",
      activity: "Activity Feed",
      analytics: "Analytics",
      settings: "Workspace Settings",
      profile: "Profile Settings",
    };
    
    document.title = `${titles[currentView] || "Dashboard"} — GrowSuite`;
  }, [currentView]);

  const handleRefresh = async () => {
    // Dispatch an event to child components to refresh
    window.dispatchEvent(new Event('refreshData'));
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Topbar panel */}
      <Topbar currentView={currentView} />

      {/* Main View scrollable */}
      <main className="flex-1 overflow-y-auto px-8 py-8 bg-[var(--gs-bg)] relative z-0">
        <div className="max-w-5xl w-full mx-auto">
          {currentView === "dashboard" && (
            <>
              <GettingStartedChecklist />
              <Overview
                token={token}
                workspaceId={workspaceId}
              />
            </>
          )}

          {currentView === "leads" && (
            <LeadDirectory token={token} workspaceId={workspaceId} />
          )}

          {currentView === "pipeline" && (
            <CrmPipeline token={token} workspaceId={workspaceId} />
          )}

          {currentView === "clients" && (
            <ClientDirectory token={token} workspaceId={workspaceId} />
          )}

          {currentView === "projects" && (
            <ProjectBoard token={token} workspaceId={workspaceId} />
          )}

          {currentView === "tasks" && (
            <TaskDirectory token={token} workspaceId={workspaceId} />
          )}

          {currentView === "calendar" && (
            <CalendarBoard token={token} workspaceId={workspaceId} />
          )}

          {["invoices", "finance"].includes(currentView) && (
            <FinanceDashboard token={token} workspaceId={workspaceId} />
          )}

          {currentView === "activity" && (
            <ActivityFeed token={token} workspaceId={workspaceId} />
          )}

          {currentView === "settings" && (
            <WorkspaceSettings token={token} workspaceId={workspaceId} />
          )}

          {currentView === "profile" && (
            <ProfileSettings token={token} />
          )}

          {currentView === "analytics" && (
            <AnalyticsDashboard token={token} workspaceId={workspaceId} />
          )}

          {currentView === "payments" && (
            <PaymentsDashboard token={token} workspaceId={workspaceId} />
          )}

          {["help"].includes(currentView) && (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade">
              <div className="h-12 w-12 rounded-full bg-[var(--gs-surface)] flex items-center justify-center mb-4 border border-[var(--gs-border)]">
                <span className="text-[var(--gs-muted)] text-lg font-bold">...</span>
              </div>
              <h2 className="text-lg font-semibold text-[var(--gs-fg)]">Coming Soon</h2>
              <p className="text-sm text-[var(--gs-muted)] mt-1 max-w-sm">This module is part of our upcoming release schedule. Check back later!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
