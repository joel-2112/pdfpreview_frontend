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
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-brand-600 border-brand-500 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/20 hover:shadow-brand-500/30',
    secondary: 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-200',
    danger: 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 text-red-400',
    outline: 'bg-transparent border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4.5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg className="mr-2 h-4 w-4 animate-spin text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="mr-2 h-4.5 w-4.5 shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
