"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Menu, X, ChevronDown, Layers, FolderKanban, Receipt, LineChart, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Solutions", href: "#", dropdown: true },
  { label: "Resources", href: "#", dropdown: true },
  { label: "Pricing",  href: "#pricing" },
];

const productFeatures = [
  { label: "Sales Pipeline", desc: "Manage deals & close rates visually.", icon: Layers, href: "#pipeline", color: "text-[var(--gs-bg-alt)]", bg: "bg-[#F5F5F0]" },
  { label: "Projects & Tasks", desc: "Keep client deliverables on track.", icon: FolderKanban, href: "#projects", color: "text-[var(--gs-bg-alt)]", bg: "bg-[#F5F5F0]" },
  { label: "Invoicing & Payments", desc: "Get paid faster with automated billing.", icon: Receipt, href: "#invoicing", color: "text-[var(--gs-bg-alt)]", bg: "bg-[#F5F5F0]" },
  { label: "Analytics & Reports", desc: "Measure revenue and team performance.", icon: LineChart, href: "#analytics", color: "text-[var(--gs-bg-alt)]", bg: "bg-[#F5F5F0]" },
];

const solutionsLinks = [
  { label: "For Agencies", desc: "Manage multiple clients with ease.", href: "#" },
  { label: "For Freelancers", desc: "Professionalize your solo practice.", href: "#" },
  { label: "For Consultants", desc: "Track billable hours & retainers.", href: "#" },
];

