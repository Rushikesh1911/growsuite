import React from 'react';

export interface CustomFieldDef {
  id: number;
  entityType: string;
  name: string;
  key: string;
  type: string;
  options: string[] | null;
  required: boolean;
}

export function CustomFieldForm({ 
  fields, 
  values, 
  onChange 
}: { 
  fields: CustomFieldDef[], 
  values: any, 
  onChange: (key: string, value: any) => void 
}) {
  if (!fields || fields.length === 0) return null;

  return (
    <div className="space-y-4 border-t border-[var(--gs-border)] pt-4 mt-4">
      <h3 className="text-sm font-medium text-[var(--gs-fg)]">Custom Fields</h3>
      {fields.map(field => {
        const val = values[field.key] || '';
        
        return (
          <div key={field.id}>
            <label className="block text-xs font-medium text-[var(--gs-text-muted)] mb-1">
              {field.name} {field.required && <span className="text-red-500">*</span>}
            </label>
            
            {field.type === 'textarea' ? (
              <textarea
                value={val}
                required={field.required}
                onChange={e => onChange(field.key, e.target.value)}
                className="w-full bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[8px] px-3 py-2 text-sm text-[var(--gs-fg)] focus:border-indigo-500 outline-none transition-colors"
                rows={3}
              />
            ) : field.type === 'dropdown' ? (
              <select
                value={val}
                required={field.required}
                onChange={e => onChange(field.key, e.target.value)}
                className="w-full bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[8px] px-3 py-2 text-sm text-[var(--gs-fg)] focus:border-indigo-500 outline-none transition-colors"
              >
                <option value="">Select {field.name}</option>
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                value={val}
                required={field.required}
                onChange={e => onChange(field.key, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                className="w-full bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[8px] px-3 py-2 text-sm text-[var(--gs-fg)] focus:border-indigo-500 outline-none transition-colors"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function CustomFieldDisplay({ fields, values }: { fields: CustomFieldDef[], values: any }) {
  if (!fields || fields.length === 0 || !values) return null;

  const fieldsWithValue = fields.filter(f => values[f.key] !== undefined && values[f.key] !== null && values[f.key] !== '');
  if (fieldsWithValue.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-4 bg-[var(--gs-bg-alt)] rounded-[12px] border border-[var(--gs-border)]">
      {fieldsWithValue.map(field => (
        <div key={field.id}>
          <div className="text-xs text-[var(--gs-text-muted)] mb-1">{field.name}</div>
          <div className="text-sm text-[var(--gs-fg)] break-words">
            {field.type === 'date' && values[field.key] 
              ? new Date(values[field.key]).toLocaleDateString() 
              : String(values[field.key])}
          </div>
        </div>
      ))}
    </div>
  );
}
