import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FileText, Search, Edit3, Copy, Trash2, Plus, Loader2, Share2, Check, Download, ChevronLeft, ChevronRight, X } from 'lucide-react';

const BRAND = '#714B67';
const PAGE_SIZE = 20;

const INVOICE_TYPES = ['invoice', 'gst_invoice', 'proforma_invoice', 'receipt'];

const PAYMENT_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  unpaid:  { bg: '#FEE2E2', text: '#991B1B' },
  paid:    { bg: '#D1FAE5', text: '#065F46' },
  overdue: { bg: '#FFEDD5', text: '#9A3412' },
};

const TYPE_COLORS: Record<string, string> = {
  quotation: '#8B5CF6', invoice: '#059669', proforma_invoice: '#0284C7',
  proposal: '#D97706', sow: '#DB2777', agreement: '#7C3AED', nda: '#DC2626',
  receipt: '#16A34A', timeline: '#2563EB', form_16: '#0F766E', gst_invoice: '#0369A1',
  salary_slip: '#15803D', offer_letter: '#B45309', policy: '#6D28D9',
  experience_letter: '#9333EA', service_agreement: '#BE123C',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft:    { bg: '#F3F4F6', text: '#6B7280' },
  sent:     { bg: '#DBEAFE', text: '#1D4ED8' },
  viewed:   { bg: '#EDE9FE', text: '#7C3AED' },
  accepted: { bg: '#D1FAE5', text: '#065F46' },
  rejected: { bg: '#FEE2E2', text: '#991B1B' },
};

type SortKey = 'newest' | 'oldest' | 'az';
type Status = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';

interface DeleteTarget {
  _id: string;
  title: string;
}

interface SharePopoverState {
  docId: string;
  expiresInDays: number | null;
  customDate: string;
  recipientEmail: string;
  mode: 'preset' | 'custom';
}

