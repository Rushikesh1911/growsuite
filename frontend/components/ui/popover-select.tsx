import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export interface PopoverSelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  triggerPrefixIcon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  align?: "left" | "right";
}

export function PopoverSelect({
  value,
  options,
  onChange,
  triggerPrefixIcon,
  placeholder,
  className = "",
  align = "left",
}: PopoverSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 text-[13px] text-[var(--gs-fg)] font-medium hover:bg-[var(--gs-bg-alt)] px-2 py-1 -ml-2 rounded transition-colors cursor-pointer outline-none ${className}`}
      >
        {triggerPrefixIcon}
        <span className="flex-1 text-left truncate">{selectedOption ? selectedOption.label : placeholder || "Select..."}</span>
        <ChevronDown className="h-3.5 w-3.5 text-[var(--gs-muted)] flex-shrink-0" />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-1 w-48 bg-[var(--gs-surface)] border border-[var(--gs-border)] shadow-xl rounded-[8px] z-50 py-1 animate-in fade-in zoom-in-95 duration-100`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-[var(--gs-bg-alt)] outline-none group"
            >
              <div className="flex items-center gap-2">
                {option.icon && (
                  <span className="text-[var(--gs-muted)] group-hover:text-[var(--gs-fg)] transition-colors">
                    {option.icon}
                  </span>
                )}
                <span
                  className={`text-[13px] transition-colors ${
                    value === option.value ? "text-[var(--gs-fg)] font-medium" : "text-[var(--gs-muted)] group-hover:text-[var(--gs-fg)]"
                  }`}
                >
                  {option.label}
                </span>
              </div>
              {value === option.value && <Check className="h-3 w-3 text-[var(--gs-fg)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
