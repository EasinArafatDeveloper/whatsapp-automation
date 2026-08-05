'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

const SUPER_TOKEN_KEY = 'wp_super_admin_token';
const RAILWAY_BACKEND = 'https://whatsapp-automation-production-9851.up.railway.app';

const getApiBase = () => {
  if (typeof window === 'undefined') return RAILWAY_BACKEND;
  if (window.location.hostname === 'localhost') return 'http://localhost:5000';
  return RAILWAY_BACKEND;
};

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${getApiBase()}/api/super-admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      localStorage.setItem(SUPER_TOKEN_KEY, data.token);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-2xl shadow-violet-900/50 mx-auto">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Super Admin Portal
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-1">
              WpAutoAI — Platform Management Console
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-900/40 border border-violet-700/40 text-violet-300 text-xs font-bold">
            <Lock className="w-3 h-3" /> Restricted Access Only
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/40">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@wpautoai.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-900/30 border border-rose-700/40 text-rose-300 text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-violet-900/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Access Admin Console
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-600 font-medium">
              This portal is restricted to authorized platform administrators only.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6 font-medium">
          WpAutoAI SaaS Platform · Unauthorized access is prohibited
        </p>
      </div>
    </div>
  );
}