const resourcesLinks = [
  { label: "Blog", desc: "Insights on growing your business.", href: "#" },
  { label: "Help Center", desc: "Step-by-step guides and tutorials.", href: "#" },
  { label: "Community", desc: "Connect with other founders.", href: "#" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header ref={navRef} className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 transition-all duration-300">
      <nav
        className={`
          w-full max-w-[1000px] flex items-center justify-between
          px-4 h-[56px] rounded-full mx-auto relative
          transition-[box-shadow,background,border-color,width] duration-300 ease-out
          ${scrolled
            ? "bg-white/70 backdrop-blur-2xl border border-[rgba(0,0,0,0.08)] shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            : "bg-transparent border border-transparent"
          }
        `}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="GrowSuite home"
        >
          <Logo />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 h-full">
          
          {/* Product Mega Menu Trigger */}
          <div 
            className="relative h-full flex items-center"
            onMouseEnter={() => setActiveDropdown("Product")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              className={`flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-[600] rounded-full transition-colors duration-200 ${
                activeDropdown === "Product" ? "bg-[rgba(0,0,0,0.04)] text-[var(--gs-bg-alt)]" : "text-[#5A5A5A] hover:text-[var(--gs-bg-alt)]"
              }`}
            >
              Product
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeDropdown === "Product" ? "rotate-180" : ""}`} />
            </button>

            {/* Mega Menu Dropdown */}
            <AnimatePresence>
              {activeDropdown === "Product" && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-[50px] left-1/2 -translate-x-1/2 w-[600px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_24px_64px_rgba(0,0,0,0.08)] rounded-[20px] p-3 overflow-hidden flex gap-2"
                >
                  {/* Left Column (Main Features) */}
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="px-3 py-2 text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest">Platform Core</span>
                    <div className="grid grid-cols-2 gap-1">
                      {productFeatures.map((feat) => {
                        const Icon = feat.icon;
                        return (
                          <Link key={feat.label} href={feat.href} className="group p-3 rounded-[12px] hover:bg-[#FAFAF8] transition-colors flex items-start gap-3">
                            <div className={`h-8 w-8 rounded-[8px] flex items-center justify-center shrink-0 ${feat.bg} ${feat.color}`}>
                              <Icon className="h-4 w-4" strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[13px] font-[700] text-[var(--gs-bg-alt)]">{feat.label}</span>
                              <span className="text-[12px] text-[var(--gs-muted)] font-[400] leading-snug">{feat.desc}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column (Highlight) */}
                  <div className="w-[180px] bg-[#FAFAF8] rounded-[14px] p-4 flex flex-col justify-between shrink-0">
                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest">New Feature</span>
                      <p className="text-[13px] font-[600] text-[var(--gs-bg-alt)] leading-tight">Client Portals are now live.</p>
                      <p className="text-[12px] text-[var(--gs-muted)] leading-tight">Give your clients a branded dashboard.</p>
                    </div>
                    <Link href="#portals" className="flex items-center gap-1 text-[12px] font-[600] text-[var(--gs-bg-alt)] hover:text-[#5A5A5A] group">
                      Explore Portals
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Standard Links & Dropdowns */}
          {navLinks.map((item) => (
            item.dropdown ? (
              <div 
                key={item.label}
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-[600] rounded-full transition-colors duration-200 ${
                    activeDropdown === item.label ? "bg-[rgba(0,0,0,0.04)] text-[var(--gs-bg-alt)]" : "text-[#5A5A5A] hover:text-[var(--gs-bg-alt)]"
                  }`}
                >
                  {item.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-[50px] left-1/2 -translate-x-1/2 w-[280px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_24px_64px_rgba(0,0,0,0.08)] rounded-[16px] p-2 flex flex-col gap-1"
                    >
                      {item.label === "Solutions" && solutionsLinks.map(link => (
                        <Link key={link.label} href={link.href} className="flex flex-col gap-0.5 p-3 rounded-[10px] hover:bg-[#FAFAF8] transition-colors">
                          <span className="text-[13px] font-[600] text-[var(--gs-bg-alt)]">{link.label}</span>
                          <span className="text-[12px] text-[var(--gs-muted)] font-[400] leading-snug">{link.desc}</span>
                        </Link>
                      ))}
                      {item.label === "Resources" && resourcesLinks.map(link => (
                        <Link key={link.label} href={link.href} className="flex flex-col gap-0.5 p-3 rounded-[10px] hover:bg-[#FAFAF8] transition-colors">
                          <span className="text-[13px] font-[600] text-[var(--gs-bg-alt)]">{link.label}</span>
                          <span className="text-[12px] text-[var(--gs-muted)] font-[400] leading-snug">{link.desc}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="group flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-[600] text-[#5A5A5A] hover:text-[var(--gs-bg-alt)] rounded-[8px] transition-colors duration-200"
              >
                {item.label}
              </a>
            )
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/auth/sign-in"
            className="hidden sm:inline-flex text-[14px] font-[600] text-[#5A5A5A] hover:text-[var(--gs-bg-alt)] transition-colors duration-200"
          >
            Log in
          </Link>
          <Link
            href="/auth/sign-up"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 bg-[var(--gs-bg-alt)] hover:bg-[var(--gs-border)] text-white text-[13px] font-[600] rounded-[8px] transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-px"
          >
            Get started
          </Link>
          <button 
            className="md:hidden p-2 -mr-2 text-[var(--gs-bg-alt)] rounded-[8px] hover:bg-[rgba(0,0,0,0.04)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[70px] left-4 right-4 bg-white/90 backdrop-blur-3xl border border-[#EAEAEA] rounded-[20px] shadow-2xl overflow-hidden flex flex-col p-2 z-40 md:hidden"
          >
            <div className="flex flex-col p-2 gap-1 mb-2 border-b border-[rgba(0,0,0,0.05)] pb-4">
              <span className="px-3 py-2 text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest">Product Features</span>
              {productFeatures.map((feat) => (
                <Link
                  key={feat.label}
                  href={feat.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 text-[14px] font-[600] text-[var(--gs-bg-alt)] hover:bg-[#F5F5F0] rounded-[12px] transition-colors flex items-center gap-3"
                >
                  <div className={`h-6 w-6 rounded-[6px] flex items-center justify-center shrink-0 ${feat.bg} ${feat.color}`}>
                    <feat.icon className="h-3 w-3" strokeWidth={2.5} />
                  </div>
                  {feat.label}
                </Link>
              ))}
            </div>
            
            <div className="flex flex-col p-2 gap-1 mb-2 border-b border-[rgba(0,0,0,0.05)] pb-4">
               <span className="px-3 py-2 text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest">More</span>
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 text-[14px] font-[600] text-[#5A5A5A] hover:text-[var(--gs-bg-alt)] hover:bg-[#F5F5F0] rounded-[12px] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
            
            <div className="flex flex-col p-2 gap-2">
              <Link
                href="/auth/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-[14px] font-[600] text-center text-[#5A5A5A] hover:text-[var(--gs-bg-alt)] bg-[#FAFAF8] rounded-[12px] transition-colors"
              >
                Log in to account
              </Link>
              <Link
                href="/auth/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-[14px] font-[600] text-center text-white bg-[var(--gs-bg-alt)] rounded-[12px] transition-colors"
              >
                Start for free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
