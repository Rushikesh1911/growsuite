import Link from "next/link";

export function CTA() {
  return (
    <section className="py-28 bg-[#FAFAF8] border-t border-[rgba(0,0,0,0.06)]">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">

          {/* Copy */}
          <div className="flex flex-col gap-4 max-w-xl">
            <h2 className="text-[36px] sm:text-[52px] font-[800] tracking-[-0.05em] text-[#0A0A0A] leading-[1]">
              Your business is already moving.
              <br />
              <span className="text-[#8A8A8A]">Give it a better system.</span>
            </h2>
            <p className="text-[15px] text-[#5A5A5A] leading-[1.65] font-[400]">
              Simple business management for freelancers and small teams. Start free — no credit card, no setup, no complexity.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#0A0A0A] hover:bg-[#2A2A2A] text-white text-[14px] font-[500] rounded-full shadow-sm hover:-translate-y-px transition-all duration-150 whitespace-nowrap"
            >
              Start for free
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 6h7M6 2.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <p className="text-[11px] text-[#AFAFAF] font-[400]">Free plan available. No credit card required.</p>
          </div>

        </div>
      </div>
    </section>
  );
}
