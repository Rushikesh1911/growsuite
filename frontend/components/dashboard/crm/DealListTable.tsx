import { Deal } from "./types";
import { ArrowUpDown, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface DealListTableProps {
  deals: Deal[];
  selectedDealId: number | null;
  onSelectDeal: (id: number) => void;
}

export function DealListTable({ deals, selectedDealId, onSelectDeal }: DealListTableProps) {
  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="h-10 w-10 text-[var(--gs-muted-light)] mb-4" />
        <h3 className="text-sm font-semibold text-[var(--gs-fg)] mb-1">No deals found</h3>
        <p className="text-xs text-[var(--gs-muted)]">Adjust your search or filters to find what you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[8px] border border-[var(--gs-border)] bg-[var(--gs-surface)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--gs-border)] bg-[var(--gs-bg-alt)]">
              <th className="font-semibold text-[var(--gs-muted)] px-4 py-3 whitespace-nowrap">
                Deal Name
              </th>
              <th className="font-semibold text-[var(--gs-muted)] px-4 py-3 whitespace-nowrap">
                Company
              </th>
              <th className="font-semibold text-[var(--gs-muted)] px-4 py-3 whitespace-nowrap">
                Stage
              </th>
              <th className="font-semibold text-[var(--gs-muted)] px-4 py-3 whitespace-nowrap text-right">
                Value
              </th>
              <th className="font-semibold text-[var(--gs-muted)] px-4 py-3 whitespace-nowrap text-right">
                Prob.
              </th>
              <th className="font-semibold text-[var(--gs-muted)] px-4 py-3 whitespace-nowrap text-right">
                Close Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--gs-border)]">
            {deals.map((deal) => {
              const formattedValue = formatCurrency(Number(deal.estimatedValue));

              const closeDateStr = deal.expectedClose 
                ? new Date(deal.expectedClose).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : "—";

              return (
                <tr 
                  key={deal.id} 
                  onClick={() => onSelectDeal(deal.id)}
                  className={`group cursor-pointer transition-colors ${
                    selectedDealId === deal.id 
                      ? "bg-[var(--gs-surface-raised)]" 
                      : "hover:bg-[var(--gs-surface-raised)]/50"
                  }`}
                >
                  <td className="px-4 py-3 font-semibold text-[var(--gs-fg)]">
                    {deal.title}
                  </td>
                  <td className="px-4 py-3 text-[var(--gs-muted)]">
                    {deal.company}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider bg-[var(--gs-bg-alt)] text-[var(--gs-muted)] border border-[var(--gs-border)]">
                      {deal.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[var(--gs-fg)] text-right">
                    {formattedValue}
                  </td>
                  <td className="px-4 py-3 text-[var(--gs-muted)] text-right">
                    {deal.probability ? `${deal.probability}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--gs-muted)] text-right whitespace-nowrap">
                    {closeDateStr}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
