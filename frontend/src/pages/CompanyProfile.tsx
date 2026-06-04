import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Building2, Mail, Phone, MapPin, Globe, Fingerprint, Upload, Loader2, Save } from 'lucide-react';

const BRAND = '#714B67';

const CompanyProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/company');
      setProfile(response.data);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put('/company/update', profile);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append('logo', e.target.files[0]);
    setUploading(true);
    try {
      const response = await api.put('/company/logo', formData);
      setProfile(response.data);
      toast.success('Logo updated');
    } catch {
      toast.error('Logo upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }}></div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Company Profile</h1>
        <p className="text-xs text-gray-400 mt-0.5">Manage your business identity and branding</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-xl bg-white shadow-md border-2 border-white flex items-center justify-center overflow-hidden">
                {profile?.logoUrl ? (
                  <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <Building2 size={28} className="text-gray-200" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="text-white animate-spin" size={18} />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 p-1.5 text-white rounded-lg cursor-pointer shadow-md hover:opacity-90 transition-all" style={{ backgroundColor: BRAND }}>
                <Upload size={12} strokeWidth={3} />
                <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
              </label>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="px-6 pt-14 pb-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {[
              { icon: Building2, label: 'Company Name', key: 'name', type: 'text' },
              { icon: Mail, label: 'Business Email', key: 'email', type: 'email' },
              { icon: Phone, label: 'Contact Phone', key: 'phone', type: 'tel' },
              { icon: Globe, label: 'Website URL', key: 'website', type: 'url' },
              { icon: Fingerprint, label: 'GST / TAX Number', key: 'gstNumber', type: 'text' },
            ].map(({ icon: Icon, label, key, type }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                  <Icon size={12} />
                  {label}
                </label>
                <input
                  type={type}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all bg-gray-50 text-gray-700"
                  style={{ '--tw-ring-color': `${BRAND}30` } as any}
                  onFocus={e => e.target.style.borderColor = BRAND}
                  onBlur={e => e.target.style.borderColor = ''}
                  value={profile?.[key] || ''}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                />
              </div>
            ))}

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                <MapPin size={12} />
                Office Address
              </label>
              <textarea
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 outline-none transition-all bg-gray-50 text-gray-700 h-20 resize-none"
                onFocus={e => e.target.style.borderColor = BRAND}
                onBlur={e => e.target.style.borderColor = ''}
                value={profile?.address || ''}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={updating}
              style={{ backgroundColor: BRAND }}
              className="px-6 py-2.5 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 shadow"
            >
              {updating ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Save size={16} />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
