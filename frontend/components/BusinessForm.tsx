'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Save, Building2, Package, HelpCircle, ShieldAlert, Sparkles, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';

interface BusinessData {
  businessName: string;
  description: string;
  products: string;
  faq: string;
  policies: string;
  tone: string;
  aiEnabled: boolean;
}

export default function BusinessForm() {
  const [formData, setFormData] = useState<BusinessData>({
    businessName: '',
    description: '',
    products: '',
    faq: '',
    policies: '',
    tone: 'friendly and professional',
    aiEnabled: true,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadBusinessData = async () => {
      try {
        const res = await fetchApi<{ business: BusinessData }>('/api/business');
        if (res.business) {
          setFormData({
            businessName: res.business.businessName || '',
            description: res.business.description || '',
            products: res.business.products || '',
            faq: res.business.faq || '',
            policies: res.business.policies || '',
            tone: res.business.tone || 'friendly and professional',
            aiEnabled: res.business.aiEnabled ?? true,
          });
        }
      } catch (err: any) {
        setMsg({ type: 'error', text: err.message || 'Failed to load business info' });
      } finally {
        setLoading(false);
      }
    };
    loadBusinessData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleAi = () => {
    setFormData((prev) => ({ ...prev, aiEnabled: !prev.aiEnabled }));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all form fields?')) {
      setFormData({
        businessName: '',
        description: '',
        products: '',
        faq: '',
        policies: '',
        tone: '',
        aiEnabled: formData.aiEnabled,
      });
      setMsg({ type: 'success', text: 'All fields cleared! Click "Save Knowledge Base" to confirm changes.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      await fetchApi('/api/business', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setMsg({ type: 'success', text: 'Business profile successfully updated!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save business info' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-400">Loading business profile...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {msg && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium flex items-center gap-3 border shadow-lg ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5'
              : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/5'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* AI Toggle Header Card */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">AI Auto-Reply Engine</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              DeepSeek AI generates intelligent responses using your business context below.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleAi}
          className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            formData.aiEnabled ? 'bg-emerald-500' : 'bg-slate-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-slate-950 shadow-md ring-0 transition duration-200 ease-in-out ${
              formData.aiEnabled ? 'translate-x-8' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Main Form Card */}
      <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-emerald-400" /> Business Knowledge Base
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Provide accurate information so AI can answer customer questions directly.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-all shrink-0 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All Fields
          </button>
        </div>

        {/* Section 1: General Info & Tone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Business Name
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="e.g. Insaaf Asset & Real Estate"
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-slate-500 font-medium"
              required
            />
            <p className="text-[11px] text-slate-400">The official name AI uses when greeting customers.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Tone & Language Guidelines
            </label>
            <input
              type="text"
              name="tone"
              value={formData.tone}
              onChange={handleChange}
              placeholder="e.g. Polite, professional, sales-oriented"
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-slate-500 font-medium"
            />
            <p className="text-[11px] text-slate-400">Instruct AI on brand voice (e.g. Banglish or Bangla).</p>
          </div>
        </div>

        {/* Section 2: About Business */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            About Business / Overview
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Brief overview of your business, location, operating hours, and specialty..."
            className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-100 text-sm leading-relaxed focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-slate-500 min-h-[110px]"
          />
        </div>

        {/* Section 3: Products, Services & Pricing */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-400" /> Products, Services & Pricing List
          </label>
          <textarea
            name="products"
            value={formData.products}
            onChange={handleChange}
            rows={6}
            placeholder="List products or services with pricing breakdown. Example:
• Flat Sales Marketing - 5,000 BDT
• Property Video & Drone - 10,000 BDT
• Full Digital Promotion - 15,000 BDT"
            className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-100 text-sm leading-relaxed focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-slate-500 font-mono text-xs md:text-sm min-h-[160px]"
          />
        </div>

        {/* Section 4: FAQ */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" /> Frequently Asked Questions (FAQ)
          </label>
          <textarea
            name="faq"
            value={formData.faq}
            onChange={handleChange}
            rows={6}
            placeholder="Common customer Q&A. Example:
Q: How much is flat video charge?
A: Professional video starts from 1,000 BDT.
Q: Do you take commission?
A: Commission depends on contract package."
            className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-100 text-sm leading-relaxed focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-slate-500 font-sans min-h-[160px]"
          />
        </div>

        {/* Section 5: Policies */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" /> Delivery, Terms & Refund Policies
          </label>
          <textarea
            name="policies"
            value={formData.policies}
            onChange={handleChange}
            rows={4}
            placeholder="Specify payment terms, delivery timeframes, warranty, and return policies..."
            className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-100 text-sm leading-relaxed focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-slate-500 min-h-[110px]"
          />
        </div>

        {/* Bottom Action Footer */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All Fields
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-emerald-500/25 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Changes...' : 'Save Knowledge Base'}
          </button>
        </div>
      </div>
    </form>
  );
}
