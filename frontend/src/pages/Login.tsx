import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Sparkles, Layout } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', formData);
      login(response.data.token, response.data);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Visual/Marketing */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-20" style={{ backgroundColor: '#714B67' }}>
        <div className="max-w-md">
          <div className="inline-flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-full mb-8 font-medium">
            <Layout size={18} />
            <span>Modern Document Management</span>
          </div>
          <h1 className="text-6xl font-black text-white mb-8 tracking-tight leading-none">
            Welcome <br /> back to <br /> AI Office.
          </h1>
          <p className="text-xl text-white/70 leading-relaxed mb-12">
            Access your dashboard, manage your documents, and generate new ones with the power of Gemini AI.
          </p>
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
             <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary font-black text-xl">
                  AI
                </div>
                <div>
                   <p className="text-white font-bold">Smart Automation</p>
                   <p className="text-white/50 text-sm font-medium">Processing your data...</p>
                </div>
             </div>
             <div className="space-y-3">
                <div className="h-2 bg-white/10 rounded-full w-full" />
                <div className="h-2 bg-white/10 rounded-full w-3/4" />
                <div className="h-2 bg-white/10 rounded-full w-1/2" />
             </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50/50 relative">
        <Link 
          to="/" 
          className="absolute top-8 right-8 flex items-center space-x-2 text-gray-400 hover:text-primary transition-colors font-black uppercase text-xs tracking-widest"
        >
          <ArrowRight size={14} className="rotate-180" />
          <span>Back to Home</span>
        </Link>
        <div className="w-full max-w-md bg-white p-12 rounded-[40px] shadow-2xl shadow-primary/5 border border-gray-100">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Login</h2>
            <p className="text-gray-400 font-bold mt-2 uppercase text-xs tracking-widest">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                <Mail size={14} className="mr-2" /> Email Address
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-gray-50/50 font-bold text-gray-700"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                <Lock size={14} className="mr-2" /> Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-gray-50/50 font-bold text-gray-700"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              style={{ backgroundColor: '#714B67' }}
              className="w-full text-white p-5 rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/20 mt-4 flex items-center justify-center space-x-2 group"
            >
              <span>SIGN IN</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-gray-500 font-medium">
              Don't have an account? <Link to="/register" className="font-black hover:underline" style={{ color: '#714B67' }}>Create one here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
