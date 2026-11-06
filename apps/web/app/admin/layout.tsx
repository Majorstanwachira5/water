'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  DollarSign,
  Image as ImageIcon,
  FolderTree,
  Inbox,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  User as UserIcon,
  Lock,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  const STAFF_ROLES = ['Super Admin', 'Catalogue Manager', 'Content Manager', 'Enquiry Manager'];

  useEffect(() => {
    if (isLoginPage) {
      setAuthChecked(true);
      return;
    }

    const token = localStorage.getItem('michaforge_admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    const verifySession = async () => {
      try {
        const res = await fetch('/api/v1/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (res.ok && data?.success && data?.data) {
          const user = data.data;
          const isStaff = user.isActive && STAFF_ROLES.includes(user.role);

          if (!isStaff) {
            localStorage.removeItem('michaforge_admin_token');
            localStorage.removeItem('michaforge_admin_refresh_token');
            localStorage.removeItem('michaforge_admin_user');
            router.replace('/admin/login');
            return;
          }

          setCurrentUser(user);
          localStorage.setItem('michaforge_admin_user', JSON.stringify(user));
          setAuthChecked(true);
          return;
        }

        // If access token expired, attempt automatic session refresh
        const refreshToken = localStorage.getItem('michaforge_admin_refresh_token');
        if (refreshToken) {
          const refreshRes = await fetch('/api/v1/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          const refreshData = await refreshRes.json();

          if (refreshRes.ok && refreshData?.success && refreshData?.data?.accessToken) {
            const newToken = refreshData.data.accessToken;
            localStorage.setItem('michaforge_admin_token', newToken);

            // Re-verify with new token
            const retryRes = await fetch('/api/v1/auth/me', {
              headers: { Authorization: `Bearer ${newToken}` },
            });
            const retryData = await retryRes.json();

            if (retryRes.ok && retryData?.success && retryData?.data) {
              const retryUser = retryData.data;
              if (retryUser.isActive && STAFF_ROLES.includes(retryUser.role)) {
                setCurrentUser(retryUser);
                localStorage.setItem('michaforge_admin_user', JSON.stringify(retryUser));
                setAuthChecked(true);
                return;
              }
            }
          }
        }

        // Refresh failed or invalid session
        localStorage.removeItem('michaforge_admin_token');
        localStorage.removeItem('michaforge_admin_refresh_token');
        localStorage.removeItem('michaforge_admin_user');
        router.replace('/admin/login');
      } catch {
        localStorage.removeItem('michaforge_admin_token');
        localStorage.removeItem('michaforge_admin_refresh_token');
        localStorage.removeItem('michaforge_admin_user');
        router.replace('/admin/login');
      }
    };

    verifySession();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('michaforge_admin_refresh_token');
    if (refreshToken) {
      try {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {}
    }
    localStorage.removeItem('michaforge_admin_token');
    localStorage.removeItem('michaforge_admin_refresh_token');
    localStorage.removeItem('michaforge_admin_user');
    window.location.href = '/admin/login';
  };

  // Render login page without sidebar chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Block unauthenticated access while verifying JWT
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#073253] flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FF850D] flex items-center justify-center mb-4 shadow-lg">
          <Lock className="w-6 h-6 text-white animate-pulse" />
        </div>
        <p className="text-sm font-bold tracking-wide">Verifying Staff Credentials...</p>
        <p className="text-xs text-gray-300 mt-1">Password authentication required</p>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Manage Prices', href: '/admin/pricing', icon: DollarSign },
    { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Customer Enquiries', href: '/admin/enquiries', icon: Inbox },
    { label: 'Content & Branding', href: '/admin/content', icon: FileText },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#073253] text-white flex-shrink-0 border-r border-[#0B3556]">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#0B3556] flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#FF850D] flex items-center justify-center font-black text-white text-sm shadow">
            MF
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-wide">
              MICHAFORGE
            </h1>
            <span className="text-[10px] text-[#FF850D] font-bold uppercase tracking-wider block">
              Control Centre
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-[#FF850D] text-white shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#FF850D]'}`} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#0B3556] bg-[#052842]/50 space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">
                {currentUser?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {currentUser?.role || 'Super Admin'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#0B3556]/60 text-xs">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white flex items-center space-x-1"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#FF850D]" />
              <span>Public Site</span>
            </a>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#073253] text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-[#FF850D] flex items-center justify-center font-bold text-xs">
            MF
          </div>
          <span className="font-bold text-sm">Michaforge Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded text-gray-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="md:hidden bg-[#073253] text-white p-4 space-y-2 border-b border-[#0B3556]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold text-gray-200 hover:bg-white/10"
              >
                <Icon className="w-4 h-4 text-[#FF850D]" />
                <span>{item.label}</span>
              </a>
            );
          })}
          <div className="pt-3 border-t border-[#0B3556] flex items-center justify-between text-xs">
            <a href="/" target="_blank" className="text-gray-300">
              View Public Website
            </a>
            <button onClick={handleLogout} className="text-red-400 font-bold">
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
