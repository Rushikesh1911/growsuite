"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

// Only list features that ACTUALLY EXIST in the product
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
    monthlyPrice: 29,
    yearlyPrice: 23,
    description: "For growing businesses that need more scale.",
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
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-28 bg-white border-t border-[rgba(0,0,0,0.06)]">
      <div className="max-w-[1100px] w-full mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col gap-4 mb-14">
          <span className="text-[11px] font-[600] text-[#AFAFAF] uppercase tracking-[0.08em]">Pricing</span>
          <h2 className="text-[32px] sm:text-[44px] font-[800] tracking-[-0.04em] text-[#0A0A0A] leading-[1.05]">
            Simple, transparent pricing.
          </h2>
          <p className="text-[15px] text-[#5A5A5A] max-w-sm leading-[1.65]">
            Start free. Upgrade when your business is ready. No hidden fees.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-[13px] font-[500] transition-colors ${!yearly ? "text-[#0A0A0A]" : "text-[#AFAFAF]"}`}>Monthly</span>
            <button
              onClick={() => setYearly(!yearly)}
              className={`relative h-6 w-11 rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-1 ${yearly ? "bg-[#0A0A0A]" : "bg-[#D5D5D0]"}`}
              aria-pressed={yearly}
              aria-label="Toggle billing period"
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${yearly ? "translate-x-5" : "translate-x-0"}`} />
            </button>
            <span className={`text-[13px] font-[500] transition-colors ${yearly ? "text-[#0A0A0A]" : "text-[#AFAFAF]"}`}>
              Yearly
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#F0F0EC] text-[#0A0A0A] text-[9px] font-[700] uppercase tracking-wide">–20%</span>
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white border rounded-[18px] p-8 flex flex-col gap-6 transition-all duration-200 ${
                plan.featured
                  ? "border-[#0A0A0A] shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
                  : "border-[rgba(0,0,0,0.09)] hover:border-[rgba(0,0,0,0.15)]"
              }`}
            >
              {/* Plan header */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-[600] text-[#5A5A5A]">{plan.name}</span>
                  {plan.featured && (
                    <span className="text-[9px] font-[700] px-2 py-0.5 rounded-full bg-[#0A0A0A] text-white uppercase tracking-wider">Most popular</span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-[40px] font-[800] tracking-[-0.05em] text-[#0A0A0A]">
                    ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-[12px] font-[400] text-[#AFAFAF]">/ mo</span>
                </div>
                <p className="text-[12px] text-[#8A8A8A] leading-[1.55] mt-1">{plan.description}</p>
              </div>

              <div className="h-px bg-[rgba(0,0,0,0.06)]" />

              {/* Features */}
              <ul className="flex-1 flex flex-col gap-2.5">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <span className="mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0 bg-[#F0F0EC]" aria-hidden="true">
                      <Check className="h-2.5 w-2.5 stroke-[2.5] text-[#0A0A0A]" />
                    </span>
                    <span className="text-[13px] font-[400] leading-[1.5] text-[#3A3A3A]">{feat}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={plan.href}>
                <button
                  className={`w-full h-[42px] rounded-[10px] text-[13px] font-[600] transition-all duration-150 hover:-translate-y-px active:scale-[0.98] ${
                    plan.featured
                      ? "bg-[#0A0A0A] text-white hover:bg-[#2A2A2A]"
                      : "bg-[#F5F5F0] text-[#0A0A0A] hover:bg-[#EAEAE6]"
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[#AFAFAF] mt-8">
          All plans include a 14-day free trial. No credit card required.
        </p>

      </div>
    </section>
  );
}
