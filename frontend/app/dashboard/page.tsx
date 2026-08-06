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
  ChevronRight,
  HelpCircle,
  Smartphone,
  X,
} from 'lucide-react';

import { DashboardOverviewSkeleton } from '@/components/SkeletonLoader';

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
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [connStatus, setConnStatus] = useState<ConnectionStatus>({ status: 'disconnected' });
  const [leadsCount, setLeadsCount] = useState<number>(0);
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
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
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <DashboardOverviewSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Zap className="w-3.5 h-3.5 text-blue-600" /> Platform Dashboard
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Welcome back, <span className="text-blue-600">{user?.name || 'Business Owner'}</span>!
            </h1>
            <p className="text-sm text-slate-600 max-w-xl font-medium">
              Manage your AI knowledge base, monitor WhatsApp connection, and view captured customer leads.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/leads"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 transition-all"
            >
              <Users className="w-4 h-4 text-blue-600" />
              View Leads ({leadsCount})
            </Link>

            <Link
              href="/dashboard/connect"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95 shrink-0"
            >
              <QrCode className="w-4 h-4" />
              Connect WhatsApp
            </Link>
          </div>
        </div>
      </div>

      {/* 3-Step Setup Chain Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600 animate-bounce" />
              Getting Started — Setup Steps
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Complete these steps to activate full WhatsApp AI auto-reply for your business
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <span>Progress:</span>
            <span className="text-blue-600 font-extrabold">
              {[connStatus.status === 'connected', bizSummary.hasKnowledgeBase, bizSummary.templatesCount > 0].filter(Boolean).length} / 3 Complete
            </span>
          </div>
        </div>

        {/* 3 Steps Chain Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 relative">
          
          {/* STEP 1: Connect WhatsApp */}
          <div
            onClick={() => setShowConnectModal(true)}
            className={`group cursor-pointer p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between space-y-4 hover:shadow-lg active:scale-98 ${
              connStatus.status === 'connected'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'bg-gradient-to-br from-blue-50/90 to-indigo-50/80 text-slate-900 border-blue-500/40 ring-2 ring-blue-500/20 shadow-sm animate-pulse-subtle'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl border flex items-center justify-center ${
                connStatus.status === 'connected'
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-blue-600 text-white border-blue-500'
              }`}>
                <Smartphone className="w-6 h-6" />
              </div>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border flex items-center gap-1 ${
                connStatus.status === 'connected'
                  ? 'bg-white text-blue-700 border-white'
                  : 'bg-blue-600 text-white border-blue-500 animate-pulse'
              }`}>
                {connStatus.status === 'connected' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1. Connected
                  </>
                ) : (
                  '1. Connect WhatsApp'
                )}
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-base flex items-center gap-1.5">
                Connect WhatsApp
                <HelpCircle className={`w-4 h-4 opacity-75 group-hover:scale-110 transition-transform ${
                  connStatus.status === 'connected' ? 'text-blue-100' : 'text-blue-600'
                }`} />
              </h3>
              <p className={`text-xs font-medium mt-1 leading-relaxed ${
                connStatus.status === 'connected' ? 'text-blue-100' : 'text-slate-600'
              }`}>
                Scan QR code to connect your WhatsApp Business account. Click to view quick connection guide!
              </p>
            </div>

            <div className="pt-2 border-t border-current/10 flex items-center justify-between text-xs font-bold">
              <span className={connStatus.status === 'connected' ? 'text-blue-100' : 'text-blue-600'}>
                {connStatus.status === 'connected' ? '✓ WhatsApp Linked' : 'Click to see how to connect →'}
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* STEP 2: Set Business Knowledge (AI) */}
          <Link
            href="/dashboard/business"
            className={`group p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between space-y-4 hover:shadow-lg active:scale-98 ${
              bizSummary.hasKnowledgeBase
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : connStatus.status === 'connected'
                ? 'bg-gradient-to-br from-blue-50/90 to-indigo-50/80 text-slate-900 border-blue-500/40 ring-2 ring-blue-500/30 animate-pulse'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl border flex items-center justify-center ${
                bizSummary.hasKnowledgeBase
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-indigo-600 text-white border-indigo-500'
              }`}>
                <Building2 className="w-6 h-6" />
              </div>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border flex items-center gap-1 ${
                bizSummary.hasKnowledgeBase
                  ? 'bg-white text-blue-700 border-white'
                  : connStatus.status === 'connected'
                  ? 'bg-indigo-600 text-white border-indigo-500 animate-pulse'
                  : 'bg-slate-200 text-slate-700 border-slate-300'
              }`}>
                {bizSummary.hasKnowledgeBase ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> 2. Completed
                  </>
                ) : (
                  '2. AI Knowledge'
                )}
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-base">Set Business Knowledge</h3>
              <p className={`text-xs font-medium mt-1 leading-relaxed ${
                bizSummary.hasKnowledgeBase ? 'text-blue-100' : 'text-slate-600'
              }`}>
                Add product info, FAQs & business rules so AI knows how to answer customer questions automatically.
              </p>
            </div>

            <div className="pt-2 border-t border-current/10 flex items-center justify-between text-xs font-bold">
              <span className={bizSummary.hasKnowledgeBase ? 'text-blue-100' : 'text-blue-600'}>
                {bizSummary.hasKnowledgeBase ? '✓ Knowledge Base Active' : 'Setup AI Knowledge →'}
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* STEP 3: Fallback Templates (OPTIONAL) */}
          <Link
            href="/dashboard/templates"
            className={`group p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between space-y-4 hover:shadow-lg active:scale-98 ${
              bizSummary.templatesCount > 0
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : bizSummary.hasKnowledgeBase
                ? 'bg-gradient-to-br from-blue-50/90 to-indigo-50/80 text-slate-900 border-blue-500/40 ring-2 ring-blue-500/20'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl border flex items-center justify-center ${
                bizSummary.templatesCount > 0
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-blue-600 text-white border-blue-500'
              }`}>
                <FileCode2 className="w-6 h-6" />
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  bizSummary.templatesCount > 0
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  Optional (না করলেও চলবে)
                </span>

                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                  bizSummary.templatesCount > 0
                    ? 'bg-white text-blue-700 border-white'
                    : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  {bizSummary.templatesCount > 0 ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> 3. Set
                    </>
                  ) : (
                    '3. Ready Templates'
                  )}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-base">Fallback Templates</h3>
              <p className={`text-xs font-medium mt-1 leading-relaxed ${
                bizSummary.templatesCount > 0 ? 'text-blue-100' : 'text-slate-600'
              }`}>
                Set ready-made quick response templates. <strong className="underline font-bold">Note:</strong> AI will answer automatically even without templates!
              </p>
            </div>

            <div className="pt-2 border-t border-current/10 flex items-center justify-between text-xs font-bold">
              <span className={bizSummary.templatesCount > 0 ? 'text-blue-100' : 'text-blue-600'}>
                {bizSummary.templatesCount > 0 ? '✓ Templates Set' : 'Manage Templates (Optional) →'}
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Connection Status Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              WhatsApp Status
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              {connStatus.status === 'connected' ? (
                <span className="text-emerald-600 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" /> Active
                </span>
              ) : (
                <span className="text-slate-400">Disconnected</span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {connStatus.number ? `Linked: +${connStatus.number}` : 'No phone linked'}
            </p>
          </div>

          <Link
            href="/dashboard/connect"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline pt-2 border-t border-slate-100 w-full"
          >
            Manage connection <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Captured Leads Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Captured Leads
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-extrabold text-slate-900">{leadsCount} Customers</div>
            <p className="text-xs text-slate-500 font-medium mt-1">Auto-saved from WhatsApp AI chats</p>
          </div>

          <Link
            href="/dashboard/leads"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline pt-2 border-t border-slate-100 w-full"
          >
            View Customer Leads <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* AI Engine Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              AI Support Engine
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {bizSummary.aiEnabled ? (
                <span className="text-emerald-600">Enabled</span>
              ) : (
                <span className="text-amber-600">Disabled</span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {bizSummary.hasKnowledgeBase ? 'Knowledge Base active' : 'Knowledge Base incomplete'}
            </p>
          </div>

          <Link
            href="/dashboard/business"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline pt-2 border-t border-slate-100 w-full"
          >
            Edit business context <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Fallback Rules Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Fallback Rules
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <FileCode2 className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-extrabold text-slate-900">{bizSummary.templatesCount} Rules</div>
            <p className="text-xs text-slate-500 font-medium mt-1">Keyword template fallbacks</p>
          </div>

          <Link
            href="/dashboard/templates"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline pt-2 border-t border-slate-100 w-full"
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
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 rounded-3xl border border-blue-700 text-white shadow-xl relative overflow-hidden space-y-4">
                <div className="absolute right-0 top-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-extrabold shadow-lg shrink-0">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full bg-blue-400/20 text-blue-200 border border-blue-300/30 text-xs font-bold uppercase tracking-wider">
                          Setup Ready • 100% Active
                        </span>
                      </div>
                      <h2 className="text-xl font-extrabold text-white">
                        Your WhatsApp AI Support Agent is Live!
                      </h2>
                      <p className="text-xs text-blue-100 font-medium">
                        Customers sending messages on WhatsApp will now receive intelligent context-aware replies from DeepSeek AI.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/leads"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-blue-900 font-extrabold text-sm transition-all shadow-xl shrink-0"
                  >
                    <Users className="w-4 h-4 text-blue-600" />
                    View Captured Customer Leads
                  </Link>
                </div>
              </div>
            ) : null}

            {/* Step-by-Step Guided Wizard Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                      <Sparkles className="w-5 h-5 text-blue-600" /> Interactive Setup Guide
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Follow these 3 steps in order to activate your WhatsApp AI Customer Support.
                  </p>
                </div>

                {/* Progress Bar & Badge */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-32 bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-blue-600 font-mono">
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
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-blue-50/50 border-blue-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start md:items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 border ${
                        isStep1Done
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                          : 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 animate-pulse'
                      }`}
                    >
                      {isStep1Done ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900">
                          Step 1: Scan & Link WhatsApp QR Code
                        </h4>
                        {!isStep1Done && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold uppercase tracking-wider">
                            Action Required First
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        Link your mobile phone using Linked Devices so Baileys socket can monitor incoming chats.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/connect"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
                      isStep1Done
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
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
                      ? 'bg-slate-50 border-slate-200'
                      : isStep1Done
                      ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                      : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-start md:items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 border ${
                        isStep2Done
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                          : isStep1Done
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 animate-pulse'
                          : 'bg-slate-200 text-slate-500 border-slate-300'
                      }`}
                    >
                      {isStep2Done ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900">
                          Step 2: Enter Business Profile & Knowledge Base
                        </h4>
                        {!isStep2Done && isStep1Done && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold uppercase tracking-wider">
                            Next Step
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        Input business description, product prices, FAQ answers, and return policies.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/business"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
                      isStep2Done
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
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
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start md:items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 border ${
                        isStep3Done
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}
                    >
                      {isStep3Done ? <CheckCircle2 className="w-5 h-5" /> : '3'}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-base font-extrabold text-slate-900">
                        Step 3: Add Keyword Fallback Templates (Optional)
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        Configure predefined auto-reply rules for specific keywords when AI is offline.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/templates"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-all shrink-0"
                  >
                    <FileCode2 className="w-4 h-4 text-blue-600" />
                    {isStep3Done ? `${bizSummary.templatesCount} Rules Added` : 'Add Rules →'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Interactive Modal for Step 1 Connection Instructions */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative">
            <button
              onClick={() => setShowConnectModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">How to Connect WhatsApp</h3>
                <p className="text-xs text-slate-500 font-medium">Follow these quick steps to link your device</p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-700">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0">1</span>
                <p className="pt-0.5">Open <strong>WhatsApp</strong> on your mobile phone.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0">2</span>
                <p className="pt-0.5">Go to <strong>Settings</strong> (or 3 dots menu) &gt; <strong>Linked Devices</strong>.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0">3</span>
                <p className="pt-0.5">Tap <strong>Link a Device</strong> and scan the QR Code on our Connect page!</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConnectModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition-all"
              >
                Close Guide
              </button>
              <Link
                href="/dashboard/connect"
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all text-center shadow-md shadow-blue-600/20"
              >
                Go to Connect Page →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
