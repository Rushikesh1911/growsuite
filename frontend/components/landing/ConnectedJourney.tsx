"use client";

import { useState } from "react";

// ─── Journey Steps ──────────────────────────────────────────
const STEPS = [
  {
    id: "lead",
    label: "Lead",
    headline: "First contact",
    sub: "Priya Mehta at Meridian Studio reaches out about a website redesign.",
  },
  {
    id: "deal",
    label: "Deal",
    headline: "Opportunity added",
    sub: "Website Redesign deal created. Stage: Qualified. Close date: Sep 30.",
  },
  {
    id: "client",
    label: "Client",
    headline: "Deal won",
    sub: "The deal converts. Meridian Studio is now a GrowSuite client.",
  },
  {
    id: "project",
    label: "Project",
    headline: "Work begins",
    sub: "Brand Identity Refresh project created under Meridian Studio.",
  },
  {
    id: "tasks",
    label: "Tasks",
    headline: "In progress",
    sub: "4 tasks distributed. 2 completed. Final walkthrough pending.",
  },
  {
    id: "invoice",
    label: "Invoice",
    headline: "Ready to bill",
    sub: "Invoice #GS-1043 created and sent. Amount: ₹75,000.",
  },
  {
    id: "payment",
    label: "Payment",
    headline: "Done",
    sub: "₹75,000 received. Activity logged. One business. One workspace.",
  },
] as const;

type StepId = typeof STEPS[number]["id"];

