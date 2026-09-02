"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { CustomFieldDef } from "../../components/dashboard/shared/CustomFieldsRenderer";

interface DashboardContextType {
  token: string;
  workspaceId: number;
  customFields: CustomFieldDef[];
  refreshCustomFields: () => Promise<void>;
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
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);

  const refreshCustomFields = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/custom-fields`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString()
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomFields(data);
      }
    } catch (e) {
      console.error('Failed to load custom fields', e);
    }
  };

  useEffect(() => {
    refreshCustomFields();
  }, [token, workspaceId]);

  return (
    <DashboardContext.Provider value={{ token, workspaceId, customFields, refreshCustomFields }}>
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
