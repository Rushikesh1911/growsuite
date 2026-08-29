"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "For freelancers and solo operators getting started.",
    features: [
      "Up to 100 leads",
      "1 pipeline",
      "Clients & projects",
      "Tasks & activity feed",
      "Basic invoicing",
      "CSV import",
    ],
    cta: "Start for free",
    href: "/auth/sign-up",
    featured: false,
  },
  {
    name: "Professional",
    monthlyPrice: 2499,
    yearlyPrice: 1999,
    description: "For growing businesses that need more scale and insights.",
    features: [
      "Unlimited leads & deals",
      "Unlimited pipelines",
      "Unlimited clients & projects",
      "Payments tracking",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Start free trial",
    href: "/auth/sign-up",
    featured: true,
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="py-32 md:py-40 bg-[#FAFAF8] relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[rgba(0,0,0,0.03)] to-transparent pointer-events-none rounded-full blur-3xl" />

      <div className="max-w-[1000px] w-full mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-16 mx-auto max-w-2xl">
          <span className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-[0.1em]">Pricing</span>
          <h2 className="text-[32px] sm:text-[44px] font-[800] tracking-[-0.04em] text-[var(--gs-bg-alt)] leading-[1.08]">
            Simple, transparent pricing.
          </h2>
          <p className="text-[16px] text-[var(--gs-muted)] max-w-md leading-[1.65]">
            Start for free. Upgrade when your business is ready.
          </p>

          {/* Toggle */}
          <div className="mt-6 flex items-center gap-3 p-1.5 bg-[#EAEAEA] rounded-[8px] border border-[rgba(0,0,0,0.05)] shadow-inner">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-[6px] text-[13px] font-[600] transition-all duration-300 ${
                !yearly ? "bg-white text-[var(--gs-bg-alt)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]" : "text-[var(--gs-muted-light)] hover:text-[var(--gs-bg-alt)]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-[6px] text-[13px] font-[600] transition-all duration-300 flex items-center gap-2 ${
                yearly ? "bg-white text-[var(--gs-bg-alt)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]" : "text-[var(--gs-muted-light)] hover:text-[var(--gs-bg-alt)]"
              }`}
            >
              Yearly
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${yearly ? "bg-[rgba(0,0,0,0.05)] text-[#333]" : "bg-black/5 text-[#555]"}`}>Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
          {plans.map((plan) => {
            const isPro = plan.featured;
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <div 
                key={plan.name}
                className={`relative flex flex-col p-8 sm:p-10 rounded-[24px] transition-all duration-300 ${
                  isPro 
                    ? "bg-[var(--gs-bg-alt)] text-white shadow-2xl scale-100 md:scale-[1.02] z-10 border border-[var(--gs-border)]" 
                    : "bg-white text-[var(--gs-bg-alt)] shadow-lg border border-[rgba(0,0,0,0.06)] scale-100"
                }`}
              >
                {/* Popular Badge */}
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[var(--gs-fg)] text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-[20px] font-bold tracking-tight mb-2 ${isPro ? "text-white" : "text-[var(--gs-bg-alt)]"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-[13px] leading-relaxed ${isPro ? "text-[var(--gs-muted)]" : "text-[var(--gs-muted)]"}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8 flex items-baseline gap-1">
                  <span className={`text-[44px] font-[800] tracking-tight tabular-nums leading-none ${isPro ? "text-white" : "text-[var(--gs-bg-alt)]"}`}>
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  <span className={`text-[14px] font-medium ${isPro ? "text-[var(--gs-muted-light)]" : "text-[var(--gs-muted)]"}`}>
                    /mo
                  </span>
                </div>

                <Link
                  href={plan.href}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-[8px] text-[14px] font-[600] transition-all duration-200 mb-10 ${
                    isPro 
                      ? "bg-white text-[var(--gs-bg-alt)] hover:bg-[#EAEAEA] hover:scale-[1.02]" 
                      : "bg-[#FAFAF8] text-[var(--gs-bg-alt)] border border-[rgba(0,0,0,0.08)] hover:bg-[#EAEAEA]"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex-1">
                  <p className={`text-[11px] font-bold uppercase tracking-wider mb-4 ${isPro ? "text-[var(--gs-muted-light)]" : "text-[#AFAFAF]"}`}>
                    Includes:
                  </p>
                  <ul className="flex flex-col gap-3.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isPro ? "bg-white/10" : "bg-[var(--gs-bg-alt)]/5"}`}>
                          <Check className={`w-2.5 h-2.5 ${isPro ? "text-white" : "text-[var(--gs-bg-alt)]"}`} strokeWidth={3} />
                        </div>
                        <span className={`text-[14px] ${isPro ? "text-[var(--gs-fg)]" : "text-[#555]"}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-[#AFAFAF] mt-8 text-center mx-auto">
          All plans include a 14-day free trial. No credit card required.
        </p>

      </div>
    </section>
  );
}
