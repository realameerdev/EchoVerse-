import React from 'react';
import { Button } from '../components/ui';
import { EchoVerseLogo } from '../components/EchoVerseLogo';
import { Sparkles, Zap, Layers, Compass, Heart, Presentation } from 'lucide-react';

export default function LandingPage({ onGetStarted }: any) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EchoVerseLogo className="w-8 h-8 text-emerald-500" />
            <span className="text-xl font-bold text-white tracking-tight">EchoVerse</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm text-neutral-400">
            {['Explore', 'Create', 'Templates', 'Features'].map(item => (
                <a key={item} href="#" className="hover:text-emerald-400 transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="px-4 py-2 text-sm">Log in</Button>
            <Button variant="primary" className="px-4 py-2 text-sm" onClick={onGetStarted}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Creative Platform</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight max-w-4xl mx-auto">Create. Reflect. Resonate.</h1>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Turn verses, reminders, and ideas into beautiful audio and visual experiences with EchoVerse.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={onGetStarted}>Start Creating</Button>
          <Button variant="secondary">Explore EchoVerse</Button>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-16">Everything you need to create with meaning.</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: 'AI Creative Studio', icon: Zap, desc: 'Turn ideas and verses into polished creative content.' },
            { title: 'Islamic Templates', icon: Layers, desc: 'Ready-to-use designs for reminders, verses, and more.' },
            { title: 'Audio Soundscapes', icon: Compass, desc: 'Atmospheric audio tailored to your vision and mood.' },
            { title: 'Visual Generator', icon: Heart, desc: 'Create stunning visuals for Quranic verses.' }
          ].map(feat => (
            <div key={feat.title} className="bg-neutral-900/50 rounded-3xl p-8 border border-neutral-800 hover:border-emerald-500/30 transition-all">
              <feat.icon className="w-8 h-8 text-emerald-500 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">{feat.title}</h3>
              <p className="text-neutral-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
