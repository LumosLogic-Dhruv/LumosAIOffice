import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Lock, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

const schema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const newPassword = watch('newPassword', '');

  const strength =
    newPassword.length === 0 ? 0
    : newPassword.length < 8 ? 1
    : newPassword.length < 12 ? 2
    : 3;
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#22c55e'];

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <p className="text-gray-500 font-medium">Invalid or missing reset link.</p>
          <Link to="/forgot-password" className="font-black underline text-sm" style={{ color: '#714B67' }}>
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword: data.newPassword });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to reset password.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16" style={{ backgroundColor: '#714B67' }}>
        <Logo size="lg" onDark />
        <div className="space-y-6">
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
            Create a new<br />password.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed font-medium max-w-sm">
            Choose something strong. At least 8 characters with a mix of letters and numbers.
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
            {done ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle size={48} style={{ color: '#714B67' }} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Password Reset!</h2>
                <p className="text-gray-500 text-sm">
                  Your password has been changed successfully. Redirecting you to sign in...
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">New Password</h2>
                  <p className="text-gray-400 text-sm font-medium mt-1">Enter and confirm your new password</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Lock size={12} /> New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        className={`w-full px-4 py-3 pr-11 border rounded-xl focus:ring-2 outline-none transition-all bg-gray-50 font-medium text-gray-700 text-sm ${
                          errors.newPassword
                            ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                            : 'border-gray-200 focus:ring-[#714B67]/20 focus:border-[#714B67]'
                        }`}
                        {...register('newPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.newPassword ? (
                      <p className="text-xs text-red-500 font-semibold">{errors.newPassword.message}</p>
                    ) : newPassword.length > 0 ? (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3].map((level) => (
                            <div
                              key={level}
                              className="h-1 flex-1 rounded-full transition-all"
                              style={{ backgroundColor: strength >= level ? strengthColors[strength] : '#e5e7eb' }}
                            />
                          ))}
                        </div>
                        <p className="text-xs font-semibold" style={{ color: strengthColors[strength] }}>
                          {strengthLabels[strength]}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Lock size={12} /> Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        className={`w-full px-4 py-3 pr-11 border rounded-xl focus:ring-2 outline-none transition-all bg-gray-50 font-medium text-gray-700 text-sm ${
                          errors.confirmPassword
                            ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                            : 'border-gray-200 focus:ring-[#714B67]/20 focus:border-[#714B67]'
                        }`}
                        {...register('confirmPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500 font-semibold">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ backgroundColor: '#714B67' }}
                    className="w-full text-white py-3 rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-lg mt-2 flex items-center justify-center gap-2 disabled:opacity-60 group"
                  >
                    {isSubmitting ? (
                      <span>Resetting...</span>
                    ) : (
                      <>
                        <span>Reset Password</span>
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

export default ResetPassword;
