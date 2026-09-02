"use client";

import { useState, useEffect, useCallback } from "react";
import { FormSkeleton } from "@/components/ui/skeleton";
import { PopoverSelect } from "@/components/ui/popover-select";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface PreferencesSettingsProps {
  token: string;
}

export function PreferencesSettings({ token }: PreferencesSettingsProps) {
  const [loading, setLoading] = useState(true);
  
  const [themePreference, setThemePreference] = useState("system");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  
  // Basic notification toggles mapped to JSON
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    taskReminders: true,
    invoiceUpdates: true,
    projectChanges: true,
  });

  const [hideTimer, setHideTimer] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setThemePreference(data.themePreference || "system");
        setTimezone(data.timezone || "Asia/Kolkata");
        setDateFormat(data.dateFormat || "DD/MM/YYYY");
        if (data.notificationPreferences) {
          setNotifications({ ...notifications, ...data.notificationPreferences });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPreferences();
    setHideTimer(localStorage.getItem('growsuite_hide_timer') === 'true');
  }, [fetchPreferences]);

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
          themePreference, 
          timezone, 
          dateFormat, 
          notificationPreferences: notifications 
        })
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Preferences saved successfully", type: "success" } }));
      } else {
        const data = await res.json();
        window.dispatchEvent(new CustomEvent("showToast", { detail: { message: data.error || "Failed to save preferences", type: "error" } }));
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Network error", type: "error" } }));
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTimer = () => {
    const newVal = !hideTimer;
    setHideTimer(newVal);
    localStorage.setItem('growsuite_hide_timer', newVal ? 'true' : 'false');
    window.dispatchEvent(new Event('hideTimerChanged'));
  };

  if (loading) return <FormSkeleton />;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 flex flex-col gap-8">
        <div>
          <h2 className="text-[16px] font-medium text-[var(--gs-fg)] mb-1">Preferences</h2>
          <p className="text-[13px] text-[var(--gs-muted)]">Customize your GrowSuite experience.</p>
        </div>

        {/* Localization */}
        <div className="flex flex-col gap-5">
          <h3 className="text-[14px] font-medium text-[var(--gs-fg)] border-b border-[#262626] pb-2">Localization</h3>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[11px] uppercase text-[var(--gs-muted)] tracking-wide mb-1.5">Timezone</label>
              <PopoverSelect
                value={timezone}
                onChange={(val) => setTimezone(val)}
                options={[
                  { label: "India Standard Time (IST)", value: "Asia/Kolkata" },
                  { label: "Pacific Time (PT)", value: "America/Los_Angeles" },
                  { label: "Eastern Time (ET)", value: "America/New_York" },
                  { label: "Coordinated Universal Time (UTC)", value: "UTC" }
                ]}
                placeholder="Select timezone..."
              />
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[11px] uppercase text-[var(--gs-muted)] tracking-wide mb-1.5">Date Format</label>
              <PopoverSelect
                value={dateFormat}
                onChange={(val) => setDateFormat(val)}
                options={[
                  { label: "DD/MM/YYYY (31/12/2026)", value: "DD/MM/YYYY" },
                  { label: "MM/DD/YYYY (12/31/2026)", value: "MM/DD/YYYY" },
                  { label: "YYYY-MM-DD (2026-12-31)", value: "YYYY-MM-DD" }
                ]}
                placeholder="Select format..."
              />
            </div>
          </div>
        </div>

        {/* UI Preferences */}
        <div className="flex flex-col gap-5">
          <h3 className="text-[14px] font-medium text-[var(--gs-fg)] border-b border-[#262626] pb-2">Interface</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <button
                type="button"
                role="switch"
                aria-checked={hideTimer}
                onClick={toggleTimer}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none outline-none mt-0.5 ${hideTimer ? 'bg-[var(--gs-fg)]' : 'bg-[#262626]'}`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${hideTimer ? 'translate-x-5 bg-[#141414]' : 'translate-x-0 bg-white'}`}
                />
              </button>
              <div className="flex flex-col">
                <span className="text-[14px] font-medium text-[var(--gs-fg)]">Hide Floating Timer</span>
                <span className="text-[13px] text-[var(--gs-muted)]">Hide the floating time tracker widget from the bottom right corner.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex flex-col gap-5">
          <h3 className="text-[14px] font-medium text-[var(--gs-fg)] border-b border-[#262626] pb-2">Notifications</h3>
          
          <div className="flex flex-col gap-4">
            {[
              { id: "emailAlerts", label: "Email Alerts", desc: "Receive important system alerts via email." },
              { id: "taskReminders", label: "Task Reminders", desc: <>Get notified before tasks are due. <span className="text-[var(--gs-fg)] hover:underline cursor-pointer">Manage in Notifications →</span></> },
              { id: "invoiceUpdates", label: "Invoice Updates", desc: "Receive updates when invoices are paid." },
              { id: "projectChanges", label: "Project Changes", desc: "Get notified when project statuses change." }
            ].map((item) => {
              const isChecked = notifications[item.id as keyof typeof notifications];
              return (
                <div key={item.id} className="flex items-start gap-4">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isChecked}
                    onClick={() => toggleNotification(item.id as keyof typeof notifications)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none outline-none mt-0.5 ${isChecked ? 'bg-[var(--gs-fg)]' : 'bg-[#262626]'}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${isChecked ? 'translate-x-5 bg-[#141414]' : 'translate-x-0 bg-white'}`}
                    />
                  </button>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-[var(--gs-fg)]">{item.label}</span>
                    <span className="text-[13px] text-[var(--gs-muted)]">{item.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[var(--gs-fg)] text-black px-4 py-2 rounded-md text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 outline-none"
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </button>
        </div>

      </div>
    </div>
  );
}
