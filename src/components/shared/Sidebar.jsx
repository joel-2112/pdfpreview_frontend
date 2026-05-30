import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Database, FileSpreadsheet } from 'lucide-react';

export const Sidebar = () => {
  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/documents', label: 'My Documents', icon: FolderOpen },
    { to: '/autofill', label: 'Autofill', icon: Database },
    { to: '/field-mappings', label: 'Field Mappings', icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 space-y-2 md:sticky md:top-16 md:h-[calc(100vh-4rem)]">
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
        Navigation
      </div>
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white border border-transparent'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;