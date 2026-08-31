"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/verify?token=${token}`, {
          method: "GET",
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("Email verified successfully! You can now sign in.");
          // Optional: redirect to login after a few seconds
          setTimeout(() => {
            router.push("/auth/sign-in");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to verify email.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Network error. Please try again later.");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="w-full max-w-[400px] bg-[#0A0A0A] border border-[#222222] rounded-xl p-8 flex flex-col items-center text-center shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {status === "loading" && (
        <>
          <Loader2 className="w-12 h-12 text-[#EDEDED] animate-spin mb-6" />
          <h1 className="text-2xl font-bold text-[#EDEDED] mb-2">Verifying Email</h1>
          <p className="text-sm text-[#A1A1AA]">Please wait while we verify your email address...</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="w-12 h-12 text-green-500 mb-6 animate-in zoom-in" />
          <h1 className="text-2xl font-bold text-[#EDEDED] mb-2">Email Verified!</h1>
          <p className="text-sm text-[#A1A1AA] mb-6">{message}</p>
          <Link 
            href="/auth/sign-in" 
            className="w-full bg-[#EDEDED] hover:bg-[#FFFFFF] text-[#000000] rounded-[6px] py-2.5 px-4 text-[13px] font-bold flex items-center justify-center transition-all"
          >
            Go to Sign In
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="w-12 h-12 text-red-500 mb-6 animate-in zoom-in" />
          <h1 className="text-2xl font-bold text-[#EDEDED] mb-2">Verification Failed</h1>
          <p className="text-sm text-[#A1A1AA] mb-6">{message}</p>
          <Link 
            href="/auth/sign-in" 
            className="w-full border border-[#333333] hover:bg-[#111111] text-[#EDEDED] rounded-[6px] py-2.5 px-4 text-[13px] font-bold flex items-center justify-center transition-all"
          >
            Back to Sign In
          </Link>
        </>
      )}
      
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-4 selection:bg-[#EDEDED] selection:text-[#000000]">
      {/* Brand Logo */}
      <div className="absolute top-8 left-8">
        <Logo theme="dark" />
      </div>

      <Suspense fallback={
        <div className="w-full max-w-[400px] bg-[#0A0A0A] border border-[#222222] rounded-xl p-8 flex flex-col items-center text-center shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Loader2 className="w-12 h-12 text-[#EDEDED] animate-spin mb-6" />
          <h1 className="text-2xl font-bold text-[#EDEDED] mb-2">Loading...</h1>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
