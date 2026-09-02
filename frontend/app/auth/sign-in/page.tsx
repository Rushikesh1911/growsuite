"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("growsuite_token", data.token);
        localStorage.setItem("growsuite_user", JSON.stringify(data.user));
        
        const storedRedirect = localStorage.getItem("growsuite_redirect");
        const finalRedirect = redirect || storedRedirect;
        if (storedRedirect) {
          localStorage.removeItem("growsuite_redirect");
        }
        
        if (finalRedirect) {
          router.push(finalRedirect);
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: tokenResponse.access_token }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("growsuite_token", data.token);
        localStorage.setItem("growsuite_user", JSON.stringify(data.user));
        
        const storedRedirect = localStorage.getItem("growsuite_redirect");
        const finalRedirect = redirect || storedRedirect;
        if (storedRedirect) {
          localStorage.removeItem("growsuite_redirect");
        }
        
        router.push(finalRedirect || "/dashboard");
      } else {
        setError(data.error || "Google login failed");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError("Google login failed"),
  });

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-4 selection:bg-[#EDEDED] selection:text-[#000000]">
      
      {/* Brand Logo */}
      <div className="absolute top-8 left-8">
        <Logo theme="dark" />
      </div>

      <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center mb-8 gap-2">
          <h1 className="text-2xl font-medium text-[#EDEDED] tracking-tight">Welcome back</h1>
          <p className="text-[14px] text-[#888888]">Enter your credentials to access your workspace</p>
        </div>

        <Card className="bg-[#0A0A0A] border-[#222222] p-8 shadow-2xl rounded-[12px]">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-medium text-[#888888]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-[#000000] border border-[#333333] rounded-[6px] pl-9 pr-4 py-2.5 text-[14px] text-[#EDEDED] focus:outline-none focus:border-[#666666] transition-colors placeholder:text-[#444444]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium text-[#888888]">Password</label>
                <Link href="/auth/forgot-password" className="text-[12px] font-medium text-[#666666] hover:text-[#EDEDED] transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-[#000000] border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-[#333333] focus:border-[#666666]'} rounded-[6px] pl-9 pr-4 py-2.5 text-[14px] text-[#EDEDED] focus:outline-none transition-colors placeholder:text-[#444444]`}
                />
              </div>
              {error && (
                <p className="text-[12px] text-red-500 font-medium mt-1">{error}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-[#EDEDED] hover:bg-[#FFFFFF] text-[#000000] rounded-[6px] py-2.5 px-4 text-[13px] font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Sign in <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
            
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-[#222222]"></div>
              <span className="text-[11px] text-[#666666] font-medium uppercase tracking-wider">Or continue with</span>
              <div className="flex-1 h-px bg-[#222222]"></div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="w-full bg-[#EDEDED] hover:bg-[#FFFFFF] text-[#000000] border border-[#EDEDED] rounded-[6px] py-2.5 px-4 text-[13px] font-medium flex items-center justify-center gap-2.5 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => alert("GitHub OAuth coming soon")}
                className="w-full bg-[#111111] hover:bg-[#1A1A1A] text-[#EDEDED] border border-[#333333] rounded-[6px] py-2.5 px-4 text-[13px] font-medium flex items-center justify-center gap-2.5 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                GitHub
              </button>
            </div>
          </form>
        </Card>
        
        <p className="text-center text-[13px] text-[#888888] mt-8">
          Don't have an account? <Link href={`/auth/sign-up${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="text-[#EDEDED] hover:underline font-medium">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#000000]" />}>
      <SignInContent />
    </Suspense>
  );
}
