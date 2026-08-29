export const statusColors = {
  neutral: { text: '#8A8A8A', border: '#262626', dot: '#8A8A8A' },
  positive: { text: '#28CA41', border: '#28CA41', dot: '#28CA41' }, // Active, Paid, Done, Won
  overdue:  { text: '#EF4444', border: '#EF4444', dot: '#EF4444' }, // Overdue, Cancelled, Lost, destructive
  pending:  { text: '#F5A623', border: '#F5A623', dot: '#F5A623' }, // In Progress, Partially Paid, On Hold, Qualified, Due Today
  info:     { text: '#007CF0', border: '#007CF0', dot: '#007CF0' }, // Sent, Review, Contacted, informational callouts
} as const;

export type StatusKey = keyof typeof statusColors;
