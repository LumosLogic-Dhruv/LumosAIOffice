import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import {
  Users, Building2, FileText, Trash2, LogOut,
  BarChart3, Shield, RefreshCw, ChevronDown, Search,
  Crown, UserCheck
} from 'lucide-react';

const BRAND = '#714B67';

type Tab = 'overview' | 'users' | 'companies' | 'documents';

const Badge = ({ text, color = BRAND }: { text: string; color?: string }) => (
  <span
    className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest"
    style={{ backgroundColor: `${color}15`, color }}
  >
    {text}
  </span>
);

const StatCard = ({ icon: Icon, label, value, sub }: any) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${BRAND}15` }}>
      <Icon size={22} style={{ color: BRAND }} />
    </div>
    <div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-black text-gray-900 leading-none mt-1">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 font-semibold mt-0.5">{sub}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user && user.role !== 'root' && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, c, d] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/companies'),
        api.get('/admin/documents'),
      ]);
      setStats(s.data);
      setUsers(u.data);
      setCompanies(c.data);
      setDocuments(d.data);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  const deleteDocument = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await api.delete(`/admin/documents/${id}`);
      setDocuments(documents.filter(d => d._id !== id));
      toast.success('Document deleted');
    } catch { toast.error('Failed to delete document'); }
  };

  const updateRole = async (id: string, role: string) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      setUsers(users.map(u => u._id === id ? { ...u, role } : u));
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredDocs = documents.filter(d =>
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.clientName?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCompanies = companies.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'companies', label: 'Companies', icon: Building2, count: companies.length },
    { id: 'documents', label: 'Documents', icon: FileText, count: documents.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="md" />
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest" style={{ backgroundColor: `${BRAND}10`, color: BRAND }}>
              <Shield size={12} />
              Admin Console
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={loadAll} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
              <RefreshCw size={16} />
            </button>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ backgroundColor: BRAND }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-black text-gray-800 leading-none">{user?.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: BRAND }}>{user?.role}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:block">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab navigation */}
        <div className="flex items-center gap-1 bg-white border border-gray-100 p-1 rounded-xl w-fit shadow-sm mb-8">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSearch(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                tab === t.id ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
              style={tab === t.id ? { backgroundColor: BRAND } : {}}
            >
              <t.icon size={15} />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: BRAND }} />
          </div>
        ) : (
          <>
            {/* ── Overview ── */}
            {tab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} sub="Registered accounts" />
                  <StatCard icon={Building2} label="Companies" value={stats?.totalCompanies} sub="Active workspaces" />
                  <StatCard icon={FileText} label="Documents" value={stats?.totalDocuments} sub="All time generated" />
                </div>

                {/* Recent users */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">Recent Users</h3>
                    <button onClick={() => setTab('users')} className="text-xs font-bold hover:underline" style={{ color: BRAND }}>View all</button>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-black text-gray-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.slice(0, 5).map(u => (
                        <tr key={u._id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-3 font-bold text-gray-900">{u.name}</td>
                          <td className="px-6 py-3 text-gray-500">{u.email}</td>
                          <td className="px-6 py-3"><Badge text={u.role} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Recent docs */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">Recent Documents</h3>
                    <button onClick={() => setTab('documents')} className="text-xs font-bold hover:underline" style={{ color: BRAND }}>View all</button>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-black text-gray-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-3">Title</th>
                        <th className="px-6 py-3">Client</th>
                        <th className="px-6 py-3">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {documents.slice(0, 5).map(d => (
                        <tr key={d._id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-3 font-bold text-gray-900 max-w-xs truncate">{d.title}</td>
                          <td className="px-6 py-3 text-gray-500">{d.clientName}</td>
                          <td className="px-6 py-3"><Badge text={d.type.replace('_', ' ')} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Users ── */}
            {tab === 'users' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between gap-4">
                  <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">All Users ({users.length})</h3>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-[#714B67] transition-colors w-56"
                      placeholder="Search users..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-black text-gray-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredUsers.map(u => (
                        <tr key={u._id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0" style={{ backgroundColor: BRAND }}>
                                {u.name?.[0]?.toUpperCase()}
                              </div>
                              <span className="font-bold text-gray-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{u.email}</td>
                          <td className="px-6 py-4">
                            <select
                              value={u.role}
                              onChange={e => updateRole(u._id, e.target.value)}
                              className="text-xs font-black px-2 py-1 rounded-lg border border-gray-200 bg-gray-50 outline-none focus:border-[#714B67] cursor-pointer"
                            >
                              <option value="admin">Admin</option>
                              <option value="root">Root</option>
                              <option value="user">User</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {u._id !== user?._id && (
                              <button
                                onClick={() => deleteUser(u._id, u.name)}
                                className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="py-16 text-center text-gray-400 font-bold text-sm">No users found</div>
                  )}
                </div>
              </div>
            )}

            {/* ── Companies ── */}
            {tab === 'companies' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between gap-4">
                  <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">All Companies ({companies.length})</h3>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-[#714B67] transition-colors w-56"
                      placeholder="Search companies..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-black text-gray-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-3">Company</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">GST</th>
                        <th className="px-6 py-3">Custom Fields</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredCompanies.map(c => (
                        <tr key={c._id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {c.logoUrl ? (
                                <img src={c.logoUrl} alt="" className="w-8 h-8 rounded-lg object-contain border border-gray-100" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0" style={{ backgroundColor: BRAND }}>
                                  {c.name?.[0]?.toUpperCase()}
                                </div>
                              )}
                              <span className="font-bold text-gray-900">{c.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{c.email || '—'}</td>
                          <td className="px-6 py-4 text-gray-500 font-mono text-xs">{c.gstNumber || '—'}</td>
                          <td className="px-6 py-4">
                            <Badge text={`${(c.customFields ?? []).length} fields`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredCompanies.length === 0 && (
                    <div className="py-16 text-center text-gray-400 font-bold text-sm">No companies found</div>
                  )}
                </div>
              </div>
            )}

            {/* ── Documents ── */}
            {tab === 'documents' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between gap-4">
                  <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">All Documents ({documents.length})</h3>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-[#714B67] transition-colors w-56"
                      placeholder="Search documents..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-black text-gray-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-3">Title</th>
                        <th className="px-6 py-3">Client</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredDocs.map(d => (
                        <tr key={d._id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4 font-bold text-gray-900 max-w-[200px] truncate">{d.title}</td>
                          <td className="px-6 py-4 text-gray-500">{d.clientName}</td>
                          <td className="px-6 py-4"><Badge text={d.type.replace('_', ' ')} /></td>
                          <td className="px-6 py-4 text-gray-400 text-xs font-semibold">
                            {new Date(d.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => deleteDocument(d._id, d.title)}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredDocs.length === 0 && (
                    <div className="py-16 text-center text-gray-400 font-bold text-sm">No documents found</div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
