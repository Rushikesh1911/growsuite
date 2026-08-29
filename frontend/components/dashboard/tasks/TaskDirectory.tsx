"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CheckSquare, Circle, CheckCircle2, Clock, PlayCircle, Plus, Search, X, Filter, FolderKanban, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PopoverSelect } from "@/components/ui/popover-select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableSkeleton } from "@/components/ui/skeleton";

interface TaskAssignee {
  id: number;
  user: { name: string | null; email: string };
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  dueDate: string | null;
  createdAt: string;
  assignee: TaskAssignee | null;
  project: { id: number; name: string } | null;
  googleEventId?: string | null;
}

interface TaskDirectoryProps {
  token: string;
  workspaceId: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function TaskDirectory({ token, workspaceId }: TaskDirectoryProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [projects, setProjects] = useState<{ id: number; name: string; client: { name: string } }[]>([]);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newProjectId, setNewProjectId] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("create") === "true") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
      
      const projRes = await fetch(`${API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (projRes.ok) {
        const pData = await projRes.json();
        setProjects(pData);
      }
    } catch (error) {
      console.error("Failed to fetch tasks/projects:", error);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId]);

  useEffect(() => {
    fetchTasks();
    const handleRefresh = () => fetchTasks();
    window.addEventListener("refreshData", handleRefresh);
    return () => window.removeEventListener("refreshData", handleRefresh);
  }, [fetchTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newProjectId) {
      setErrorMsg("Task Title and Project ID are required");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ 
          title: newTitle,
          projectId: parseInt(newProjectId),
          dueDate: newDueDate ? new Date(newDueDate).toISOString() : undefined,
        }),
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewTitle("");
        setNewProjectId("");
        setNewDueDate("");
        fetchTasks();
        window.dispatchEvent(new Event("refreshData"));
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Task created successfully", type: "success" } }));
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to create task");
      }
    } catch (err) {
      setErrorMsg("Connection error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getSemanticStatus = (status: string): "neutral" | "positive" | "pending" | "info" | "overdue" => {
    switch (status) {
      case "TODO": return "neutral";
      case "IN_PROGRESS": return "pending";
      case "REVIEW": return "info";
      case "DONE": return "positive";
      default: return "neutral";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ");
  };

  const groups = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6 animate-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-[#EDEDED] tracking-tight">Tasks</h1>
          <p className="text-sm text-[#888888]">Manage actionable work across your projects.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#EDEDED] hover:bg-[#FFFFFF] text-[#000000] px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#333333] rounded-[6px] pl-9 pr-4 py-2 text-[13px] text-[#EDEDED] placeholder-[#666666] focus:outline-none focus:border-[#888888] transition-all"
          />
        </div>
        
        <PopoverSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { label: "All Status", value: "ALL" },
            { label: "To Do", value: "TODO" },
            { label: "In Progress", value: "IN_PROGRESS" },
            { label: "Review", value: "REVIEW" },
            { label: "Done", value: "DONE" }
          ]}
          triggerPrefixIcon={<Filter className="h-4 w-4" />}
          className="h-[36px] bg-[#0A0A0A] border border-[#333333] text-[#EDEDED] hover:bg-[#111111] transition-colors rounded-[6px] px-3 m-0"
          align="right"
        />
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-8">
        {loading ? (
          <TableSkeleton />
        ) : tasks.length === 0 ? (
          <Card className="bg-[#0A0A0A] border-[#222222] p-16 flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-[#111111] flex items-center justify-center mb-4 border border-[#222222]">
              <CheckSquare className="h-5 w-5 text-[#666666]" />
            </div>
            <h3 className="text-[#EDEDED] font-semibold text-sm">No tasks found</h3>
            <p className="text-[#888888] text-xs mt-1">Create a task to get started.</p>
          </Card>
        ) : (
          groups.map((status) => {
            const groupTasks = filteredTasks.filter((t) => t.status === status);
            if (groupTasks.length === 0) return null;

            return (
              <div key={status} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1">
                  <h3 className="text-[13px] font-semibold text-[#EDEDED] tracking-wide uppercase">
                    {getStatusLabel(status)} <span className="text-[#666666] ml-1">{groupTasks.length}</span>
                  </h3>
                </div>
                
                <Card className="bg-[#000000] border-[#222222] overflow-hidden">
                  <div className="divide-y divide-[#222222]">
                    {groupTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 hover:bg-[#0A0A0A] transition-colors group cursor-pointer">
                        <div className="flex items-center gap-3 min-w-0">
                          <StatusBadge label={getStatusLabel(task.status)} status={getSemanticStatus(task.status)} />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-medium text-[#EDEDED] group-hover:text-[var(--gs-fg)] transition-colors truncate">
                              {task.title}
                            </span>
                            {task.project && (
                              <a 
                                href={`/dashboard/projects/${task.project.id}`}
                                className="text-[11px] text-[#888888] hover:text-[#EDEDED] hover:underline truncate transition-colors"
                              >
                                in {task.project.name}
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          {task.dueDate && (
                            <div className="flex items-center gap-1.5 hidden sm:flex">
                              {task.googleEventId && (
                                  <span title="Synced to Google Calendar">
                                    <Calendar className="h-3.5 w-3.5 text-[#5B6AF0]" />
                                  </span>
                              )}
                              <span className="text-[11px] text-[#888888]">
                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          )}
                          
                          {task.assignee ? (
                            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-[#333333] to-[#111111] flex items-center justify-center overflow-hidden border border-[#333333]" title={task.assignee.user.name || task.assignee.user.email}>
                              <span className="text-[10px] font-bold text-[#EDEDED]">
                                {task.assignee.user.name ? task.assignee.user.name.charAt(0) : task.assignee.user.email.charAt(0)}
                              </span>
                            </div>
                          ) : (
                            <div className="h-6 w-6 rounded-full border border-dashed border-[var(--gs-border-strong)] bg-transparent shrink-0" title="Unassigned" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] border border-[#333333] rounded-[12px] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#222222] flex items-center justify-between bg-[#111111]">
              <h2 className="text-[15px] font-semibold text-[#EDEDED]">Create New Task</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#888888] hover:text-[#EDEDED] transition-colors outline-none">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#888888]">Task Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design homepage wireframes"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#000000] border border-[#333333] rounded-[6px] px-3 py-2 text-[13px] text-[#EDEDED] focus:outline-none focus:border-[#666666]"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#888888]">Project <span className="text-red-500">*</span></label>
                <div className="w-full border border-[#333333] rounded-[6px] bg-[#000000]">
                  <PopoverSelect
                    value={newProjectId}
                    onChange={(val) => setNewProjectId(val)}
                    placeholder="Search projects..."
                    className="w-full justify-start text-[13px] px-3 py-2 bg-transparent text-[#EDEDED] hover:bg-transparent"
                    options={projects.map(p => ({
                      label: `${p.name} — ${p.client?.name || ''}`,
                      value: p.id.toString(),
                      icon: <FolderKanban className="h-4 w-4" />
                    }))}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#888888]">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-[#000000] border border-[#333333] rounded-[6px] px-3 py-2 text-[13px] text-[#EDEDED] focus:outline-none focus:border-[#666666] [color-scheme:dark]"
                />
              </div>

              {errorMsg && <p className="text-[12px] text-red-500 font-medium">{errorMsg}</p>}

              <div className="pt-4 mt-2 border-t border-[#222222] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-medium text-[#888888] hover:text-[#EDEDED] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#EDEDED] hover:bg-[#FFFFFF] text-[#000000] px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
