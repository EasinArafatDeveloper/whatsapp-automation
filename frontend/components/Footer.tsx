'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Mail,
  CheckCircle2,
  Copy,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Bot,
  Globe,
} from 'lucide-react';

export default function Footer() {
  const [copied, setCopied] = useState<boolean>(false);
  const supportEmail = 'contact.scaleupweb@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 relative overflow-hidden font-sans">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* COLUMN 1: Brand & Support Email (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-blue-500/25">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  WpAuto<span className="text-blue-500">AI</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  SaaS Engine
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-medium max-w-sm">
              Automate customer support & sales on WhatsApp 24/7 with DeepSeek AI. Connect your phone instantly using QR code or 8-Digit Pairing Code without expensive Meta API fees.
            </p>

            {/* Support Email Card */}
            <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 space-y-2.5 max-w-sm shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Customer Support Email
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 bg-slate-900/90 px-3 py-2.5 rounded-xl border border-slate-700 text-xs font-mono text-white">
                <a
                  href={`mailto:${supportEmail}`}
                  className="truncate hover:text-blue-400 transition-colors font-medium"
                >
                  {supportEmail}
                </a>
                <button
                  onClick={handleCopyEmail}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shrink-0 active:scale-95"
                  title="Copy Support Email"
                >
                  {copied ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-l-2 border-blue-500 pl-2.5">
              Platform Features
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-400">
              <li>
                <Link href="/dashboard/connect" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-blue-500" /> WhatsApp QR & Pairing Connect
                </Link>
              </li>
              <li>
                <Link href="/dashboard/business" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-blue-500" /> DeepSeek Business AI Context
                </Link>
              </li>
              <li>
                <Link href="/dashboard/leads" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Auto Customer Lead CRM
                </Link>
              </li>
              <li>
                <Link href="/dashboard/templates" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Keyword Fallback Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Account & Portal (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-l-2 border-indigo-500 pl-2.5">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-400">
              <li>
                <Link href="/login" className="hover:text-white transition-colors flex items-center gap-1">
                  Dashboard Login <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors flex items-center gap-1">
                  Create Free Account <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Overview Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: Need Help / Dedicated Support (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 p-5 rounded-2xl border border-blue-500/20 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-400" /> Need Help or Custom Setup?
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Our support team is ready to assist you with WhatsApp connection, custom AI prompts, or SaaS configuration.
              </p>
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Mail className="w-3.5 h-3.5" /> Email Support Team
              </a>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR: Copyright & Tech Details */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} WpAutoAI SaaS Engine. All rights reserved.</p>
          
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-500" /> Next.js & Baileys Socket
            </span>
            <span>•</span>
            <a
              href={`mailto:${supportEmail}`}
              className="hover:text-white transition-colors"
            >
              {supportEmail}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
