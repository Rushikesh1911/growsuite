"use client";
import React, { createContext, useContext } from "react";

interface DashboardContextType {
  token: string;
  workspaceId: number;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ 
  children, 
  token, 
  workspaceId 
}: { 
  children: React.ReactNode, 
  token: string, 
  workspaceId: number 
}) {
  return (
    <DashboardContext.Provider value={{ token, workspaceId }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return ctx;
}
