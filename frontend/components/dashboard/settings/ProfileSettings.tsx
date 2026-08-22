"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Mail, Save, Lock, Layout, ChevronRight, Briefcase, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FormSkeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/ui/image-upload";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ProfileSettingsProps {
  token: string;
}

export function ProfileSettings({ token }: ProfileSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: number; email: string; name: string | null; jobTitle: string | null; emailSignature: string | null; avatarUrl?: string | null; hasGoogleCalendar?: boolean } | null>(null);
  
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [emailSignature, setEmailSignature] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Check if user has connected Google Calendar (derive from presence of tokens, which we could return as a boolean `hasGoogleCalendar`)
        // Let's assume the API doesn't return the raw tokens but we can deduce it, wait, let's fetch it or just check a flag if available. For now we will check a flag.
        setUser(data);
        setName(data.name || "");
        setJobTitle(data.jobTitle || "");
        setEmailSignature(data.emailSignature || "");
        setIsDirty(false);
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

  useEffect(() => {
    if (user) {
      const nameChanged = name !== (user.name || "");
      const jobTitleChanged = jobTitle !== (user.jobTitle || "");
      const signatureChanged = emailSignature !== (user.emailSignature || "");
      setIsDirty(nameChanged || jobTitleChanged || signatureChanged);
    }
  }, [name, jobTitle, emailSignature, user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, jobTitle, emailSignature })
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setIsDirty(false);
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Profile updated successfully!", type: "success" } }));
      } else {
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Failed to update profile", type: "error" } }));
      }
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "An error occurred while saving", type: "error" } }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      const res = await fetch(`${API_URL}/api/google/login`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Failed to connect to Google", type: "error" } }));
    }
  };

  const handleGoogleDisconnect = async () => {
    try {
      const res = await fetch(`${API_URL}/api/google/disconnect`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUser(prev => prev ? { ...prev, hasGoogleCalendar: false } : null);
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Google account disconnected", type: "success" } }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) {
    return <FormSkeleton />;
  }

  const userInitials = (name || user.email).substring(0, 2).toUpperCase();

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 animate-fade pb-12">
      
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-[var(--gs-border)] pb-6">
        <h1 className="text-2xl font-bold text-[var(--gs-fg)] tracking-tight">Personal Profile</h1>
        <p className="text-[14px] text-[var(--gs-muted)]">Manage your personal information and preferences.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 p-6 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[10px]">
          <ImageUpload
            token={token}
            endpoint="/api/uploads/avatar"
            currentImageUrl={user.avatarUrl}
            onUploadSuccess={(url) => {
              setUser(prev => prev ? { ...prev, avatarUrl: url } : null);
              window.dispatchEvent(new CustomEvent('userUpdated'));
            }}
          />
          <div className="flex flex-col gap-1">
            <h3 className="text-[15px] font-bold text-[var(--gs-fg)]">Profile Picture</h3>
            <p className="text-[12px] text-[var(--gs-muted)] max-w-sm">
              Upload a picture to make your profile stand out across workspaces.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex flex-col p-6 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[10px] gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-[15px] font-bold text-[var(--gs-fg)]">Basic Information</h3>
            <p className="text-[12px] text-[var(--gs-muted)]">This information will be displayed to other members in your workspaces.</p>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-[12px] font-semibold text-[var(--gs-fg)]">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gs-muted)]" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rushikesh"
                  className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] pl-10 pr-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)] transition-all"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="jobTitle" className="text-[12px] font-semibold text-[var(--gs-fg)]">Job Title <span className="text-[var(--gs-muted)] font-normal">(Optional)</span></label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gs-muted)]" />
                <input
                  id="jobTitle"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Founder, Sales Executive"
                  className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] pl-10 pr-3 py-2 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)] transition-all"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="email" className="text-[12px] font-semibold text-[var(--gs-fg)]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gs-muted)]" />
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[6px] pl-10 pr-3 py-2 text-[13px] text-[var(--gs-muted)] opacity-70 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-[var(--gs-muted)]">Your email address is used for login and cannot be changed.</p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="emailSignature" className="text-[12px] font-semibold text-[var(--gs-fg)]">Email Signature <span className="text-[var(--gs-muted)] font-normal">(Optional)</span></label>
              <p className="text-[11px] text-[var(--gs-muted)] mb-1">This signature will be appended to outreach emails sent from the CRM.</p>
              <textarea
                id="emailSignature"
                value={emailSignature}
                onChange={(e) => setEmailSignature(e.target.value)}
                placeholder="Regards,&#10;Rushikesh&#10;Acme Studio"
                className="w-full bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[6px] p-3 text-[13px] text-[var(--gs-fg)] focus:outline-none focus:border-[var(--gs-border-strong)] transition-all min-h-[100px] resize-y"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--gs-border)] mt-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !isDirty || !name.trim()}
              className="flex items-center justify-center gap-2 h-9 px-6 bg-[var(--gs-fg)] hover:opacity-90 text-[var(--gs-bg)] font-semibold text-[13px] rounded-[6px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Security & Preferences */}
        <div className="flex flex-col bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[10px]">
          <button className="flex items-center gap-4 p-5 border-b border-[var(--gs-border)] hover:bg-[var(--gs-bg-alt)] transition-colors rounded-t-[10px] group outline-none">
            <div className="h-9 w-9 rounded-[6px] bg-[var(--gs-bg)] flex items-center justify-center border border-[var(--gs-border)] group-hover:border-[var(--gs-border-strong)] transition-colors">
              <Lock className="h-4 w-4 text-[var(--gs-muted)] group-hover:text-[var(--gs-fg)] transition-colors" />
            </div>
            <div className="flex flex-col items-start flex-1">
              <span className="text-[14px] font-bold text-[var(--gs-fg)]">Password & Security</span>
              <span className="text-[13px] text-[var(--gs-muted)] mt-0.5">Change your password and manage active sessions</span>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--gs-muted)] group-hover:text-[var(--gs-fg)] transition-colors" />
          </button>
          
          <button className="flex items-center gap-4 p-5 hover:bg-[var(--gs-bg-alt)] transition-colors rounded-b-[10px] group outline-none">
            <div className="h-9 w-9 rounded-[6px] bg-[var(--gs-bg)] flex items-center justify-center border border-[var(--gs-border)] group-hover:border-[var(--gs-border-strong)] transition-colors">
              <Layout className="h-4 w-4 text-[var(--gs-muted)] group-hover:text-[var(--gs-fg)] transition-colors" />
            </div>
            <div className="flex flex-col items-start flex-1">
              <span className="text-[14px] font-bold text-[var(--gs-fg)]">Personal Preferences</span>
              <span className="text-[13px] text-[var(--gs-muted)] mt-0.5">Appearance, notifications, and language settings</span>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--gs-muted)] group-hover:text-[var(--gs-fg)] transition-colors" />
          </button>
        </div>

        {/* Integrations */}
        <div className="flex flex-col p-6 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[10px] gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-[15px] font-bold text-[var(--gs-fg)]">Integrations</h3>
            <p className="text-[12px] text-[var(--gs-muted)]">Connect external services to enhance your CRM experience.</p>
          </div>

          <div className="flex items-center justify-between p-4 border border-[var(--gs-border)] rounded-[8px] bg-[var(--gs-bg)]">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-[6px] bg-[#FFFFFF] flex items-center justify-center border border-[var(--gs-border)] shrink-0">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[var(--gs-fg)]">Google Calendar</span>
                <span className="text-[12px] text-[var(--gs-muted)] mt-0.5">Automatically sync your assigned Tasks with due dates to your calendar.</span>
              </div>
            </div>
            
            {user.hasGoogleCalendar ? (
              <button onClick={handleGoogleDisconnect} className="h-8 px-4 border border-[#FF3333]/20 bg-[#FF3333]/10 text-[#FF3333] hover:bg-[#FF3333]/20 font-semibold text-[12px] rounded-[6px] transition-colors shrink-0">
                Disconnect
              </button>
            ) : (
              <button onClick={handleGoogleConnect} className="h-8 px-4 bg-[#FFFFFF] hover:bg-[#F4F4F5] text-[#000000] border border-[#E4E4E7] font-semibold text-[12px] rounded-[6px] transition-colors shrink-0">
                Connect Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
