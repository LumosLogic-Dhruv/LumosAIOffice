import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Building2, Mail, Phone, MapPin, Globe, Fingerprint, Upload, Loader2, Save, Palette } from 'lucide-react';

const BRAND = '#714B67';

const COLOR_SLOTS = [
  { key: 'primary1', label: 'Primary Color 1', hint: 'Main brand color — used in headers and key elements' },
  { key: 'primary2', label: 'Primary Color 2', hint: 'Secondary brand accent color' },
  { key: 'secondary', label: 'Extra Color', hint: 'Supporting color for highlights or backgrounds' },
];

const DEFAULT_COLORS: Record<string, string> = {
  primary1: '#714B67',
  primary2: '#9B6B8F',
  secondary: '#E8D5E0',
};

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

  const getColor = (key: string): string =>
    profile?.colorTheme?.[key] || DEFAULT_COLORS[key];

  const setColor = (key: string, value: string) => {
    setProfile({
      ...profile,
      colorTheme: { ...(profile?.colorTheme || DEFAULT_COLORS), [key]: value },
    });
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

          {/* Brand Colors */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Palette size={14} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand Color Theme</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              These colors will be applied to all your generated documents — headers, section borders, and tables.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COLOR_SLOTS.map(({ key, label, hint }) => (
                <div key={key} className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500">{label}</label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={getColor(key)}
                        onChange={e => setColor(key, e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 p-0.5 bg-white"
                        title={label}
                      />
                    </div>
                    <input
                      type="text"
                      value={getColor(key)}
                      onChange={e => {
                        const val = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) setColor(key, val);
                      }}
                      maxLength={7}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 font-mono text-gray-700 focus:outline-none"
                      onFocus={e => e.target.style.borderColor = BRAND}
                      onBlur={e => e.target.style.borderColor = ''}
                      placeholder="#714B67"
                    />
                  </div>
                  <p className="text-xs text-gray-400 leading-tight">{hint}</p>
                </div>
              ))}
            </div>
            {/* Live preview strip */}
            <div className="mt-4 rounded-lg overflow-hidden border border-gray-100 flex h-8">
              {COLOR_SLOTS.map(({ key }) => (
                <div
                  key={key}
                  className="flex-1 transition-colors duration-200"
                  style={{ backgroundColor: getColor(key) }}
                  title={`${COLOR_SLOTS.find(s => s.key === key)?.label}: ${getColor(key)}`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Preview of your selected colors</p>
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
