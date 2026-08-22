import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Deal } from "./types";

interface DealFormProps {
  newTitle: string;
  setNewTitle: (v: string) => void;
  newCompany: string;
  setNewCompany: (v: string) => void;
  newValue: string;
  setNewValue: (v: string) => void;
  handleCreateDeal: (e: React.FormEvent) => void;
}

export function DealForm({
  newTitle, setNewTitle,
  newCompany, setNewCompany,
  newValue, setNewValue,
  handleCreateDeal
}: DealFormProps) {
  return (
    <Card className="p-5 bg-[var(--gs-surface-raised)] border border-[var(--gs-border)] rounded-[12px] flex flex-col gap-4">
      <span className="text-[10px] text-[var(--gs-muted)] font-bold uppercase tracking-wider">Fast Deal Outliner</span>
      <form onSubmit={handleCreateDeal} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="deal-title" className="text-[10px] text-[var(--gs-muted)] font-semibold">Deal Title / Company</label>
          <div className="flex gap-2">
            <Input
              id="deal-title"
              placeholder="Title (e.g. Server Suite)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-[32px] text-xs bg-[var(--gs-bg)] text-[var(--gs-fg)] placeholder-[var(--gs-muted-light)] border-[var(--gs-border)] focus:border-[var(--gs-fg)] rounded-[6px]"
            />
            <Input
              aria-label="Company name"
              placeholder="Company"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              className="h-[32px] text-xs bg-[var(--gs-bg)] text-[var(--gs-fg)] placeholder-[var(--gs-muted-light)] border-[var(--gs-border)] focus:border-[var(--gs-fg)] rounded-[6px]"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <label htmlFor="deal-value" className="text-[10px] text-[var(--gs-muted)] font-semibold">Value ($)</label>
          <Input
            id="deal-value"
            placeholder="25000"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            type="number"
            className="h-[32px] text-xs bg-[var(--gs-bg)] text-[var(--gs-fg)] placeholder-[var(--gs-muted-light)] border-[var(--gs-border)] focus:border-[var(--gs-fg)] rounded-[6px]"
          />
        </div>

        <Button
          type="submit"
          variant="default"
          size="sm"
          className="h-[32px] rounded-[6px] text-xs font-semibold bg-[var(--gs-fg)] text-[var(--gs-bg)] hover:bg-[var(--gs-fg-secondary)]"
        >
          Create Deal
        </Button>
      </form>
    </Card>
  );
}
