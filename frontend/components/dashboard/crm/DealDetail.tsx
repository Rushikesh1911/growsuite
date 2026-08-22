import { Card } from "@/components/ui/card";
import { Clock, FileText, CheckCircle2, ArrowRight, User } from "lucide-react";
import { PopoverSelect } from "@/components/ui/popover-select";
import { Deal } from "./types";
import { formatCurrency } from "@/lib/currency";
import { CreateTaskModal } from "./CreateTaskModal";
import { useState } from "react";

interface DealDetailProps {
  selectedDeal: Deal | null;
  stages: Deal["stage"][];
  handleUpdateStage: (id: number, stage: Deal["stage"]) => void;
  newNote: string;
  setNewNote: (v: string) => void;
  handleAddNote: () => void;
  handleConvertToClient: (id: number) => void;
  onEdit: () => void;
  onArchive: (id: number) => void;
  handleRestoreDeal: (id: number) => void;
}

export function DealDetail({
  selectedDeal, stages, handleUpdateStage, newNote, setNewNote, handleAddNote, handleConvertToClient, onEdit, onArchive, handleRestoreDeal
}: DealDetailProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  if (!selectedDeal) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-full">
        <div className="h-12 w-12 rounded-full bg-[var(--gs-bg-alt)] flex items-center justify-center mb-4 border border-[var(--gs-border)]">
          <FileText className="h-5 w-5 text-[var(--gs-muted)]" />
        </div>
        <span className="text-sm text-[var(--gs-fg)] font-semibold">Select a deal</span>
        <p className="text-xs text-[var(--gs-muted)] mt-1 max-w-[200px]">Click any deal card to view its complete details and history.</p>
      </div>
    );
  }

  const formattedValue = formatCurrency(Number(selectedDeal.estimatedValue));

  const closeDateStr = selectedDeal.expectedClose 
    ? new Date(selectedDeal.expectedClose).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : "Not set";

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-200">
      
      {/* Conversion Banner if Won */}
      {selectedDeal.stage === "WON" && !selectedDeal.convertedToClientId && (
        <div className="bg-[var(--gs-surface)] border-b border-[var(--gs-border)] px-5 py-4 flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-bold text-[var(--gs-fg)]">Deal Won!</span>
            <span className="text-[11px] text-[var(--gs-muted)]">Ready to officially onboard them as a client?</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleConvertToClient(selectedDeal.id)}
              className="flex items-center justify-center flex-1 gap-1.5 bg-[var(--gs-fg)] hover:bg-[var(--gs-fg-secondary)] text-[var(--gs-bg)] px-3 py-1.5 rounded-[6px] text-[12px] font-bold transition-colors"
            >
              Convert to Client <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {selectedDeal.convertedToClientId && (
        <div className="bg-[var(--gs-surface)] border-b border-[var(--gs-border)] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--gs-fg)]" />
            <span className="text-[12px] font-bold text-[var(--gs-fg)]">Converted to Client</span>
          </div>
          <a 
            href={`/dashboard/clients/${selectedDeal.convertedToClientId}`}
            className="text-[11px] font-bold text-[var(--gs-bg)] bg-[var(--gs-fg)] hover:bg-[var(--gs-fg-secondary)] px-2 py-1 rounded-[4px] transition-colors flex items-center gap-1"
          >
            View Client <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      )}

      <div className="p-5 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1.5 border-b border-[var(--gs-border)] pb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-[var(--gs-muted)] font-bold uppercase tracking-wider">Opportunity</span>
          </div>
          <h3 className="text-lg font-bold text-[var(--gs-fg)] tracking-tight">{selectedDeal.title}</h3>
          <div className="flex items-center gap-2 text-[var(--gs-muted)]">
            <span className="text-[13px] font-medium">{selectedDeal.company}</span>
            <span>•</span>
            <span className="text-[13px] font-bold text-[var(--gs-fg)]">
              {formattedValue}
            </span>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="flex flex-col gap-4 border-b border-[var(--gs-border)] pb-6">
          <h4 className="text-[11px] text-[var(--gs-muted-light)] font-bold uppercase tracking-wider">Properties</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-[var(--gs-muted)] font-medium text-[11px]">Pipeline Stage</label>
              <div className="w-full border border-[var(--gs-border)] rounded-[6px] bg-[var(--gs-surface)]">
                <PopoverSelect
                  value={selectedDeal.stage}
                  onChange={(val) => handleUpdateStage(selectedDeal.id, val as Deal["stage"])}
                  className="w-full justify-between px-2 py-1 text-[12px] text-[var(--gs-fg)] bg-transparent hover:bg-transparent"
                  options={stages.map((st) => ({
                    label: st,
                    value: st
                  }))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[var(--gs-muted)] font-medium text-[11px]">Value</span>
              <div className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-1.5 text-[12px] text-[var(--gs-fg)] font-mono">
                {formattedValue}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[var(--gs-muted)] font-medium text-[11px]">Probability</span>
              <div className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-1.5 text-[12px] text-[var(--gs-fg)]">
                {selectedDeal.probability ? `${selectedDeal.probability}%` : "Not set"}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[var(--gs-muted)] font-medium text-[11px]">Close Date</span>
              <div className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-1.5 text-[12px] text-[var(--gs-fg)]">
                {closeDateStr}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 col-span-2">
              <span className="text-[var(--gs-muted)] font-medium text-[11px]">Contact</span>
              <div className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-1.5 text-[12px] text-[var(--gs-fg)] flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-[var(--gs-muted-light)]" />
                {selectedDeal.contactName || "Unassigned"}
                {selectedDeal.contactEmail && (
                  <span className="text-[var(--gs-muted)] ml-1 font-mono text-[10px] truncate">({selectedDeal.contactEmail})</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-[var(--gs-border)] mb-2">
          <button onClick={onEdit} className="flex-1 text-[11px] font-bold text-[var(--gs-bg)] bg-[var(--gs-fg)] hover:bg-[var(--gs-fg-secondary)] px-3 py-2 rounded-[6px] transition-colors">Edit Deal</button>
          <button onClick={() => setIsTaskModalOpen(true)} className="flex-1 text-[11px] font-bold text-[var(--gs-fg)] bg-[var(--gs-surface)] border border-[var(--gs-border)] hover:bg-[var(--gs-bg-alt)] px-3 py-2 rounded-[6px] transition-colors">Create Task</button>
          {selectedDeal.archivedAt ? (
            <button onClick={() => handleRestoreDeal(selectedDeal.id)} className="flex-1 text-[11px] font-bold text-[#F5A623] bg-[var(--gs-surface)] border border-[var(--gs-border)] hover:bg-[#F5A623]/10 hover:border-[#F5A623]/30 px-3 py-2 rounded-[6px] transition-colors">Restore</button>
          ) : (
            <button onClick={() => onArchive(selectedDeal.id)} className="flex-1 text-[11px] font-bold text-red-500 bg-[var(--gs-surface)] border border-[var(--gs-border)] hover:bg-red-500/10 hover:border-red-500/30 px-3 py-2 rounded-[6px] transition-colors">Archive</button>
          )}
        </div>

        {/* Tasks Section */}
        {selectedDeal.tasks && selectedDeal.tasks.length > 0 && (
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] text-[var(--gs-muted-light)] font-bold uppercase tracking-wider">Tasks</h4>
            <div className="flex flex-col gap-2">
              {selectedDeal.tasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 p-2 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px]">
                  <CheckCircle2 className={`h-4 w-4 ${task.status === 'DONE' ? 'text-green-500' : 'text-[var(--gs-muted-light)]'}`} />
                  <span className={`text-xs font-medium ${task.status === 'DONE' ? 'text-[var(--gs-muted)] line-through' : 'text-[var(--gs-fg)]'}`}>
                    {task.title}
                  </span>
                  {task.dueDate && (
                    <span className="text-[10px] text-[var(--gs-muted)] ml-auto font-mono">
                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Feed */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[11px] text-[var(--gs-muted-light)] font-bold uppercase tracking-wider">Internal Notes</h4>
          
          <div className="flex gap-2">
            <input
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNote();
                }
              }}
              className="flex-1 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-1.5 text-[12px] text-[var(--gs-fg)] placeholder:text-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-border-strong)] transition-colors"
            />
            <button
              onClick={handleAddNote}
              className="bg-[var(--gs-surface)] border border-[var(--gs-border)] hover:bg-[var(--gs-bg-alt)] text-[var(--gs-fg)] px-3 py-1.5 rounded-[6px] text-[12px] font-semibold transition-colors"
            >
              Save
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {selectedDeal.notes ? (
              <div className="flex flex-col gap-3 border-b border-[var(--gs-border)] pb-3 last:border-b-0">
                {selectedDeal.notes.split('\n\n').map((noteBlock, i) => (
                  <div key={i} className="flex gap-2.5 items-start text-xs">
                    <Clock className="h-3.5 w-3.5 text-[var(--gs-muted)] shrink-0 mt-0.5" />
                    <span className="text-[var(--gs-muted)] leading-relaxed whitespace-pre-wrap">{noteBlock}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <span className="text-[11px] text-[var(--gs-muted)] font-medium italic">No notes recorded yet.</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CreateTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        dealId={selectedDeal.id}
        onSuccess={() => {
          window.dispatchEvent(new CustomEvent('refreshData'));
          window.dispatchEvent(new CustomEvent('refreshDeals'));
          window.dispatchEvent(new CustomEvent('showToast', {detail: {message: "Task created!", type: "success"}}));
        }}
      />
    </div>
  );
}
