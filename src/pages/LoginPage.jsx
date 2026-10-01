import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Mail, Lock, User, FileText, ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle2, Sparkles, FileCheck, Layers } from 'lucide-react';
import Button from '../components/shared/Button';
import ErrorMessage from '../components/shared/ErrorMessage';

export const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Ambient background decoration */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-brand-600/15 via-indigo-500/10 to-transparent rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-10 w-[500px] h-[400px] bg-gradient-to-tl from-cyan-500/10 via-brand-500/5 to-transparent rounded-full blur-3xl" />

      <div className="relative w-full max-w-md space-y-6">
        
        {/* Top brand icon & header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-brand-500/25">
            <FileText className="h-7 w-7" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              PDF FillEngine
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Enterprise Dynamic AcroForm & Profile Injection Platform
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 dark:border-white/[0.09] space-y-6 animate-slide-up">
          
          {/* Segmented Auth Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                isLogin
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                !isLogin
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && <ErrorMessage message={error} />}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="glass-input block w-full rounded-xl py-2.5 pl-10 pr-4 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="glass-input block w-full rounded-xl py-2.5 pl-10 pr-4 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input block w-full rounded-xl py-2.5 pl-10 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                loading={loading}
                className="w-full py-3"
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
              >
                {isLogin ? 'Sign In to Workspace' : 'Get Started Free'}
              </Button>
            </div>
          </form>

          {/* Features highlights */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2">
            <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>256-bit encrypted secure PDF variable mapping</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
              <Layers className="h-3.5 w-3.5 text-brand-500 shrink-0" />
              <span>Full AcroForm parsing & dynamic XFA detection</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          PDF FillEngine Architecture • Protected Session
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

