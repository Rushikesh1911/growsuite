import React, { useState } from "react";
import { X, DollarSign, Calendar, CreditCard, AlignLeft } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface RecordPaymentModalProps {
  token: string;
  workspaceId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (payment: any) => void;
  invoice: any;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function RecordPaymentModal({
  token,
  workspaceId,
  isOpen,
  onClose,
  onSuccess,
  invoice,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState<string>(invoice ? invoice.balanceDue.toString() : "");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !invoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        invoiceId: invoice.id,
        amount: parseFloat(amount),
        date: new Date(date).toISOString(),
        method,
        reference: reference || undefined,
        notes: notes || undefined
      };

      const res = await fetch(`${API_URL}/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        onSuccess(data);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to record payment");
      }
    } catch (err) {
      setErrorMsg("Connection error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--gs-surface)] rounded-[12px] border border-[var(--gs-border)] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-5 py-4 border-b border-[var(--gs-border)] flex items-center justify-between bg-[var(--gs-surface)]">
          <h2 className="text-[15px] font-bold text-[var(--gs-fg)] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[var(--gs-muted)]" />
            Record Payment
          </h2>
          <button onClick={onClose} className="text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {errorMsg && (
            <div className="p-3 rounded-[6px] bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 text-[13px] font-medium">
              {errorMsg}
            </div>
          )}

          <div className="bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[8px] p-3 flex justify-between items-center">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-[var(--gs-muted-light)] uppercase tracking-wider">Invoice</span>
              <span className="text-[13px] font-medium text-[var(--gs-fg)]">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex flex-col gap-0.5 text-right">
              <span className="text-[11px] font-bold text-[var(--gs-muted-light)] uppercase tracking-wider">Balance Due</span>
              <span className="text-[14px] font-bold text-[#F5A623]">{formatCurrency(Number(invoice.balanceDue))}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[var(--gs-fg)]">Amount Received *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gs-muted)] font-medium">₹</span>
              <input 
                type="number" 
                step="0.01"
                min="0.01"
                max={invoice.balanceDue}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] pl-7 pr-3 py-2 text-[13px] text-[var(--gs-fg)] focus:border-[var(--gs-fg)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[var(--gs-fg)]">Payment Date *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--gs-muted)]" />
                <input 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] pl-9 pr-3 py-2 text-[13px] text-[var(--gs-fg)] focus:border-[var(--gs-fg)] focus:outline-none transition-colors [&::-webkit-calendar-picker-indicator]:opacity-50"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[var(--gs-fg)]">Payment Method *</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--gs-muted)]" />
                <select 
                  value={method}
                  onChange={e => setMethod(e.target.value)}
                  className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] pl-9 pr-3 py-2 text-[13px] text-[var(--gs-fg)] focus:border-[var(--gs-fg)] focus:outline-none transition-colors appearance-none"
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="CASH">Cash</option>
                  <option value="CHECK">Check</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[var(--gs-fg)]">Reference (Optional)</label>
            <input 
              type="text" 
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="e.g. Transaction ID, Check #"
              className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:border-[var(--gs-fg)] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[var(--gs-fg)]">Notes (Optional)</label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--gs-muted)]" />
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add internal notes..."
                rows={2}
                className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] pl-9 pr-3 py-2 text-[13px] text-[var(--gs-fg)] focus:border-[var(--gs-fg)] focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--gs-border)]">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting || !amount}
              className="px-4 py-2 bg-[var(--gs-fg)] text-[var(--gs-bg)] rounded-[6px] text-[13px] font-bold hover:bg-[var(--gs-fg)] transition-colors disabled:opacity-50 outline-none flex items-center gap-1.5"
            >
              {submitting ? "Processing..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
