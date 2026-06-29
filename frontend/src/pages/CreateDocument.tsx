import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Sparkles, FileText, Send, Loader2, ChevronDown, Users, LayoutTemplate } from 'lucide-react';
import DocumentTemplatePreview from '../components/DocumentTemplatePreview';

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
  { value: 'form_16', label: 'Form 16 (TDS Certificate)' },
  { value: 'gst_invoice', label: 'GST Invoice' },
  { value: 'salary_slip', label: 'Salary Slip' },
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'policy', label: 'Company Policy' },
  { value: 'experience_letter', label: 'Experience Letter' },
  { value: 'service_agreement', label: 'Service Agreement' },
];

const DOCUMENT_TEMPLATES: Record<string, { description: string; sections: string[] }> = {
  quotation: {
    description: 'Standard price quotation with scope and cost breakdown',
    sections: ['Project Overview', 'Scope of Work', 'Deliverables', 'Project Timeline', 'Pricing Breakdown', 'Payment Terms'],
  },
  invoice: {
    description: 'Official itemized invoice with tax details',
    sections: ['Invoice Details', 'Services / Products Rendered', 'Payment Instructions'],
  },
  proforma_invoice: {
    description: 'Pre-shipment commercial invoice estimate',
    sections: ['Proforma Details', 'Items / Services', 'Delivery Terms'],
  },
  proposal: {
    description: 'Comprehensive project proposal with objectives and plan',
    sections: ['Executive Summary', 'Problem Statement', 'Proposed Solution', 'Scope & Deliverables', 'Project Timeline', 'Investment & Pricing', 'About Our Company'],
  },
  sow: {
    description: 'Detailed Statement of Work with tasks and responsibilities',
    sections: ['Project Overview & Objectives', 'Detailed Scope of Work', 'Out-of-Scope Items', 'Deliverables & Acceptance Criteria', 'Change Management Process'],
  },
  agreement: {
    description: 'Formal business agreement / contract',
    sections: ['Parties & Background', 'Services & Obligations', 'Payment Terms', 'Intellectual Property', 'Confidentiality', 'Termination Clause', 'Governing Law'],
  },
  nda: {
    description: 'Non-Disclosure Agreement for confidential information',
    sections: ['Parties', 'Definition of Confidential Information', 'Disclosure Obligations', 'Permitted Disclosures & Exclusions', 'Duration', 'Return of Information', 'Remedies'],
  },
  receipt: {
    description: 'Official payment receipt with confirmation',
    sections: ['Receipt Details', 'Payment Confirmation'],
  },
  timeline: {
    description: 'Project timeline with phases and milestones',
    sections: ['Project Overview', 'Phase Breakdown', 'Key Dependencies', 'Risk Factors'],
  },
  form_16: {
    description: 'TDS Certificate issued by employer for income tax filing (Sec 203)',
    sections: ['Part A — TDS Summary (Quarterly)', 'Part B — Salary Details', 'Deductions Under Chapter VI-A', 'Tax Computation'],
  },
  gst_invoice: {
    description: 'GST-compliant tax invoice with GSTIN and HSN/SAC codes',
    sections: ['Invoice Details', 'Supplier Information', 'Recipient Information', 'Tax Summary (CGST / SGST / IGST)'],
  },
  salary_slip: {
    description: 'Monthly salary slip with earnings, deductions and net pay',
    sections: ['Employee Information', 'Leave Summary', 'Earnings', 'Deductions', 'Net Pay Summary'],
  },
  offer_letter: {
    description: 'Formal employment offer letter with CTC and terms',
    sections: ['Position & Joining Details', 'Compensation & Benefits', 'Work Schedule & Policies', 'Key Responsibilities', 'Terms of Employment', 'Acceptance Instructions'],
  },
  policy: {
    description: 'Company policy document with procedures and compliance',
    sections: ['Policy Overview', 'Purpose', 'Scope', 'Policy Statement', 'Employee Responsibilities', 'Management Responsibilities', 'Compliance & Monitoring', 'Non-Compliance Consequences'],
  },
  experience_letter: {
    description: 'Work experience / relieving letter for employees',
    sections: ['Employee Details', 'Employment Confirmation', 'Roles & Responsibilities', 'Performance & Character Assessment', 'Official Relieving Statement'],
  },
  service_agreement: {
    description: 'Comprehensive service agreement between company and client',
    sections: ['Parties & Recitals', 'Description of Services', 'Fees & Payment Schedule', 'Term & Renewal', 'Termination', 'Intellectual Property', 'Confidentiality', 'Limitation of Liability', 'Governing Law'],
  },
};

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
      const template = DOCUMENT_TEMPLATES[type];
      const sections = template
        ? template.sections.map(s => ({ heading: s, content: '' }))
        : [{ heading: 'Overview', content: 'Enter content here...' }];
      const response = await api.post('/documents', {
        type,
        title,
        clientName,
        data: {
          ...clientData,
          sections,
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

  const template = DOCUMENT_TEMPLATES[type];
  const currentTypeLabel = DOCUMENT_TYPES.find(t => t.value === type)?.label || type;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Create Document</h1>
          <p className="text-xs text-gray-400 mt-0.5">Generate professional documents in seconds</p>
        </div>
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

      {/* Two-column: form + live preview */}
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">

        {/* ── LEFT: Form ── */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          {/* Document type */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Document Type</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none appearance-none bg-gray-50 font-medium text-gray-700 cursor-pointer pr-9"
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

          {/* Template info */}
          {template && (
            <div className="mb-5 rounded-lg border border-gray-100 bg-gray-50/80 p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <LayoutTemplate size={12} style={{ color: BRAND }} />
                <span className="text-xs font-semibold" style={{ color: BRAND }}>Official Format — Pre-selected Template</span>
              </div>
              <p className="text-xs text-gray-500">{template.description}</p>
              <div className="flex flex-wrap gap-1">
                {template.sections.map(s => (
                  <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500">{s}</span>
                ))}
              </div>
            </div>
          )}

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
                  <><Loader2 className="animate-spin" size={16} /><span>AI is generating...</span></>
                ) : (
                  <><Sparkles size={16} /><span>Generate Document</span></>
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

        {/* ── RIGHT: Live Template Preview ── */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-bold text-gray-700">{currentTypeLabel} — Template Preview</p>
            {template && <p className="text-xs text-gray-400 mt-0.5">{template.description}</p>}
          </div>
          <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
            <DocumentTemplatePreview type={type} brandColor={BRAND} />
          </div>
          {template && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-xs text-gray-400 self-center mr-0.5">Sections:</span>
              {template.sections.map(s => (
                <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{s}</span>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CreateDocument;
