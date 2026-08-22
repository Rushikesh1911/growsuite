"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Loader2, Mail, Plus, X } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Step = "WELCOME" | "WORKSPACE" | "INVITES" | "PROGRESS" | "CONFIRM";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("WELCOME");
  
  // Form State
  const [workspaceName, setWorkspaceName] = useState("");
  const [useCase, setUseCase] = useState("B2B Sales");
  const [emails, setEmails] = useState<string[]>([""]);
  
  // Progress State
  const [progressSteps, setProgressSteps] = useState([
    { label: "Creating workspace", status: "pending" },
    { label: "Setting up CRM pipeline", status: "pending" },
    { label: "Configuring dashboard", status: "pending" },
    { label: "Preparing team workspace", status: "pending" },
  ]);

  // Auth token
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("growsuite_token");
    if (!stored) {
      router.push("/auth/sign-in");
    } else {
      setToken(stored);
      // Fetch initial workspace name guess
      fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${stored}` }
      }).then(res => res.json()).then(data => {
        if (data.workspaceMemberships?.[0]?.workspace?.name) {
          setWorkspaceName(data.workspaceMemberships[0].workspace.name);
        }
      }).catch(() => {});
    }
  }, [router]);

  const handleSetupWorkspace = async () => {
    setStep("PROGRESS");
    
    // Start fake progress animation
    const delays = [800, 1500, 2200, 2800];
    delays.forEach((delay, index) => {
      setTimeout(() => {
        setProgressSteps(prev => prev.map((s, i) => 
          i === index ? { ...s, status: "complete" } : s
        ));
      }, delay);
    });

    // Make API Call in the background
    try {
      const validEmails = emails.filter(e => e.trim().includes("@"));
      await fetch(`${API_URL}/api/onboarding/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          workspaceName,
          useCase,
          invitations: validEmails
        })
      });
    } catch (error) {
      console.error("Failed to setup workspace", error);
    }

    // Move to confirm after animation finishes
    setTimeout(() => {
      setStep("CONFIRM");
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#000000', '#ffffff', '#eab308']
      });
    }, 3400);
  };

  const handleAddEmail = () => setEmails([...emails, ""]);
  const handleUpdateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };
  const handleRemoveEmail = (index: number) => {
    const newEmails = emails.filter((_, i) => i !== index);
    if (newEmails.length === 0) newEmails.push("");
    setEmails(newEmails);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-6 selection:bg-black/10">
      
      {/* ── Top-left logo ── */}
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-2.5">
          <div className="h-[28px] w-[28px] rounded-[7.5px] bg-[#0F0F0F] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1.5L14 5v6L8 14.5 2 11V5L8 1.5Z" stroke="white" strokeOpacity="0.8" strokeWidth="1"/>
              <path d="M8 4.5L11.5 8 8 11.5 4.5 8 8 4.5Z" fill="white" fillOpacity="1"/>
            </svg>
          </div>
          <span className="text-[14px] font-[700] tracking-[-0.025em] text-[#111111]">GrowSuite</span>
        </div>
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
        
        {step === "WELCOME" && (
          <motion.div 
            key="WELCOME"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            <h1 className="text-[28px] font-[700] text-[#000000] tracking-tight mb-3">
              Welcome to GrowSuite
            </h1>
            <p className="text-[14px] text-[#666666] leading-relaxed mb-8 max-w-[300px]">
              The intelligent CRM built for modern teams. We'll get your workspace set up in less than a minute.
            </p>
            <button
              onClick={() => setStep("WORKSPACE")}
              className="flex items-center gap-2 bg-[#000000] text-white px-6 py-2.5 rounded-full text-[14px] font-[500] hover:bg-[#222222] transition-colors"
            >
              Get Started
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {step === "WORKSPACE" && (
          <motion.div 
            key="WORKSPACE"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col"
          >
            <h2 className="text-[22px] font-[600] text-[#000000] tracking-tight mb-2">
              Create your workspace
            </h2>
            <p className="text-[13px] text-[#666666] mb-8">
              What should we call your workspace and how do you plan to use it?
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-[12px] font-[500] text-[#444444] mb-1.5">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={e => setWorkspaceName(e.target.value)}
                  className="w-full bg-white border border-[#EAEAEA] rounded-[8px] px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[#000000] focus:ring-1 focus:ring-[#000000] transition-shadow placeholder-[#AFAFAF]"
                  placeholder="e.g. Acme Corp"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[12px] font-[500] text-[#444444] mb-1.5">
                  Primary Use Case
                </label>
                <select
                  value={useCase}
                  onChange={e => setUseCase(e.target.value)}
                  className="w-full bg-white border border-[#EAEAEA] rounded-[8px] px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[#000000] focus:ring-1 focus:ring-[#000000] transition-shadow text-[#111]"
                >
                  <option value="B2B Sales">B2B Sales</option>
                  <option value="Agency & Services">Agency & Services</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Recruiting">Recruiting</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep("WELCOME")}
                  className="text-[13px] text-[#888888] hover:text-[#111111] transition-colors"
                >
                  Back
                </button>
                <button
                  disabled={!workspaceName.trim()}
                  onClick={() => setStep("INVITES")}
                  className="flex items-center gap-1.5 bg-[#000000] text-white px-5 py-2 rounded-full text-[13px] font-[500] hover:bg-[#222222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "INVITES" && (
          <motion.div 
            key="INVITES"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col"
          >
            <h2 className="text-[22px] font-[600] text-[#000000] tracking-tight mb-2">
              Invite your team
            </h2>
            <p className="text-[13px] text-[#666666] mb-8">
              GrowSuite is better together. Invite your team members now (or do this later).
            </p>

            <div className="space-y-3 mb-6">
              {emails.map((email, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AFAFAF]" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => handleUpdateEmail(i, e.target.value)}
                      placeholder="colleague@company.com"
                      className="w-full bg-white border border-[#EAEAEA] rounded-[8px] pl-9 pr-3.5 py-2 text-[13px] focus:outline-none focus:border-[#000000] transition-colors"
                      autoFocus={i === 0}
                    />
                  </div>
                  {emails.length > 1 && (
                    <button onClick={() => handleRemoveEmail(i)} className="p-2 text-[#AFAFAF] hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddEmail}
                className="flex items-center gap-1.5 text-[12px] font-[500] text-[#555555] hover:text-[#000000] transition-colors pt-2"
              >
                <Plus className="h-3.5 w-3.5" />
                Add another
              </button>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[#F5F5F5]">
              <button
                onClick={handleSetupWorkspace}
                className="text-[13px] text-[#888888] hover:text-[#111111] transition-colors font-[500]"
              >
                Skip for now
              </button>
              <button
                onClick={handleSetupWorkspace}
                className="flex items-center gap-1.5 bg-[#000000] text-white px-5 py-2 rounded-full text-[13px] font-[500] hover:bg-[#222222] transition-colors"
              >
                {emails.some(e => e.trim().includes("@")) ? "Send Invites & Continue" : "Continue"}
              </button>
            </div>
          </motion.div>
        )}

        {step === "PROGRESS" && (
          <motion.div 
            key="PROGRESS"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <Loader2 className="h-8 w-8 text-[#000000] animate-spin mb-8" />
            
            <div className="w-full max-w-[280px] space-y-4">
              {progressSteps.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300
                    ${s.status === "complete" ? "bg-emerald-500 text-white" : "bg-[#F5F5F5] text-[#CCCCCC]"}`}>
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className={`text-[13px] font-[500] transition-colors duration-300
                    ${s.status === "complete" ? "text-[#000000]" : "text-[#888888]"}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === "CONFIRM" && (
          <motion.div 
            key="CONFIRM"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="flex flex-col items-center text-center"
          >
            <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6">
              <Check className="h-6 w-6 text-emerald-600 stroke-[2.5]" />
            </div>
            <h2 className="text-[24px] font-[600] text-[#000000] tracking-tight mb-2">
              Your workspace is ready
            </h2>
            <p className="text-[14px] text-[#666666] mb-8">
              Let's get started and close some deals.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 bg-[#000000] text-white px-8 py-3 rounded-full text-[14px] font-[500] hover:bg-[#222222] transition-colors shadow-lg shadow-black/10 hover:shadow-black/20"
            >
              Enter Workspace
            </button>
          </motion.div>
        )}

        </AnimatePresence>
      </div>
    </div>
  );
}
