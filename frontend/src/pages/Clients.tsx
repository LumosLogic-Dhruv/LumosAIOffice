import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Users, Plus, Edit2, Trash2, Search, Mail, Phone, X, Save, Building2, Download } from 'lucide-react';
import { SkeletonCard } from '../components/SkeletonLoader';

const BRAND = '#714B67';

interface Client {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  notes?: string;
  createdAt: number;
}

const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  gstin: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', email: '', phone: '', address: '', gstin: '', notes: '' });
    setShowModal(true);
  };

  const openEdit = (c: Client) => {
    setEditing(c);
    reset({
      name: c.name,
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      gstin: c.gstin || '',
      notes: c.notes || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    reset();
  };

  const onSubmit = async (data: ClientFormData) => {
    setSaving(true);
    try {
      const payload: any = {};
      for (const [k, v] of Object.entries(data)) {
        if (v && String(v).trim()) payload[k] = String(v).trim();
      }
      if (editing) {
        const res = await api.put(`/clients/${editing._id}`, payload);
        setClients(clients.map(c => c._id === editing._id ? res.data : c));
        toast.success('Client updated');
      } else {
        const res = await api.post('/clients', payload);
        setClients([res.data, ...clients]);
        toast.success('Client added');
      }
      closeModal();
    } catch {
      toast.error('Failed to save client');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/clients/${deleteTarget._id}`);
      setClients(clients.filter(c => c._id !== deleteTarget._id));
      toast.success('Client deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = clients.filter(c =>
    c && typeof c === 'object' && (
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'GSTIN', 'Address', 'Notes'];
    const rows = filtered.map(c => [
      c.name || '',
      c.email || '',
      c.phone || '',
      c.gstin || '',
      c.address || '',
      c.notes || '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`));
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Clients</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Clients</h1>
          <p className="text-xs text-gray-400 mt-0.5">{clients.length} total clients</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Download size={15} />
            Export CSV
          </button>
          <button
            onClick={openCreate}
            style={{ backgroundColor: BRAND }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow"
          >
            <Plus size={15} />
            Add Client
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-[#714B67] transition-colors"
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <div className="p-4 bg-gray-50 rounded-xl inline-block mb-3">
            <Users size={32} className="text-gray-200" />
          </div>
          <p className="text-gray-400 text-sm">No clients found. Add your first client!</p>
          <button onClick={openCreate} style={{ backgroundColor: BRAND }} className="mt-4 px-5 py-2 text-white rounded-lg text-sm font-semibold shadow">
            Add Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c._id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: BRAND }}>
                    {(c.name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{c.name}</p>
                    {c.gstin && <p className="text-xs text-gray-400 font-mono">{c.gstin}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                {c.email && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Mail size={11} className="shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone size={11} className="shrink-0" />
                    <span>{c.phone}</span>
                  </div>
                )}
                {c.address && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Building2 size={11} className="shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">{editing ? 'Edit Client' : 'New Client'}</h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Name *</label>
                <input
                  type="text"
                  placeholder="Client or company name"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none transition-all bg-gray-50 focus:border-[#714B67]"
                  {...register('name')}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Email</label>
                <input
                  type="text"
                  placeholder="contact@example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none transition-all bg-gray-50 focus:border-[#714B67]"
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Phone</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none transition-all bg-gray-50 focus:border-[#714B67]"
                  {...register('phone')}
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">GSTIN</label>
                <input
                  type="text"
                  placeholder="GST or tax number"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none transition-all bg-gray-50 focus:border-[#714B67]"
                  {...register('gstin')}
                />
                {errors.gstin && <p className="text-xs text-red-500 mt-1">{errors.gstin.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Address</label>
                <input
                  type="text"
                  placeholder="Full address"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none transition-all bg-gray-50 focus:border-[#714B67]"
                  {...register('address')}
                />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Notes</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none transition-all bg-gray-50 h-20 resize-none focus:border-[#714B67]"
                  placeholder="Internal notes..."
                  {...register('notes')}
                />
                {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes.message}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ backgroundColor: BRAND }} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow">
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 text-center mb-1">Delete Client</h3>
              <p className="text-sm text-gray-500 text-center mb-1">
                Are you sure you want to delete <span className="font-semibold text-gray-800">{deleteTarget.name}</span>?
              </p>
              <p className="text-xs text-gray-400 text-center mb-6">This will permanently remove this client.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all shadow"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
