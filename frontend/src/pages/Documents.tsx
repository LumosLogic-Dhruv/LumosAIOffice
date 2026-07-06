import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FileText, Search, Edit3, Copy, Trash2, Plus, Loader2, Share2, Check, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const BRAND = '#714B67';
const PAGE_SIZE = 20;

const TYPE_COLORS: Record<string, string> = {
  quotation: '#8B5CF6', invoice: '#059669', proforma_invoice: '#0284C7',
  proposal: '#D97706', sow: '#DB2777', agreement: '#7C3AED', nda: '#DC2626',
  receipt: '#16A34A', timeline: '#2563EB', form_16: '#0F766E', gst_invoice: '#0369A1',
  salary_slip: '#15803D', offer_letter: '#B45309', policy: '#6D28D9',
  experience_letter: '#9333EA', service_agreement: '#BE123C',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: '#F3F4F6', text: '#6B7280' },
  sent: { bg: '#DBEAFE', text: '#1D4ED8' },
  viewed: { bg: '#EDE9FE', text: '#7C3AED' },
  accepted: { bg: '#D1FAE5', text: '#065F46' },
  rejected: { bg: '#FEE2E2', text: '#991B1B' },
};

type SortKey = 'newest' | 'oldest' | 'az';
type Status = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';

interface DeleteTarget {
  _id: string;
  title: string;
}

const Documents = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sharing, setSharing] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, statusFilter, sort]);

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

  const confirmDelete = (doc: any) => {
    setDeleteTarget({ _id: doc._id, title: doc.title });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget._id);
    try {
      await api.delete(`/documents/${deleteTarget._id}`);
      setDocuments(prev => prev.filter(d => d._id !== deleteTarget._id));
      setSelected(prev => {
        const s = new Set(prev);
        s.delete(deleteTarget._id);
        return s;
      });
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    setBulkDeleting(true);
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map(id => api.delete(`/documents/${id}`)));
      setDocuments(prev => prev.filter(d => !selected.has(d._id)));
      setSelected(new Set());
      toast.success(`${ids.length} document${ids.length > 1 ? 's' : ''} deleted`);
    } catch {
      toast.error('Failed to delete some documents');
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const filtered = useMemo(() => {
    let list = documents.filter(d => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        (d.title || '').toLowerCase().includes(q) ||
        (d.clientName || '').toLowerCase().includes(q) ||
        (d.type || '').toLowerCase().includes(q);
      const matchType = typeFilter === 'all' || d.type === typeFilter;
      const docStatus = d.status || 'draft';
      const matchStatus = statusFilter === 'all' || docStatus === statusFilter;
      return matchSearch && matchType && matchStatus;
    });

    if (sort === 'newest') {
      list = [...list].sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0));
    } else if (sort === 'oldest') {
      list = [...list].sort((a, b) => (a._creationTime || 0) - (b._creationTime || 0));
    } else if (sort === 'az') {
      list = [...list].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return list;
  }, [documents, search, typeFilter, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const allOnPageSelected = paginated.length > 0 && paginated.every(d => selected.has(d._id));
  const someSelected = selected.size > 0;

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelected(prev => {
        const s = new Set(prev);
        paginated.forEach(d => s.delete(d._id));
        return s;
      });
    } else {
      setSelected(prev => {
        const s = new Set(prev);
        paginated.forEach(d => s.add(d._id));
        return s;
      });
    }
  };

  const exportCSV = () => {
    const headers = ['Title', 'Client', 'Type', 'Status', 'Date'];
    const rows = filtered.map(d => [
      `"${(d.title || '').replace(/"/g, '""')}"`,
      `"${(d.clientName || '').replace(/"/g, '""')}"`,
      `"${(d.type || '').replace(/_/g, ' ')}"`,
      `"${d.status || 'draft'}"`,
      `"${new Date(d._creationTime || d.updatedAt).toLocaleDateString()}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documents.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPageNumbers = () => {
    const max = 5;
    const half = Math.floor(max / 2);
    let start = Math.max(1, safePage - half);
    let end = Math.min(totalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }} />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Documents</h1>
          <p className="text-xs text-gray-400 mt-0.5">{documents.length} total documents</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
          >
            <Download size={14} />
            Export CSV
          </button>
          <Link
            to="/dashboard/documents/create"
            style={{ backgroundColor: BRAND }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow"
          >
            <Plus size={15} />
            New Document
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-[#714B67] transition-colors"
            placeholder="Search by title, client or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-[#714B67] transition-colors text-gray-600"
        >
          <option value="all">All Types</option>
          {Object.keys(TYPE_COLORS).map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-[#714B67] transition-colors text-gray-600"
        >
          <option value="all">All Statuses</option>
          {Object.keys(STATUS_COLORS).map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg bg-white p-1">
          {(['newest', 'oldest', 'az'] as SortKey[]).map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${sort === s ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
              style={sort === s ? { backgroundColor: BRAND } : {}}
            >
              {s === 'newest' ? 'Newest' : s === 'oldest' ? 'Oldest' : 'A–Z'}
            </button>
          ))}
        </div>
      </div>

      {someSelected && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-red-50 border border-red-100 rounded-lg">
          <span className="text-sm font-medium text-red-700">{selected.size} document{selected.size > 1 ? 's' : ''} selected</span>
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {bulkDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            Delete Selected
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <div className="p-4 bg-gray-50 rounded-xl inline-block mb-3">
            <FileText size={32} className="text-gray-200" />
          </div>
          <p className="text-gray-400 text-sm">
            {documents.length === 0 ? 'No documents yet.' : 'No documents match your filters.'}
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
        <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-center w-10">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer accent-[#714B67]"
                    />
                  </th>
                  <th className="px-5 py-3 text-left">Title</th>
                  <th className="px-5 py-3 text-left">Client</th>
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Last Updated</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(doc => {
                  const typeColor = TYPE_COLORS[doc.type] || BRAND;
                  const docStatus: Status = doc.status || 'draft';
                  const statusStyle = STATUS_COLORS[docStatus] || STATUS_COLORS.draft;
                  const isDuplicating = duplicating === doc._id;
                  const isDeleting = deleting === doc._id;
                  const isSelected = selected.has(doc._id);
                  return (
                    <tr key={doc._id} className={`hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-purple-50/30' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(doc._id)}
                          className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer accent-[#714B67]"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-gray-900 max-w-[200px] truncate">{doc.title}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{doc.clientName || '—'}</td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold capitalize"
                          style={{ backgroundColor: `${typeColor}15`, color: typeColor }}
                        >
                          {(doc.type || '').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold capitalize"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                        >
                          {docStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {new Date(doc._creationTime || doc.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/dashboard/documents/${doc._id}`}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                            title="Edit document"
                          >
                            <Edit3 size={14} />
                          </Link>
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
                          <button
                            onClick={() => handleDuplicate(doc)}
                            disabled={isDuplicating || isDeleting}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-40"
                            title="Duplicate document"
                          >
                            {isDuplicating ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                          </button>
                          <button
                            onClick={() => confirmDelete(doc)}
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

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} documents
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {getPageNumbers().map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className="min-w-[30px] h-[30px] text-xs font-semibold rounded-lg border transition-colors"
                    style={n === safePage
                      ? { backgroundColor: BRAND, borderColor: BRAND, color: '#fff' }
                      : { borderColor: '#E5E7EB', color: '#6B7280', backgroundColor: '#fff' }}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-xl">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Delete Document</p>
                <p className="text-xs text-gray-400">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{deleteTarget.title}"</span>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={!!deleting}
                className="flex-1 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!!deleting}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
