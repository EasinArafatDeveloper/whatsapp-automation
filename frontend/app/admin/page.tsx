'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, Users, MessageSquare, Zap, TrendingUp, Search,
  Edit2, Trash2, Check, X, LogOut, RefreshCw, ChevronLeft,
  ChevronRight, AlertCircle, CheckCircle2, UserCheck, UserX,
  Star, Activity, Clock,
} from 'lucide-react';
import { getSuperAdminToken, clearSuperAdminToken, superFetch } from '@/lib/superAdmin';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  adminUsers: number;
  connectedWA: number;
  totalLeads: number;
  hotLeads: number;
  totalBusinesses: number;
  recentSignups: number;
}

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  whatsappConnected: boolean;
  whatsappNumber?: string;
  createdAt: string;
  leadCount: number;
  businessData?: { businessName?: string; accountType?: string; toneMode?: string };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user', isActive: true });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadStats = useCallback(async () => {
    try {
      const data = await superFetch('/api/super-admin/stats');
      setStats(data.stats);
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('403')) {
        clearSuperAdminToken();
        router.push('/admin/login');
      }
    }
  }, [router]);

  const loadUsers = useCallback(async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const data = await superFetch(
        `/api/super-admin/users?page=${page}&limit=20&search=${encodeURIComponent(searchQuery)}`
      );
      setUsers(data.users || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch (err: any) {
      showMsg('error', err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadUsers(1, '');
  }, [loadStats, loadUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => loadUsers(1, search), 400);
    return () => clearTimeout(timer);
  }, [search, loadUsers]);

  const handleLogout = () => {
    clearSuperAdminToken();
    router.push('/admin/login');
  };

  const openEdit = (user: UserRow) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role || 'user', isActive: user.isActive ?? true });
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      await superFetch(`/api/super-admin/users/${editingUser._id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      showMsg('success', `User "${editForm.name}" updated successfully`);
      setEditingUser(null);
      loadUsers(pagination.page, search);
    } catch (err: any) {
      showMsg('error', err.message || 'Failed to update user');
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Permanently delete "${userName}" and ALL their data? This cannot be undone.`)) return;
    setDeletingId(userId);
    try {
      await superFetch(`/api/super-admin/users/${userId}`, { method: 'DELETE' });
      showMsg('success', `"${userName}" deleted successfully`);
      loadUsers(pagination.page, search);
      loadStats();
    } catch (err: any) {
      showMsg('error', err.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (user: UserRow) => {
    try {
      await superFetch(`/api/super-admin/users/${user._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      showMsg('success', `User ${user.isActive ? 'disabled' : 'enabled'} successfully`);
      loadUsers(pagination.page, search);
    } catch (err: any) {
      showMsg('error', err.message || 'Failed to toggle user status');
    }
  };

  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'violet', sub: `+${stats.recentSignups} this week` },
        { label: 'Active WA Sessions', value: stats.connectedWA, icon: MessageSquare, color: 'emerald', sub: 'WhatsApp connected' },
        { label: 'Total Leads', value: stats.totalLeads, icon: TrendingUp, color: 'blue', sub: `${stats.hotLeads} hot leads` },
        { label: 'Active Businesses', value: stats.totalBusinesses, icon: Zap, color: 'amber', sub: 'With AI profiles' },
      ]
    : [];

  const colorMap: Record<string, string> = {
    violet: 'from-violet-600 to-indigo-600',
    emerald: 'from-emerald-500 to-teal-500',
    blue: 'from-blue-500 to-cyan-500',
    amber: 'from-amber-500 to-orange-500',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base leading-tight">Super Admin Console</h1>
              <p className="text-xs text-slate-500 font-medium">WpAutoAI Platform Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { loadStats(); loadUsers(pagination.page, search); }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Toast Message */}
        {msg && (
          <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-semibold border ${
            msg.type === 'success'
              ? 'bg-emerald-900/30 border-emerald-700/40 text-emerald-300'
              : 'bg-rose-900/30 border-rose-700/40 text-rose-300'
          }`}>
            {msg.type === 'success'
              ? <CheckCircle2 className="w-5 h-5 shrink-0" />
              : <AlertCircle className="w-5 h-5 shrink-0" />}
            {msg.text}
          </div>
        )}

        {/* Stat Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${colorMap[card.color]} flex items-center justify-center shadow-lg`}>
                    <card.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white">{card.value}</div>
                <p className="text-xs text-slate-500 font-medium">{card.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Status Row */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Active Users</p>
                <p className="text-lg font-extrabold text-white">{stats.activeUsers}</p>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <UserX className="w-5 h-5 text-rose-400" />
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Disabled Users</p>
                <p className="text-lg font-extrabold text-white">{stats.disabledUsers}</p>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Admin Users</p>
                <p className="text-lg font-extrabold text-white">{stats.adminUsers}</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          {/* Table Header */}
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-extrabold text-white text-lg">All Users</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {pagination.total} total registered users
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-16 text-center text-slate-500 font-medium">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-16 text-center text-slate-500 font-medium">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    <th className="px-6 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">WhatsApp</th>
                    <th className="px-4 py-3 text-left">Leads</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-white text-sm">{user.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                          {user.businessData?.businessName && (
                            <p className="text-xs text-slate-600 mt-0.5 truncate max-w-[180px]">
                              {user.businessData.businessName}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                          user.role === 'admin'
                            ? 'bg-violet-900/50 text-violet-300 border border-violet-700/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleActive(user)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border transition-all ${
                            user.isActive !== false
                              ? 'bg-emerald-900/30 text-emerald-400 border-emerald-700/40 hover:bg-emerald-900/50'
                              : 'bg-rose-900/30 text-rose-400 border-rose-700/40 hover:bg-rose-900/50'
                          }`}
                        >
                          {user.isActive !== false ? (
                            <><UserCheck className="w-3 h-3" /> Active</>
                          ) : (
                            <><UserX className="w-3 h-3" /> Disabled</>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        {user.whatsappConnected ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-xs text-emerald-400 font-bold">Connected</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600 font-medium">Disconnected</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-white">{user.leadCount || 0}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-900/30 transition-all"
                            title="Edit user"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id, user.name)}
                            disabled={deletingId === user._id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-900/30 transition-all disabled:opacity-50"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => loadUsers(pagination.page - 1, search)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadUsers(pagination.page + 1, search)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-white text-lg">Edit User</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-500 hover:text-white p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
              ].map(({ label, key, type }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">{label}</label>
                  <input
                    type={type}
                    value={editForm[key as keyof typeof editForm] as string}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 font-medium"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none font-medium"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Status</label>
                  <select
                    value={editForm.isActive ? 'active' : 'disabled'}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, isActive: e.target.value === 'active' }))}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-extrabold transition-all shadow-lg"
              >
                <Check className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
