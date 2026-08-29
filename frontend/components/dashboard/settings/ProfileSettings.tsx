"use client";

import { useState, useEffect, useCallback } from "react";
import { FormSkeleton } from "@/components/ui/skeleton";
import { User, Briefcase, Mail } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ProfileSettingsProps {
  token: string;
}

export function ProfileSettings({ token }: ProfileSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [emailSignature, setEmailSignature] = useState("");
  const [phone, setPhone] = useState("");
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setName(data.name || "");
        setJobTitle(data.jobTitle || "");
        setEmailSignature(data.emailSignature || "");
        setPhone(data.phone || "");
        setHourlyRate(data.hourlyRate ? (data.hourlyRate / 100).toString() : "");
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name, 
          jobTitle, 
          emailSignature, 
          phone,
          hourlyRate: hourlyRate ? Math.round(parseFloat(hourlyRate) * 100) : null
        })
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Profile updated successfully", type: "success" } }));
      } else {
        const data = await res.json();
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: data.error || "Failed to update profile", type: "error" } }));
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Network error", type: "error" } }));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) return <FormSkeleton />;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-[16px] font-medium text-[var(--gs-fg)] mb-1">Public Profile</h2>
          <p className="text-[13px] text-[var(--gs-muted)]">Manage how you appear across GrowSuite and to your clients.</p>
        </div>

        {/* Readonly Email */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] uppercase text-[var(--gs-muted)] tracking-wide mb-1.5">Account Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gs-muted)]" />
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full bg-[#141414] border border-[#262626] rounded-md h-10 pl-9 pr-3 text-[14px] text-[var(--gs-muted)] cursor-not-allowed opacity-70"
            />
          </div>
          <p className="text-[11px] text-[var(--gs-muted)]">To change your email address, please contact support.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-[11px] uppercase text-[var(--gs-muted)] tracking-wide mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gs-muted)]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-[#141414] border border-[#262626] rounded-md h-10 pl-9 pr-3 text-[14px] text-[var(--gs-fg)] placeholder:text-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[12px] font-semibold text-[var(--gs-muted)]">Job Title</label>
            <input
              type="text"
              placeholder="e.g. Product Designer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] placeholder-[var(--gs-muted-light)] focus:outline-none focus:border-[var(--gs-fg)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[var(--gs-muted)]">Phone Number</label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--gs-fg)] placeholder-[var(--gs-muted-light)] focus:outline-none focus:border-[var(--gs-fg)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[var(--gs-muted)]">Hourly Rate</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--gs-muted)]">₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] px-3 pl-6 py-2 text-[13px] text-[var(--gs-fg)] placeholder-[var(--gs-muted-light)] focus:outline-none focus:border-[var(--gs-fg)]"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] uppercase text-[var(--gs-muted)] tracking-wide mb-1.5">Email Signature</label>
          <textarea
            value={emailSignature}
            onChange={(e) => setEmailSignature(e.target.value)}
            placeholder="Best regards,&#10;Your Name"
            rows={4}
            className="w-full bg-[#141414] border border-[#262626] rounded-md px-3 py-2 text-[14px] text-[var(--gs-fg)] placeholder:text-[var(--gs-muted)] focus:outline-none focus:border-[var(--gs-fg)] transition-colors resize-none"
          />
          <p className="text-[11px] text-[var(--gs-muted)]">Used on invoices, client emails and notifications.</p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[var(--gs-fg)] text-black px-4 py-2 rounded-md text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 outline-none"
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
