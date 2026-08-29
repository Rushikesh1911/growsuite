"use client";

import { useEffect, useState } from "react";
import { X, Calendar, User, AlignLeft, Activity, Circle, PlayCircle, Clock, CheckCircle2, ChevronRight, ChevronsUp, ChevronUp, ChevronDown } from "lucide-react";
import { Task } from "./TaskManagement";
import { PopoverSelect } from "@/components/ui/popover-select";

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdate: (taskId: number, updates: Partial<Task>) => void;
}

export function TaskDrawer({ isOpen, onClose, task, onUpdate }: TaskDrawerProps) {
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<any[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
    }
  }, [task]);

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem("growsuite_token");
      const workspaceId = localStorage.getItem("growsuite_workspace_id");
      if (token && workspaceId) {
        fetch(`${API_URL}/api/workspaces/current`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "x-workspace-id": workspaceId.toString()
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data && data.members && Array.isArray(data.members)) {
              setMembers(data.members);
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen]);

  if (!isOpen || !task) return null;

  return (
    <>
      <div className="w-[400px] shrink-0 bg-[var(--gs-surface)] border-l border-[var(--gs-border)] shadow-sm flex flex-col h-full animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--gs-border)] flex flex-col gap-1.5 shrink-0 bg-[var(--gs-surface)]">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-[15px] font-bold text-[var(--gs-fg)] leading-snug">{task.title}</h2>
            <button 
              onClick={onClose}
              className="text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[var(--gs-bg)] p-1.5 rounded-[6px] transition-colors outline-none shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {task.dueDate && (
            <span className="text-[12px] font-medium text-[var(--gs-muted)]">
              Due {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-8">
          
          {/* Main Description */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[var(--gs-fg)] font-semibold text-[13px]">
              <AlignLeft className="h-4 w-4 text-[var(--gs-muted)]" />
              Description
            </div>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => onUpdate(task.id, { description })}
              placeholder="Add a more detailed description..."
              className="w-full min-h-[100px] bg-transparent border border-transparent hover:border-[var(--gs-border)] focus:border-[var(--gs-fg)] rounded-[6px] p-2 text-[13px] text-[var(--gs-fg)] placeholder-[var(--gs-muted-light)] outline-none resize-none transition-colors"
            />
          </div>

          <div className="h-px bg-[var(--gs-border)] w-full" />

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            
            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[var(--gs-muted)]">Status</span>
              <PopoverSelect
                value={task.status}
                onChange={(val) => onUpdate(task.id, { status: val as Task["status"] })}
                options={[
                  { label: "Todo", value: "TODO", icon: <Circle className="h-3.5 w-3.5 text-[var(--gs-muted)]" /> },
                  { label: "In Progress", value: "IN_PROGRESS", icon: <PlayCircle className="h-3.5 w-3.5 text-[#F5A623]" /> },
                  { label: "Review", value: "REVIEW", icon: <Clock className="h-3.5 w-3.5 text-[#007CF0]" /> },
                  { label: "Done", value: "DONE", icon: <CheckCircle2 className="h-3.5 w-3.5 text-[#28CA41]" /> },
                ]}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[var(--gs-muted)]">Priority</span>
              <PopoverSelect
                value={task.priority || "NONE"}
                onChange={(val) => onUpdate(task.id, { priority: val as Task["priority"] })}
                options={[
                  { label: "No priority", value: "NONE", icon: <Circle className="h-3.5 w-3.5 opacity-50" /> },
                  { label: "Low", value: "LOW", icon: <ChevronDown className="h-3.5 w-3.5" /> },
                  { label: "Medium", value: "MEDIUM", icon: <ChevronRight className="h-3.5 w-3.5" /> },
                  { label: "High", value: "HIGH", icon: <ChevronUp className="h-3.5 w-3.5 text-[#F5A623]" /> },
                  { label: "Urgent", value: "URGENT", icon: <ChevronsUp className="h-3.5 w-3.5 text-[#EF4444]" /> },
                ]}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[var(--gs-muted)]">Assignee</span>
              <PopoverSelect
                value={task.assigneeId ? task.assigneeId.toString() : ""}
                onChange={(val) => onUpdate(task.id, { assigneeId: val ? parseInt(val, 10) : null })}
                placeholder="Unassigned"
                options={[
                  { label: "Unassigned", value: "", icon: <div className="h-4 w-4 rounded-full border border-dashed border-[var(--gs-border-strong)] bg-transparent shrink-0" /> },
                  ...members.map(m => ({
                    label: m.user.name || m.user.email.split('@')[0],
                    value: m.id.toString(),
                    icon: m.user.avatarUrl ? (
                      <img src={m.user.avatarUrl} alt="avatar" className="h-4 w-4 rounded-full object-cover" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-[var(--gs-border)] flex items-center justify-center">
                        <span className="text-[8px] font-bold text-[var(--gs-fg)]">
                          {(m.user.name || m.user.email).substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )
                  }))
                ]}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[var(--gs-muted)]">Due Date</span>
              <div className="flex items-center gap-2 text-[13px] text-[var(--gs-fg)] font-medium">
                <Calendar className="h-4 w-4 text-[var(--gs-muted)]" />
                <input 
                  type="date"
                  value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""}
                  onChange={(e) => onUpdate(task.id, { dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="bg-transparent border border-transparent hover:border-[var(--gs-border)] focus:border-[var(--gs-fg)] rounded p-1 text-[13px] text-[var(--gs-fg)] font-medium outline-none cursor-pointer transition-colors"
                />
              </div>
            </div>

          </div>

          <div className="h-px bg-[var(--gs-border)] w-full" />

          {/* Time Tracking */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[var(--gs-fg)] font-semibold text-[13px]">
              <Clock className="h-4 w-4 text-[var(--gs-muted)]" />
              Time Tracking
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={async () => {
                  const token = localStorage.getItem("growsuite_token");
                  const workspaceId = localStorage.getItem("growsuite_workspace_id");
                  if (!token || !workspaceId) return;
                  await fetch(`${API_URL}/api/workspaces/${workspaceId}/time-entries`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ isTimer: true, description: task.title, taskId: task.id, projectId: task.projectId, billable: true })
                  });
                  window.location.reload(); // Refresh to ensure GlobalTimer picks it up immediately
                }}
                className="bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] hover:border-[var(--gs-fg)] hover:text-[var(--gs-fg)] text-[var(--gs-muted)] text-[12px] font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors outline-none"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                Start Timer
              </button>
            </div>
          </div>

          <div className="h-px bg-[var(--gs-border)] w-full" />

          {/* Activity Placeholder */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[var(--gs-fg)] font-semibold text-[13px]">
              <Activity className="h-4 w-4 text-[var(--gs-muted)]" />
              Activity
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-[var(--gs-fg)]">SYS</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] text-[var(--gs-fg)]">Task created</span>
                  <span className="text-[11px] text-[var(--gs-muted)]">
                    {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
