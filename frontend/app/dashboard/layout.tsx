"use client";

import { useEffect, useState, useCallback, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar, DashboardView } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { DashboardProvider } from "./DashboardContext";
import { Toast } from "@/components/ui/toast";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { GlobalTimer } from "@/components/dashboard/time/GlobalTimer";
import { CommandPalette } from "@/components/dashboard/CommandPalette";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Extract current view from pathname for Sidebar state
  // e.g., "/dashboard/invoices" -> "invoices"
  // "/dashboard" -> "dashboard"
  const viewMap: Record<string, DashboardView> = {
    "/dashboard": "dashboard",
    "/dashboard/leads": "leads",
    "/dashboard/pipeline": "pipeline",
    "/dashboard/clients": "clients",
    "/dashboard/projects": "projects",
    "/dashboard/tasks": "tasks",
    "/dashboard/calendar": "calendar",
    "/dashboard/time-tracking": "time-tracking",
    "/dashboard/invoices": "invoices",
    "/dashboard/payments": "payments",
    "/dashboard/analytics": "analytics",
    "/dashboard/activity": "activity",
    "/dashboard/settings": "settings",
  };
  
  // Try to match exact path, or fallback to the first path segment
  const currentView = viewMap[pathname] || 
    (pathname.startsWith("/dashboard/") ? (pathname.split("/")[2] as DashboardView) || "dashboard" : "dashboard");

  const setView = (view: DashboardView) => {
    if (view === "dashboard") {
      router.push("/dashboard");
    } else {
      router.push(`/dashboard/${view}`);
    }
  };

  // Auth State
  const [token, setToken] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // Toast notification
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastAction, setToastAction] = useState<{ label: string, onClick: () => void } | undefined>(undefined);

  // Check auth and fetch me
  useEffect(() => {
    const storedToken = localStorage.getItem("growsuite_token");
    if (!storedToken) {
      router.push("/auth/sign-in");
      return;
    }
    
    setToken(storedToken);

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Auth failed");
        return res.json();
      })
      .then(data => {
        if (data.hasCompletedOnboarding === false) {
          router.push("/onboarding");
          return;
        }

        if (data.workspaceMemberships && data.workspaceMemberships.length > 0) {
          const storedWsId = localStorage.getItem("growsuite_workspace_id");
          let validWsId = data.workspaceMemberships.find((m: any) => m.workspaceId.toString() === storedWsId)?.workspaceId;
          
          if (!validWsId) {
            validWsId = data.workspaceMemberships[0].workspaceId;
          }

          setWorkspaceId(validWsId);
          localStorage.setItem("growsuite_workspace_id", validWsId.toString());
          setIsAuthChecking(false);
        } else {
          // If the user has no workspace (e.g. legacy signup), log them out
          localStorage.removeItem("growsuite_token");
          router.push("/auth/sign-in");
        }
      })
      .catch(() => {
        localStorage.removeItem("growsuite_token");
        router.push("/auth/sign-in");
      });
  }, [router]);

  useEffect(() => {
    const handleShowToast = (e: Event) => {
      const customEvent = e as CustomEvent<{message: string, type: "success" | "error", action?: { label: string, onClick: () => void }}>;
      setToastMsg(customEvent.detail.message);
      setToastType(customEvent.detail.type);
      setToastAction(customEvent.detail.action);
      setToastOpen(true);
    };
    window.addEventListener('showToast', handleShowToast);
    return () => window.removeEventListener('showToast', handleShowToast);
  }, []);

  if (isAuthChecking || !token || !workspaceId) {
    return (
      <div className="dark-theme flex h-screen bg-[var(--gs-bg)] items-center justify-center">
        <div className="text-[var(--gs-muted)] text-sm animate-pulse">Initializing Workspace Environment...</div>
      </div>
    );
  }

  // NOTE: If we are on /dashboard/clients/[id], we might want to hide the wrapper?
  // Actually, wait! In App Router, `layout.tsx` wraps ALL child routes.
  // If `clients/[id]` defines its own Topbar and scrolling area, we shouldn't render the Topbar and <main> here for those routes.
  // We can just render Sidebar, and let children define the rest?
  // Wait, if we want consistency, we should render Topbar here for the standard dashboard routes,
  // but for detailed routes like ClientProfile, they have a custom Topbar with breadcrumbs!
  // To solve this, `layout.tsx` should only provide the Sidebar.
  // The children should handle their own Topbar and scrolling area!
  
  // Wait, if I do that, I have to add Topbar and <main> wrapper to EVERY sub-route.
  // That's a good trade-off for full control.

  return (
    <DashboardProvider token={token} workspaceId={workspaceId}>
      <SocketProvider>
        <div className="dark-theme flex h-screen bg-[var(--gs-bg)] text-[var(--gs-fg)] font-sans overflow-hidden selection:bg-[var(--gs-bg-alt)]">
          
          {/* Sidebar navigation */}
          <Sidebar currentView={currentView} setView={setView} />

          {/* The child route handles its own Topbar and scrolling content area */}
          {children}
          
          <GlobalTimer />

          {/* Global Toast component */}
          <Toast
            isOpen={toastOpen}
            onClose={() => setToastOpen(false)}
            message={toastMsg}
            type={toastType}
            action={toastAction}
          />
          
          <CommandPalette />
        </div>
      </SocketProvider>
    </DashboardProvider>
  );
}
