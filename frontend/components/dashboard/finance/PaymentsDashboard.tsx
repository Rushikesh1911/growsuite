"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/currency";
import { ArrowUpRight, Search, SlidersHorizontal, DollarSign, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { TableSkeleton } from "@/components/ui/skeleton";
import { formatDate, formatEnum } from "@/lib/formatters";
import { useRef } from "react";
import { useSocket } from "@/components/providers/SocketProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface PaymentsDashboardProps {
  token: string;
  workspaceId: number;
}

export function PaymentsDashboard({ token, workspaceId }: PaymentsDashboardProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId]);

  const { socket } = useSocket();

  useEffect(() => {
    fetchPayments();

    if (socket) {
      socket.on('payment_created', fetchPayments);
    }

    return () => {
      if (socket) {
        socket.off('payment_created', fetchPayments);
      }
    };
  }, [fetchPayments, socket]);

  if (loading) {
    return <TableSkeleton />;
  }

  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthPayments = payments.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  
  const thisMonthCollected = thisMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = 
      (p.reference && p.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.invoice && p.invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.invoice && p.invoice.client && p.invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesMethod = methodFilter === "ALL" || p.method === methodFilter;
    
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--gs-border)] pb-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-[var(--gs-fg)] tracking-tight">Payments</h1>
          <p className="text-sm text-[var(--gs-muted)]">A chronological ledger of all received payments.</p>
        </div>
      </div>

      {/* Compact Metrics */}
      <div className="flex gap-6 border-b border-[var(--gs-border)] pb-6">
        <div className="flex flex-col gap-1 flex-1">
          <span className="text-[12px] font-medium text-[var(--gs-muted)]">Total Collected</span>
          <span className="text-[16px] font-bold text-[var(--gs-fg)]">{formatCurrency(totalCollected)}</span>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <span className="text-[12px] font-medium text-[var(--gs-muted)]">This Month</span>
          <span className="text-[16px] font-bold text-[var(--gs-fg)]">{formatCurrency(thisMonthCollected)}</span>
        </div>
        <div className="flex flex-col gap-1 flex-1 border-l border-[var(--gs-border)] pl-6">
          <span className="text-[12px] font-medium text-[var(--gs-muted)]">Total Transactions</span>
          <span className="text-[16px] font-bold text-[var(--gs-fg)]">{payments.length}</span>
        </div>
      </div>

      {/* Search & Filter Architecture */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gs-muted)]" />
          <input 
            type="text"
            placeholder="Search reference, client, or invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] pl-9 pr-4 py-2 text-[13px] text-[var(--gs-fg)] placeholder:text-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-border-strong)] transition-colors"
          />
        </div>
        <div className="relative filter-container" ref={filterRef}>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-[6px] text-[13px] font-medium transition-colors border outline-none ${
              isFilterOpen || methodFilter !== "ALL"
                ? "bg-[var(--gs-surface-raised)] text-[var(--gs-fg)] border-[var(--gs-border-strong)]"
                : "bg-[var(--gs-surface)] text-[var(--gs-fg)] border-[var(--gs-border)] hover:bg-[var(--gs-bg-alt)]"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters {methodFilter !== "ALL" && <span className="ml-1 bg-[var(--gs-fg)] text-[var(--gs-bg)] rounded-[4px] h-[18px] w-[18px] flex items-center justify-center text-[10px] font-bold">1</span>}
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--gs-surface-raised)] border border-[var(--gs-border-strong)] rounded-[8px] shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5">
              <div className="text-[10px] font-bold text-[var(--gs-muted)] uppercase tracking-wider mb-1 px-2 py-1">Method</div>
              {["ALL", "CREDIT_CARD", "BANK_TRANSFER", "PAYPAL", "CASH", "OTHER"].map((method) => (
                <button
                  key={method}
                  onClick={() => {
                    setMethodFilter(method);
                    setIsFilterOpen(false);
                  }}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-[4px] text-[13px] font-medium outline-none transition-colors ${
                    methodFilter === method 
                      ? "bg-[var(--gs-fg)] text-[var(--gs-bg)]" 
                      : "text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)]"
                  }`}
                >
                  {method === "ALL" ? "All Methods" : formatEnum(method)}
                  {methodFilter === method && (
                    <CheckCircle2 className={`w-3.5 h-3.5 ${methodFilter === method ? "text-[var(--gs-bg)]" : "text-[var(--gs-fg)]"}`} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px] overflow-hidden flex flex-col">
        {filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-12 w-12 rounded-full bg-[var(--gs-bg-alt)] flex items-center justify-center mb-4 border border-[var(--gs-border)]">
              <DollarSign className="w-5 h-5 text-[var(--gs-muted)]" />
            </div>
            <h3 className="text-[14px] font-bold text-[var(--gs-fg)]">No payments found</h3>
            <p className="text-[13px] text-[var(--gs-muted)] mt-1 max-w-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px] text-[var(--gs-fg)]">
              <thead>
                <tr className="border-b border-[var(--gs-border)] bg-[var(--gs-bg-alt)] text-[var(--gs-muted-light)] uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Invoice</th>
                  <th className="py-3 px-5">Client</th>
                  <th className="py-3 px-5">Method</th>
                  <th className="py-3 px-5">Reference</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gs-border)]">
                {filteredPayments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-[var(--gs-bg-alt)] transition-colors group">
                    <td className="py-3 px-5 text-[13px] text-[var(--gs-muted)] whitespace-nowrap">
                      {formatDate(payment.date)}
                    </td>
                    <td className="py-3 px-5">
                      <Link 
                        href={`/dashboard/invoices/${payment.invoiceId}`}
                        className="text-[13px] font-medium text-[var(--gs-fg)] hover:underline inline-flex items-center gap-1"
                      >
                        {payment.invoice.invoiceNumber}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </td>
                    <td className="py-3 px-5 text-[13px] text-[var(--gs-muted)] truncate max-w-[200px]">
                      {payment.invoice.client.name}
                    </td>
                    <td className="py-3 px-5 text-[13px] text-[var(--gs-fg)]">
                      {formatEnum(payment.method)}
                    </td>
                    <td className="py-3 px-5 text-[13px] text-[var(--gs-muted)] font-mono">
                      {payment.reference || '-'}
                    </td>
                    <td className="py-3 px-5 text-[13px] font-bold text-[var(--gs-fg)] text-right whitespace-nowrap">
                      {formatCurrency(Number(payment.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
