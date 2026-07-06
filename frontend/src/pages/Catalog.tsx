import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import toast from 'react-hot-toast';
import { BookOpen, Plus, Edit2, Trash2, Search, Tag, X, Save } from 'lucide-react';

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

const catalogSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  rate: z
    .string()
    .min(1, 'Rate is required')
    .refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, { message: 'Rate must be a positive number' }),
  description: z.string().optional(),
  unit: z.string().optional(),
  category: z.string().optional(),
});

type CatalogFormData = z.infer<typeof catalogSchema>;

const Catalog = () => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CatalogFormData>({
    resolver: zodResolver(catalogSchema),
  });

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

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', description: '', unit: '', rate: '', category: '' });
    setShowModal(true);
  };

  const openEdit = (item: CatalogItem) => {
    setEditing(item);
    reset({
      name: item.name,
      description: item.description || '',
      unit: item.unit || '',
      rate: String(item.rate),
      category: item.category || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    reset();
  };

  const onSubmit = async (data: CatalogFormData) => {
    setSaving(true);
    try {
      const payload: any = { name: data.name.trim(), rate: parseFloat(data.rate) };
      if (data.description?.trim()) payload.description = data.description.trim();
      if (data.unit?.trim()) payload.unit = data.unit.trim();
      if (data.category?.trim()) payload.category = data.category.trim();

      if (editing) {
        const res = await api.put(`/catalog/${editing._id}`, payload);
        setItems(items.map(i => i._id === editing._id ? res.data : i));
        toast.success('Item updated');
      } else {
        const res = await api.post('/catalog', payload);
        setItems([res.data, ...items]);
        toast.success('Item added');
      }
      closeModal();
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

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-[#714B67] transition-colors"
          placeholder="Search catalog..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

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

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">{editing ? 'Edit Item' : 'New Catalog Item'}</h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Web Development"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 focus:border-[#714B67]"
                  {...register('name')}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Description</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 h-16 resize-none focus:border-[#714B67]"
                  placeholder="Brief description..."
                  {...register('description')}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Rate (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 focus:border-[#714B67]"
                    {...register('rate')}
                  />
                  {errors.rate && <p className="text-xs text-red-500 mt-1">{errors.rate.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Unit</label>
                  <input
                    type="text"
                    placeholder="hr, day, unit..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 focus:border-[#714B67]"
                    {...register('unit')}
                  />
                  {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Category</label>
                <input
                  type="text"
                  placeholder="e.g., Development, Design, Support"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 focus:border-[#714B67]"
                  list="categories-list"
                  {...register('category')}
                />
                <datalist id="categories-list">
                  {categories.map(c => <option key={c} value={c!} />)}
                </datalist>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
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
