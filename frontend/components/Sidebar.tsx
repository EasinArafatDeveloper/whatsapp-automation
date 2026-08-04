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
  ShieldCheck,
} from 'lucide-react';
import { clearAuth, getUser } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function Sidebar() {
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
    <aside className="w-64 h-screen bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between p-4 sticky top-0">
      <div>
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <MessageSquare className="w-5 h-5 text-slate-950 fill-current" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">WpAutoAI</span>
            <span className="block text-[10px] text-emerald-400 font-semibold uppercase tracking-widest">
              SaaS Engine
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile Card & Logout */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/40">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
