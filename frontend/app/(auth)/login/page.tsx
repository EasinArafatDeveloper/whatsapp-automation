'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { setAuthData, UserProfile } from '@/lib/auth';
import {
  MessageSquare,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface LoginResponse {
  token: string;
  user: UserProfile;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white text-slate-900 font-sans select-none">
      {/* LEFT SIDE BANNERS & BRAND SHOWCASE (Desktop) */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-slate-950 text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden border-r border-slate-800">
        {/* Ambient Glowing Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Top Brand Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight">
                Sohoj<span className="text-blue-500">Reply</span>
              </span>
              <span className="block text-[10px] text-blue-400 font-bold tracking-widest uppercase">
                WhatsApp Business AI
              </span>
            </div>
          </Link>
        </div>

        {/* Main Hero Showcase */}
        <div className="relative z-10 space-y-8 max-w-xl my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-extrabold shadow-inner">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>DeepSeek V3 Powered Auto-Reply Platform</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Automate WhatsApp Customer Support 24/7 with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">Zero Meta API Fees.</span>
          </h1>

          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            Connect your WhatsApp Business number in seconds using QR Code scan or 8-Digit Pairing Code. Capture leads, automate customer replies in Bangla & English automatically.
          </p>

          {/* Feature Badges Grid */}
          <div className="space-y-3.5 pt-2">
            {[
              { title: 'Free QR Scan Setup', desc: 'No complex Meta API approval needed' },
              { title: 'Smart DeepSeek AI', desc: 'Replies according to your product knowledge base' },
              { title: 'Automated Lead Logging', desc: 'Captures intent, customer names & phone numbers' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800 backdrop-blur-md">
                <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">{feature.title}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Floating Trust Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/80 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Active Multi-Device Engine</span>
                <span className="text-[10px] text-slate-400 font-medium">99.9% Socket Uptime SLA</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              100% Free
            </span>
          </div>
        </div>

        {/* Bottom Footer Info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 font-medium pt-6 border-t border-slate-800">
          <p>© {new Date().getFullYear()} Sohoj Reply Engine. All rights reserved.</p>
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Encrypted Baileys Socket</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE FORM CONTAINER */}
      <div className="lg:col-span-6 xl:col-span-5 p-6 sm:p-12 xl:p-16 flex flex-col justify-between bg-slate-50/50 min-h-screen">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Website
          </Link>

          {/* Mobile Only Brand Logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <MessageSquare className="w-4 h-4 fill-current" />
            </div>
            <span className="font-extrabold text-base text-slate-900">
              Sohoj<span className="text-blue-600">Reply</span>
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome Back 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Enter your credentials to manage your WhatsApp AI automation engine.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-slate-600 font-semibold">Remember me</span>
              </label>
            </div>

            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-600/25 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2.5 group"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" variant="white" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Log In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Signup */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-semibold">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-700 font-black hover:underline inline-flex items-center gap-1 ml-1"
              >
                Create Free Account <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Footer Help */}
        <div className="text-center pt-8">
          <p className="text-[11px] text-slate-400 font-medium">
            Need help? Email support at{' '}
            <a href="mailto:contact.scaleupweb@gmail.com" className="text-blue-600 hover:underline font-bold">
              contact.scaleupweb@gmail.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
