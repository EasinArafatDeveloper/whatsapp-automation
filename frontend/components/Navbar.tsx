'use client';

import Link from 'next/link';
import { MessageSquare, Sparkles, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, []);

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-6 h-6 text-slate-950 fill-current" />
          </div>
          <div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-emerald-400">
              WpAuto<span className="text-emerald-400">AI</span>
            </span>
            <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              WhatsApp Business Support
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-emerald-500/25 hover:shadow-emerald-400/40 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-emerald-500/25 hover:shadow-emerald-400/40 active:scale-95"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
