import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Building2, ArrowRight, CheckCircle2, UserPlus } from 'lucide-react';
import Logo from '../components/Logo';

const Register = () => {
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite') || '';
  const isInvite = !!inviteCode;

  const [formData, setFormData] = useState({ name: '', email: '', password: '', companyName: isInvite ? 'invited' : '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (isInvite) {
      setFormData(prev => ({ ...prev, companyName: 'invited' }));
    }
  }, [isInvite]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { ...formData };
      if (isInvite) payload.inviteCode = inviteCode;
      const response = await api.post('/auth/register', payload);
      login(response.data.token, response.data);
      toast.success(isInvite ? 'Joined team successfully!' : 'Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Unlimited AI Document Generations',
    'Cloudinary PDF Storage',
    'Multi-tenant Data Isolation',
    'Version History & Restore',
  ];

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16" style={{ backgroundColor: '#714B67' }}>
        <Logo size="lg" onDark />

        <div className="space-y-8">
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
            Scale your docs<br />with AI.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed font-medium max-w-sm">
            Automate your business workflows, generate professional documents, and focus on what truly matters.
          </p>
          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <span className="font-semibold text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-white/30 text-xs font-semibold">© 2026 DocuFlow AI</p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10 flex justify-center">
            <Logo size="lg" />
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
            <div className="mb-8">
              {isInvite ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus size={20} style={{ color: '#714B67' }} />
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Join Team</h2>
                  </div>
                  <p className="text-gray-400 text-sm font-medium">You've been invited to join a company on DocuFlow AI.</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create Account</h2>
                  <p className="text-gray-400 text-sm font-medium mt-1">Register your company — free during beta</p>
                </>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {([
                { icon: User, label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe' },
                ...(!isInvite ? [{ icon: Building2, label: 'Company Name', key: 'companyName', type: 'text', placeholder: 'Acme Corp' }] : []),
                { icon: Mail, label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@company.com' },
                { icon: Lock, label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
              ] as Array<{icon: any; label: string; key: string; type: string; placeholder: string}>).map(({ icon: Icon, label, key, type, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Icon size={12} /> {label}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] outline-none transition-all bg-gray-50 font-medium text-gray-700 text-sm"
                    value={formData[key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    required
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: '#714B67' }}
                className="w-full text-white py-3 rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-lg mt-2 flex items-center justify-center gap-2 disabled:opacity-60 group"
              >
                {loading ? (
                  <span>{isInvite ? 'Joining team...' : 'Creating account...'}</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-black hover:underline" style={{ color: '#714B67' }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 font-semibold transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
