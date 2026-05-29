import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, FileText, LogOut, User as UserIcon } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight transition-all hover:opacity-90">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-400 text-white shadow-lg shadow-brand-500/20">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-sans font-bold text-slate-900 dark:text-white">
                PDF FillEngine
              </span>
            </Link>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 px-4 py-1.5 transition-all hover:bg-slate-50 dark:hover:bg-slate-950/60">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
              </div>
              <button onClick={toggleTheme} className="flex items-center rounded-lg border border-slate-300 dark:border-slate-850 bg-slate-100 dark:bg-slate-850 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button onClick={handleLogout} className="flex items-center space-x-1.5 rounded-lg border border-slate-300 dark:border-slate-850 bg-slate-100 dark:bg-slate-850 px-3.5 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-red-200 dark:hover:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;