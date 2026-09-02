"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, GripVertical, Trash2, Plus } from "lucide-react";

interface FieldConfig {
  key: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
}

interface WebToLeadFormBuilderProps {
  token: string;
  workspaceId: number;
  formId: number | null;
  onBack: () => void;
}

export function WebToLeadFormBuilder({ token, workspaceId, formId, onBack }: WebToLeadFormBuilderProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("New Lead Form");
  const [defaultStatus, setDefaultStatus] = useState("New");
  const [defaultAssigneeId, setDefaultAssigneeId] = useState<number | "">("");
  const [submitText, setSubmitText] = useState("Submit");
  const [successMessage, setSuccessMessage] = useState("Thank you! We will be in touch shortly.");
  const [themeColor, setThemeColor] = useState("#000000"); // Button color
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF"); // Form bg
  
  // Fields State
  const [fields, setFields] = useState<FieldConfig[]>([
    { key: "contactName", label: "Full Name", type: "text", required: true, order: 0 },
    { key: "email", label: "Email Address", type: "email", required: true, order: 1 },
    { key: "company", label: "Company Name", type: "text", required: false, order: 2 }
  ]);

  // Data fetching state
  const [members, setMembers] = useState<any[]>([]);
  const [customFields, setCustomFields] = useState<any[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, customFieldsRes] = await Promise.all([
          fetch(`${API_URL}/api/workspaces/${workspaceId}/members`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/custom-fields`, { headers: { Authorization: `Bearer ${token}`, "x-workspace-id": workspaceId.toString() } })
        ]);
        
        if (membersRes.ok) setMembers(await membersRes.json());
        if (customFieldsRes.ok) setCustomFields(await customFieldsRes.json());

        if (formId) {
          const formRes = await fetch(`${API_URL}/api/web-to-lead`, {
            headers: { Authorization: `Bearer ${token}`, "x-workspace-id": workspaceId.toString() }
          });
          if (formRes.ok) {
            const forms = await formRes.json();
            const form = forms.find((f: any) => f.id === formId);
            if (form) {
              setName(form.name);
              setDefaultStatus(form.defaultStatus);
              setDefaultAssigneeId(form.defaultAssigneeId || "");
              setSubmitText(form.submitText);
              setSuccessMessage(form.successMessage);
              setThemeColor(form.themeColor);
              setBackgroundColor(form.backgroundColor);
              setFields(form.fields);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [formId, workspaceId, token, API_URL]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name,
        fields: fields.map((f, i) => ({ ...f, order: i })), // Enforce order
        defaultStatus,
        defaultAssigneeId: defaultAssigneeId === "" ? null : (typeof defaultAssigneeId === 'number' ? defaultAssigneeId : parseInt(defaultAssigneeId as string, 10)),
        submitText,
        successMessage,
        themeColor,
        backgroundColor
      };

      const method = formId ? "PUT" : "POST";
      const url = formId ? `${API_URL}/api/web-to-lead/${formId}` : `${API_URL}/api/web-to-lead`;
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString()
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const event = new CustomEvent('showToast', {
          detail: { message: "Form saved successfully", type: "success" }
        });
        window.dispatchEvent(event);
        onBack();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save form");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const removeField = (index: number) => {
    if (fields[index].key === 'contactName') return; // Cannot remove Contact Name
    setFields(fields.filter((_, i) => i !== index));
  };

  const addField = (key: string, label: string, type: string) => {
    if (fields.some(f => f.key === key)) return; // Prevent duplicates
    setFields([...fields, { key, label, type, required: false, order: fields.length }]);
  };

  if (loading) return <div className="p-8 text-[var(--gs-muted)] text-[13px] text-center">Loading builder...</div>;

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  const availableStandardFields = [
    { key: "phone", label: "Phone Number", type: "tel" },
    { key: "company", label: "Company Name", type: "text" },
    { key: "email", label: "Email Address", type: "email" },
  ].filter(f => !fields.some(existing => existing.key === f.key));

  const availableCustomFields = customFields
    .filter(cf => cf.entityType === 'LEAD' && !fields.some(existing => existing.key === cf.key));

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in -mx-6 -mt-6">
      
      {/* Builder Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--gs-border)] bg-[var(--gs-bg-alt)] sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-md hover:bg-[var(--gs-border)] text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border-none text-[18px] font-semibold text-[var(--gs-fg)] focus:outline-none focus:ring-0 p-0"
            placeholder="Form Name"
          />
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--gs-fg)] text-[var(--gs-bg)] hover:bg-[var(--gs-fg)]/90 px-4 py-2 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Form'}
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Column: Form Fields Builder */}
        <div className="w-[400px] border-r border-[var(--gs-border)] overflow-y-auto bg-[var(--gs-bg-alt)] p-6 flex flex-col gap-8 shrink-0">
          
          <div className="flex flex-col gap-4">
            <h3 className="text-[13px] font-bold text-[var(--gs-muted)] uppercase tracking-wide">Form Fields</h3>
            
            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <div key={field.key} className="flex items-center gap-3 p-3 bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-md group">
                  <GripVertical className="h-4 w-4 text-[var(--gs-muted)] cursor-grab opacity-50 group-hover:opacity-100" />
                  
                  <div className="flex-1 flex flex-col gap-2">
                    <input 
                      type="text" 
                      value={field.label}
                      onChange={(e) => {
                        const newFields = [...fields];
                        newFields[index].label = e.target.value;
                        setFields(newFields);
                      }}
                      className="bg-transparent text-[13px] text-[var(--gs-fg)] border-none p-0 focus:ring-0 focus:outline-none"
                    />
                    <label className="flex items-center gap-2 text-[11px] text-[var(--gs-muted)] cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={field.required}
                        disabled={field.key === 'contactName'} // Name is always required
                        onChange={(e) => {
                          const newFields = [...fields];
                          newFields[index].required = e.target.checked;
                          setFields(newFields);
                        }}
                        className="rounded border-[var(--gs-border)] bg-[var(--gs-bg)] text-[var(--gs-fg)] focus:ring-0"
                      />
                      Required
                    </label>
                  </div>

                  {field.key !== 'contactName' && (
                    <button 
                      onClick={() => removeField(index)}
                      className="p-1.5 text-[var(--gs-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Field Dropdown */}
            <div className="relative group/dropdown">
              <button className="w-full py-2 border border-dashed border-[var(--gs-border)] rounded-md text-[13px] text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:border-[var(--gs-fg)] transition-colors flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" />
                Add Field
              </button>
              
              <div className="absolute top-full left-0 w-full mt-2 bg-[#1A1A1A] border border-[var(--gs-border)] rounded-md shadow-xl overflow-hidden hidden group-hover/dropdown:block z-20 max-h-[300px] overflow-y-auto">
                <div className="px-3 py-2 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider bg-[#111]">Standard Fields</div>
                {availableStandardFields.map(f => (
                  <button key={f.key} onClick={() => addField(f.key, f.label, f.type)} className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--gs-fg)] hover:bg-[#222] transition-colors">
                    {f.label}
                  </button>
                ))}
                {availableStandardFields.length === 0 && <div className="px-4 py-2 text-[12px] text-[var(--gs-muted)]">All standard fields added</div>}

                {availableCustomFields.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-[11px] font-bold text-[var(--gs-muted)] uppercase tracking-wider bg-[#111] border-t border-[var(--gs-border)]">Custom Fields</div>
                    {availableCustomFields.map(cf => (
                      <button key={cf.key} onClick={() => addField(cf.key, cf.name, cf.type)} className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--gs-fg)] hover:bg-[#222] transition-colors">
                        {cf.name}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[13px] font-bold text-[var(--gs-muted)] uppercase tracking-wide">Submission Settings</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[var(--gs-muted)]">Submit Button Text</label>
              <input 
                type="text" 
                value={submitText}
                onChange={e => setSubmitText(e.target.value)}
                className="bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-md px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[var(--gs-muted)]">Success Message</label>
              <textarea 
                value={successMessage}
                onChange={e => setSuccessMessage(e.target.value)}
                rows={2}
                className="bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-md px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[13px] font-bold text-[var(--gs-muted)] uppercase tracking-wide">CRM Routing</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[var(--gs-muted)]">Default Lead Status</label>
              <select 
                value={defaultStatus}
                onChange={e => setDefaultStatus(e.target.value)}
                className="bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-md px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[var(--gs-muted)]">Default Assignee</label>
              <select 
                value={defaultAssigneeId}
                onChange={e => setDefaultAssigneeId(e.target.value === "" ? "" : Number(e.target.value))}
                className="bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-md px-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.userId} value={m.userId}>{m.user.name}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Right Column: Live Preview */}
        <div className="flex-1 bg-[#F5F5F5] overflow-y-auto p-12 flex flex-col items-center">
          
          <div className="mb-6 flex items-center justify-between w-full max-w-[500px]">
             <h3 className="text-[14px] font-bold text-gray-400 uppercase tracking-wide">Live Preview</h3>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500 font-medium">Button</span>
                  <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="w-6 h-6 rounded border-0 p-0 cursor-pointer" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500 font-medium">BG</span>
                  <input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="w-6 h-6 rounded border-0 p-0 cursor-pointer" />
                </div>
             </div>
          </div>

          <div 
            className="w-full max-w-[500px] p-8 rounded-xl shadow-xl transition-colors duration-300 pointer-events-none"
            style={{ backgroundColor }}
          >
            <form className="flex flex-col gap-5">
              {fields.map(field => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-medium" style={{ color: backgroundColor === '#000000' ? '#E5E5E5' : '#111827' }}>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea 
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-[14px] bg-white text-black shadow-sm"
                      rows={3}
                      placeholder={field.label}
                    />
                  ) : (
                    <input 
                      type={field.type === 'email' ? 'email' : 'text'}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-[14px] bg-white text-black shadow-sm"
                      placeholder={field.label}
                    />
                  )}
                </div>
              ))}
              <div className="pt-2">
                <button 
                  type="button" 
                  className="w-full rounded-md px-4 py-3 text-[14px] font-medium text-white shadow-sm transition-all"
                  style={{ backgroundColor: themeColor }}
                >
                  {submitText}
                </button>
              </div>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
