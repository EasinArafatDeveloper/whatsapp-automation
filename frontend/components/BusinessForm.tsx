'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { showToast, showConfirmAlert, showSuccessModal } from '@/lib/alert';
import {
  Save,
  Building2,
  Package,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  User,
  Zap,
  Briefcase,
  UserCheck,
  Brain,
  MessageSquare,
} from 'lucide-react';

interface BusinessData {
  businessName: string;
  description: string;
  products: string;
  faq: string;
  policies: string;
  tone: string;
  accountType: 'business' | 'influencer' | 'freelancer' | 'personal';
  toneMode: 'auto' | 'friendly' | 'professional' | 'casual_fun';
  customInstructions: string;
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
    accountType: 'business',
    toneMode: 'auto',
    customInstructions: '',
    aiEnabled: true,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadBusinessData = async () => {
      try {
        const res = await fetchApi<{ business: BusinessData }>('/api/business');
        if (res && res.business) {
          setFormData({
            businessName: res.business.businessName || '',
            description: res.business.description || '',
            products: res.business.products || '',
            faq: res.business.faq || '',
            policies: res.business.policies || '',
            tone: res.business.tone || 'friendly and professional',
            accountType: res.business.accountType || 'business',
            toneMode: res.business.toneMode || 'auto',
            customInstructions: res.business.customInstructions || '',
            aiEnabled: res.business.aiEnabled ?? true,
          });
        }
      } catch (err: any) {
        setMsg({ type: 'error', text: err.message || 'Failed to load business profile' });
      } finally {
        setLoading(false);
      }
    };
    loadBusinessData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleAi = () => {
    setFormData((prev) => ({ ...prev, aiEnabled: !prev.aiEnabled }));
  };

  const handleClearAll = async () => {
    const confirmed = await showConfirmAlert(
      'Clear Knowledge Base?',
      'Are you sure you want to clear all form fields? Click Save afterwards to confirm changes.',
      'Yes, clear fields'
    );

    if (!confirmed) return;

    setFormData({
      businessName: '',
      description: '',
      products: '',
      faq: '',
      policies: '',
      tone: '',
      accountType: 'business',
      toneMode: 'auto',
      customInstructions: '',
      aiEnabled: formData.aiEnabled,
    });
    showToast.success('All fields cleared! Click "Save Knowledge Base" to apply.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const dataToSave = { ...formData };

    try {
      const res = await fetchApi<{ business: BusinessData }>('/api/business', {
        method: 'PUT',
        body: JSON.stringify(dataToSave),
      });

      if (res && res.business) {
        setFormData({
          businessName: res.business.businessName ?? dataToSave.businessName,
          description: res.business.description ?? dataToSave.description,
          products: res.business.products ?? dataToSave.products,
          faq: res.business.faq ?? dataToSave.faq,
          policies: res.business.policies ?? dataToSave.policies,
          tone: res.business.tone ?? dataToSave.tone,
          accountType: res.business.accountType || dataToSave.accountType,
          toneMode: res.business.toneMode || dataToSave.toneMode,
          customInstructions: res.business.customInstructions ?? dataToSave.customInstructions,
          aiEnabled: res.business.aiEnabled ?? dataToSave.aiEnabled,
        });
      } else {
        setFormData(dataToSave);
      }

      showToast.success('AI Knowledge Base & Persona updated successfully!');
      setMsg({ type: 'success', text: 'AI Assistant memory & persona settings updated successfully!' });
    } catch (err: any) {
      try {
        const res = await fetchApi<{ business: BusinessData }>('/api/business/profile', {
          method: 'POST',
          body: JSON.stringify(dataToSave),
        });
        if (res && res.business) {
          setFormData({
            businessName: res.business.businessName ?? dataToSave.businessName,
            description: res.business.description ?? dataToSave.description,
            products: res.business.products ?? dataToSave.products,
            faq: res.business.faq ?? dataToSave.faq,
            policies: res.business.policies ?? dataToSave.policies,
            tone: res.business.tone ?? dataToSave.tone,
            accountType: res.business.accountType || dataToSave.accountType,
            toneMode: res.business.toneMode || dataToSave.toneMode,
            customInstructions: res.business.customInstructions ?? dataToSave.customInstructions,
            aiEnabled: res.business.aiEnabled ?? dataToSave.aiEnabled,
          });
        } else {
          setFormData(dataToSave);
        }
        showToast.success('AI Knowledge Base & Persona updated successfully!');
        setMsg({ type: 'success', text: 'AI Assistant memory & persona settings updated successfully!' });
      } catch (fallbackErr: any) {
        showToast.error(err.message || 'Failed to save settings');
        setMsg({ type: 'error', text: err.message || 'Failed to save settings' });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl text-center space-y-3 border border-slate-200 shadow-sm">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Loading AI Assistant profile...</p>
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
            <h3 className="text-lg font-extrabold text-slate-900">AI Assistant Master Engine</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              DeepSeek V3 AI uses your persona, dynamic memory, and tone rules below to reply automatically.
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

      {/* Account Persona & Smart Tone Selection Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" /> Choose AI Role & Smart Tone Engine
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Tailor your AI assistant whether you are a Business Owner, Content Creator, Freelancer, or Personal User.
          </p>
        </div>

        {/* Account Type Selector Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Select Your Account Persona / Role
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Business */}
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, accountType: 'business' }))}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                formData.accountType === 'business'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-blue-600 text-white w-fit shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">E-Commerce / Business</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Customer support, products, sales leads & order FAQs.
                </p>
              </div>
            </button>

