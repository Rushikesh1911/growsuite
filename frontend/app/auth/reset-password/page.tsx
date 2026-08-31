"use client";

import { useState, Suspense } from "react";
import { Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/sign-in");
        }, 3000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-[14px] text-red-500 font-medium">Invalid or missing reset token.</p>
        <Link href="/auth/forgot-password" className="text-[13px] font-semibold text-[#EDEDED] hover:opacity-80 transition-opacity">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center text-center mb-8 gap-2">
        <h1 className="text-2xl font-medium text-[#EDEDED] tracking-tight">Set new password</h1>
        <p className="text-[14px] text-[#888888]">Choose a strong password for your account</p>
      </div>

      <Card className="bg-[#0A0A0A] border-[#222222] p-8 shadow-2xl rounded-[12px]">
        {success ? (
          <div className="flex flex-col gap-6 text-center">
            <div className="h-12 w-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <h2 className="text-[16px] font-medium text-[#EDEDED]">Password updated!</h2>
            <p className="text-[14px] text-[#888888]">
              Your password has been reset successfully. Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-medium text-[#888888]">New Password</label>
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
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-medium text-[#888888]">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              disabled={loading || !password || !confirmPassword}
              className="w-full bg-[#EDEDED] hover:bg-white text-[#000000] py-2.5 rounded-[6px] text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}
      </Card>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-4 selection:bg-[#EDEDED] selection:text-[#000000]">
      
      {/* Brand Logo */}
      <div className="absolute top-8 left-8">
        <Logo theme="dark" />
      </div>

      <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#666]" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
