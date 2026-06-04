import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Download, Loader2, AlertCircle, X, FileText } from 'lucide-react';

const BRAND = '#714B67';

const SharedDocumentView = () => {
  const { token } = useParams();
  const [doc, setDoc] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 font-semibold">
            ← DocuFlow AI
          </Link>
          {doc.pdfUrl && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowPdfModal(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                style={{ borderColor: BRAND, color: BRAND }}
              >
                <FileText size={14} />
                View PDF
              </button>
              <a
                href={doc.pdfUrl}
                download
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow hover:opacity-90 transition-all"
                style={{ backgroundColor: BRAND }}
              >
                <Download size={14} />
                Download
              </a>
            </div>
          )}
        </div>

        {/* Document */}
        <div className="bg-white shadow-2xl rounded-sm overflow-hidden">
          {/* Header band */}
          <div className="flex justify-between items-start p-10" style={{ backgroundColor: BRAND }}>
            <div>
              {company?.logoUrl ? (
                <img src={company.logoUrl} alt="Logo" className="h-16 object-contain mb-3 bg-white/10 p-2 rounded-lg" />
              ) : (
                <h2 className="text-2xl font-black text-white mb-1">{company?.name}</h2>
              )}
              <div className="text-sm text-white/70 font-bold uppercase tracking-widest">
                {(doc.type || '').replace('_', ' ')}
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
                <h3
                  className="text-xl font-black text-gray-900 border-l-4 pl-4"
                  style={{ borderColor: BRAND }}
                >
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
                      <tr style={{ backgroundColor: BRAND }}>
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

        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          Shared via <span className="font-bold" style={{ color: BRAND }}>DocuFlow AI</span> · Read-only view
        </p>
      </div>

      {/* PDF Viewer Modal */}
      {showPdfModal && doc.pdfUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between px-6 py-3 bg-gray-900 shrink-0">
            <p className="text-white font-bold text-sm truncate max-w-md">{doc.title}</p>
            <div className="flex items-center gap-4">
              <a
                href={doc.pdfUrl}
                download
                className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-semibold transition-colors"
              >
                <Download size={14} /> Download
              </a>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-white/60 hover:text-white font-bold text-sm transition-colors flex items-center gap-1.5"
              >
                <X size={16} /> Close
              </button>
            </div>
          </div>
          <iframe
            src={doc.pdfUrl}
            className="flex-1 w-full border-0"
            title="PDF Preview"
          />
        </div>
      )}
    </div>
  );
};

export default SharedDocumentView;