            {/* Influencer */}
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, accountType: 'influencer' }))}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                formData.accountType === 'influencer'
                  ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white w-fit shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Influencer / Creator</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Engage fans, social channels, sponsorships & live updates.
                </p>
              </div>
            </button>

            {/* Freelancer */}
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, accountType: 'freelancer' }))}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                formData.accountType === 'freelancer'
                  ? 'border-cyan-600 bg-cyan-50/60 ring-2 ring-cyan-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-cyan-600 text-white w-fit shadow-sm">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Freelancer / Specialist</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Client inquiries, hourly rates, availability & portfolio.
                </p>
              </div>
            </button>

            {/* Personal */}
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, accountType: 'personal' }))}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                formData.accountType === 'personal'
                  ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-purple-600 text-white w-fit shadow-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Personal Assistant</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Personal auto-reply assistant for friends & contacts.
                </p>
              </div>
            </button>

          </div>
        </div>

        {/* Tone Mode Selector (Auto-Detect vs Specific Tones) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Smart Communication Tone Engine
            </label>
            <select
              name="toneMode"
              value={formData.toneMode}
              onChange={handleChange}
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none font-bold transition-all"
            >
              <option value="auto">⚡ Smart Auto-Detect (Detects Friendly vs Formal Message)</option>
              <option value="friendly">😊 Warm & Friendly (Approachable & Polite)</option>
              <option value="professional">👔 Professional & Formal (Corporate & Structured)</option>
              <option value="casual_fun">🎉 Casual, Fun & Energetic (Friendly Emojis)</option>
            </select>
            <p className="text-[11px] text-slate-500 font-medium">
              Auto-detect adjusts reply warmth dynamically based on whether the customer texts casually or formally!
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Custom Brand Voice / Language Style
            </label>
            <input
              type="text"
              name="tone"
              value={formData.tone}
              onChange={handleChange}
              placeholder="e.g. Banglish, polite, helpful, sales-oriented"
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all font-medium placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-500 font-medium">Specific instructions for AI voice (e.g. Banglish / Bangla).</p>
          </div>
        </div>

      </div>

      {/* Dynamic Training & Memory Updates Learning Box */}
      <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 p-8 rounded-3xl text-white space-y-4 shadow-xl border border-blue-800/60">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                Teach AI New Facts & Real-Time Memory <Zap className="w-4 h-4 text-cyan-400" />
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Continuously update your AI assistant with daily news, schedules, or temporary offers.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
            Real-Time Memory & Daily Instructions
          </label>
          <textarea
            name="customInstructions"
            value={formData.customInstructions}
            onChange={handleChange}
            rows={4}
            placeholder={`e.g.
- I am traveling out of town until Sunday. Emergency phone: 01700000000.
- New YouTube video launching today at 8:00 PM on channel.
- Offering 20% discount on web design orders this week.`}
            className="w-full px-4 py-3.5 rounded-2xl bg-slate-950/90 border border-slate-700 text-white text-xs min-h-[140px] focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all placeholder:text-slate-500 font-medium leading-relaxed font-mono"
          />
          <p className="text-[11px] text-slate-400 font-medium">
            AI reads these dynamic instructions instantly on every incoming WhatsApp message. Update anytime!
          </p>
        </div>
      </div>

      {/* Main Knowledge Base Form Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-blue-600" /> Main Knowledge Base
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Input details about your products, identity, FAQs, and policies for permanent AI memory.
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

        {/* Name / Title */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Account / Business / Persona Name
          </label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="e.g. TechWithEasin / ScaleUp Web Agency"
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
            required
          />
          <p className="text-[11px] text-slate-500 font-medium">The official name AI uses when introducing itself.</p>
        </div>

        {/* About / Overview */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            About / Overview / Bio
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe your services, creator channel background, freelance skills, or personal bio..."
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm min-h-[140px] focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all placeholder:text-slate-400 font-medium leading-relaxed"
          />
        </div>

        {/* Products / Services & Pricing */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Products, Services, Packages & Rates
            </label>
          </div>
          <textarea
            name="products"
            value={formData.products}
            onChange={handleChange}
            rows={5}
            placeholder={`e.g. 
- Web Development: $200 per project
- Sponsored Post: $150
- Flat in Dhanmondi: 1500 sqft, Price: 2 Crore BDT`}
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm min-h-[160px] focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all placeholder:text-slate-400 font-medium leading-relaxed font-mono"
          />
        </div>

        {/* FAQ */}
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
Q: How long does a project take?
A: Usually 3 to 5 business days.

Q: What are the payment methods?
A: bKash, Bank Transfer, Payoneer.`}
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm min-h-[160px] focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all placeholder:text-slate-400 font-medium leading-relaxed"
          />
        </div>

        {/* Policies */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Policies, Rules & Guidelines
            </label>
          </div>
          <textarea
            name="policies"
            value={formData.policies}
            onChange={handleChange}
            rows={4}
            placeholder="e.g. 50% advance required for freelance projects, 7 days revision policy..."
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm min-h-[140px] focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all placeholder:text-slate-400 font-medium leading-relaxed"
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            Click save to update DeepSeek AI knowledge base & smart tone rules instantly.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving AI Memory...' : 'Save Knowledge Base'}
          </button>
        </div>

      </div>
    </form>
  );
}
