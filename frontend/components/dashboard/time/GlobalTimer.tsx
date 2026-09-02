"use client";

import { useState, useEffect } from "react";
import { Clock, Square, Play, X } from "lucide-react";
import { usePathname } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface TimeEntry {
  id: number;
  description: string | null;
  startTime: string | null;
  endTime: string | null;
}

export function GlobalTimer() {
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [desc, setDesc] = useState("");
  
  // We re-check the active timer periodically or on mount
  useEffect(() => {
    fetchActiveTimer();
    
    // Poll every 30 seconds to sync state if started from another tab
    const interval = setInterval(fetchActiveTimer, 30000);
    return () => clearInterval(interval);
  }, []);

  // UI Preference to hide timer
  const [hideTimer, setHideTimer] = useState(false);
  useEffect(() => {
    // Check initial
    if (typeof window !== "undefined") {
      setHideTimer(localStorage.getItem('growsuite_hide_timer') === 'true');
      
      const handleHideTimerChanged = () => {
        setHideTimer(localStorage.getItem('growsuite_hide_timer') === 'true');
      };
      
      window.addEventListener('hideTimerChanged', handleHideTimerChanged);
      return () => window.removeEventListener('hideTimerChanged', handleHideTimerChanged);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer && activeTimer.startTime) {
      const start = new Date(activeTimer.startTime).getTime();
      
      const updateElapsed = () => {
        setElapsed(Math.floor((new Date().getTime() - start) / 1000));
      };
      
      updateElapsed(); // initial
      interval = setInterval(updateElapsed, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const fetchActiveTimer = async () => {
    try {
      const token = localStorage.getItem("growsuite_token");
      const workspaceId = localStorage.getItem("growsuite_workspace_id");
      if (!token || !workspaceId) return;

      const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}/time-entries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data: TimeEntry[] = await res.json();
        const running = data.find(e => e.startTime && !e.endTime);
        setActiveTimer(running || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startTimer = async () => {
    try {
      const token = localStorage.getItem("growsuite_token");
      const workspaceId = localStorage.getItem("growsuite_workspace_id");
      if (!token || !workspaceId) return;

      const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}/time-entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          isTimer: true,
          description: desc || "General Work",
          billable: false, // Default to false for global timer to prevent orphaned billable entries
        })
      });

      if (res.ok) {
        setDesc("");
        fetchActiveTimer();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stopTimer = async () => {
    if (!activeTimer) return;
    try {
      const token = localStorage.getItem("growsuite_token");
      const workspaceId = localStorage.getItem("growsuite_workspace_id");
      if (!token || !workspaceId) return;

      const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}/time-entries/${activeTimer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: "stop" })
      });

      if (res.ok) {
        setActiveTimer(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  };

  // If no active timer, we could show a compact start widget, but user asked for "minimal v1 floating widget, bottom-right, shows description + running duration + stop button."
  // Which implies it only shows when active, or is a tiny circle when not active.
  // Let's make it always visible as a floating play button, or a compact bar.
  
  if (hideTimer) return null;

  return (
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-2">
      {activeTimer ? (
        <div className="bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-full shadow-2xl p-1.5 flex items-center animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center pl-4 pr-1 gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#28CA41] animate-pulse shadow-[0_0_8px_rgba(40,202,65,0.6)]" />
              <span className="text-[13px] font-medium text-[var(--gs-fg)] truncate max-w-[150px]">
                {activeTimer.description || "General Work"}
              </span>
            </div>
            
            <div className="h-8 w-px bg-[var(--gs-border)]" />
            
            <div className="flex items-center gap-3">
              <span className="text-xl text-[var(--gs-fg)] font-mono tracking-tight tabular-nums w-[72px] text-right">
                {formatElapsed(elapsed)}
              </span>
              
              <button 
                onClick={stopTimer}
                className="w-8 h-8 rounded-full bg-[var(--gs-fg)] hover:opacity-90 text-[var(--gs-bg)] flex items-center justify-center transition-opacity"
                title="Stop Timer"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-full shadow-lg overflow-hidden flex items-center p-1.5 transition-all hover:pr-4 group">
          <button 
            onClick={() => {
              // Quick start with default "General Work" or expand to type?
              // Let's just quick start.
              startTimer();
            }}
            className="w-10 h-10 rounded-full bg-[var(--gs-bg-alt)] hover:bg-[var(--gs-fg)] hover:text-[var(--gs-bg)] text-[var(--gs-fg)] border border-[var(--gs-border)] flex items-center justify-center transition-colors shrink-0 shadow-sm"
            title="Start Timer"
          >
            <Play className="h-4 w-4 fill-current ml-0.5" />
          </button>
          <div className="w-0 overflow-hidden group-hover:w-[120px] transition-all duration-300 ease-out flex items-center">
            <span className="text-[13px] text-[var(--gs-muted)] whitespace-nowrap pl-3">Start Timer</span>
          </div>
        </div>
      )}
    </div>
  );
}
