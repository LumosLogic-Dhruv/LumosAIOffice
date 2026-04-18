import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
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
  X
} from 'lucide-react';

const DocumentPreview = () => {
  const { id } = useParams();
  const [document, setDocument] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const [editingAI, setEditingAI] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);
  
  // Local state for editing everything
  const [tempDoc, setTempDoc] = useState<any>(null);

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
      setTempDoc(JSON.parse(JSON.stringify(docRes.data))); // Deep clone for editing
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
        <div className="flex items-center gap-3">
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
              className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg"
            >
              <Edit3 size={18} />
              <span>Manual Edit</span>
            </button>
          ) : (
            <div className="flex gap-2">
               <button
                onClick={handleManualSave}
                disabled={isSavingManual}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg disabled:opacity-50"
              >
                {isSavingManual ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                <span>{isSavingManual ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={() => { setIsManualEdit(false); setTempDoc(JSON.parse(JSON.stringify(document))); }}
                className="flex items-center space-x-2 px-6 py-3 bg-red-100 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-200 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <button
            onClick={handleGeneratePdf}
            disabled={generatingPdf}
            style={{ backgroundColor: '#714B67' }}
            className="flex items-center space-x-2 px-6 py-3 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
          >
            {generatingPdf ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            <span>Update PDF</span>
          </button>

          {document.pdfUrl && (
            <a 
              href={document.pdfUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
            >
              <Eye size={18} />
              <span>View PDF</span>
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Document Preview Area */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow-2xl border border-gray-100 min-h-[1000px] relative overflow-hidden">
            {/* Branding Header */}
            <div className="flex justify-between items-start p-10 mb-12" style={{ backgroundColor: '#714B67' }}>
               <div>
                  {company?.logoUrl ? (
                    <img src={company.logoUrl} alt="Logo" className="h-20 object-contain mb-4 bg-white/10 p-2 rounded-xl" />
                  ) : (
                    <h2 className="text-3xl font-black text-white mb-2">{company?.name}</h2>
                  )}
                  <div className="text-sm text-white/70 font-bold uppercase tracking-widest">
                    {tempDoc.type.replace('_', ' ')}
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
                        value={new Date(tempDoc.createdAt).toISOString().split('T')[0]}
                        onChange={(e) => setTempDoc({ ...tempDoc, createdAt: new Date(e.target.value).toISOString() })}
                      />
                    ) : (
                      <p className="text-lg font-black text-gray-900">{new Date(tempDoc.createdAt).toLocaleDateString()}</p>
                    )}
                  </div>
               </div>

               {/* Sections */}
               {tempDoc.data.sections?.map((section: any, idx: number) => (
                 <div key={idx} className="group relative">
                   {isManualEdit ? (
                     <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200">
                        <input 
                          className="w-full bg-transparent font-black text-2xl text-primary outline-none"
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
                       <h3 className="text-2xl font-black text-gray-900 border-l-4 pl-4" style={{ borderColor: '#714B67' }}>{section.heading}</h3>
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
                         <tr style={{ backgroundColor: '#714B67' }}>
                           {table.headers.map((h: string, i: number) => (
                             <th key={i} className="p-5 text-white font-black uppercase text-xs tracking-widest">{h}</th>
                           ))}
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                         {table.rows.map((row: any[], i: number) => (
                           <tr key={i} className="hover:bg-gray-50/50">
                             {row.map((cell, j) => (
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

               {/* Summary */}
               {tempDoc.data.summary && (
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
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 sticky top-8">
            <div className="flex items-center space-x-3 text-primary mb-6">
              <div className="p-2 bg-primary/10 rounded-xl">
                 <Sparkles size={24} style={{ color: '#714B67' }} />
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
              style={{ backgroundColor: '#714B67' }}
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
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
