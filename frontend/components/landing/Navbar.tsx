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
  let timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isDarkSection, setIsDarkSection] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      
      const darkSections = document.querySelectorAll('.dark-section');
      let overDark = false;
      darkSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 32 && rect.bottom >= 32) {
          overDark = true;
        }
      });
      setIsDarkSection(overDark);
    };
    
    window.addEventListener("scroll", onScroll, { passive: true });
    // Check initially in case of reload on scrolled page
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(label);
  };

  return (
    <header 
      ref={navRef} 
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 border-b ${
        scrolled 
          ? isDarkSection
            ? "bg-[#0A0A0A]/90 backdrop-blur-md border-[#222] shadow-[0_4px_24px_rgba(0,0,0,0.2)] text-white"
            : "bg-white/90 backdrop-blur-md border-[rgba(0,0,0,0.08)] shadow-[0_4px_24px_rgba(0,0,0,0.02)]" 
          : "bg-transparent border-transparent"
      }`}
    >
      <nav className="w-full max-w-7xl flex items-center justify-between px-6 h-[64px] mx-auto relative">
        <Link href="/" aria-label="GrowSuite home" className="flex-shrink-0 z-10">
          <Logo theme={isDarkSection ? "dark" : "light"} />
        </Link>

        {/* Desktop Nav Links container tracking mouse leave */}
        <div 
          className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 h-full z-20"
          onMouseLeave={handleMouseLeave}
        >
          {/* Product Trigger */}
          <button
            onMouseEnter={() => handleMouseEnter("Product")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-[8px] transition-colors duration-200 ${
              activeDropdown === "Product" 
                ? isDarkSection ? "bg-white/10 text-white" : "bg-[#F7F7F7] text-[var(--gs-bg-alt)]" 
                : isDarkSection ? "text-[#A3A3A3] hover:text-white" : "text-[#5A5A5A] hover:text-[var(--gs-bg-alt)]"
            }`}
          >
            Product
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeDropdown === "Product" ? "rotate-180" : ""}`} />
          </button>

          {/* Dynamic Map for Solutions, Resources, Pricing */}
          {navLinks.map((item) => (
            item.dropdown ? (
              <button
                key={item.label}
                onMouseEnter={() => handleMouseEnter(item.label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-[8px] transition-colors duration-200 ${
                  activeDropdown === item.label 
                    ? isDarkSection ? "bg-white/10 text-white" : "bg-[#F7F7F7] text-[var(--gs-bg-alt)]" 
                    : isDarkSection ? "text-[#A3A3A3] hover:text-white" : "text-[#5A5A5A] hover:text-[var(--gs-bg-alt)]"
                }`}
              >
                {item.label}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180" : ""}`} />
              </button>
            ) : (
              <a
                key={item.label}
                href={item.href}
                onMouseEnter={() => handleMouseEnter(item.label)} // Set active for tracking but no dropdown
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-[8px] transition-colors duration-200 ${
                  isDarkSection ? "text-[#A3A3A3] hover:text-white" : "text-[#5A5A5A] hover:text-[var(--gs-bg-alt)]"
                }`}
              >
                {item.label}
              </a>
            )
          ))}

          {/* Unified Shifting Dropdown Background Container */}
          <div className="absolute top-[64px] left-1/2 -translate-x-1/2 pt-1 pointer-events-none">
            <AnimatePresence>
              {activeDropdown && activeDropdown !== "Pricing" && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-auto bg-white rounded-[20px] shadow-[0_24px_64px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.08)] overflow-hidden"
                >
                  <motion.div layout className="relative">
                    <AnimatePresence mode="wait">
                      {/* Product Content */}
                      {activeDropdown === "Product" && (
                        <motion.div
                          key="product"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                          className="w-[640px] p-3 flex gap-3"
                        >
                          <div className="flex-1 flex flex-col gap-1">
                            <span className="px-3 py-2 text-[11px] font-medium text-[#888] uppercase tracking-widest">Platform Core</span>
                            <div className="grid grid-cols-2 gap-1">
                              {productFeatures.map((feat) => {
                                const Icon = feat.icon;
                                return (
                                  <Link key={feat.label} href={feat.href} onClick={() => setActiveDropdown(null)} className="group p-3 rounded-[12px] hover:bg-[#FAFAF8] transition-colors flex items-start gap-3">
                                    <div className={`h-8 w-8 rounded-[8px] flex items-center justify-center shrink-0 ${feat.bg} ${feat.color}`}>
                                      <Icon className="h-4 w-4" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-[13px] font-medium text-[var(--gs-bg-alt)]">{feat.label}</span>
                                      <span className="text-[12px] text-[#888] font-normal leading-snug">{feat.desc}</span>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                          <div className="w-[160px] bg-[#FAFAF8] rounded-[12px] p-4 flex flex-col justify-between shrink-0 border border-transparent hover:border-[rgba(0,0,0,0.05)] transition-colors">
                            <div className="flex flex-col gap-2">
                              <span className="text-[11px] font-medium text-[#888] uppercase tracking-widest">New Feature</span>
                              <p className="text-[13px] font-medium text-[var(--gs-bg-alt)] leading-tight">Client Portals are now live.</p>
                              <p className="text-[12px] text-[#888] leading-tight">Give your clients a branded dashboard.</p>
                            </div>
                            <Link href="#portals" onClick={() => setActiveDropdown(null)} className="flex items-center gap-1 text-[12px] font-medium text-[var(--gs-bg-alt)] hover:text-[#5A5A5A] group">
                              Explore Portals
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                        </motion.div>
                      )}

                      {/* Solutions Content */}
                      {activeDropdown === "Solutions" && (
                        <motion.div
                          key="solutions"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                          className="w-[280px] p-2 flex flex-col gap-1"
                        >
                          {solutionsLinks.map(link => (
                            <Link key={link.label} href={link.href} onClick={() => setActiveDropdown(null)} className="flex flex-col gap-0.5 p-3 rounded-[10px] hover:bg-[#FAFAF8] transition-colors">
                              <span className="text-[13px] font-medium text-[var(--gs-bg-alt)]">{link.label}</span>
                              <span className="text-[12px] text-[#888] font-normal leading-snug">{link.desc}</span>
                            </Link>
                          ))}
                        </motion.div>
                      )}

                      {/* Resources Content */}
                      {activeDropdown === "Resources" && (
                        <motion.div
                          key="resources"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                          className="w-[280px] p-2 flex flex-col gap-1"
                        >
                          {resourcesLinks.map(link => (
                            <Link key={link.label} href={link.href} onClick={() => setActiveDropdown(null)} className="flex flex-col gap-0.5 p-3 rounded-[10px] hover:bg-[#FAFAF8] transition-colors">
                              <span className="text-[13px] font-medium text-[var(--gs-bg-alt)]">{link.label}</span>
                              <span className="text-[12px] text-[#888] font-normal leading-snug">{link.desc}</span>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 z-10">
          <Link
            href="/auth/sign-in"
            className={`hidden sm:inline-flex text-[14px] font-medium transition-colors duration-200 ${
              isDarkSection ? "text-[#A3A3A3] hover:text-white" : "text-[#5A5A5A] hover:text-[var(--gs-bg-alt)]"
            }`}
          >
            Log in
          </Link>
          <Link
            href="/auth/sign-up"
            className={`hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-[13px] font-medium rounded-[8px] transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-px ${
              isDarkSection 
                ? "bg-white text-black hover:bg-gray-100"
                : "bg-[var(--gs-bg-alt)] hover:bg-[var(--gs-border)] text-white"
            }`}
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

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[65px] left-4 right-4 bg-white/95 backdrop-blur-3xl border border-[#EAEAEA] rounded-[20px] shadow-2xl overflow-hidden flex flex-col p-2 z-40 md:hidden"
          >
            <div className="flex flex-col p-2 gap-1 mb-2 border-b border-[rgba(0,0,0,0.05)] pb-4">
              <span className="px-3 py-2 text-[11px] font-medium text-[#888] uppercase tracking-widest">Product Features</span>
              {productFeatures.map((feat) => (
                <Link
                  key={feat.label}
                  href={feat.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 text-[14px] font-medium text-[var(--gs-bg-alt)] hover:bg-[#F5F5F0] rounded-[12px] transition-colors flex items-center gap-3"
                >
                  <div className={`h-6 w-6 rounded-[6px] flex items-center justify-center shrink-0 ${feat.bg} ${feat.color}`}>
                    <feat.icon className="h-3 w-3" strokeWidth={2.5} />
                  </div>
                  {feat.label}
                </Link>
              ))}
            </div>
            
            <div className="flex flex-col p-2 gap-1 mb-2 border-b border-[rgba(0,0,0,0.05)] pb-4">
               <span className="px-3 py-2 text-[11px] font-medium text-[#888] uppercase tracking-widest">More</span>
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 text-[14px] font-medium text-[#5A5A5A] hover:text-[var(--gs-bg-alt)] hover:bg-[#F5F5F0] rounded-[12px] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
            
            <div className="flex flex-col p-2 gap-2">
              <Link
                href="/auth/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-[14px] font-medium text-center text-[#5A5A5A] hover:text-[var(--gs-bg-alt)] bg-[#FAFAF8] rounded-[12px] transition-colors"
              >
                Log in to account
              </Link>
              <Link
                href="/auth/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-[14px] font-medium text-center text-white bg-[var(--gs-bg-alt)] rounded-[12px] transition-colors"
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
