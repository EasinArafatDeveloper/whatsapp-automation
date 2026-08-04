'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { setAuthData, UserProfile } from '@/lib/auth';
import { MessageSquare, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

interface LoginResponse {
  token: string;
  user: UserProfile;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const data = await fetchApi<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setAuthData(data.token, data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0b1319]">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-7 h-7 text-slate-950 fill-current" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-white">Welcome Back</h1>
          <p className="text-xs text-slate-400 mt-1">Log in to manage your WhatsApp AI Support platform</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Logging in...' : 'Log In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-emerald-400 hover:underline font-semibold">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
