import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import {
  BarChart3, Users, Building2, FileText, LogOut, Shield, RefreshCw,
  Search, Trash2, Activity, CheckCircle, AlertCircle, Eye, X, Download
} from 'lucide-react';

const BRAND = '#714B67';

type Tab = 'overview' | 'users' | 'companies' | 'documents';

const Badge = ({ text, color = BRAND }: { text: string; color?: string }) => (
  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide capitalize"
    style={{ backgroundColor: `${color}15`, color }}>
    {text}
  </span>
);

const StatCard = ({ icon: Icon, label, value, sub, trend }: any) => (
  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${BRAND}12` }}>
        <Icon size={19} style={{ color: BRAND }} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const AdminApp = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setRefreshing(true);
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
      console.error('Failed to load admin data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch { alert('Failed to delete user'); }
  };

  const deleteDocument = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await api.delete(`/admin/documents/${id}`);
      setDocuments(prev => prev.filter(d => d._id !== id));
    } catch { alert('Failed to delete document'); }
  };

  const updateRole = async (id: string, role: string) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
    } catch { alert('Failed to update role'); }
  };

  // Derived stats
  const docsByType: Record<string, number> = documents.reduce((acc: any, d: any) => {
    acc[d.type] = (acc[d.type] || 0) + 1;
    return acc;
  }, {});

  const recentDocs = documents.slice(0, 5);
  const recentUsers = users.slice(0, 5);

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-3" style={{ borderColor: BRAND }} />
        <p className="text-sm text-gray-400">Loading platform data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: BRAND }}>
                <Shield size={14} />
              </div>
              <span className="font-bold text-gray-900 text-sm">DocuFlow Admin</span>
            </div>
            <span className="h-4 w-px bg-gray-200" />
            <span className="text-xs font-medium px-2 py-0.5 rounded-md uppercase tracking-wider" style={{ backgroundColor: `${BRAND}10`, color: BRAND }}>
              Platform Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAll}
              disabled={refreshing}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>

            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: BRAND }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-800 leading-none">{user?.name}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider mt-0.5" style={{ color: BRAND }}>{user?.role}</p>
              </div>
            </div>

            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <LogOut size={13} />
              <span className="hidden sm:block">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-gray-100 p-1 rounded-xl w-fit shadow-sm mb-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSearch(''); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
              style={tab === t.id ? { backgroundColor: BRAND } : {}}
            >
              <t.icon size={14} />
              {t.label}
              {t.count !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} sub="Registered accounts" />
              <StatCard icon={Building2} label="Companies" value={stats?.totalCompanies} sub="Active workspaces" />
              <StatCard icon={FileText} label="Documents" value={stats?.totalDocuments} sub="All time" />
              <StatCard icon={Activity} label="Docs/Company" value={stats?.totalCompanies ? (stats.totalDocuments / stats.totalCompanies).toFixed(1) : '0'} sub="Average" />
            </div>

            {/* Document type breakdown */}
            {Object.keys(docsByType).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Document Type Breakdown</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Object.entries(docsByType).map(([type, count]) => (
                    <div key={type} className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-xl font-bold text-gray-900">{count}</p>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">{type.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Recent Users */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Recent Users</h3>
                  <button onClick={() => setTab('users')} className="text-xs font-semibold hover:underline" style={{ color: BRAND }}>View all</button>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-2.5 text-left">Name</th>
                      <th className="px-5 py-2.5 text-left">Email</th>
                      <th className="px-5 py-2.5 text-left">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentUsers.map(u => (
                      <tr key={u._id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-medium text-gray-900">{u.name}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{u.email}</td>
                        <td className="px-5 py-3"><Badge text={u.role} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recent Docs */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Recent Documents</h3>
                  <button onClick={() => setTab('documents')} className="text-xs font-semibold hover:underline" style={{ color: BRAND }}>View all</button>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-2.5 text-left">Title</th>
                      <th className="px-5 py-2.5 text-left">Client</th>
                      <th className="px-5 py-2.5 text-left">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentDocs.map(d => (
                      <tr key={d._id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-medium text-gray-900 max-w-[150px] truncate">{d.title}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{d.clientName}</td>
                        <td className="px-5 py-3"><Badge text={d.type.replace('_', ' ')} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Users ── */}
        {tab === 'users' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-gray-900">All Users ({users.length})</h3>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none w-52 transition-colors"
                  onFocus={e => e.target.style.borderColor = BRAND}
                  onBlur={e => e.target.style.borderColor = ''}
                  placeholder="Search users..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">User</th>
                    <th className="px-5 py-3 text-left">Email</th>
                    <th className="px-5 py-3 text-left">Role</th>
                    <th className="px-5 py-3 text-left">Company ID</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: BRAND }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{u.email}</td>
                      <td className="px-5 py-3">
                        <select
                          value={u.role}
                          onChange={e => updateRole(u._id, e.target.value)}
                          className="text-xs font-semibold px-2 py-1 rounded-lg border border-gray-200 bg-gray-50 outline-none cursor-pointer"
                          onFocus={e => e.target.style.borderColor = BRAND}
                          onBlur={e => e.target.style.borderColor = ''}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="root">Root</option>
                        </select>
                      </td>
                      <td className="px-5 py-3 text-gray-400 font-mono text-xs truncate max-w-[120px]">{u.companyId}</td>
                      <td className="px-5 py-3 text-right">
                        {u._id !== user?._id && (
                          <button onClick={() => deleteUser(u._id, u.name)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No users found</div>}
            </div>
          </div>
        )}

        {/* ── Companies ── */}
        {tab === 'companies' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-gray-900">All Companies ({companies.length})</h3>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none w-52 transition-colors"
                  onFocus={e => e.target.style.borderColor = BRAND}
                  onBlur={e => e.target.style.borderColor = ''}
                  placeholder="Search companies..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">Company</th>
                    <th className="px-5 py-3 text-left">Email</th>
                    <th className="px-5 py-3 text-left">GST</th>
                    <th className="px-5 py-3 text-left">Phone</th>
                    <th className="px-5 py-3 text-left">Custom Fields</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCompanies.map(c => (
                    <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          {c.logoUrl ? (
                            <img src={c.logoUrl} alt="" className="w-7 h-7 rounded-lg object-contain border border-gray-100" />
                          ) : (
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: BRAND }}>
                              {c.name?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{c.email || '—'}</td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{c.gstNumber || '—'}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{c.phone || '—'}</td>
                      <td className="px-5 py-3"><Badge text={`${(c.customFields ?? []).length} fields`} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCompanies.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No companies found</div>}
            </div>
          </div>
        )}

        {/* ── Documents ── */}
        {tab === 'documents' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-gray-900">All Documents ({documents.length})</h3>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none w-52 transition-colors"
                  onFocus={e => e.target.style.borderColor = BRAND}
                  onBlur={e => e.target.style.borderColor = ''}
                  placeholder="Search documents..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">Title</th>
                    <th className="px-5 py-3 text-left">Client</th>
                    <th className="px-5 py-3 text-left">Type</th>
                    <th className="px-5 py-3 text-left">Updated</th>
                    <th className="px-5 py-3 text-left">PDF</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDocs.map(d => (
                    <tr key={d._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900 max-w-[180px] truncate">{d.title}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{d.clientName}</td>
                      <td className="px-5 py-3"><Badge text={d.type.replace('_', ' ')} /></td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {new Date(d.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </td>
                      <td className="px-5 py-3">
                        {d.pdfUrl ? (
                          <button
                            onClick={() => setPreviewDoc(d)}
                            className="text-xs font-semibold flex items-center gap-1 hover:underline"
                            style={{ color: BRAND }}>
                            <Eye size={12} /> View
                          </button>
                        ) : (
                          <button
                            onClick={() => setPreviewDoc(d)}
                            className="text-xs font-semibold flex items-center gap-1 text-gray-400 hover:text-gray-600">
                            <FileText size={12} /> Preview
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => deleteDocument(d._id, d.title)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDocs.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No documents found</div>}
            </div>
          </div>
        )}
      </div>

      {/* ── Inline Document Viewer Modal ── */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${BRAND}15` }}>
                <FileText size={15} style={{ color: BRAND }} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{previewDoc.title}</p>
                <p className="text-xs text-gray-400">{previewDoc.clientName} · <span className="capitalize">{(previewDoc.type || '').replace('_', ' ')}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {previewDoc.pdfUrl && (
                <a
                  href={previewDoc.pdfUrl}
                  download
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border-2 transition-all"
                  style={{ borderColor: BRAND, color: BRAND }}
                >
                  <Download size={13} /> Download PDF
                </a>
              )}
              <button
                onClick={() => setPreviewDoc(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition-colors"
              >
                <X size={14} /> Close
              </button>
            </div>
          </div>

          {/* Modal body */}
          {previewDoc.pdfUrl ? (
            <iframe
              src={previewDoc.pdfUrl}
              className="flex-1 w-full border-0"
              title="Document PDF"
            />
          ) : (
            <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
              <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-sm overflow-hidden">
                {/* Doc header band */}
                <div className="p-8 text-white" style={{ backgroundColor: BRAND }}>
                  <div className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">
                    {(previewDoc.type || '').replace('_', ' ')}
                  </div>
                  <h2 className="text-2xl font-black">{previewDoc.title}</h2>
                </div>
                {/* Doc body */}
                <div className="px-8 py-6 space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Client</p>
                      <p className="font-black text-gray-900">{previewDoc.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Date</p>
                      <p className="font-bold text-gray-900 text-sm">
                        {new Date(previewDoc._creationTime || previewDoc.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>
                  {previewDoc.data?.sections?.map((s: any, i: number) => (
                    <div key={i} className="space-y-2">
                      <h3 className="text-lg font-black text-gray-900 border-l-4 pl-3" style={{ borderColor: BRAND }}>{s.heading}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{s.content}</p>
                    </div>
                  ))}
                  {previewDoc.data?.tables?.map((table: any, i: number) => (
                    <div key={i} className="space-y-2">
                      <h3 className="text-base font-black text-gray-900">{table.title}</h3>
                      <div className="overflow-hidden rounded-lg border border-gray-100">
                        <table className="w-full text-xs">
                          <thead>
                            <tr style={{ backgroundColor: BRAND }}>
                              {(Array.isArray(table.headers) ? table.headers : Object.values(table.headers || {})).map((h: any, j: number) => (
                                <th key={j} className="px-3 py-2 text-white font-bold uppercase tracking-wider text-left">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {(Array.isArray(table.rows) ? table.rows : []).map((row: any, j: number) => (
                              <tr key={j} className="hover:bg-gray-50">
                                {(Array.isArray(row) ? row : Object.values(row || {})).map((cell: any, k: number) => (
                                  <td key={k} className="px-3 py-2 text-gray-700">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                  {previewDoc.data?.summary && typeof previewDoc.data.summary === 'object' && Object.keys(previewDoc.data.summary).length > 0 && (
                    <div className="flex justify-end">
                      <div className="w-60 space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        {Object.entries(previewDoc.data.summary).map(([k, v]: [string, any]) => (
                          <div key={k} className="flex justify-between items-center">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{k}</span>
                            <span className="font-black text-gray-900">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {previewDoc.data?.terms && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-1">Terms & Conditions</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{previewDoc.data.terms}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminApp;
