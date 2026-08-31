"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

const NODES = [
  { 
    id: "slack", label: "Slack", 
    x: "15%", y: "25%", 
    img: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" 
  },
  { 
    id: "stripe", label: "Stripe", 
    x: "82%", y: "20%", 
    img: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
  },
  { 
    id: "gmail", label: "Gmail", 
    x: "10%", y: "65%", 
    img: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" 
  },
  { 
    id: "razorpay", label: "Razorpay", 
    x: "88%", y: "60%", 
    img: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" 
  },
  { 
    id: "calendar", label: "Google Calendar", 
    x: "50%", y: "85%", 
    img: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" 
  },
];

export function IntegrationsMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create a slight parallax effect for the whole graph
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={containerRef} className="bg-[#FAFAF8] py-32 overflow-hidden relative">
      
      <div className="max-w-[1000px] mx-auto px-6 flex flex-col items-center relative z-10">
        
        {/* Text Header */}
        <div className="text-center flex flex-col items-center gap-4 mb-24">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.06)] text-[11px] font-bold text-[var(--gs-bg-alt)] uppercase tracking-widest">
            Integrations
          </span>
          <h2 className="text-[36px] md:text-[48px] font-medium tracking-tight text-[var(--gs-bg-alt)] leading-[1.05]">
            Your entire stack, <br className="hidden sm:block" />deeply connected.
          </h2>
          <p className="text-[16px] text-[var(--gs-muted-light)] max-w-[480px] leading-[1.6]">
            GrowSuite syncs natively with the tools you already rely on. No messy Zaps required.
          </p>
        </div>

        {/* Node Graph Container */}
        <motion.div style={{ y }} className="relative w-full aspect-[4/3] md:aspect-[2/1] max-w-[900px] flex items-center justify-center">
          
          {/* Animated SVG Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
            {NODES.map((node, i) => (
              <g key={node.id}>
                {/* Static Background Dashed Line */}
                <line 
                  x1="50%" y1="50%" 
                  x2={node.x} y2={node.y} 
                  stroke="rgba(0,0,0,0.08)" strokeWidth="2" strokeDasharray="6 6"
                  strokeLinecap="round"
                />
                {/* Animated Moving Dashes */}
                <motion.line 
                  x1="50%" y1="50%" 
                  x2={node.x} y2={node.y} 
                  stroke="rgba(0,0,0,0.25)" strokeWidth="2" strokeDasharray="6 12"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ 
                    duration: 2 + (i % 3), // Vary speeds slightly
                    repeat: Infinity, 
                    ease: "linear",
                    // Reverse direction for some nodes to look like data is flowing in both ways
                    repeatType: i % 2 === 0 ? "loop" : "reverse" 
                  }}
                />
              </g>
            ))}
          </svg>

          {/* Central GrowSuite Orb */}
          <div className="relative z-20">
            {/* Outer pulsating rings */}
            <motion.div 
              className="absolute inset-0 rounded-full bg-[var(--gs-bg-alt)]/5"
              animate={{ transform: ["scale(1)", "scale(1.8)", "scale(1)"], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute inset-0 rounded-full bg-[var(--gs-bg-alt)]/10"
              animate={{ transform: ["scale(1)", "scale(1.4)", "scale(1)"], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 3, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Central GrowSuite Hub */}
            <div className="relative z-10 flex items-center justify-center bg-white h-20 w-20 md:h-24 md:w-24 rounded-[24px] border border-[rgba(0,0,0,0.06)] shadow-xl">
              <div className="scale-[1.5]">
                <Logo theme="light" showWordmark={false} />
              </div>
            </div>
          </div>

          {/* Satellite Tool Nodes */}
          {NODES.map((node, i) => (
            <div 
              key={node.id} 
              className="absolute z-10 pointer-events-auto"
              style={{ top: node.y, left: node.x, transform: "translate(-50%, -50%)" }}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.2 + (i * 0.1), 
                  type: "spring", stiffness: 200, damping: 20 
                }}
                whileHover={{ scale: 1.15, rotate: i % 2 === 0 ? 5 : -5 }}
                className="h-14 w-14 md:h-16 md:w-16 rounded-[16px] bg-white border border-[rgba(0,0,0,0.06)] shadow-[0_8px_24px_rgba(0,0,0,0.06)] flex items-center justify-center relative group cursor-pointer transition-transform"
              >
                <img src={node.img} alt={node.label} className="h-6 object-contain" />
                
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-[var(--gs-bg-alt)] text-white text-[11px] font-semibold px-3 py-1.5 rounded-[6px] whitespace-nowrap shadow-xl relative">
                    {node.label}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--gs-bg-alt)] rotate-45" />
                  </div>
                </div>
              </motion.div>
            </div>
          ))}

        </motion.div>
      </div>

    </section>
  );
}
