"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, FileText, Search, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CreateInvoiceModal } from "./CreateInvoiceModal";
import { formatCurrency } from "@/lib/currency";
import { TableSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatEnum } from "@/lib/formatters";
import { useRouter, useSearchParams } from "next/navigation";
import { useSocket } from "@/components/providers/SocketProvider";

interface Invoice {
  id: number;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  amountPaid: string;
  balanceDue: string;
  currency: string;
  client: { id: number; name: string };
}

interface FinanceDashboardProps {
  token: string;
  workspaceId: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function FinanceDashboard({ token, workspaceId }: FinanceDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("create") === "true") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
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

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (err) {
      console.error("Failed to fetch invoices", err);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId]);

  const { socket } = useSocket();

  useEffect(() => {
    fetchInvoices();
    const handleRefresh = () => fetchInvoices();
    window.addEventListener("refreshData", handleRefresh);

    if (socket) {
      socket.on('invoice_created', handleRefresh);
      socket.on('invoice_updated', handleRefresh);
      socket.on('invoice_deleted', handleRefresh);
    }

    return () => {
      window.removeEventListener("refreshData", handleRefresh);
      if (socket) {
        socket.off('invoice_created', handleRefresh);
        socket.off('invoice_updated', handleRefresh);
        socket.off('invoice_deleted', handleRefresh);
      }
    };
  }, [fetchInvoices, socket]);
  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, inv) => sum + Number(inv.total), 0);
  const outstanding = invoices.filter(i => ['SENT', 'PARTIALLY_PAID'].includes(i.status)).reduce((sum, inv) => sum + Number(inv.balanceDue), 0);
  const overdue = invoices.filter(i => i.status === 'OVERDUE').reduce((sum, inv) => sum + Number(inv.balanceDue), 0);
  const draftsCount = invoices.filter(i => i.status === 'DRAFT').length;

  const getSemanticStatus = (status: string): "neutral" | "positive" | "pending" | "info" | "overdue" => {
    switch (status) {
      case "DRAFT": return "neutral";
      case "SENT": return "info";
      case "PARTIALLY_PAID": return "pending";
      case "PAID": return "positive";
      case "OVERDUE": return "overdue";
      default: return "neutral";
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
      inv.client.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-fade">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--gs-border)] pb-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-[var(--gs-fg)] tracking-tight">Finances & Billing</h2>
          <p className="text-sm text-[var(--gs-muted)]">Manage invoices, payments, and client billing.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[var(--gs-fg)] hover:bg-[var(--gs-fg)] text-[var(--gs-bg)] px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors outline-none"
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </button>
      </div>

      {/* Compact Metrics */}
      <div className="flex gap-6 border-b border-[var(--gs-border)] pb-6">
        <div className="flex flex-col gap-1 flex-1">
          <span className="text-[12px] font-medium text-[var(--gs-muted)]">Total Revenue</span>
          <span className="text-[16px] font-bold text-[var(--gs-fg)]">{formatCurrency(totalRevenue)}</span>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <span className="text-[12px] font-medium text-[var(--gs-muted)]">Outstanding</span>
          <span className="text-[16px] font-bold text-[#F5A623]">{formatCurrency(outstanding)}</span>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <span className="text-[12px] font-medium text-[var(--gs-muted)]">Overdue</span>
          <span className="text-[16px] font-bold text-[#EF4444]">{formatCurrency(overdue)}</span>
        </div>
        <div className="flex flex-col gap-1 flex-1 border-l border-[var(--gs-border)] pl-6">
          <span className="text-[12px] font-medium text-[var(--gs-muted)]">Draft Invoices</span>
          <span className="text-[16px] font-bold text-[var(--gs-fg)]">{draftsCount}</span>
        </div>
      </div>

      {/* Search & Filter Architecture */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gs-muted)]" />
          <input 
            type="text"
            placeholder="Search invoice number or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] pl-9 pr-4 py-2 text-[13px] text-[var(--gs-fg)] placeholder:text-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-border-strong)] transition-colors"
          />
        </div>
        <div className="relative filter-container" ref={filterRef}>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-[6px] text-[13px] font-medium transition-colors border outline-none ${
              isFilterOpen || statusFilter !== "ALL"
                ? "bg-[var(--gs-surface-raised)] text-[var(--gs-fg)] border-[var(--gs-border-strong)]"
                : "bg-[var(--gs-surface)] text-[var(--gs-fg)] border-[var(--gs-border)] hover:bg-[var(--gs-bg-alt)]"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters {statusFilter !== "ALL" && <span className="ml-1 bg-[var(--gs-fg)] text-[var(--gs-bg)] rounded-[4px] h-[18px] w-[18px] flex items-center justify-center text-[10px] font-bold">1</span>}
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--gs-surface-raised)] border border-[var(--gs-border-strong)] rounded-[8px] shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5">
              <div className="text-[10px] font-bold text-[var(--gs-muted)] uppercase tracking-wider mb-1 px-2 py-1">Status</div>
              {["ALL", "DRAFT", "SENT", "PARTIALLY_PAID", "PAID", "OVERDUE"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setIsFilterOpen(false);
                  }}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-[4px] text-[13px] font-medium outline-none transition-colors ${
                    statusFilter === status 
                      ? "bg-[var(--gs-fg)] text-[var(--gs-bg)]" 
                      : "text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)]"
                  }`}
                >
                  {status === "ALL" ? "All Statuses" : formatEnum(status)}
                  {statusFilter === status && (
                    <CheckCircle2 className={`w-3.5 h-3.5 ${statusFilter === status ? "text-[var(--gs-bg)]" : "text-[var(--gs-fg)]"}`} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <Card className="bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px] overflow-hidden flex flex-col">
        {loading ? (
          <TableSkeleton />
        ) : filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center">
            <div className="h-12 w-12 rounded-full bg-[var(--gs-bg-alt)] flex items-center justify-center mb-4 border border-[var(--gs-border)]">
              <FileText className="h-5 w-5 text-[var(--gs-muted-light)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--gs-fg)]">No invoices found</h3>
            <p className="text-xs text-[var(--gs-muted)] mt-1 max-w-xs">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-[13px] text-[var(--gs-fg)]">
              <thead>
                <tr className="border-b border-[var(--gs-border)] text-[var(--gs-muted-light)] uppercase tracking-wider text-[11px] font-semibold">
                  <th className="pb-3 pt-4 px-4 font-medium">Invoice Number</th>
                  <th className="pb-3 pt-4 px-4 font-medium">Client</th>
                  <th className="pb-3 pt-4 px-4 font-medium">Issue Date</th>
                  <th className="pb-3 pt-4 px-4 font-medium">Due Date</th>
                  <th className="pb-3 pt-4 px-4 font-medium">Status</th>
                  <th className="pb-3 pt-4 px-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gs-border)]">
                {filteredInvoices.map((inv) => (
                  <tr 
                    key={inv.id} 
                    className="hover:bg-[var(--gs-bg-alt)] transition-colors cursor-pointer group"
                    onClick={() => router.push(`/dashboard/invoices/${inv.id}`)}
                  >
                    <td className="py-3 px-5 text-[13px] font-medium text-[var(--gs-fg)] group-hover:underline">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-5 text-[13px] text-[var(--gs-muted)] truncate max-w-[200px]">
                      {inv.client.name}
                    </td>
                    <td className="py-3 px-5 text-[13px] text-[var(--gs-muted)] whitespace-nowrap">
                      {formatDate(inv.issueDate)}
                    </td>
                    <td className="py-3 px-5 text-[13px] text-[var(--gs-muted)] whitespace-nowrap">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      <StatusBadge label={formatEnum(inv.status)} status={getSemanticStatus(inv.status)} />
                    </td>
                    <td className="py-3 px-5 text-[13px] font-bold text-[var(--gs-fg)] text-right whitespace-nowrap">
                      {formatCurrency(Number(inv.total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CreateInvoiceModal
        token={token}
        workspaceId={workspaceId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchInvoices();
          window.dispatchEvent(new Event("refreshData"));
          window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Invoice generated successfully", type: "success" } }));
        }}
      />
    </div>
  );
}
