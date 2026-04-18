import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Building2, Mail, Phone, MapPin, Globe, Fingerprint, Upload, Loader2, Save, Check } from 'lucide-react';

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
    } catch (error) {
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
    } catch (error) {
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
      toast.success('Logo updated successfully');
    } catch (error) {
      toast.error('Logo upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#714B67' }}></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Company Profile</h1>
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mt-2">Manage your business identity</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        {/* Banner/Header */}
        <div className="h-32 bg-gray-50/50 border-b border-gray-100 relative">
          <div className="absolute -bottom-12 left-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-white shadow-xl border-4 border-white flex items-center justify-center overflow-hidden">
                {profile?.logoUrl ? (
                  <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <Building2 size={40} className="text-gray-200" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="text-white animate-spin" />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 p-3 text-white rounded-2xl cursor-pointer shadow-xl hover:scale-110 transition-all" style={{ backgroundColor: '#714B67' }}>
                <Upload size={18} strokeWidth={3} />
                <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
              </label>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-12 pt-20 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                <Building2 size={14} className="mr-2" /> Company Name
              </label>
              <input
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-gray-50/50 font-bold text-gray-700"
                value={profile?.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                <Mail size={14} className="mr-2" /> Business Email
              </label>
              <input
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-gray-50/50 font-bold text-gray-700"
                value={profile?.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                <Phone size={14} className="mr-2" /> Contact Phone
              </label>
              <input
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-gray-50/50 font-bold text-gray-700"
                value={profile?.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                <Globe size={14} className="mr-2" /> Website URL
              </label>
              <input
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-gray-50/50 font-bold text-gray-700"
                value={profile?.website || ''}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              />
            </div>
            <div className="space-y-3 md:col-span-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                <MapPin size={14} className="mr-2" /> Office Address
              </label>
              <textarea
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-gray-50/50 font-bold text-gray-700 h-32 resize-none"
                value={profile?.address || ''}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                <Fingerprint size={14} className="mr-2" /> GST / TAX Number
              </label>
              <input
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-gray-50/50 font-bold text-gray-700"
                value={profile?.gstNumber || ''}
                onChange={(e) => setProfile({ ...profile, gstNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-10 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={updating}
              style={{ backgroundColor: '#714B67' }}
              className="px-12 py-5 text-white rounded-[20px] font-black text-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center space-x-3 shadow-xl shadow-primary/20"
            >
              {updating ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <Save size={24} />
              )}
              <span>SAVE PROFILE CHANGES</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
