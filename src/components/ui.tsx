import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const base = "px-6 py-2.5 rounded-full font-medium transition-all duration-200 active:scale-95";
  const variants: any = {
    primary: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20",
    secondary: "bg-neutral-800 hover:bg-neutral-700 text-white",
    outline: "border border-neutral-700 hover:border-neutral-500 text-neutral-300"
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

export const Card = ({ children, className = '' }: any) => (
  <div className={`bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);
