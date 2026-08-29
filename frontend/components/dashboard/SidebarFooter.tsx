import React, { useState } from 'react';
import { Settings, Headphones, X } from 'lucide-react';
import Link from 'next/link';

interface SidebarFooterProps {
  collapsed?: boolean;
}

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  const [showPromo, setShowPromo] = useState(true);

  if (collapsed) {
    return (
      <div className="flex flex-col gap-1 p-3 bg-[var(--gs-bg-alt)] border-t border-[var(--gs-border)]">
        <Link href="/dashboard/settings" className="flex items-center justify-center gap-2 px-2 py-2 rounded-md text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[#141414] transition-colors group" title="Settings">
          <Settings className="w-4 h-4 shrink-0 text-[var(--gs-muted)] group-hover:text-[var(--gs-fg)]" />
        </Link>
        <Link href="/dashboard/help" className="flex items-center justify-center gap-2 px-2 py-2 rounded-md text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[#141414] transition-colors group" title="Help Center">
          <Headphones className="w-4 h-4 shrink-0 text-[var(--gs-muted)] group-hover:text-[var(--gs-fg)]" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-[var(--gs-bg-alt)]">
      {showPromo && (
        <div className="relative bg-[#141414] border border-[#262626] rounded-xl px-4 py-3">
          <button 
            onClick={() => setShowPromo(false)}
            className="absolute top-2.5 right-2.5 text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          
          <div className="text-[#28CA41] text-[10px] font-bold uppercase tracking-wider mb-1.5 leading-none">
            New
          </div>
          <h4 className="text-[var(--gs-fg)] text-[14px] font-medium leading-tight mb-1">
            AI Follow-ups
          </h4>
          <p className="text-[var(--gs-muted)] text-[12px] leading-snug line-clamp-2 mb-2">
            Let GrowSuite automatically prepare and manage customer follow-ups.
          </p>
          <button className="text-[#28CA41] text-[12px] font-medium hover:underline flex items-center transition-all outline-none">
            Try it &rarr;
          </button>
        </div>
      )}

      <div className="border-t border-[#1F1F1F] mt-1 mb-1"></div>

      <div className="flex flex-col gap-1">
        <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-md text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[#141414] transition-colors group outline-none">
          <Settings className="w-4 h-4 shrink-0 text-[var(--gs-muted)] group-hover:text-[var(--gs-fg)]" />
          <span className="text-[13px] font-medium">Settings</span>
        </Link>
        <Link href="/dashboard/help" className="flex items-center gap-3 px-3 py-2 rounded-md text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[#141414] transition-colors group outline-none">
          <Headphones className="w-4 h-4 shrink-0 text-[var(--gs-muted)] group-hover:text-[var(--gs-fg)]" />
          <span className="text-[13px] font-medium">Help Center</span>
        </Link>
      </div>
    </div>
  );
}
