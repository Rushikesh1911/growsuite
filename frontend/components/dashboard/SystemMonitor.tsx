"use client";

import { Terminal, Cpu, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SystemMonitorProps {
  backendStatus: "Online" | "Offline" | "Checking";
  dbStatus: "Connected" | "Disconnected" | "Checking";
}

export function SystemMonitor({ backendStatus, dbStatus }: SystemMonitorProps) {
  const logs = [
    { time: "23:05:13", type: "SYSTEM", message: "Dev servers online: Next.js (3000), Express (5000)" },
    { time: "23:05:43", type: "DATABASE", message: "Connected to PostgreSQL database 'growsuite' at localhost:5432" },
    { time: "23:05:44", type: "API", message: "Prisma schema synchronized with 1 model ('User')" },
    { time: "23:06:01", type: "HTTP", message: "POST /users - 201 Created (148ms) - test@example.com" },
    { time: "23:06:44", type: "HTTP", message: "GET /users - 200 OK (22ms)" },
    { time: "23:35:10", type: "SYSTEM", message: "Web-app diagnostic module activated" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full animate-fade animate-duration-150">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-bold text-[var(--gs-fg)] tracking-tight">Diagnostics System</h2>
        <p className="text-xs text-[var(--gs-muted)] mt-0.5">Real-time system telemetry and process output streams.</p>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logs terminal */}
        <Card className="lg:col-span-2 p-6 flex flex-col gap-4 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[12px] font-mono text-xs shadow-none">
          <div className="flex items-center justify-between border-b border-[var(--gs-border)] pb-3">
            <span className="text-[10px] font-bold text-[var(--gs-muted)] uppercase tracking-wider flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[var(--gs-fg)] stroke-[2]" aria-hidden="true" />
              Process Console Logs
            </span>
            <span className="h-2 w-2 rounded-full bg-[#2E7D32]" />
          </div>

          <div className="flex flex-col gap-3 min-h-[220px] overflow-y-auto max-h-[300px] text-[var(--gs-fg)]" role="log" aria-live="polite">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-3 leading-relaxed">
                <span className="text-[var(--gs-muted)] font-medium">{log.time}</span>
                <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] shrink-0 border border-transparent ${
                  log.type === "SYSTEM" ? "bg-[#1B5E20] text-[#A5D6A7]" :
                  log.type === "DATABASE" ? "bg-[#1B5E20] text-[#A5D6A7]" :
                  log.type === "API" ? "bg-[#1B5E20] text-[#A5D6A7]" :
                  "bg-[var(--gs-surface-raised)] text-[var(--gs-muted)] border-[var(--gs-border)]"
                }`}>
                  {log.type}
                </span>
                <span className="text-[var(--gs-fg)] font-medium">{log.message}</span>
              </div>
            ))}
            <div className="text-[var(--gs-muted-light)] mt-1" aria-hidden="true">&gt; Listening for system events...</div>
          </div>
        </Card>

        {/* Telemetry settings */}
        <div className="flex flex-col gap-6">
          <Card className="p-6 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[12px] flex flex-col gap-4 shadow-none">
            <h3 className="text-xs font-bold text-[var(--gs-muted)] uppercase tracking-wider flex items-center gap-2">
              <Cpu className="h-4.5 w-4.5 text-[var(--gs-fg)] stroke-[1.75]" aria-hidden="true" />
              Runtime Telemetry
            </h3>
            
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between border-b border-[var(--gs-border)] pb-2">
                <span className="text-[var(--gs-muted)] font-medium">Node.js Engine</span>
                <span className="text-[var(--gs-fg)] font-mono font-semibold">v20+ (TSX runtime)</span>
              </div>
              <div className="flex justify-between border-b border-[var(--gs-border)] pb-2">
                <span className="text-[var(--gs-muted)] font-medium">Prisma Engine</span>
                <span className="text-[var(--gs-fg)] font-mono font-semibold">v5.22.0</span>
              </div>
              <div className="flex justify-between border-b border-[var(--gs-border)] pb-2">
                <span className="text-[var(--gs-muted)] font-medium">Next.js Web Server</span>
                <span className="text-[var(--gs-fg)] font-mono font-semibold">v16.2.12 (Turbopack)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--gs-muted)] font-medium">Tailwind Utility</span>
                <span className="text-[var(--gs-fg)] font-mono font-semibold">v4.0.0</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[12px] flex flex-col gap-4 shadow-none">
            <h3 className="text-xs font-bold text-[var(--gs-muted)] uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-[var(--gs-fg)] stroke-[1.75]" aria-hidden="true" />
              Connection Stack
            </h3>
            
            <div className="flex flex-col gap-2.5 text-xs text-[var(--gs-muted)]">
              <div className="flex items-center gap-2.5">
                <span className={`h-2 w-2 rounded-full ${backendStatus === "Online" ? "bg-[#2E7D32]" : "bg-[#C62828]"}`} aria-hidden="true" />
                <span>Express API: <strong className="text-[var(--gs-fg)] font-semibold">port 5000</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className={`h-2 w-2 rounded-full ${dbStatus === "Connected" ? "bg-[#2E7D32]" : "bg-[#C62828]"}`} aria-hidden="true" />
                <span>PostgreSQL DB: <strong className="text-[var(--gs-fg)] font-semibold">port 5432</strong></span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
