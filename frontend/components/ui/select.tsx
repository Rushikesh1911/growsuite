import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-[40px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[var(--gs-surface)] appearance-none focus:outline-none focus:border-[var(--gs-surface)] focus:ring-0 disabled:opacity-50 disabled:bg-[var(--gs-fg)] cursor-pointer",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#6B7280]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";
