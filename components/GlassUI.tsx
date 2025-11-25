import React from 'react';

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-glass-200 backdrop-blur-md border border-glass-100 rounded-2xl shadow-xl ${className}`}>
    {children}
  </div>
);

export const GlassButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' | 'ghost' }> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600/80 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/30 border border-blue-400/30",
    danger: "bg-red-500/80 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/30 border border-red-400/30",
    ghost: "bg-glass-100 hover:bg-glass-200 text-white border border-glass-100 hover:border-glass-300"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const GlassInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input 
    className={`w-full bg-glass-100 border border-glass-200 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${className}`} 
    {...props} 
  />
);
