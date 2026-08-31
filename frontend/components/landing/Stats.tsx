"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 2400, suffix: "+", label: "Teams worldwide", description: "Scaling sales operations" },
  { value: 98,   suffix: "%", label: "Customer retention", description: "Industry-leading churn" },
  { value: 4.9,  suffix: "",  label: "App Store rating", description: "★★★★★ from 1,200 reviews", decimal: true },
  { value: 3,    suffix: "×", label: "Faster deal cycles", description: "vs. legacy CRM tools" },
];

function useCountUp(target: number, decimal = false, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    const duration = 1800;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = eased * target;
      setCount(decimal ? parseFloat(val.toFixed(1)) : Math.floor(val));
      if (step >= steps) { clearInterval(timer); setCount(target); }
    }, interval);
    return () => clearInterval(timer);
  }, [target, decimal, active]);
  return count;
}

function StatItem({ stat, index, active }: { stat: typeof stats[0], index: number, active: boolean }) {
  const val = useCountUp(stat.value, stat.decimal, active);
  return (
    <div
      className="flex flex-col items-center text-center px-8 py-10 animate-fade-up"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
    >
      <div className="text-[52px] sm:text-[60px] font-medium tracking-[-0.04em] text-white leading-none tabular-nums">
        {stat.decimal ? val.toFixed(1) : val.toLocaleString()}
        <span className="text-[#666]">{stat.suffix}</span>
      </div>
      <div className="mt-3 text-[14px] font-semibold text-[#E5E5E5]">{stat.label}</div>
      <div className="mt-1 text-[12px] text-[var(--gs-muted-light)] font-normal">{stat.description}</div>
    </div>
  );
}

export function Stats() {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="stats"
      ref={ref}
      className="relative overflow-hidden py-4"
      style={{ background: "var(--gs-bg)" }}
    >
      {/* Subtle noise / grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
        }}
      />

      {/* Radial glow center */}
      <div
        className="absolute top-1/2 left-1/2 pointer-events-none"
        style={{
          width: 600,
          height: 400,
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section label */}
        <div className="flex justify-center mb-4 pt-12">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--gs-muted-light)]">
            Trusted at scale
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={stat.label} className="relative">
              {/* Vertical dividers */}
              {i > 0 && (
                <div className="absolute left-0 top-8 bottom-8 w-px bg-[rgba(255,255,255,0.06)]" />
              )}
              <StatItem stat={stat} index={i} active={active} />
            </div>
          ))}
        </div>

        {/* Bottom label */}
        <div className="flex justify-center gap-6 pb-12 mt-2">
          {["SOC 2 Type II", "GDPR Compliant", "99.9% SLA", "256-bit AES"].map((badge) => (
            <span key={badge} className="text-[11px] text-[var(--gs-border-strong)] font-medium">{badge}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
