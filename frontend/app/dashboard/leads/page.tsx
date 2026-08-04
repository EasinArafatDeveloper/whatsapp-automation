'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import {
  Users,
  Search,
  Phone,
  MapPin,
  Clock,
  Trash2,
  ExternalLink,
  MessageSquare,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface Lead {
  _id: string;
  customerNumber: string;
  customerName: string;
  summary: string;
  location: string;
  details: string;
  status: 'New' | 'In Progress' | 'Confirmed' | 'Closed';
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
}

export default function LeadsDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadLeads = async () => {
    try {
      const res = await fetchApi<{ leads: Lead[] }>('/api/leads');
      if (res.leads) {
        setLeads(res.leads);
      }
    } catch (err: any) {
      console.error('Error fetching customer leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
    const interval = setInterval(loadLeads, 5000); // refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetchApi<{ lead: Lead }>(`/api/leads/${leadId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setLeads((prev) =>
        prev.map((l) => (l._id === leadId ? { ...l, status: res.lead.status } : l))
      );
      if (selectedLead && selectedLead._id === leadId) {
        setSelectedLead((prev) => (prev ? { ...prev, status: res.lead.status } : null));
      }
      setMsg({ type: 'success', text: 'Lead status updated!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update lead status' });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to delete this customer lead?')) return;
    try {
      await fetchApi(`/api/leads/${leadId}`, { method: 'DELETE' });
      setLeads((prev) => prev.filter((l) => l._id !== leadId));
      if (selectedLead && selectedLead._id === leadId) {
        setSelectedLead(null);
      }
      setMsg({ type: 'success', text: 'Lead deleted successfully' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to delete lead' });
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.customerName.toLowerCase().includes(search.toLowerCase()) ||
      l.customerNumber.includes(search) ||
      l.summary.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'In Progress':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Confirmed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Closed':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-3.5 h-3.5" /> Customer Intelligence CRM
            </span>
            <h1 className="text-3xl font-extrabold text-white">Captured Customer Leads</h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Automatic lead details captured by DeepSeek AI during live WhatsApp conversations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="glass-card px-4 py-3 rounded-2xl border border-white/10 text-center">
              <span className="block text-2xl font-extrabold text-white">{leads.length}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Leads</span>
            </div>
            <div className="glass-card px-4 py-3 rounded-2xl border border-white/10 text-center">
              <span className="block text-2xl font-extrabold text-emerald-400">
                {leads.filter((l) => l.status === 'Confirmed' || l.status === 'New').length}
              </span>
              <span className="text-[10px] text-emerald-300 uppercase font-semibold">Active Leads</span>
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium flex items-center gap-3 border ${
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

      {/* Filter & Search Toolbar */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, phone, location..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white text-xs md:text-sm focus:border-emerald-400 focus:outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['All', 'New', 'In Progress', 'Confirmed', 'Closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Grid & Details Modal */}
      {loading ? (
        <div className="text-center py-12 glass-panel rounded-3xl text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Loading captured customer leads...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3 border border-white/10">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Customer Leads Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When customers send inquiries on WhatsApp, AI will automatically parse and capture their contact info & requirements here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <div
              key={lead._id}
              className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-xl group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-base text-white truncate group-hover:text-emerald-400 transition-colors">
                      {lead.customerName}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" /> {lead.customerNumber}
                    </p>
                  </div>

                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${getStatusBadge(
                      lead.status
                    )}`}
                  >
                    {lead.status}
                  </span>
                </div>

                {/* Summary & Location Badges */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                      {lead.summary}
                    </span>
                  </div>

                  {lead.location && lead.location !== 'Not specified' && (
                    <p className="text-xs text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> Location: {lead.location}
                    </p>
                  )}

                  {lead.lastMessage && (
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 italic line-clamp-2">
                      "{lead.lastMessage}"
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(lead.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <div className="flex items-center gap-2">
                  {/* WhatsApp Direct Action Button */}
                  <a
                    href={`https://wa.me/${lead.customerNumber.replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-colors flex items-center gap-1"
                    title="Open WhatsApp Chat"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>

                  {/* View Details */}
                  <button
                    onClick={() => setSelectedLead(lead)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                  >
                    Details
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteLead(lead._id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                    title="Delete Lead"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedLead.customerName}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Phone: {selectedLead.customerNumber}
                </p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-white text-sm font-bold p-2"
              >
                ✕
              </button>
            </div>

            {/* Status Change Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Lead Status
              </label>
              <select
                value={selectedLead.status}
                onChange={(e) => handleStatusChange(selectedLead._id, e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-emerald-400 focus:outline-none"
              >
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Requirement Summary */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Inquiry Summary
              </label>
              <p className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                {selectedLead.summary}
              </p>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Extracted Location
              </label>
              <p className="text-sm font-semibold text-white bg-slate-900 p-3 rounded-xl border border-slate-800">
                {selectedLead.location}
              </p>
            </div>

            {/* Full Conversation & Details */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" /> Full Captured Chat History
              </label>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto font-mono">
                {selectedLead.details || 'No detailed conversation log recorded.'}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <a
                href={`https://wa.me/${selectedLead.customerNumber.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                <MessageSquare className="w-4 h-4" />
                Chat Directly on WhatsApp
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
