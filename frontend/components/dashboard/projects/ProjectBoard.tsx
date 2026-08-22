"use client";

import { useState, useEffect, useCallback } from "react";
import { Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSocket } from "@/components/providers/SocketProvider";
import { FolderKanban, Plus, Search, MoreHorizontal, Building2, CheckSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Project } from "./types";
import { BoardSkeleton } from "@/components/ui/skeleton";
import { PopoverSelect } from "@/components/ui/popover-select";
import { CreateProjectModal } from "./CreateProjectModal";

interface ProjectBoardProps {
  token: string;
  workspaceId: number;
  initialClientId?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function ProjectBoard({ token, workspaceId, initialClientId }: ProjectBoardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [clients, setClients] = useState<{id: number, name: string}[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    if (searchParams?.get("create") === "true") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId]);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error("Failed to fetch clients", err);
    }
  }, [token, workspaceId]);

  const { socket } = useSocket();

  useEffect(() => {
    fetchProjects();
    fetchClients();
    const handleRefresh = () => fetchProjects();
    window.addEventListener("refreshData", handleRefresh);

    if (socket) {
      socket.on('project_created', handleRefresh);
      socket.on('project_updated', handleRefresh);
      socket.on('project_deleted', handleRefresh);
    }

    return () => {
      window.removeEventListener("refreshData", handleRefresh);
      if (socket) {
        socket.off('project_created', handleRefresh);
        socket.off('project_updated', handleRefresh);
        socket.off('project_deleted', handleRefresh);
      }
    };
  }, [fetchProjects, fetchClients, socket]);



  const filteredProjects = projects.filter((project) => {
    const searchString = searchQuery.toLowerCase();
    const matchesSearch = project.name.toLowerCase().includes(searchString) || project.client.name.toLowerCase().includes(searchString);
    const matchesStatus = 
      filterStatus === "ALL" ? project.archivedAt === null :
      filterStatus === "ARCHIVED" ? project.archivedAt !== null :
      project.status === filterStatus && project.archivedAt === null;

    const matchesClient = initialClientId ? project.client.id === initialClientId : true;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const handleArchive = async (projectId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/archive`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('showToast', {detail: {message: 'Project archived correctly', type: 'success'}}));
        setOpenActionMenuId(null);
        fetchProjects();
      } else {
        const data = await res.json();
        window.dispatchEvent(new CustomEvent('showToast', {detail: {message: data.error || 'Failed to archive project', type: 'error'}}));
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent('showToast', {detail: {message: 'Connection error', type: 'error'}}));
    }
  };

  const handleUnarchive = async (projectId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/unarchive`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('showToast', {detail: {message: 'Project unarchived successfully', type: 'success'}}));
        setOpenActionMenuId(null);
        fetchProjects();
      } else {
        const data = await res.json();
        window.dispatchEvent(new CustomEvent('showToast', {detail: {message: data.error || 'Failed to unarchive project', type: 'error'}}));
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent('showToast', {detail: {message: 'Connection error', type: 'error'}}));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-[#007CF0]/10 text-[#007CF0] border-[#007CF0]/20",
      COMPLETED: "bg-[var(--gs-fg)]/10 text-[var(--gs-fg)] border-[var(--gs-fg)]/20",
      ON_HOLD: "bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20",
      PLANNING: "bg-[#71717A]/10 text-[#71717A] border-[#71717A]/20",
      CANCELLED: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
    };
    return colors[status] || "bg-[var(--gs-bg-alt)] text-[var(--gs-fg)] border-[var(--gs-border-strong)]";
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatDeadline = (dateString: string | null) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(date);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.round((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return <span className="text-red-500 font-medium">Overdue by {Math.abs(diffDays)} days</span>;
    if (diffDays === 0) return <span className="text-[#F5A623] font-medium">Due today</span>;
    if (diffDays === 1) return <span className="text-[var(--gs-fg)] font-medium">Due tomorrow</span>;
    
    return `Due ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  };

  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);

  useEffect(() => {
    function handleClickOutside() {
      setOpenActionMenuId(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full flex flex-col gap-6 animate-fade select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--gs-border)] pb-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-[var(--gs-fg)] tracking-tight">Projects</h1>
          <p className="text-sm text-[var(--gs-muted)]">Manage client work, deliverables, deadlines, and progress.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[var(--gs-fg)] hover:bg-[var(--gs-fg-secondary)] text-[var(--gs-bg)] px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gs-muted-light)]" />
          <input
            type="text"
            placeholder="Search projects by name or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px] pl-9 pr-4 py-1.5 text-xs text-[var(--gs-fg)] placeholder-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-fg)] transition-all h-[32px]"
          />
        </div>
        
        <PopoverSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { label: "All Status", value: "ALL" },
            { label: "Active", value: "ACTIVE" },
            { label: "Completed", value: "COMPLETED" },
            { label: "On Hold", value: "ON_HOLD" },
            { label: "Archived", value: "ARCHIVED" }
          ]}
          triggerPrefixIcon={<Filter className="h-4 w-4" />}
          className="h-[32px] bg-[var(--gs-surface)] border border-[var(--gs-border)] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors rounded-[6px] px-3 m-0"
          align="right"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {loading ? (
          <BoardSkeleton />
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-20 flex flex-col items-center border border-[var(--gs-border)] rounded-[12px] bg-[var(--gs-surface)] shadow-none">
            <h3 className="text-[var(--gs-fg)] font-semibold text-sm">No projects yet</h3>
            <p className="text-[var(--gs-muted)] text-xs mt-1 max-w-[280px]">Projects help you organize client work, tasks, deadlines, and billing.</p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 text-xs font-semibold text-[var(--gs-fg)] hover:underline flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> Create your first project
            </button>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const tasksList = project.tasks || [];
            const completedTasks = tasksList.filter(t => t.status === "DONE").length;
            const totalTasks = tasksList.length;
            const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

            return (
              <Card 
                key={project.id} 
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                className="bg-[var(--gs-surface)] border border-[var(--gs-border)] p-5 flex flex-col gap-4 hover:border-[var(--gs-border-strong)] transition-colors group cursor-pointer shadow-none relative"
              >
                
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <h3 className="text-[15px] font-bold text-[var(--gs-fg)] leading-tight truncate">
                      {project.name}
                    </h3>
                    <div 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        window.dispatchEvent(new CustomEvent('showToast', {detail: {message: `Navigating to Client #${project.client.id}`, type: 'info'}}));
                      }}
                      className="flex items-center gap-1.5 text-[13px] text-[var(--gs-muted)] font-medium hover:text-[var(--gs-fg-hover)] transition-colors cursor-pointer w-fit"
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      <span className="truncate">{project.client.name}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="relative shrink-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === project.id ? null : project.id); }}
                      className="p-1 rounded-[4px] text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors outline-none"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    
                    {openActionMenuId === project.id && (
                      <div className="absolute right-0 top-6 w-36 bg-[var(--gs-surface-raised)] border border-[var(--gs-border)] rounded-[8px] shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setEditingProject(project); setOpenActionMenuId(null); }} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] font-medium">Edit project</button>
                        <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/dashboard/projects/${project.id}?tab=tasks`); setOpenActionMenuId(null); }} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] font-medium">Add task</button>
                        <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/dashboard/invoices/new?client=${project.client.id}`); setOpenActionMenuId(null); }} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] font-medium">Create invoice</button>
                        <div className="h-px bg-[var(--gs-border)] my-1"></div>
                        {project.archivedAt ? (
                          <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleUnarchive(project.id); }} className="w-full text-left px-3 py-1.5 text-[12px] text-[#007CF0] hover:bg-[#007CF0]/10 font-medium">Unarchive</button>
                        ) : (
                          <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleArchive(project.id); }} className="w-full text-left px-3 py-1.5 text-[12px] text-red-500 hover:bg-red-500/10 font-medium">Archive</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center mt-1">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[var(--gs-bg)] border border-[var(--gs-border)] shrink-0">
                    <div className={`h-1.5 w-1.5 rounded-full ${project.status === 'ACTIVE' ? 'bg-[#007CF0]' : project.status === 'COMPLETED' ? 'bg-[var(--gs-fg)]' : project.status === 'ON_HOLD' ? 'bg-[#F5A623]' : project.status === 'CANCELLED' ? 'bg-[#EF4444]' : 'bg-[#71717A]'}`}></div> 
                    <span className="text-[10px] font-bold text-[var(--gs-fg)] tracking-wide">{project.status.replace("_", " ")}</span>
                  </div>
                </div>

                {/* Progress */}
                {totalTasks === 0 ? (
                  <div className="mt-1 flex items-center text-[12px] font-bold text-[var(--gs-fg)] mb-2.5">
                    <span>0 tasks</span>
                  </div>
                ) : (
                  <>
                    <div className="mt-1 flex items-center justify-between text-[12px] font-bold text-[var(--gs-fg)] mb-1">
                      <span>{completedTasks} / {totalTasks} tasks</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-[var(--gs-border)] rounded-full h-1.5 overflow-hidden mb-1">
                      <div 
                        className="bg-[var(--gs-fg)] h-1.5 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </>
                )}

                {/* Footer Metadata */}
                <div className="flex items-center justify-between mt-auto pt-4 text-[11px] text-[var(--gs-muted-light)]">
                  <span>{formatDeadline(project.deadline)}</span>
                  <span>Updated {getRelativeTime(project.updatedAt || project.createdAt)}</span>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <CreateProjectModal
        token={token}
        workspaceId={workspaceId}
        isOpen={isCreateModalOpen || editingProject !== null}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingProject(null);
        }}
        initialClientId={initialClientId}
        initialProject={editingProject}
        onSuccess={(project) => {
          setIsCreateModalOpen(false);
          setEditingProject(null);
          fetchProjects();
          window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Project saved successfully", type: "success" } }));
        }}
      />
    </div>
  );
}
