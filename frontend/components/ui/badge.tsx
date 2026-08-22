import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] border px-2 py-0.5 text-xs font-medium tracking-tight select-none",
        {
          "bg-[#FAFAFA] border-[#E5E7EB] text-[#111111]": variant === "default",
          "bg-[#FAFAFA] border-[#E5E7EB] text-[#6B7280]": variant === "secondary",
          "bg-[#E8F5E9]/60 border-[#C8E6C9] text-[#2E7D32]": variant === "success",
          "bg-[#FFF8E1]/60 border-[#FFE082] text-[#F57F17]": variant === "warning",
          "bg-[#FFEBEE]/60 border-[#FFCDD2] text-[#C62828]": variant === "destructive",
        },
        className
      )}
      {...props}
    />
  );
}
