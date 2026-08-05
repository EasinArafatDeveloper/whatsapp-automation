'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import {
  Users, Search, Phone, MapPin, Clock, Trash2, ExternalLink,
  MessageSquare, Filter, CheckCircle2, AlertCircle, FileText,
  Flame, TrendingUp, Star, MessageCircle,
} from 'lucide-react';

import { CardSkeleton } from '@/components/SkeletonLoader';

interface Lead {
  _id: string;
  customerNumber: string;
  customerName: string;
  summary: string;
  intentLabel?: string;
  priority?: 'New' | 'Warm Lead' | 'Hot Lead' | 'Urgent';
  location: string;
  details: string;
  status: 'New' | 'In Progress' | 'Confirmed' | 'Closed';
  lastMessage: string;
  messageCount?: number;
  createdAt: string;
  updatedAt: string;
}

const priorityConfig: Record<string, { label: string; className: string; icon: any }> = {
  'Hot Lead':  { label: '🔥 Hot Lead',  className: 'bg-rose-900/30 text-rose-300 border-rose-700/50',     icon: Flame },
  'Urgent':    { label: '⚠️ Urgent',    className: 'bg-amber-900/30 text-amber-300 border-amber-700/50',  icon: AlertCircle },
  'Warm Lead': { label: '✨ Warm Lead', className: 'bg-blue-900/30 text-blue-300 border-blue-700/50',     icon: TrendingUp },
  'New':       { label: '💬 New',       className: 'bg-slate-100 text-slate-600 border-slate-200',         icon: MessageCircle },
};

const statusConfig: Record<string, string> = {
  'New':         'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  'Confirmed':   'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Closed':      'bg-slate-100 text-slate-600 border-slate-200',
};

export default function LeadsDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadLeads = async () => {
    try {
      const res = await fetchApi<{ leads: Lead[] }>('/api/leads');
      if (res.leads) setLeads(res.leads);
    } catch (err: any) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
    const interval = setInterval(loadLeads, 8000); // poll every 8s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [msg]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetchApi<{ lead: Lead }>(`/api/leads/${leadId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setLeads((prev) => prev.map((l) => (l._id === leadId ? { ...l, status: res.lead.status } : l)));
      if (selectedLead?._id === leadId) setSelectedLead((p) => p ? { ...p, status: res.lead.status } : null);
      setMsg({ type: 'success', text: 'Status updated!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update status' });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Delete this customer lead permanently?')) return;
    try {
      await fetchApi(`/api/leads/${leadId}`, { method: 'DELETE' });
      setLeads((prev) => prev.filter((l) => l._id !== leadId));
      if (selectedLead?._id === leadId) setSelectedLead(null);
      setMsg({ type: 'success', text: 'Lead deleted successfully' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to delete lead' });
    }
  };

  // Smart sort: Urgent > Hot Lead > Warm Lead > New
  const priorityWeight: Record<string, number> = { 'Urgent': 4, 'Hot Lead': 3, 'Warm Lead': 2, 'New': 1 };

  const filteredLeads = leads
    .filter((l) => {
      const q = search.toLowerCase();
      const matchSearch =
        l.customerName.toLowerCase().includes(q) ||
        l.customerNumber.includes(q) ||
        (l.intentLabel || l.summary).toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || l.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || l.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    })
    .sort((a, b) => (priorityWeight[b.priority || 'New'] ?? 1) - (priorityWeight[a.priority || 'New'] ?? 1));

  const hotCount = leads.filter((l) => l.priority === 'Hot Lead').length;
  const urgentCount = leads.filter((l) => l.priority === 'Urgent').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Users className="w-3.5 h-3.5" /> Customer CRM
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">Customer Leads</h1>
          <p className="text-sm text-slate-600 font-medium mt-1">
            AI-captured leads with smart intent detection — sorted by priority
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-rose-50 px-4 py-2.5 rounded-2xl border border-rose-100 text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase">🔥 Hot</p>
            <p className="text-xl font-extrabold text-rose-600">{hotCount}</p>
          </div>
          <div className="bg-amber-50 px-4 py-2.5 rounded-2xl border border-amber-100 text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase">⚠️ Urgent</p>
            <p className="text-xl font-extrabold text-amber-600">{urgentCount}</p>
          </div>
          <div className="bg-blue-50 px-4 py-2.5 rounded-2xl border border-blue-100 text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Total</p>
            <p className="text-xl font-extrabold text-blue-600">{leads.length}</p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {msg && (
        <div className={`p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 border shadow-sm ${
          msg.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, intent, or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-medium"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Status:</span>
            {['All', 'New', 'In Progress', 'Confirmed', 'Closed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  statusFilter === st ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          {/* Priority filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Priority:</span>
            {['All', 'Hot Lead', 'Urgent', 'Warm Lead', 'New'].map((pr) => (
              <button
                key={pr}
                onClick={() => setPriorityFilter(pr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  priorityFilter === pr ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {pr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton count={6} />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900">No Customer Leads Found</h3>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
            When customers send messages on your linked WhatsApp, AI captures and logs them here with smart intent labels.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLeads.map((lead) => {
            const pc = priorityConfig[lead.priority || 'New'] || priorityConfig['New'];
            return (
              <div
                key={lead._id}
                className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 hover:border-blue-300 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Status + Priority row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${statusConfig[lead.status]}`}>
                      {lead.status}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${pc.className}`}>
                        {lead.priority || 'New'}
                      </span>
                      <button onClick={() => handleDeleteLead(lead._id)} className="text-slate-300 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Customer info */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 truncate">{lead.customerName || 'WhatsApp Customer'}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-0.5">
                      <Phone className="w-3 h-3 text-blue-500" />
                      {lead.customerNumber}
                      {lead.messageCount && lead.messageCount > 1 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold text-[9px]">
                          {lead.messageCount} msgs
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Intent + Location */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    {lead.location && lead.location !== 'Not specified' && (
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{lead.location}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-1.5 bg-blue-50 text-blue-800 p-2.5 rounded-xl border border-blue-100 font-semibold">
                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{lead.intentLabel || lead.summary}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedLead(lead)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  >
                    View Chat
                  </button>
                  <a
                    href={`https://wa.me/${lead.customerNumber.replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Chat on WA
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{selectedLead.customerName}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedLead.customerNumber}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-slate-700 font-bold text-xl px-2">✕</button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Location</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{selectedLead.location || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Lead Status</p>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => handleStatusChange(selectedLead._id, e.target.value)}
                    className="mt-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    {['New', 'In Progress', 'Confirmed', 'Closed'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Intent & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Intent</p>
                  <p className="text-sm font-bold text-blue-800 mt-1">{selectedLead.intentLabel || selectedLead.summary}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${priorityConfig[selectedLead.priority || 'New']?.className || ''}`}>
                  <p className="text-[10px] font-bold uppercase opacity-70">Priority</p>
                  <p className="text-sm font-extrabold mt-1">{selectedLead.priority || 'New'}</p>
                </div>
              </div>

              {/* Last Message */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Last Customer Message</p>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-sm text-slate-800 font-medium">
                  "{selectedLead.lastMessage}"
                </div>
              </div>

              {/* Full chat */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Full Conversation Log</p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-700 leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto">
                  {selectedLead.details || 'No conversation history recorded yet.'}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Captured: {new Date(selectedLead.createdAt).toLocaleString()}
              </span>
              <a
                href={`https://wa.me/${selectedLead.customerNumber.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm"
              >
                <ExternalLink className="w-4 h-4" /> Open WhatsApp Chat
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
