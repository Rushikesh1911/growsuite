import React from "react";
// MadeFor: 3-column section with tiny real product UI fragments per audience type

// No illustrations, no fake personas — realistic GrowSuite scenarios

const AUDIENCES = [
  {
    number: "01",
    label: "Freelancers",
    description: "For people who manage the client, the work and the business by themselves.",
    ui: (
      <div className="flex flex-col gap-1.5 text-[11px]">
        <UIRow icon="client"  label="Meridian Studio"   tag="Active"   tagColor="emerald" />
        <UIRow icon="deal"    label="Website Redesign"  tag="Proposal" tagColor="neutral" />
        <UIRow icon="project" label="Brand Refresh"     tag="In progress" tagColor="blue" />
        <UIRow icon="invoice" label="Invoice #GS-1043"  tag="₹75,000"  tagColor="neutral" />
      </div>
    ),
  },
  {
    number: "02",
    label: "Small teams",
    description: "For teams that need shared context without enterprise complexity.",
    ui: (
      <div className="flex flex-col gap-1.5 text-[11px]">
        <UIRow icon="deal"     label="Platform Integration" tag="₹2,40,000" tagColor="neutral" />
        <UIRow icon="deal"     label="Annual Retainer"      tag="₹1,20,000" tagColor="neutral" />
        <UIRow icon="task"     label="Review proposal"      tag="Open"       tagColor="amber"   />
        <UIRow icon="activity" label="4 events today"       tag=""           tagColor="neutral" />
      </div>
    ),
  },
  {
    number: "03",
    label: "Growing businesses",
    description: "For businesses replacing scattered tools with a single system.",
    ui: (
      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-2 gap-1.5 mb-0.5">
          <MiniMetric label="Revenue"    value="₹5,25,000" />
          <MiniMetric label="Open deals" value="4" />
          <MiniMetric label="Conversion" value="34%" />
          <MiniMetric label="Invoiced"   value="₹2,40,000" />
        </div>
        <UIRow icon="payment" label="Payment received" tag="₹1,20,000" tagColor="emerald" />
      </div>
    ),
  },
] as const;

type TagColor = "emerald" | "blue" | "amber" | "neutral";
const TAG_COLORS: Record<TagColor, string> = {
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  blue:    "bg-blue-50 text-blue-600 border-blue-100",
  amber:   "bg-amber-50 text-amber-700 border-amber-100",
  neutral: "bg-[#F5F5F0] text-[#5A5A5A] border-[rgba(0,0,0,0.08)]",
};

function UIRow({ icon, label, tag, tagColor }: { icon: string; label: string; tag: string; tagColor: TagColor }) {
  const iconMap: Record<string, React.ReactElement> = {
    client:   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
    deal:     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 6h13M8 12h13M3 6h.01M3 12h.01"/></svg>,
    project:  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    invoice:  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    task:     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    payment:  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"/><path d="M12 6v2m0 8v2"/></svg>,
    activity: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  };

  return (
    <div className="flex items-center gap-2 bg-[#FAFAF8] rounded-[6px] px-2.5 py-2 border border-[rgba(0,0,0,0.06)]">
      <span className="text-[#8A8A8A] shrink-0">{iconMap[icon]}</span>
      <span className="text-[11px] font-[500] text-[#0A0A0A] flex-1 truncate">{label}</span>
      {tag && (
        <span className={`text-[9px] font-[600] px-1.5 py-0.5 rounded-full border ${TAG_COLORS[tagColor]} shrink-0`}>
          {tag}
        </span>
      )}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#FAFAF8] rounded-[6px] px-2.5 py-2 border border-[rgba(0,0,0,0.06)]">
      <p className="text-[9px] text-[#8A8A8A] mb-0.5">{label}</p>
      <p className="text-[12px] font-[700] text-[#0A0A0A] tabular-nums">{value}</p>
    </div>
  );
}

export function MadeFor() {
  return (
    <section className="py-28 bg-white border-t border-[rgba(0,0,0,0.06)]" style={{ scrollMarginTop: "64px" }}>
      <div className="max-w-[1100px] mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col gap-3 mb-14">
          <span className="text-[11px] font-[600] text-[#AFAFAF] uppercase tracking-[0.08em]">Made for</span>
          <h2 className="text-[30px] sm:text-[42px] font-[800] tracking-[-0.04em] text-[#0A0A0A] leading-[1.1]">
            Built for the way real businesses work.
          </h2>
        </div>

        {/* Three columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[rgba(0,0,0,0.07)]" role="list">
          {AUDIENCES.map((audience) => (
            <div
              key={audience.label}
              role="listitem"
              className="bg-white p-8 flex flex-col gap-6"
            >
              {/* Label */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-[600] text-[#AFAFAF] tabular-nums">{audience.number}</span>
                <h3 className="text-[18px] font-[700] text-[#0A0A0A] tracking-[-0.02em]">{audience.label}</h3>
              </div>

              {/* Product UI fragment */}
              <div className="bg-[#F8F8F6] rounded-[10px] p-3.5 border border-[rgba(0,0,0,0.06)]">
                {audience.ui}
              </div>

              {/* Description */}
              <p className="text-[13.5px] text-[#5A5A5A] leading-[1.65] font-[400]">
                {audience.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
