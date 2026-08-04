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
    const interval = setInterval(loadLeads, 5000);
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Users className="w-3.5 h-3.5 text-blue-600" /> Customer CRM
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">Captured Customer Leads</h1>
          <p className="text-sm text-slate-600 font-medium">
            Customer details, phone numbers, locations, and chat summaries automatically captured by AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-blue-50 px-4 py-2.5 rounded-2xl border border-blue-100 text-center">
            <p className="text-xs font-bold text-slate-500 uppercase">Total Leads</p>
            <p className="text-xl font-extrabold text-blue-600">{leads.length}</p>
          </div>
        </div>
      </div>

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

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, location, or summary..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['All', 'New', 'In Progress', 'Confirmed', 'Closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table / Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 font-medium">
          Loading customer leads...
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900">No Customer Leads Found</h3>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
            When customers message your linked WhatsApp number and share details, AI will automatically log them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <div
              key={lead._id}
              className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 hover:border-blue-300 transition-all shadow-sm relative flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      lead.status === 'New'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : lead.status === 'In Progress'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : lead.status === 'Confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {lead.status}
                  </span>

                  <button
                    onClick={() => handleDeleteLead(lead._id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 truncate">
                    {lead.customerName || 'WhatsApp Customer'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    +{lead.customerNumber}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-start gap-1.5 text-slate-700 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="truncate">{lead.location || 'Location Not Specified'}</span>
                  </div>

                  <div className="flex items-start gap-1.5 text-slate-600 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{lead.summary}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                <button
                  onClick={() => setSelectedLead(lead)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  View Details
                </button>

                <a
                  href={`https://wa.me/${lead.customerNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Chat on WA
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden space-y-6 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {selectedLead.customerName || 'Customer Details'}
                </h3>
                <p className="text-xs text-slate-500 font-mono font-medium">+{selectedLead.customerNumber}</p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Location</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {selectedLead.location || 'N/A'}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Lead Status</p>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => handleStatusChange(selectedLead._id, e.target.value)}
                    className="mt-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Requirement Summary</p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm text-slate-800 font-medium">
                  {selectedLead.summary}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Full Chat Conversation Details</p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedLead.details}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-500 font-medium">
                Captured: {new Date(selectedLead.createdAt).toLocaleString()}
              </span>

              <a
                href={`https://wa.me/${selectedLead.customerNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm"
              >
                <ExternalLink className="w-4 h-4" /> Open Direct WhatsApp Chat
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
