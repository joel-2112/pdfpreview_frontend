import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Mail, Lock, User, FileText, ArrowRight } from 'lucide-react';
import Button from '../components/shared/Button';
import ErrorMessage from '../components/shared/ErrorMessage';

export const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      {/* Outer Card */}
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-800 bg-slate-900/30 p-8 shadow-2xl backdrop-blur-md animate-slide-up">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 text-white shadow-xl shadow-brand-500/20 mb-4 animate-pulse">
            <FileText className="h-6.5 w-6.5" />
          </div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-white via-slate-200 to-brand-300 bg-clip-text text-transparent tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            {isLogin ? 'Sign in to access your PDF templates' : 'Register to manage form variable injections'}
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/40 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-brand-500 focus:bg-slate-950/60 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/40 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-brand-500 focus:bg-slate-950/60 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/40 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-brand-500 focus:bg-slate-950/60 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              loading={loading}
              className="w-full"
              icon={ArrowRight}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </div>
        </form>

        {/* Toggle Form type link */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
