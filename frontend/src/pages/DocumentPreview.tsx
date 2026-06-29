import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';

const DocumentPreview = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [document, setDocument] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const [editingAI, setEditingAI] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);

  const [tempDoc, setTempDoc] = useState<any>(null);
  const [sharing, setSharing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [updatingPerm, setUpdatingPerm] = useState(false);
  const [togglingESign, setTogglingESign] = useState(false);

  const isOwner = user?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [docRes, compResponse] = await Promise.all([
        api.get(`/documents/${id}`),
        api.get('/company')
      ]);
      setDocument(docRes.data);
      setTempDoc(JSON.parse(JSON.stringify(docRes.data)));
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
      const response = await api.post(`/documents/${id}/edit-ai`, { instruction: aiInstruction });
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

  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await api.post(`/documents/${id}/share`);
      const token = res.data.shareToken;
      const shareUrl = `${window.location.origin}/shared/${token}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
      toast.success('Share link copied to clipboard!');
    } catch {
      toast.error('Failed to create share link');
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
        data: tempDoc.data
      });
      setDocument(response.data);
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

  const brandColor = company?.colorTheme?.primary1 || '#714B67';

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#714B67' }}></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header Actions */}
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

          {!isManualEdit ? (
            <button
              onClick={() => setIsManualEdit(true)}
              className="flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all"
              style={{ borderColor: brandColor, color: brandColor }}
            >
              <Edit3 size={18} />
              <span>Manual Edit</span>
            </button>
          ) : (
            <div className="flex gap-2">
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
                onClick={() => { setIsManualEdit(false); setTempDoc(JSON.parse(JSON.stringify(document))); }}
                className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-200 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex items-center space-x-2 px-4 py-3 border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all text-gray-600"
          >
            {shareCopied ? <Check size={16} className="text-green-500" /> : sharing ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
            <span>{shareCopied ? 'Copied!' : 'Share'}</span>
          </button>

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Document Preview Area */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow-2xl border border-gray-100 min-h-[1000px] relative overflow-hidden">
            {/* Branding Header */}
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

            {/* Content Area */}
            <div className="px-16 space-y-12">
               <div className="flex justify-between items-end">
                  <div className="flex-1 mr-8">
                    {isManualEdit ? (
                      <input
                        className="text-5xl font-black text-gray-900 tracking-tighter mb-2 bg-gray-50 p-2 rounded-xl border-2 border-dashed border-gray-200 outline-none w-full"
                        value={tempDoc.title}
                        onChange={(e) => setTempDoc({ ...tempDoc, title: e.target.value })}
                      />
                    ) : (
                      <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">{tempDoc.title}</h1>
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
                  <div className="text-right">
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
               </div>

               {/* Sections */}
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

               {/* Tables */}
               {tempDoc.data.tables?.map((table: any, idx: number) => (
                 <div key={idx} className="space-y-6">
                   <h3 className="text-2xl font-black text-gray-900">{table.title}</h3>
                   <div className="overflow-hidden rounded-3xl border-2 border-gray-100">
                     <table className="w-full text-left border-collapse">
                       <thead>
                         <tr style={{ backgroundColor: brandColor }}>
                           {(Array.isArray(table.headers) ? table.headers : Object.values(table.headers || {})).map((h: any, i: number) => (
                             <th key={i} className="p-5 text-white font-black uppercase text-xs tracking-widest">{h}</th>
                           ))}
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                         {(Array.isArray(table.rows) ? table.rows : []).map((row: any, i: number) => (
                           <tr key={i} className="hover:bg-gray-50/50">
                             {(Array.isArray(row) ? row : Object.values(row || {})).map((cell: any, j: number) => (
                               <td key={j} className="p-5">
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

               {/* E-Signature display */}
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

               {/* Summary */}
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

            {/* Footer Branding */}
            <div className="mt-32 pt-10 border-t border-gray-100 flex justify-between items-end px-16 pb-16">
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
        </div>

        {/* AI Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100">
            <div className="flex items-center space-x-3 text-primary mb-6">
              <div className="p-2 bg-primary/10 rounded-xl">
                 <Sparkles size={24} style={{ color: brandColor }} />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">AI Smart Editor</h3>
            </div>
            <p className="text-sm text-gray-500 font-bold leading-relaxed mb-8">
              Refine your document using AI. Describe changes like "Add 18% GST" or "Make the overview more formal".
            </p>
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

          {/* Permission control — owner only */}
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
          {/* E-Signature card — owner only */}
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

      {/* PDF Viewer Modal */}
      {showPdfModal && document.pdfUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between px-6 py-3 bg-gray-900 shrink-0">
            <p className="text-white font-bold text-sm truncate max-w-md">{document.title}</p>
            <div className="flex items-center gap-4">
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
          <iframe
            src={document.pdfUrl}
            className="flex-1 w-full border-0"
            title="PDF Preview"
          />
        </div>
      )}
    </div>
  );
};

export default DocumentPreview;
