import React from 'react';

export const EchoVerseLogo = ({ className = 'w-6 h-6', ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Eighth note */}
    <path d="M40 70 C 40 40, 50 20, 60 20 C 70 20, 80 30, 80 40 C 80 50, 70 60, 60 60 C 50 60, 40 70, 40 70" fill="currentColor" />
    <rect x="58" y="20" width="6" height="40" rx="2" fill="currentColor" />
    <path d="M64 20 Q 80 20, 80 35" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    {/* Saturn ring */}
    <ellipse cx="60" cy="40" rx="30" ry="10" transform="rotate(-20 60 40)" stroke="currentColor" strokeWidth="4" />
  </svg>
);

export default EchoVerseLogo;
