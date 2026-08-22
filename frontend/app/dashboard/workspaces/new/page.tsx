"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Command } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PopoverSelect } from "@/components/ui/popover-select";

export default function CreateWorkspacePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [name, setName] = useState("");
  const [useCase, setUseCase] = useState("");

  // Step 2
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");

  const useCases = ["Freelancer", "Agency", "Small team", "Other"];

  const handleCreate = async () => {
    if (!name) return;
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("growsuite_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          currency,
          timezone,
          dateFormat
        })
      });

      if (!res.ok) {
        throw new Error("Failed to create workspace");
      }

      const workspace = await res.json();
      
      // Update local storage to switch to the new workspace immediately
      localStorage.setItem("growsuite_workspace_id", workspace.id.toString());
      
      // Dispatch success toast
      window.dispatchEvent(new CustomEvent("showToast", {
        detail: { message: "Workspace created successfully", type: "success" }
      }));

      // Redirect to dashboard (which will now load the new workspace's empty data)
      router.push("/dashboard");

    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-[#000000] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#222222] rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1A1A1A] rounded-full blur-[120px] opacity-20 pointer-events-none" />

      {/* Brand Logo */}
      <div className="absolute top-8 left-8 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity z-10" onClick={() => router.push("/dashboard")}>
        <div className="h-8 w-8 bg-[#EDEDED] rounded-lg flex items-center justify-center">
          <Command className="h-4 w-4 text-[#000000]" />
        </div>
        <span className="text-lg font-bold text-[#EDEDED] tracking-tight">GrowSuite</span>
      </div>

      <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-500 z-10">
        
        {step === 1 && (
          <>
            <div className="flex flex-col mb-8 gap-2">
              <div className="text-[12px] font-bold tracking-wider text-[#666666] uppercase mb-1">Workspace / Create</div>
              <h1 className="text-2xl font-bold text-[#EDEDED] tracking-tight">Create a workspace</h1>
              <p className="text-[14px] text-[#888888]">Set up a separate space for your business or team.</p>
            </div>

            <Card className="bg-[#0A0A0A] border-[#222222] p-8 shadow-2xl rounded-[12px] flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="text-[10px] font-bold text-[#666666] tracking-wider uppercase mb-2">Workspace Details</div>
                <label className="text-[12px] font-medium text-[#888888]">Workspace name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Studio"
                  className="w-full bg-[#000000] border border-[#333333] rounded-[6px] px-4 py-2.5 text-[14px] text-[#EDEDED] focus:outline-none focus:border-[#666666] transition-colors placeholder:text-[#444444]"
                />
                <span className="text-[11px] text-[#666666] mt-1">You can change this later.</span>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[12px] font-medium text-[#888888]">What will you use GrowSuite for? (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  {useCases.map((uc) => (
                    <button
                      key={uc}
                      onClick={() => setUseCase(uc)}
                      className={`py-2 px-3 rounded-[6px] border text-[13px] font-medium transition-colors ${
                        useCase === uc
                          ? "bg-[#111111] border-[#EDEDED] text-[#EDEDED]"
                          : "bg-[#000000] border-[#333333] text-[#888888] hover:border-[#666666] hover:text-[#EDEDED]"
                      }`}
                    >
                      {uc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-[13px] text-[#888888] hover:text-[#EDEDED] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!name.trim()}
                  className="bg-[#EDEDED] hover:bg-[#FFFFFF] text-[#000000] rounded-[6px] py-2 px-4 text-[13px] font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </Card>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex flex-col mb-8 gap-2">
              <div className="text-[12px] font-bold tracking-wider text-[#666666] uppercase mb-1">Create workspace</div>
              <h1 className="text-2xl font-bold text-[#EDEDED] tracking-tight">Workspace preferences</h1>
              <p className="text-[14px] text-[#888888]">Configure how information is displayed in this workspace.</p>
              <p className="text-[12px] text-[#666666]">These settings can be changed later in Workspace settings.</p>
            </div>

            <Card className="bg-[#0A0A0A] border-[#222222] p-8 shadow-2xl rounded-[12px] flex flex-col gap-6">
              
              <div className="flex flex-col gap-2 relative">
                <label className="text-[12px] font-medium text-[#888888]">Currency</label>
                <PopoverSelect
                  value={currency}
                  onChange={setCurrency}
                  options={[
                    { label: "INR (₹)", value: "INR" },
                    { label: "USD ($)", value: "USD" },
                    { label: "EUR (€)", value: "EUR" },
                    { label: "GBP (£)", value: "GBP" },
                  ]}
                  className="w-full h-[40px] bg-[#000000] border border-[#333333] rounded-[6px] px-3 m-0 flex justify-between"
                />
              </div>

              <div className="flex flex-col gap-2 relative">
                <label className="text-[12px] font-medium text-[#888888]">Timezone</label>
                <PopoverSelect
                  value={timezone}
                  onChange={setTimezone}
                  options={[
                    { label: "Asia/Kolkata", value: "Asia/Kolkata" },
                    { label: "UTC", value: "UTC" },
                    { label: "America/New_York", value: "America/New_York" },
                    { label: "Europe/London", value: "Europe/London" },
                  ]}
                  className="w-full h-[40px] bg-[#000000] border border-[#333333] rounded-[6px] px-3 m-0 flex justify-between"
                />
              </div>

              <div className="flex flex-col gap-2 relative">
                <label className="text-[12px] font-medium text-[#888888]">Date format</label>
                <PopoverSelect
                  value={dateFormat}
                  onChange={setDateFormat}
                  options={[
                    { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
                    { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
                    { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
                  ]}
                  className="w-full h-[40px] bg-[#000000] border border-[#333333] rounded-[6px] px-3 m-0 flex justify-between"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-[6px] p-3 text-center">
                  <p className="text-[12px] text-red-500 font-medium">{error}</p>
                </div>
              )}

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-[13px] text-[#888888] hover:text-[#EDEDED] font-medium transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="bg-[#EDEDED] hover:bg-[#FFFFFF] text-[#000000] rounded-[6px] py-2 px-4 text-[13px] font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create workspace"}
                </button>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
