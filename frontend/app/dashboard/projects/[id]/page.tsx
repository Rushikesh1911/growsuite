"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/dashboard/Topbar";
import { EventToast } from "@/components/ui/event-toast";
import { MoreHorizontal } from "lucide-react";
import { TaskManagement } from "@/components/dashboard/projects/TaskManagement";
import { useDashboard } from "../../DashboardContext";
import { formatCurrency } from "@/lib/currency";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ProjectType {
  id: number;
  name: string;
  status: string;
  description: string | null;
  clientId: number;
  deadline: string | null;
  client: { name: string };
  invoices?: {
    id: number;
    invoiceNumber: string;
    total: string;
    balanceDue: string;
    status: string;
    issueDate: string;
    payments?: { id: number; amount: string; date: string; method?: string }[];
  }[];
  activities?: {
    id: number;
    action: string;
    title: string;
    description: string | null;
    createdAt: string;
    actor?: { name: string; email: string };
  }[];
}

type Tab = "tasks" | "invoices" | "activity";

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PLANNING: "bg-[var(--gs-bg-alt)] text-[var(--gs-fg)] border-[var(--gs-border)]",
    ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    ON_HOLD: "bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    CANCELLED: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
  };
  return colors[status] || "bg-[var(--gs-bg-alt)] text-[var(--gs-fg)] border-[var(--gs-border)]";
};

