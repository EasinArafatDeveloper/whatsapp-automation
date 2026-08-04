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

      {/* Create New Template Form */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" /> Add Keyword Fallback Rule
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Specify keywords (e.g., &quot;price&quot;, &quot;location&quot;, &quot;help&quot;) and the exact reply text to send when matched.
          </p>
        </div>

        <form onSubmit={handleAddTemplate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Trigger Keyword
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. location"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Auto-Reply Message
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="e.g. Our main office is located at House 12, Road 5, Dhanmondi, Dhaka."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {submitting ? 'Saving Rule...' : 'Add Template Rule'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Rules List */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Configured Fallback Rules ({templates.length})</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Rules take precedence when keywords match in user chats.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rules..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm font-medium">Loading templates...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm font-medium">
            No keyword fallback rules created yet. Add your first rule above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((item, idx) => (
              <div
                key={item._id || idx}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group hover:border-blue-300 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    {item.keyword}
                  </span>

                  <button
                    onClick={() => handleDelete(item.keyword)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {item.reply}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
