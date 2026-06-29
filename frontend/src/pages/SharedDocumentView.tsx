import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Download, Loader2, AlertCircle, X, FileText, PenLine, Trash2, CheckCircle2 } from 'lucide-react';

const BRAND = '#714B67';

const SharedDocumentView = () => {
  const { token } = useParams();
  const [doc, setDoc] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false);

  // E-signature state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [hasSigned, setHasSigned] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signerContact, setSignerContact] = useState('');
  const [signing, setSigning] = useState(false);

  const brandColor = company?.colorTheme?.primary1 || BRAND;

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/documents/shared/${token}`);
        setDoc(res.data.document);
        setCompany(res.data.company);
      } catch {
        setError('This document was not found or the share link has expired.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // ── Canvas drawing helpers ──────────────────────────────────────────────
  const getCanvasPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getCanvasPos(e.nativeEvent as any, canvas);
    setHasSigned(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !lastPos.current) return;
    e.preventDefault();
    const pos = getCanvasPos(e.nativeEvent as any, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => {
    isDrawing.current = false;
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSign = async () => {
    const canvas = canvasRef.current;
    if (!hasSigned || !canvas) return toast.error('Please draw your signature first');
    if (!signerName.trim()) return toast.error('Please enter your full name');
    if (!signerContact.trim()) return toast.error('Please enter your email or phone');
    setSigning(true);
    try {
      const signatureImage = canvas.toDataURL('image/png');
      await api.post(`/documents/shared/${token}/sign`, {
        signerName: signerName.trim(),
        signerContact: signerContact.trim(),
        signatureImage,
      });
      toast.success('Document signed successfully!');
      const res = await api.get(`/documents/shared/${token}`);
      setDoc(res.data.document);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to sign document');
    } finally {
      setSigning(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin" size={36} style={{ color: BRAND }} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 px-4 text-center">
      <AlertCircle size={52} className="text-gray-300" />
      <p className="text-gray-600 font-semibold text-lg">{error}</p>
      <Link to="/" className="text-sm font-bold" style={{ color: BRAND }}>← Back to Home</Link>
    </div>
  );

  if (!doc) return null;

  const dateStr = new Date(doc._creationTime || doc.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' });
  const eSignRequested = doc.data?.eSignRequest;
  const alreadySigned = !!doc.eSignature;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 font-semibold">
            ← DocuFlow AI
          </Link>
          <div className="flex items-center gap-2">
            {alreadySigned && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <CheckCircle2 size={13} /> Signed
              </span>
            )}
            {doc.pdfUrl && (
              <>
                <button
                  onClick={() => setShowPdfModal(true)}
                  className="flex items-center gap-2 px-4 py-2 border-2 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                  style={{ borderColor: brandColor, color: brandColor }}
                >
                  <FileText size={14} />
                  View PDF
                </button>
                <a
                  href={doc.pdfUrl}
                  download
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow hover:opacity-90 transition-all"
                  style={{ backgroundColor: brandColor }}
                >
                  <Download size={14} />
                  Download
                </a>
              </>
            )}
          </div>
        </div>

        {/* Document */}
        <div className="bg-white shadow-2xl rounded-sm overflow-hidden">
          {/* Header band */}
          <div className="flex justify-between items-start p-10" style={{ backgroundColor: brandColor }}>
            <div>
              {company?.logoUrl ? (
                <img src={company.logoUrl} alt="Logo" className="h-16 object-contain mb-3 bg-white/10 p-2 rounded-lg" />
              ) : (
                <h2 className="text-2xl font-black text-white mb-1">{company?.name}</h2>
              )}
              <div className="text-sm text-white/70 font-bold uppercase tracking-widest">
                {(doc.type || '').replace(/_/g, ' ')}
              </div>
            </div>
            <div className="text-right space-y-1 text-white">
              <h3 className="text-lg font-black">{company?.name}</h3>
              {company?.address && <p className="text-white/80 text-sm">{company.address}</p>}
              {company?.phone && <p className="text-white/80 text-sm">{company.phone}</p>}
              {company?.email && <p className="text-white/80 text-sm">{company.email}</p>}
            </div>
          </div>

          {/* Body */}
          <div className="px-10 py-8 space-y-10">
            {/* Title + client row */}
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">{doc.title}</h1>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Client:</span>
                  <span className="text-gray-900 font-bold text-sm">{doc.clientName}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Date Issued</p>
                <p className="text-gray-900 font-black">{dateStr}</p>
              </div>
            </div>

            {/* Sections */}
            {doc.data?.sections?.map((s: any, i: number) => (
              <div key={i} className="space-y-3">
                <h3 className="text-xl font-black text-gray-900 border-l-4 pl-4" style={{ borderColor: brandColor }}>
                  {s.heading}
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{s.content}</p>
              </div>
            ))}

            {/* Tables */}
            {doc.data?.tables?.map((table: any, i: number) => (
              <div key={i} className="space-y-3">
                <h3 className="text-xl font-black text-gray-900">{table.title}</h3>
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-left">
                    <thead>
                      <tr style={{ backgroundColor: brandColor }}>
                        {(Array.isArray(table.headers) ? table.headers : Object.values(table.headers || {})).map((h: any, j: number) => (
                          <th key={j} className="p-4 text-white font-bold text-xs uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(Array.isArray(table.rows) ? table.rows : []).map((row: any, j: number) => (
                        <tr key={j} className="hover:bg-gray-50">
                          {(Array.isArray(row) ? row : Object.values(row || {})).map((cell: any, k: number) => (
                            <td key={k} className="p-4 text-gray-700 font-medium text-sm">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Summary */}
            {doc.data?.summary && Object.keys(doc.data.summary).length > 0 && (
              <div className="flex justify-end">
                <div className="w-72 space-y-3 p-6 rounded-xl bg-gray-50 border border-gray-100">
                  {Object.entries(doc.data.summary).map(([k, v]: [string, any]) => (
                    <div key={k} className="flex justify-between items-center">
                      <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">{k}</span>
                      <span className="font-black text-gray-900 text-lg">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signed signature display (inside document body) */}
            {alreadySigned && (
              <div className="rounded-xl border-2 border-green-100 bg-green-50/50 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span className="text-xs font-black text-green-700 uppercase tracking-wider">Digitally Signed</span>
                </div>
                <img
                  src={doc.eSignature.signatureImage}
                  alt="Signature"
                  className="max-h-20 max-w-48 object-contain border-b border-gray-200 pb-2"
                />
                <div className="text-xs text-gray-600 space-y-1">
                  <p><span className="font-bold text-gray-800">Name:</span> {doc.eSignature.signerName}</p>
                  <p><span className="font-bold text-gray-800">Contact:</span> {doc.eSignature.signerContact}</p>
                  <p><span className="font-bold text-gray-800">Signed on:</span> {new Date(doc.eSignature.signedAt).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-end px-10 pb-10">
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Authorized Signatory</p>
              <p className="text-lg font-black text-gray-900">{company?.name}</p>
              <div className="h-20 w-40 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
                <p className="text-gray-300 font-bold text-xs">Stamp / Sign</p>
              </div>
            </div>
            {doc.data?.terms && (
              <div className="text-right max-w-xs">
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-2">Terms & Conditions</p>
                <p className="text-xs text-gray-400 leading-relaxed">{doc.data.terms}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── E-Signature Panel ──────────────────────────────────────────── */}
        {eSignRequested && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {alreadySigned ? (
              <div className="p-8 flex flex-col items-center gap-3 text-center">
                <CheckCircle2 size={48} className="text-green-500" />
                <h3 className="text-lg font-black text-gray-900">Document Signed</h3>
                <p className="text-sm text-gray-500">
                  Signed by <span className="font-bold text-gray-700">{doc.eSignature.signerName}</span> on{' '}
                  {new Date(doc.eSignature.signedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: `${brandColor}15` }}>
                    <PenLine size={20} style={{ color: brandColor }} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900">E-Sign This Document</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Draw your signature and provide your details below</p>
                  </div>
                </div>

                {/* Canvas */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Signature</label>
                    {hasSigned && (
                      <button
                        onClick={clearCanvas}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors"
                      >
                        <Trash2 size={11} /> Clear
                      </button>
                    )}
                  </div>
                  <div className="relative rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden" style={{ height: 140 }}>
                    {!hasSigned && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-gray-300 text-sm font-semibold select-none">Sign here</p>
                      </div>
                    )}
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={280}
                      className="w-full h-full cursor-crosshair touch-none"
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={stopDraw}
                      onMouseLeave={stopDraw}
                      onTouchStart={startDraw}
                      onTouchMove={draw}
                      onTouchEnd={stopDraw}
                    />
                  </div>
                  <p className="text-xs text-gray-400">Use your mouse or touch to draw your signature</p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={signerName}
                      onChange={e => setSignerName(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
                      onFocus={e => e.target.style.borderColor = brandColor}
                      onBlur={e => e.target.style.borderColor = ''}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email / Phone</label>
                    <input
                      type="text"
                      placeholder="john@example.com or +91 9876543210"
                      value={signerContact}
                      onChange={e => setSignerContact(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
                      onFocus={e => e.target.style.borderColor = brandColor}
                      onBlur={e => e.target.style.borderColor = ''}
                    />
                  </div>
                </div>

                <button
                  onClick={handleSign}
                  disabled={signing}
                  style={{ backgroundColor: brandColor }}
                  className="w-full text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 hover:opacity-90 transition-all disabled:opacity-50 shadow"
                >
                  {signing ? <Loader2 className="animate-spin" size={16} /> : <PenLine size={16} />}
                  {signing ? 'Signing...' : 'Submit E-Signature'}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  By signing, you agree that this is a legally binding electronic signature.
                </p>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          Shared via <span className="font-bold" style={{ color: BRAND }}>DocuFlow AI</span>
          {!eSignRequested && ' · Read-only view'}
        </p>
      </div>

      {/* PDF Viewer Modal */}
      {showPdfModal && doc.pdfUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between px-6 py-3 bg-gray-900 shrink-0">
            <p className="text-white font-bold text-sm truncate max-w-md">{doc.title}</p>
            <div className="flex items-center gap-4">
              <a href={doc.pdfUrl} download className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-semibold transition-colors">
                <Download size={14} /> Download
              </a>
              <button onClick={() => setShowPdfModal(false)} className="text-white/60 hover:text-white font-bold text-sm transition-colors flex items-center gap-1.5">
                <X size={16} /> Close
              </button>
            </div>
          </div>
          <iframe src={doc.pdfUrl} className="flex-1 w-full border-0" title="PDF Preview" />
        </div>
      )}
    </div>
  );
};

export default SharedDocumentView;
