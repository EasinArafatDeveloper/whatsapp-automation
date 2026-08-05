'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  QrCode,
  Building2,
  FileCode2,
  Users,
  LogOut,
  MessageSquare,
  Crown,
  ShieldCheck,
} from 'lucide-react';
import { clearAuth, getUser } from '@/lib/auth';
import { showToast, showConfirmAlert } from '@/lib/alert';
import { useEffect, useState } from 'react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Business Owner');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    const user = getUser();
    if (user) {
      setUserName(user.name);
      setUserEmail(user.email);
      setUserRole(user.role || (user.email === 'contact.scaleupweb@gmail.com' ? 'admin' : 'user'));
    }
  }, []);

  const handleLogout = async () => {
    const confirmed = await showConfirmAlert(
      'Log Out Account?',
      'Are you sure you want to log out of your dashboard session?',
      'Yes, Log Out'
    );

    if (!confirmed) return;

    clearAuth();
    if (onCloseMobile) onCloseMobile();
    showToast.success('Logged out successfully!');
    router.push('/login');
  };

  const navItems = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Customer Leads',
      href: '/dashboard/leads',
      icon: Users,
    },
    {
      name: 'Connect WhatsApp',
      href: '/dashboard/connect',
      icon: QrCode,
    },
    {
      name: 'Business Context',
      href: '/dashboard/business',
      icon: Building2,
    },
    {
      name: 'Fallback Templates',
      href: '/dashboard/templates',
      icon: FileCode2,
    },
  ];

  const isAdmin = userRole === 'admin' || userEmail === 'contact.scaleupweb@gmail.com';

  return (
    <aside className="w-64 h-full min-h-screen bg-white border-r border-slate-200/90 flex flex-col justify-between p-4 shadow-sm font-sans">
      <div>
        {/* Brand Header */}
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-100"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <MessageSquare className="w-5 h-5 text-white fill-current" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              Sohoj<span className="text-blue-600">Reply</span>
            </span>
            <span className="block text-[10px] text-blue-600 font-bold uppercase tracking-widest">
              SaaS Engine
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200/80 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}

          {/* Super Admin Portal Menu Item */}
          {isAdmin && (
            <div className="pt-3 mt-3 border-t border-slate-100">
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-purple-600 block mb-1.5">
                Super Admin
              </span>
              <Link
                href="/dashboard/admin"
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-extrabold text-sm transition-all ${
                  pathname === '/dashboard/admin'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                    : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80'
                }`}
              >
                <Crown className={`w-5 h-5 ${pathname === '/dashboard/admin' ? 'text-amber-300' : 'text-purple-600'}`} />
                Admin Portal
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* User Profile Card & Logout */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-900 truncate flex items-center gap-1">
              {userName}
              {isAdmin && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
            </p>
            <p className="text-xs text-slate-500 truncate">{userEmail}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/60 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
