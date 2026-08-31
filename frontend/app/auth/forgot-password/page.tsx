"use client";

import { useState } from "react";
import { Mail, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to request password reset");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-4 selection:bg-[#EDEDED] selection:text-[#000000]">
      
      {/* Brand Logo */}
      <div className="absolute top-8 left-8">
        <Logo theme="dark" />
      </div>

      <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center mb-8 gap-2">
          <h1 className="text-2xl font-medium text-[#EDEDED] tracking-tight">Forgot password?</h1>
          <p className="text-[14px] text-[#888888]">Enter your email to receive a reset link</p>
        </div>

        <Card className="bg-[#0A0A0A] border-[#222222] p-8 shadow-2xl rounded-[12px]">
          {success ? (
            <div className="flex flex-col gap-6 text-center">
              <div className="h-12 w-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-2">
                <Mail className="h-5 w-5 text-green-500" />
              </div>
              <h2 className="text-[16px] font-medium text-[#EDEDED]">Check your inbox</h2>
              <p className="text-[14px] text-[#888888]">
                If an account exists for <span className="text-[#EDEDED] font-medium">{email}</span>, we've sent instructions to reset your password.
              </p>
              <Link href="/auth/sign-in" className="mt-2 text-[13px] font-semibold text-[#EDEDED] flex items-center justify-center gap-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                    className={`w-full bg-[#000000] border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-[#333333] focus:border-[#666666]'} rounded-[6px] pl-9 pr-4 py-2.5 text-[14px] text-[#EDEDED] focus:outline-none transition-colors placeholder:text-[#444444]`}
                  />
                </div>
                {error && (
                  <p className="text-[12px] text-red-500 font-medium mt-1">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-[#EDEDED] hover:bg-white text-[#000000] py-2.5 rounded-[6px] text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
              
              <Link href="/auth/sign-in" className="mt-2 text-[13px] font-medium text-[#666666] flex items-center justify-center gap-2 hover:text-[#EDEDED] transition-colors">
                <ArrowLeft className="h-3 w-3" />
                Back to sign in
              </Link>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
