import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      login(response.data.token, response.data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel */}
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

      {/* Right panel */}
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Mail size={12} /> Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] outline-none transition-all bg-gray-50 font-medium text-gray-700 text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Lock size={12} /> Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] outline-none transition-all bg-gray-50 font-medium text-gray-700 text-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
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
