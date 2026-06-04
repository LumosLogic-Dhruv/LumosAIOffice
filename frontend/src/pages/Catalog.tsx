import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { BookOpen, Plus, Edit2, Trash2, Search, Tag, X, Save, DollarSign } from 'lucide-react';

const BRAND = '#714B67';

interface CatalogItem {
  _id: string;
  name: string;
  description?: string;
  unit?: string;
  rate: number;
  category?: string;
  createdAt: number;
}

const emptyForm = { name: '', description: '', unit: '', rate: '', category: '' };

const Catalog = () => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get('/catalog');
      setItems(res.data);
    } catch {
      toast.error('Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (item: CatalogItem) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description || '', unit: item.unit || '', rate: String(item.rate), category: item.category || '' });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.rate || isNaN(parseFloat(form.rate))) return toast.error('Valid rate is required');
    setSaving(true);
    try {
      const payload: any = { name: form.name.trim(), rate: parseFloat(form.rate) };
      if (form.description.trim()) payload.description = form.description.trim();
      if (form.unit.trim()) payload.unit = form.unit.trim();
      if (form.category.trim()) payload.category = form.category.trim();
      if (editing) {
        const res = await api.put(`/catalog/${editing._id}`, payload);
        setItems(items.map(i => i._id === editing._id ? res.data : i));
        toast.success('Item updated');
      } else {
        const res = await api.post('/catalog', payload);
        setItems([res.data, ...items]);
        toast.success('Item added');
      }
      setShowModal(false);
    } catch {
      toast.error('Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/catalog/${id}`);
      setItems(items.filter(i => i._id !== id));
      toast.success('Item deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
  const filtered = items.filter(i =>
    i && typeof i === 'object' && (
      (i.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.category || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }} />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-xs text-gray-400 mt-0.5">{items.length} items · {categories.length} categories</p>
        </div>
        <button
          onClick={openCreate}
          style={{ backgroundColor: BRAND }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow"
        >
          <Plus size={15} />
          Add Item
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-[#714B67] transition-colors"
          placeholder="Search catalog..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <div className="p-4 bg-gray-50 rounded-xl inline-block mb-3">
            <BookOpen size={32} className="text-gray-200" />
          </div>
          <p className="text-gray-400 text-sm">No items in catalog. Add your first product or service!</p>
          <button onClick={openCreate} style={{ backgroundColor: BRAND }} className="mt-4 px-5 py-2 text-white rounded-lg text-sm font-semibold shadow">
            Add Item
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-left">Unit</th>
                <th className="px-5 py-3 text-right">Rate</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(item => (
                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    {item.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{item.description}</p>}
                  </td>
                  <td className="px-5 py-3">
                    {item.category ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: `${BRAND}10`, color: BRAND }}>
                        <Tag size={10} />
                        {item.category}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{item.unit || '—'}</td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-900">
                    ₹{(item.rate ?? 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(item._id, item.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">{editing ? 'Edit Item' : 'New Catalog Item'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Name *</label>
                <input type="text" placeholder="e.g., Web Development" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50" onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = ''} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Description</label>
                <textarea className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 h-16 resize-none" onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = ''} placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Rate (₹) *</label>
                  <input type="number" step="0.01" min="0" placeholder="0.00" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50" onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = ''} value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Unit</label>
                  <input type="text" placeholder="hr, day, unit..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50" onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = ''} value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Category</label>
                <input type="text" placeholder="e.g., Development, Design, Support" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50" onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = ''} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} list="categories-list" />
                <datalist id="categories-list">
                  {categories.map(c => <option key={c} value={c!} />)}
                </datalist>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
                <button type="submit" disabled={saving} style={{ backgroundColor: BRAND }} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow">
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
