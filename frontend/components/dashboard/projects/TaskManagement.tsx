"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckSquare, Circle, CheckCircle2, Clock, Plus, Search, MoreHorizontal, MessageSquare, LayoutGrid, List, LayoutList, ChevronLeft, ChevronRight } from "lucide-react";
import { PopoverSelect } from "@/components/ui/popover-select";
import { BoardSkeleton, TableSkeleton } from "@/components/ui/skeleton";
import { TaskDrawer } from "./TaskDrawer";
import { useRef } from "react";
import { useSocket } from "@/components/providers/SocketProvider";

// dnd-kit imports
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string | null;
  createdAt: string;
  updatedAt?: string;
  projectId?: number | null;
  assigneeId?: number | null;
}

interface TaskManagementProps {
  projectId: number;
  token: string;
  workspaceId: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;

// --- DND Column Droppable ---
function DroppableColumn({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div 
      ref={setNodeRef} 
      className={`${className || ''} ${isOver ? 'ring-2 ring-[var(--gs-border-strong)] rounded-[8px]' : ''}`}
    >
      {children}
    </div>
  );
}

// --- DND Sortable Item Component for Board ---
function SortableTaskCard({ task, onClick, onToggleStatus }: { task: Task, onClick: () => void, onToggleStatus: (t: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id.toString(), data: task });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      onClick={onClick}
      className="bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[8px] p-3 shadow-sm hover:border-[var(--gs-border-strong)] cursor-grab active:cursor-grabbing flex flex-col gap-3 group"
    >
      <div className="flex items-start gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleStatus(task); }}
          className="outline-none mt-0.5 shrink-0"
        >
          {task.status === "DONE" ? (
            <CheckCircle2 className="h-4 w-4 text-[var(--gs-fg)]" />
          ) : (
            <Circle className="h-4 w-4 text-[var(--gs-muted-light)] hover:text-[var(--gs-muted)] transition-colors" />
          )}
        </button>
        <span className={`text-[13px] font-medium leading-tight ${task.status === "DONE" ? "text-[var(--gs-muted)] line-through" : "text-[var(--gs-fg)]"}`}>
          {task.title}
        </span>
      </div>
      
      <div className="flex items-center gap-2 mt-auto">
        {task.priority !== "NONE" && (
          <span className="text-[11px] font-medium text-[var(--gs-muted)]">
            {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
          </span>
        )}
        {task.dueDate && (
          <span className={`text-[11px] font-medium ${new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-[var(--gs-muted)]'}`}>
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}

export function TaskManagement({ projectId, token, workspaceId }: TaskManagementProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  
  // Inline creation state
  const [isCreatingForStatus, setIsCreatingForStatus] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Drawer state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // DnD state
  const [activeDragTask, setActiveDragTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { socket } = useSocket();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, token, workspaceId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (task: Task) => {
      if (task.projectId === projectId) {
        setTasks(prev => [task, ...prev]);
      }
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      if (selectedTask?.id === updatedTask.id) {
        setSelectedTask(updatedTask);
      }
    };

    const handleTaskDeleted = ({ id }: { id: number }) => {
      setTasks(prev => prev.filter(t => t.id !== id));
      if (selectedTask?.id === id) {
        setSelectedTask(null);
      }
    };

    socket.on('task_created', handleTaskCreated);
    socket.on('task_updated', handleTaskUpdated);
    socket.on('task_deleted', handleTaskDeleted);

    return () => {
      socket.off('task_created', handleTaskCreated);
      socket.off('task_updated', handleTaskUpdated);
      socket.off('task_deleted', handleTaskDeleted);
    };
  }, [socket, projectId, selectedTask?.id]);

  // Scroll state for board
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
    }
  }, []);


