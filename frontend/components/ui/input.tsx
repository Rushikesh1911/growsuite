import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-[40px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111111] placeholder-[#9CA3AF] transition-colors focus:outline-none focus:border-[#111111] focus:ring-0 disabled:opacity-50 disabled:bg-[#FAFAFA]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[80px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111111] placeholder-[#9CA3AF] transition-colors focus:outline-none focus:border-[#111111] focus:ring-0 disabled:opacity-50 disabled:bg-[#FAFAFA] resize-none",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
