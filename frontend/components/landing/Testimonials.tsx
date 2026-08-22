"use client";

const testimonials = [
  {
    quote:
      "GrowSuite replaced three separate tools for us. Our team's close rate jumped 40% in the first quarter after switching.",
    name: "Sarah Chen",
    role: "VP of Sales",
    company: "Meridian Health",
    avatar: "#B7D4E8",
    initials: "SC",
  },
  {
    quote:
      "The pipeline visualization is genuinely the best I've seen in a CRM. It feels like Figma built a sales tool.",
    name: "Marcus O.",
    role: "Co-founder & CEO",
    company: "Archetype Labs",
    avatar: "#E8D5B7",
    initials: "MO",
  },
  {
    quote:
      "We manage 12,000 contacts and GrowSuite handles it effortlessly. The automation alone saves us 20 hours a week.",
    name: "Priya Nair",
    role: "Head of Operations",
    company: "Solis Capital",
    avatar: "#D5B7E8",
    initials: "PN",
  },
];

const logos = [
  "Meridian",
  "Archetype",
  "Solis",
  "Veritas",
  "Luminary",
  "Cascade",
  "Pinnacle",
  "Axiom",
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-32 bg-[#FFFFFF] border-t border-[#EAEAEA]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section label */}
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.07)] text-[11px] font-[700] text-[#6B6B6B] uppercase tracking-widest">
            Customers
          </span>
          <h2 className="text-[36px] sm:text-[44px] font-[800] tracking-[-0.035em] text-[#0A0A0A] leading-[1.05] max-w-lg">
            Loved by high-performing teams.
          </h2>
          <p className="text-[15px] text-[#6B6B6B] max-w-md leading-[1.7]">
            From seed-stage startups to enterprise teams — GrowSuite scales with every stage of growth.
          </p>
        </div>

        {/* Logo marquee */}
        <div className="relative overflow-hidden mb-14">
          <div className="flex animate-marquee gap-12 whitespace-nowrap" style={{ width: "max-content" }}>
            {[...logos, ...logos].map((logo, i) => (
              <span
                key={i}
                className="text-[13px] font-[700] tracking-[-0.01em] text-[#CCCCCC] uppercase select-none"
              >
                {logo}
              </span>
            ))}
          </div>
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 pointer-events-none" style={{ background: "linear-gradient(to right, #FFFFFF, transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none" style={{ background: "linear-gradient(to left, #FFFFFF, transparent)" }} />
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="group relative bg-[#FAFAFA] hover:bg-[#F4F4F5] border border-[#EAEAEA] rounded-[24px] p-8 flex flex-col gap-5
                gs-card-hover animate-fade-up"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <svg key={si} width="13" height="13" viewBox="0 0 13 13" fill="#F59E0B">
                    <path d="M6.5 1L8.2 4.5H12L9.1 6.9L10.3 10.5L6.5 8.1L2.7 10.5L3.9 6.9L1 4.5H4.8L6.5 1Z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-[14px] text-[#3D3D3D] leading-[1.7] font-[400] flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-1 border-t border-[rgba(0,0,0,0.05)]">
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center text-[12px] font-[700] text-[#3D3D3D]"
                  style={{ background: t.avatar }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-[13px] font-[600] text-[#0A0A0A]">{t.name}</div>
                  <div className="text-[11px] text-[#8A8A8A] font-[400]">
                    {t.role} · {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
