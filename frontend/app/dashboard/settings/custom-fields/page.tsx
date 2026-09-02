"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, Tag } from "lucide-react";

export default function CustomFieldsSettingsPage() {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newField, setNewField] = useState({
    entityType: "LEAD",
    name: "",
    key: "",
    type: "text",
    options: "",
    required: false
  });

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const token = localStorage.getItem("growsuite_token");
      const workspaceId = localStorage.getItem("growsuite_workspace_id");
      if (!token || !workspaceId) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/custom-fields`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId as string
        }
      });
      if (res.ok) {
        const data = await res.json();
        setFields(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const generateKey = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNewField(prev => ({ ...prev, name, key: generateKey(name) }));
  };

  const handleCreate = async () => {
    if (!newField.name || !newField.key) return;
    
    try {
      const token = localStorage.getItem("growsuite_token");
      const workspaceId = localStorage.getItem("growsuite_workspace_id");
      
      const payload = {
        ...newField,
        options: newField.type === 'dropdown' ? newField.options.split(',').map(s => s.trim()).filter(Boolean) : null
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/custom-fields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId as string
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsAdding(false);
        setNewField({ entityType: "LEAD", name: "", key: "", type: "text", options: "", required: false });
        fetchFields();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create field');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this custom field? Existing data on records will not be deleted but will no longer be visible in forms.')) return;
    
    try {
      const token = localStorage.getItem("growsuite_token");
      const workspaceId = localStorage.getItem("growsuite_workspace_id");
      
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/custom-fields/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId as string
        }
      });
      fetchFields();
    } catch (e) {
      console.error(e);
    }
  };

  const groupedFields = fields.reduce((acc, field) => {
    if (!acc[field.entityType]) acc[field.entityType] = [];
    acc[field.entityType].push(field);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) return <div className="p-8 text-[var(--gs-text-muted)]">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--gs-fg)] flex items-center gap-2">
            <Tag className="w-6 h-6 text-indigo-400" />
            Custom Fields
          </h1>
          <p className="text-sm text-[var(--gs-text-muted)] mt-1">
            Define custom data properties for your Leads, Deals, and Clients.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-[8px] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[12px] p-6 mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-sm font-medium text-[var(--gs-fg)] mb-4">Create New Custom Field</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-[var(--gs-text-muted)] mb-1">Entity</label>
              <select
                value={newField.entityType}
                onChange={e => setNewField({...newField, entityType: e.target.value})}
                className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[8px] px-3 py-2 text-sm text-[var(--gs-fg)]"
              >
                <option value="LEAD">Lead</option>
                <option value="DEAL">Deal</option>
                <option value="CLIENT">Client</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--gs-text-muted)] mb-1">Field Type</label>
              <select
                value={newField.type}
                onChange={e => setNewField({...newField, type: e.target.value})}
                className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[8px] px-3 py-2 text-sm text-[var(--gs-fg)]"
              >
                <option value="text">Text (Single Line)</option>
                <option value="textarea">Text (Multi Line)</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="dropdown">Dropdown (Select)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--gs-text-muted)] mb-1">Field Name</label>
              <input
                type="text"
                placeholder="e.g. Industry"
                value={newField.name}
                onChange={handleNameChange}
                className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[8px] px-3 py-2 text-sm text-[var(--gs-fg)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--gs-text-muted)] mb-1">Internal Key</label>
              <input
                type="text"
                value={newField.key}
                disabled
                className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[8px] px-3 py-2 text-sm text-[var(--gs-text-muted)] opacity-70"
              />
            </div>
          </div>

          {newField.type === 'dropdown' && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-[var(--gs-text-muted)] mb-1">Dropdown Options (comma separated)</label>
              <input
                type="text"
                placeholder="Tech, Healthcare, Retail"
                value={newField.options}
                onChange={e => setNewField({...newField, options: e.target.value})}
                className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[8px] px-3 py-2 text-sm text-[var(--gs-fg)]"
              />
            </div>
          )}

          <div className="flex items-center gap-2 mb-6">
            <input
              type="checkbox"
              id="required-checkbox"
              checked={newField.required}
              onChange={e => setNewField({...newField, required: e.target.checked})}
              className="rounded border-[var(--gs-border)] bg-[var(--gs-bg)]"
            />
            <label htmlFor="required-checkbox" className="text-sm text-[var(--gs-fg)]">This field is required</label>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={!newField.name}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-[8px] transition-colors"
            >
              Save Field
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-[var(--gs-border)] text-[var(--gs-fg)] hover:bg-[var(--gs-bg)] text-sm font-medium rounded-[8px] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {['LEAD', 'DEAL', 'CLIENT'].map(entity => {
          const entityFields = groupedFields[entity] || [];
          
          return (
            <div key={entity} className="bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[12px] overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--gs-border)] bg-[var(--gs-bg)]/50">
                <h2 className="text-sm font-semibold text-[var(--gs-fg)]">{entity} Custom Fields</h2>
              </div>
              
              {entityFields.length === 0 ? (
                <div className="p-6 text-sm text-[var(--gs-text-muted)] text-center">
                  No custom fields defined for {entity.toLowerCase()}s.
                </div>
              ) : (
                <div className="divide-y divide-[var(--gs-border)]">
                  {entityFields.map((field: any) => (
                    <div key={field.id} className="p-6 flex items-center justify-between hover:bg-[var(--gs-bg)]/30 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--gs-fg)]">{field.name}</span>
                          {field.required && (
                            <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20">
                              Required
                            </span>
                          )}
                          <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--gs-bg)] text-[var(--gs-text-muted)] border border-[var(--gs-border)]">
                            {field.type}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--gs-text-muted)] mt-1 font-mono">
                          {field.key}
                        </div>
                        {field.type === 'dropdown' && field.options && (
                          <div className="text-xs text-[var(--gs-text-muted)] mt-2">
                            Options: {(field.options as string[]).join(', ')}
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleDelete(field.id)}
                        className="p-2 text-[var(--gs-text-muted)] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
