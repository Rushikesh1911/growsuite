"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  FileText, Mail, MessageSquare, Table, 
  CheckCircle2, Search, Bell, LayoutDashboard, 
  Users, CreditCard, Settings, ChevronRight, AlertCircle
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

// --- State 1: Messy Disconnected Tools ---

// --- State 1: Messy Disconnected Tools ---

const StackedSpreadsheets = () => (
  <div className="absolute bottom-[5%] left-[0%] w-[420px] z-10 transform scale-[0.65] origin-bottom-left">
    {/* Background Spreadsheet 2 */}
    <div className="absolute -top-4 -left-4 w-full bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden opacity-50">
      <div className="bg-[#107C41] h-6 w-full"></div>
      <div className="h-32 w-full bg-gray-50"></div>
    </div>
    {/* Background Spreadsheet 1 */}
    <div className="absolute -top-2 -left-2 w-full bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden opacity-75">
      <div className="bg-[#107C41] h-6 w-full"></div>
      <div className="h-32 w-full bg-gray-50"></div>
    </div>
    {/* Foreground Spreadsheet */}
    <div className="relative w-full bg-white rounded-md shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden">
      <div className="bg-[#107C41] h-8 flex items-center justify-center">
        <span className="text-[11px] text-white font-medium">Leads_Q3_Final.xlsx</span>
      </div>
      <div className="bg-gray-100 h-6 flex items-center px-2 gap-1 border-b border-gray-200">
        <div className="w-12 h-3 bg-white border border-gray-300 rounded-sm"></div>
        <div className="w-4 h-3 bg-white border border-gray-300 rounded-sm"></div>
        <div className="w-4 h-3 bg-white border border-gray-300 rounded-sm"></div>
      </div>
      <div className="p-2">
        <div className="grid grid-cols-5 border-b border-gray-300 pb-1 mb-1 gap-1">
          {['Date', 'Client', 'Category', 'Amount', 'Status'].map(h => (
            <div key={h} className="text-[8px] font-bold text-gray-700 text-center">{h}</div>
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="grid grid-cols-5 py-1.5 border-b border-gray-100 last:border-0 gap-1 text-[8px] text-gray-500 text-center items-center">
            <div>2024-05-12</div>
            <div className="text-left pl-2">Acme Corp</div>
            <div>Consulting</div>
            <div>$1,200</div>
            <div className="text-emerald-600">Paid</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ProposalCard = () => (
  <div className="absolute top-[0%] right-[8%] w-[280px] h-[360px] bg-white rounded-lg shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-gray-200 overflow-hidden z-10 flex flex-col transform rotate-[2deg] scale-[0.7] origin-top-right">
    <div className="h-10 border-b border-gray-200 bg-gray-50 flex items-center justify-between px-3">
      <div className="text-gray-500 text-[9px] font-medium flex items-center gap-1.5"><FileText className="w-3 h-3 text-blue-500" /> Q4_Growth_Proposal.pdf</div>
      <div className="flex gap-2">
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
      </div>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-100">
      <div className="w-full bg-white shadow-sm p-4 rounded border border-gray-200 h-full flex flex-col relative">
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <img src="https://i.pravatar.cc/100?img=47" className="w-full h-full rounded-full object-cover" />
        </div>
        <div className="mt-8 mb-4">
          <div className="w-12 h-2 bg-blue-500 rounded-sm mb-2"></div>
          <div className="text-[14px] font-bold text-gray-800 leading-tight">ACME CORP<br/>GROWTH STRATEGY</div>
        </div>
        <div className="space-y-2 w-full mt-auto">
          <div className="w-full h-1.5 bg-gray-100 rounded-sm"></div>
          <div className="w-5/6 h-1.5 bg-gray-100 rounded-sm"></div>
          <div className="w-4/5 h-1.5 bg-gray-100 rounded-sm"></div>
        </div>
      </div>
    </div>
  </div>
);

const ChatBubble = () => (
  <div className="absolute top-[22%] left-[22%] bg-white rounded-full shadow-[0_15px_30px_-10px_rgba(0,0,0,0.12)] border border-gray-100 py-1.5 pl-4 pr-5 flex items-center gap-3 z-30">
    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-8 h-8 object-contain drop-shadow-sm" alt="WhatsApp" />
    <div>
      <div className="text-[9px] font-semibold text-gray-800">Sarah</div>
      <div className="text-[12px] text-gray-700 font-medium">Did anyone invoice them yet?</div>
    </div>
  </div>
);

const AlertBubble = () => (
  <div className="absolute top-[15%] right-[32%] bg-white rounded-full shadow-[0_15px_30px_-10px_rgba(0,0,0,0.12)] border border-gray-100 p-2 flex items-center justify-center z-20">
    <div className="w-8 h-8 rounded-full bg-[#4A154B] flex items-center justify-center">
      <MessageSquare className="w-4 h-4 text-white" />
    </div>
    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">
      3
    </div>
  </div>
);

const EmailBubble = () => (
  <div className="absolute bottom-[25%] right-[22%] bg-white rounded-full shadow-[0_15px_30px_-10px_rgba(0,0,0,0.12)] border border-gray-100 py-1.5 pl-2 pr-3 z-30 transform scale-90 flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 drop-shadow-sm">
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="none" />
      <path d="M12 16.64L24 7.636v13.364c0 .904-.732 1.636-1.636 1.636h-3.819V11.73z" fill="#4285f4" />
      <path d="M0 7.636l12 9.004v-7.092L5.455 4.64z" fill="#34a853" />
      <path d="M18.545 11.73v9.273h3.819c.904 0 1.636-.732 1.636-1.636V5.457c0-2.023-2.309-3.178-3.927-1.964z" fill="#fbbc04" />
      <path d="M0 5.457v13.909c0 .904.732 1.636 1.636 1.636h3.819V11.73L0 7.636z" fill="#ea4335" />
    </svg>
    <div className="text-[10px] font-semibold text-gray-700 pr-2">Inbox (1,241)</div>
  </div>
);

const FormCard = () => (
  <div className="absolute top-[12%] left-[40%] w-[260px] bg-white rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 p-5 z-20 transform scale-90 origin-top">
    <div className="text-[10px] font-medium text-gray-500 mb-4 uppercase tracking-wider">Enter client details</div>
    <div className="space-y-4">
      <div>
        <div className="text-[10px] text-gray-700 font-medium mb-1.5">Company Name</div>
        <div className="h-8 border border-red-300 bg-red-50 rounded w-full px-2 flex items-center text-[11px] text-gray-800">Acme</div>
      </div>
      <div>
        <div className="text-[10px] text-gray-700 font-medium mb-1.5">Contact Email</div>
        <div className="h-8 border border-gray-200 rounded w-full px-2 flex items-center text-[11px] text-gray-800">sarah@acme.co</div>
      </div>
      <div>
        <div className="text-[10px] text-gray-700 font-medium mb-1.5">Project Budget</div>
        <div className="h-8 border border-gray-200 rounded w-full px-2 flex items-center text-[11px] text-gray-800">****</div>
      </div>
      <div className="flex items-center gap-1.5 text-red-500 pt-1">
        <AlertCircle className="w-3.5 h-3.5" />
        <span className="text-[10px] font-medium">The details entered do not match</span>
      </div>
    </div>
  </div>
);

const FolderIcon = () => (
  <div className="absolute bottom-[35%] left-[28%] flex flex-col items-center z-10 [@media(max-height:800px)]:hidden">
    <div className="w-14 h-12 bg-blue-400 rounded-md relative shadow-sm">
      <div className="absolute -top-2 left-0 w-6 h-3 bg-blue-400 rounded-t-sm"></div>
      <div className="absolute top-1 left-0 w-full h-full bg-blue-300 rounded-md flex items-center justify-center">
        <div className="w-6 h-6 bg-red-400 rounded flex items-center justify-center text-white text-[10px] shadow-sm transform -rotate-12">!</div>
      </div>
    </div>
    <div className="text-[10px] text-gray-500 mt-2 font-medium">Unsorted_Leads</div>
  </div>
);

const SubQuestionBubble = () => (
  <div className="absolute bottom-[28%] left-[42%] bg-white rounded-full shadow-[0_15px_30px_-10px_rgba(0,0,0,0.12)] border border-gray-100 py-1.5 pl-1.5 pr-4 flex items-center gap-3 z-30 transform scale-90">
    <div className="w-8 h-8 rounded-full bg-amber-100 overflow-hidden shrink-0 border border-gray-200">
      <img src="https://i.pravatar.cc/100?img=11" alt="avatar" className="w-full h-full object-cover" />
    </div>
    <div>
      <div className="text-[9px] font-semibold text-gray-800">Omar</div>
      <div className="text-[12px] text-gray-700 font-medium">Is this in our budget?</div>
    </div>
  </div>
);

const InvoiceFile = () => (
  <div className="absolute bottom-[35%] right-[40%] flex flex-col items-center z-10 cursor-pointer group">
    <div className="w-10 h-12 bg-white border border-gray-200 shadow-sm rounded-sm relative flex flex-col group-hover:scale-105 transition-transform">
      <div className="absolute top-0 right-0 w-3 h-3 bg-gray-100 border-l border-b border-gray-200"></div>
      <div className="bg-amber-400 w-full h-1 mt-3"></div>
      <div className="bg-gray-200 w-3/4 h-0.5 mx-auto mt-2"></div>
      <div className="bg-gray-200 w-1/2 h-0.5 mx-auto mt-1"></div>
    </div>
    <div className="text-[10px] text-gray-500 mt-1 font-medium group-hover:text-gray-800">invoice.pdf</div>
  </div>
);

const ReceiptCard = () => (
  <div className="absolute top-[0%] left-[8%] w-[120px] bg-[#fdfdfd] shadow-[0_15px_35px_-5px_rgba(0,0,0,0.15)] border border-gray-200 p-4 transform rotate-[-4deg] scale-90 origin-top-left z-10 flex flex-col items-center">
    <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 mb-4 flex items-center justify-center text-gray-400 text-[8px] font-bold">LOGO</div>
    <div className="w-full text-center border-b border-gray-300 pb-2 mb-2 border-dashed">
      <div className="text-[10px] font-bold text-gray-800">INVOICE</div>
      <div className="text-[7px] text-gray-500">INV-2024-89</div>
    </div>
    <div className="w-full space-y-1.5 mb-4">
      <div className="flex justify-between text-[7px] text-gray-600"><span>Consulting</span><span>$2,450.00</span></div>
      <div className="flex justify-between text-[7px] text-gray-600"><span>Software</span><span>$850.00</span></div>
      <div className="flex justify-between text-[7px] text-gray-600"><span>Hosting</span><span>$150.00</span></div>
    </div>
    <div className="w-full flex justify-between border-t border-gray-300 pt-2 text-[9px] font-bold text-gray-800">
      <span>TOTAL</span><span>$3,450.00</span>
    </div>
  </div>
);

const TaskListCard = () => (
  <div className="absolute bottom-[5%] right-[2%] w-[260px] bg-white rounded-lg shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden z-20 transform scale-[0.8] origin-bottom-right [@media(max-height:800px)]:hidden">
    <div className="bg-[#4C51BF] h-12 flex flex-col justify-center px-4">
      <span className="text-[14px] text-white font-bold tracking-tight">Active Projects</span>
      <span className="text-[9px] text-indigo-200">All teams</span>
    </div>
    <div className="p-3">
      <div className="grid grid-cols-4 border-b border-gray-200 pb-2 mb-2">
        <div className="text-[8px] font-bold text-gray-500 uppercase col-span-2">Project Name</div>
        <div className="text-[8px] font-bold text-gray-500 uppercase text-center">Status</div>
        <div className="text-[8px] font-bold text-gray-500 uppercase text-right">Due</div>
      </div>
      <div className="space-y-3">
        {[
          { name: 'Acme Redesign', status: 'In Progress', due: 'Oct 12' },
          { name: 'TechFlow MVP', status: 'Review', due: 'Oct 15' },
          { name: 'Nexus Campaign', status: 'Planning', due: 'Oct 20' },
          { name: 'Global Rebrand', status: 'In Progress', due: 'Nov 01' }
        ].map((p, i) => (
          <div key={i} className="grid grid-cols-4 items-center">
            <div className="col-span-2 text-[10px] font-medium text-blue-600">{p.name}</div>
            <div className="text-[8px] text-gray-500 text-center bg-gray-100 rounded-full py-0.5">{p.status}</div>
            <div className="text-[8px] text-gray-500 text-right">{p.due}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PipelineCard = () => (
  <div className="absolute bottom-[5%] left-[38%] w-[320px] bg-white rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-200 p-4 z-20 transform scale-90 origin-bottom [@media(max-height:800px)]:hidden">
    <div className="flex justify-between items-center mb-4">
      <div className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">Pipeline Flow</div>
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
      </div>
    </div>
    <div className="flex gap-2">
      {['Lead', 'Demo', 'Proposal', 'Won'].map((stage, i) => (
        <div key={stage} className="flex-1 bg-gray-50 border border-gray-100 rounded p-2 flex flex-col items-center">
          <div className="text-[8px] font-semibold text-gray-500 mb-2 uppercase">{stage}</div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${100 - i * 20}%` }}></div>
          </div>
          <div className="text-[10px] font-bold text-gray-800 mt-1">{12 - i * 2}</div>
        </div>
      ))}
    </div>
  </div>
);

// --- State 2: Unified Premium Dashboard ---

const UnifiedDashboard = () => (
  <div className="w-full h-full bg-[#050505] overflow-hidden flex font-sans">
    
    {/* Sidebar */}
    <div className="w-56 flex-shrink-0 border-r border-white/5 bg-[#050505] flex flex-col">
      {/* Logo Area */}
      <div className="h-10 flex items-center px-4">
        <Logo theme="dark" />
      </div>
      
      {/* Workspace Selector */}
      <div className="px-3 mb-2">
        <div className="flex items-center justify-between px-2 py-1.5 bg-white/5 rounded border border-white/5 cursor-pointer">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-gray-600 rounded-sm flex items-center justify-center text-[7px] text-white">E</div>
            <span className="text-white text-[11px] font-medium">Elevate Agency</span>
          </div>
          <span className="text-gray-500 text-[8px]">▼</span>
        </div>
      </div>
      
      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-1 flex flex-col gap-0.5">
        <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 text-white rounded-lg text-[11px] font-medium border border-white/5">
          <LayoutDashboard className="w-3 h-3 text-white" /> Overview
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 text-gray-400 hover:text-white rounded-md text-[11px] font-medium transition-colors">
          <Users className="w-3 h-3" /> Leads
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 text-gray-400 hover:text-white rounded-md text-[11px] font-medium transition-colors">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg> Pipeline
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 text-gray-400 hover:text-white rounded-md text-[11px] font-medium transition-colors">
          <Users className="w-3 h-3" /> Clients
        </div>
        
        <div className="my-1 border-t border-white/5 [@media(max-height:800px)]:hidden"></div>
        
        <div className="flex items-center gap-2 px-2 py-1.5 text-gray-400 hover:text-white rounded-md text-[11px] font-medium transition-colors [@media(max-height:800px)]:hidden">
          <CheckCircle2 className="w-3 h-3" /> Projects
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 text-gray-400 hover:text-white rounded-md text-[11px] font-medium transition-colors [@media(max-height:800px)]:hidden">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> Tasks
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 text-gray-400 hover:text-white rounded-md text-[11px] font-medium transition-colors [@media(max-height:800px)]:hidden">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Time Tracking
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 text-gray-400 hover:text-white rounded-md text-[11px] font-medium transition-colors [@media(max-height:800px)]:hidden">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Calendar
        </div>
        
        <div className="my-1 border-t border-white/5"></div>
        
        <div className="flex items-center gap-2 px-2 py-1.5 text-gray-400 hover:text-white rounded-md text-[11px] font-medium transition-colors">
          <CreditCard className="w-3 h-3" /> Invoices
        </div>
      </div>
      
      <div className="px-3 py-2 border-t border-white/5 flex flex-col gap-0.5">
        <div className="flex items-center gap-2 px-2 py-1.5 text-gray-400 hover:text-white rounded-md text-[11px] font-medium transition-colors">
          <Settings className="w-3 h-3" /> Settings
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 text-gray-400 hover:text-white rounded-md text-[11px] font-medium transition-colors">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="12" r="10"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Help Center
        </div>
      </div>
    </div>
    
    {/* Main Content Area */}
    <div className="flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden">
      
      {/* Top Navbar */}
      <div className="h-10 border-b border-white/5 flex items-center justify-between px-6 bg-[#050505]">
        <div className="text-[10px] text-gray-400 flex items-center gap-2">
          Workspace <span className="text-gray-600">/</span> <span className="text-white font-medium">Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search..." className="bg-transparent border border-white/10 rounded-full pl-7 pr-3 py-1 text-[10px] text-white focus:outline-none focus:border-white/20 w-32" />
          </div>
          <div className="relative">
            <Bell className="w-3 h-3 hover:text-white transition-colors cursor-pointer text-gray-400" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
          </div>
          <div className="w-6 h-6 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-[9px] font-bold text-white">RU</div>
        </div>
      </div>
      
      {/* Dashboard Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h1 className="text-[20px] md:text-[24px] text-white font-medium tracking-tight mb-0.5">Good morning, Rushi</h1>
            <p className="text-gray-400 text-[11px]">Here's your business at a glance.</p>
          </div>
          <button className="bg-white text-black px-3 py-1.5 text-[11px] font-semibold rounded hover:bg-gray-100 transition-colors flex items-center gap-1">
            <span className="text-[12px] leading-none">+</span> Create
          </button>
        </div>
        
        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-3 mb-3 [@media(max-height:800px)]:mb-0">
          {[{ label: "Revenue (30d)", val: "₹1,24,500", desc: "Collected this period", icon: <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
            { label: "Pipeline Value", val: "₹3,50,000", desc: "Across 12 open deals", icon: <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
            { label: "Active Projects", val: "8", desc: "Currently engaged", icon: <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
            { label: "Tasks", val: "14", desc: "Pending tasks", icon: <CheckCircle2 className="w-3 h-3 text-gray-400" /> }
          ].map((m, i) => (
            <div key={i} className="bg-[#050505] border border-white/5 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                {m.icon}
                <div className="text-gray-400 text-[10px]">{m.label}</div>
              </div>
              <div className="text-xl text-white font-medium mb-0.5">{m.val}</div>
              <div className="text-gray-500 text-[9px]">{m.desc}</div>
            </div>
          ))}
        </div>

        {/* Big Cards Row */}
        <div className="grid grid-cols-2 gap-4 [@media(max-height:800px)]:hidden">
          {/* Your Work */}
          <div className="bg-[#050505] border border-white/5 rounded-lg p-4 min-h-[120px] flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white text-[12px] font-medium">Your Work</h3>
              <span className="text-gray-400 text-[10px] hover:text-white cursor-pointer flex items-center gap-1">View all &rarr;</span>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 p-2 bg-white/5 border border-white/5 rounded">
                <div className="w-3 h-3 rounded-full border-2 border-gray-500"></div>
                <div className="flex-1">
                  <div className="text-white text-[10px]">Review Acme Wireframes</div>
                  <div className="text-gray-500 text-[8px]">Project: Acme Redesign</div>
                </div>
                <div className="text-gray-400 text-[9px]">Today</div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/5 border border-white/5 rounded">
                <div className="w-3 h-3 rounded-full border-2 border-gray-500"></div>
                <div className="flex-1">
                  <div className="text-white text-[10px]">Send Q3 Invoice</div>
                  <div className="text-gray-500 text-[8px]">Client: TechFlow</div>
                </div>
                <div className="text-amber-400 text-[9px]">Tomorrow</div>
              </div>
            </div>
          </div>
          
          {/* Pipeline Distribution */}
          <div className="bg-[#050505] border border-white/5 rounded-lg p-4 min-h-[120px] flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white text-[12px] font-medium">Pipeline Distribution</h3>
              <span className="text-gray-400 text-[10px] hover:text-white cursor-pointer flex items-center gap-1">View pipeline &rarr;</span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center gap-2">
              <div className="w-full h-2 rounded-full flex overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '40%' }}></div>
                <div className="h-full bg-amber-500" style={{ width: '35%' }}></div>
                <div className="h-full bg-emerald-500" style={{ width: '25%' }}></div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span className="text-[9px] text-gray-400">Prospecting</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span className="text-[9px] text-gray-400">Negotiation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[9px] text-gray-400">Closed</span>
                </div>
              </div>
              <div className="flex justify-between border-t border-white/5 mt-1 pt-2">
                <div>
                  <div className="text-gray-500 text-[9px]">Total Pipeline</div>
                  <div className="text-white text-[14px] font-medium">₹3,50,000</div>
                </div>
                <div>
                  <div className="text-gray-500 text-[9px]">Open Deals</div>
                  <div className="text-white text-[14px] font-medium">12</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export function SingTogether() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Crossfade animations
  const opacity1 = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const scale1 = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);

  const opacity2 = useTransform(scrollYProgress, [0.6, 1], [0, 1]);
  const scale2 = useTransform(scrollYProgress, [0.6, 1], [1.05, 1]);

  return (
    <section ref={containerRef} className="h-[200vh] relative">
      <div className="sticky top-[65px] h-[calc(100vh-65px)] w-full overflow-hidden">
        
        {/* State 1: Messy Disconnected Systems (Light Theme) */}
        <motion.div 
          style={{ opacity: opacity1, scale: scale1 }}
          className="absolute inset-0 flex flex-col items-center pt-12 pb-12 w-full h-full pointer-events-none bg-[#FAFAFA]"
        >
          <div className="text-center max-w-2xl z-30 px-6">
            <h2 className="text-[40px] md:text-[56px] font-medium tracking-tight text-gray-900 mb-4 leading-[1.1]">
              A fragmented mess.
            </h2>
            <p className="text-[18px] text-gray-500 font-light">
              This is what managing a single client across five different tools looks like.
            </p>
          </div>
          
          <div className="relative w-full max-w-[1200px] flex-1 mt-8">
            <style>{`
              @keyframes dash {
                to {
                  stroke-dashoffset: -20;
                }
              }
              .animate-dash {
                animation: dash 1s linear infinite;
              }
            `}</style>
            
            {/* SVG Connecting Dotted Lines - Flowing Micro-animation */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" style={{ zIndex: 0 }}>
              <path d="M 150 50 C 350 50, 400 100, 480 120" fill="none" stroke="#AFAFAF" strokeWidth="1.2" strokeDasharray="4 6" className="animate-dash" />
              <path d="M 150 450 C 250 400, 300 450, 450 450" fill="none" stroke="#AFAFAF" strokeWidth="1.2" strokeDasharray="4 6" className="animate-dash" />
              <path d="M 450 180 C 450 350, 550 400, 750 400" fill="none" stroke="#AFAFAF" strokeWidth="1.2" strokeDasharray="4 6" className="animate-dash" />
              <path d="M 850 100 C 950 200, 950 380, 850 480" fill="none" stroke="#AFAFAF" strokeWidth="1.2" strokeDasharray="4 6" className="animate-dash" />
              <path d="M 550 500 C 650 500, 750 450, 850 500" fill="none" stroke="#AFAFAF" strokeWidth="1.2" strokeDasharray="4 6" className="animate-dash" />
            </svg>
            
            <div className="z-10 relative w-full h-[550px]">
              <ReceiptCard />
              <StackedSpreadsheets />
              <ProposalCard />
              <ChatBubble />
              <AlertBubble />
              <EmailBubble />
              <FormCard />
              <FolderIcon />
              <SubQuestionBubble />
              <InvoiceFile />
              <TaskListCard />
              <PipelineCard />
            </div>
          </div>
        </motion.div>

        {/* State 2: Clean Unified Dashboard (Dark Theme) */}
        <motion.div 
          style={{ opacity: opacity2, scale: scale2 }}
          className="absolute inset-0 flex flex-col items-center pt-12 pb-12 w-full h-full pointer-events-none bg-[#FAFAFA]"
        >
          <div className="text-center max-w-2xl z-30 px-6">
            <h2 className="text-[40px] md:text-[56px] font-medium tracking-tight text-gray-900 mb-4 leading-[1.1]">
              A single source of truth.
            </h2>
            <p className="text-[18px] text-gray-500 font-light">
              Eliminate context switching. Centralize your CRM, project management, and billing into one intelligent workspace.
            </p>
          </div>
          
          <div className="relative w-[96vw] max-w-[1200px] flex-1 mt-8 mb-8 md:mb-12 rounded-[20px] z-20 shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-gray-300 bg-[#050505] overflow-hidden flex flex-col pointer-events-auto">
            
            {/* Window Chrome */}
            <div className="flex items-center gap-2.5 px-4 py-3 bg-[#050505] border-b border-white/5 shrink-0">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                <span className="h-3 w-3 rounded-full bg-[#28CA41]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-6 w-[240px] rounded-[6px] bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    app.growsuite.io/dashboard
                  </span>
                </div>
              </div>
            </div>
            
            <UnifiedDashboard />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
