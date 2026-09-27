import React from 'react';
import { Button } from './ui';

export const LandingNavbar = ({ onGetStarted }: any) => (
  <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-900">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <span className="text-emerald-500 font-bold">E</span>
        </div>
        <span className="text-xl font-bold text-white">EchoVerse</span>
      </div>
      <div className="hidden md:flex gap-8 text-sm text-neutral-400">
        <a href="#" className="hover:text-white transition-colors">Explore</a>
        <a href="#" className="hover:text-white transition-colors">Create</a>
        <a href="#" className="hover:text-white transition-colors">Templates</a>
        <a href="#" className="hover:text-white transition-colors">Features</a>
      </div>
      <div className="flex gap-4">
        <Button variant="outline" className="px-4 py-2 text-sm">Log in</Button>
        <Button variant="primary" className="px-4 py-2 text-sm" onClick={onGetStarted}>Get Started</Button>
      </div>
    </div>
  </nav>
);
