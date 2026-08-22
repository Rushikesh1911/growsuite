import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Inbox, MoreHorizontal, User, LayoutGrid, Receipt, PenLine, Archive } from "lucide-react";
import { Client, SortField } from "./types";
import { formatCurrency } from "@/lib/currency";
import { TableSkeleton } from "@/components/ui/skeleton";

interface ClientTableProps {
  filteredClients: Client[];
  selectedIds: number[];
  loading: boolean;
  toggleSelectAll: () => void;
  toggleSelectClient: (id: number) => void;
  handleSort: (field: SortField) => void;
  onEdit: (client: Client) => void;
  onArchive: (id: number) => void;
}

export function ClientTable({
  filteredClients, selectedIds, loading, toggleSelectAll, toggleSelectClient, handleSort, onEdit, onArchive
}: ClientTableProps) {
  
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside() {
      setOpenActionMenuId(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return <TableSkeleton />;
  }

  if (filteredClients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="h-10 w-10 rounded-full bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] flex items-center justify-center text-[var(--gs-muted-light)] mb-3">
          <Inbox className="h-5 w-5 stroke-[1.75]" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-bold text-[var(--gs-fg)]">No records found</h3>
        <p className="text-xs text-[var(--gs-muted)] max-w-[240px] mt-1">There are no clients matching your filters.</p>
      </div>
    );
  }

  const getRelativeTime = (updatedAtStr: string, createdAtStr: string) => {
    // If updatedAt is exactly equal to createdAt (down to the second), 
    // it often means no subsequent activity has happened.
    if (new Date(updatedAtStr).getTime() === new Date(createdAtStr).getTime()) {
      return 'Never';
    }

    const date = new Date(updatedAtStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-full overflow-visible pb-8">
      <table className="w-full text-left border-collapse text-[13px] text-[var(--gs-fg)]" aria-label="Clients Table">
        <thead>
          <tr className="border-b border-[var(--gs-border)] text-[11px] font-semibold text-[var(--gs-muted)] uppercase tracking-wider select-none whitespace-nowrap">
            <th className="px-5 py-3 w-10 text-center">
              <input
                type="checkbox"
                aria-label="Select all clients"
                checked={selectedIds.length === filteredClients.length && filteredClients.length > 0}
                onChange={toggleSelectAll}
                className="h-3.5 w-3.5 rounded-[3px] border-[var(--gs-border-strong)] bg-transparent text-[var(--gs-fg)] focus:ring-0 focus:ring-offset-0 cursor-pointer transition-colors"
              />
            </th>
            <th
              role="columnheader"
              tabIndex={0}
              onClick={() => handleSort("name")}
              className="px-4 py-3 cursor-pointer hover:text-[var(--gs-fg)] transition-colors outline-none w-[280px]"
            >
              <div className="flex items-center gap-1.5">CLIENT <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
            </th>
            <th
              role="columnheader"
              tabIndex={0}
              onClick={() => handleSort("company")}
              className="px-4 py-3 cursor-pointer hover:text-[var(--gs-fg)] transition-colors outline-none max-w-[140px]"
            >
              <div className="flex items-center gap-1.5">COMPANY <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
            </th>
            <th className="px-4 py-3">STATUS</th>
            <th
              role="columnheader"
              tabIndex={0}
              onClick={() => handleSort("projects")}
              className="px-4 py-3 cursor-pointer hover:text-[var(--gs-fg)] transition-colors outline-none"
            >
              <div className="flex items-center gap-1.5">PROJECTS <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
            </th>
            <th
              role="columnheader"
              tabIndex={0}
              onClick={() => handleSort("outstanding")}
              className="px-4 py-3 cursor-pointer hover:text-[var(--gs-fg)] transition-colors outline-none"
            >
              <div className="flex items-center gap-1.5">OUTSTANDING <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
            </th>
            <th
              role="columnheader"
              tabIndex={0}
              onClick={() => handleSort("updatedAt")}
              className="px-4 py-3 cursor-pointer hover:text-[var(--gs-fg)] transition-colors outline-none"
            >
              <div className="flex items-center gap-1.5">LAST ACTIVITY <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
            </th>
            <th className="px-4 py-3 text-right w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--gs-border)]">
          {filteredClients.map((client) => {
            const isSelected = selectedIds.includes(client.id);
            const projectCount = client.projects?.length || 0;
            const outstanding = client.invoices?.reduce((sum, inv) => sum + Number(inv.balanceDue), 0) || 0;
            
            return (
              <tr 
                key={client.id} 
                aria-selected={isSelected}
                className={`group border-b border-[var(--gs-border)] last:border-b-0 hover:bg-[var(--gs-surface-raised)] transition-colors cursor-pointer ${isSelected ? 'bg-[var(--gs-surface-raised)]' : ''}`}
                onClick={() => window.location.href = `/dashboard/clients/${client.id}`}
              >
                <td className="px-4 py-4 w-10 relative" onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    aria-label={`Select client ${client.name}`}
                    checked={isSelected}
                    onChange={() => toggleSelectClient(client.id)}
                    className="h-3.5 w-3.5 rounded-[3px] border-[var(--gs-border-strong)] bg-transparent text-[var(--gs-fg)] focus:ring-0 focus:ring-offset-0 cursor-pointer transition-colors"
                  />
                </td>
                
                {/* Client Cell */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[var(--gs-border)] flex items-center justify-center text-[10px] font-bold text-[var(--gs-fg)] shrink-0 border border-[var(--gs-border-strong)]">
                      {getInitials(client.name)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[var(--gs-fg)]">{client.name}</span>
                      {client.email && (
                        <span className="text-[12px] text-[var(--gs-muted)] leading-tight">{client.email}</span>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-4 py-3 font-medium text-[var(--gs-muted)] truncate max-w-[140px]">{client.company}</td>
                
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-bold bg-[var(--gs-bg-alt)] border border-[var(--gs-border-strong)] text-[var(--gs-fg)]">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#2E7D32]"></div> Active
                  </span>
                </td>
                
                <td className="px-4 py-3 font-medium text-[var(--gs-fg)]" onClick={(e) => e.stopPropagation()}>
                  {projectCount > 0 ? (
                    <span 
                      onClick={() => window.dispatchEvent(new CustomEvent('showToast', {detail: {message: `View ${projectCount} projects`, type: 'info'}}))}
                      className="hover:text-[var(--gs-fg-hover)] transition-colors cursor-pointer outline-none"
                    >
                      {projectCount}
                    </span>
                  ) : (
                    <span className="text-[var(--gs-muted)]">0</span>
                  )}
                </td>
                
                <td className="px-4 py-3 font-semibold text-[var(--gs-fg)]">
                  {formatCurrency(outstanding)}
                </td>
                
                <td className="px-4 py-3 text-[12px] font-medium text-[var(--gs-muted)]">
                  {getRelativeTime(client.updatedAt, client.createdAt)}
                </td>
                
                <td className="px-4 py-3 text-right relative" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === client.id ? null : client.id); }}
                    className="p-1.5 rounded-[4px] text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[var(--gs-border)] opacity-0 group-hover:opacity-100 transition-all outline-none"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  
                  {openActionMenuId === client.id && (
                    <div className="absolute right-6 top-10 w-40 bg-[var(--gs-surface-raised)] border border-[var(--gs-border)] rounded-[8px] shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/dashboard/clients/${client.id}`); setOpenActionMenuId(null); }} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] flex items-center gap-2"><User className="h-3 w-3" /> View client</button>
                      <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(client); setOpenActionMenuId(null); }} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] flex items-center gap-2"><PenLine className="h-3 w-3" /> Edit</button>
                      <div className="h-px bg-[var(--gs-border)] my-1"></div>
                      <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/dashboard/projects?create=true&client=${client.id}`); setOpenActionMenuId(null); }} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] flex items-center gap-2"><LayoutGrid className="h-3 w-3" /> Create project</button>
                      <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/dashboard/invoices/new?client=${client.id}`); setOpenActionMenuId(null); }} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] flex items-center gap-2"><Receipt className="h-3 w-3" /> Create invoice</button>
                      <div className="h-px bg-[var(--gs-border)] my-1"></div>
                      <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onArchive(client.id); setOpenActionMenuId(null); }} className="w-full text-left px-3 py-1.5 text-[12px] text-red-500 hover:bg-red-500/10 flex items-center gap-2"><Archive className="h-3 w-3" /> Archive</button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Spacer to prevent action menu clipping in overflow container */}
      {openActionMenuId !== null && <div className="h-48 w-full" />}
    </div>
  );
}