const Documents = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
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
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [continueCursor, setContinueCursor] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const [sharePopover, setSharePopover] = useState<SharePopoverState | null>(null);
  const sharePopoverRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments(null, true);
    fetchStats();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sharePopoverRef.current && !sharePopoverRef.current.contains(e.target as Node)) {
        setSharePopover(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/documents/stats');
      setTotalCount(res.data.total ?? null);
    } catch {
    }
  };

  const fetchDocuments = async (cursor: string | null, initial = false) => {
    if (initial) {
      setLoading(true);
    } else {
      setPageLoading(true);
    }
    try {
      const url = cursor
        ? `/documents?paginate=true&limit=${PAGE_SIZE}&cursor=${encodeURIComponent(cursor)}`
        : `/documents?paginate=true&limit=${PAGE_SIZE}`;
      const res = await api.get(url);
      const data = res.data;
      setDocuments(data.page ?? []);
      setContinueCursor(data.continueCursor ?? null);
      setIsDone(data.isDone ?? true);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  const handleNextPage = async () => {
    if (!continueCursor || isDone) return;
    setCursorHistory(prev => [...prev, continueCursor]);
    setCurrentPage(p => p + 1);
    await fetchDocuments(continueCursor);
  };

  const handlePrevPage = async () => {
    if (currentPage <= 1) return;
    const newHistory = [...cursorHistory];
    newHistory.pop();
    const prevCursor = newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;
    setCursorHistory(newHistory);
    setCurrentPage(p => p - 1);
    await fetchDocuments(prevCursor);
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

  const openSharePopover = (doc: any) => {
    setSharePopover({
      docId: doc._id,
      expiresInDays: null,
      customDate: '',
      recipientEmail: '',
      mode: 'preset',
    });
  };

  const handleShareSubmit = async (doc: any) => {
    if (!sharePopover) return;
    setSharing(doc._id);
    try {
      let expiresInDays: number | undefined;
      if (sharePopover?.mode === 'custom' && sharePopover?.customDate) {
        const diff = Math.ceil((new Date(sharePopover?.customDate).getTime() - Date.now()) / 86400000);
        expiresInDays = diff > 0 ? diff : undefined;
      } else if (sharePopover?.expiresInDays !== null) {
        expiresInDays = sharePopover?.expiresInDays;
      }
      const body: any = {};
      if (expiresInDays !== undefined) body.expiresInDays = expiresInDays;
      if (sharePopover?.recipientEmail) body.recipientEmail = sharePopover?.recipientEmail;
      const res = await api.post(`/documents/${doc._id}/share`, body);
      const shareUrl = `${window.location.origin}/shared/${res.data.shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(doc._id);
      setTimeout(() => setShareCopied(null), 3000);
      setDocuments(prev => prev.map(d => d._id === doc._id ? { ...d, shareToken: res.data.shareToken } : d));
      setSharePopover(null);
      toast.success('Share link copied to clipboard!');
    } catch {
      toast.error('Failed to create share link');
    } finally {
      setSharing(null);
    }
  };

  const handleRevokeShare = async (doc: any) => {
    setSharing(doc._id);
    try {
      await api.delete(`/documents/${doc._id}/share`);
      setDocuments(prev => prev.map(d => d._id === doc._id ? { ...d, shareToken: null } : d));
      setSharePopover(null);
      toast.success('Share link revoked');
    } catch {
      toast.error('Failed to revoke share link');
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

  const handlePaymentStatusChange = async (doc: any, paymentStatus: string) => {
    setUpdatingPayment(doc._id);
    setDocuments(prev => prev.map(d => d._id === doc._id ? { ...d, paymentStatus } : d));
    try {
      await api.patch(`/documents/${doc._id}/payment-status`, { paymentStatus });
    } catch {
      setDocuments(prev => prev.map(d => d._id === doc._id ? { ...d, paymentStatus: doc.paymentStatus } : d));
      toast.error('Failed to update payment status');
    } finally {
      setUpdatingPayment(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const allOnPageSelected = documents.length > 0 && documents.every(d => selected.has(d._id));
  const someSelected = selected.size > 0;

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelected(prev => {
        const s = new Set(prev);
        documents.forEach(d => s.delete(d._id));
        return s;
      });
    } else {
      setSelected(prev => {
        const s = new Set(prev);
        documents.forEach(d => s.add(d._id));
        return s;
      });
    }
  };

  const exportCSV = () => {
    const headers = ['Title', 'Client', 'Type', 'Status', 'Date'];
    const rows = documents.map(d => [
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

  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = (currentPage - 1) * PAGE_SIZE + documents.length;

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
          <p className="text-xs text-gray-400 mt-0.5">
            {totalCount !== null ? `${totalCount} total documents` : `${documents.length} documents on this page`}
          </p>
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

      {documents.length === 0 && !pageLoading ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <div className="p-4 bg-gray-50 rounded-xl inline-block mb-3">
            <FileText size={32} className="text-gray-200" />
          </div>
          <p className="text-gray-400 text-sm">No documents yet.</p>
          <Link
            to="/dashboard/documents/create"
            style={{ backgroundColor: BRAND }}
            className="mt-4 inline-block px-5 py-2 text-white rounded-lg text-sm font-semibold shadow"
          >
            Create First Document
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden relative">
            {pageLoading && (
              <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                  <Loader2 size={16} className="animate-spin" style={{ color: BRAND }} />
                  Loading...
                </div>
              </div>
            )}
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
                {documents.map(doc => {
                  const typeColor = TYPE_COLORS[doc.type] || BRAND;
                  const docStatus: Status = doc.status || 'draft';
                  const statusStyle = STATUS_COLORS[docStatus] || STATUS_COLORS.draft;
                  const isDuplicating = duplicating === doc._id;
                  const isDeleting = deleting === doc._id;
                  const isSelected = selected.has(doc._id);
                  const isInvoiceType = INVOICE_TYPES.includes(doc.type);
                  const paymentStatus = doc.paymentStatus;
                  const paymentBadge = paymentStatus && PAYMENT_STATUS_COLORS[paymentStatus];
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold capitalize"
                            style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                          >
                            {docStatus}
                          </span>
                          {isInvoiceType && paymentBadge && (
                            <span
                              className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold capitalize"
                              style={{ backgroundColor: paymentBadge.bg, color: paymentBadge.text }}
                            >
                              {paymentStatus}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {new Date(doc._creationTime || doc.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {isInvoiceType && (
                            <select
                              value={paymentStatus || ''}
                              onChange={e => handlePaymentStatusChange(doc, e.target.value)}
                              disabled={updatingPayment === doc._id}
                              title="Set payment status"
                              className="text-xs border border-gray-200 rounded-md px-1.5 py-1 bg-white text-gray-600 outline-none focus:border-[#714B67] cursor-pointer disabled:opacity-50 transition-colors"
                              style={{ fontSize: '11px' }}
                            >
                              <option value="">Payment</option>
                              <option value="unpaid">Unpaid</option>
                              <option value="paid">Paid</option>
                              <option value="overdue">Overdue</option>
                            </select>
                          )}
                          <Link
                            to={`/dashboard/documents/${doc._id}`}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                            title="Edit document"
                          >
                            <Edit3 size={14} />
                          </Link>
                          <div className="relative">
                            <button
                              onClick={() => sharePopover?.docId === doc._id ? setSharePopover(null) : openSharePopover(doc)}
                              disabled={sharing === doc._id || isDeleting}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-40"
                              title="Share document"
                            >
                              {sharing === doc._id
                                ? <Loader2 size={14} className="animate-spin" />
                                : shareCopied === doc._id
                                ? <Check size={14} className="text-green-500" />
                                : <Share2 size={14} />}
                            </button>
                            {sharePopover?.docId === doc._id && (
                              <div
                                ref={sharePopoverRef}
                                className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-30 p-4 space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-gray-700">Share Options</p>
                                  <button onClick={() => setSharePopover(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={13} />
                                  </button>
                                </div>
                                {doc.shareToken ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-green-50 rounded-lg">
                                      <Check size={12} className="text-green-600" />
                                      <span className="text-xs font-semibold text-green-700">Link active</span>
                                    </div>
                                    <button
                                      onClick={() => handleRevokeShare(doc)}
                                      disabled={sharing === doc._id}
                                      className="w-full px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                      Revoke Link
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="space-y-1.5">
                                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Expiry</p>
                                      <div className="flex flex-wrap gap-1">
                                        {[
                                          { label: 'No expiry', value: null },
                                          { label: '7 days', value: 7 },
                                          { label: '30 days', value: 30 },
                                        ].map(opt => (
                                          <button
                                            key={String(opt.value)}
                                            onClick={() => setSharePopover(p => p ? { ...p, expiresInDays: opt.value, mode: 'preset', customDate: '' } : p)}
                                            className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-all ${sharePopover?.expiresInDays === opt.value && sharePopover?.mode === 'preset' ? 'text-white border-transparent' : 'border-gray-200 text-gray-600'}`}
                                            style={sharePopover?.expiresInDays === opt.value && sharePopover?.mode === 'preset' ? { backgroundColor: BRAND } : {}}
                                          >
                                            {opt.label}
                                          </button>
                                        ))}
                                        <button
                                          onClick={() => setSharePopover(p => p ? { ...p, mode: 'custom', expiresInDays: null } : p)}
                                          className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-all ${sharePopover?.mode === 'custom' ? 'text-white border-transparent' : 'border-gray-200 text-gray-600'}`}
                                          style={sharePopover?.mode === 'custom' ? { backgroundColor: BRAND } : {}}
                                        >
                                          Custom
                                        </button>
                                      </div>
                                      {sharePopover?.mode === 'custom' && (
                                        <input
                                          type="date"
                                          value={sharePopover?.customDate}
                                          onChange={e => setSharePopover(p => p ? { ...p, customDate: e.target.value } : p)}
                                          className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#714B67] transition-colors"
                                        />
                                      )}
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Send to email (optional)</p>
                                      <input
                                        type="email"
                                        placeholder="recipient@email.com"
                                        value={sharePopover?.recipientEmail}
                                        onChange={e => setSharePopover(p => p ? { ...p, recipientEmail: e.target.value } : p)}
                                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#714B67] transition-colors"
                                      />
                                    </div>
                                    <button
                                      onClick={() => handleShareSubmit(doc)}
                                      disabled={sharing === doc._id}
                                      style={{ backgroundColor: BRAND }}
                                      className="w-full py-1.5 text-xs font-bold text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                                    >
                                      {sharing === doc._id ? <Loader2 size={11} className="animate-spin" /> : <Share2 size={11} />}
                                      Copy Link
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
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
              {totalCount !== null
                ? `Showing ${startIndex}–${endIndex} of ${totalCount} documents`
                : `Showing ${startIndex}–${endIndex}`}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1 || pageLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={13} />
                Previous
              </button>
              <span
                className="min-w-[70px] text-center text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                style={{ backgroundColor: BRAND }}
              >
                Page {currentPage}
              </span>
              <button
                onClick={handleNextPage}
                disabled={isDone || pageLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 transition-colors"
              >
                Next
                <ChevronRight size={13} />
              </button>
            </div>
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
