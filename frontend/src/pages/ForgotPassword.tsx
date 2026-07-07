import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});
type FormData = z.infer<typeof schema>;

const ForgotPassword = () => {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSentEmail(data.email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16" style={{ backgroundColor: '#714B67' }}>
        <Logo size="lg" onDark />
        <div className="space-y-6">
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
            Forgot your<br />password?
          </h1>
          <p className="text-white/70 text-lg leading-relaxed font-medium max-w-sm">
            No worries. Enter your email and we'll send you a secure link to reset it instantly.
          </p>
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
            {sent ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle size={48} style={{ color: '#714B67' }} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Check your inbox</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  If an account exists for <strong>{sentEmail}</strong>, we've sent a password reset link.
                  The link expires in <strong>1 hour</strong>.
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Didn't receive it? Check your spam folder or{' '}
                  <button
                    onClick={() => setSent(false)}
                    className="font-black underline"
                    style={{ color: '#714B67' }}
                  >
                    try again
                  </button>.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Reset Password</h2>
                  <p className="text-gray-400 text-sm font-medium mt-1">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Mail size={12} /> Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none transition-all bg-gray-50 font-medium text-gray-700 text-sm ${
                        errors.email
                          ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                          : 'border-gray-200 focus:ring-[#714B67]/20 focus:border-[#714B67]'
                      }`}
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 font-semibold">{errors.email.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ backgroundColor: '#714B67' }}
                    className="w-full text-white py-3 rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-lg mt-2 flex items-center justify-center gap-2 disabled:opacity-60 group"
                  >
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <Link to="/login" className="text-sm font-black hover:underline" style={{ color: '#714B67' }}>
                ← Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
