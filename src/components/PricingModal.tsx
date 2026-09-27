import React from "react";
import { Sparkles, Check, X, ShieldCheck } from "lucide-react";
import { UserProfile, UserPlan } from "../types";
import { doc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onPlanUpdated: (newPlan: UserPlan) => void;
}

export default function PricingModal({ isOpen, onClose, userProfile, onPlanUpdated }: PricingModalProps) {
  if (!isOpen) return null;

  const handleSelectPlan = async (plan: UserPlan) => {
    if (!userProfile) return;
    try {
      const userRef = doc(db, "users", userProfile.uid);
      const updatedProfile = {
        ...userProfile,
        plan,
      };
      await setDoc(userRef, updatedProfile);
      onPlanUpdated(plan);
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${userProfile?.uid}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 hover:bg-neutral-800 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pricing Info Branding Column */}
        <div className="md:w-1/3 bg-radial from-amber-600/10 to-transparent p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <span className="font-mono text-xs font-bold text-amber-500 tracking-wider">ECHOVERSE HQ</span>
            </div>
            <h3 className="text-2xl font-bold font-sans text-white tracking-tight mb-3">Elevate Your Vibe</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Unlock the creative potential of EchoVerse. Perfect production plans, reverent scripts, and executive-level presentations.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-800/60 hidden md:block">
            <div className="flex items-center gap-3 text-xs text-neutral-400">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Full authorization. Secure checkout verified locally.</span>
            </div>
          </div>
        </div>

        {/* Plans Matrix */}
        <div className="md:w-2/3 p-8">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-6">Select a Production Workspace</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free Plan Card */}
            <div className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${userProfile?.plan === "free" ? "border-amber-500/50 bg-amber-500/5" : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"}`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-400 font-mono">FREE</span>
                  {userProfile?.plan === "free" && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase font-bold font-mono">ACTIVE</span>
                  )}
                </div>
                <div className="text-2xl font-bold text-white mb-4">$0 <span className="text-xs font-normal text-neutral-400">/mo</span></div>
                <ul className="space-y-2.5 text-xs text-neutral-400 mb-6">
                  <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> 5 Songs /mo</li>
                  <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> 2 Video concept /mo</li>
                  <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> 3 Quran scripts /mo</li>
                  <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> 5 Slidesets /mo</li>
                </ul>
              </div>
              <button
                disabled={userProfile?.plan === "free"}
                onClick={() => handleSelectPlan("free")}
                className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${userProfile?.plan === "free" ? "bg-neutral-800 text-neutral-500 cursor-not-allowed" : "bg-neutral-800 hover:bg-neutral-700 text-white"}`}
              >
                {userProfile?.plan === "free" ? "Current plan" : "Downgrade"}
              </button>
            </div>

            {/* Creator Plan Card */}
            <div className={`p-5 rounded-xl border flex flex-col justify-between transition-all relative ${userProfile?.plan === "creator" ? "border-amber-500 bg-amber-500/5 shadow-amber-500/10" : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"}`}>
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-neutral-950 font-bold font-mono text-[9px] px-2.5 py-0.5 rounded-inner w-xs max-w-full text-center tracking-wide rounded-full">POPULAR WORKSPACE</div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 font-mono">CREATOR</span>
                  {userProfile?.plan === "creator" && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase font-bold font-mono">ACTIVE</span>
                  )}
                </div>
                <div className="text-2xl font-bold text-white mb-4">$19 <span className="text-xs font-normal text-neutral-400">/mo</span></div>
                <ul className="space-y-2.5 text-xs text-neutral-300 mb-6">
                  <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" /> 50 Songs /mo</li>
                  <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" /> 20 Videos /mo</li>
                  <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" /> Unlimited Quran</li>
                  <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" /> Unlimited Slides</li>
                </ul>
              </div>
              <button
                disabled={userProfile?.plan === "creator"}
                onClick={() => handleSelectPlan("creator")}
                className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${userProfile?.plan === "creator" ? "bg-neutral-800 text-neutral-500 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold"}`}
              >
                {userProfile?.plan === "creator" ? "Current plan" : "Upgrade to Creator"}
              </button>
            </div>

            {/* Studio Plan Card */}
            <div className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${userProfile?.plan === "studio" ? "border-amber-500/50 bg-amber-500/5" : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"}`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-400 font-mono">STUDIO</span>
                  {userProfile?.plan === "studio" && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase font-bold font-mono">ACTIVE</span>
                  )}
                </div>
                <div className="text-2xl font-bold text-white mb-4">$49 <span className="text-xs font-normal text-neutral-400">/mo</span></div>
                <ul className="space-y-2.5 text-xs text-neutral-400 mb-6">
                  <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Unlimited everything</li>
                  <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Team Workspace</li>
                  <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Dedicated platform support</li>
                  <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> API Token access</li>
                </ul>
              </div>
              <button
                disabled={userProfile?.plan === "studio"}
                onClick={() => handleSelectPlan("studio")}
                className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${userProfile?.plan === "studio" ? "bg-neutral-800 text-neutral-500 cursor-not-allowed" : "bg-neutral-800 hover:bg-neutral-700 text-white"}`}
              >
                {userProfile?.plan === "studio" ? "Current plan" : "Upgrade to Studio"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
