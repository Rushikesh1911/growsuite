"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Activity, Target, Users, Folder, Receipt, CreditCard, CheckSquare, CircleDollarSign, ChevronDown, Check } from "lucide-react";
import { TableSkeleton } from "@/components/ui/skeleton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ActivityActor {
  id: number;
  name: string;
  email: string;
}

interface ActivityLog {
  id: number;
  action: string;
  title: string;
  description: string;
  createdAt: string;
  actor: ActivityActor;
  lead?: { id: number; contactName: string; company: string };
  client?: { id: number; name: string; company: string };
  project?: { id: number; name: string };
  task?: { id: number; title: string };
  invoice?: { id: number; invoiceNumber: string };
}

interface ActivityFeedProps {
  token: string;
  workspaceId: number;
}

const FILTERS = [
  { value: 'ALL', label: 'All activity' },
  { value: 'LEAD', label: 'Leads' },
  { value: 'DEAL', label: 'Deals' },
  { value: 'CLIENT', label: 'Clients' },
  { value: 'PROJECT', label: 'Projects' },
  { value: 'TASK', label: 'Tasks' },
  { value: 'INVOICE', label: 'Invoices' },
  { value: 'PAYMENT', label: 'Payments' },
];

export function ActivityFeed({ token, workspaceId }: ActivityFeedProps) {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/activity?limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (err) {
      console.error("Failed to fetch activity feed", err);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId]);

  useEffect(() => {
    fetchActivities();
    
    const handleRefresh = () => fetchActivities();
    window.addEventListener("refreshData", handleRefresh);
    return () => window.removeEventListener("refreshData", handleRefresh);
  }, [fetchActivities]);

  const filteredActivities = useMemo(() => {
    if (filter === 'ALL') return activities;
    return activities.filter(log => log.action.includes(filter));
  }, [activities, filter]);

  const groupedActivities = useMemo(() => {
    const groups: Record<string, ActivityLog[]> = {};
    
    filteredActivities.forEach(log => {
      const date = new Date(log.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let key = "";
      if (date.toDateString() === today.toDateString()) {
        key = "TODAY";
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = "YESTERDAY";
      } else {
        key = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(log);
    });
    
    return groups;
  }, [filteredActivities]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };
  
  const getActionLabel = (action: string) => {
    const map: Record<string, string> = {
      LEAD_CREATED: "Lead created",
      LEAD_UPDATED: "Lead updated",
      LEAD_STATUS_UPDATED: "Lead status updated",
      LEAD_CONVERTED: "Lead converted to deal",
      DEAL_CREATED: "Deal created",
      DEAL_CREATED_FROM_LEAD: "Deal created from lead",
      DEAL_UPDATED: "Deal updated",
      DEAL_STAGE_UPDATED: "Deal stage updated",
      DEAL_WON: "Deal won",
      DEAL_LOST: "Deal lost",
      CLIENT_CREATED: "Client added",
      CLIENT_UPDATED: "Client updated",
      PROJECT_CREATED: "Project created",
      PROJECT_UPDATED: "Project updated",
      TASK_CREATED: "Task created",
      TASK_UPDATED: "Task updated",
      TASK_COMPLETED: "Task completed",
      TASK_STATUS_UPDATED: "Task moved",
      INVOICE_CREATED: "Invoice created",
      INVOICE_UPDATED: "Invoice updated",
      INVOICE_SENT: "Invoice sent",
      INVOICE_PAID: "Invoice paid",
      PAYMENT_RECORDED: "Payment received",
    };
    return map[action] || action.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase());
  };

  const getSmartDescription = (log: ActivityLog) => {
    let desc = log.description || log.title;
    
    // Parse status changes if possible (e.g., "Status changed from X to Y")
    const match = desc.match(/changed from (.*) to (.*)/i) || desc.match(/updated from (.*) to (.*)/i);
    let transition = "";
    if (match) {
       // Convert enum-like statuses to readable
       const from = match[1].replace(/_/g, ' ');
       const to = match[2].replace(/_/g, ' ');
       transition = `${from.charAt(0).toUpperCase() + from.slice(1).toLowerCase()} → ${to.charAt(0).toUpperCase() + to.slice(1).toLowerCase()}`;
    }

    // Identify entity context
    let context = "";
    if (log.lead) context = log.lead.contactName || log.lead.company;
    else if (log.client) context = log.client.name;
    else if (log.project) context = log.project.name;
    else if (log.task) context = log.task.title;
    else if (log.invoice) context = `INV-${log.invoice.invoiceNumber}`;

    // Custom overrides based on action
    if (log.action === 'LEAD_CONVERTED' && log.lead) {
       return <><span className="text-[var(--gs-fg)] font-medium">{context}</span> → Deal</>;
    }
    if (log.action === 'DEAL_CREATED_FROM_LEAD' && log.lead) {
       return <>Generated from lead &middot; <span className="text-[var(--gs-fg)] font-medium">{context}</span></>;
    }
    if (log.action === 'INVOICE_PAID' || log.action === 'PAYMENT_RECORDED') {
       if (desc.includes('₹') || desc.includes('$')) {
          const amtMatch = desc.match(/([₹$]\d+[,\d]*)/);
          const amt = amtMatch ? amtMatch[1] : '';
          if (amt) {
             return <><span className="text-[var(--gs-fg)] font-medium">{context}</span> &middot; {amt} received</>;
          }
       }
    }

    if (transition) {
       if (context) return <><span className="text-[var(--gs-fg)] font-medium">{context}</span> &middot; {transition}</>;
       return transition;
    }

    const generic = desc.toLowerCase() === log.title.toLowerCase() || desc.toLowerCase() === log.action.replace(/_/g, ' ').toLowerCase();
    
    if (generic) {
       return <span className="text-[var(--gs-fg)] font-medium">{context}</span>;
    }

    if (context && !desc.includes(context)) {
       return <><span className="text-[var(--gs-fg)] font-medium">{context}</span> &middot; {desc}</>;
    }

    return desc;
  };

  const getActorLabel = (actor: ActivityActor) => {
    if (actor && (actor.name || actor.email)) {
      if (actor.email === 'system@growsuite.com' || actor.name?.toLowerCase() === 'system admin') {
         return 'System';
      }
      return `${actor.name || actor.email}`;
    }
    return 'System';
  };

  const getEntityUrl = (log: ActivityLog) => {
    if (log.lead) return `/dashboard/leads/${log.lead.id}`;
    if (log.client) return `/dashboard/clients/${log.client.id}`;
    if (log.project) return `/dashboard/projects/${log.project.id}`;
    if (log.invoice) return `/dashboard/invoices/${log.invoice.id}`;
    return null;
  };

  const getIconForAction = (action: string) => {
    if (action.includes("LEAD")) return <Target className="h-4 w-4 text-[#007CF0]" />;
    if (action.includes("DEAL")) return <CircleDollarSign className="h-4 w-4 text-[#10B981]" />;
    if (action.includes("CLIENT")) return <Users className="h-4 w-4 text-[#7928CA]" />;
    if (action.includes("PROJECT")) return <Folder className="h-4 w-4 text-[#F5A623]" />;
    if (action.includes("TASK")) return <CheckSquare className="h-4 w-4 text-[var(--gs-muted)]" />;
    if (action.includes("INVOICE")) return <Receipt className="h-4 w-4 text-[#FF0080]" />;
    if (action.includes("PAYMENT")) return <CreditCard className="h-4 w-4 text-[var(--gs-fg)]" />;
    return <Activity className="h-4 w-4 text-[var(--gs-muted)]" />;
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="w-full max-w-[800px] mx-auto flex flex-col gap-8 animate-fade pb-16 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E1E1E] pb-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-[var(--gs-fg)] tracking-tight">Activity Log</h1>
          <p className="text-[13px] text-[var(--gs-muted)]">Real-time timeline of workspace events.</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center justify-between gap-3 bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] hover:border-[var(--gs-border-strong)] px-3 py-1.5 rounded-[6px] text-[13px] font-medium text-[var(--gs-fg)] transition-colors outline-none min-w-[140px] shadow-sm"
          >
            {FILTERS.find(f => f.value === filter)?.label}
            <ChevronDown className="h-3.5 w-3.5 text-[var(--gs-muted)]" />
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px] shadow-2xl overflow-hidden z-50">
              <div className="flex flex-col p-1">
                {FILTERS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => { setFilter(f.value); setFilterOpen(false); }}
                    className={`flex items-center justify-between px-3 py-2 text-[13px] rounded-[4px] font-medium transition-colors ${
                      filter === f.value ? "bg-[#252528] text-[var(--gs-fg)]" : "text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)]"
                    }`}
                  >
                    {f.label}
                    {filter === f.value && <Check className="h-3.5 w-3.5 text-[var(--gs-fg)]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px] shadow-sm">
            <Activity className="h-8 w-8 text-[#555555] mb-4" />
            <h3 className="text-[var(--gs-fg)] font-semibold text-[14px]">No activity found</h3>
            <p className="text-[var(--gs-muted)] text-[13px] mt-1">Adjust your filters to see more events.</p>
          </div>
        ) : (
          Object.entries(groupedActivities).map(([dateLabel, groupLogs], groupIndex) => (
            <div key={dateLabel} className="flex flex-col mb-8 last:mb-0">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-widest">{dateLabel}</span>
                <div className="flex-1 h-px bg-[#1E1E1E]" />
              </div>
              
              <div className="relative pl-6 md:pl-[120px]">
                {/* Continuous Vertical Timeline Line */}
                <div className="absolute left-6 md:left-[120px] top-4 bottom-[-16px] w-px bg-[#1E1E1E] -ml-[0.5px] z-0" />

                {groupLogs.map((log) => {
                  const label = getActionLabel(log.action);
                  const icon = getIconForAction(log.action);
                  const description = getSmartDescription(log);
                  const actorText = getActorLabel(log.actor);
                  const url = getEntityUrl(log);
                  
                  return (
                    <div 
                      key={log.id} 
                      onClick={() => url ? router.push(url) : null}
                      className={`relative flex items-start gap-4 md:gap-5 mb-8 last:mb-0 group ${url ? 'cursor-pointer' : ''}`}
                    >
                      {/* Desktop Timestamp (Left of line) */}
                      <div className="hidden md:block absolute left-[-110px] top-[6px] w-[90px] text-right text-[12px] font-medium text-[#555555] tracking-tight group-hover:text-[var(--gs-muted)] transition-colors">
                        {formatTime(log.createdAt)}
                      </div>

                      {/* Timeline Node (The Icon) */}
                      <div className={`relative z-10 shrink-0 w-8 h-8 rounded-full border bg-[var(--gs-surface)] flex flex-shrink-0 items-center justify-center ml-[-16px] shadow-sm transition-colors ${url ? 'border-[var(--gs-border)] group-hover:border-[#555555]' : 'border-[#1E1E1E]'}`}>
                        {icon}
                      </div>

                      {/* Content (Right of line) */}
                      <div className="flex-1 flex flex-col min-w-0 pt-[4px]">
                        <div className="flex items-center justify-between md:justify-start gap-3">
                          <span className={`text-[14px] font-semibold transition-colors ${url ? 'text-[var(--gs-fg)] group-hover:text-[#FFFFFF]' : 'text-[var(--gs-fg)]'}`}>
                            {label}
                          </span>
                          {/* Mobile Timestamp */}
                          <span className="md:hidden text-[12px] font-medium text-[#555555]">{formatTime(log.createdAt)}</span>
                        </div>
                        
                        {description && (
                          <span className="text-[13px] text-[var(--gs-muted)] mt-1.5 leading-relaxed">
                            {description}
                          </span>
                        )}
                        
                        <div className="flex items-center mt-2.5">
                           <div className="flex items-center gap-1.5 bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] px-2 py-0.5 rounded-[4px]">
                              <span className="text-[11px] font-semibold text-[var(--gs-muted)]">{actorText}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
