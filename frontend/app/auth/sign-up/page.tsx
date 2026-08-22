"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { Lock, Mail, User, ArrowRight, Loader2, Command } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const defaultEmail = searchParams.get("email");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.requireVerification) {
          setVerificationSent(true);
        } else {
          localStorage.setItem("growsuite_token", data.token);
          localStorage.setItem("growsuite_user", JSON.stringify(data.user));
          if (redirect) {
            router.push(redirect);
          } else {
            router.push("/dashboard/workspaces/new");
          }
        }
      } else {
        setError(data.error || "Failed to create account");
      }
    } catch (err) {
      setError("Network error occurred");
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
        if (redirect) {
          router.push(redirect);
        } else {
          router.push("/dashboard/workspaces/new");
        }
      } else {
        setError(data.error || "Google sign up failed");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError("Google sign up failed"),
  });

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-4 selection:bg-[#EDEDED] selection:text-[#000000]">
      
      {/* Brand Logo */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="h-8 w-8 bg-[#EDEDED] rounded-lg flex items-center justify-center">
          <Command className="h-4 w-4 text-[#000000]" />
        </div>
        <span className="text-lg font-bold text-[#EDEDED] tracking-tight">GrowSuite</span>
      </div>

      <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-full max-w-[400px] flex flex-col items-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#EDEDED] mb-2 text-center">
            {verificationSent ? "Check your inbox" : "Create an account"}
          </h1>
          <p className="text-[#A1A1AA] text-sm text-center mb-8">
            {verificationSent ? "We just sent a verification link to your email." : "Start scaling your business with GrowSuite"}
          </p>

          {verificationSent ? (
            <div className="w-full bg-[#111111] border border-[#222222] rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 bg-[#222222] rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#EDEDED]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-[#EDEDED] font-bold text-lg mb-2">Verify your email address</h3>
              <p className="text-[#A1A1AA] text-sm mb-6">
                Please click the link in the email we sent to <strong>{email}</strong> to activate your account.
              </p>
              <Link href="/auth/sign-in" className="text-sm font-medium text-[#EDEDED] hover:text-white transition-colors">
                Back to sign in
              </Link>
            </div>
          ) : (
            <Card className="bg-[#0A0A0A] border-[#222222] p-8 shadow-2xl rounded-[12px]">
              <form onSubmit={handleSignUp} className="flex flex-col gap-5">
                
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[#888888]">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-[#000000] border border-[#333333] rounded-[6px] pl-9 pr-4 py-2.5 text-[14px] text-[#EDEDED] focus:outline-none focus:border-[#666666] transition-colors placeholder:text-[#444444]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[#888888]">Email address</label>
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
                  <label className="text-[12px] font-medium text-[#888888]">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#000000] border border-[#333333] rounded-[6px] pl-9 pr-4 py-2.5 text-[14px] text-[#EDEDED] focus:outline-none focus:border-[#666666] transition-colors placeholder:text-[#444444]"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-[6px] p-3 text-center">
                    <p className="text-[12px] text-red-500 font-medium">{error}</p>
                  </div>
                )}
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => loginWithGoogle()}
                    className="w-full bg-[#EDEDED] hover:bg-[#FFFFFF] text-[#000000] border border-[#EDEDED] rounded-[6px] py-2.5 px-4 text-[13px] font-bold flex items-center justify-center gap-2.5 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full bg-[#EDEDED] hover:bg-[#FFFFFF] text-[#000000] rounded-[6px] py-2.5 px-4 text-[13px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Create account <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>
            </Card>
          )}
        </div>
        
        {!verificationSent && (
          <div className="text-center mt-8">
            <span className="text-[13px] text-[#888888]">Already have an account? </span>
            <Link 
              href={`/auth/sign-in${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
              className="text-[13px] text-[#EDEDED] hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#000000]" />}>
      <SignUpContent />
    </Suspense>
  );
}
