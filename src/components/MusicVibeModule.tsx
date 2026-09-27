import React, { useState } from "react";
import { Sparkles, Compass, AlertCircle, Volume2, Key, Waves, Layers } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { UserProfile, VibeContent } from "../types";

interface MusicVibeModuleProps {
  userProfile: UserProfile | null;
  onProjectSaved: () => void;
  creationCount: number;
  onTriggerUpgrade: () => void;
}

export default function MusicVibeModule({ userProfile, onProjectSaved, creationCount, onTriggerUpgrade }: MusicVibeModuleProps) {
  const [vibe, setVibe] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VibeContent | null>(null);

  const maxCreations = userProfile?.plan === "free" ? 5 : userProfile?.plan === "creator" ? 50 : Infinity;
  const limitsReached = creationCount >= maxCreations;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vibe.trim()) return;

    if (limitsReached) {
      onTriggerUpgrade();
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const statuses = [
      "Decomposing vibe acoustics...",
      "Assigning emotional BPM vectors...",
      "Generating sound synthesis presets...",
      "Mapping audio textures...",
      "Charting the visual mood progression..."
    ];

    let i = 0;
    setStatusText(statuses[0]);
    const loaderInterval = setInterval(() => {
      i = (i + 1) % statuses.length;
      setStatusText(statuses[i]);
    }, 2000);

    try {
      const response = await fetch("/api/generate/music-from-vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data: VibeContent = await response.json();
      setResult(data);

      if (userProfile) {
        const projectId = "vibe_" + Date.now();
        const projectDoc = {
          projectId,
          uid: userProfile.uid,
          // wait, let's keep it sync'ed to 'video' or 'song'. User limits details:
          // "Free plan: 5 songs, 2 videos, 3 Quran videos, 5 presentations per month"
          // Oh, "music from idea" lists video limits! Let's classify vibe as "video" or "song" depending on how user logs it, 
          // let's write user limit checks carefully. User limits maps 4 project types: "song | video | quran | slides"
          // So user says limit has: "5 songs (Module 1), 2 videos (Module 2), 3 Quran videos (Module 3), 5 presentations (Module 4)"
          // So "vibe" is indeed "video"! Let's classify it as type "video"
          type: "video",
          inputData: { vibe },
          aiOutput: data,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "projects", projectId), projectDoc);
        onProjectSaved();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during dynamic sound design.");
    } finally {
      clearInterval(loaderInterval);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Compass className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans">Music Vibe Sound Designer</h2>
              <p className="text-xs text-neutral-400">Transform raw vibes, descriptions, moods or visual scenes into structural ambient soundscapes</p>
            </div>
          </div>
          <span className="font-mono text-xs text-neutral-500 bg-neutral-900/80 px-2.5 py-1 rounded-md border border-neutral-800/50">
            Quota: {creationCount} / {maxCreations === Infinity ? "Unlimited" : maxCreations} Used
          </span>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase font-mono">Bespoke Concept or Mood Scene</label>
            <textarea
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="Describe the feeling, scene or aesthetic. E.g. 'A futuristic cyberpunk alleyway under heavy neon pink rain, glowing puddles, slow slow cyber bass pulse with moody sax echoes...'"
              rows={5}
              disabled={loading}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-sans transition-all resize-y"
            />
          </div>

          <div className="flex justify-between items-center bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/40">
            <span className="text-xs text-neutral-400">
              {limitsReached ? (
                <span className="text-amber-400 font-bold">Monthly video quota exceeded. Please upgrade.</span>
              ) : (
                "Translates abstract scenery definitions into solid synthesis instructions."
              )}
            </span>
            <button
              type="submit"
              disabled={loading || !vibe.trim()}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                loading || !vibe.trim()
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  : limitsReached
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
                  : "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/10 cursor-pointer"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : limitsReached ? (
                "Upgrade Workspace"
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Soundscape</span>
                </>
              )}
            </button>
          </div>
        </form>

        {loading && (
          <div className="mt-8 flex flex-col items-center justify-center p-12 border border-dashed border-neutral-800 rounded-xl bg-neutral-950/40 relative">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin mb-4" />
            <p className="text-sm font-semibold text-white animate-pulse">{statusText}</p>
            <p className="text-xs text-neutral-500 mt-1">Standby, rendering frequency structures...</p>
          </div>
        )}

        {error && (
          <div className="mt-6 border border-rose-950 bg-rose-500/5 text-rose-400 p-4 rounded-xl text-xs flex flex-col gap-1">
            <span className="font-bold">Acoustic Logic Error:</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Heading */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-800/60">
            <div>
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded uppercase font-bold font-mono tracking-wider">
                ATMOSPHERE SPECIFICATION
              </span>
              <h3 className="text-xl font-bold text-white mt-1.5">{result.style}</h3>
              <p className="text-xs text-neutral-400">Environment Decays: {result.atmosphere}</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="block text-[10px] text-neutral-500 uppercase font-mono">BPM Target</span>
                <span className="text-lg font-bold font-mono text-white">{result.bpm}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] text-neutral-500 uppercase font-mono">Key Scale</span>
                <span className="text-lg font-bold font-mono text-amber-400">{result.key}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Field recordings and patches */}
            <div className="bg-neutral-950/40 p-4 rounded-xl border border-neutral-800/80">
              <div className="flex items-center gap-1.5 mb-3 border-b border-neutral-800/60 pb-2">
                <Waves className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Acoustic Textures</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.textures.map((txt, index) => (
                  <span key={index} className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-2.5 py-1 rounded-lg text-xs font-mono">
                    {txt}
                  </span>
                ))}
              </div>
            </div>

            {/* Core Synth/Acoustical Instruments */}
            <div className="bg-neutral-950/40 p-4 rounded-xl border border-neutral-800/80">
              <div className="flex items-center gap-1.5 mb-3 border-b border-neutral-800/60 pb-2">
                <Volume2 className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Focus Synthesizers / Audio Elements</h4>
              </div>
              <ul className="space-y-2 mt-2">
                {result.instruments.map((inst, idx) => (
                  <li key={idx} className="text-xs text-neutral-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Vibe progression map */}
          <div className="mt-6 bg-neutral-950/40 p-5 rounded-xl border border-neutral-800/80">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Layers className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Scenic Song Progression Arc</h4>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">{result.moodArc}</p>
          </div>

          {/* Vocals check */}
          <div className="mt-6 bg-neutral-950/40 p-5 rounded-xl border border-neutral-800/80">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Key className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Vocal Elements Integration</h4>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">{result.vocalsNeeded}</p>
          </div>

          {/* Action Trigger */}
          <div className="mt-6 border-t border-neutral-800/50 pt-5 flex items-center justify-between text-xs">
            <span className="text-amber-500 font-medium font-mono">{result.nextStep}</span>
            <span className="text-neutral-500">Workspace sync saved</span>
          </div>
        </div>
      )}
    </div>
  );
}
