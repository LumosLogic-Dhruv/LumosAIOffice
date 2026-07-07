import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Users, Copy, Check, Plus, Trash2, RefreshCw, Link as LinkIcon,
  Shield, User, Activity, Eye, Edit3, Share2, FileText, Sparkles,
  Clock, Lock, Unlock, Loader2, Download, X, Send, Mail
} from 'lucide-react';

const BRAND = '#714B67';

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  _creationTime: number;
}

interface DocItem {
  _id: string;
  title: string;
  type: string;
  clientName: string;
  data: any;
  updatedAt: number;
}

interface ActivityLog {
  _id: string;
  userId: string;
  userName: string;
  documentId: string;
  documentTitle: string;
  action: string;
  timestamp: number;
}

const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  viewed:     { label: 'Viewed',     color: '#6b7280', bg: '#f3f4f6', icon: Eye },
  edited:     { label: 'Edited',     color: '#2563eb', bg: '#eff6ff', icon: Edit3 },
  ai_edited:  { label: 'AI Edited',  color: '#7c3aed', bg: '#f5f3ff', icon: Sparkles },
  shared:     { label: 'Shared',     color: '#059669', bg: '#ecfdf5', icon: Share2 },
  deleted:    { label: 'Deleted',    color: '#dc2626', bg: '#fef2f2', icon: Trash2 },
  duplicated: { label: 'Duplicated', color: '#d97706', bg: '#fffbeb', icon: Copy },
};

