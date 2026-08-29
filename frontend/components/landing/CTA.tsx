import Link from "next/link";

export function CTA() {
  return (
    <section className="relative py-32 md:py-48 bg-[var(--gs-bg-alt)] overflow-hidden flex flex-col items-center justify-center border-t border-[#1a1a1a]">
      
      {/* Subtle radial gradient background for depth */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-[0.05] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, var(--gs-fg) 0%, transparent 60%)",
        }}
      />
      
      <div className="relative z-10 max-w-[800px] mx-auto px-6 flex flex-col items-center text-center">
        
        {/* Eyebrow */}
        <span className="text-[11px] font-[700] text-[var(--gs-muted)] uppercase tracking-[0.1em] mb-4">
          Ready to simplify?
        </span>

        {/* Main headline */}
        <h2 className="text-[36px] sm:text-[48px] md:text-[56px] font-[800] tracking-[-0.04em] text-white leading-[1.05] mb-5 max-w-[640px]">
          Your business is already moving.
          <br />
          <span className="text-[var(--gs-muted)]">Give it a better system.</span>
        </h2>
        
        {/* Supporting sentence */}
        <p className="text-[16px] text-[#AFAFAF] leading-[1.65] font-[400] max-w-[540px] mb-12 tracking-tight">
          Manage leads, customers, work, and growth in one connected workspace. Built for teams who demand both speed and clarity.
        </p>

        {/* Action */}
        <div className="flex flex-col items-center gap-4">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white hover:bg-[#F0F0F0] text-[var(--gs-bg-alt)] text-[14px] font-[600] rounded-[8px] shadow-[0_4px_32px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_48px_rgba(255,255,255,0.15)] hover:-translate-y-px transition-all duration-200 whitespace-nowrap tracking-tight"
          >
            Start for free
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 6h7M6 2.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <p className="text-[11px] text-[var(--gs-muted-light)] font-[400] tracking-wide mt-2">
            Free plan available &middot; No credit card required
          </p>
        </div>

      </div>
    </section>
  );
}
