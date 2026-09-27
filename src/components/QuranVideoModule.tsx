import React, { useState } from "react";
import { Sparkles, Calendar, Heart, Eye, Copy, Share2, Clipboard, Radio } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { UserProfile, QuranContent } from "../types";

interface QuranVideoModuleProps {
  userProfile: UserProfile | null;
  onProjectSaved: () => void;
  creationCount: number;
  onTriggerUpgrade: () => void;
}

export default function QuranVideoModule({ userProfile, onProjectSaved, creationCount, onTriggerUpgrade }: QuranVideoModuleProps) {
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuranContent | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  const maxCreations = userProfile?.plan === "free" ? 3 : Infinity; // Unlimited for Creator/Studio
  const limitsReached = creationCount >= maxCreations;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) return;

    if (limitsReached) {
      onTriggerUpgrade();
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const statuses = [
      "Querying theological indexes...",
      "Extracting genuine Quranic ayah...",
      "Verifying Surah citations...",
      "Formatting Arabic calligraphy...",
      "Drafting cinematographic scenography..."
    ];

    let i = 0;
    setStatusText(statuses[0]);
    const loaderInterval = setInterval(() => {
      i = (i + 1) % statuses.length;
      setStatusText(statuses[i]);
    }, 2000);

    try {
      const response = await fetch("/api/generate/quran-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data: QuranContent = await response.json();
      setResult(data);

      if (userProfile) {
        const projectId = "quran_" + Date.now();
        const projectDoc = {
          projectId,
          uid: userProfile.uid,
          type: "quran",
          inputData: { theme },
          aiOutput: data,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "projects", projectId), projectDoc);
        onProjectSaved();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to query the holy verse concept script.");
    } finally {
      clearInterval(loaderInterval);
      setLoading(false);
    }
  };

  const copyCaption = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.caption);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Heart className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans">Quran Verse Video Script Generator</h2>
              <p className="text-xs text-neutral-400">Locate accurate Quran passages for a topic and compose social video cinematography layouts</p>
            </div>
          </div>
          <span className="font-mono text-xs text-neutral-500 bg-neutral-900/80 px-2.5 py-1 rounded-md border border-neutral-800/50">
            Quota: {creationCount} / {maxCreations === Infinity ? "Unlimited" : maxCreations} Used
          </span>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase font-mono">Video Theme or Moral Topic</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="E.g. Gratitude, Patience, Sunrise, Mercy, Resilience, Wisdom..."
              disabled={loading}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-sans transition-all"
            />
          </div>

          <div className="flex justify-between items-center bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/40">
            <span className="text-xs text-neutral-400">
              {limitsReached ? (
                <span className="text-amber-400 font-bold">Monthly Quran video limit hit. Please upgrade plan.</span>
              ) : (
                "Treats sacred content with reverence. Never fabricates translations or Arabic glyphs."
              )}
            </span>
            <button
              type="submit"
              disabled={loading || !theme.trim()}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                loading || !theme.trim()
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  : limitsReached
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
                  : "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/10 cursor-pointer"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Researching...</span>
                </>
              ) : limitsReached ? (
                "Unlock Unlimited"
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Quran Visuals</span>
                </>
              )}
            </button>
          </div>
        </form>

        {loading && (
          <div className="mt-8 flex flex-col items-center justify-center p-12 border border-dashed border-neutral-800 rounded-xl bg-neutral-950/40 relative">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin mb-4" />
            <p className="text-sm font-semibold text-white animate-pulse">{statusText}</p>
            <p className="text-xs text-neutral-500 mt-1">Maintaining reverence, looking up authentic Quranic corpus...</p>
          </div>
        )}

        {error && (
          <div className="mt-6 border border-rose-950 bg-rose-500/5 text-rose-400 p-4 rounded-xl text-xs flex flex-col gap-1">
            <span className="font-bold">Sacred Reference Logic Error:</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Ayah Header */}
          <div className="pb-5 border-b border-neutral-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded uppercase font-bold font-mono tracking-wider">
                QURAN REFERENCE
              </span>
              <h3 className="text-xl font-bold text-white mt-1.5">Surah {result.surah}</h3>
              <p className="text-xs text-neutral-400">Chapter {result.number}, Verse (Ayah) {result.ayah}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-500 font-mono">REFERENCE ID</span>
              <div className="text-amber-400 font-bold font-mono">{result.number}:{result.ayah}</div>
            </div>
          </div>

          {/* Calligraphy display card */}
          <div className="my-6 bg-neutral-950 p-8 rounded-xl border border-amber-500/15 text-center relative max-h-[400px] overflow-y-auto">
            {/* Calligraphy ornament details */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-amber-500/25" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-amber-500/25" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-amber-500/25" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-amber-500/25" />

            <div className="text-2xl md:text-3xl font-bold font-sans text-amber-100 leading-loose tracking-wide my-4 select-all text-right dir-rtl font-serif">
              {result.arabic}
            </div>

            <div className="text-xs text-neutral-400 italic mb-4 font-sans select-all selection:bg-amber-500/20">
              "{result.transliteration}"
            </div>

            <div className="text-sm text-neutral-200 mt-4 max-w-2xl mx-auto leading-relaxed border-t border-neutral-800/50 pt-4 font-sans select-all select-none">
              “{result.translation}”
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Visual scenography directives */}
            <div className="bg-neutral-950/40 p-4 rounded-xl border border-neutral-800/80">
              <div className="flex items-center gap-1.5 mb-3 border-b border-neutral-800/60 pb-2">
                <Eye className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Cinematography & Visual Style</h4>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">{result.visualStyle}</p>
            </div>

            {/* Scenery directives */}
            <div className="bg-neutral-950/40 p-4 rounded-xl border border-neutral-800/80">
              <div className="flex items-center gap-1.5 mb-3 border-b border-neutral-800/60 pb-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Scenic scapes & Background</h4>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">{result.background}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Reciter check */}
            <div className="bg-neutral-950/40 p-4 rounded-xl border border-neutral-800/80">
              <div className="flex items-center gap-1.5 mb-3 border-b border-neutral-800/60 pb-2">
                <Radio className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Voice-Over / Reciter Style</h4>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">{result.reciterStyle}</p>
            </div>

            {/* Caption copy trigger block */}
            <div className="bg-neutral-950/40 p-4 rounded-xl border border-neutral-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-neutral-800/60">
                  <Share2 className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Social Caption Template</h4>
                </div>
                <p className="text-xs text-neutral-400 line-clamp-3 mb-3">{result.caption}</p>
              </div>
              <button
                onClick={copyCaption}
                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800/60 hover:border-neutral-700 rounded-lg text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Clipboard className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-500" />
                    <span>Copy Full Caption</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Next Step */}
          <div className="mt-6 border-t border-neutral-800/50 pt-5 flex items-center justify-between text-xs">
            <span className="text-amber-500 font-medium font-mono">{result.nextStep}</span>
            <span className="text-neutral-500">Sacred reference synced</span>
          </div>
        </div>
      )}
    </div>
  );
}
