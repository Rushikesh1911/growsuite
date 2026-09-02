"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Plus, Users, LayoutDashboard, Target, Layers, FolderKanban, CheckSquare, Calendar, Receipt, CreditCard, LineChart, Activity, Timer, Settings, Loader2 } from "lucide-react";
import { NAV_ITEMS } from "./Sidebar";
import { useDashboard } from "@/app/dashboard/DashboardContext";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    leads: any[]; deals: any[]; clients: any[]; projects: any[]; tasks: any[]; invoices: any[];
  } | null>(null);

  const router = useRouter();
  const { token, workspaceId } = useDashboard();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch results
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.trim().length === 0) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(debouncedSearch)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-workspace-id": workspaceId.toString(),
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [debouncedSearch, token, workspaceId]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    setSearch("");
    command();
  };

  const groupHeadingClass = "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[#666] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider mb-1";
  const itemClass = "group flex items-center justify-between px-2 py-2 rounded-[6px] text-[13px] font-medium text-[var(--gs-fg)] cursor-pointer data-[selected=true]:bg-[#1A1A1A] transition-colors";
  const iconClass = "h-[16px] w-[16px] text-[var(--gs-muted)] group-data-[selected=true]:text-[var(--gs-fg)] transition-colors";

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Palette"
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
    >
      <div 
        className="w-full max-w-2xl bg-[#141414] border border-[#262626] rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center px-4 border-b border-[#262626] relative">
          <Command.Input 
            autoFocus
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..." 
            className="w-full bg-transparent border-none text-[15px] font-medium text-[var(--gs-fg)] h-14 focus:outline-none focus:ring-0 placeholder:text-[#666] pr-20"
          />
          {isLoading && (
            <div className="absolute right-20">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--gs-muted)]" />
            </div>
          )}
          <div className="flex items-center gap-1 text-[11px] font-medium text-[#666] shrink-0 absolute right-4">
            <kbd className="bg-[#141414] px-1.5 py-0.5 rounded border border-[#262626] font-mono">ESC</kbd>
            to close
          </div>
        </div>

        <Command.List className="max-h-[350px] overflow-y-auto p-2 custom-scrollbar">
          <Command.Empty className="py-12 text-center text-[13px] text-[#666]">
            No results found
          </Command.Empty>

          {/* DYNAMIC RESULTS */}
          {results && (
            <>
              {results.clients.length > 0 && (
                <Command.Group heading="Clients" className={groupHeadingClass}>
                  {results.clients.map(client => (
                    <Command.Item 
                      key={`client-${client.id}`}
                      value={`client ${client.name} ${client.company || ''}`}
                      onSelect={() => runCommand(() => router.push(`/dashboard/clients/${client.id}`))}
                      className={itemClass}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Users strokeWidth={1.5} className={`${iconClass} shrink-0`} />
                        <span className="truncate">{client.name}</span>
                      </div>
                      {client.company && (
                        <span className="text-[11px] text-[var(--gs-muted)] font-normal ml-4 shrink-0">
                          Company: {client.company}
                        </span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.projects.length > 0 && (
                <Command.Group heading="Projects" className={groupHeadingClass}>
                  {results.projects.map(project => (
                    <Command.Item 
                      key={`proj-${project.id}`}
                      value={`project ${project.name} ${project.client?.name || ''}`}
                      onSelect={() => runCommand(() => router.push(`/dashboard/projects/${project.id}`))}
                      className={itemClass}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FolderKanban strokeWidth={1.5} className={`${iconClass} shrink-0`} />
                        <span className="truncate">{project.name}</span>
                      </div>
                      {project.client?.name && (
                        <span className="text-[11px] text-[var(--gs-muted)] font-normal ml-4 shrink-0">
                          Client: {project.client.name}
                        </span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.tasks.length > 0 && (
                <Command.Group heading="Tasks" className={groupHeadingClass}>
                  {results.tasks.map(task => (
                    <Command.Item 
                      key={`task-${task.id}`}
                      value={`task ${task.title} ${task.project?.name || ''}`}
                      onSelect={() => runCommand(() => router.push(`/dashboard/tasks?taskId=${task.id}`))}
                      className={itemClass}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <CheckSquare strokeWidth={1.5} className={`${iconClass} shrink-0`} />
                        <span className="truncate">{task.title}</span>
                      </div>
                      {task.project?.name && (
                        <span className="text-[11px] text-[var(--gs-muted)] font-normal ml-4 shrink-0">
                          Project: {task.project.name}
                        </span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.invoices.length > 0 && (
                <Command.Group heading="Invoices" className={groupHeadingClass}>
                  {results.invoices.map(invoice => (
                    <Command.Item 
                      key={`inv-${invoice.id}`}
                      value={`invoice ${invoice.invoiceNumber} ${invoice.client?.name || ''}`}
                      onSelect={() => runCommand(() => router.push(`/dashboard/invoices/${invoice.id}`))}
                      className={itemClass}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Receipt strokeWidth={1.5} className={`${iconClass} shrink-0`} />
                        <span className="truncate">{invoice.invoiceNumber}</span>
                      </div>
                      {invoice.client?.name && (
                        <span className="text-[11px] text-[var(--gs-muted)] font-normal ml-4 shrink-0">
                          Client: {invoice.client.name}
                        </span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.leads.length > 0 && (
                <Command.Group heading="Leads" className={groupHeadingClass}>
                  {results.leads.map(lead => (
                    <Command.Item 
                      key={`lead-${lead.id}`}
                      value={`lead ${lead.contactName} ${lead.company || ''}`}
                      onSelect={() => runCommand(() => router.push(`/dashboard/leads/${lead.id}`))}
                      className={itemClass}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Target strokeWidth={1.5} className={`${iconClass} shrink-0`} />
                        <span className="truncate">{lead.contactName}</span>
                      </div>
                      {lead.company && !lead.contactName.toLowerCase().includes(lead.company.toLowerCase()) && (
                        <span className="text-[11px] text-[var(--gs-muted)] font-normal ml-4 shrink-0">
                          Company: {lead.company}
                        </span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.deals.length > 0 && (
                <Command.Group heading="Deals" className={groupHeadingClass}>
                  {results.deals.map(deal => (
                    <Command.Item 
                      key={`deal-${deal.id}`}
                      value={`deal ${deal.title} ${deal.company || ''}`}
                      onSelect={() => runCommand(() => router.push(`/dashboard/pipeline?dealId=${deal.id}`))}
                      className={itemClass}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Layers strokeWidth={1.5} className={`${iconClass} shrink-0`} />
                        <span className="truncate">{deal.title}</span>
                      </div>
                      {deal.company && !deal.title.toLowerCase().includes(deal.company.toLowerCase()) && (
                        <span className="text-[11px] text-[var(--gs-muted)] font-normal ml-4 shrink-0">
                          Company: {deal.company}
                        </span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </>
          )}

          {/* STATIC NAVIGATION & ACTIONS */}
          <Command.Group heading="Navigation" className={groupHeadingClass}>
            {NAV_ITEMS.map((item, idx) => {
              if ("type" in item && item.type === "divider") return null;
              if (!("id" in item)) return null;
              
              const Icon = item.icon as any;
              return (
                <Command.Item 
                  key={item.id}
                  value={`navigate ${item.label}`}
                  onSelect={() => runCommand(() => {
                    if (item.id === "dashboard") {
                      router.push("/dashboard");
                    } else {
                      router.push(`/dashboard/${item.id}`);
                    }
                  })}
                  className={itemClass}
                >
                  <div className="flex items-center gap-3">
                    <Icon strokeWidth={1.5} className={iconClass} />
                    {item.label}
                  </div>
                </Command.Item>
              );
            })}
          </Command.Group>

          <Command.Group heading="Quick Actions" className={groupHeadingClass}>
            <Command.Item 
              value="create task"
              onSelect={() => runCommand(() => {
                window.dispatchEvent(new CustomEvent('openCreateTaskModal'));
                router.push("/dashboard/tasks?create=true");
              })}
              className={itemClass}
            >
              <div className="flex items-center gap-3">
                <CheckSquare strokeWidth={1.5} className={iconClass} />
                Create Task
              </div>
              <kbd className="text-[11px] font-medium text-[#666] font-mono bg-[#141414] px-1.5 py-0.5 rounded border border-[#262626]">T</kbd>
            </Command.Item>

            <Command.Item 
              value="create project"
              onSelect={() => runCommand(() => {
                router.push("/dashboard/projects?create=true");
              })}
              className={itemClass}
            >
              <div className="flex items-center gap-3">
                <FolderKanban strokeWidth={1.5} className={iconClass} />
                Create Project
              </div>
              <kbd className="text-[11px] font-medium text-[#666] font-mono bg-[#141414] px-1.5 py-0.5 rounded border border-[#262626]">P</kbd>
            </Command.Item>

            <Command.Item 
              value="create invoice"
              onSelect={() => runCommand(() => {
                router.push("/dashboard/invoices?create=true");
              })}
              className={itemClass}
            >
              <div className="flex items-center gap-3">
                <Receipt strokeWidth={1.5} className={iconClass} />
                Create Invoice
              </div>
              <kbd className="text-[11px] font-medium text-[#666] font-mono bg-[#141414] px-1.5 py-0.5 rounded border border-[#262626]">I</kbd>
            </Command.Item>

            <Command.Item 
              value="invite team member user"
              onSelect={() => runCommand(() => {
                router.push("/dashboard/settings");
              })}
              className={itemClass}
            >
              <div className="flex items-center gap-3">
                <Users strokeWidth={1.5} className={iconClass} />
                Invite Team Member
              </div>
              <kbd className="text-[11px] font-medium text-[#666] font-mono bg-[#141414] px-1.5 py-0.5 rounded border border-[#262626]">⇧I</kbd>
            </Command.Item>
          </Command.Group>

        </Command.List>
      </div>
    </Command.Dialog>
  );
}
