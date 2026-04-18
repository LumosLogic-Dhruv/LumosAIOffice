import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Sparkles, FileText, Send, Loader2, ChevronDown } from 'lucide-react';

const DOCUMENT_TYPES = [
  { value: 'quotation', label: 'Quotation' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'proposal', label: 'Project Proposal' },
  { value: 'sow', label: 'Statement of Work' },
  { value: 'agreement', label: 'Agreement' },
  { value: 'nda', label: 'NDA' },
];

const CreateDocument = () => {
  const [mode, setMode] = useState<'manual' | 'ai'>('ai');
  const [type, setType] = useState('quotation');
  const [rawText, setRawText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const navigate = useNavigate();

  const handleAIProcess = async () => {
    if (!rawText) return toast.error('Please enter requirements');
    setProcessing(true);
    try {
      const response = await api.post('/documents/process-ai', { type, rawText });
      const aiData = response.data;
      
      const docResponse = await api.post('/documents', {
        type,
        title: aiData.title || `AI Generated ${type}`,
        clientName: aiData.clientName || 'Valued Client',
        data: aiData
      });

      toast.success('AI Document Generated!');
      navigate(`/dashboard/documents/${docResponse.data._id}`);
    } catch (error) {
      toast.error('AI Processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName) return toast.error('Please fill required fields');
    
    try {
      const response = await api.post('/documents', {
        type,
        title,
        clientName,
        data: { 
          sections: [{ heading: 'Overview', content: 'Enter content here...' }],
          tables: [],
          summary: {}
        }
      });
      toast.success('Document created!');
      navigate(`/dashboard/documents/${response.data._id}`);
    } catch (error) {
      toast.error('Failed to create document');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight text-center md:text-left">Create Document</h1>
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mt-2 text-center md:text-left">Generate professional documents in seconds</p>
        </div>
        
        <div className="flex bg-gray-100 p-2 rounded-[24px] w-fit mx-auto md:mx-0 shadow-inner">
          <button
            onClick={() => setMode('ai')}
            className={`flex items-center space-x-3 px-8 py-4 rounded-[18px] transition-all font-black text-sm uppercase tracking-wider ${
              mode === 'ai' 
                ? 'text-white shadow-xl' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            style={mode === 'ai' ? { backgroundColor: '#714B67' } : {}}
          >
            <Sparkles size={20} strokeWidth={3} />
            <span>AI Assistant</span>
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex items-center space-x-3 px-8 py-4 rounded-[18px] transition-all font-black text-sm uppercase tracking-wider ${
              mode === 'manual' 
                ? 'text-white shadow-xl' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            style={mode === 'manual' ? { backgroundColor: '#714B67' } : {}}
          >
            <FileText size={20} strokeWidth={3} />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[40px] shadow-2xl shadow-primary/5 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <div className="space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Select Document Type</label>
            <div className="relative group">
              <select
                className="w-full p-5 border-2 border-gray-100 rounded-3xl focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all appearance-none bg-gray-50/50 font-black text-gray-700 cursor-pointer text-lg pr-12"
                style={{ border: '2px solid #f3f4f6' }}
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {DOCUMENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary transition-colors">
                <ChevronDown size={24} strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>

        {mode === 'ai' ? (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                Describe your requirements
              </label>
              <textarea
                className="w-full p-8 border-2 border-gray-100 rounded-[32px] h-64 focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none resize-none transition-all bg-gray-50/30 text-xl text-gray-800 placeholder:text-gray-300 font-medium leading-relaxed"
                placeholder="Example: Generate a formal quotation for Lumos Logic for a 10-page e-commerce website with payment gateway and user dashboard. Total price: ₹1,50,000."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>
            <button
              onClick={handleAIProcess}
              disabled={processing}
              style={{ backgroundColor: '#714B67' }}
              className="w-full text-white p-8 rounded-[24px] font-black text-2xl flex items-center justify-center space-x-4 hover:opacity-90 transition-all disabled:opacity-50 shadow-2xl shadow-primary/30 group uppercase tracking-tighter"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin" size={32} strokeWidth={3} />
                  <span>AI IS WORKING...</span>
                </>
              ) : (
                <>
                  <Sparkles size={32} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
                  <span>GENERATE DOCUMENT</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualCreate} className="space-y-10 animate-in fade-in duration-500">
            <div className="space-y-8">
               <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Document Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Annual Maintenance Contract"
                    className="w-full p-5 border-2 border-gray-100 rounded-3xl focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all bg-gray-50/50 font-black text-lg"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
               </div>
               <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Client Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Microsoft India Pvt Ltd"
                    className="w-full p-5 border-2 border-gray-100 rounded-3xl focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all bg-gray-50/50 font-black text-lg"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
               </div>
            </div>
            <button
              type="submit"
              style={{ backgroundColor: '#714B67' }}
              className="w-full text-white p-8 rounded-[24px] font-black text-2xl flex items-center justify-center space-x-4 hover:opacity-90 transition-all shadow-2xl shadow-primary/30 uppercase tracking-tighter"
            >
              <Send size={32} strokeWidth={3} />
              <span>CREATE & START EDITING</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateDocument;
