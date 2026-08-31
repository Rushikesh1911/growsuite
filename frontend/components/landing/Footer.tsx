"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ArrowRight } from "lucide-react";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Pipeline", href: "#pipeline" },
      { label: "Clients & Projects", href: "#projects" },
      { label: "Invoices & Payments", href: "#invoicing" },
      { label: "Activity Feed", href: "#activity" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "vs Salesforce", href: "#" },
      { label: "vs HubSpot", href: "#" },
      { label: "vs Pipedrive", href: "#" },
      { label: "vs Monday", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Help Center", href: "#" },
      { label: "Community", href: "#" },
      { label: "Agency Partners", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

const socials = [
  {
    label: "X (Twitter)",
    href: "https://x.com/RushikeshK36585",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/Rushikesh1911",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/rushikesh-kulkarni-69304b304/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="bg-[#FAFAF8]">
      
      <div className="max-w-[1200px] mx-auto px-6 py-20 pb-10">

        {/* Top row of links */}
        <div className="flex flex-col lg:flex-row justify-between gap-16 pb-16 border-b border-[rgba(0,0,0,0.06)]">
          {/* Brand */}
          <div className="flex flex-col gap-6 shrink-0 lg:w-[280px]">
            <Link href="/" aria-label="GrowSuite home">
              <Logo />
            </Link>
            <p className="text-[13.5px] text-[#666] leading-[1.6]">
              The unified workspace for modern agencies. Clients, projects, and revenue in one place.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-5 pt-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="text-[#AFAFAF] hover:text-[var(--gs-bg-alt)] hover:-translate-y-0.5 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 w-full lg:w-auto">
            {footerLinks.map((col) => (
              <div key={col.title} className="flex flex-col gap-5">
                <h4 className="text-[12px] font-medium text-[var(--gs-bg-alt)] uppercase tracking-[0.06em]">{col.title}</h4>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.href}
                        className="text-[13.5px] text-[var(--gs-muted-light)] hover:text-[var(--gs-bg-alt)] transition-colors font-medium"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-[12.5px] text-[#AFAFAF] font-medium">
          <span>
            © {new Date().getFullYear()} GrowSuite. All rights reserved.
          </span>
          <span className="md:absolute md:left-1/2 md:-translate-x-1/2">
            Made by <a href="https://rushixh.vercel.app" target="_blank" rel="noreferrer" className="text-[var(--gs-muted-light)] hover:text-[var(--gs-bg-alt)] transition-colors underline decoration-transparent hover:decoration-current underline-offset-4 font-semibold">Rushikesh</a>
          </span>
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#28CA41] opacity-40"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#28CA41]"></span>
              </span>
              All systems operational
            </span>
          </span>
        </div>

      </div>
    </footer>
  );
}
