import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setUnverified(false);
    setLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      login(response.data.token, response.data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      if (detail === 'EMAIL_NOT_VERIFIED') {
        setUnverified(true);
      } else {
        toast.error(detail || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const email = getValues('email');
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success('Verification email sent! Please check your inbox.');
    } catch {
      toast.error('Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16" style={{ backgroundColor: '#714B67' }}>
        <Logo size="lg" onDark />

        <div className="space-y-8">
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
            Welcome back to<br />DocuFlow AI.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed font-medium max-w-sm">
            Sign in to access your dashboard, manage documents, and generate new ones with Gemini AI.
          </p>

          <div className="bg-white/10 border border-white/20 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
                <Sparkles size={20} style={{ color: '#714B67' }} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">AI-Powered Generation</p>
                <p className="text-white/50 text-xs">Gemini 2.5 Flash engine</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-white/10 rounded-full w-full" />
              <div className="h-2 bg-white/10 rounded-full w-3/4" />
              <div className="h-2 bg-white/10 rounded-full w-1/2" />
            </div>
          </div>
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
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sign In</h2>
              <p className="text-gray-400 text-sm font-medium mt-1">Enter your credentials to continue</p>
            </div>

            {unverified && (
              <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 text-sm font-semibold mb-1">Email not verified</p>
                <p className="text-amber-700 text-xs leading-relaxed mb-3">
                  Please verify your email before signing in. Check your inbox for the verification link.
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="text-xs font-black underline text-amber-800 disabled:opacity-60"
                >
                  {resending ? 'Sending...' : 'Resend verification email'}
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Lock size={12} /> Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-black hover:underline"
                    style={{ color: '#714B67' }}
                  >
                    Forgot password?
                  </Link>
                </div>
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
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="font-black hover:underline" style={{ color: '#714B67' }}>
                  Create one
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

export default Login;
