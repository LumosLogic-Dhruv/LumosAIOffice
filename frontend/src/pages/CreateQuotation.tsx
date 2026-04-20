import React, { useState } from 'react';
import { Sparkles, Save, Send, Plus, Trash2, Loader2 } from 'lucide-react';
import { quotationApi } from '../services/api';

const CreateQuotation: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [isAiMode, setIsAiMode] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: '',
    projectName: '',
    overview: '',
    timeline: '',
    notes: '',
    features: [] as string[],
    costBreakdown: [] as { item: string, price: number }[],
    totalCost: 0
  });

  const handleAiProcess = async () => {
    if (!rawText.trim()) return;
    setIsLoading(true);
    try {
      const response = await quotationApi.post('/documents/process-ai', { rawText: rawText, type: 'quotation' });
      const data = response.data;
      
      setFormData({
        ...formData,
        clientName: data.clientName || '',
        projectName: data.project || '',
        overview: data.overview || '',
        timeline: data.timeline || '',
        features: data.features || [],
        costBreakdown: data.costBreakdown || [],
        totalCost: data.total || 0
      });
      setIsAiMode(false);
    } catch (error) {
      alert('AI processing failed. Please try manual entry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCostItem = () => {
    setFormData({
      ...formData,
      costBreakdown: [...formData.costBreakdown, { item: '', price: 0 }]
    });
  };

  const handleUpdateCostItem = (index: number, field: string, value: any) => {
    const updated = [...formData.costBreakdown];
    updated[index] = { ...updated[index], [field]: value };
    
    const newTotal = updated.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    
    setFormData({
      ...formData,
      costBreakdown: updated,
      totalCost: newTotal
    });
  };

  const handleRemoveCostItem = (index: number) => {
    const updated = formData.costBreakdown.filter((_, i) => i !== index);
    const newTotal = updated.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    setFormData({ ...formData, costBreakdown: updated, totalCost: newTotal });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await quotationApi.post('/documents', formData);
      alert('Quotation saved successfully!');
      onSuccess();
    } catch (error) {
      alert('Failed to save quotation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Form */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">New Quotation</h3>
          <button
            onClick={() => setIsAiMode(!isAiMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isAiMode ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <Sparkles size={18} />
            {isAiMode ? 'Switch to Manual' : 'Use AI Generator'}
          </button>
        </div>

        {isAiMode ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Paste client requirements, emails, or raw notes. Our AI will extract features and calculate costs.
            </p>
            <textarea
              className="w-full h-48 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Example: Client needs a resort website with gallery, contact form, SEO, WhatsApp integration..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            <button
              onClick={handleAiProcess}
              disabled={isLoading || !rawText}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              Process with AI
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-gray-200 rounded-lg"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-gray-200 rounded-lg"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Overview</label>
              <textarea
                className="w-full p-2 border border-gray-200 rounded-lg h-24"
                value={formData.overview}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Cost Breakdown</label>
                <button
                  type="button"
                  onClick={handleAddCostItem}
                  className="text-blue-600 text-sm flex items-center gap-1 hover:underline"
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>
              
              {formData.costBreakdown.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Feature / Service"
                    className="flex-1 p-2 border border-gray-200 rounded-lg text-sm"
                    value={item.item}
                    onChange={(e) => handleUpdateCostItem(idx, 'item', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    className="w-24 p-2 border border-gray-200 rounded-lg text-sm"
                    value={item.price}
                    onChange={(e) => handleUpdateCostItem(idx, 'price', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCostItem(idx)}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Timeline</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-200 rounded-lg"
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost (₹)</label>
                <input
                  type="number"
                  readOnly
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-blue-600"
                  value={formData.totalCost}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Save size={20} />
              {isLoading ? 'Saving...' : 'Save Quotation'}
            </button>
          </form>
        )}
      </div>

      {/* Right: Preview */}
      <div className="bg-gray-100 p-8 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
        <div className="bg-white w-full max-w-md p-8 shadow-2xl rounded-lg text-gray-800 scale-90 origin-top">
          <div className="border-b-2 border-blue-500 pb-4 mb-6">
            <h1 className="text-2xl font-bold">QUOTATION</h1>
            <p className="text-xs text-gray-400">PROTOTYPE PREVIEW</p>
          </div>
          
          <div className="mb-4 text-sm">
            <p><strong>Client:</strong> {formData.clientName || '---'}</p>
            <p><strong>Project:</strong> {formData.projectName || '---'}</p>
          </div>
          
          <div className="mb-6">
            <div className="text-xs font-bold uppercase text-blue-500 mb-1">Overview</div>
            <p className="text-xs line-clamp-3">{formData.overview || 'Project description will appear here...'}</p>
          </div>
          
          <table className="w-full text-xs mb-6">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left py-2">Item</th>
                <th className="text-right py-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {formData.costBreakdown.length > 0 ? formData.costBreakdown.slice(0, 5).map((item, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2">{item.item || '---'}</td>
                  <td className="py-2 text-right">₹{item.price?.toLocaleString() || '0'}</td>
                </tr>
              )) : (
                <tr><td colSpan={2} className="py-4 text-center text-gray-300">No items added</td></tr>
              )}
            </tbody>
          </table>
          
          <div className="text-right font-bold text-blue-600 text-lg">
            Total: ₹{formData.totalCost?.toLocaleString()}
          </div>
        </div>
        <p className="mt-4 text-sm">Live Preview (Scale: 90%)</p>
      </div>
    </div>
  );
};

export default CreateQuotation;
