import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Sparkles, FileText, Send, Loader2, ChevronDown, Users } from 'lucide-react';

const BRAND = '#714B67';

const DOCUMENT_TYPES = [
  { value: 'quotation', label: 'Quotation' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'proforma_invoice', label: 'Proforma Invoice' },
  { value: 'proposal', label: 'Project Proposal' },
  { value: 'sow', label: 'Statement of Work' },
  { value: 'agreement', label: 'Agreement' },
  { value: 'nda', label: 'NDA' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'timeline', label: 'Project Timeline' },
];

const CreateDocument = () => {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [type, setType] = useState('quotation');
  const [rawText, setRawText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/clients').then(res => setClients(res.data)).catch(() => {});
  }, []);

  const handleAIProcess = async () => {
    if (!rawText.trim()) return toast.error('Please describe your requirements');
    setProcessing(true);
    try {
      const response = await api.post('/documents/process-ai', { type, rawText });
      const aiData = response.data;
      const docResponse = await api.post('/documents', {
        type,
        title: aiData.title || `AI ${type}`,
        clientName: aiData.clientName || 'Valued Client',
        data: aiData
      });
      toast.success('Document generated!');
      navigate(`/dashboard/documents/${docResponse.data._id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'AI Processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleClientSelect = (clientId: string) => {
    if (!clientId) {
      setSelectedClient(null);
      setClientName('');
      return;
    }
    const client = clients.find(c => c._id === clientId);
    if (client) {
      setSelectedClient(client);
      setClientName(client.name);
    }
  };

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName) return toast.error('Please fill all fields');
    try {
      const clientData = selectedClient ? {
        clientEmail: selectedClient.email || '',
        clientPhone: selectedClient.phone || '',
        clientAddress: selectedClient.address || '',
        clientGstin: selectedClient.gstin || '',
      } : {};
      const response = await api.post('/documents', {
        type,
        title,
        clientName,
        data: {
          ...clientData,
          sections: [{ heading: 'Overview', content: 'Enter content here...' }],
          tables: [],
          summary: {}
        }
      });
      toast.success('Document created!');
      navigate(`/dashboard/documents/${response.data._id}`);
    } catch {
      toast.error('Failed to create document');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Create Document</h1>
          <p className="text-xs text-gray-400 mt-0.5">Generate professional documents in seconds</p>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit gap-1">
          <button
            onClick={() => setMode('ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold text-sm ${
              mode === 'ai' ? 'text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
            }`}
            style={mode === 'ai' ? { backgroundColor: BRAND } : {}}
          >
            <Sparkles size={15} />
            <span>AI Assistant</span>
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold text-sm ${
              mode === 'manual' ? 'text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
            }`}
            style={mode === 'manual' ? { backgroundColor: BRAND } : {}}
          >
            <FileText size={15} />
            <span>Manual</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {/* Document type selector */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Document Type</label>
          <div className="relative">
            <select
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 appearance-none bg-gray-50 font-medium text-gray-700 cursor-pointer pr-9"
              onFocus={e => e.target.style.borderColor = BRAND}
              onBlur={e => e.target.style.borderColor = ''}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {DOCUMENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {mode === 'ai' ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Describe your requirements
              </label>
              <textarea
                className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg h-44 focus:outline-none resize-none transition-all bg-gray-50 text-gray-800 placeholder:text-gray-300 leading-relaxed"
                onFocus={e => e.target.style.borderColor = BRAND}
                onBlur={e => e.target.style.borderColor = ''}
                placeholder="Example: Generate a formal quotation for Lumos Logic for a 10-page e-commerce website with payment gateway and user dashboard. Total price: ₹1,50,000."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1.5">Be specific about scope, pricing, and client name for best results.</p>
            </div>
            <button
              onClick={handleAIProcess}
              disabled={processing}
              style={{ backgroundColor: BRAND }}
              className="w-full text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2.5 hover:opacity-90 transition-all disabled:opacity-50 shadow"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>AI is generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Document</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualCreate} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g., Annual Maintenance Contract"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none transition-all bg-gray-50 text-gray-700"
                  onFocus={e => e.target.style.borderColor = BRAND}
                  onBlur={e => e.target.style.borderColor = ''}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Client selector */}
              {clients.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={11} /> Select Saved Client
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none transition-all bg-gray-50 text-gray-700 appearance-none cursor-pointer pr-9"
                      onFocus={e => e.target.style.borderColor = BRAND}
                      onBlur={e => e.target.style.borderColor = ''}
                      value={selectedClient?._id || ''}
                      onChange={e => handleClientSelect(e.target.value)}
                    >
                      <option value="">— Type client name manually below —</option>
                      {clients.map(c => (
                        <option key={c._id} value={c._id}>{c.name}{c.email ? ` (${c.email})` : ''}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {selectedClient && (
                    <div className="bg-purple-50 rounded-lg px-3 py-2 space-y-0.5">
                      {selectedClient.email && <p className="text-xs text-gray-500">✉ {selectedClient.email}</p>}
                      {selectedClient.phone && <p className="text-xs text-gray-500">📞 {selectedClient.phone}</p>}
                      {selectedClient.address && <p className="text-xs text-gray-500">📍 {selectedClient.address}</p>}
                      {selectedClient.gstin && <p className="text-xs text-gray-500 font-mono">GST: {selectedClient.gstin}</p>}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Client Name</label>
                <input
                  type="text"
                  placeholder="e.g., Microsoft India Pvt Ltd"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none transition-all bg-gray-50 text-gray-700"
                  onFocus={e => e.target.style.borderColor = BRAND}
                  onBlur={e => e.target.style.borderColor = ''}
                  value={clientName}
                  onChange={(e) => { setClientName(e.target.value); setSelectedClient(null); }}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              style={{ backgroundColor: BRAND }}
              className="w-full text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2.5 hover:opacity-90 transition-all shadow"
            >
              <Send size={16} />
              <span>Create & Start Editing</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateDocument;
