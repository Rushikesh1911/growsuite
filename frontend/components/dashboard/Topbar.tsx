"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, LogOut, Settings, User, Check, AlertCircle, DollarSign, CheckSquare, UserPlus, Trophy, Briefcase, Mail } from "lucide-react";
import { useSocket } from "@/components/providers/SocketProvider";

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getNotificationIcon(type: string, isRead: boolean) {
  const className = `h-3.5 w-3.5 ${!isRead ? 'text-blue-500' : 'text-[var(--gs-muted-light)]'}`;
  switch (type) {
    case 'INVOICE_PAID':
    case 'INVOICE_PARTIALLY_PAID':
      return <DollarSign className={className} />;
    case 'TASK_ASSIGNED':
      return <CheckSquare className={className} />;
    case 'MEMBER_JOINED':
      return <UserPlus className={className} />;
    case 'DEAL_WON':
      return <Trophy className={className} />;
    case 'LEAD_ASSIGNED':
      return <User className={className} />;
    default:
      return <Bell className={className} />;
  }
}

interface Notification {
  id: number;
  title: string;
  body: string | null;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

interface TopbarProps {
  currentView?: string;
  breadcrumbs?: React.ReactNode;
}

export function Topbar({ currentView = "overview", breadcrumbs }: TopbarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userName, setUserName] = useState<string>("User");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    leads: any[];
    deals: any[];
    clients: any[];
    projects: any[];
    tasks: any[];
    invoices: any[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { socket } = useSocket();
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchNotifications = async () => {
    const token = localStorage.getItem("growsuite_token");
    const workspaceId = localStorage.getItem("growsuite_workspace_id");
    if (!token || !workspaceId) return;

    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId
        }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {}
  };

