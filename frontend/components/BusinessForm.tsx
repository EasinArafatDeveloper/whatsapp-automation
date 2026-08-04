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
      await fetchApi('/api/business/profile', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      setMsg({ type: 'success', text: 'Business knowledge base updated successfully!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save business settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl text-center space-y-3 border border-slate-200 shadow-sm">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500 font-medium">Loading business profile...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {msg && (
        <div
          className={`p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 border shadow-sm ${
            msg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* AI Toggle Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">AI Auto-Reply Engine</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              DeepSeek AI generates intelligent responses using your business context below.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleAi}
          className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            formData.aiEnabled ? 'bg-blue-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              formData.aiEnabled ? 'translate-x-8' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Main Form Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-blue-600" /> Business Knowledge Base
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Provide accurate information so AI can answer customer questions directly.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shrink-0 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All Fields
          </button>
        </div>

        {/* Section 1: General Info & Tone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Business Name
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="e.g. Insaaf Asset & Real Estate"
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
              required
            />
            <p className="text-[11px] text-slate-500 font-medium">The official name AI uses when greeting customers.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Tone & Language Guidelines
            </label>
            <input
              type="text"
              name="tone"
              value={formData.tone}
              onChange={handleChange}
              placeholder="e.g. Polite, professional, sales-oriented"
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
            />
            <p className="text-[11px] text-slate-500 font-medium">Instruct AI on brand voice (e.g. Banglish or Bangla).</p>
          </div>
        </div>

        {/* Section 2: About Business */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            About Business / Overview
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe your business services, location, working hours, and background..."
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm min-h-[160px] focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all placeholder:text-slate-400 font-medium leading-relaxed"
          />
        </div>

        {/* Section 3: Products & Pricing */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Products, Services & Pricing List
            </label>
          </div>
          <textarea
            name="products"
            value={formData.products}
            onChange={handleChange}
            rows={5}
            placeholder={`e.g. 
- Flat in Dhanmondi: 1500 sqft, 3 Bed, Price: 2 Crore BDT
- Flat in Gulshan: 2200 sqft, 4 Bed, Price: 4.5 Crore BDT`}
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm min-h-[180px] focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all placeholder:text-slate-400 font-medium leading-relaxed font-mono"
          />
        </div>

        {/* Section 4: Frequently Asked Questions */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Frequently Asked Questions (FAQ)
            </label>
          </div>
          <textarea
            name="faq"
            value={formData.faq}
            onChange={handleChange}
            rows={5}
            placeholder={`e.g.
Q: Do you offer home delivery?
A: Yes, we deliver across Dhaka within 24 hours.

Q: What are the payment methods?
A: Cash on delivery, bKash, and Bank Transfer.`}
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm min-h-[180px] focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all placeholder:text-slate-400 font-medium leading-relaxed"
          />
        </div>

        {/* Section 5: Return & Support Policies */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Support, Guarantee & Return Policies
            </label>
          </div>
          <textarea
            name="policies"
            value={formData.policies}
            onChange={handleChange}
            rows={4}
            placeholder="e.g. 7 days money-back guarantee, 1-year official warranty, refund policy..."
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm min-h-[160px] focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all placeholder:text-slate-400 font-medium leading-relaxed"
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            Click save to update DeepSeek AI knowledge base instantly.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving Knowledge Base...' : 'Save Knowledge Base'}
          </button>
        </div>
      </div>
    </form>
  );
}
