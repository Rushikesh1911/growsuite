"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "GrowSuite replaced three separate tools for us. Our team's close rate jumped 40% in the first quarter after switching.",
    name: "Sarah Chen",
    role: "@sarah_chen",
    company: "Meridian Health",
    avatar: "#B7D4E8",
    initials: "SC",
    verified: true,
  },
  {
    quote: "The pipeline visualization is genuinely the best I've seen in a CRM. It feels like Figma built a sales tool. Incredibly fast and intuitive.",
    name: "Marcus O.",
    role: "@marcus_o",
    company: "Archetype Labs",
    avatar: "#E8D5B7",
    initials: "MO",
    verified: true,
  },
  {
    quote: "We manage 12,000 contacts and GrowSuite handles it effortlessly. The automation alone saves us 20 hours a week.",
    name: "Priya Nair",
    role: "@priya_nair",
    company: "Solis Capital",
    avatar: "#D5B7E8",
    initials: "PN",
    verified: true,
  },
  {
    quote: "Finally, a CRM that doesn't feel like a spreadsheet from 2005. The UX is breathtaking and my team actually uses it.",
    name: "David Kim",
    role: "@david_k",
    company: "Ventura",
    avatar: "#B7E8C7",
    initials: "DK",
    verified: false,
  },
  {
    quote: "I was skeptical about moving away from Salesforce, but the migration took 5 minutes and we haven't looked back. Highly recommend.",
    name: "Elena Rostova",
    role: "@elena_r",
    company: "Pinnacle Data",
    avatar: "#E8B7B7",
    initials: "ER",
    verified: true,
  },
  {
    quote: "GrowSuite's invoicing feature integrated directly into our pipeline means we never forget to bill a client. Revenue is up 15%.",
    name: "James Webb",
    role: "@jwebb_design",
    company: "JW Studio",
    avatar: "#D4B7E8",
    initials: "JW",
    verified: false,
  },
  {
    quote: "The cleanest UI I've ever used. End of story.",
    name: "Alicia Keys",
    role: "@alicia_ux",
    company: "Independent",
    avatar: "#B7E8D5",
    initials: "AK",
    verified: true,
  },
  {
    quote: "Client portals changed how we work. Instead of sending 50 emails a week, clients just log in and see their project status.",
    name: "Thomas Wright",
    role: "@tom_wright",
    company: "Wright & Co",
    avatar: "#E8E0B7",
    initials: "TW",
    verified: true,
  },
  {
    quote: "It's the only tool you need to run a modern agency. Period.",
    name: "Nina Singh",
    role: "@nina_singh",
    company: "Apex Media",
    avatar: "#E8B7D4",
    initials: "NS",
    verified: true,
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
    <section id="testimonials" className="py-32 md:py-40 bg-[#FAFAF8] border-t border-[rgba(0,0,0,0.05)] relative overflow-hidden">
      
      {/* Background radial gradient for depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.02)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        
        {/* Section label */}
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[rgba(0,0,0,0.06)] shadow-sm text-[11px] font-bold text-[var(--gs-bg-alt)] uppercase tracking-widest">
            Wall of Love
          </span>
          <h2 className="text-[36px] md:text-[48px] font-medium tracking-tight text-[var(--gs-bg-alt)] leading-[1.05] max-w-2xl">
            Trusted by the fastest <br />
            <span className="text-[#AFAFAF]">growing teams.</span>
          </h2>
        </div>

        {/* Logo marquee */}
        <div className="relative overflow-hidden mb-20 max-w-4xl mx-auto opacity-70">
          <div className="flex animate-marquee gap-16 whitespace-nowrap" style={{ width: "max-content" }}>
            {[...logos, ...logos, ...logos].map((logo, i) => (
              <span
                key={i}
                className="text-[16px] font-medium tracking-tight text-[#CCCCCC] uppercase select-none"
              >
                {logo}
              </span>
            ))}
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#FAFAF8] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#FAFAF8] to-transparent pointer-events-none" />
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="break-inside-avoid bg-white border border-[rgba(0,0,0,0.06)] rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-5"
            >
              {/* Author Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-[13px] font-bold text-[var(--gs-bg-alt)] shadow-inner"
                    style={{ background: t.avatar }}
                  >
                    {t.initials}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-[14px] font-bold tracking-tight text-[var(--gs-bg-alt)]">{t.name}</span>
                      {t.verified && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#007AFF" aria-hidden="true">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-[12px] text-[#666] font-medium">{t.role}</span>
                  </div>
                </div>
                {/* X Logo faint */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(0,0,0,0.15)" aria-hidden="true">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                </svg>
              </div>

              {/* Quote */}
              <p className="text-[14.5px] text-[#333] leading-[1.6] font-normal">
                {t.quote}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Fade Out Gradient at bottom to encourage scrolling */}
        <div className="w-full h-32 bg-gradient-to-t from-[#FAFAF8] to-transparent absolute bottom-0 left-0 pointer-events-none" />

      </div>
    </section>
  );
}
