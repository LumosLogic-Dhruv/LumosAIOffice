import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FileText, Search, Edit3, Copy, Trash2, Plus, Loader2, Share2, Check } from 'lucide-react';

const BRAND = '#714B67';

const TYPE_COLORS: Record<string, string> = {
  quotation: '#8B5CF6',
  invoice: '#059669',
  proforma_invoice: '#0284C7',
  proposal: '#D97706',
  sow: '#DB2777',
  agreement: '#7C3AED',
  nda: '#DC2626',
  receipt: '#16A34A',
  timeline: '#2563EB',
  form_16: '#0F766E',
  gst_invoice: '#0369A1',
  salary_slip: '#15803D',
  offer_letter: '#B45309',
  policy: '#6D28D9',
  experience_letter: '#9333EA',
  service_agreement: '#BE123C',
};

const Documents = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sharing, setSharing] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (doc: any) => {
    setDuplicating(doc._id);
    try {
      const res = await api.post(`/documents/${doc._id}/duplicate`);
      setDocuments(prev => [res.data, ...prev]);
      toast.success('Document duplicated!');
      navigate(`/dashboard/documents/${res.data._id}`);
    } catch {
      toast.error('Failed to duplicate document');
    } finally {
      setDuplicating(null);
    }
  };

  const handleShare = async (doc: any) => {
    setSharing(doc._id);
    try {
      const res = await api.post(`/documents/${doc._id}/share`);
      const shareUrl = `${window.location.origin}/shared/${res.data.shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(doc._id);
      setTimeout(() => setShareCopied(null), 3000);
      toast.success('Share link copied to clipboard!');
    } catch {
      toast.error('Failed to create share link');
    } finally {
      setSharing(null);
    }
  };

  const handleDelete = async (doc: any) => {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    setDeleting(doc._id);
    try {
      await api.delete(`/documents/${doc._id}`);
      setDocuments(prev => prev.filter(d => d._id !== doc._id));
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = documents.filter(d =>
    (d.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.clientName || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.type || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }} />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Documents</h1>
          <p className="text-xs text-gray-400 mt-0.5">{documents.length} total documents</p>
        </div>
        <Link
          to="/dashboard/documents/create"
          style={{ backgroundColor: BRAND }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow"
        >
          <Plus size={15} />
          New Document
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-[#714B67] transition-colors"
          placeholder="Search by title, client or type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <div className="p-4 bg-gray-50 rounded-xl inline-block mb-3">
            <FileText size={32} className="text-gray-200" />
          </div>
          <p className="text-gray-400 text-sm">
            {documents.length === 0 ? 'No documents yet.' : 'No documents match your search.'}
          </p>
          {documents.length === 0 && (
            <Link
              to="/dashboard/documents/create"
              style={{ backgroundColor: BRAND }}
              className="mt-4 inline-block px-5 py-2 text-white rounded-lg text-sm font-semibold shadow"
            >
              Create First Document
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Client</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Last Updated</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(doc => {
                const typeColor = TYPE_COLORS[doc.type] || BRAND;
                const isDuplicating = duplicating === doc._id;
                const isDeleting = deleting === doc._id;
                return (
                  <tr key={doc._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-900 max-w-[200px] truncate">{doc.title}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{doc.clientName || '—'}</td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold capitalize"
                        style={{ backgroundColor: `${typeColor}15`, color: typeColor }}
                      >
                        {(doc.type || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(doc._creationTime || doc.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit */}
                        <Link
                          to={`/dashboard/documents/${doc._id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          title="Edit document"
                        >
                          <Edit3 size={14} />
                        </Link>

                        {/* Share */}
                        <button
                          onClick={() => handleShare(doc)}
                          disabled={sharing === doc._id || isDeleting}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-40"
                          title="Copy share link"
                        >
                          {sharing === doc._id
                            ? <Loader2 size={14} className="animate-spin" />
                            : shareCopied === doc._id
                            ? <Check size={14} className="text-green-500" />
                            : <Share2 size={14} />}
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => handleDuplicate(doc)}
                          disabled={isDuplicating || isDeleting}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-40"
                          title="Duplicate document"
                        >
                          {isDuplicating ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(doc)}
                          disabled={isDuplicating || isDeleting}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                          title="Delete document"
                        >
                          {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Documents;
