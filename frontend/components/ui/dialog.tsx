import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, description, children }: DialogProps) {
  // Close modal on escape press
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-[var(--gs-surface)]/40"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full max-w-[560px] bg-white border border-[#E5E7EB] rounded-[8px] shadow-sm relative z-10 overflow-hidden flex flex-col p-8 text-[var(--gs-surface)]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 h-8 w-8 rounded-[6px] hover:bg-[#F5F5F5] flex items-center justify-center text-[#6B7280] hover:text-[var(--gs-surface)] transition-colors active:bg-[#EFEFEF] cursor-pointer"
            >
              <X className="h-[18px] w-[18px] stroke-[1.75]" />
            </button>

            {/* Header */}
            <div className="flex flex-col gap-1 mb-6 pr-8">
              <h2 className="text-lg font-bold tracking-tight text-[var(--gs-surface)]">{title}</h2>
              {description && <p className="text-sm text-[#6B7280]">{description}</p>}
            </div>

            {/* Content */}
            <div className="flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
