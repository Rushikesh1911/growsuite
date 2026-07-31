"use client";

import { useEffect, useState, useCallback } from "react";

interface User {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
}

interface HealthStatus {
  status: string;
  database: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [backendStatus, setBackendStatus] = useState<"Online" | "Offline" | "Checking">("Checking");
  const [dbStatus, setDbStatus] = useState<"Connected" | "Disconnected" | "Checking">("Checking");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Form State
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (res.ok) {
        const data: HealthStatus = await res.json();
        setBackendStatus("Online");
        setDbStatus(data.database === "Connected" ? "Connected" : "Disconnected");
      } else {
        setBackendStatus("Offline");
        setDbStatus("Disconnected");
      }
    } catch (err) {
      setBackendStatus("Offline");
      setDbStatus("Disconnected");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API_URL}/users`);
      if (res.ok) {
        const data: User[] = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([checkHealth(), fetchUsers()]);
    setTimeout(() => setRefreshing(false), 600); // smooth animation timing
  };

  useEffect(() => {
    checkHealth();
    fetchUsers();
  }, [checkHealth, fetchUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!email) {
      setFormError("Email is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();

      if (res.ok) {
        setFormSuccess(`User ${data.email} successfully created!`);
        setEmail("");
        setName("");
        fetchUsers();
      } else {
        setFormError(data.error || "Failed to create user");
      }
    } catch (err) {
      setFormError("Connection to backend server failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-x-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 z-10 flex flex-col flex-1 gap-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="h-6 w-6 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                GrowSuite Dashboard
              </h1>
              <p className="text-xs text-zinc-400 font-medium">Control Center & System Monitor</p>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 active:scale-95 text-sm font-medium transition-all duration-200 disabled:opacity-50"
          >
            <svg
              className={`h-4 w-4 text-emerald-400 ${refreshing ? "animate-spin" : "transition-transform duration-300 group-hover:rotate-180"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.235" />
            </svg>
            Refresh Diagnostics
          </button>
        </header>

        {/* Diagnostic Status Bar */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Frontend Status */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-850 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">Next.js Frontend</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold">Online</span>
                <span className="text-xs text-zinc-400 font-normal">(Port 3000)</span>
              </div>
            </div>
          </div>

          {/* Backend Status */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-850 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${backendStatus === "Online" ? "bg-emerald-500/10 text-emerald-400" : backendStatus === "Offline" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"}`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">Express Backend</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`h-2 w-2 rounded-full ${backendStatus === "Online" ? "bg-emerald-500" : backendStatus === "Offline" ? "bg-rose-500" : "bg-amber-500 animate-pulse"}`} />
                <span className="text-sm font-bold">{backendStatus}</span>
                <span className="text-xs text-zinc-400 font-normal">(Port 5000)</span>
              </div>
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-850 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${dbStatus === "Connected" ? "bg-emerald-500/10 text-emerald-400" : dbStatus === "Disconnected" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"}`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">PostgreSQL Database</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`h-2 w-2 rounded-full ${dbStatus === "Connected" ? "bg-emerald-500" : dbStatus === "Disconnected" ? "bg-rose-500" : "bg-amber-500 animate-pulse"}`} />
                <span className="text-sm font-bold">{dbStatus}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Content Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Creation Form Panel */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-zinc-900/50 backdrop-blur-lg border border-zinc-800/80 p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Register New User
                </h2>
                <p className="text-sm text-zinc-400 mt-1">Insert a new user record into the PostgreSQL database.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name-input" className="text-xs font-semibold text-zinc-400">Full Name</label>
                  <input
                    id="name-input"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email-input" className="text-xs font-semibold text-zinc-400">Email Address <span className="text-emerald-500">*</span></label>
                  <input
                    id="email-input"
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all duration-200"
                  />
                </div>

                {formError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {formError}
                  </div>
                )}

                {formSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 text-sm mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-zinc-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    "Register User"
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* User List Panel */}
          <section className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-zinc-900/50 backdrop-blur-lg border border-zinc-800/80 p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col gap-6 flex-1 min-h-[400px]">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Database Registry
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">Real-time listing of records inside `User` table.</p>
                </div>
                <span className="px-2.5 py-1 bg-zinc-950/60 border border-zinc-800 rounded-full text-xs font-semibold text-zinc-400">
                  {users.length} {users.length === 1 ? "user" : "users"}
                </span>
              </div>

              {loadingUsers ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-3 py-12">
                  <svg className="animate-spin h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-sm text-zinc-500 font-medium">Fetching database records...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 border border-dashed border-zinc-800 rounded-xl p-8 text-center bg-zinc-950/20">
                  <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-300">No Registry Data Found</h3>
                  <p className="text-xs text-zinc-500 max-w-[240px] mt-1 mx-auto">There are no records in the User table. Register a new user on the left to start seeing data here.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[460px] pr-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="bg-zinc-950/40 hover:bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/60 p-4 rounded-xl flex items-center justify-between gap-4 transition-all duration-200 group shadow-inner"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all">
                          #{user.id}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">
                            {user.name || "Anonymous User"}
                          </p>
                          <p className="text-xs text-zinc-400 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-500 font-semibold tracking-wide uppercase">Registered</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {new Date(user.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-xs text-zinc-600 border-t border-zinc-900 z-10 mt-auto bg-zinc-950/60 backdrop-blur-sm">
        GrowSuite Diagnostics System &copy; {new Date().getFullYear()} &middot; Powered by Next.js &amp; Prisma
      </footer>
    </div>
  );
}
