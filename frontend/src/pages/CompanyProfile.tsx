import { useEffect, useState } from 'react';
import { z } from 'zod';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Building2, Mail, Phone, MapPin, Globe, Fingerprint,
  Upload, Loader2, Save, Palette, Lock, Eye, EyeOff,
  ShieldAlert, Trash2, FileText,
} from 'lucide-react';

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  website: z.string().refine((v) => !v || /^https?:\/\/.+/.test(v), { message: 'Enter a valid URL (e.g. https://example.com)' }),
  phone: z.string().optional(),
});

const pwSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const BRAND = '#714B67';

export function optimizeCloudinaryUrl(url: string, transforms = 'f_auto,q_auto,w_300'): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/${transforms}/`);
}

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

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={14} className="text-gray-400" />
    <div>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const CompanyProfile = () => {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [changingPw, setChangingPw] = useState(false);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [companyErrors, setCompanyErrors] = useState<Record<string, string>>({});

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteSection, setShowDeleteSection] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

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
    const result = companySchema.safeParse({
      name: profile?.name || '',
      email: profile?.email || '',
      website: profile?.website || '',
      phone: profile?.phone || '',
    });
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) errs[issue.path[0] as string] = issue.message;
      setCompanyErrors(errs);
      return;
    }
    setCompanyErrors({});
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = pwSchema.safeParse(pwForm);
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) errs[issue.path[0] as string] = issue.message;
      setPwErrors(errs);
      return;
    }
    setPwErrors({});
    setChangingPw(true);
    try {
      await api.post('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to change password.');
    } finally {
      setChangingPw(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') { toast.error('Please type DELETE to confirm.'); return; }
    setDeleting(true);
    try {
      await api.delete('/auth/account');
      toast.success('Account deleted.');
      logout();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  const getColor = (key: string): string => profile?.colorTheme?.[key] || DEFAULT_COLORS[key];
  const setColor = (key: string, value: string) => setProfile({
    ...profile,
    colorTheme: { ...(profile?.colorTheme || DEFAULT_COLORS), [key]: value },
  });

  const pwStrength = pwForm.newPassword.length === 0 ? 0 : pwForm.newPassword.length < 8 ? 1 : pwForm.newPassword.length < 12 ? 2 : 3;
  const strengthColor = ['', '#ef4444', '#f59e0b', '#22c55e'][pwStrength];

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }} />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Company Profile</h1>
        <p className="text-xs text-gray-400 mt-0.5">Manage your business identity and branding</p>
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-xl bg-white shadow-md border-2 border-white flex items-center justify-center overflow-hidden">
                {profile?.logoUrl
                  ? <img src={optimizeCloudinaryUrl(profile.logoUrl)} alt="Logo" className="w-full h-full object-contain p-1" />
                  : <Building2 size={28} className="text-gray-200" />}
                {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="text-white animate-spin" size={18} /></div>}
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
                <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5"><Icon size={12} />{label}</label>
                <input type={type}
                  className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all bg-gray-50 text-gray-700 ${companyErrors[key] ? 'border-red-400' : 'border-gray-200'}`}
                  onFocus={e => { if (!companyErrors[key]) e.target.style.borderColor = BRAND; }}
                  onBlur={e => { if (!companyErrors[key]) e.target.style.borderColor = ''; }}
                  value={profile?.[key] || ''}
                  onChange={(e) => { setProfile({ ...profile, [key]: e.target.value }); if (companyErrors[key]) setCompanyErrors(p => ({ ...p, [key]: '' })); }} />
                {companyErrors[key] && <p className="text-xs text-red-500 font-semibold">{companyErrors[key]}</p>}
              </div>
            ))}

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5"><MapPin size={12} />Office Address</label>
              <textarea className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none transition-all bg-gray-50 text-gray-700 h-20 resize-none"
                onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = ''}
                value={profile?.address || ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5"><FileText size={12} />Default Terms &amp; Conditions</label>
              <textarea className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none transition-all bg-gray-50 text-gray-700 h-28 resize-none"
                onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = ''}
                placeholder="These terms will be auto-applied to all new documents unless overridden..."
                value={profile?.defaultTerms || ''} onChange={(e) => setProfile({ ...profile, defaultTerms: e.target.value })} />
              <p className="text-xs text-gray-400">Applied automatically when creating new documents.</p>
            </div>
          </div>

          {/* Brand Colors */}
          <div className="pt-4 border-t border-gray-100">
            <SectionHeader icon={Palette} title="Brand Color Theme" />
            <p className="text-xs text-gray-400 mb-4">Applied to all generated document headers, borders, and tables.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COLOR_SLOTS.map(({ key, label, hint }) => (
                <div key={key} className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500">{label}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={getColor(key)} onChange={e => setColor(key, e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 p-0.5 bg-white" />
                    <input type="text" value={getColor(key)} onChange={e => { const v = e.target.value; if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setColor(key, v); }} maxLength={7}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 font-mono text-gray-700 focus:outline-none"
                      onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = ''} />
                  </div>
                  <p className="text-xs text-gray-400 leading-tight">{hint}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg overflow-hidden border border-gray-100 flex h-8">
              {COLOR_SLOTS.map(({ key }) => <div key={key} className="flex-1 transition-colors duration-200" style={{ backgroundColor: getColor(key) }} />)}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Preview of your selected colors</p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={updating} style={{ backgroundColor: BRAND }}
              className="px-6 py-2.5 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 shadow">
              {updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <SectionHeader icon={Lock} title="Security" subtitle="Update your account password" />
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          {([
            { key: 'currentPassword', label: 'Current Password', show: showPw.current, toggle: () => setShowPw(s => ({ ...s, current: !s.current })) },
            { key: 'newPassword', label: 'New Password', show: showPw.new, toggle: () => setShowPw(s => ({ ...s, new: !s.new })) },
            { key: 'confirmPassword', label: 'Confirm New Password', show: showPw.confirm, toggle: () => setShowPw(s => ({ ...s, confirm: !s.confirm })) },
          ] as any[]).map(({ key, label, show, toggle }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">{label}</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={(pwForm as any)[key]}
                  onChange={e => { setPwForm(f => ({ ...f, [key]: e.target.value })); if (pwErrors[key]) setPwErrors(p => ({ ...p, [key]: '' })); }}
                  className={`w-full px-3 py-2 pr-10 text-sm border rounded-lg outline-none bg-gray-50 text-gray-700 transition-all ${pwErrors[key] ? 'border-red-400' : 'border-gray-200'}`}
                  onFocus={e => { if (!pwErrors[key]) e.target.style.borderColor = BRAND; }}
                  onBlur={e => { if (!pwErrors[key]) e.target.style.borderColor = ''; }}
                  placeholder="••••••••" />
                <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {pwErrors[key] && <p className="text-xs text-red-500 font-semibold">{pwErrors[key]}</p>}
              {key === 'newPassword' && !pwErrors[key] && pwForm.newPassword.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3].map(l => <div key={l} className="h-1 flex-1 rounded-full transition-all" style={{ backgroundColor: pwStrength >= l ? strengthColor : '#e5e7eb' }} />)}
                </div>
              )}
            </div>
          ))}
          <button type="submit" disabled={changingPw} style={{ backgroundColor: BRAND }}
            className="px-5 py-2.5 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 shadow">
            {changingPw ? <Loader2 className="animate-spin" size={14} /> : <Lock size={14} />}
            Update Password
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
        <div className="flex items-center justify-between mb-2">
          <SectionHeader icon={ShieldAlert} title="Danger Zone" />
          <button onClick={() => setShowDeleteSection(v => !v)} className="text-xs text-red-500 font-semibold hover:underline">
            {showDeleteSection ? 'Hide' : 'Delete Account'}
          </button>
        </div>
        {showDeleteSection && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100 space-y-4">
            <div className="flex items-start gap-3">
              <Trash2 size={16} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700">Delete your account permanently</p>
                <p className="text-xs text-red-600 mt-1 leading-relaxed">This will delete your account and all associated data. This action <strong>cannot be undone</strong>.</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-red-600">Type <span className="font-mono bg-red-100 px-1 rounded">DELETE</span> to confirm</label>
              <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="DELETE"
                className="w-full px-3 py-2 text-sm border border-red-200 rounded-lg outline-none bg-white font-mono" />
            </div>
            <button onClick={handleDeleteAccount} disabled={deleting || deleteConfirm !== 'DELETE'}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-all disabled:opacity-40 flex items-center gap-2">
              {deleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
              Delete My Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProfile;
