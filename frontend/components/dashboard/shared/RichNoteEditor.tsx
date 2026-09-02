"use client";

import { useState, useEffect } from "react";
import { MentionsInput, Mention } from "react-mentions";

interface Suggestion {
  id: string | number;
  display: string;
}

interface RichNoteEditorProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
  submitting?: boolean;
}

export function RichNoteEditor({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Type a note... Use @ to tag someone.", 
  className = ""
}: RichNoteEditorProps) {
  const [users, setUsers] = useState<Suggestion[]>([]);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('growsuite_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const currentWorkspaceId = localStorage.getItem('growsuite_workspace_id') || '';
    
    fetch(`${API_URL}/api/workspaces/current`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'x-workspace-id': currentWorkspaceId
      }
    })
    .then(res => {
      if (res.ok) return res.json();
      return null;
    })
    .then(data => {
      if (data && data.members) {
        setUsers(data.members.map((m: any) => ({
          id: String(m.user.id),
          display: String(m.user.name || m.user.email.split('@')[0]),
        })));
      }
    })
    .catch(err => console.error("Failed to load workspace members for mentions", err));
  }, []);

  return (
    <div className={`relative ${className} rich-note-container`}>
      <style>{`
        .rich-note-container .gs-mentions-input__control {
          background-color: var(--gs-surface);
          border: 1px solid var(--gs-border);
          border-radius: 6px;
          min-height: 40px;
          font-size: 12px;
          color: transparent;
        }
        .rich-note-container .gs-mentions-input__control--focused {
          border-color: var(--gs-border-strong);
        }
        .rich-note-container .gs-mentions-input__input {
          padding: 10px 12px !important;
          color: var(--gs-fg) !important;
          outline: none !important;
          border: none !important;
          font-size: 12px;
        }
        .rich-note-container .gs-mentions-input__suggestions__list {
          background-color: var(--gs-surface);
          border: 1px solid var(--gs-border);
          font-size: 12px;
          border-radius: 6px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          overflow: hidden;
          margin-top: 4px;
        }
        .rich-note-container .gs-mentions-input__suggestions__item {
          padding: 8px 12px;
          border-bottom: 1px solid var(--gs-border);
          color: var(--gs-muted);
        }
        .rich-note-container .gs-mentions-input__suggestions__item--focused {
          background-color: var(--gs-bg-alt);
          color: var(--gs-fg);
        }
        .rich-note-container .gs-mentions-input__highlighter {
          padding: 10px 12px !important;
        }
      `}</style>
      
      <MentionsInput
        value={value || ""}
        onChange={(e, newValue) => onChange(newValue || "")}
        placeholder={placeholder}
        allowSpaceInQuery
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`gs-mentions-input ${focused ? 'gs-mentions-input--focused' : ''}`}
        onKeyDown={(e: any) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
      >
        <Mention
          trigger="@"
          markup="@[__display__](__id__)"
          data={users}
          displayTransform={(id, display) => `@${display}`}
          style={{
            backgroundColor: 'rgba(40, 202, 65, 0.15)', // Light green bg
            color: '#28CA41', // Brand green
            borderRadius: 4,
            padding: '2px 0px',
            marginLeft: -1,
            marginRight: -1,
          }}
          renderSuggestion={(suggestion, search, highlightedDisplay, index, focused) => (
            <div className={`text-[12px] transition-colors ${focused ? 'text-[var(--gs-fg)] font-semibold' : 'text-[var(--gs-muted)]'}`}>
              {highlightedDisplay}
            </div>
          )}
        />
      </MentionsInput>
    </div>
  );
}
