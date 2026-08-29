"use client";

import { useState } from "react";
import { LifeBuoy, Book, MessageSquare, Ticket, ChevronDown, ChevronUp, Send, CheckCircle2, Search, Code, PlayCircle, ExternalLink, Activity } from "lucide-react";

interface SupportDashboardProps {
  token: string;
}

export function SupportDashboard({ token }: SupportDashboardProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const faqs = [
    {
      q: "How do I invite team members?",
      a: "Go to Settings > Team Members, and click the 'Invite Member' button in the top right. Enter their email address and select whether they should have Member or Admin access."
    },
    {
      q: "Can I connect my own Razorpay account?",
      a: "Yes! In Settings > Integrations, you can paste your Razorpay Key ID and Key Secret to allow clients to pay invoices directly via your gateway."
    },
    {
      q: "How are usage limits calculated?",
      a: "Usage is calculated based on the number of active entities in your workspace. Deleting a project or client will immediately free up space in your quota."
    }
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTicketSubject("");
      setTicketMessage("");
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1200);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-10 animate-fade pb-20">
      
      {/* Hero Header */}
      <div className="flex flex-col gap-6 py-8 border-b border-[#222222] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-[-50%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="flex flex-col gap-2 max-w-xl">
            <h1 className="text-3xl font-bold text-[#EDEDED] tracking-tight">How can we help?</h1>
            <p className="text-[15px] text-[#888888] leading-relaxed">Search our knowledge base or submit a request. Our specialized support team is ready to assist you.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full self-start md:self-end mb-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[12px] font-semibold text-green-500 uppercase tracking-wide">All Systems Operational</span>
          </div>
        </div>

        {/* Global Search Bar (Visual) */}
        <div className="relative mt-2 max-w-2xl z-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#666666]" />
          <input
            type="text"
            placeholder="Search for guides, API references, or tutorials..."
            className="w-full bg-[#111112] border border-[#222222] rounded-[12px] pl-12 pr-4 py-3.5 text-[15px] text-[#EDEDED] focus:outline-none focus:border-[#444444] transition-colors shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Resources & FAQs) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-10">
          
          {/* Resources Grid */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[13px] font-bold text-[#888888] uppercase tracking-wider">Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="group border border-[#222222] bg-[#111112] hover:bg-[#151516] rounded-[12px] p-5 transition-all cursor-pointer flex flex-col gap-3 relative overflow-hidden">
                <div className="h-10 w-10 rounded-[8px] bg-[#1A1A1A] border border-[#333333] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Book className="h-5 w-5 text-[#EDEDED]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#EDEDED] flex items-center justify-between">
                    Documentation
                    <ExternalLink className="h-3.5 w-3.5 text-[#666666] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-[13px] text-[#888888] mt-1 leading-relaxed">Comprehensive guides for setting up and managing your workspace.</p>
                </div>
              </div>
              
              <div className="group border border-[#222222] bg-[#111112] hover:bg-[#151516] rounded-[12px] p-5 transition-all cursor-pointer flex flex-col gap-3 relative overflow-hidden">
                <div className="h-10 w-10 rounded-[8px] bg-[#1A1A1A] border border-[#333333] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Code className="h-5 w-5 text-[#EDEDED]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#EDEDED] flex items-center justify-between">
                    API Reference
                    <ExternalLink className="h-3.5 w-3.5 text-[#666666] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-[13px] text-[#888888] mt-1 leading-relaxed">Technical documentation for webhooks and API integrations.</p>
                </div>
              </div>

              <div className="group border border-[#222222] bg-[#111112] hover:bg-[#151516] rounded-[12px] p-5 transition-all cursor-pointer flex flex-col gap-3 relative overflow-hidden">
                <div className="h-10 w-10 rounded-[8px] bg-[#1A1A1A] border border-[#333333] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MessageSquare className="h-5 w-5 text-[#EDEDED]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#EDEDED] flex items-center justify-between">
                    Community Forum
                    <ExternalLink className="h-3.5 w-3.5 text-[#666666] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-[13px] text-[#888888] mt-1 leading-relaxed">Connect with other agencies, share tips, and request new features.</p>
                </div>
              </div>

              <div className="group border border-[#222222] bg-[#111112] hover:bg-[#151516] rounded-[12px] p-5 transition-all cursor-pointer flex flex-col gap-3 relative overflow-hidden">
                <div className="h-10 w-10 rounded-[8px] bg-[#1A1A1A] border border-[#333333] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <PlayCircle className="h-5 w-5 text-[#EDEDED]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#EDEDED] flex items-center justify-between">
                    Video Tutorials
                    <ExternalLink className="h-3.5 w-3.5 text-[#666666] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-[13px] text-[#888888] mt-1 leading-relaxed">Step-by-step video crash courses on mastering GrowSuite.</p>
                </div>
              </div>

            </div>
          </div>

          {/* FAQs */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[13px] font-bold text-[#888888] uppercase tracking-wider">Top Articles</h2>
            <div className="flex flex-col border border-[#222222] rounded-[12px] bg-[#111112] overflow-hidden">
              {faqs.map((faq, index) => {
                const isActive = activeFaq === index;
                return (
                  <div key={index} className={`border-b border-[#222222] last:border-0`}>
                    <button
                      onClick={() => setActiveFaq(isActive ? null : index)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-[#151516] transition-colors group"
                    >
                      <span className={`text-[14px] font-medium transition-colors ${isActive ? 'text-[#EDEDED]' : 'text-[#A1A1AA] group-hover:text-[#EDEDED]'}`}>{faq.q}</span>
                      {isActive ? (
                        <ChevronUp className="h-4 w-4 text-[#666666]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[#666666]" />
                      )}
                    </button>
                    {isActive && (
                      <div className="px-5 pb-5 text-[13px] text-[#888888] leading-relaxed animate-in slide-in-from-top-2 duration-200 border-t border-transparent">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (Ticket Portal) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          <div className="border border-[#222222] bg-[#111112] rounded-[12px] p-6 flex flex-col gap-6 sticky top-8 shadow-2xl">
            <div className="flex flex-col gap-2">
              <h3 className="text-[16px] font-bold text-[#EDEDED] flex items-center gap-2">
                <Ticket className="h-4 w-4 text-[#888888]" />
                Contact Support
              </h3>
              <p className="text-[13px] text-[#888888] leading-relaxed">
                Need direct technical assistance? Create a ticket and our engineering team will investigate.
              </p>
            </div>

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center text-center p-6 border border-green-500/20 bg-green-500/5 rounded-[8px] gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <h4 className="text-[14px] font-bold text-green-500">Ticket Created</h4>
                  <p className="text-[12px] text-green-500/70 mt-1">Check your email for status updates.</p>
                </div>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="mt-2 text-[12px] text-[#888888] hover:text-[#EDEDED] font-medium transition-colors"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#888888] uppercase tracking-wide">Category</label>
                  <select className="w-full bg-[#151516] border border-[#222222] rounded-[8px] px-3 py-2 text-[13px] text-[#EDEDED] focus:outline-none focus:border-[#444444] transition-colors appearance-none cursor-pointer">
                    <option value="billing">Billing & Subscriptions</option>
                    <option value="technical">Technical Issue / Bug</option>
                    <option value="feature">Feature Request</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#888888] uppercase tracking-wide">Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Brief description"
                    className="w-full bg-[#151516] border border-[#222222] rounded-[8px] px-3 py-2 text-[13px] text-[#EDEDED] focus:outline-none focus:border-[#444444] transition-colors"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#888888] uppercase tracking-wide">Details</label>
                  <textarea
                    required
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Provide as much context as possible..."
                    rows={4}
                    className="w-full bg-[#151516] border border-[#222222] rounded-[8px] px-3 py-2 text-[13px] text-[#EDEDED] focus:outline-none focus:border-[#444444] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !ticketSubject || !ticketMessage}
                  className="mt-2 w-full bg-[#EDEDED] text-[#000000] px-4 py-2 rounded-[8px] text-[13px] font-semibold hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    "Submit Ticket"
                  )}
                </button>
              </form>
            )}
            
            <div className="pt-4 border-t border-[#222222] flex items-center justify-between text-[12px]">
              <span className="text-[#888888]">Pro members get priority queue</span>
              <span className="font-semibold text-[#EDEDED]">~2hr response time</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
