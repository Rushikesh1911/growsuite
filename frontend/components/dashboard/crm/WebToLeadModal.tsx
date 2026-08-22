import { X, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface WebToLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: number;
}

export function WebToLeadModal({ isOpen, onClose, workspaceId }: WebToLeadModalProps) {
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Create a base64 encoded token from workspaceId
      // In a real production app, use standard atob/btoa or a secure library
      setToken(btoa(workspaceId.toString()));
      setCopied(false);
    }
  }, [isOpen, workspaceId]);

  if (!isOpen) return null;

  const htmlSnippet = `<!-- GrowSuite Web-to-Lead Form -->
<form action="http://localhost:5000/api/leads/web" method="POST" style="max-w-md; font-family: sans-serif;">
  <input type="hidden" name="token" value="${token}" />
  <!-- Optional: Where to redirect the user after submission -->
  <input type="hidden" name="redirectUrl" value="https://yourwebsite.com/thank-you" />

  <div style="margin-bottom: 12px;">
    <label style="display: block; font-size: 14px; margin-bottom: 4px;">Name *</label>
    <input type="text" name="contactName" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
  </div>

  <div style="margin-bottom: 12px;">
    <label style="display: block; font-size: 14px; margin-bottom: 4px;">Email</label>
    <input type="email" name="email" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
  </div>

  <div style="margin-bottom: 12px;">
    <label style="display: block; font-size: 14px; margin-bottom: 4px;">Company</label>
    <input type="text" name="company" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
  </div>

  <button type="submit" style="background: #000; color: #fff; padding: 10px 16px; border: none; border-radius: 4px; cursor: pointer;">
    Submit
  </button>
</form>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(htmlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[12px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 shrink-0 border-b border-[var(--gs-border)] flex items-center justify-between bg-[var(--gs-surface)]">
          <h2 className="text-[18px] font-semibold text-[var(--gs-fg)]">Web-to-Lead Form</h2>
          <button onClick={onClose} className="text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors outline-none">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <p className="text-[13px] text-[var(--gs-muted)]">
            Copy and paste this HTML snippet into your website. Whenever a visitor submits this form, they will instantly appear in the <b>New</b> column of your Lead Pipeline.
          </p>
          
          <div className="relative group">
            <button 
              onClick={copyToClipboard}
              className="absolute top-3 right-3 p-1.5 bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[4px] text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Copy to clipboard"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
            <pre className="bg-[#111111] p-4 rounded-[8px] border border-[#333333] text-[12px] text-[#EDEDED] overflow-x-auto custom-scrollbar font-mono">
              <code>{htmlSnippet}</code>
            </pre>
          </div>

          <div className="bg-[#007CF0]/10 border border-[#007CF0]/20 rounded-[8px] p-3 mt-2">
            <h4 className="text-[12px] font-semibold text-[#007CF0] mb-1">Developer Tip</h4>
            <p className="text-[11px] text-[#007CF0]/80">
              You can style the form however you like using CSS. Just ensure the <code>name</code> attributes (contactName, email, company) and the hidden <code>token</code> input remain intact.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
