import React from 'react';
import { Button } from '../components/ui';
import { EchoVerseLogo } from '../components/EchoVerseLogo';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function LandingPage({ onGetStarted }: any) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-serif antialiased">
      {/* Minimal Navbar */}
      <nav className="px-6 py-8 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <EchoVerseLogo className="w-8 h-8 text-[#C5A059]" />
          <span className="text-xl font-bold tracking-tight">EchoVerse</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-[#555]">
          <a href="#" className="hover:text-[#C5A059] transition-colors">Explore</a>
          <button onClick={onGetStarted} className="text-[#1A1A1A] hover:text-[#C5A059] transition-colors">Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-32 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-block mb-8 px-4 py-1.5 border border-[#E5E0D7] rounded-full text-xs uppercase tracking-widest text-[#888]">
            AI-Powered Creative Platform
        </div>
        <h1 className="text-6xl md:text-7xl font-light mb-10 tracking-tight">
          Create. Reflect. <span className="italic text-[#C5A059]">Resonate.</span>
        </h1>
        <p className="text-xl md:text-2xl text-[#666] mb-12 leading-relaxed max-w-2xl mx-auto">
          Turn verses, reminders, and ideas into beautiful audio and visual experiences.
        </p>
        <Button 
          onClick={onGetStarted} 
          className="bg-[#1A1A1A] text-white px-10 py-4 rounded-none hover:bg-[#333] transition-colors flex items-center gap-2 mx-auto"
        >
          Begin Your Journey <ArrowRight className="w-4 h-4" />
        </Button>
      </section>
      
      {/* Capabilities */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-light mb-16 text-center">How EchoVerse Empowers You</h2>
          <div className="grid md:grid-cols-2 gap-12">
            {[
              { title: 'Song from Lyrics', desc: 'Transform your lyrics into complete production blueprints with genre, mood, and instrumentation.' },
              { title: 'Music from Idea', desc: 'Describe a vibe or concept, and receive a tailored music style, BPM, and atmospheric texture.' },
              { title: 'Quran Video Generator', desc: 'Craft meaningful visual content featuring Quranic verses, complete with translation and suggested imagery.' },
              { title: 'Presentation Generator', desc: 'Outline impactful presentations with slide-by-slide structures, speaker notes, and visual cues.' }
            ].map((cap, i) => (
              <div key={i} className="border-t border-[#E5E0D7] pt-8">
                <h3 className="text-xl font-medium mb-3">{cap.title}</h3>
                <p className="text-[#666] leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-[#F5F2EE]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-light mb-16">Simple, transparent plans</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Free', price: '$0', features: ['Basic Generative AI', 'Limited Projects'] },
              { name: 'Creator', price: '$19', features: ['Advanced AI Models', 'Unlimited Projects', 'Priority Support'] },
              { name: 'Studio', price: '$49', features: ['Enterprise AI Models', 'Collaboration Tools', 'Custom Branding'] }
            ].map((plan, i) => (
              <div key={i} className="border border-[#E5E0D7] p-8 bg-white">
                <h3 className="text-lg font-medium mb-2">{plan.name}</h3>
                <div className="text-4xl font-light mb-6">{plan.price}<span className="text-sm text-[#888]">/mo</span></div>
                <ul className="text-sm text-[#666] space-y-3 mb-8">
                  {plan.features.map((f, j) => <li key={j}>{f}</li>)}
                </ul>
                <Button variant="outline" className="w-full">Choose {plan.name}</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-light mb-16 text-center">Frequently asked questions</h2>
          <div className="space-y-8">
            {[
              { q: 'Can I use EchoVerse commercially?', a: 'Yes, all projects generated on paid plans can be used for commercial purposes.' },
              { q: 'What AI models are used?', a: 'We use advanced generative models tailored specifically for creative and Islamic-inspired content.' }
            ].map((faq, i) => (
              <div key={i} className="border-b border-[#E5E0D7] pb-8">
                <h3 className="text-lg font-medium mb-2">{faq.q}</h3>
                <p className="text-[#666]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#E5E0D7] text-center text-sm text-[#888]">
        <div className="flex items-center justify-center gap-2 mb-6">
          <EchoVerseLogo className="w-6 h-6 text-[#C5A059]" />
          <span className="font-bold">EchoVerse</span>
        </div>
        <p>&copy; 2026 EchoVerse AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
