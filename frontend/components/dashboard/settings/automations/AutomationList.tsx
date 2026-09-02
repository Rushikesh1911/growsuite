import { useState, useEffect } from "react";
import { Plus, Workflow, Trash2, Power } from "lucide-react";
import { format } from "date-fns";

interface AutomationListProps {
  token: string;
  workspaceId: number;
  onSelect: (id: number) => void;
  onCreate: () => void;
}

export function AutomationList({ token, workspaceId, onSelect, onCreate }: AutomationListProps) {
  const [automations, setAutomations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/automations", {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAutomations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutomation = async (id: number, currentStatus: boolean) => {
    try {
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, isActive: !currentStatus } : a));
      await fetch(`http://localhost:5000/api/automations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAutomation = async (id: number) => {
    if (!confirm("Are you sure you want to delete this automation?")) return;
    try {
      setAutomations(prev => prev.filter(a => a.id !== id));
      await fetch(`http://localhost:5000/api/automations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold text-[var(--gs-fg)] tracking-tight">Automations</h2>
          <p className="text-[13px] text-[var(--gs-muted)] mt-1">
            Build custom workflows to automate your agency.
          </p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--gs-fg)] text-[var(--gs-bg)] rounded-md text-[13px] font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Create Automation
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-[var(--gs-muted)]">Loading...</div>
      ) : automations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-[#111112] border border-[#222] rounded-xl border-dashed">
          <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-4">
            <Workflow className="h-6 w-6 text-[#555]" />
          </div>
          <h3 className="text-[15px] font-medium text-[var(--gs-fg)] mb-1">No automations yet</h3>
          <p className="text-[13px] text-[var(--gs-muted)] mb-4 max-w-sm">
            Automate tasks like creating projects when a deal is won, or sending a welcome email to new leads.
          </p>
          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-[var(--gs-fg)] border border-[#333] rounded-md text-[13px] font-medium hover:bg-[#222] transition-colors"
          >
            Create your first workflow
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {automations.map((a) => (
            <div key={a.id} className="flex flex-col bg-[#111112] border border-[#222] rounded-xl overflow-hidden hover:border-[#333] transition-colors">
              <div 
                className="p-5 flex-1 cursor-pointer"
                onClick={() => onSelect(a.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center shrink-0">
                    <Workflow className="h-5 w-5 text-[#888]" />
                  </div>
                  <div 
                    className={`px-2 py-0.5 rounded text-[11px] font-medium tracking-wide ${
                      a.isActive ? "bg-green-500/10 text-green-500" : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {a.isActive ? "ACTIVE" : "INACTIVE"}
                  </div>
                </div>
                <h3 className="text-[15px] font-medium text-[var(--gs-fg)] mb-1">{a.name}</h3>
                <p className="text-[13px] text-[var(--gs-muted)] mb-4">
                  Triggers on <strong className="text-[var(--gs-fg)]">{a.triggerType}</strong>
                </p>
                <p className="text-[12px] text-[#555]">
                  Created {format(new Date(a.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              
              <div className="px-5 py-3 border-t border-[#222] bg-[#0A0A0A] flex items-center justify-between">
                <button
                  onClick={() => toggleAutomation(a.id, a.isActive)}
                  className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors ${
                    a.isActive ? "text-amber-500 hover:text-amber-400" : "text-green-500 hover:text-green-400"
                  }`}
                >
                  <Power className="h-3.5 w-3.5" />
                  {a.isActive ? "Turn Off" : "Turn On"}
                </button>
                <button
                  onClick={() => deleteAutomation(a.id)}
                  className="text-[#666] hover:text-red-500 transition-colors p-1"
                  aria-label="Delete automation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
