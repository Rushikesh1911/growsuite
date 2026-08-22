import React, { useState, useEffect } from "react";
import { X, CheckCircle2, ChevronRight, Search } from "lucide-react";
import { Deal } from "./types";

interface ClientConversionModalProps {
  token: string;
  workspaceId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (clientId: number) => void;
  deal: Deal | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function ClientConversionModal({
  token,
  workspaceId,
  isOpen,
  onClose,
  onSuccess,
  deal,
}: ClientConversionModalProps) {
  const [activeTab, setActiveTab] = useState<"CREATE" | "LINK">("CREATE");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Create New State
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // Link Existing State
  const [clients, setClients] = useState<{id: number, name: string, company: string, email: string}[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Success State
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdClientId, setCreatedClientId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && deal) {
      setName(deal.contactName || deal.company || "");
      setCompany(deal.company || "");
      setEmail(deal.contactEmail || "");
      setPhone(deal.contactPhone || "");
      setActiveTab("CREATE");
      setIsSuccess(false);
      setCreatedClientId(null);
      setErrorMsg("");
      setSearchQuery("");
      setSelectedClientId(null);

      // Fetch clients for Link tab
      const fetchClients = async () => {
        try {
          const res = await fetch(`${API_URL}/api/clients`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "x-workspace-id": workspaceId.toString(),
            },
          });
          if (res.ok) {
            const data = await res.json();
            setClients(data);
          }
        } catch (err) {
          console.error("Failed to fetch clients", err);
        }
      };
      fetchClients();
    }
  }, [isOpen, deal, token, workspaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal) return;
    
    if (activeTab === "CREATE" && !name) {
      setErrorMsg("Name is required");
      return;
    }
    
    if (activeTab === "LINK" && !selectedClientId) {
      setErrorMsg("Please select a client to link");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    const payload = activeTab === "LINK" 
      ? { linkClientId: selectedClientId }
      : { clientData: { name, company, email, phone } };

    try {
      const res = await fetch(`${API_URL}/api/deals/${deal.id}/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (res.ok) {
        setCreatedClientId(data.id);
        setIsSuccess(true);
      } else {
        setErrorMsg(data.error || "Failed to convert deal");
      }
    } catch (err) {
      setErrorMsg("Connection error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen || !deal) return null;

  if (isSuccess && createdClientId) {
    return (
      <div className="fixed inset-0 bg-[var(--gs-bg)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] rounded-[12px] w-full max-w-[400px] shadow-2xl overflow-hidden flex flex-col items-center p-8 text-center" onClick={e => e.stopPropagation()}>
          <div className="h-12 w-12 rounded-full bg-[var(--gs-fg)]/10 flex items-center justify-center mb-4 text-[var(--gs-fg)]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-[18px] font-bold text-[var(--gs-fg)] mb-2">Deal Converted!</h2>
          <p className="text-[13px] text-[var(--gs-muted)] mb-8">
            The deal has been successfully {activeTab === "LINK" ? "linked to the existing client" : "converted into a new client"}.
          </p>
          
          <div className="flex flex-col w-full gap-3">
            <button
              onClick={() => onSuccess(createdClientId)}
              className="w-full flex items-center justify-center gap-2 bg-[var(--gs-fg)] hover:bg-[var(--gs-fg-secondary)] text-[var(--gs-bg)] px-4 py-2.5 rounded-[6px] text-[13px] font-semibold transition-colors"
            >
              View Client <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[6px] text-[13px] font-semibold text-[var(--gs-fg)] border border-[var(--gs-border)] hover:bg-[var(--gs-bg-alt)] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[var(--gs-bg)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] rounded-[12px] w-full max-w-[480px] shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[var(--gs-border)] flex items-center justify-between bg-[var(--gs-bg)]">
          <h2 className="text-[15px] font-bold text-[var(--gs-fg)]">Convert to Client</h2>
          <button onClick={onClose} className="text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex border-b border-[var(--gs-border)] px-6 bg-[var(--gs-bg)]">
          <button
            type="button"
            className={`py-3 text-[13px] font-semibold border-b-2 mr-6 transition-colors ${activeTab === 'CREATE' ? 'border-[var(--gs-fg)] text-[var(--gs-fg)]' : 'border-transparent text-[var(--gs-muted)] hover:text-[var(--gs-fg)]'}`}
            onClick={() => setActiveTab('CREATE')}
          >
            Create new client
          </button>
          <button
            type="button"
            className={`py-3 text-[13px] font-semibold border-b-2 transition-colors ${activeTab === 'LINK' ? 'border-[var(--gs-fg)] text-[var(--gs-fg)]' : 'border-transparent text-[var(--gs-muted)] hover:text-[var(--gs-fg)]'}`}
            onClick={() => setActiveTab('LINK')}
          >
            Link existing client
          </button>
        </div>

        <div className="px-6 py-3 bg-[var(--gs-bg-alt)] border-b border-[var(--gs-border)] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--gs-muted)] uppercase tracking-wider mb-0.5">Originating Deal</span>
            <span className="text-[13px] font-medium text-[var(--gs-fg)]">{deal.title}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-[var(--gs-muted)] uppercase tracking-wider mb-0.5">Value</span>
            <span className="text-[13px] font-medium text-[var(--gs-fg)]">₹{parseFloat(deal.estimatedValue).toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 bg-[var(--gs-surface)]">
          {activeTab === "CREATE" && (
            <>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[var(--gs-muted)]">Client Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[var(--gs-muted)]">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[var(--gs-muted)]">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[var(--gs-muted)]">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === "LINK" && (
            <div className="flex flex-col h-[280px]">
              <div className="relative mb-3 flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gs-muted)]" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] pl-9 pr-3 py-2 text-[13px] text-[var(--gs-fg)] placeholder-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
                />
              </div>

              <div className="flex-1 overflow-y-auto border border-[var(--gs-border)] rounded-[6px] bg-[var(--gs-bg)] custom-scrollbar">
                {filteredClients.length === 0 ? (
                  <div className="p-4 text-center text-[13px] text-[var(--gs-muted)] flex items-center justify-center h-full">
                    No clients found.
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {filteredClients.map(client => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => setSelectedClientId(client.id)}
                        className={`flex items-center justify-between w-full p-3 border-b border-[var(--gs-border)] last:border-0 text-left transition-colors cursor-pointer ${selectedClientId === client.id ? 'bg-[#121212]' : 'hover:bg-[#121212]'}`}
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-semibold text-[var(--gs-fg)] truncate">{client.name}</span>
                          {(client.company || client.email) && (
                            <span className="text-[11px] text-[var(--gs-muted)] truncate">
                              {client.company || "No company"}{client.email ? ` • ${client.email}` : ' • No email'}
                            </span>
                          )}
                        </div>
                        {selectedClientId === client.id && (
                          <CheckCircle2 className="h-4 w-4 text-[var(--gs-fg)] flex-shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-[6px] bg-red-500/10 border border-red-500/20 text-[12px] text-red-500 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="pt-4 border-t border-[var(--gs-border)] flex justify-end gap-3 mt-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-[13px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (activeTab === 'LINK' && !selectedClientId)}
              className="bg-[var(--gs-fg)] hover:bg-[var(--gs-fg-secondary)] text-[var(--gs-bg)] px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? "Processing..." : activeTab === "CREATE" ? "Create Client" : "Link Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
