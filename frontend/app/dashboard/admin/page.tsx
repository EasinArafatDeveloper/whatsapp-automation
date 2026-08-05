'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { showToast, showConfirmAlert } from '@/lib/alert';
import {
  ShieldCheck,
  Users,
  MessageSquare,
  QrCode,
  CheckCircle2,
  XCircle,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Sparkles,
  Building2,
  Briefcase,
  User as UserIcon,
  Crown,
  Lock,
  UserCheck,
  UserX,
  X,
  Save,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeWhatsappSessions: number;
  totalLeads: number;
  totalBusinesses: number;
}

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  whatsappConnected: boolean;
  whatsappNumber: string | null;
  createdAt: string;
  businessName: string;
  accountType: 'business' | 'influencer' | 'freelancer' | 'personal';
  toneMode: string;
  leadCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<UserDetail | null>(null);
  const [savingEdit, setSavingEdit] = useState<boolean>(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetchApi<{ stats: AdminStats }>('/api/admin/stats'),
        fetchApi<{ users: UserDetail[] }>('/api/admin/users'),
      ]);

      if (statsRes.stats) setStats(statsRes.stats);
      if (usersRes.users) setUsers(usersRes.users);
    } catch (err: any) {
      showToast.error(err.message || 'Access denied or error loading admin stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleUserStatus = async (user: UserDetail) => {
    const newStatus = !user.isActive;
    const actionText = newStatus ? 'enable' : 'disable';

    const confirmed = await showConfirmAlert(
      `${newStatus ? 'Enable' : 'Disable'} User Account?`,
      `Are you sure you want to ${actionText} ${user.name}'s account (${user.email})?`,
      `Yes, ${actionText} user`
    );

    if (!confirmed) return;

    try {
      await fetchApi(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: newStatus }),
      });

      showToast.success(`User ${user.name} has been ${newStatus ? 'enabled' : 'disabled'}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u))
      );
    } catch (err: any) {
      showToast.error(err.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (user: UserDetail) => {
    const confirmed = await showConfirmAlert(
      'Delete User Account?',
      `This will permanently delete ${user.name} (${user.email}) and ALL associated tenant data! This action cannot be undone.`,
      'Yes, delete permanently'
    );

    if (!confirmed) return;

    try {
      await fetchApi(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      showToast.success(`User ${user.name} deleted successfully!`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err: any) {
      showToast.error(err.message || 'Failed to delete user');
    }
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSavingEdit(true);
    try {
      await fetchApi(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          isActive: editingUser.isActive,
        }),
      });

      showToast.success(`User ${editingUser.name} updated successfully!`);
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? editingUser : u))
      );
      setEditingUser(null);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to save user changes');
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.businessName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-400" /> Super Admin Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            SaaS Platform Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Monitor registered users, active WhatsApp sockets, customer leads, and manage tenant accounts.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all active:scale-95 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total SaaS Users</span>
            <p className="text-3xl font-black text-slate-900">{stats?.totalUsers || 0}</p>
            <p className="text-[11px] text-slate-500 font-medium">Registered Platform Tenants</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Active</span>
            <p className="text-3xl font-black text-emerald-600">{stats?.activeWhatsappSessions || 0}</p>
            <p className="text-[11px] text-emerald-600 font-semibold">Live Connected Sockets</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
            <QrCode className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Captured Leads</span>
            <p className="text-3xl font-black text-indigo-600">{stats?.totalLeads || 0}</p>
            <p className="text-[11px] text-indigo-600 font-semibold">Customer Inquiries</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Knowledge Bases</span>
            <p className="text-3xl font-black text-cyan-600">{stats?.totalBusinesses || 0}</p>
            <p className="text-[11px] text-cyan-600 font-semibold">Configured Tenants</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
        
        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" /> Manage All SaaS Users
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              View user details, update user roles, toggle account active status, or remove tenant data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-600 transition-all"
            >
              <option value="all">All Roles</option>
              <option value="admin">Super Admin</option>
              <option value="user">Regular User</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Fetching user accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-2xl">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No users found matching filter</h4>
            <p className="text-xs text-slate-500 font-medium">Try clearing your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Account Persona</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">WhatsApp Status</th>
                  <th className="py-3.5 px-4 text-center">Leads</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* User Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm uppercase shrink-0">
                          {u.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Persona */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                        {u.accountType === 'influencer' && <Sparkles className="w-3 h-3 text-indigo-500" />}
                        {u.accountType === 'freelancer' && <Briefcase className="w-3 h-3 text-cyan-500" />}
                        {u.accountType === 'personal' && <UserIcon className="w-3 h-3 text-purple-500" />}
                        {u.accountType === 'business' && <Building2 className="w-3 h-3 text-blue-500" />}
                        {u.accountType}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                          <Crown className="w-3 h-3 text-purple-600" /> Super Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Standard User
                        </span>
                      )}
                    </td>

                    {/* WhatsApp Status */}
                    <td className="py-4 px-4">
                      {u.whatsappConnected ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {u.whatsappNumber || 'Connected'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Disconnected
                        </span>
                      )}
                    </td>

                    {/* Lead Count */}
                    <td className="py-4 px-4 text-center font-extrabold text-slate-900">
                      {u.leadCount}
                    </td>

                    {/* Active Status */}
                    <td className="py-4 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[10px] bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Disabled
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit User */}
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition-colors"
                          title="Edit User Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Active Status */}
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            u.isActive
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
                          }`}
                          title={u.isActive ? 'Disable User Account' : 'Enable User Account'}
                        >
                          {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                          title="Delete User Account"
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

      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" /> Edit User Profile
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs font-medium">
              
              <div className="space-y-1.5">
                <label className="block text-slate-600 font-bold uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600 font-bold uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600 font-bold uppercase tracking-wider">Account Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'user' | 'admin' })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:border-blue-600 focus:outline-none"
                >
                  <option value="user">Regular User</option>
                  <option value="admin">Super Admin</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600 font-bold uppercase tracking-wider">Active Status</label>
                <select
                  value={editingUser.isActive ? 'active' : 'disabled'}
                  onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.value === 'active' })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:border-blue-600 focus:outline-none"
                >
                  <option value="active">Active Account</option>
                  <option value="disabled">Disabled Account</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingEdit ? 'Saving Changes...' : 'Save User Profile'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}
