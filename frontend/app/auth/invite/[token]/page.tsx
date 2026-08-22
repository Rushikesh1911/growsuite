"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Command, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteDetails, setInviteDetails] = useState<{
    workspaceName: string;
    inviterName: string;
    email: string;
    role: string;
  } | null>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const authToken = localStorage.getItem("growsuite_token");
    const user = localStorage.getItem("growsuite_user");
    
    if (authToken && user) {
      setIsLoggedIn(true);
      try {
        const parsedUser = JSON.parse(user);
        setUserEmail(parsedUser.email);
      } catch (e) {}
    }

    // Fetch invitation details
    fetchInvitationDetails();
  }, [token]);

  const fetchInvitationDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/workspaces/invitations/${token}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Invalid or expired invitation");
        return;
      }
      
      setInviteDetails(data);
    } catch (err) {
      setError("Failed to fetch invitation details");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    const authToken = localStorage.getItem("growsuite_token");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/workspaces/invitations/${token}/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      const data = await res.json();

      if (res.ok) {
        // Set workspace as active and redirect
        localStorage.setItem("growsuite_workspace_id", data.workspaceId.toString());
        router.push("/dashboard");
      } else {
        setError(data.error || "Failed to accept invitation");
        setAccepting(false);
      }
    } catch (err) {
      setError("Network error occurred");
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    const authToken = localStorage.getItem("growsuite_token");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/workspaces/invitations/${token}/decline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard"); // Take them back to their own dashboard
      } else {
        setError(data.error || "Failed to decline invitation");
        setDeclining(false);
      }
    } catch (err) {
      setError("Network error occurred");
      setDeclining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#666666] animate-spin mb-4" />
        <p className="text-[#888888] text-[13px]">Verifying invitation...</p>
      </div>
    );
  }

  if (error || !inviteDetails) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#0A0A0A] border-[#222222] p-8 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#EDEDED] mb-2">Invitation Error</h2>
          <p className="text-[#888888] text-[14px] mb-8">{error}</p>
          <Link href="/auth/sign-in" className="bg-[#111111] hover:bg-[#222222] border border-[#333333] text-[#EDEDED] px-6 py-2.5 rounded-[6px] text-[14px] font-semibold transition-colors w-full">
            Go to Sign In
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#222222] rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1A1A1A] rounded-full blur-[120px] opacity-20 pointer-events-none" />

      {/* Brand Logo */}
      <div className="absolute top-8 left-8 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity z-10" onClick={() => router.push("/")}>
        <div className="h-8 w-8 bg-[#EDEDED] rounded-lg flex items-center justify-center">
          <Command className="h-4 w-4 text-[#000000]" />
        </div>
        <span className="text-lg font-bold text-[#EDEDED] tracking-tight">GrowSuite</span>
      </div>

      <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-500 z-10">
        
        <div className="flex flex-col mb-8 gap-2 items-center text-center">
          <div className="h-16 w-16 bg-[#111111] border border-[#333333] rounded-full flex items-center justify-center mb-2">
            <span className="text-xl font-bold text-[#EDEDED]">{inviteDetails.workspaceName.charAt(0)}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#EDEDED] tracking-tight">You've been invited!</h1>
          <p className="text-[14px] text-[#888888] mt-2">
            <strong>{inviteDetails.inviterName}</strong> invited you to join the <strong className="text-[#EDEDED]">{inviteDetails.workspaceName}</strong> workspace.
          </p>
        </div>

        <Card className="bg-[#0A0A0A] border-[#222222] p-8 shadow-2xl rounded-[12px] flex flex-col gap-6">
          
          <div className="bg-[#111111] border border-[#222222] rounded-[8px] p-4 flex flex-col gap-1">
            <span className="text-[11px] text-[#666666] uppercase font-bold tracking-wider">Invitation Details</span>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[14px] text-[#888888]">Workspace</span>
              <span className="text-[14px] font-medium text-[#EDEDED]">{inviteDetails.workspaceName}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[14px] text-[#888888]">Role</span>
              <span className="text-[14px] font-medium text-[#EDEDED]">{inviteDetails.role}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[14px] text-[#888888]">Invited Email</span>
              <span className="text-[14px] font-medium text-[#EDEDED]">{inviteDetails.email}</span>
            </div>
          </div>

          {!isLoggedIn ? (
            <div className="flex flex-col gap-4 mt-2">
              <p className="text-[13px] text-[#888888] text-center">You must create a GrowSuite account or sign in to accept this invitation.</p>
              
              <Link 
                href={`/auth/sign-up?redirect=/auth/invite/${token}&email=${encodeURIComponent(inviteDetails.email)}`}
                className="w-full bg-[#EDEDED] hover:bg-[#FFFFFF] text-[#000000] py-3 rounded-[6px] text-[14px] font-semibold transition-colors text-center"
              >
                Create Account to Accept
              </Link>
              
              <div className="text-center">
                <span className="text-[13px] text-[#666666]">Already have an account? </span>
                <Link 
                  href={`/auth/sign-in?redirect=/auth/invite/${token}`}
                  className="text-[13px] text-[#EDEDED] hover:underline font-medium"
                >
                  Sign in
                </Link>
              </div>
            </div>
          ) : userEmail?.toLowerCase() !== inviteDetails.email.toLowerCase() ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-[8px] p-4 text-center mt-2">
              <p className="text-[13px] text-red-500/90 mb-3">
                You are currently logged in as <strong>{userEmail}</strong>, but this invitation is for <strong>{inviteDetails.email}</strong>.
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem("growsuite_token");
                  localStorage.removeItem("growsuite_user");
                  window.location.reload();
                }}
                className="text-[13px] font-medium text-[#EDEDED] underline hover:text-white"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleDecline}
                disabled={accepting || declining}
                className="flex-1 bg-transparent hover:bg-[#1A1A1A] border border-[#333333] text-[#EDEDED] py-2.5 rounded-[6px] text-[13px] font-semibold transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {declining ? <Loader2 className="h-4 w-4 animate-spin" /> : "Decline"}
              </button>
              <button
                onClick={handleAccept}
                disabled={accepting || declining}
                className="flex-1 bg-[#EDEDED] hover:bg-[#FFFFFF] text-[#000000] py-2.5 rounded-[6px] text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept Invite"}
              </button>
            </div>
          )}

        </Card>
      </div>
    </div>
  );
}
