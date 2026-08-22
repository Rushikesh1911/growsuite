import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ className, name, size = "md", ...props }: AvatarProps) {
  // Get initials
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "rounded-full bg-[#EFEFEF] border border-[#E5E7EB] text-[#111111] font-semibold flex items-center justify-center select-none uppercase tracking-wider shrink-0",
        {
          "h-7 w-7 text-[10px]": size === "sm",
          "h-10 w-10 text-xs": size === "md",
          "h-14 w-14 text-sm": size === "lg",
        },
        className
      )}
      {...props}
    >
      {initials || "U"}
    </div>
  );
}