const TYPE_COLORS: Record<string, string> = {
  quotation: '#8B5CF6', invoice: '#059669', proforma_invoice: '#0284C7',
  proposal: '#D97706', sow: '#DB2777', agreement: '#7C3AED',
  nda: '#DC2626', receipt: '#16A34A', timeline: '#2563EB',
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const Team = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [updatingPerm, setUpdatingPerm] = useState<string | null>(null);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [actionFilter, setActionFilter] = useState<string>('all');

  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [removing, setRemoving] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  const [addForm, setAddForm] = useState({ name: '', email: '', role: 'member' });
  const [addingMember, setAddingMember] = useState(false);

  const isOwner = user?.role === 'admin';

  useEffect(() => {
    fetchMembers();
    fetchCompany();
    if (isOwner) {
      fetchDocuments();
      fetchActivityLogs();
    }
  }, [isOwner]);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/company/members');
      setMembers(res.data);
    } catch {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompany = async () => {
    try {
      const res = await api.get('/company');
      if (res.data?.inviteCode) setInviteCode(res.data.inviteCode);
    } catch {}
  };

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await api.get('/documents');
      setDocuments(res.data || []);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchActivityLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.get('/company/activity-logs');
      setActivityLogs(res.data || []);
    } catch {} finally {
      setLoadingLogs(false);
    }
  };

  const handlePermissionToggle = async (doc: DocItem, newPerm: 'all' | 'owner_only') => {
    setUpdatingPerm(doc._id);
    try {
      const res = await api.put(`/documents/${doc._id}/permission`, { permission: newPerm });
      setDocuments(prev => prev.map(d => d._id === doc._id ? { ...d, data: res.data.data } : d));
      toast.success(newPerm === 'owner_only' ? `"${doc.title}" locked to owner only` : `"${doc.title}" opened to all members`);
    } catch {
      toast.error('Failed to update permission');
    } finally {
      setUpdatingPerm(null);
    }
  };

  const generateInvite = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/company/invite');
      setInviteCode(res.data.inviteCode);
      toast.success('New invite link generated!');
    } catch {
      toast.error('Failed to generate invite link');
    } finally {
      setGenerating(false);
    }
  };

  const copyInviteLink = async () => {
    const link = `${window.location.origin}/register?invite=${inviteCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    toast.success('Invite link copied!');
  };

  const sendInviteEmail = async () => {
    if (!inviteEmail.trim()) return toast.error('Enter an email address');
    setSendingInvite(true);
    try {
      await api.post('/company/invite', { email: inviteEmail.trim() });
      toast.success('Invite sent to email!');
      setInviteEmail('');
      localStorage.setItem('onboardingInviteSent', 'true');
    } catch {
      toast.error('Failed to send invite');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleAddMember = async () => {
    if (!addForm.name.trim()) return toast.error('Enter the member\'s full name');
    if (!addForm.email.trim()) return toast.error('Enter the member\'s email address');
    setAddingMember(true);
    try {
      await api.post('/company/invite-direct', addForm);
      toast.success(`Account created and credentials sent to ${addForm.email}`);
      setAddForm({ name: '', email: '', role: 'member' });
      fetchMembers();
      localStorage.setItem('onboardingInviteSent', 'true');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'member' | 'viewer') => {
    setUpdatingRole(memberId);
    try {
      await api.put(`/company/members/${memberId}/role`, { role: newRole });
      setMembers(prev => prev.map(m => m._id === memberId ? { ...m, role: newRole } : m));
      toast.success(`Role updated to ${newRole}`);
    } catch {
      toast.error('Failed to update role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const confirmRemoveMember = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await api.delete(`/company/members/${removeTarget._id}`);
      setMembers(prev => prev.filter(m => m._id !== removeTarget._id));
      toast.success(`${removeTarget.name} removed from team`);
      setRemoveTarget(null);
    } catch {
      toast.error('Failed to remove member');
    } finally {
      setRemoving(false);
    }
  };

  const downloadActivityCSV = () => {
    const header = ['Date/Time', 'User', 'Document', 'Action'];
    const rows = activityLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.userName,
      log.documentTitle,
      log.action,
    ]);
    const csvContent = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activity-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = actionFilter === 'all'
    ? activityLogs
    : activityLogs.filter(l => l.action === actionFilter);

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }} />
    </div>
  );

  return (
    <div className="space-y-6">
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-gray-900 text-base">Remove Member</h3>
              <button onClick={() => setRemoveTarget(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Remove <span className="font-bold text-gray-900">{removeTarget.name}</span> from your team?
            </p>
            <p className="text-xs text-red-500 font-semibold">They will lose access immediately.</p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setRemoveTarget(null)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveMember}
                disabled={removing}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {removing ? <Loader2 size={14} className="animate-spin" /> : null}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-gray-900">Team</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {members.length} member{members.length !== 1 ? 's' : ''} in your workspace
        </p>
      </div>

      {isOwner && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND}15`, color: BRAND }}>
              <LinkIcon size={16} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Invite Team Members</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Copy and share this link manually. To add a member and send them login credentials directly, use the card below.
          </p>
          {inviteCode ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 font-mono truncate select-all">
                  {window.location.origin}/register?invite={inviteCode}
                </div>
                <button
                  onClick={copyInviteLink}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border-2 transition-all whitespace-nowrap"
                  style={{ borderColor: BRAND, color: BRAND }}
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={generateInvite}
                  disabled={generating}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
                  title="Generate a new invite link (invalidates previous)"
                >
                  <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
                </button>
              </div>
              <p className="text-xs text-amber-600 font-medium">
                Generating a new link invalidates the previous one.
              </p>
            </div>
          ) : (
            <button
              onClick={generateInvite}
              disabled={generating}
              style={{ backgroundColor: BRAND }}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow disabled:opacity-50"
            >
              <Plus size={15} />
              {generating ? 'Generating...' : 'Generate Invite Link'}
            </button>
          )}
        </div>
      )}

      {isOwner && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND}15`, color: BRAND }}>
              <Plus size={16} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Add Member Directly</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Create an account for a team member and email them their login credentials. They can reset their password anytime.
          </p>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <User size={13} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  className="flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-400 focus:outline-none min-w-0"
                />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <Mail size={13} className="text-gray-400 shrink-0" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={addForm.email}
                  onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                  className="flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-400 focus:outline-none min-w-0"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {(['member', 'viewer'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setAddForm(f => ({ ...f, role: r }))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all capitalize"
                    style={addForm.role === r
                      ? { backgroundColor: BRAND, color: '#fff', borderColor: BRAND }
                      : { backgroundColor: 'transparent', color: '#6b7280', borderColor: '#e5e7eb' }}
                  >
                    {r === 'viewer' ? <Eye size={11} /> : <User size={11} />}
                    {r === 'member' ? 'Member' : 'Viewer'}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddMember}
                disabled={addingMember || !addForm.name.trim() || !addForm.email.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 ml-auto"
                style={{ backgroundColor: BRAND }}
              >
                {addingMember ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                {addingMember ? 'Creating...' : 'Create & Send Credentials'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {members.length === 0 ? (
          <div className="py-16 text-center">
            <div className="p-4 bg-gray-50 rounded-xl inline-block mb-3">
              <Users size={32} className="text-gray-200" />
            </div>
            <p className="text-gray-400 text-sm">No team members yet. Share an invite link to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Member</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Joined</th>
                {isOwner && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map(m => (
                <tr key={m._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: BRAND }}>
                        {(m.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                        {m._id === user?._id && <span className="text-xs text-gray-400">(You)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{m.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold"
                      style={
                        m.role === 'admin'
                          ? { backgroundColor: BRAND, color: '#fff' }
                          : m.role === 'viewer'
                          ? { backgroundColor: '#eff6ff', color: '#2563eb' }
                          : { backgroundColor: '#f3f4f6', color: '#6b7280' }
                      }
                    >
                      {m.role === 'admin' ? <Shield size={10} /> : m.role === 'viewer' ? <Eye size={10} /> : <User size={10} />}
                      {m.role === 'admin' ? 'Owner' : m.role === 'viewer' ? 'Viewer' : 'Member'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(m._creationTime).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </td>
                  {isOwner && (
                    <td className="px-5 py-3 text-right">
                      {m._id !== user?._id && m.role !== 'admin' && (
                        <div className="flex items-center justify-end gap-1.5">
                          {updatingRole === m._id ? (
                            <Loader2 size={13} className="animate-spin text-gray-400" />
                          ) : (
                            <button
                              onClick={() => handleRoleChange(m._id, m.role === 'viewer' ? 'member' : 'viewer')}
                              className="px-2 py-1 rounded-md text-xs font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                              title={m.role === 'viewer' ? 'Promote to Member' : 'Set as Viewer'}
                            >
                              {m.role === 'viewer' ? 'Make Member' : 'Make Viewer'}
                            </button>
                          )}
                          <button
                            onClick={() => setRemoveTarget(m)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove member"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isOwner && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${BRAND}15`, color: BRAND }}>
                <Shield size={15} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Document Edit Permissions</h3>
                <p className="text-xs text-gray-400 mt-0.5">Control who can edit each document</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Unlock size={11} className="text-green-500" /> All members
              </span>
              <span className="flex items-center gap-1">
                <Lock size={11} className="text-amber-500" /> Owner only
              </span>
            </div>
          </div>

          {loadingDocs ? (
            <div className="py-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: BRAND }} />
            </div>
          ) : documents.length === 0 ? (
            <div className="py-10 text-center">
              <FileText size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No documents yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Document</th>
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-left">Client</th>
                  <th className="px-5 py-3 text-left">Current Permission</th>
                  <th className="px-5 py-3 text-right">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {documents.map(doc => {
                  const perm: 'all' | 'owner_only' = doc.data?.editPermission || 'all';
                  const isUpdating = updatingPerm === doc._id;
                  const typeColor = TYPE_COLORS[doc.type] || BRAND;
                  return (
                    <tr key={doc._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-gray-900 text-xs max-w-[180px] truncate">{doc.title}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize"
                          style={{ backgroundColor: `${typeColor}15`, color: typeColor }}
                        >
                          {(doc.type || '').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{doc.clientName || '—'}</td>
                      <td className="px-5 py-3">
                        {perm === 'owner_only' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700">
                            <Lock size={11} /> Owner Only
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-700">
                            <Unlock size={11} /> All Members
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {isUpdating ? (
                            <Loader2 size={14} className="animate-spin text-gray-400" />
                          ) : perm === 'owner_only' ? (
                            <button
                              onClick={() => handlePermissionToggle(doc, 'all')}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
                            >
                              <Unlock size={11} /> Allow All
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePermissionToggle(doc, 'owner_only')}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors"
                            >
                              <Lock size={11} /> Lock
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!isOwner && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={14} className="text-gray-400" />
            <h4 className="text-sm font-bold text-gray-600">Document Permissions</h4>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            All members can view documents. The workspace owner controls which documents are editable by all members vs owner only.
          </p>
        </div>
      )}

      {isOwner && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${BRAND}15`, color: BRAND }}>
                <Activity size={15} />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Activity Log</h3>
              <span className="text-xs text-gray-400 font-medium">Last 100 actions</span>
              {activityLogs.length > 0 && (
                <button
                  onClick={downloadActivityCSV}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors ml-1"
                  title="Download CSV"
                >
                  <Download size={12} /> Download CSV
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {(['all', 'viewed', 'edited', 'ai_edited', 'shared', 'deleted', 'duplicated'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setActionFilter(f)}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                  style={actionFilter === f
                    ? { backgroundColor: BRAND, color: '#fff' }
                    : { backgroundColor: '#f3f4f6', color: '#6b7280' }}
                >
                  {f === 'all' ? 'All' : f === 'ai_edited' ? 'AI Edit' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loadingLogs ? (
            <div className="py-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: BRAND }} />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center">
              <Activity size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No activity recorded yet.</p>
              <p className="text-gray-300 text-xs mt-1">Actions on documents will appear here.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Member</th>
                  <th className="px-5 py-3 text-left">Action</th>
                  <th className="px-5 py-3 text-left">Document</th>
                  <th className="px-5 py-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.map(log => {
                  const cfg = ACTION_CONFIG[log.action] || { label: log.action, color: '#6b7280', bg: '#f3f4f6', icon: FileText };
                  const Icon = cfg.icon;
                  return (
                    <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: BRAND }}>
                            {(log.userName || '?')[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900 text-xs">{log.userName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold"
                          style={{ backgroundColor: cfg.bg, color: cfg.color }}
                        >
                          <Icon size={11} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-gray-600 font-medium max-w-[180px] truncate block">{log.documentTitle}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock size={11} />
                          {timeAgo(log.timestamp)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Team;
