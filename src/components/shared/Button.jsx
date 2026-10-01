import React from 'react';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium font-sans rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2 dark:focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer';
  
  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-500 text-white border-brand-500/50 hover:border-brand-400 shadow-md shadow-brand-600/25 hover:shadow-lg hover:shadow-brand-600/35 dark:shadow-brand-950/50',
    secondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700/80 shadow-sm',
    outline: 'bg-white/60 hover:bg-slate-100/90 dark:bg-slate-900/50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-300/90 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-transparent',
    danger: 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30',
    gradient: 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white border-transparent shadow-md shadow-brand-500/30 hover:shadow-brand-glow',
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
    sm: 'px-3.5 py-1.5 text-xs font-semibold gap-1.5 rounded-lg',
    md: 'px-4.5 py-2.5 text-sm font-medium gap-2 rounded-xl',
    lg: 'px-6 py-3 text-base font-semibold gap-2.5 rounded-xl',
  };

  const iconSizes = {
    xs: 'h-3.5 w-3.5',
    sm: 'h-4 w-4',
    md: 'h-4.5 w-4.5',
    lg: 'h-5 w-5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg className={`animate-spin ${iconSizes[size] || 'h-4 w-4'} text-current`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className={`${iconSizes[size] || 'h-4 w-4'} shrink-0`} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className={`${iconSizes[size] || 'h-4 w-4'} shrink-0`} />}
        </>
      )}
    </button>
  );
};

export default Button;