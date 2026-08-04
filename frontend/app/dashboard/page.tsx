'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { getUser, UserProfile } from '@/lib/auth';
import {
  QrCode,
  Building2,
  FileCode2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Zap,
  Users,
} from 'lucide-react';

interface BusinessSummary {
  businessName: string;
  aiEnabled: boolean;
  templatesCount: number;
  hasKnowledgeBase: boolean;
}

interface ConnectionStatus {
  status: string;
  number?: string | null;
}

export default function DashboardOverviewPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [connStatus, setConnStatus] = useState<ConnectionStatus>({ status: 'disconnected' });
  const [leadsCount, setLeadsCount] = useState<number>(0);
  const [bizSummary, setBizSummary] = useState<BusinessSummary>({
    businessName: 'My Business',
    aiEnabled: true,
    templatesCount: 0,
    hasKnowledgeBase: false,
  });

  useEffect(() => {
    setUser(getUser());

    const loadData = async () => {
      try {
        const [statusData, bizData, leadsData] = await Promise.all([
          fetchApi<ConnectionStatus>('/api/whatsapp/status').catch(() => ({ status: 'disconnected' })),
          fetchApi<{ business: any }>('/api/business').catch(() => ({ business: null })),
          fetchApi<{ leads: any[] }>('/api/leads').catch(() => ({ leads: [] })),
        ]);

        setConnStatus(statusData);
        if (leadsData && leadsData.leads) {
          setLeadsCount(leadsData.leads.length);
        }

        if (bizData.business) {
          const b = bizData.business;
          setBizSummary({
            businessName: b.businessName || 'My Business',
            aiEnabled: b.aiEnabled ?? true,
            templatesCount: b.templates ? b.templates.length : 0,
            hasKnowledgeBase: !!(b.description || b.products || b.faq || b.policies),
          });
        }
      } catch (err) {
        console.error('Failed to load overview metrics:', err);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-3.5 h-3.5" /> Platform Dashboard
            </span>
            <h1 className="text-3xl font-extrabold text-white">
              Welcome back, <span className="text-emerald-400">{user?.name || 'Business Owner'}</span>!
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Manage your AI knowledge base, monitor WhatsApp connection, and view captured customer leads.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/leads"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              View Leads ({leadsCount})
            </Link>

            <Link
              href="/dashboard/connect"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 shrink-0"
            >
              <QrCode className="w-4 h-4" />
              Connect WhatsApp
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Connection Status Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              WhatsApp Status
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-extrabold text-white flex items-center gap-2">
              {connStatus.status === 'connected' ? (
                <span className="text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" /> Active
                </span>
              ) : (
                <span className="text-slate-400">Disconnected</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {connStatus.number ? `Linked: +${connStatus.number}` : 'No phone linked'}
            </p>
          </div>

          <Link
            href="/dashboard/connect"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline pt-2 border-t border-slate-800 w-full"
          >
            Manage connection <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Captured Leads Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Captured Leads
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-extrabold text-white">{leadsCount} Customers</div>
            <p className="text-xs text-slate-400 mt-1">Auto-saved from WhatsApp AI chats</p>
          </div>

          <Link
            href="/dashboard/leads"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline pt-2 border-t border-slate-800 w-full"
          >
            View Customer Leads <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* AI Engine Status */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              AI Support Engine
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-extrabold text-white">
              {bizSummary.aiEnabled ? (
                <span className="text-emerald-400">Enabled</span>
              ) : (
                <span className="text-amber-400">Disabled</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {bizSummary.hasKnowledgeBase ? 'Knowledge Base active' : 'Knowledge Base incomplete'}
            </p>
          </div>

          <Link
            href="/dashboard/business"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline pt-2 border-t border-slate-800 w-full"
          >
            Edit business context <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Fallback Rules Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Fallback Rules
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileCode2 className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-extrabold text-white">{bizSummary.templatesCount} Rules</div>
            <p className="text-xs text-slate-400 mt-1">Keyword template fallbacks</p>
          </div>

          <Link
            href="/dashboard/templates"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline pt-2 border-t border-slate-800 w-full"
          >
            Manage rules <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Interactive Guided Onboarding Stepper */}
      {(() => {
        const isStep1Done = connStatus.status === 'connected';
        const isStep2Done = bizSummary.hasKnowledgeBase;
        const isStep3Done = bizSummary.templatesCount > 0;

        let completedSteps = 0;
        if (isStep1Done) completedSteps++;
        if (isStep2Done) completedSteps++;
        if (isStep3Done) completedSteps++;

        const progressPercent = Math.round((completedSteps / 3) * 100);
        const isFullySetup = isStep1Done && isStep2Done;

        return (
          <div className="space-y-6">
            {/* Congratulatory Setup Complete Banner */}
            {isFullySetup ? (
              <div className="glass-panel p-8 rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 shadow-2xl relative overflow-hidden space-y-4">
                <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold shadow-lg shadow-emerald-500/30 shrink-0">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                          Setup Ready • 100% Active
                        </span>
                      </div>
                      <h2 className="text-xl font-extrabold text-white">
                        Your WhatsApp AI Support Agent is Live!
                      </h2>
                      <p className="text-xs text-slate-300">
                        Customers sending messages on WhatsApp will now receive intelligent context-aware replies from DeepSeek AI.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/leads"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-emerald-500/25 shrink-0"
                  >
                    <Users className="w-4 h-4" />
                    View Captured Customer Leads
                  </Link>
                </div>
              </div>
            ) : null}

            {/* Step-by-Step Guided Wizard Card */}
            <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
                      <Sparkles className="w-5 h-5 text-emerald-400" /> Interactive Setup Guide
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Follow these 3 steps in order to activate your WhatsApp AI Customer Support.
                  </p>
                </div>

                {/* Progress Bar & Badge */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-32 bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {progressPercent}% Done
                  </span>
                </div>
              </div>

              {/* Step Items */}
              <div className="space-y-4">
                {/* Step 1: Connect WhatsApp */}
                <div
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isStep1Done
                      ? 'bg-slate-900/60 border-slate-800/80'
                      : 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                  }`}
                >
                  <div className="flex items-start md:items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 border ${
                        isStep1Done
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 animate-pulse'
                      }`}
                    >
                      {isStep1Done ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">
                          Step 1: Scan & Link WhatsApp QR Code
                        </h4>
                        {!isStep1Done && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                            Action Required First
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        Link your mobile phone using Linked Devices so Baileys socket can monitor incoming chats.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/connect"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
                      isStep1Done
                        ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    {isStep1Done ? 'Connected (View Status)' : 'Scan QR Now →'}
                  </Link>
                </div>

                {/* Step 2: Knowledge Base */}
                <div
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isStep2Done
                      ? 'bg-slate-900/60 border-slate-800/80'
                      : isStep1Done
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                      : 'bg-slate-900/30 border-slate-800/40 opacity-70'
                  }`}
                >
                  <div className="flex items-start md:items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 border ${
                        isStep2Done
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : isStep1Done
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 animate-pulse'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      {isStep2Done ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">
                          Step 2: Enter Business Profile & Knowledge Base
                        </h4>
                        {!isStep2Done && isStep1Done && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                            Next Step
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        Input business description, product prices, FAQ answers, and return policies.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/business"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
                      isStep2Done
                        ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    {isStep2Done ? 'Knowledge Configured' : 'Setup Knowledge →'}
                  </Link>
                </div>

                {/* Step 3: Fallback Templates */}
                <div
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isStep3Done
                      ? 'bg-slate-900/60 border-slate-800/80'
                      : 'bg-slate-900/30 border-slate-800/40'
                  }`}
                >
                  <div className="flex items-start md:items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 border ${
                        isStep3Done
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {isStep3Done ? <CheckCircle2 className="w-5 h-5" /> : '3'}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-base font-bold text-white">
                        Step 3: Add Keyword Fallback Templates (Optional)
                      </h4>
                      <p className="text-xs text-slate-400">
                        Configure predefined auto-reply rules for specific keywords when AI is offline.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/templates"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-bold text-xs transition-all shrink-0"
                  >
                    <FileCode2 className="w-4 h-4 text-emerald-400" />
                    {isStep3Done ? `${bizSummary.templatesCount} Rules Added` : 'Add Rules →'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
