import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

export function Button({
  className,
  variant = "default",
  size = "md",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium tracking-tight rounded-[6px] transition-colors duration-150 ease-out select-none disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-1 focus:ring-[var(--gs-surface)] focus:ring-offset-0 cursor-pointer border border-transparent text-xs",
        {
          "bg-[var(--gs-surface)] text-white hover:bg-black/90 active:bg-black": variant === "default",
          "bg-white border-[#E5E7EB] text-[var(--gs-surface)] hover:bg-[#F5F5F5] active:bg-[#EFEFEF]": variant === "secondary",
          "bg-transparent text-[#6B7280] hover:bg-[#F5F5F5] hover:text-[var(--gs-surface)] active:bg-[#EFEFEF]": variant === "ghost",
          "bg-transparent border-[#FFCDD2] text-[#C62828] hover:bg-[#FFEBEE] hover:text-[#C62828] active:bg-[#FFCDD2]": variant === "danger",
        },
        {
          "h-[32px] px-3": size === "sm",
          "h-[40px] px-4": size === "md",
          "h-[48px] px-6": size === "lg",
          "h-[40px] w-[40px] p-0 text-zinc-500 hover:text-zinc-800": size === "icon",
        },
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