export default function ProjectProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { token, workspaceId } = useDashboard();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("tasks");

  const projectId = params?.id as string;

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId || !token || !workspaceId) return;
      try {
        const res = await fetch(`${API_URL}/api/projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-workspace-id": workspaceId.toString(),
          },
        });
        if (res.ok) {
          const data = await res.json();
          setProject(data);
        } else {
          router.push("/dashboard/projects");
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId, token, workspaceId, router]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Topbar />
        <main className="flex-1 flex items-center justify-center relative z-0">
          <div className="animate-spin h-6 w-6 border-2 border-[var(--gs-fg)] border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  if (!project) return null;

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Topbar 
          breadcrumbs={
            <>
              <span className="text-[13px] font-medium text-[var(--gs-muted)] cursor-pointer hover:text-[var(--gs-fg)] transition-colors" onClick={() => router.push("/dashboard/projects")}>Projects</span>
              <span className="text-[13px] text-[var(--gs-muted-light)]">/</span>
              <span className="text-[13px] font-medium text-[var(--gs-fg)] truncate max-w-[200px]">{project.name}</span>
            </>
          }
        />
        
        <main className="flex-1 flex flex-col overflow-hidden relative z-0 bg-[var(--gs-bg)] animate-in fade-in duration-200">
          
          {/* Header Strip */}
          <div className="px-8 py-5 border-b border-[var(--gs-border)] shrink-0 bg-[var(--gs-surface)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-[18px] font-bold text-[var(--gs-fg)] tracking-tight">{project.name}</h1>
              
              <div className="flex items-center gap-3 border-l border-[var(--gs-border)] pl-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>

                {project.client && (
                  <span 
                    onClick={() => router.push(`/dashboard/clients/${project.clientId}`)}
                    className="text-[12px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors cursor-pointer outline-none flex items-center gap-1"
                  >
                    {project.client.name} <span className="text-[10px] opacity-70">↗</span>
                  </span>
                )}
                
                {project.deadline && (
                  <div className="flex items-center gap-1.5 text-[12px] text-[var(--gs-muted)]">
                    <span>Due {new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 bg-[var(--gs-bg)] hover:bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] text-[var(--gs-muted)] hover:text-[var(--gs-fg)] px-2 py-1.5 rounded-[6px] transition-colors shadow-sm outline-none">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-8 flex items-center gap-6 border-b border-[var(--gs-border)] bg-[var(--gs-surface)] shrink-0">
            {(['tasks', 'invoices', 'activity'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-[13px] font-semibold transition-colors outline-none relative ${
                  activeTab === tab 
                    ? 'text-[var(--gs-fg)]' 
                    : 'text-[var(--gs-muted)] hover:text-[var(--gs-fg-secondary)]'
                }`}
              >
                <span className="capitalize">{tab}</span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--gs-fg)] rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Area (flex-1 to take remaining space) */}
          <div className="flex-1 overflow-hidden relative">
            {activeTab === "tasks" && (
              <TaskManagement projectId={parseInt(projectId)} workspaceId={parseInt(localStorage.getItem('growsuite_workspace_id') || "0")} token={localStorage.getItem('growsuite_token') || ""} />
            )}
            
            {activeTab === "invoices" && (
              <div className="flex flex-col gap-8 p-8 h-full overflow-y-auto custom-scrollbar">
                
                {/* Invoices */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[14px] font-bold text-[var(--gs-fg)] tracking-tight">Invoices</h3>
                  {!project.invoices || project.invoices.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center border border-dashed border-[var(--gs-border)] rounded-[8px] bg-[var(--gs-surface)]">
                      <span className="text-[13px] font-medium text-[var(--gs-muted)]">No invoices found for this project.</span>
                    </div>
                  ) : (
                    <div className="border border-[var(--gs-border)] rounded-[8px] overflow-hidden bg-[var(--gs-surface)]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[var(--gs-border)] bg-[var(--gs-bg-alt)]">
                            <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Invoice #</th>
                            <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Status</th>
                            <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider text-right">Total</th>
                            <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider text-right">Balance Due</th>
                            <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Issue Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {project.invoices.map((invoice) => (
                            <tr key={invoice.id} className="border-b border-[var(--gs-border)] last:border-b-0 hover:bg-[var(--gs-bg-alt)] transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/finance`)}>
                              <td className="px-4 py-3 text-[13px] font-bold text-[var(--gs-fg)]">{invoice.invoiceNumber}</td>
                              <td className="px-4 py-3 text-[12px]"><span className="px-2 py-1 bg-[var(--gs-border)] rounded-[4px]">{invoice.status}</span></td>
                              <td className="px-4 py-3 text-[13px] font-medium text-[var(--gs-fg)] text-right">{formatCurrency(Number(invoice.total))}</td>
                              <td className="px-4 py-3 text-[13px] font-bold text-[var(--gs-fg)] text-right">{formatCurrency(Number(invoice.balanceDue))}</td>
                              <td className="px-4 py-3 text-[12px] text-[var(--gs-muted)]">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Payments */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[14px] font-bold text-[var(--gs-fg)] tracking-tight">Payments</h3>
                  {(!project.invoices || !project.invoices.some(inv => inv.payments && inv.payments.length > 0)) ? (
                    <div className="py-12 flex flex-col items-center justify-center border border-dashed border-[var(--gs-border)] rounded-[8px] bg-[var(--gs-surface)]">
                      <span className="text-[13px] font-medium text-[var(--gs-muted)]">No payments found.</span>
                    </div>
                  ) : (
                    <div className="border border-[var(--gs-border)] rounded-[8px] overflow-hidden bg-[var(--gs-surface)]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[var(--gs-border)] bg-[var(--gs-bg-alt)]">
                            <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Date</th>
                            <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Invoice #</th>
                            <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider text-right">Amount</th>
                            <th className="px-4 py-2.5 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Method</th>
                          </tr>
                        </thead>
                        <tbody>
                          {project.invoices.flatMap(inv => 
                            (inv.payments || []).map(payment => ({ ...payment, invoiceNumber: inv.invoiceNumber }))
                          ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((payment) => (
                            <tr key={payment.id} className="border-b border-[var(--gs-border)] last:border-b-0 hover:bg-[var(--gs-bg-alt)] transition-colors">
                              <td className="px-4 py-3 text-[12px] text-[var(--gs-fg)]">{new Date(payment.date).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-[12px] text-[var(--gs-muted)]">{payment.invoiceNumber}</td>
                              <td className="px-4 py-3 text-[13px] font-bold text-[var(--gs-fg)] text-right">{formatCurrency(Number(payment.amount))}</td>
                              <td className="px-4 py-3 text-[12px] text-[var(--gs-muted)]">{payment.method || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}
            
            {activeTab === "activity" && (
              <div className="h-full overflow-y-auto custom-scrollbar p-8">
                <div className="flex flex-col gap-4 max-w-2xl mx-auto">
                  <h3 className="text-[14px] font-bold text-[var(--gs-fg)] tracking-tight">Event History</h3>
                  
                  {!project.activities || project.activities.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center border border-dashed border-[var(--gs-border)] rounded-[8px] bg-[var(--gs-surface)]">
                      <span className="text-[13px] font-medium text-[var(--gs-muted)]">No recent activity.</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 relative">
                      <div className="absolute left-4 top-2 bottom-2 w-px bg-[var(--gs-border)]" />
                      {project.activities.map((act) => (
                        <div key={act.id} className="flex gap-4 relative z-10">
                          <div className="w-8 h-8 rounded-full bg-[var(--gs-surface)] border-2 border-[var(--gs-border)] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                            <span className="text-[10px] font-bold text-[var(--gs-fg)]">
                              {act.actor?.name?.[0]?.toUpperCase() || act.actor?.email?.[0]?.toUpperCase() || "A"}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 pt-1.5 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-bold text-[var(--gs-fg)]">{act.title}</span>
                              <span className="text-[11px] font-mono text-[var(--gs-muted)]">• {new Date(act.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                            </div>
                            {act.description && (
                              <p className="text-[13px] text-[var(--gs-muted)] leading-relaxed">{act.description}</p>
                            )}
                            <span className="text-[11px] font-bold text-[var(--gs-muted-light)] uppercase tracking-wider mt-1">{act.action.replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </main>
      </div>
      <EventToast />
    </>
  );
}
