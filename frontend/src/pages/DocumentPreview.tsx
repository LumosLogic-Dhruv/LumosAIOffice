import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Document as PdfDocument, Page as PdfPage, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  Download,
  History,
  Sparkles,
  Loader2,
  FileText,
  Eye,
  ArrowLeft,
  Edit3,
  Save,
  X,
  Share2,
  Copy,
  Check,
  Lock,
  Users,
  RefreshCw,
  PenLine,
  CheckCircle2,
  ChevronDown,
  Clock,
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Form16Renderer, GSTInvoiceRenderer, SalarySlipRenderer } from '../components/SpecialDocumentRenderer';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  draft:    { label: 'Draft',    color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db' },
  sent:     { label: 'Sent',     color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  viewed:   { label: 'Viewed',   color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  accepted: { label: 'Accepted', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  rejected: { label: 'Rejected', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

type AiTone = 'professional' | 'friendly' | 'formal' | 'concise';

const AI_TONES: { value: AiTone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'concise', label: 'Concise' },
];

const DocumentPreview = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [document, setDocument] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiTone, setAiTone] = useState<AiTone>('professional');
  const [editingAI, setEditingAI] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);

  const [tempDoc, setTempDoc] = useState<any>(null);
  const [sharing, setSharing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [shareExpiresInDays, setShareExpiresInDays] = useState<number | null>(null);
  const [shareCustomDate, setShareCustomDate] = useState('');
  const [shareExpireMode, setShareExpireMode] = useState<'preset' | 'custom'>('preset');
  const [shareRecipientEmail, setShareRecipientEmail] = useState('');
  const sharePopoverRef = useRef<HTMLDivElement>(null);

  const [showPdfModal, setShowPdfModal] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfWidth, setPdfWidth] = useState<number>(800);
  const [updatingPerm, setUpdatingPerm] = useState(false);
  const [togglingESign, setTogglingESign] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [docStatus, setDocStatus] = useState<string>('draft');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.role === 'admin';
  const isViewer = user?.role === 'viewer';

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!isManualEdit || !document || !tempDoc) return;
    const changed = JSON.stringify(tempDoc) !== JSON.stringify(document);
    setHasUnsavedChanges(changed);

    if (!changed) {
      setAutoSaveStatus('idle');
      return;
    }

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      runAutoSave();
    }, 3000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [tempDoc, isManualEdit]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (sharePopoverRef.current && !sharePopoverRef.current.contains(e.target as Node)) {
        setShowSharePopover(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const runAutoSave = async () => {
    setAutoSaveStatus('saving');
    try {
      const response = await api.put(`/documents/${id}`, {
        title: tempDoc.title,
        clientName: tempDoc.clientName,
        data: tempDoc.data,
      });
      setDocument(response.data);
      setHasUnsavedChanges(false);
      setAutoSaveStatus('saved');
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setAutoSaveStatus('idle'), 2500);
    } catch {
      setAutoSaveStatus('idle');
    }
  };

  const fetchData = async () => {
    try {
      const [docRes, compResponse] = await Promise.all([
        api.get(`/documents/${id}`),
        api.get('/company'),
      ]);
      setDocument(docRes.data);
      setTempDoc(JSON.parse(JSON.stringify(docRes.data)));
      setDocStatus(docRes.data.status || 'draft');
      setCompany(compResponse.data);
    } catch (error) {
      toast.error('Failed to load document data');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    setGeneratingPdf(true);
    try {
      const response = await api.post(`/documents/${id}/generate-pdf`);
      setDocument({ ...document, pdfUrl: response.data.pdfUrl });
      toast.success('PDF Generated successfully!');
    } catch (error) {
      toast.error('PDF Generation failed');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleAiEdit = async () => {
    if (!aiInstruction) return toast.error('Please enter instructions');
    setEditingAI(true);
    try {
      const response = await api.post(`/documents/${id}/edit-ai`, { instruction: aiInstruction, tone: aiTone });
      setDocument(response.data);
      setTempDoc(JSON.parse(JSON.stringify(response.data)));
      setAiInstruction('');
      toast.success('Document updated by AI!');
    } catch (error) {
      toast.error('AI Editing failed');
    } finally {
      setEditingAI(false);
    }
  };

  const handleShareSubmit = async () => {
    setSharing(true);
    try {
      let expiresInDays: number | undefined;
      if (shareExpireMode === 'custom' && shareCustomDate) {
        const diff = Math.ceil((new Date(shareCustomDate).getTime() - Date.now()) / 86400000);
        expiresInDays = diff > 0 ? diff : undefined;
      } else if (shareExpiresInDays !== null) {
        expiresInDays = shareExpiresInDays;
      }
      const body: any = {};
      if (expiresInDays !== undefined) body.expiresInDays = expiresInDays;
      if (shareRecipientEmail) body.recipientEmail = shareRecipientEmail;
      const res = await api.post(`/documents/${id}/share`, body);
      const token = res.data.shareToken;
      const shareUrl = `${window.location.origin}/shared/${token}`;
      await navigator.clipboard.writeText(shareUrl);
      setDocument((prev: any) => ({ ...prev, shareToken: token }));
      setShareCopied(true);
      setShowSharePopover(false);
      setTimeout(() => setShareCopied(false), 3000);
      toast.success('Share link copied to clipboard!');
    } catch {
      toast.error('Failed to create share link');
    } finally {
      setSharing(false);
    }
  };

  const handleRevokeShare = async () => {
    setSharing(true);
    try {
      await api.delete(`/documents/${id}/share`);
      setDocument((prev: any) => ({ ...prev, shareToken: null }));
      setShowSharePopover(false);
      toast.success('Share link revoked');
    } catch {
      toast.error('Failed to revoke share link');
    } finally {
      setSharing(false);
    }
  };

  const handleManualSave = async () => {
    setIsSavingManual(true);
    try {
      const response = await api.put(`/documents/${id}`, {
        title: tempDoc.title,
        clientName: tempDoc.clientName,
        data: tempDoc.data,
      });
      setDocument(response.data);
      setHasUnsavedChanges(false);
      setAutoSaveStatus('idle');
      setIsManualEdit(false);
      toast.success('Document saved and PDF updated!');
    } catch (error) {
      toast.error('Failed to save document');
    } finally {
      setIsSavingManual(false);
    }
  };

  const handleESignToggle = async () => {
    const current = !!(document?.data?.eSignRequest);
    setTogglingESign(true);
    try {
      const res = await api.put(`/documents/${id}`, {
        data: { ...document.data, eSignRequest: !current },
      });
      setDocument(res.data);
      setTempDoc(JSON.parse(JSON.stringify(res.data)));
      toast.success(!current ? 'E-signature request enabled' : 'E-signature request disabled');
    } catch {
      toast.error('Failed to update e-signature setting');
    } finally {
      setTogglingESign(false);
    }
  };

  const handlePermissionToggle = async (newPerm: 'all' | 'owner_only') => {
    setUpdatingPerm(true);
    try {
      const res = await api.put(`/documents/${id}`, {
        data: { ...document.data, editPermission: newPerm },
      });
      setDocument(res.data);
      setTempDoc(JSON.parse(JSON.stringify(res.data)));
      toast.success(newPerm === 'owner_only' ? 'Edit locked to owner only' : 'Edit access opened to all members');
    } catch {
      toast.error('Failed to update permissions');
    } finally {
      setUpdatingPerm(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    setShowStatusDropdown(false);
    try {
      const res = await api.patch(`/documents/${id}/status`, { status: newStatus });
      setDocument(res.data);
      setDocStatus(newStatus);
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleExpiryDateChange = (dateStr: string) => {
    const timestamp = dateStr ? new Date(dateStr).getTime() : null;
    const newDoc = { ...tempDoc, data: { ...tempDoc.data, expiryDate: timestamp } };
    setTempDoc(newDoc);
  };

  const brandColor = company?.colorTheme?.primary1 || '#714B67';

  const expiryTimestamp = tempDoc?.data?.expiryDate;
  const expiryDateObj = expiryTimestamp ? new Date(expiryTimestamp) : null;
  const isExpired = expiryDateObj ? expiryDateObj < new Date() : false;

  const currentStatusCfg = STATUS_CONFIG[docStatus] || STATUS_CONFIG.draft;

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#714B67' }}></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <Link to="/dashboard" className="flex items-center font-black text-gray-500 hover:text-primary transition-all uppercase text-sm tracking-widest group">
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Link
            to={`/dashboard/documents/${id}/history`}
            className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all text-gray-600"
          >
            <History size={18} />
            <span>History</span>
          </Link>

          {!isViewer && !isManualEdit ? (
            <button
              onClick={() => setIsManualEdit(true)}
              className="flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all"
              style={{ borderColor: brandColor, color: brandColor }}
            >
              <Edit3 size={18} />
              <span>Manual Edit</span>
            </button>
          ) : !isViewer && isManualEdit ? (
            <div className="flex items-center gap-2">
              {autoSaveStatus === 'saving' && (
                <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" />
                  Auto-saving...
                </span>
              )}
              {autoSaveStatus === 'saved' && (
                <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                  <Check size={12} />
                  Saved
                </span>
              )}
              {hasUnsavedChanges && autoSaveStatus === 'idle' && (
                <span className="text-xs font-black px-2 py-1 rounded-lg bg-amber-100 text-amber-600 border border-amber-200">
                  Unsaved changes
                </span>
              )}
              <button
                onClick={handleManualSave}
                disabled={isSavingManual}
                style={{ backgroundColor: brandColor }}
                className="flex items-center space-x-2 px-6 py-3 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
              >
                {isSavingManual ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                <span>{isSavingManual ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={() => {
                  setIsManualEdit(false);
                  setTempDoc(JSON.parse(JSON.stringify(document)));
                  setHasUnsavedChanges(false);
                  setAutoSaveStatus('idle');
                }}
                className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-200 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          ) : null}

          <div className="relative" ref={sharePopoverRef}>
            <button
              onClick={() => setShowSharePopover(v => !v)}
              disabled={sharing}
              className="flex items-center space-x-2 px-4 py-3 border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all text-gray-600"
            >
              {shareCopied ? <Check size={16} className="text-green-500" /> : sharing ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
              <span>{shareCopied ? 'Copied!' : 'Share'}</span>
            </button>
            {showSharePopover && (
              <div className="absolute right-0 top-full mt-2 w-68 bg-white rounded-2xl shadow-2xl border border-gray-100 z-30 p-5 space-y-4" style={{ minWidth: '260px' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-gray-700 uppercase tracking-wider">Share Options</p>
                  <button onClick={() => setShowSharePopover(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                </div>
                {document?.shareToken ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl">
                      <Check size={13} className="text-green-600" />
                      <span className="text-xs font-bold text-green-700">Link is active</span>
                    </div>
                    <button
                      onClick={handleRevokeShare}
                      disabled={sharing}
                      className="w-full px-3 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      Revoke Link
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Expiry</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: 'No expiry', value: null },
                          { label: '7 days', value: 7 },
                          { label: '30 days', value: 30 },
                        ].map(opt => (
                          <button
                            key={String(opt.value)}
                            onClick={() => { setShareExpiresInDays(opt.value); setShareExpireMode('preset'); setShareCustomDate(''); }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${shareExpiresInDays === opt.value && shareExpireMode === 'preset' ? 'text-white border-transparent' : 'border-gray-200 text-gray-600'}`}
                            style={shareExpiresInDays === opt.value && shareExpireMode === 'preset' ? { backgroundColor: brandColor } : {}}
                          >
                            {opt.label}
                          </button>
                        ))}
                        <button
                          onClick={() => { setShareExpireMode('custom'); setShareExpiresInDays(null); }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${shareExpireMode === 'custom' ? 'text-white border-transparent' : 'border-gray-200 text-gray-600'}`}
                          style={shareExpireMode === 'custom' ? { backgroundColor: brandColor } : {}}
                        >
                          Custom
                        </button>
                      </div>
                      {shareExpireMode === 'custom' && (
                        <input
                          type="date"
                          value={shareCustomDate}
                          onChange={e => setShareCustomDate(e.target.value)}
                          className="w-full text-xs border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:border-[#714B67] transition-colors"
                        />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Send to email (optional)</p>
                      <input
                        type="email"
                        placeholder="recipient@email.com"
                        value={shareRecipientEmail}
                        onChange={e => setShareRecipientEmail(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:border-[#714B67] transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleShareSubmit}
                      disabled={sharing}
                      style={{ backgroundColor: brandColor }}
                      className="w-full py-2 text-xs font-black text-white rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wider"
                    >
                      {sharing ? <Loader2 size={13} className="animate-spin" /> : <Share2 size={13} />}
                      Copy Link
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleGeneratePdf}
            disabled={generatingPdf}
            style={{ backgroundColor: brandColor }}
            className="flex items-center space-x-2 px-6 py-3 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
          >
            {generatingPdf ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            <span>Update PDF</span>
          </button>

          {document.pdfUrl && (
            <>
              <a
                href={document.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center space-x-2 px-6 py-3 border-2 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all"
                style={{ borderColor: brandColor, color: brandColor }}
              >
                <Download size={18} />
                <span>Download</span>
              </a>
              <button
                onClick={() => setShowPdfModal(true)}
                className="flex items-center space-x-2 px-6 py-3 border-2 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all"
                style={{ borderColor: brandColor, color: brandColor }}
              >
                <Eye size={18} />
                <span>View PDF</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile sidebar toggle */}
      <div className="lg:hidden flex justify-end mb-2">
        <button
          onClick={() => setShowMobileSidebar((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black border-2 transition-all"
          style={{ borderColor: brandColor, color: brandColor }}
        >
          <Sparkles size={14} />
          {showMobileSidebar ? 'Hide Tools' : 'Show Tools'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-10">
        <div className="lg:col-span-3">
          {/* Special document types get their own renderer */}
          {document?.type === 'form_16' ? (
            <div className="bg-white shadow-2xl border border-gray-100 overflow-auto">
              <Form16Renderer data={tempDoc?.data} company={company} document={tempDoc} />
            </div>
          ) : document?.type === 'gst_invoice' ? (
            <div className="bg-white shadow-2xl border border-gray-100 overflow-auto">
              <GSTInvoiceRenderer data={tempDoc?.data} company={company} document={tempDoc} />
            </div>
          ) : document?.type === 'salary_slip' ? (
            <div className="bg-white shadow-2xl border border-gray-100 overflow-auto">
              <SalarySlipRenderer data={tempDoc?.data} company={company} document={tempDoc} />
            </div>
          ) : (
          <div className="bg-white shadow-2xl border border-gray-100 min-h-[1000px] relative overflow-hidden">
            <div className="flex justify-between items-start p-10 mb-12" style={{ backgroundColor: brandColor }}>
               <div>
                  {company?.logoUrl ? (
                    <img src={company.logoUrl} alt="Logo" className="h-20 object-contain mb-4 bg-white/10 p-2 rounded-xl" />
                  ) : (
                    <h2 className="text-3xl font-black text-white mb-2">{company?.name}</h2>
                  )}
                  <div className="text-sm text-white/70 font-bold uppercase tracking-widest">
                    {tempDoc.type.replace(/_/g, ' ')}
                  </div>
               </div>
               <div className="text-right space-y-1 text-white">
                  <h3 className="text-xl font-black">{company?.name}</h3>
                  <p className="text-white/80 text-sm font-medium">{company?.address}</p>
                  <p className="text-white/80 text-sm font-medium">{company?.phone}</p>
                  <p className="text-white/80 text-sm font-medium">{company?.email}</p>
               </div>
            </div>

            <div className="px-4 sm:px-8 md:px-16 space-y-8 md:space-y-12">
               <div className="flex justify-between items-end">
                  <div className="flex-1 mr-8">
                    {isManualEdit ? (
                      <input
                        className="text-5xl font-black text-gray-900 tracking-tighter mb-2 bg-gray-50 p-2 rounded-xl border-2 border-dashed border-gray-200 outline-none w-full"
                        value={tempDoc.title}
                        onChange={(e) => setTempDoc({ ...tempDoc, title: e.target.value })}
                      />
                    ) : (
                      <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter mb-2">{tempDoc.title}</h1>
                    )}

                    <div className="flex items-center gap-2">
                       <p className="text-gray-400 font-bold uppercase tracking-widest text-sm whitespace-nowrap">Client:</p>
                       {isManualEdit ? (
                         <input
                           className="font-black text-gray-900 bg-gray-50 px-2 py-1 rounded-lg border-2 border-dashed border-gray-200 outline-none w-full"
                           value={tempDoc.clientName}
                           onChange={(e) => setTempDoc({ ...tempDoc, clientName: e.target.value })}
                         />
                       ) : (
                         <span className="text-gray-900 font-black text-sm uppercase tracking-widest">{tempDoc.clientName}</span>
                       )}
                    </div>
                  </div>
                  <div className="text-right space-y-3">
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Date Issued</p>
                      {isManualEdit ? (
                        <input
                          type="date"
                          className="text-lg font-black text-gray-900 bg-gray-50 p-1 rounded border-2 border-dashed border-gray-200 outline-none"
                          value={new Date(tempDoc._creationTime ?? Date.now()).toISOString().split('T')[0]}
                          onChange={(e) => setTempDoc({ ...tempDoc, _creationTime: new Date(e.target.value).getTime() })}
                        />
                      ) : (
                        <p className="text-lg font-black text-gray-900">{new Date(tempDoc._creationTime ?? Date.now()).toLocaleDateString()}</p>
                      )}
                    </div>
                    {isManualEdit ? (
                      <div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Expiry Date</p>
                        <input
                          type="date"
                          className="text-sm font-black text-gray-900 bg-gray-50 p-1 rounded border-2 border-dashed border-gray-200 outline-none"
                          value={expiryDateObj ? expiryDateObj.toISOString().split('T')[0] : ''}
                          onChange={(e) => handleExpiryDateChange(e.target.value)}
                        />
                      </div>
                    ) : expiryDateObj ? (
                      <div>
                        <p className={`font-bold uppercase tracking-widest text-xs ${isExpired ? 'text-red-400' : 'text-gray-400'}`}>
                          {isExpired ? 'Expired' : 'Expires'}
                        </p>
                        <p className={`text-sm font-black ${isExpired ? 'text-red-500' : 'text-gray-900'}`}>
                          {expiryDateObj.toLocaleDateString()}
                        </p>
                      </div>
                    ) : null}
                  </div>
               </div>

               {tempDoc.data.sections?.map((section: any, idx: number) => (
                 <div key={idx} className="group relative">
                   {isManualEdit ? (
                     <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200">
                        <input
                          className="w-full bg-transparent font-black text-2xl outline-none"
                          style={{ color: brandColor }}
                          value={section.heading}
                          onChange={(e) => {
                            const newDoc = { ...tempDoc };
                            newDoc.data.sections[idx].heading = e.target.value;
                            setTempDoc(newDoc);
                          }}
                        />
                        <textarea
                          className="w-full bg-transparent text-gray-700 text-lg outline-none min-h-[100px] resize-none"
                          value={section.content}
                          onChange={(e) => {
                            const newDoc = { ...tempDoc };
                            newDoc.data.sections[idx].content = e.target.value;
                            setTempDoc(newDoc);
                          }}
                        />
                     </div>
                   ) : (
                     <div className="space-y-4">
                       <h3 className="text-2xl font-black text-gray-900 border-l-4 pl-4" style={{ borderColor: brandColor }}>{section.heading}</h3>
                       <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">{section.content}</p>
                     </div>
                   )}
                 </div>
               ))}

               {tempDoc.data.tables?.map((table: any, idx: number) => (
                 <div key={idx} className="space-y-4">
                   <h3 className="text-xl sm:text-2xl font-black text-gray-900">{table.title}</h3>
                   <div className="overflow-x-auto overflow-hidden rounded-3xl border-2 border-gray-100">
                     <table className="w-full text-left border-collapse">
                       <thead>
                         <tr style={{ backgroundColor: brandColor }}>
                           {(Array.isArray(table.headers) ? table.headers : Object.values(table.headers || {})).map((h: any, i: number) => (
                             <th key={i} className="p-3 sm:p-5 text-white font-black uppercase text-xs tracking-widest whitespace-nowrap">{h}</th>
                           ))}
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                         {(Array.isArray(table.rows) ? table.rows : []).map((row: any, i: number) => (
                           <tr key={i} className="hover:bg-gray-50/50">
                             {(Array.isArray(row) ? row : Object.values(row || {})).map((cell: any, j: number) => (
                               <td key={j} className="p-3 sm:p-5">
                                 {isManualEdit ? (
                                   <input
                                     className="w-full bg-transparent font-bold text-gray-700 outline-none"
                                     value={cell}
                                     onChange={(e) => {
                                       const newDoc = { ...tempDoc };
                                       newDoc.data.tables[idx].rows[i][j] = e.target.value;
                                       setTempDoc(newDoc);
                                     }}
                                   />
                                 ) : (
                                   <span className="font-bold text-gray-700">{cell}</span>
                                 )}
                               </td>
                             ))}
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </div>
               ))}

               {document?.eSignature && (
                 <div className="rounded-xl border-2 border-green-100 bg-green-50/40 p-5 space-y-3">
                   <div className="flex items-center gap-2">
                     <CheckCircle2 size={15} className="text-green-600" />
                     <span className="text-xs font-black text-green-700 uppercase tracking-wider">Digitally Signed</span>
                   </div>
                   <img
                     src={document.eSignature.signatureImage}
                     alt="Signature"
                     className="max-h-20 max-w-52 object-contain border-b border-gray-200 pb-2"
                   />
                   <div className="text-sm text-gray-600 space-y-1">
                     <p><span className="font-bold text-gray-800">Name:</span> {document.eSignature.signerName}</p>
                     <p><span className="font-bold text-gray-800">Contact:</span> {document.eSignature.signerContact}</p>
                     <p><span className="font-bold text-gray-800">Signed on:</span> {new Date(document.eSignature.signedAt).toLocaleString()}</p>
                   </div>
                 </div>
               )}

               {tempDoc.data.summary && typeof tempDoc.data.summary === 'object' && Object.keys(tempDoc.data.summary).length > 0 && (
                 <div className="flex justify-end pt-10">
                   <div className="w-80 space-y-4 p-8 rounded-4xl bg-gray-50/50 border border-gray-100">
                     {Object.entries(tempDoc.data.summary).map(([k, v]: [string, any]) => (
                       <div key={k} className="flex justify-between items-center group">
                         <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">{k}</span>
                         {isManualEdit ? (
                           <input
                             className="text-right font-black text-gray-900 bg-transparent outline-none w-1/2 border-b-2 border-dashed border-gray-200"
                             value={v}
                             onChange={(e) => {
                               const newDoc = { ...tempDoc };
                               newDoc.data.summary[k] = e.target.value;
                               setTempDoc(newDoc);
                             }}
                           />
                         ) : (
                           <span className="font-black text-xl text-gray-900">{v}</span>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               )}
            </div>

            <div className="mt-16 sm:mt-32 pt-10 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8 px-4 sm:px-8 md:px-16 pb-8 sm:pb-16">
               <div className="space-y-4">
                  <div className="space-y-1">
                     <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Authorized Signatory</p>
                     <p className="text-xl font-black text-gray-900">{company?.name}</p>
                  </div>
                  <div className="h-24 w-48 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200">
                     <p className="text-gray-300 font-bold text-xs uppercase tracking-widest">Stamp / Sign</p>
                  </div>
               </div>
               <div className="text-right max-w-sm">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Terms & Conditions</p>
                  {isManualEdit ? (
                    <textarea
                       className="w-full bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-200 outline-none text-xs text-gray-500 font-bold h-24 resize-none"
                       value={tempDoc.data.terms || company?.defaultTerms}
                       onChange={(e) => {
                         const newDoc = { ...tempDoc };
                         newDoc.data.terms = e.target.value;
                         setTempDoc(newDoc);
                       }}
                    />
                  ) : (
                    <p className="text-xs text-gray-400 leading-relaxed font-bold">
                      {tempDoc.data.terms || company?.defaultTerms || 'All payments are non-refundable. Validity of this document is 30 days from the date of issue.'}
                    </p>
                  )}
               </div>
            </div>
          </div>
          )}
        </div>

        <div className={`lg:col-span-1 space-y-8 ${showMobileSidebar ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-6 rounded-[40px] shadow-xl border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-xl">
                <Clock size={18} className="text-gray-500" />
              </div>
              <h3 className="text-sm font-black text-gray-900">Document Status</h3>
            </div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider mb-4 border"
              style={{ color: currentStatusCfg.color, backgroundColor: currentStatusCfg.bg, borderColor: currentStatusCfg.border }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentStatusCfg.color }} />
              {currentStatusCfg.label}
            </div>
            {isOwner && (
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  disabled={updatingStatus}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border-2 border-gray-100 hover:bg-gray-50 transition-all text-gray-600"
                >
                  {updatingStatus ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 size={12} className="animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    <span>Change Status</span>
                  )}
                  <ChevronDown size={13} />
                </button>
                {showStatusDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => handleStatusChange(key)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold hover:bg-gray-50 transition-all text-left"
                        style={{ color: cfg.color }}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {isViewer ? (
            <div className="bg-gray-50 border border-gray-100 rounded-[40px] p-6 text-center space-y-2">
              <Eye size={20} className="text-gray-300 mx-auto" />
              <p className="text-xs font-semibold text-gray-400">View-only access. Contact the owner to request edit permissions.</p>
            </div>
          ) : (
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100">
            <div className="flex items-center space-x-3 text-primary mb-6">
              <div className="p-2 bg-primary/10 rounded-xl">
                 <Sparkles size={24} style={{ color: brandColor }} />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">AI Smart Editor</h3>
            </div>
            <p className="text-sm text-gray-500 font-bold leading-relaxed mb-5">
              Refine your document using AI. Describe changes like "Add 18% GST" or "Make the overview more formal".
            </p>
            <div className="mb-5">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Tone</p>
              <div className="grid grid-cols-2 gap-1.5">
                {AI_TONES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setAiTone(t.value)}
                    className="px-2 py-1.5 rounded-xl text-xs font-bold transition-all border-2"
                    style={aiTone === t.value
                      ? { backgroundColor: brandColor, color: '#fff', borderColor: brandColor }
                      : { backgroundColor: 'transparent', color: '#6b7280', borderColor: '#e5e7eb' }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="w-full p-6 border-2 border-gray-100 rounded-3xl h-40 focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none resize-none mb-6 font-medium text-gray-700 bg-gray-50/50"
              placeholder="Tell AI what to change..."
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
            />
            <button
              onClick={handleAiEdit}
              disabled={editingAI || isManualEdit}
              style={{ backgroundColor: brandColor }}
              className="w-full text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center space-x-3 hover:opacity-90 transition-all disabled:opacity-30 shadow-xl shadow-primary/20"
            >
              {editingAI ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={18} />}
              <span>APPLY AI UPDATES</span>
            </button>
            {isManualEdit && (
              <p className="text-[10px] text-red-500 font-black uppercase text-center mt-4 tracking-widest">
                Save manual changes first
              </p>
            )}
          </div>
          )}

          {isOwner && (
            <div className="bg-white p-6 rounded-[40px] shadow-xl border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <Lock size={18} className="text-gray-500" />
                </div>
                <h3 className="text-sm font-black text-gray-900">Edit Access</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">Control who can edit this document.</p>
              <div className="flex flex-col gap-2">
                {(['all', 'owner_only'] as const).map((perm) => {
                  const active = (document?.data?.editPermission || 'all') === perm;
                  return (
                    <button
                      key={perm}
                      onClick={() => handlePermissionToggle(perm)}
                      disabled={updatingPerm || active}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                      style={active
                        ? { backgroundColor: brandColor, color: '#fff' }
                        : { border: '2px solid #e5e7eb', color: '#6b7280' }}
                    >
                      {perm === 'all' ? <Users size={13} /> : <Lock size={13} />}
                      {perm === 'all' ? 'All Members Can Edit' : 'Owner Only'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isOwner && (
            <div className="bg-white p-6 rounded-[40px] shadow-xl border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <PenLine size={18} className="text-gray-500" />
                </div>
                <h3 className="text-sm font-black text-gray-900">E-Signature</h3>
              </div>

              {document?.eSignature ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-green-600">
                    <CheckCircle2 size={14} />
                    <span className="text-xs font-black uppercase tracking-wider">Signed</span>
                  </div>
                  <img
                    src={document.eSignature.signatureImage}
                    alt="Signature"
                    className="max-h-14 max-w-full object-contain rounded border border-gray-100 bg-gray-50 p-1"
                  />
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p className="font-bold text-gray-700">{document.eSignature.signerName}</p>
                    <p>{document.eSignature.signerContact}</p>
                    <p className="text-gray-400">{new Date(document.eSignature.signedAt).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {document?.data?.eSignRequest
                      ? 'Signature requested. Share the link so the recipient can sign.'
                      : 'Enable to request the recipient to e-sign this document via the share link.'}
                  </p>
                  <button
                    onClick={handleESignToggle}
                    disabled={togglingESign}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={document?.data?.eSignRequest
                      ? { backgroundColor: brandColor, color: '#fff' }
                      : { border: `2px solid ${brandColor}`, color: brandColor }}
                  >
                    {togglingESign ? <Loader2 size={13} className="animate-spin" /> : <PenLine size={13} />}
                    {document?.data?.eSignRequest ? 'Disable E-Sign Request' : 'Request E-Signature'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showPdfModal && document.pdfUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gray-900 shrink-0 flex-wrap gap-2">
            <p className="text-white font-bold text-sm truncate max-w-xs sm:max-w-md">{document.title}</p>
            <div className="flex items-center gap-3 sm:gap-4">
              {numPages > 1 && (
                <div className="flex items-center gap-1.5 text-white/60 text-xs font-semibold">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-2 py-1 rounded hover:bg-white/10 disabled:opacity-40 transition-colors"
                  >
                    ‹
                  </button>
                  <span>{currentPage} / {numPages}</span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                    disabled={currentPage >= numPages}
                    className="px-2 py-1 rounded hover:bg-white/10 disabled:opacity-40 transition-colors"
                  >
                    ›
                  </button>
                </div>
              )}
              <a
                href={document.pdfUrl}
                download
                className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-semibold transition-colors"
              >
                <Download size={14} />
                Download
              </a>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-white/60 hover:text-white font-bold text-sm transition-colors flex items-center gap-1.5"
              >
                <X size={16} /> Close
              </button>
            </div>
          </div>
          <div
            className="flex-1 overflow-auto flex items-start justify-center py-4 px-2"
            ref={(el) => { if (el) setPdfWidth(Math.min(el.clientWidth - 24, 960)); }}
          >
            <PdfDocument
              file={document.pdfUrl}
              onLoadSuccess={({ numPages: n }) => { setNumPages(n); setCurrentPage(1); }}
              loading={<p className="text-white/50 text-sm mt-16">Loading PDF...</p>}
              error={
                <div className="text-center mt-16 space-y-3">
                  <p className="text-white/60 text-sm">Could not render PDF inline.</p>
                  <a href={document.pdfUrl} download className="text-white underline text-sm font-semibold">
                    Download instead
                  </a>
                </div>
              }
            >
              <PdfPage
                pageNumber={currentPage}
                width={pdfWidth}
                renderTextLayer
                renderAnnotationLayer
              />
            </PdfDocument>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentPreview;