// ─── Step UI Panels ─────────────────────────────────────────
function StepUI({ id }: { id: StepId }) {
  if (id === "lead") return (
    <div className="flex flex-col gap-3">
      <div className="bg-white border border-[rgba(0,0,0,0.09)] rounded-[10px] p-4 flex items-start gap-3.5 shadow-sm">
        <div className="h-9 w-9 rounded-full bg-[#EAEAE6] flex items-center justify-center text-[13px] font-[600] text-[#5A5A5A] shrink-0">P</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-[13px] font-[600] text-[#0A0A0A]">Priya Mehta</p>
            <span className="text-[9.5px] font-[500] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wide">New lead</span>
          </div>
          <p className="text-[12px] text-[#5A5A5A]">Meridian Studio · Website redesign enquiry</p>
          <div className="flex items-center gap-4 mt-2.5">
            <Pill icon="mail" text="priya@meridian.io" />
            <Pill icon="phone" text="+91 98765 43210" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-[#AFAFAF]">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Added via web form · 10:42 AM
      </div>
    </div>
  );

  if (id === "deal") return (
    <div className="bg-white border border-[rgba(0,0,0,0.09)] rounded-[10px] p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-[600] text-[#0A0A0A]">Website Redesign</p>
          <p className="text-[11.5px] text-[#8A8A8A] mt-0.5">Meridian Studio · Priya Mehta</p>
        </div>
        <span className="text-[9.5px] font-[600] px-2 py-1 rounded-full bg-[#F5F5F0] text-[#5A5A5A] border border-[rgba(0,0,0,0.08)] uppercase tracking-wide shrink-0">Qualified</span>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[rgba(0,0,0,0.06)]">
        <MiniField label="Value" value="₹75,000" mono />
        <MiniField label="Probability" value="65%" />
        <MiniField label="Close date" value="Sep 30" />
      </div>
    </div>
  );

  if (id === "client") return (
    <div className="flex flex-col gap-2.5">
      <div className="bg-white border border-[rgba(0,0,0,0.09)] rounded-[10px] overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 bg-[#FAFAF8] border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between">
          <span className="text-[10px] font-[600] text-[#8A8A8A] uppercase tracking-wider">Clients</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="h-8 w-8 rounded-full bg-[#0A0A0A] flex items-center justify-center text-[11px] font-[600] text-white shrink-0">M</div>
          <div>
            <p className="text-[13px] font-[600] text-[#0A0A0A]">Meridian Studio</p>
            <p className="text-[11px] text-[#8A8A8A]">priya@meridian.io</p>
          </div>
          <span className="ml-auto text-[9.5px] font-[600] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">Active</span>
        </div>
      </div>
      <div className="text-[11px] text-[#AFAFAF] flex items-center gap-1.5">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        Converted from deal · Website Redesign
      </div>
    </div>
  );

  if (id === "project") return (
    <div className="bg-white border border-[rgba(0,0,0,0.09)] rounded-[10px] p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-[7px] bg-[#F5F5F0] flex items-center justify-center shrink-0" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5A5A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div>
          <p className="text-[13px] font-[600] text-[#0A0A0A]">Brand Identity Refresh</p>
          <p className="text-[11px] text-[#8A8A8A]">Meridian Studio</p>
        </div>
        <span className="ml-auto text-[9.5px] font-[600] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wide shrink-0">In Progress</span>
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-[rgba(0,0,0,0.06)]">
        <div className="flex-1 h-1.5 rounded-full bg-[#EAEAEA] overflow-hidden">
          <div className="h-full bg-[#0A0A0A] rounded-full" style={{ width: "25%" }} aria-hidden="true" />
        </div>
        <span className="text-[10.5px] text-[#8A8A8A] tabular-nums shrink-0">1 of 4 tasks</span>
      </div>
    </div>
  );

  if (id === "tasks") return (
    <div className="bg-white border border-[rgba(0,0,0,0.09)] rounded-[10px] p-4 shadow-sm flex flex-col gap-2.5">
      {[
        { title: "Design homepage mockups",     done: true  },
        { title: "Review brand guidelines",     done: true  },
        { title: "Develop staging environment", done: false },
        { title: "Final client walkthrough",    done: false },
      ].map((t, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div className={`h-4 w-4 rounded-[4px] border flex items-center justify-center shrink-0 ${t.done ? "bg-[#0A0A0A] border-[#0A0A0A]" : "border-[rgba(0,0,0,0.2)]"}`}>
            {t.done && <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6l3 3 5-5"/></svg>}
          </div>
          <span className={`text-[12px] ${t.done ? "text-[#AFAFAF] line-through" : "text-[#0A0A0A]"}`}>{t.title}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-2 mt-1 border-t border-[rgba(0,0,0,0.06)]">
        <div className="flex-1 h-1.5 rounded-full bg-[#EAEAEA] overflow-hidden">
          <div className="h-full bg-[#0A0A0A] rounded-full" style={{ width: "50%" }} aria-hidden="true" />
        </div>
        <span className="text-[10.5px] text-[#8A8A8A] tabular-nums shrink-0">2 of 4 done</span>
      </div>
    </div>
  );

  if (id === "invoice") return (
    <div className="flex flex-col gap-2.5">
      <div className="bg-white border border-[rgba(0,0,0,0.09)] rounded-[10px] p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10.5px] text-[#8A8A8A] mb-1">Invoice #GS-1043</p>
            <p className="text-[13px] font-[600] text-[#0A0A0A]">Brand Identity Refresh</p>
            <p className="text-[11px] text-[#8A8A8A]">Meridian Studio</p>
          </div>
          <span className="text-[9.5px] font-[600] px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wide shrink-0">Sent</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[rgba(0,0,0,0.06)]">
          <span className="text-[11px] text-[#8A8A8A]">Total due</span>
          <span className="text-[15px] font-[700] text-[#0A0A0A] tabular-nums">₹75,000</span>
        </div>
      </div>
      <div className="text-[11px] text-[#AFAFAF] flex items-center gap-1.5">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
        Sent to priya@meridian.io · 11:03 AM
      </div>
    </div>
  );

  // Payment (last step)
  return (
    <div className="flex flex-col gap-2.5">
      <div className="bg-white border border-emerald-200 rounded-[10px] p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <p className="text-[13px] font-[600] text-[#0A0A0A]">Payment received</p>
            <p className="text-[11px] text-[#8A8A8A]">Invoice #GS-1043 · Meridian Studio</p>
          </div>
          <span className="ml-auto text-[16px] font-[700] text-emerald-600 tabular-nums">₹75,000</span>
        </div>
        <div className="text-[10.5px] text-[#8A8A8A] flex items-center gap-1.5 pt-2 border-t border-[rgba(0,0,0,0.06)]">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Recorded · 11:27 AM · Activity logged automatically
        </div>
      </div>
    </div>
  );
}

// ─── Helper components ───────────────────────────────────────
function Pill({ icon, text }: { icon: "mail" | "phone"; text: string }) {
  return (
    <div className="flex items-center gap-1 text-[10.5px] text-[#8A8A8A]">
      {icon === "mail" && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
      )}
      {icon === "phone" && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.46 2 2 0 0 1 3.6 2.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.95-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17.4z"/></svg>
      )}
      {text}
    </div>
  );
}

function MiniField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9.5px] text-[#AFAFAF] uppercase tracking-[0.06em] font-[500]">{label}</span>
      <span className={`text-[12px] font-[600] text-[#0A0A0A] ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export function ConnectedJourney() {
  const [activeStep, setActiveStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = (idx: number) => {
    if (idx === activeStep || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveStep(idx);
      setTransitioning(false);
    }, 180);
  };

  const step = STEPS[activeStep];
  const isLast = activeStep === STEPS.length - 1;

  return (
    <section className="py-24 bg-[#FAFAF8] border-t border-[rgba(0,0,0,0.06)]" style={{ scrollMarginTop: "64px" }}>
      <div className="max-w-[1100px] mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col gap-3 mb-14">
          <span className="text-[11px] font-[600] text-[#AFAFAF] uppercase tracking-[0.08em]">How it works</span>
          <h2 className="text-[32px] sm:text-[44px] font-[800] tracking-[-0.04em] text-[#0A0A0A] leading-[1.08]">
            Follow the work —<br />
            <span className="text-[#8A8A8A]">lead to payment.</span>
          </h2>
          <p className="text-[14px] text-[#5A5A5A] leading-[1.65] max-w-[440px]">
            One example. One client. Watch how Meridian Studio moves through GrowSuite from first contact to paid invoice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-10 md:gap-16 items-start">

          {/* ── Step indicators ──────────────────────── */}
          <div className="flex flex-col gap-0 relative">
            {/* Connector line */}
            <div className="absolute left-[11px] top-4 bottom-4 w-px bg-[rgba(0,0,0,0.07)]" aria-hidden="true" />

            {STEPS.map((s, i) => {
              const done    = i < activeStep;
              const current = i === activeStep;
              return (
                <button
                  key={s.id}
                  onClick={() => goTo(i)}
                  className={`flex items-start gap-4 py-3 text-left relative transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] rounded-[6px] pr-3 ${current ? "" : "hover:bg-white"}`}
                  aria-current={current ? "step" : undefined}
                >
                  {/* Step dot */}
                  <div className={`mt-0.5 h-[22px] w-[22px] rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-200 ${
                    current ? "bg-[#0A0A0A]" : done ? "bg-[#0A0A0A]/10" : "bg-white border border-[rgba(0,0,0,0.12)]"
                  }`}>
                    {done ? (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke={current ? "white" : "#5A5A5A"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6l3 3 5-5"/></svg>
                    ) : (
                      <span className={`text-[9px] font-[700] ${current ? "text-white" : "text-[#AFAFAF]"}`}>{i + 1}</span>
                    )}
                  </div>

                  {/* Label + description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] font-[${current ? "700" : "500"}] transition-colors ${current ? "text-[#0A0A0A]" : done ? "text-[#5A5A5A]" : "text-[#8A8A8A]"}`}>
                        {s.label}
                      </span>
                      {current && (
                        <span className="text-[9px] font-[600] px-1.5 py-0.5 rounded-full bg-[#0A0A0A] text-white uppercase tracking-wide">{s.headline}</span>
                      )}
                    </div>
                    {current && (
                      <p className="text-[12px] text-[#5A5A5A] leading-[1.55] mt-1 pr-2">{s.sub}</p>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Navigation */}
            <div className="flex items-center gap-3 mt-6 pl-[38px]">
              <button
                onClick={() => goTo(activeStep - 1)}
                disabled={activeStep === 0}
                className="h-8 px-4 text-[12px] font-[500] rounded-[7px] border border-[rgba(0,0,0,0.1)] text-[#5A5A5A] hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Back
              </button>
              {!isLast ? (
                <button
                  onClick={() => goTo(activeStep + 1)}
                  className="h-8 px-4 text-[12px] font-[500] rounded-[7px] bg-[#0A0A0A] text-white hover:bg-[#2A2A2A] transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => goTo(0)}
                  className="h-8 px-4 text-[12px] font-[500] rounded-[7px] border border-[rgba(0,0,0,0.1)] text-[#5A5A5A] hover:bg-white transition-colors"
                >
                  Start over
                </button>
              )}
            </div>
          </div>

          {/* ── Step UI panel ─────────────────────────── */}
          <div
            className="transition-all duration-180 ease-out"
            style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? "translateY(6px)" : "translateY(0)" }}
            role="region"
            aria-live="polite"
            aria-label={`Step: ${step.label}`}
          >
            {/* Step context header */}
            <div className="mb-4">
              <span className="text-[10px] font-[600] text-[#AFAFAF] uppercase tracking-[0.07em]">
                {step.label} · Meridian Studio
              </span>
            </div>
            <StepUI id={step.id} />

            {/* Final message */}
            {isLast && (
              <div className="mt-6 pt-5 border-t border-[rgba(0,0,0,0.07)]">
                <p className="text-[15px] font-[700] text-[#0A0A0A] tracking-[-0.02em]">One business. One connected workspace.</p>
                <p className="text-[13px] text-[#5A5A5A] mt-1">Lead → Deal → Client → Project → Tasks → Invoice → Payment. All in GrowSuite.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
