import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function ConvertDealModal({ lead, isOpen, onClose, onConvert }: any) {
  const [title, setTitle] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lead) {
      setTitle(`${lead.company || lead.contactName} - Deal`);
      setEstimatedValue("");
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onConvert(lead.id, title, parseFloat(estimatedValue) || 0);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[12px] w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--gs-border)] flex items-center justify-between bg-[var(--gs-surface)]">
          <h2 className="text-[15px] font-semibold text-[var(--gs-fg)]">Create Deal</h2>
          <button onClick={onClose} className="text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--gs-muted)]">Contact</label>
            <input
              type="text"
              disabled
              value={lead.contactName}
              className="w-full bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-muted)] opacity-50 cursor-not-allowed"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--gs-muted)]">Company</label>
            <input
              type="text"
              disabled
              value={lead.company || "—"}
              className="w-full bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-muted)] opacity-50 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--gs-muted)]">Opportunity Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. Website Redesign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)]"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--gs-muted)]">Estimated Value <span className="text-red-500">*</span></label>
            <input
              type="number"
              required
              min="0"
              placeholder="0.00"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)]"
            />
          </div>

          <div className="pt-4 mt-2 border-t border-[var(--gs-border)] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[var(--gs-fg)] hover:bg-[#FFFFFF] text-[#000000] px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
