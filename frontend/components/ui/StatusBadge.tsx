import { statusColors, StatusKey } from '@/lib/statusColors';

interface StatusBadgeProps {
  label: string;
  status: StatusKey;
  showDot?: boolean;
}

export function StatusBadge({ label, status, showDot = true }: StatusBadgeProps) {
  const c = statusColors[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border bg-[#141414]"
      style={{ color: c.text, borderColor: c.border }}
    >
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.dot }} />
      )}
      {label}
    </span>
  );
}
