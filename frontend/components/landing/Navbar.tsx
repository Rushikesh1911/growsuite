"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "Pricing",  href: "#pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 px-4">
      <nav
        className={`
          w-full max-w-[1000px] flex items-center justify-between
          px-4 h-[50px] rounded-full mx-auto
          transition-[box-shadow,background,border-color] duration-300 ease-out
          ${scrolled
            ? "bg-white/80 backdrop-blur-xl border border-[#EAEAEA] shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
            : "bg-transparent border border-transparent"
          }
        `}
      >
        {/* Logo — typographic Gs mark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="GrowSuite home"
        >
          <div className="h-[28px] w-[28px] rounded-[6px] bg-[#000000] flex items-center justify-center">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
              <path
                d="M7.2 1C4.1 1 1.6 3.5 1.6 6.9C1.6 10.3 4.1 12.8 7.2 12.8C9.5 12.8 11.3 11.6 12 9.8H7.8V7.8H14.2V9C14.2 11.8 11.1 14 7.2 14C3.2 14 0 10.8 0 6.9C0 3 3.2 0 7.2 0C9.5 0 11.5 1 12.7 2.6L11.3 3.9C10.4 2.7 8.9 2 7.2 2"
                fill="white"
                transform="scale(0.72) translate(0.5, 0)"
              />
              <text
                x="12.5"
                y="8.5"
                fontSize="6"
                fontWeight="700"
                fill="white"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >s</text>
            </svg>
          </div>
          <span className="text-[15px] font-[700] tracking-[-0.03em] text-[#000000]">
            GrowSuite
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-3 py-1.5 text-[13px] font-[500] text-[#606060] hover:text-[#0F0F0F] rounded-[7px]
                transition-colors duration-150 ease-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F0F0F] focus-visible:ring-offset-1"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth/sign-in"
            className="hidden sm:inline-flex text-[14px] font-[500] text-[#666666] hover:text-[#000000] transition-colors duration-200"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center px-4 py-2 bg-[#000000] hover:bg-[#333333] text-white text-[14px] font-[500] rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Start for free
          </Link>
          <button 
            className="md:hidden p-1 text-[#666] hover:text-[#000]"
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[65px] left-4 right-4 bg-white border border-[#EAEAEA] rounded-[16px] shadow-lg overflow-hidden flex flex-col p-4 z-40 md:hidden"
          >
            <div className="flex flex-col gap-2 mb-4 border-b border-[#EAEAEA] pb-4">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-[14px] font-[500] text-[#606060] hover:text-[#000000] hover:bg-[#F5F5F0] rounded-[8px] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <Link
              href="/auth/sign-in"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 text-[14px] font-[500] text-center text-[#606060] hover:text-[#000000] transition-colors"
            >
              Sign in to your account
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
