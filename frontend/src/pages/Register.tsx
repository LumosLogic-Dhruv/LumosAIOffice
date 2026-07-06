import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Building2, ArrowRight, CheckCircle2, UserPlus } from 'lucide-react';
import Logo from '../components/Logo';

const baseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().optional(),
});

const schemaWithCompany = baseSchema.extend({
  companyName: z.string().min(1, 'Company name is required'),
});

type FormData = {
  name: string;
  email: string;
  password: string;
  companyName?: string;
};

const Register = () => {
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite') || '';
  const isInvite = !!inviteCode;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(isInvite ? baseSchema : schemaWithCompany),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      companyName: isInvite ? 'invited' : '',
    },
  });

  useEffect(() => {
    if (isInvite) {
      reset((prev) => ({ ...prev, companyName: 'invited' }));
    }
  }, [isInvite, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const payload: any = { ...data };
      if (isInvite) {
        payload.inviteCode = inviteCode;
        payload.companyName = 'invited';
      }
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <User size={12} /> Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] outline-none transition-all bg-gray-50 font-medium text-gray-700 text-sm"
                  {...register('name')}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              {!isInvite && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Building2 size={12} /> Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="Acme Corp"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] outline-none transition-all bg-gray-50 font-medium text-gray-700 text-sm"
                    {...register('companyName')}
                  />
                  {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Mail size={12} /> Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] outline-none transition-all bg-gray-50 font-medium text-gray-700 text-sm"
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Lock size={12} /> Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] outline-none transition-all bg-gray-50 font-medium text-gray-700 text-sm"
                  {...register('password')}
                />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

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
                    <span>{isInvite ? 'Join Team' : 'Create Account'}</span>
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
