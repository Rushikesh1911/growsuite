import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: "success" | "error" | "info";
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Toast({ isOpen, onClose, message, type = "success", action }: ToastProps) {
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-[10px] border shadow-sm bg-white text-[#111111] max-w-sm",
            {
              "border-[#C8E6C9]": type === "success",
              "border-[#FFCDD2]": type === "error",
              "border-[#E5E7EB]": type === "info",
            }
          )}
        >
          {type === "success" && <CheckCircle2 className="h-4.5 w-4.5 text-[#2E7D32] shrink-0" />}
          {type === "error" && <AlertTriangle className="h-4.5 w-4.5 text-[#C62828] shrink-0" />}
          <span className="text-xs font-medium tracking-tight leading-relaxed flex-1">{message}</span>
          
          {action && (
            <button
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className="text-xs font-bold text-[#111111] hover:underline px-2 py-1 bg-black/5 hover:bg-black/10 rounded-[4px] transition-colors ml-2"
            >
              {action.label}
            </button>
          )}

          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#111111] shrink-0 active:scale-95 transition-transform"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
