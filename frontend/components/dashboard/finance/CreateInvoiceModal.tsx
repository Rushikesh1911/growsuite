import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { PopoverSelect } from "@/components/ui/popover-select";

interface CreateInvoiceModalProps {
  token: string;
  workspaceId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialClientId?: number;
  initialProjectId?: number;
  initialItems?: LineItem[];
  timeEntryIds?: number[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export function CreateInvoiceModal({
  token,
  workspaceId,
  isOpen,
  onClose,
  onSuccess,
  initialClientId,
  initialProjectId,
  initialItems,
  timeEntryIds,
}: CreateInvoiceModalProps) {
  const [clientId, setClientId] = useState(initialClientId ? initialClientId.toString() : "");
  const [projectId, setProjectId] = useState(initialProjectId ? initialProjectId.toString() : "");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  
  const [taxRate, setTaxRate] = useState("0");
  const [discount, setDiscount] = useState("0");

  const [items, setItems] = useState<LineItem[]>([
    { id: Date.now().toString(), description: "Professional Services", quantity: 1, unitPrice: 0 }
  ]);

  const [clients, setClients] = useState<{id: number, name: string}[]>([]);
  const [projects, setProjects] = useState<{id: number, name: string, clientId: number}[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const resC = await fetch(`${API_URL}/api/clients`, {
            headers: { Authorization: `Bearer ${token}`, "x-workspace-id": workspaceId.toString() },
          });
          if (resC.ok) setClients(await resC.json());

          const resP = await fetch(`${API_URL}/api/projects`, {
            headers: { Authorization: `Bearer ${token}`, "x-workspace-id": workspaceId.toString() },
          });
          if (resP.ok) setProjects(await resP.json());
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
      
      // Reset form
      setClientId(initialClientId ? initialClientId.toString() : "");
      setProjectId(initialProjectId ? initialProjectId.toString() : "");
      setInvoiceNumber("");
      setIssueDate(new Date().toISOString().split('T')[0]);
      
      const dDate = new Date();
      dDate.setDate(dDate.getDate() + 14);
      setDueDate(dDate.toISOString().split('T')[0]);
      
      setNotes("");
      setTaxRate("0");
      setDiscount("0");
      
      if (initialItems && initialItems.length > 0) {
        setItems(initialItems);
      } else {
        setItems([{ id: Date.now().toString(), description: "Professional Services", quantity: 1, unitPrice: 0 }]);
      }
      setErrorMsg("");
    }
  }, [isOpen, token, workspaceId, initialClientId, initialProjectId, initialItems]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const calculatedTax = subtotal * (parseFloat(taxRate || "0") / 100);
  const total = subtotal + calculatedTax - parseFloat(discount || "0");

  const handleSubmit = async (status: 'DRAFT' | 'SENT') => {
    if (!clientId) {
      setErrorMsg("Client is required.");
      return;
    }
    if (items.some(i => !i.description || i.unitPrice <= 0)) {
      setErrorMsg("All line items must have a description and unit price > 0.");
      return;
    }
    
    setSubmitting(true);
    setErrorMsg("");
    
    try {
      const payload = {
        clientId: parseInt(clientId),
        projectId: projectId ? parseInt(projectId) : undefined,
        invoiceNumber: invoiceNumber || undefined,
        issueDate: new Date(issueDate).toISOString(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        items: items.map(i => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })),
        tax: calculatedTax,
        discount: parseFloat(discount || "0"),
        notes: notes || undefined,
        status: status,
        timeEntryIds: timeEntryIds && timeEntryIds.length > 0 ? timeEntryIds : undefined
      };

      const res = await fetch(`${API_URL}/api/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to create invoice");
      }
    } catch (err) {
      setErrorMsg("Connection error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[var(--gs-bg)]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[600px] h-full bg-[var(--gs-surface)] border-l border-[var(--gs-border)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300" 
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[var(--gs-border)] flex items-center justify-between shrink-0 bg-[var(--gs-surface)]">
          <h2 className="text-[16px] font-bold text-[var(--gs-fg)] tracking-tight">Create Invoice</h2>
          <button onClick={onClose} className="text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
          {errorMsg && (
            <div className="p-3 rounded-[6px] bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 text-[13px] font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[var(--gs-fg)]">Client *</label>
              <PopoverSelect
                options={clients.map(c => ({ value: c.id.toString(), label: c.name }))}
                value={clientId}
                onChange={setClientId}
                placeholder="Select a client..."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[var(--gs-fg)]">Project</label>
              <PopoverSelect
                options={clientId ? projects.filter(p => p.clientId === parseInt(clientId)).map(p => ({ value: p.id.toString(), label: p.name })) : []}
                value={projectId}
                onChange={setProjectId}
                placeholder={clientId ? "Optional" : "Select a client first"}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[var(--gs-fg)]">Invoice #</label>
              <input 
                type="text" 
                value={invoiceNumber}
                onChange={e => setInvoiceNumber(e.target.value)}
                placeholder="Auto-generated"
                className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:border-[var(--gs-fg)] focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[var(--gs-fg)]">Issue Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={issueDate}
                  onChange={e => setIssueDate(e.target.value)}
                  className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:border-[var(--gs-fg)] focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[var(--gs-fg)]">Due Date</label>
              <input 
                type="date" 
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:border-[var(--gs-fg)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-bold text-[var(--gs-fg)] border-b border-[var(--gs-border)] pb-2">Line Items</h3>
            
            {/* Headers */}
            <div className="flex gap-3 items-center px-1 text-[11px] font-semibold text-[var(--gs-muted)] uppercase tracking-wider mt-2">
              <div className="flex-1">Description</div>
              <div className="w-[70px]">Qty</div>
              <div className="w-[100px]">Price</div>
              <div className="w-[90px] text-right">Amount</div>
              {items.length > 1 && <div className="w-8"></div>}
            </div>

            <div className="flex flex-col gap-3">
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={item.description}
                      onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:border-[var(--gs-fg)] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="w-[70px]">
                    <input 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      onChange={e => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:border-[var(--gs-fg)] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="w-[100px]">
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={e => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      placeholder="Price"
                      className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:border-[var(--gs-fg)] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="w-[90px] flex items-center justify-end h-[38px] text-[13px] font-medium text-[var(--gs-fg)] pr-1">
                    ₹{(item.quantity * item.unitPrice).toFixed(2)}
                  </div>
                  {items.length > 1 && (
                    <div className="w-8 flex items-center justify-center h-[38px]">
                      <button 
                        type="button" 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-[var(--gs-muted)] hover:text-[#EF4444] transition-colors outline-none"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button 
              type="button" 
              onClick={handleAddItem}
              className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors self-start outline-none"
            >
              <Plus className="h-3.5 w-3.5" /> Add Item
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[var(--gs-fg)]">Notes (Optional)</label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Payment instructions or special notes..."
              rows={3}
              className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:border-[var(--gs-fg)] focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex flex-col items-end gap-2 border-t border-[var(--gs-border)] pt-4 mt-auto">
            <div className="flex justify-between w-full max-w-[250px] text-[13px]">
              <span className="text-[var(--gs-muted)]">Subtotal</span>
              <span className="font-medium text-[var(--gs-fg)]">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-full max-w-[250px] text-[13px] items-center gap-4">
              <span className="text-[var(--gs-muted)]">Tax (%)</span>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={taxRate}
                  onChange={e => setTaxRate(e.target.value)}
                  className="w-[60px] bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[4px] px-2 py-1 text-[12px] text-[var(--gs-fg)] text-right focus:border-[var(--gs-fg)] focus:outline-none"
                />
                <span className="w-[40px] text-right text-[var(--gs-fg)] font-medium">₹{calculatedTax.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between w-full max-w-[250px] text-[13px] items-center gap-4">
              <span className="text-[var(--gs-muted)]">Discount (₹)</span>
              <input 
                type="number" 
                value={discount}
                onChange={e => setDiscount(e.target.value)}
                className="w-[100px] bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[4px] px-2 py-1 text-[12px] text-[var(--gs-fg)] text-right focus:border-[var(--gs-fg)] focus:outline-none"
              />
            </div>
            <div className="flex justify-between w-full max-w-[250px] text-[15px] font-bold mt-2">
              <span className="text-[var(--gs-fg)]">Total</span>
              <span className="text-[var(--gs-fg)]">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-[var(--gs-border)] flex items-center justify-end gap-3 shrink-0 bg-[var(--gs-surface)]">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={() => handleSubmit('DRAFT')}
            disabled={submitting}
            className="px-4 py-2 bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] text-[var(--gs-fg)] rounded-[6px] text-[13px] font-semibold hover:border-[var(--gs-border-strong)] transition-colors disabled:opacity-50 outline-none"
          >
            Save Draft
          </button>
          <button 
            type="button"
            onClick={() => handleSubmit('SENT')}
            disabled={submitting}
            className="px-4 py-2 bg-[var(--gs-fg)] text-[var(--gs-bg)] rounded-[6px] text-[13px] font-bold hover:bg-[var(--gs-fg)] transition-colors disabled:opacity-50 outline-none"
          >
            {submitting ? "Creating..." : "Create & Issue"}
          </button>
        </div>
      </div>
    </div>
  );
}
