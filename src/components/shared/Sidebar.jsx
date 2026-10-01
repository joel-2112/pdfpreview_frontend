import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Database, FileSpreadsheet, ShieldCheck, Zap } from 'lucide-react';

export const Sidebar = () => {
  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { to: '/documents', label: 'Documents', icon: FolderOpen, badge: null },
    { to: '/autofill', label: 'Profile Autofill', icon: Database, badge: 'Live' },
    { to: '/field-mappings', label: 'Field Mappings', icon: FileSpreadsheet, badge: null },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 border-r border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-[#090e1a]/60 backdrop-blur-xl p-4 space-y-6 md:sticky md:top-16 md:h-[calc(100vh-4rem)] flex flex-col justify-between">
      <div className="space-y-4">
        <div className="px-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Core Workspaces
        </div>
        
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-50/90 dark:bg-brand-500/15 text-brand-600 dark:text-brand-300 font-semibold shadow-xs border border-brand-200/60 dark:border-brand-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                        isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`} />
                      <span>{link.label}</span>
                    </div>

                    {link.badge && (
                      <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300">
                        <Zap className="h-2.5 w-2.5 fill-current" />
                        <span>{link.badge}</span>
                      </span>
                    )}

                    {isActive && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand-600 dark:bg-brand-400 shadow-sm shadow-brand-500/50" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Engine Status Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-slate-900/50 p-3.5 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300">
              FillEngine v2.0
            </span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15 px-2 py-0.5 rounded-full">
            Ready
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
          AcroForm injection active. Dynamic XFA auto-detection enabled.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;