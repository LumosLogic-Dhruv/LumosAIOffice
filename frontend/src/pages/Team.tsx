import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Users, Copy, Check, Plus, Trash2, RefreshCw, Link as LinkIcon, Shield, User } from 'lucide-react';

const BRAND = '#714B67';

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  _creationTime: number;
}

const Team = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const isOwner = user?.role === 'admin';

  useEffect(() => {
    fetchMembers();
    fetchCompany();
  }, []);

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
    } catch {
      // silently ignore
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

  const removeMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove "${memberName}" from your team? They will lose access immediately.`)) return;
    try {
      await api.delete(`/company/members/${memberId}`);
      setMembers(prev => prev.filter(m => m._id !== memberId));
      toast.success(`${memberName} removed from team`);
    } catch {
      toast.error('Failed to remove member');
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Team</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {members.length} member{members.length !== 1 ? 's' : ''} in your workspace
          </p>
        </div>
      </div>

      {/* Invite Card — owner only */}
      {isOwner && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND}15`, color: BRAND }}>
              <LinkIcon size={16} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Invite Team Members</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Share this invite link with your employees. Anyone with the link can join your workspace as a member.
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

      {/* Members table */}
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
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: BRAND }}
                      >
                        {(m.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                        {m._id === user?._id && (
                          <span className="text-xs text-gray-400">(You)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{m.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold"
                      style={m.role === 'admin'
                        ? { backgroundColor: BRAND, color: '#fff' }
                        : { backgroundColor: '#f3f4f6', color: '#6b7280' }}
                    >
                      {m.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                      {m.role === 'admin' ? 'Owner' : 'Member'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(m._creationTime).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </td>
                  {isOwner && (
                    <td className="px-5 py-3 text-right">
                      {m._id !== user?._id && m.role !== 'admin' && (
                        <button
                          onClick={() => removeMember(m._id, m.name)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove member"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Permission note */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
        <h4 className="text-sm font-bold text-blue-800 mb-1">Document Edit Permissions</h4>
        <p className="text-xs text-blue-700 leading-relaxed">
          All members can view documents. In each document, the owner can restrict editing to "Owner Only" using the Edit Access control in the document page.
        </p>
      </div>
    </div>
  );
};

export default Team;