  useEffect(() => {
    if (viewMode === "board") {
      checkScroll();
      window.addEventListener('resize', checkScroll);
      return () => window.removeEventListener('resize', checkScroll);
    }
  }, [viewMode, tasks, checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const columnWidth = 324; // 300px + 24px gap
      scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -columnWidth : columnWidth, behavior: 'smooth' });
    }
  };

  const handleCreateTask = async (status: Task["status"], e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const titleToSubmit = newTaskTitle.trim();
    if (!titleToSubmit || isSubmitting) {
      if (!titleToSubmit) setIsCreatingForStatus(null);
      return;
    }

    setIsSubmitting(true);
    setNewTaskTitle(""); // clear synchronously

    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ title: titleToSubmit }),
      });
      
      if (res.ok) {
        const createdTask = await res.json();
        setTasks((prev) => [createdTask, ...prev]);
        
        if (status !== "TODO") {
          updateTask(createdTask.id, { status });
        } else {
          window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Task created", type: "success" } }));
        }
      } else {
        const err = await res.json().catch(() => ({}));
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: err.error || "Failed to create task. Check if backend needs restart.", type: "error" } }));
      }
    } catch (err) {
      console.error("Failed to create task", err);
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Network error", type: "error" } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (status: Task["status"], e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateTask(status);
    } else if (e.key === 'Escape') {
      setIsCreatingForStatus(null);
      setNewTaskTitle("");
    }
  };

  const updateTask = async (taskId: number, updates: Partial<Task>) => {
    // Optimistic
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    
    // Also update selected task if it's open in the drawer
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
    }

    try {
      await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error("Failed to update task", err);
      fetchTasks(); // Revert
    }
  };

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === "DONE" ? "TODO" : "DONE";
    updateTask(task.id, { status: newStatus });
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id.toString() === active.id);
    if (task) setActiveDragTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // If dropped on a column container
    if (STATUSES.includes(overId as any)) {
      const activeTask = tasks.find(t => t.id.toString() === activeId);
      if (activeTask && activeTask.status !== overId) {
        updateTask(activeTask.id, { status: overId as Task["status"] });
      }
      return;
    }

    // If dropped on another task
    const activeTask = tasks.find(t => t.id.toString() === activeId);
    const overTask = tasks.find(t => t.id.toString() === overId);

    if (activeTask && overTask && activeTask.status !== overTask.status) {
      updateTask(activeTask.id, { status: overTask.status });
    }
  };


  return (
    <div className="h-full flex flex-col relative bg-[var(--gs-bg)]">
      {/* Task Toolbar */}
      <div className="px-8 py-3 border-b border-[var(--gs-border)] shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCreatingForStatus("TODO")}
            className="flex items-center gap-1.5 bg-[var(--gs-fg)] hover:opacity-90 text-[var(--gs-bg)] px-3 py-1.5 rounded-[6px] text-[12px] font-bold transition-colors shadow-sm outline-none"
          >
            <Plus className="h-3.5 w-3.5" /> New Task
          </button>
        </div>
        
        <div className="flex items-center bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] p-0.5">
          <button 
            title="List view"
            onClick={() => setViewMode("list")}
            className={`p-1 rounded-[4px] transition-colors outline-none ${viewMode === "list" ? "bg-[var(--gs-bg-alt)] text-[var(--gs-fg)]" : "text-[var(--gs-muted)] hover:text-[var(--gs-fg-secondary)]"}`}
          >
            <LayoutList className="h-4 w-4" />
          </button>
          <button 
            title="Board view"
            onClick={() => setViewMode("board")}
            className={`p-1 rounded-[4px] transition-colors outline-none ${viewMode === "board" ? "bg-[var(--gs-bg-alt)] text-[var(--gs-fg)]" : "text-[var(--gs-muted)] hover:text-[var(--gs-fg-secondary)]"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Task Content and Side Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task Content */}
        <div 
          ref={viewMode === "board" ? scrollContainerRef : null}
          onScroll={viewMode === "board" ? checkScroll : undefined}
          className={`flex-1 overflow-y-auto custom-scrollbar p-8 ${viewMode === 'board' ? 'flex flex-row overflow-x-auto gap-6 pb-12' : 'flex flex-col'}`}
        >
        
        {loading ? (
          viewMode === 'board' ? <BoardSkeleton /> : <TableSkeleton />
        ) : tasks.length === 0 && !isCreatingForStatus ? (
          <div className="flex flex-col items-center justify-center h-full w-full text-center p-8 animate-in fade-in duration-300">
            <div className="h-12 w-12 rounded-full bg-[var(--gs-surface)] border border-[var(--gs-border)] flex items-center justify-center mb-4">
              <CheckCircle2 className="h-5 w-5 text-[var(--gs-muted)]" />
            </div>
            <h3 className="text-[14px] font-bold text-[var(--gs-fg)] mb-1">No tasks yet</h3>
            <p className="text-[13px] text-[var(--gs-muted)] max-w-[250px] mb-4">
              Create your first task to start tracking work for this project.
            </p>
            <button 
              onClick={() => setIsCreatingForStatus("TODO")}
              className="text-[13px] font-medium text-[var(--gs-fg)] bg-[var(--gs-surface)] border border-[var(--gs-border)] px-4 py-2 rounded-[6px] hover:bg-[var(--gs-bg-alt)] transition-colors outline-none"
            >
              Create Task
            </button>
          </div>
        ) : viewMode === "list" ? (
          <div className="flex flex-col gap-10">
            {STATUSES.map(status => {
              const statusTasks = tasks.filter(t => t.status === status);
              // Hide empty sections except TODO
              if (statusTasks.length === 0 && status !== "TODO" && isCreatingForStatus !== status) return null;
              
              return (
                <div key={status} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[11px] font-bold text-[var(--gs-muted)] tracking-wider">
                      {status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-[var(--gs-muted-light)]">{statusTasks.length}</span>
                    <div className="h-px bg-[var(--gs-border)] flex-1 ml-4" />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    {statusTasks.map(task => (
                      <div 
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="group flex items-center justify-between px-4 py-2 hover:bg-[var(--gs-bg-alt)] rounded-[6px] transition-colors border border-transparent hover:border-[var(--gs-border)] cursor-pointer outline-none"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task); }}
                            className="outline-none shrink-0"
                          >
                            {task.status === "DONE" ? (
                              <CheckCircle2 className="h-4 w-4 text-[var(--gs-fg)]" />
                            ) : (
                              <Circle className="h-4 w-4 text-[var(--gs-muted-light)] hover:text-[var(--gs-muted)] transition-colors" />
                            )}
                          </button>
                          <span className={`text-[13px] font-medium truncate ${task.status === "DONE" ? "text-[var(--gs-muted)] line-through" : "text-[var(--gs-fg)]"}`}>
                            {task.title}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="w-16 flex justify-end">
                            {task.priority && task.priority !== "NONE" && (
                              <span className="text-[11px] font-medium text-[var(--gs-muted)]">
                                {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                              </span>
                            )}
                          </div>
                          <div className="w-20 flex justify-end">
                            {task.dueDate && (
                              <span className="text-[12px] text-[var(--gs-muted)]">
                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Inline Create Row */}
                    {isCreatingForStatus === status && (
                      <div className="bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] flex items-center px-4 py-2 mt-1 shadow-sm ring-1 ring-[var(--gs-fg)] ring-opacity-20 transition-all animate-in fade-in zoom-in-95 duration-100">
                        <Circle className="h-4 w-4 text-[var(--gs-muted-light)] mr-3 shrink-0" />
                        <input 
                          autoFocus
                          type="text"
                          placeholder="Task title..."
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(status, e)}
                          onBlur={() => handleCreateTask(status)}
                          className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-[var(--gs-fg)] placeholder-[var(--gs-muted-light)]"
                        />
                      </div>
                    )}
                  </div>

                  {!isCreatingForStatus && (
                    <button 
                      onClick={() => setIsCreatingForStatus(status)}
                      className="text-[12px] text-[var(--gs-muted)] hover:text-[var(--gs-fg)] font-medium flex items-center gap-1.5 px-4 py-1.5 w-fit transition-colors outline-none opacity-0 hover:opacity-100"
                    >
                      <Plus className="h-3 w-3" /> Add task
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* --- BOARD VIEW --- */
          <div className="relative group w-full h-full flex flex-row gap-6 items-start">
            {canScrollLeft && (
              <button 
                onClick={() => scroll('left')}
                className="fixed left-8 top-[60%] -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] flex items-center justify-center shadow-lg text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 hidden sm:flex"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            
            {canScrollRight && (
              <button 
                onClick={() => scroll('right')}
                className="fixed right-8 top-[60%] -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] flex items-center justify-center shadow-lg text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 hidden sm:flex"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              {STATUSES.map(status => {
              const statusTasks = tasks.filter(t => t.status === status);
              return (
                <div key={status} className="flex flex-col gap-3 min-w-[300px] w-[300px] shrink-0" id={status}>
                  <div className="flex items-center gap-3 mb-1 px-1">
                    <span className="text-[11px] font-bold text-[var(--gs-fg)] tracking-wider">
                      {status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-[var(--gs-muted-light)]">{statusTasks.length}</span>
                  </div>
                  
                  <DroppableColumn id={status} className="flex flex-col gap-2 min-h-[150px] p-1 -m-1">
                    <SortableContext items={statusTasks.map(t => t.id.toString())} strategy={verticalListSortingStrategy}>
                      {statusTasks.map(task => (
                        <SortableTaskCard 
                          key={task.id} 
                          task={task} 
                          onClick={() => setSelectedTask(task)}
                          onToggleStatus={toggleTaskStatus} 
                        />
                      ))}
                    </SortableContext>
                    
                    {/* Inline Create Row for Board */}
                    {isCreatingForStatus === status && (
                      <div className="bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px] p-3 shadow-sm flex flex-col gap-2">
                        <input 
                          autoFocus
                          type="text"
                          placeholder="Task title..."
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(status, e)}
                          onBlur={() => handleCreateTask(status)}
                          className="w-full bg-transparent border-none outline-none text-[13px] font-medium text-[var(--gs-fg)] placeholder-[var(--gs-muted-light)]"
                        />
                      </div>
                    )}
                    
                    <button 
                      onClick={() => setIsCreatingForStatus(status)}
                      className="flex items-center gap-2 text-[12px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] p-2 hover:bg-[var(--gs-surface)] rounded-[6px] transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add task
                    </button>
                  </DroppableColumn>
                </div>
              );
            })}
            
            <DragOverlay>
              {activeDragTask ? (
                <div className="bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] rounded-[8px] p-3 shadow-2xl opacity-90 flex flex-col gap-3 w-[300px] rotate-2">
                  <div className="flex items-start gap-2">
                    <Circle className="h-4 w-4 text-[var(--gs-muted-light)] mt-0.5 shrink-0" />
                    <span className="text-[13px] font-medium text-[var(--gs-fg)] leading-tight">{activeDragTask.title}</span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
        )}
        </div>

        <TaskDrawer 
          isOpen={selectedTask !== null} 
          onClose={() => setSelectedTask(null)} 
          task={selectedTask}
          onUpdate={updateTask}
        />
      </div>
    </div>
  );
}
