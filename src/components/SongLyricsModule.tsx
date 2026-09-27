import React, { useState } from "react";
import { Music, Play, Pause, Sparkles, Layers, ListMusic, Drum, ClipboardList } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { UserProfile, SongContent } from "../types";

interface SongLyricsModuleProps {
  userProfile: UserProfile | null;
  onProjectSaved: () => void;
  creationCount: number;
  onTriggerUpgrade: () => void;
}

export default function SongLyricsModule({ userProfile, onProjectSaved, creationCount, onTriggerUpgrade }: SongLyricsModuleProps) {
  const [lyrics, setLyrics] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SongContent | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [timerRef, setTimerRef] = useState<any>(null);

  // Checks limits based on plan
  const maxCreations = userProfile?.plan === "free" ? 5 : userProfile?.plan === "creator" ? 50 : Infinity;
  const limitsReached = creationCount >= maxCreations;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lyrics.trim()) return;

    if (limitsReached) {
      onTriggerUpgrade();
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setIsPlaying(false);
    setPlaybackProgress(0);

    const statuses = [
      "Analyzing poetic themes...",
      "Syncing lyric segments...",
      "Synthesizing key structure and BPM...",
      "Assigning instrumentation list...",
      "Polishing production mix notes..."
    ];

    let i = 0;
    setStatusText(statuses[0]);
    const loaderInterval = setInterval(() => {
      i = (i + 1) % statuses.length;
      setStatusText(statuses[i]);
    }, 2000);

    try {
      const response = await fetch("/api/generate/song-from-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lyrics })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data: SongContent = await response.json();
      setResult(data);

      // Save to projects collection
      if (userProfile) {
        const projectId = "song_" + Date.now();
        const projectDoc = {
          projectId,
          uid: userProfile.uid,
          type: "song",
          inputData: { lyrics },
          aiOutput: data,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "projects", projectId), projectDoc);
        onProjectSaved();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during plan composition.");
    } finally {
      clearInterval(loaderInterval);
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      clearInterval(timerRef);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const interval = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
      setTimerRef(interval);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Music className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans">Song Production from Lyrics</h2>
              <p className="text-xs text-neutral-400">Generate fully customized acoustic plans, tempos, keys and structural segments</p>
            </div>
          </div>
          <span className="font-mono text-xs text-neutral-500 bg-neutral-900/80 px-2.5 py-1 rounded-md border border-neutral-800/50">
            Quota: {creationCount} / {maxCreations === Infinity ? "Unlimited" : maxCreations} Used
          </span>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase font-mono">Original Composition Lyrics</label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Paste or write your raw lyrics here. Prompt with style cues if you wish, e.g. [Chorus: high energy]"
              rows={6}
              disabled={loading}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-sans transition-all resize-y"
            />
          </div>

          <div className="flex justify-between items-center bg-neutral-950/40 p-1 md:p-3 rounded-lg border border-neutral-800/40">
            <span className="text-xs text-neutral-400">
              {limitsReached ? (
                <span className="text-amber-400 font-bold">Monthly quota exceeded. Please upgrade.</span>
              ) : (
                "Each plan includes bespoke sound layering and structure guides."
              )}
            </span>
            <button
              type="submit"
              disabled={loading || !lyrics.trim()}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                loading || !lyrics.trim()
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  : limitsReached
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
                  : "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/10 cursor-pointer"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : limitsReached ? (
                "Upgrade to Unlock Quota"
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Complete Plan</span>
                </>
              )}
            </button>
          </div>
        </form>

        {loading && (
          <div className="mt-8 flex flex-col items-center justify-center p-12 border border-dashed border-neutral-800 rounded-xl bg-neutral-950/40 relative">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin mb-4" />
            <p className="text-sm font-semibold text-white animate-pulse">{statusText}</p>
            <p className="text-xs text-neutral-500 mt-1">Standby, composing digital textures...</p>
          </div>
        )}

        {error && (
          <div className="mt-6 border border-rose-950 bg-rose-500/5 text-rose-400 p-4 rounded-xl text-xs flex flex-col gap-1">
            <span className="font-bold">Error Composing Project:</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-800/60">
            <div>
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded uppercase font-bold font-mono tracking-wider">
                COMPOSER SCORECARD
              </span>
              <h3 className="text-xl font-bold text-white mt-1.5">{result.genre}</h3>
              <p className="text-xs text-neutral-400">Emotional Resonance: {result.mood}</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="block text-[10px] text-neutral-500 uppercase font-mono">BPM</span>
                <span className="text-lg font-bold font-mono text-white">{result.bpm}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] text-neutral-500 uppercase font-mono">SCALE</span>
                <span className="text-lg font-bold font-mono text-amber-400">{result.key}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] text-neutral-500 uppercase font-mono">LENGTH</span>
                <span className="text-lg font-bold font-mono text-white">{result.duration}</span>
              </div>
            </div>
          </div>

          {/* Interactive Player Simulation */}
          <div className="my-6 bg-neutral-950 p-4 rounded-xl border border-neutral-800/80 flex items-center gap-4">
            <button
              onClick={togglePlayback}
              className="bg-amber-500 hover:bg-amber-400 text-neutral-950 p-3 rounded-full transition-transform active:scale-95 shrink-0"
              aria-label={isPlaying ? "Pause playback" : "Play playback"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-neutral-950 text-neutral-950" /> : <Play className="w-5 h-5 fill-neutral-950 text-neutral-950" />}
            </button>
            <div className="flex-1">
              <div className="flex justify-between items-center text-xs text-neutral-400 mb-1">
                <span>EchoVerse Simulator ({isPlaying ? "Audition Active" : "Stale Preview"})</span>
                <span>{result.bpm} BPM Beats</span>
              </div>
              <div className="h-6 flex items-center justify-between gap-1 bg-neutral-900 px-2 rounded overflow-hidden">
                {Array.from({ length: 48 }).map((_, idx) => {
                  const isActive = (idx / 48) * 100 <= playbackProgress;
                  const randomHeight = Math.sin((idx + playbackProgress / 5)) * 8 + 12;
                  return (
                    <div
                      key={idx}
                      style={{ height: `${Math.max(4, randomHeight)}px` }}
                      className={`w-[3px] rounded-full transition-colors duration-200 ${
                        isActive ? "bg-amber-500" : "bg-neutral-800"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Instrumentation Sheet */}
            <div className="bg-neutral-950/40 p-4 rounded-xl border border-neutral-800/80">
              <div className="flex items-center gap-1.5 mb-3 border-b border-neutral-800/60 pb-2">
                <Drum className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Arranger's Layers</h4>
              </div>
              <ul className="space-y-2 mt-2">
                {result.instruments.map((inst, index) => (
                  <li key={index} className="text-xs text-neutral-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Struct Node map */}
            <div className="bg-neutral-950/40 p-4 rounded-xl border border-neutral-800/80">
              <div className="flex items-center gap-1.5 mb-3 border-b border-neutral-800/60 pb-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Composition Map</h4>
              </div>
              <div className="space-y-3">
                {result.structure.map((sect, sIndex) => (
                  <div key={sIndex} className="flex items-start gap-2 text-xs">
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono flex items-center justify-center text-amber-500 shrink-0">
                        {sIndex + 1}
                      </div>
                      {sIndex < result.structure.length - 1 && (
                        <div className="w-px h-6 bg-neutral-800 my-0.5" />
                      )}
                    </div>
                    <span className="text-neutral-300 pt-0.5 leading-tight">{sect}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mixing Guidelines */}
          <div className="mt-6 bg-neutral-950/40 p-5 rounded-xl border border-neutral-800/80">
            <div className="flex items-center gap-1.5 mb-2.5">
              <ClipboardList className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Producer/Mixer Notes</h4>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">{result.producerNotes}</p>
          </div>

          {/* Action Trigger */}
          <div className="mt-6 border-t border-neutral-800/50 pt-5 flex items-center justify-between text-xs">
            <span className="text-amber-500 font-medium font-mono">{result.nextStep}</span>
            <span className="text-neutral-500">Plan saved successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
}
