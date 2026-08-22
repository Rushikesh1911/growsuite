"use client";

import React, { useEffect, useState, useRef } from "react";
import { Check, CheckCircle2, Circle, X } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ChecklistData {
  hasLeads: boolean;
  hasDeals: boolean;
  hasTasks: boolean;
  hasInvites: boolean;
}

export function GettingStartedChecklist() {
  const [data, setData] = useState<ChecklistData | null>(null);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  useEffect(() => {
    const fetchChecklist = async () => {
      const token = localStorage.getItem("growsuite_token");
      if (!token) return;

      try {
        // Also fetch user to check if they have hidden the checklist
        const userRes = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = await userRes.json();
        if (user.hideOnboardingChecklist) {
          setVisible(false);
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/api/onboarding/checklist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const progress = await res.json();
        setData(progress);
      } catch (error) {
        console.error("Failed to load checklist", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChecklist();
  }, []);

  const handleDismiss = async () => {
    setVisible(false);
    const token = localStorage.getItem("growsuite_token");
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/onboarding/hide-checklist`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error("Failed to dismiss checklist");
    }
  };

  const allDone = data ? [
    data.hasLeads,
    data.hasDeals,
    data.hasTasks,
    data.hasInvites
  ].every(Boolean) : false;

  useEffect(() => {
    if (allDone && !hasCelebrated) {
      setHasCelebrated(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#000000', '#ffffff', '#eab308']
      });
      // Optionally auto-dismiss after a few seconds
      setTimeout(() => {
        handleDismiss();
      }, 8000);
    }
  }, [allDone, hasCelebrated]);

  if (loading || !visible || !data) return null;

  const tasks = [
    { id: 'leads', label: 'Create your first lead', completed: data.hasLeads, href: '/dashboard/leads' },
    { id: 'deals', label: 'Create your first deal', completed: data.hasDeals, href: '/dashboard/pipeline' },
    { id: 'tasks', label: 'Create a task', completed: data.hasTasks, href: '/dashboard/tasks' },
    { id: 'invites', label: 'Invite a teammate', completed: data.hasInvites, href: '/dashboard/settings' },
  ];

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-[#111111] border border-[#222222] rounded-[12px] p-5 mb-6 shadow-md relative overflow-hidden"
        >
          
          {/* Background progress bar hint */}
          <motion.div 
            className="absolute bottom-0 left-0 h-1 bg-emerald-500" 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-[600] text-white mb-1 tracking-tight flex items-center gap-2">
                Getting Started
                {allDone && (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="inline-flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  >
                    Completed
                  </motion.span>
                )}
              </h2>
              <p className="text-[13px] text-[#A1A1AA]">
                {allDone ? "You're all set! Ready to grow your business." : "Complete these tasks to get the most out of GrowSuite."}
              </p>
            </div>
            
            <button 
              onClick={handleDismiss}
              className="text-[#666666] hover:text-white transition-colors p-1"
              aria-label="Dismiss checklist"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {tasks.map((task, i) => (
              <Link
                key={task.id}
                href={task.href}
                className={`flex items-start gap-2.5 p-3 rounded-[8px] transition-colors ${
                  task.completed 
                    ? "bg-[#161616] pointer-events-none" 
                    : "bg-[#111111] border border-[#222222] hover:border-[#333333] hover:bg-[#161616] group"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {task.completed ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </motion.div>
                  ) : (
                    <Circle className="h-4 w-4 text-[#333333] group-hover:text-[#666666] transition-colors" />
                  )}
                </div>
                <span className={`text-[13px] font-[500] leading-tight ${task.completed ? "text-[#555555] line-through decoration-[#333333]" : "text-[#EDEDED]"}`}>
                  {task.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
