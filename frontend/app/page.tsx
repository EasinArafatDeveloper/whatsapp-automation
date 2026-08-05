'use client';

import Navbar from '@/components/Navbar';
import PhoneChatMockup from '@/components/PhoneChatMockup';
import Footer from '@/components/Footer';
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
      <section className="relative py-16 md:py-24 px-6 overflow-hidden flex-1 bg-gradient-to-b from-blue-50/70 via-white to-slate-50">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* LEFT COLUMN: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold tracking-wider uppercase shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-600 animate-spin-slow" />
              Powered by DeepSeek AI & Baileys Socket
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-slate-900">
              Free <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">WhatsApp Business AI</span> Auto-Reply Engine
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
              কানেক্ট করুন মুহূর্তেই QR code বা Pairing Code দিয়ে — কোনো পরিশোধিত মেটা এপিআই ফি লাগবে না। প্রডাক্ট প্রাইস, প্যাকেজ ও FAQ উত্তর দিন ২৪/৭ সম্পূর্ণ অটোমেটিক্যালি।
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base transition-all shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-95"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-base transition-all hover:bg-slate-50 shadow-sm"
              >
                Sign In to Dashboard
              </Link>
            </div>

            {/* Key Feature Trust Badges */}
            <div className="pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>No Meta API Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>QR & 8-Digit Pairing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>24/7 DeepSeek V3 AI</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 3D Phone Chat Motion Graphic */}
          <div className="lg:col-span-5 flex justify-center items-center py-6 lg:py-0">
            <PhoneChatMockup />
          </div>
        </div>
      </section>

      {/* Feature Cards Bento Grid Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-50 via-blue-50/30 to-white relative overflow-hidden border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-extrabold tracking-wider uppercase shadow-sm">
              <Zap className="w-4 h-4 text-blue-600" /> Complete Feature Suite
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Everything You Need to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Automate WhatsApp</span>
            </h2>
            <p className="text-base text-slate-600 font-medium leading-relaxed">
              Engineered for small & medium businesses seeking professional AI customer support without expensive Meta API verification or per-message fees.
            </p>
          </div>

          {/* 6 Bento Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="group relative bg-white p-8 rounded-3xl border border-slate-200/90 hover:border-blue-500/60 transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                    <QrCode className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    No Meta API
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Baileys QR & 8-Digit Pairing
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Connect your existing WhatsApp Business number in seconds using Baileys socket. Scan QR code or enter an 8-digit mobile code directly from Linked Devices.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-blue-600">
                <span>Direct Mobile Socket</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-white p-8 rounded-3xl border border-slate-200/90 hover:border-indigo-500/60 transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    DeepSeek V3 AI
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Smart Context Engine
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Provide your product catalog, prices, policies, and FAQs. DeepSeek AI generates human-like, accurate, empathetic customer replies in Bangla and English.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-indigo-600">
                <span>Contextual AI Memory</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative bg-white p-8 rounded-3xl border border-slate-200/90 hover:border-emerald-500/60 transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                    <Zap className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Zero Delay
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Keyword Fallback Rules
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Define exact keyword response templates. If AI is toggled off or network delays occur, instant keyword rules take over without missing a single customer.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
                <span>Instant Fail-Safe Template</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="group relative bg-white p-8 rounded-3xl border border-slate-200/90 hover:border-cyan-500/60 transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                    Auto CRM
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-cyan-600 transition-colors">
                  Automated Customer Leads
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Every customer inquiry, phone number, and AI conversation is automatically captured and organized into your interactive dashboard CRM.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-cyan-600">
                <span>Lead Dashboard Management</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 5 */}
            <div className="group relative bg-white p-8 rounded-3xl border border-slate-200/90 hover:border-purple-500/60 transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                    <Bot className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Isolated SaaS
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">
                  Multi-Tenant Privacy
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Secure JWT authentication and isolated data storage. Your business knowledge base and WhatsApp credentials are completely private and encrypted.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-purple-600">
                <span>Encrypted Data Security</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 6 */}
            <div className="group relative bg-white p-8 rounded-3xl border border-slate-200/90 hover:border-blue-500/60 transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                    <Globe className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    24/7 Monitoring
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Real-Time Socket Status
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Automatic session auto-restore on server restarts. Monitor live connection state, active sessions, and AI replies from any device.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-blue-600">
                <span>Always-On Connection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How it Works 3-Step Dark Mode Glassmorphism Section */}
      <section className="py-24 px-6 bg-slate-950 text-white relative overflow-hidden">
        {/* Glowing Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-cyan-500/20 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-16 relative z-10 text-center">
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-500/30 text-blue-300 text-xs font-extrabold tracking-wider uppercase shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-400" /> Fast Onboarding
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Get Started in <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">3 Simple Steps</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium">Set up your automated WhatsApp AI bot in under 2 minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left relative">
            
            {/* Step 1 */}
            <div className="group relative bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 hover:border-blue-500/60 transition-all duration-300 shadow-2xl hover:-translate-y-2 space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform">
                  01
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Step One
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white group-hover:text-blue-400 transition-colors">
                  Create Business Account
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Sign up in 10 seconds to initialize your isolated multi-tenant business dashboard.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 hover:border-cyan-500/60 transition-all duration-300 shadow-2xl hover:-translate-y-2 space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                  02
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  Step Two
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white group-hover:text-cyan-400 transition-colors">
                  Link WhatsApp (QR or Code)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Open WhatsApp &gt; Linked Devices on your mobile. Scan the QR code or enter an 8-digit pairing code.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 hover:border-emerald-500/60 transition-all duration-300 shadow-2xl hover:-translate-y-2 space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  03
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Step Three
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                  Input Knowledge & Go Live
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Enter your product info, prices, and FAQs. DeepSeek AI starts answering customer messages 24/7!
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* High-Converting CTA Banner Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-10 sm:p-14 rounded-[36px] text-white shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight">
            Ready to Automate Your WhatsApp Support Today?
          </h2>

          <p className="text-blue-100 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Join business owners automating customer replies, product inquiries, and sales leads with 100% free socket setup.
          </p>

          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-base transition-all shadow-xl active:scale-95"
            >
              Launch Your Free AI Bot Now <ArrowRight className="w-5 h-5 text-blue-600" />
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-100/90 font-semibold">
            <span>✓ No Credit Card Needed</span>
            <span>•</span>
            <span>✓ No Meta API Approval</span>
            <span>•</span>
            <span>✓ Instant 8-Digit Pairing</span>
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
      <Footer />
    </div>
  );
}
