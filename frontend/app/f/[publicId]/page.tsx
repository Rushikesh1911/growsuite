"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function PublicFormPage() {
  const params = useParams();
  const publicId = params.publicId as string;
  
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [honeypot, setHoneypot] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/api/web-to-lead/public/${publicId}`);
        if (!res.ok) {
          setError("Form not found");
          return;
        }
        const data = await res.json();
        
        // Ensure standard keys exist to avoid uncontrolled components
        const initialData: Record<string, any> = {};
        data.fields.forEach((f: any) => {
          initialData[f.key] = "";
        });
        setFormData(initialData);
        setConfig(data);
      } catch (e) {
        setError("Failed to load form");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [publicId, API_URL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/web-to-lead/public/${publicId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: formData,
          honeypot
        })
      });

      const result = await res.json();

      if (res.ok) {
        setSubmitted(true);
        setSuccessMessage(result.message || "Thank you!");
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
    } catch (e) {
      setError("Network error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 text-sm font-sans">Loading form...</div>;
  }

  if (error && !config) {
    return <div className="p-8 text-center text-red-500 text-sm font-sans">{error}</div>;
  }

  const { fields, submitText, themeColor, backgroundColor } = config;
  const isDarkBg = backgroundColor === "#000000" || backgroundColor === "#1A1A1A";
  const labelColor = isDarkBg ? "#E5E5E5" : "#111827";

  if (submitted) {
    return (
      <div 
        className="min-h-screen w-full flex flex-col items-center justify-center p-8 font-sans transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="flex flex-col items-center text-center max-w-md animate-in fade-in zoom-in duration-500">
          <CheckCircle2 className="w-16 h-16 mb-4" style={{ color: themeColor }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: labelColor }}>Success!</h2>
          <p style={{ color: isDarkBg ? "#A3A3A3" : "#4B5563" }}>
            {successMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full flex flex-col font-sans transition-colors duration-300"
      style={{ backgroundColor }}
    >
      <div className="w-full max-w-md mx-auto p-8">
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {fields.map((field: any) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label 
                className="text-[14px] font-medium" 
                style={{ color: labelColor }}
              >
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea 
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-[14px] bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
                  style={{ '--tw-ring-color': themeColor } as any}
                  rows={3}
                  required={field.required}
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  placeholder={field.label}
                />
              ) : (
                <input 
                  type={field.type === 'email' ? 'email' : 'text'}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-[14px] bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
                  style={{ '--tw-ring-color': themeColor } as any}
                  required={field.required}
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  placeholder={field.label}
                />
              )}
            </div>
          ))}

          {/* Honeypot Field - Hidden from real users */}
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden="true">
            <label htmlFor="website_url_check">Do not fill this out</label>
            <input 
              type="text" 
              id="website_url_check" 
              name="website_url_check" 
              tabIndex={-1} 
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full rounded-md px-4 py-3 text-[15px] font-medium text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: themeColor }}
            >
              {submitting ? 'Submitting...' : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
