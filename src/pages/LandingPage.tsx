import React from 'react';
import { Button, Card } from '../components/ui';
import { EchoVerseLogo } from '../components/EchoVerseLogo';
import { Sparkles, Zap, Layers, Compass, Heart, Presentation, ArrowRight, Play } from 'lucide-react';

export default function LandingPage({ onGetStarted }: any) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased selection:bg-emerald-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-neutral-950/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EchoVerseLogo className="w-8 h-8 text-emerald-500" />
            <span className="text-xl font-bold text-white tracking-tight">EchoVerse</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-neutral-400">
            {['Explore', 'Create', 'Templates', 'Features'].map(item => (
              <a key={item} href="#" className="hover:text-emerald-400 transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="text-sm px-5 py-2">Log in</Button>
            <Button variant="primary" className="text-sm px-5 py-2" onClick={onGetStarted}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-neutral-950 to-neutral-950 -z-10" />
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-semibold mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Creative Platform</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tighter max-w-4xl mx-auto">
          Create. Reflect. <span className="text-emerald-500">Resonate.</span>
        </h1>
        <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Turn verses, reminders, and ideas into beautiful audio and visual experiences with EchoVerse.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={onGetStarted} className="px-8 py-3 text-base flex items-center gap-2">
            Start Creating <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="secondary" className="px-8 py-3 text-base">Explore EchoVerse</Button>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-24 px-6 bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16 tracking-tight">Everything you need to create with meaning.</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'AI Creative Studio', icon: Zap, desc: 'Turn ideas and verses into polished creative content.' },
              { title: 'Islamic Templates', icon: Layers, desc: 'Ready-to-use designs for reminders, verses, and more.' },
              { title: 'Audio Soundscapes', icon: Compass, desc: 'Atmospheric audio tailored to your vision and mood.' },
              { title: 'Visual Generator', icon: Heart, desc: 'Create stunning visuals for Quranic verses.' }
            ].map(feat => (
              <Card key={feat.title} className="hover:border-emerald-500/30 transition-all duration-300">
                <feat.icon className="w-10 h-10 text-emerald-500 mb-6" />
                <h3 className="text-xl font-semibold text-white mb-3">{feat.title}</h3>
                <p className="text-neutral-400 leading-relaxed text-sm">{feat.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-emerald-950/30 border border-emerald-900/50 rounded-3xl p-12 text-center backdrop-blur-md">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to create something beautiful?</h2>
          <p className="text-neutral-300 mb-10 text-lg">Join EchoVerse today and bring your creative vision to life.</p>
          <Button onClick={onGetStarted} className="px-10 py-4 text-lg">Get Started Now</Button>
        </div>
      </section>
    </div>
  );
}
