"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Download, Building, MapPin, Phone, Mail, FileText, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface InvoiceData {
  id: number;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  tax: string;
  total: string;
  amountPaid: string;
  balanceDue: string;
  currency: string;
  notes: string | null;
  client: {
    name: string;
    company: string;
    email: string | null;
    phone: string | null;
    billingAddress: string | null;
  };
  workspace: {
    name: string;
    currency: string;
    razorpayKeyId: string | null;
  };
  items: {
    id: number;
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }[];
}

export default function PublicInvoicePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load Razorpay SDK
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    const fetchInvoice = async () => {
      try {
        const res = await fetch(`${API_URL}/api/invoices/public/${id}`);
        if (!res.ok) {
          throw new Error("Invoice not found or invalid link");
        }
        const data = await res.json();
        setInvoice(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
    
    return () => {
      document.body.removeChild(script);
    };
  }, [id]);

  const handlePayment = async () => {
    if (!invoice || !invoice.workspace.razorpayKeyId) return;
    setIsProcessing(true);
    
    try {
      // 1. Create order on backend
      const orderRes = await fetch(`${API_URL}/api/razorpay/create-order/${invoice.id}`, {
        method: "POST"
      });
      
      const orderData = await orderRes.json();
      
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initialize payment");
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.workspaceName,
        description: `Payment for Invoice ${invoice.invoiceNumber}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment on Backend
          try {
            const verifyRes = await fetch(`${API_URL}/api/razorpay/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                invoiceId: invoice.id
              })
            });
            
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              // Reload page to show PAID status
              window.location.reload();
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error(err);
            alert("Payment verification error.");
          }
        },
        prefill: {
          name: invoice.client.name,
          email: invoice.client.email || "",
          contact: invoice.client.phone || ""
        },
        theme: {
          color: "#000000" // Dark mode aesthetic
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#EDEDED]" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
        <FileText className="h-16 w-16 text-[#333333] mb-4" />
        <h1 className="text-xl font-bold text-[#EDEDED] mb-2">Invoice Unavailable</h1>
        <p className="text-[#888888]">{error || "This invoice does not exist or has been deleted."}</p>
      </div>
    );
  }

  const isPaid = invoice.status === "PAID";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] p-4 md:p-8 font-sans selection:bg-[#EDEDED] selection:text-[#000000]">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Actions Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#222222] rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5 text-[#EDEDED]" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">{invoice.workspace.name}</h2>
              <p className="text-[13px] text-[#888888]">Invoice {invoice.invoiceNumber}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => window.open(`${API_URL}/api/invoices/public/${id}/pdf`, "_blank")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#1A1A1A] text-[#EDEDED] border border-[#333333] px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
            {!isPaid && invoice.workspace.razorpayKeyId && (
              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#EDEDED] hover:bg-[#FFFFFF] text-[#000000] px-6 py-2 rounded-[6px] text-[13px] font-bold transition-colors disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pay via Razorpay"}
              </button>
            )}
          </div>
        </div>

        {/* Invoice Card */}
        <Card className="bg-[#000000] border-[#333333] overflow-hidden shadow-2xl relative">
          
          {/* Status Ribbon */}
          <div className={`absolute top-0 right-0 px-6 py-1 text-[11px] font-bold tracking-wider uppercase rounded-bl-lg ${
            isPaid ? "bg-green-500/20 text-green-500" : "bg-[#333333] text-[#EDEDED]"
          }`}>
            {invoice.status}
          </div>

          <div className="p-8 md:p-12 flex flex-col gap-12">
            
            {/* Header info */}
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tighter">INVOICE</h1>
                <p className="text-[#888888] font-mono text-sm">{invoice.invoiceNumber}</p>
              </div>
              
              <div className="flex flex-col gap-6 md:text-right">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#888888] font-bold uppercase tracking-wider">Amount Due</span>
                  <span className="text-3xl font-bold text-[#EDEDED]">
                    {invoice.currency} {Number(invoice.balanceDue).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex gap-8 md:justify-end">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-[#888888] font-bold uppercase tracking-wider">Issue Date</span>
                    <span className="text-[14px] font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-[#888888] font-bold uppercase tracking-wider">Due Date</span>
                    <span className="text-[14px] font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Billed To */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] text-[#888888] font-bold uppercase tracking-wider">Billed To</span>
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-bold">{invoice.client.company}</span>
                <span className="text-[14px] text-[#AAAAAA]">Attn: {invoice.client.name}</span>
                {invoice.client.email && (
                  <span className="text-[13px] text-[#888888] flex items-center gap-1.5 mt-1">
                    <Mail className="h-3.5 w-3.5" /> {invoice.client.email}
                  </span>
                )}
                {invoice.client.phone && (
                  <span className="text-[13px] text-[#888888] flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {invoice.client.phone}
                  </span>
                )}
                {invoice.client.billingAddress && (
                  <span className="text-[13px] text-[#888888] flex items-start gap-1.5 mt-1 max-w-xs">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {invoice.client.billingAddress}
                  </span>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#222222]">
                    <th className="pb-3 text-[11px] font-bold text-[#888888] uppercase tracking-wider w-1/2">Description</th>
                    <th className="pb-3 text-[11px] font-bold text-[#888888] uppercase tracking-wider text-right">Qty</th>
                    <th className="pb-3 text-[11px] font-bold text-[#888888] uppercase tracking-wider text-right">Unit Price</th>
                    <th className="pb-3 text-[11px] font-bold text-[#888888] uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4 text-[14px]">{item.description}</td>
                      <td className="py-4 text-[14px] text-right text-[#888888]">{item.quantity}</td>
                      <td className="py-4 text-[14px] text-right font-mono text-[#888888]">
                        {Number(item.unitPrice).toLocaleString()}
                      </td>
                      <td className="py-4 text-[14px] text-right font-mono font-medium">
                        {Number(item.total).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex flex-col items-end gap-2 text-right">
              <div className="flex items-center gap-8 w-64 justify-between">
                <span className="text-[13px] text-[#888888]">Subtotal</span>
                <span className="text-[14px] font-mono">{Number(invoice.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-8 w-64 justify-between pb-4 border-b border-[#222222]">
                <span className="text-[13px] text-[#888888]">Tax (0%)</span>
                <span className="text-[14px] font-mono">{Number(invoice.tax).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-8 w-64 justify-between pt-2">
                <span className="text-[14px] font-bold text-[#EDEDED]">Total</span>
                <span className="text-[16px] font-mono font-bold text-[#EDEDED]">
                  {invoice.currency} {Number(invoice.total).toLocaleString()}
                </span>
              </div>
              {Number(invoice.amountPaid) > 0 && (
                <div className="flex items-center gap-8 w-64 justify-between mt-2">
                  <span className="text-[13px] text-green-500">Amount Paid</span>
                  <span className="text-[14px] font-mono text-green-500">
                    -{invoice.currency} {Number(invoice.amountPaid).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-[#111111] border border-[#222222] p-4 rounded-lg mt-4">
                <span className="text-[11px] text-[#888888] font-bold uppercase tracking-wider block mb-2">Notes</span>
                <p className="text-[13px] text-[#AAAAAA] whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
              </div>
            )}

            {isPaid && (
              <div className="flex items-center justify-center gap-2 mt-8 text-green-500 bg-green-500/10 py-3 rounded-lg border border-green-500/20">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold text-sm tracking-wide">This invoice has been paid in full. Thank you!</span>
              </div>
            )}
            
          </div>
        </Card>

      </div>
    </div>
  );
}
