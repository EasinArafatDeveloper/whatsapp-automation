'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Plus, Trash2, Tag, FileText, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TemplateItem {
  _id?: string;
  keyword: string;
  reply: string;
}

export default function TemplateManager() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [keyword, setKeyword] = useState<string>('');
  const [reply, setReply] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadTemplates = async () => {
    try {
      const res = await fetchApi<{ business: { templates: TemplateItem[] } }>('/api/business');
      if (res.business && res.business.templates) {
        setTemplates(res.business.templates);
      }
    } catch (err: any) {
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || !reply.trim()) return;

    setSubmitting(true);
    setMsg(null);

    try {
      const res = await fetchApi<{ templates: TemplateItem[] }>('/api/business/templates', {
        method: 'POST',
        body: JSON.stringify({ keyword, reply }),
      });
      setTemplates(res.templates);
      setKeyword('');
      setReply('');
      setMsg({ type: 'success', text: `Template for "${keyword}" saved successfully!` });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save template' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (targetKeyword: string) => {
    setMsg(null);
    try {
      const res = await fetchApi<{ templates: TemplateItem[] }>(
        `/api/business/templates/${encodeURIComponent(targetKeyword)}`,
        { method: 'DELETE' }
      );
      setTemplates(res.templates);
      setMsg({ type: 'success', text: `Template "${targetKeyword}" deleted successfully` });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to delete template' });
    }
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.keyword.toLowerCase().includes(search.toLowerCase()) ||
      t.reply.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {msg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
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

      {/* Add New Template Form */}
      <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Plus className="w-5 h-5 text-emerald-400" /> Add Fallback Keyword Reply
        </h2>

        <p className="text-xs text-slate-400">
          When AI is disabled or fails to answer, the system searches customer messages for these exact keywords and sends the predefined auto-reply.
        </p>

        <form onSubmit={handleAddTemplate} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Keyword / Trigger
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. price, location, order"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Automated Reply Text
              </label>
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="e.g. Our office is located at Gulshan 1, Dhaka. Working hours 10 AM - 7 PM."
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {submitting ? 'Saving...' : 'Add Template'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Templates Section */}
      <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" /> Existing Keyword Templates
            </h3>
            <p className="text-xs text-slate-400">Total configured rules: {templates.length}</p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keywords..."
              className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Loading templates...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Tag className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No keyword templates found</p>
            <p className="text-xs text-slate-500">Add your first template rule using the form above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 pt-2">
            {filteredTemplates.map((t, idx) => (
              <div
                key={t._id || idx}
                className="p-4 rounded-xl glass-card border border-slate-800 flex items-start justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1 overflow-hidden">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-mono text-xs font-semibold border border-emerald-500/20">
                    Keyword: {t.keyword}
                  </span>
                  <p className="text-sm text-slate-200 mt-1 break-words">{t.reply}</p>
                </div>

                <button
                  onClick={() => handleDelete(t.keyword)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  title="Delete Template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
