'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
  MessageSquare,
  Sparkles,
  QrCode,
  Zap,
  Bot,
  ArrowRight,
  Cpu,
  Database,
  Globe,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-6 overflow-hidden flex-1 bg-gradient-to-b from-blue-50/60 via-white to-slate-50">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wider uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" /> Powered by DeepSeek AI & Baileys Socket
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto text-slate-900">
            Free <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">WhatsApp Business AI Automation</span> & Auto Reply Platform
          </h1>

          <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Connect your WhatsApp number with a simple QR code scan — no official paid Meta API required. Let AI answer customer product questions, FAQs, and pricing 24/7.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base transition-all shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-95"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-base transition-all hover:bg-slate-50 shadow-sm"
            >
              Sign In to Dashboard
            </Link>
          </div>

          {/* Interactive Simulated WhatsApp Demo Mockup */}
          <div className="pt-12 max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-500 font-mono ml-2">Live WhatsApp Auto-Reply Simulator</span>
                </div>
                <span className="text-xs text-blue-700 font-bold px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
                  AI Active
                </span>
              </div>

              {/* Chat Simulation */}
              <div className="space-y-4 py-2 text-xs md:text-sm">
                {/* Customer Message */}
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-800 p-3.5 rounded-2xl rounded-tl-none max-w-md border border-slate-200 space-y-1">
                    <p className="font-bold text-blue-600 text-[11px]">Customer (+8801700000000)</p>
                    <p>আপনার কি AI অটোমেশন কোর্স বা সার্ভিস আছে? প্রাইস কত?</p>
                    <span className="text-[10px] text-slate-400 block text-right">10:42 AM</span>
                  </div>
                </div>

                {/* AI Reply Message */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white p-3.5 rounded-2xl rounded-tr-none max-w-md border border-blue-500 space-y-1 shadow-lg shadow-blue-600/10">
                    <p className="font-bold text-blue-200 text-[11px] flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5" /> WpAutoAI Assistant (Auto-Reply)
                    </p>
                    <p>
                      হ্যাঁ! আমাদের <strong>AI WhatsApp Support Automation Package</strong> পাওয়া যাচ্ছে।
                      <br />
                      • বেসিক সেটআপ: ৫,০০০ টাকা
                      <br />
                      • ফুল SaaS কাস্টম বোট: ১২,০০০ টাকা
                      <br />
                      আরও তথ্য জানতে বিস্তারিত প্রশ্ন করতে পারেন!
                    </p>
                    <span className="text-[10px] text-blue-100/70 block text-right">10:42 AM • Instant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-20 px-6 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900">Everything You Need to Automate WhatsApp</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
              Engineered specifically for small & medium businesses seeking professional AI support without heavy API fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-4 hover:border-blue-300 transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Baileys QR Scan Connection</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Connect your existing WhatsApp Business number directly using Baileys socket. No expensive Meta API verification needed.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-4 hover:border-blue-300 transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">DeepSeek AI Context Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Input your products, prices, FAQs, and policies. DeepSeek AI crafts human-like, accurate, contextual customer replies.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-4 hover:border-blue-300 transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Keyword Fallback Rules</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Define exact fallback templates. If the AI is turned off or encounters a network delay, keyword rules take over seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works 3-Step Section */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto space-y-12 text-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900">Get Started in 3 Simple Steps</h2>
            <p className="text-sm text-slate-500 font-medium">Set up your automated WhatsApp AI bot in under 2 minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-base shadow-md shadow-blue-600/20">
                1
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Create Account</h3>
              <p className="text-xs text-slate-600 font-medium">
                Sign up for free and initialize your isolated SaaS business tenant.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-base shadow-md shadow-blue-600/20">
                2
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Scan WhatsApp QR</h3>
              <p className="text-xs text-slate-600 font-medium">
                Open Linked Devices on your phone and scan the active socket QR code.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-base shadow-md shadow-blue-600/20">
                3
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Input Knowledge Base</h3>
              <p className="text-xs text-slate-600 font-medium">
                Fill in your product list & FAQ details. Your AI assistant starts replying instantly!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="py-12 border-t border-slate-200 bg-white px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6 text-xs text-slate-500 font-mono">
          <span className="font-bold text-slate-700">Open-Source Tech Stack:</span>
          <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-600" /> Next.js App Router</span>
          <span className="flex items-center gap-2"><Cpu className="w-4 h-4 text-blue-600" /> Node.js & Baileys Socket</span>
          <span className="flex items-center gap-2"><Database className="w-4 h-4 text-blue-600" /> MongoDB Atlas</span>
          <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-600" /> DeepSeek API</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} WpAutoAI SaaS. All rights reserved.</p>
          <p>Built with Next.js, Baileys, MongoDB, and DeepSeek AI.</p>
        </div>
      </footer>
    </div>
  );
}
