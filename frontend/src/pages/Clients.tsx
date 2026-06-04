import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Users, Plus, Edit2, Trash2, Search, Mail, Phone, X, Save, Building2 } from 'lucide-react';

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

const emptyForm = { name: '', email: '', phone: '', address: '', gstin: '', notes: '' };

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

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

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c: Client) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '', gstin: c.gstin || '', notes: c.notes || '' });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const payload: any = {};
      for (const [k, v] of Object.entries(form)) { if (v.trim()) payload[k] = v.trim(); }
      if (editing) {
        const res = await api.put(`/clients/${editing._id}`, payload);
        setClients(clients.map(c => c._id === editing._id ? res.data : c));
        toast.success('Client updated');
      } else {
        const res = await api.post('/clients', payload);
        setClients([res.data, ...clients]);
        toast.success('Client added');
      }
      setShowModal(false);
    } catch {
      toast.error('Failed to save client');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete client "${name}"?`)) return;
    try {
      await api.delete(`/clients/${id}`);
      setClients(clients.filter(c => c._id !== id));
      toast.success('Client deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = clients.filter(c =>
    c && typeof c === 'object' && (
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-xl font-bold text-gray-900">Clients</h1>
          <p className="text-xs text-gray-400 mt-0.5">{clients.length} total clients</p>
        </div>
        <button
          onClick={openCreate}
          style={{ backgroundColor: BRAND }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow"
        >
          <Plus size={15} />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-[#714B67] transition-colors"
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
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
                  <button onClick={() => handleDelete(c._id, c.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">{editing ? 'Edit Client' : 'New Client'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {[
                { label: 'Name *', key: 'name', placeholder: 'Client or company name' },
                { label: 'Email', key: 'email', placeholder: 'contact@example.com' },
                { label: 'Phone', key: 'phone', placeholder: '+91 98765 43210' },
                { label: 'GSTIN', key: 'gstin', placeholder: 'GST or tax number' },
                { label: 'Address', key: 'address', placeholder: 'Full address' },
              ].map(({ label, key, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none transition-all bg-gray-50"
                    onFocus={e => e.target.style.borderColor = BRAND}
                    onBlur={e => e.target.style.borderColor = ''}
                    value={(form as any)[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    required={key === 'name'}
                  />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Notes</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none transition-all bg-gray-50 h-20 resize-none"
                  onFocus={e => e.target.style.borderColor = BRAND}
                  onBlur={e => e.target.style.borderColor = ''}
                  placeholder="Internal notes..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
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
    </div>
  );
};

export default Clients;
