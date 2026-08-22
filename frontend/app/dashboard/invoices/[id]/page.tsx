"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/dashboard/Topbar";
import { EventToast } from "@/components/ui/event-toast";
import { useDashboard } from "../../DashboardContext";
import { formatCurrency } from "@/lib/currency";
import { formatDate, formatEnum } from "@/lib/formatters";
import { ArrowLeft, CheckCircle2, Copy, FileText, Send, DollarSign, Download, Edit2, Trash2, Files } from "lucide-react";
import { RecordPaymentModal } from "@/components/dashboard/finance/RecordPaymentModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function InvoiceProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { token, workspaceId } = useDashboard();
  
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const invoiceId = params?.id as string;

  const fetchInvoice = async () => {
    if (!invoiceId || !token || !workspaceId) return;
    try {
      const res = await fetch(`${API_URL}/api/invoices/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setInvoice(data);
      } else {
        router.push("/dashboard/invoices");
      }
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
      router.push("/dashboard/invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId, token, workspaceId, router]);

  const updateStatus = async (newStatus: string) => {
    if (!token || !workspaceId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setInvoice({ ...invoice, status: newStatus });
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: `Invoice marked as ${newStatus}`, type: "success" } }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!token || !workspaceId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/invoices/${invoiceId}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setInvoice(data.invoice);
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: `Invoice sent to client!`, type: "success" } }));
      } else {
        const data = await res.json();
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: data.error || "Failed to send invoice", type: "error" } }));
      }
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Network error", type: "error" } }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!token || !workspaceId) return;
    try {
      const res = await fetch(`${API_URL}/api/invoices/${invoiceId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice_${invoice.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Failed to download PDF", type: "error" } }));
      }
    } catch (err) {
      console.error("PDF download error:", err);
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Network error", type: "error" } }));
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Topbar />
        <main className="flex-1 flex items-center justify-center relative z-0">
          <div className="animate-spin h-6 w-6 border-2 border-[var(--gs-fg)] border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  if (!invoice) return null;

  const getStatusBadge = () => {
    const statusColors: Record<string, string> = {
      DRAFT: "bg-[var(--gs-surface)] text-[var(--gs-muted)] border-[var(--gs-border)]",
      SENT: "bg-[#007CF0]/10 text-[#007CF0] border-[#007CF0]/20",
      PARTIALLY_PAID: "bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20",
      PAID: "bg-[var(--gs-fg)]/10 text-[var(--gs-fg)] border-[var(--gs-fg)]/20",
      OVERDUE: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
    };
    const c = statusColors[invoice.status] || "bg-[var(--gs-surface)] text-[var(--gs-fg)] border-[var(--gs-border)]";
    return (
      <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-wide uppercase border ${c}`}>
        {formatEnum(invoice.status)}
      </span>
    );
  };

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Topbar 
          breadcrumbs={
            <>
              <span className="text-[13px] font-medium text-[var(--gs-muted)] cursor-pointer hover:text-[var(--gs-fg)] transition-colors" onClick={() => router.push("/dashboard/invoices")}>Invoices</span>
              <span className="text-[13px] text-[var(--gs-muted-light)]">/</span>
              <span className="text-[13px] font-medium text-[var(--gs-fg)] truncate">{invoice.invoiceNumber}</span>
            </>
          }
        />
        
        <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative z-0 bg-[var(--gs-bg)] p-8">
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => router.push("/dashboard/invoices")}
                className="flex items-center gap-1.5 text-[13px] text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Invoices
              </button>
              <div className="flex gap-2">
                {invoice.status === 'DRAFT' && (
                  <>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[var(--gs-border)] text-[13px] font-medium text-[var(--gs-fg)] hover:bg-[var(--gs-surface)] transition-colors outline-none">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#EF4444]/20 text-[13px] font-medium text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors outline-none">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                    <button 
                      onClick={handleSendInvoice}
                      disabled={submitting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[var(--gs-fg)] text-[var(--gs-bg)] text-[13px] font-bold hover:bg-[var(--gs-fg)] transition-colors outline-none disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" /> Issue Invoice
                    </button>
                  </>
                )}
                {['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status) && (
                  <>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[var(--gs-border)] text-[13px] font-medium text-[var(--gs-fg)] hover:bg-[var(--gs-surface)] transition-colors outline-none">
                      <Copy className="w-3.5 h-3.5" /> Share
                    </button>
                    <button 
                      onClick={handleDownloadPdf}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[var(--gs-border)] text-[13px] font-medium text-[var(--gs-fg)] hover:bg-[var(--gs-surface)] transition-colors outline-none"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[var(--gs-border)] text-[13px] font-medium text-[var(--gs-fg)] hover:bg-[var(--gs-surface)] transition-colors outline-none">
                      <Send className="w-3.5 h-3.5" /> Send Reminder
                    </button>
                    <button 
                      onClick={() => setIsPaymentModalOpen(true)}
                      disabled={submitting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[var(--gs-fg)] text-[var(--gs-bg)] text-[13px] font-bold hover:bg-[var(--gs-fg)] transition-colors outline-none disabled:opacity-50"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Record Payment
                    </button>
                  </>
                )}
                {invoice.status === 'PAID' && (
                  <>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[var(--gs-border)] text-[13px] font-medium text-[var(--gs-fg)] hover:bg-[var(--gs-surface)] transition-colors outline-none">
                      <Files className="w-3.5 h-3.5" /> Duplicate
                    </button>
                    <button 
                      onClick={handleDownloadPdf}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[var(--gs-border)] text-[13px] font-medium text-[var(--gs-fg)] hover:bg-[var(--gs-surface)] transition-colors outline-none"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Invoice Document Style Card */}
            <div className="bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[12px] p-10 flex flex-col gap-10 shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-bold text-[var(--gs-fg)] tracking-tight">Invoice</h1>
                  <span className="text-[14px] font-mono text-[var(--gs-muted)]">{invoice.invoiceNumber}</span>
                  <div className="mt-2">{getStatusBadge()}</div>
                </div>
                <div className="flex flex-col text-right gap-0.5 text-[13px] text-[var(--gs-muted)]">
                  <span className="font-bold text-[var(--gs-fg)] text-[16px] mb-1">GrowSuite Workspace</span>
                  <span>Invoice Date: {formatDate(invoice.issueDate)}</span>
                  <span>Due Date: <span className="font-semibold text-[var(--gs-fg)]">{formatDate(invoice.dueDate)}</span></span>
                </div>
              </div>

              <div className="flex justify-between border-y border-[var(--gs-border)] py-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[var(--gs-muted-light)] uppercase tracking-wider">Bill To</span>
                  <span className="text-[15px] font-bold text-[var(--gs-fg)]">{invoice.client.name}</span>
                  <span className="text-[13px] text-[var(--gs-muted)]">{invoice.client.email}</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[11px] font-bold text-[var(--gs-muted-light)] uppercase tracking-wider">Amount Due</span>
                  <span className="text-3xl font-bold text-[var(--gs-fg)]">{formatCurrency(Number(invoice.balanceDue))}</span>
                </div>
              </div>

              <div className="w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--gs-border)] text-[var(--gs-muted-light)] text-[11px] uppercase tracking-wider font-semibold">
                      <th className="pb-3 px-2">Description</th>
                      <th className="pb-3 px-2 text-right">Qty</th>
                      <th className="pb-3 px-2 text-right">Price</th>
                      <th className="pb-3 px-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--gs-border)]">
                    {invoice.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="py-4 px-2 text-[14px] text-[var(--gs-fg)]">{item.description}</td>
                        <td className="py-4 px-2 text-[14px] text-[var(--gs-muted)] text-right">{item.quantity}</td>
                        <td className="py-4 px-2 text-[14px] text-[var(--gs-muted)] text-right">{formatCurrency(Number(item.unitPrice))}</td>
                        <td className="py-4 px-2 text-[14px] text-[var(--gs-fg)] font-medium text-right">{formatCurrency(Number(item.total))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-4">
                <div className="flex flex-col gap-3 w-[280px]">
                  <div className="flex justify-between text-[14px] text-[var(--gs-muted)]">
                    <span>Subtotal</span>
                    <span>{formatCurrency(Number(invoice.subtotal))}</span>
                  </div>
                  {Number(invoice.tax) > 0 && (
                    <div className="flex justify-between text-[14px] text-[var(--gs-muted)]">
                      <span>Tax</span>
                      <span>{formatCurrency(Number(invoice.tax))}</span>
                    </div>
                  )}
                  {Number(invoice.discount) > 0 && (
                    <div className="flex justify-between text-[14px] text-[var(--gs-muted)]">
                      <span>Discount</span>
                      <span>-{formatCurrency(Number(invoice.discount))}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[16px] font-bold text-[var(--gs-fg)] border-t border-[var(--gs-border)] pt-3">
                    <span>Total</span>
                    <span>{formatCurrency(Number(invoice.total))}</span>
                  </div>
                  {Number(invoice.amountPaid) > 0 && (
                    <div className="flex justify-between text-[14px] font-medium text-[var(--gs-fg)] pt-1 border-t border-[var(--gs-border)] mt-2">
                      <span>Amount Paid</span>
                      <span>{formatCurrency(Number(invoice.amountPaid))}</span>
                    </div>
                  )}
                  <div className={`flex justify-between text-[14px] font-bold pt-1 ${Number(invoice.balanceDue) > 0 ? 'text-[#F5A623]' : 'text-[var(--gs-fg)]'}`}>
                    <span>Balance Due</span>
                    <span>{formatCurrency(Number(invoice.balanceDue))}</span>
                  </div>
                </div>
              </div>

              {invoice.notes && (
                <div className="border-t border-[var(--gs-border)] pt-6 flex flex-col gap-1">
                  <span className="text-[12px] font-bold text-[var(--gs-fg)]">Notes</span>
                  <p className="text-[13px] text-[var(--gs-muted)] whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}
            </div>
            
            {/* Payments History section (Phase 3) */}
            {invoice.payments && invoice.payments.length > 0 && (
              <div className="flex flex-col gap-3 mt-4">
                <h3 className="text-[14px] font-bold text-[var(--gs-fg)] border-b border-[var(--gs-border)] pb-2">Payment History</h3>
                <div className="bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[12px] overflow-hidden">
                  <table className="w-full text-left border-collapse text-[13px] text-[var(--gs-fg)]">
                    <thead>
                      <tr className="border-b border-[var(--gs-border)] text-[var(--gs-muted-light)] uppercase tracking-wider text-[11px] font-semibold">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--gs-border)]">
                      {invoice.payments.map((payment: any) => (
                        <tr key={payment.id} className="hover:bg-[var(--gs-bg-alt)] transition-colors">
                          <td className="py-4 px-4 text-[13px] text-[var(--gs-muted)] whitespace-nowrap">{formatDate(payment.date)}</td>
                          <td className="py-4 px-4 text-[13px] text-[var(--gs-fg)]">{formatEnum(payment.method)}</td>
                          <td className="py-3 px-4 text-[13px] text-[var(--gs-muted)] font-mono">{payment.reference || '-'}</td>
                          <td className="py-3 px-4 text-[13px] font-bold text-[var(--gs-fg)] text-right">{formatCurrency(Number(payment.amount))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
      
      <RecordPaymentModal
        token={token}
        workspaceId={workspaceId}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoice={invoice}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
          fetchInvoice();
          window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Payment recorded successfully", type: "success" } }));
        }}
      />
      <EventToast />
    </>
  );
}