  useEffect(() => {
    const fetchUser = () => {
      const token = localStorage.getItem("growsuite_token");
      if (token) {
        fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json()).then(data => {
          if (data && data.name) {
            setUserName(data.name);
          } else if (data && data.email) {
            setUserName(data.email.split('@')[0]);
          }
          if (data && data.avatarUrl) {
            setAvatarUrl(data.avatarUrl);
          } else {
            setAvatarUrl(null);
          }
        }).catch(() => {});
      }
    };

    fetchUser();
    
    // Listen for user updates from settings
    window.addEventListener('userUpdated', fetchUser);

    // Initial fetch of notifications
    fetchNotifications();

    return () => {
      window.removeEventListener('userUpdated', fetchUser);
    };
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        
        // Show a toast when a live notification arrives
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { 
            message: notification.title, 
            type: "success" 
          } 
        }));
      };

      socket.on('new_notification', handleNewNotification);

      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [socket]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    setSearchOpen(true);
    
    const delayDebounceFn = setTimeout(async () => {
      try {
        const token = localStorage.getItem("growsuite_token");
        const workspaceId = localStorage.getItem("growsuite_workspace_id");
        if (!token || !workspaceId) return;

        const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "x-workspace-id": workspaceId
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitials = userName.substring(0, 2).toUpperCase();

  const handleMarkAsRead = async (id: number, link: string | null) => {
    const token = localStorage.getItem("growsuite_token");
    const workspaceId = localStorage.getItem("growsuite_workspace_id");
    if (!token || !workspaceId) return;

    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId
        }
      });
      // Update local state immediately
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      if (link) {
        setNotificationsOpen(false);
        router.push(link);
      }
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("growsuite_token");
    const workspaceId = localStorage.getItem("growsuite_workspace_id");
    if (!token || !workspaceId) return;

    try {
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId
        }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const handleLogout = () => {
    localStorage.removeItem("growsuite_token");
    localStorage.removeItem("growsuite_user");
    localStorage.removeItem("growsuite_workspace_id");
    router.push("/");
  };

  return (
    <header className="h-[56px] border-b border-[var(--gs-border)] bg-[var(--gs-bg)] px-6 flex items-center justify-between shrink-0 select-none relative z-50" role="banner">
      
      {/* Left Section: Breadcrumbs */}
      <div className="flex items-center gap-2">
        {breadcrumbs ? (
          breadcrumbs
        ) : (
          <>
            <span className="text-[13px] font-medium text-[var(--gs-fg)]">Workspace</span>
            <span className="text-[13px] text-[var(--gs-muted-light)]">/</span>
            <span className="text-[13px] font-medium text-[var(--gs-fg)] capitalize">{currentView?.replace(/-/g, ' ')}</span>
          </>
        )}
      </div>

      {/* Right Section: Search & Actions */}
      <div className="flex items-center gap-4">
        {/* Compact search bar */}
        <div className="relative w-48 sm:w-64" role="search" ref={searchRef}>
          <label htmlFor="global-search" className="sr-only">Search console</label>
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--gs-muted-light)]" aria-hidden="true" />
          <input
            id="global-search"
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchQuery.trim()) setSearchOpen(true); }}
            className="w-full bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[6px] pl-8 pr-3 py-1.5 text-[13px] text-[var(--gs-fg)] placeholder-[var(--gs-muted-light)] focus:outline-none focus:border-[var(--gs-muted)] transition-all h-[32px]"
          />

          {searchOpen && searchQuery.trim() && (isSearching || searchResults) && (
            <div className="absolute right-0 sm:left-0 top-full mt-2 w-[340px] bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[8px] shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
              {isSearching ? (
                <div className="px-4 py-6 text-center flex flex-col items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-[var(--gs-muted-light)] border-t-[var(--gs-fg)] rounded-full animate-spin"></div>
                  <span className="text-[12px] text-[var(--gs-muted)]">Searching...</span>
                </div>
              ) : searchResults ? (
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {/* Results for Leads */}
                  {searchResults.leads.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1 text-[10px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Leads</div>
                      {searchResults.leads.map((lead: any) => (
                        <button key={lead.id} onMouseDown={() => { router.push(`/dashboard/crm?lead=${lead.id}`); setSearchOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-[var(--gs-surface)] flex flex-col gap-0.5 outline-none">
                          <span className="text-[13px] font-medium text-[var(--gs-fg)]">{lead.contactName}</span>
                          {lead.company && <span className="text-[11px] text-[var(--gs-muted)]">{lead.company}</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Results for Deals */}
                  {searchResults.deals.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1 text-[10px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Deals</div>
                      {searchResults.deals.map((deal: any) => (
                        <button key={deal.id} onMouseDown={() => { router.push(`/dashboard/crm`); setSearchOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-[var(--gs-surface)] flex flex-col gap-0.5 outline-none">
                          <span className="text-[13px] font-medium text-[var(--gs-fg)]">{deal.title}</span>
                          {deal.company && <span className="text-[11px] text-[var(--gs-muted)]">{deal.company}</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Results for Clients */}
                  {searchResults.clients.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1 text-[10px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Clients</div>
                      {searchResults.clients.map((client: any) => (
                        <button key={client.id} onMouseDown={() => { router.push(`/dashboard/clients/${client.id}`); setSearchOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-[var(--gs-surface)] flex flex-col gap-0.5 outline-none">
                          <span className="text-[13px] font-medium text-[var(--gs-fg)]">{client.name}</span>
                          {client.company && <span className="text-[11px] text-[var(--gs-muted)]">{client.company}</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Results for Projects */}
                  {searchResults.projects.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1 text-[10px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Projects</div>
                      {searchResults.projects.map((project: any) => (
                        <button key={project.id} onMouseDown={() => { router.push(`/dashboard/projects/${project.id}`); setSearchOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-[var(--gs-surface)] flex flex-col gap-0.5 outline-none">
                          <span className="text-[13px] font-medium text-[var(--gs-fg)]">{project.name}</span>
                          <span className="text-[11px] text-[var(--gs-muted)]">{project.client?.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Results for Tasks */}
                  {searchResults.tasks.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1 text-[10px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Tasks</div>
                      {searchResults.tasks.map((task: any) => (
                        <button key={task.id} onMouseDown={() => { router.push(`/dashboard/projects/${task.projectId}?tab=tasks`); setSearchOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-[var(--gs-surface)] flex flex-col gap-0.5 outline-none">
                          <span className="text-[13px] font-medium text-[var(--gs-fg)]">{task.title}</span>
                          <span className="text-[11px] text-[var(--gs-muted)]">{task.project?.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Results for Invoices */}
                  {searchResults.invoices.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1 text-[10px] font-bold text-[var(--gs-muted)] uppercase tracking-wider">Invoices</div>
                      {searchResults.invoices.map((invoice: any) => (
                        <button key={invoice.id} onMouseDown={() => { router.push(`/dashboard/invoices/${invoice.id}`); setSearchOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-[var(--gs-surface)] flex flex-col gap-0.5 outline-none">
                          <span className="text-[13px] font-medium text-[var(--gs-fg)]">{invoice.invoiceNumber}</span>
                          <span className="text-[11px] text-[var(--gs-muted)]">{invoice.client?.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {(!searchResults.leads.length && !searchResults.clients.length && !searchResults.deals.length && !searchResults.projects.length && !searchResults.tasks.length && !searchResults.invoices.length) && (
                    <div className="px-4 py-6 text-center flex flex-col gap-1">
                      <span className="text-[13px] font-medium text-[var(--gs-fg)]">No results found</span>
                      <span className="text-[12px] text-[var(--gs-muted)]">Try a different search term</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Notifications"
            className="relative h-8 w-8 hover:bg-[var(--gs-surface)] rounded-[6px] flex items-center justify-center text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors cursor-pointer outline-none"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[var(--gs-bg)]" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-[340px] bg-[var(--gs-bg)] border border-[var(--gs-border)] rounded-[8px] shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-[var(--gs-border)] flex justify-between items-center">
                <h3 className="text-[13px] font-bold text-[var(--gs-fg)]">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center flex flex-col gap-1 text-[13px]">
                    <span className="text-[var(--gs-fg)] font-medium">No notifications yet</span>
                    <span className="text-[var(--gs-muted)] text-[12px]">Important workspace updates will appear here.</span>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id, notif.link)}
                      className={`px-4 py-3 border-b border-[var(--gs-surface)] last:border-0 hover:bg-[var(--gs-bg-alt)] cursor-pointer transition-colors ${!notif.isRead ? 'bg-[var(--gs-surface)]/30' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1 flex-shrink-0">
                          {getNotificationIcon(notif.type, notif.isRead)}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className={`text-[13px] truncate ${!notif.isRead ? 'text-[var(--gs-fg)] font-semibold' : 'text-[var(--gs-fg-secondary)]'}`}>
                            {notif.title}
                          </span>
                          {notif.body && (
                            <span className="text-[12px] text-[var(--gs-muted)] line-clamp-2 mt-0.5 leading-snug">
                              {notif.body}
                            </span>
                          )}
                          <span className="text-[10px] text-[var(--gs-muted-light)] mt-1 font-medium tracking-wide">
                            {timeAgo(notif.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="h-7 w-7 rounded-full bg-[var(--gs-fg)] flex items-center justify-center overflow-hidden border border-[var(--gs-border)] hover:ring-2 hover:ring-[var(--gs-border)] hover:ring-offset-2 hover:ring-offset-[var(--gs-bg)] transition-all cursor-pointer outline-none shrink-0"
            aria-expanded={dropdownOpen}
            aria-haspopup="menu"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-[var(--gs-bg)]">{userInitials}</span>
            )}
          </button>

          {dropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] rounded-[8px] shadow-2xl py-1 animate-in fade-in slide-in-from-top-2 duration-150"
              role="menu"
            >
              <div className="px-3 py-2 border-b border-[var(--gs-border)] mb-1">
                <p className="text-[12px] font-medium text-[var(--gs-fg)] truncate">My Account</p>
              </div>
              
              <button onClick={() => { router.push("/dashboard/profile"); setDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[var(--gs-surface)] transition-colors flex items-center gap-2" role="menuitem">
                <User className="h-3.5 w-3.5" /> Profile
              </button>
              
              <button onClick={() => { router.push("/dashboard/settings"); setDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[var(--gs-surface)] transition-colors flex items-center gap-2" role="menuitem">
                <Settings className="h-3.5 w-3.5" /> Settings
              </button>

              <div className="h-px bg-[var(--gs-border)] my-1"></div>
              
              <button 
                onClick={handleLogout}
                className="w-full text-left px-3 py-1.5 text-[12px] text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 font-medium"
                role="menuitem"
              >
                <LogOut className="h-3.5 w-3.5" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
