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
} from 'lucide-react';
import { clearAuth, getUser } from '@/lib/auth';
import { useEffect, useState } from 'react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Business Owner');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const user = getUser();
    if (user) {
      setUserName(user.name);
      setUserEmail(user.email);
    }
  }, []);

  const handleLogout = () => {
    clearAuth();
    if (onCloseMobile) onCloseMobile();
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

  return (
    <aside className="w-64 h-full min-h-screen bg-white border-r border-slate-200/90 flex flex-col justify-between p-4 shadow-sm">
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
              WpAuto<span className="text-blue-600">AI</span>
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
        </nav>
      </div>

      {/* User Profile Card & Logout */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
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
