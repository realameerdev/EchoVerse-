import React, { useState } from "react";
import { Sparkles, Presentation, ChevronLeft, ChevronRight, MessageSquare, Play, RefreshCw, Layers } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { UserProfile, SlidesContent, Slide } from "../types";

interface PresentationModuleProps {
  userProfile: UserProfile | null;
  onProjectSaved: () => void;
  creationCount: number;
  onTriggerUpgrade: () => void;
}

export default function PresentationModule({ userProfile, onProjectSaved, creationCount, onTriggerUpgrade }: PresentationModuleProps) {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SlidesContent | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const maxCreations = userProfile?.plan === "free" ? 5 : Infinity; // Unlimited for Creator/Studio
  const limitsReached = creationCount >= maxCreations;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    if (limitsReached) {
      onTriggerUpgrade();
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setActiveSlideIndex(0);

    const statuses = [
      "Analyzing slide narrative structure...",
      "Drafting spoken hooks & CTAs...",
      "Formatting individual slide nodes...",
      "Mapping visual graphics to points...",
      "Injecting speaker note cues..."
    ];

    let i = 0;
    setStatusText(statuses[0]);
    const loaderInterval = setInterval(() => {
      i = (i + 1) % statuses.length;
      setStatusText(statuses[i]);
    }, 2000);

    try {
      const response = await fetch("/api/generate/presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, audience })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data: SlidesContent = await response.json();
      setResult(data);

      if (userProfile) {
        const projectId = "slides_" + Date.now();
        const projectDoc = {
          projectId,
          uid: userProfile.uid,
          type: "slides",
          inputData: { topic, audience },
          aiOutput: data,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "projects", projectId), projectDoc);
        onProjectSaved();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate structural deck blueprint.");
    } finally {
      clearInterval(loaderInterval);
      setLoading(false);
    }
  };

  const handlePrev = () => {
    if (!result) return;
    setActiveSlideIndex((prev) => (prev === 0 ? result.slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!result) return;
    setActiveSlideIndex((prev) => (prev === result.slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Presentation className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans">Slide Presentation Outline</h2>
              <p className="text-xs text-neutral-400">Map narrative slide decks with hooks, visual layouts, speaker guides, and slide counts</p>
            </div>
          </div>
          <span className="font-mono text-xs text-neutral-500 bg-neutral-900/80 px-2.5 py-1 rounded-md border border-neutral-800/50">
            Quota: {creationCount} / {maxCreations === Infinity ? "Unlimited" : maxCreations} Used
          </span>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase font-mono">Presentation Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="E.g. Q4 Startup Pitch, AI Safety Framework, Soil Ecology..."
                disabled={loading}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-sans transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase font-mono">Target Audience</label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="E.g. VC Investors, High Schoolers, Corporate Leads..."
                disabled={loading}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-sans transition-all"
              />
            </div>
          </div>

          <div className="flex justify-between items-center bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/40">
            <span className="text-xs text-neutral-400">
              {limitsReached ? (
                <span className="text-amber-400 font-bold">Monthly presentation quota hit. Please upgrade plan.</span>
              ) : (
                "Develops outline nodes, spoken cues and aesthetic layout advice."
              )}
            </span>
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                loading || !topic.trim()
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  : limitsReached
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
                  : "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/10 cursor-pointer"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Structuring...</span>
                </>
              ) : limitsReached ? (
                "Upgrade Workspace"
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Slideset</span>
                </>
              )}
            </button>
          </div>
        </form>

        {loading && (
          <div className="mt-8 flex flex-col items-center justify-center p-12 border border-dashed border-neutral-800 rounded-xl bg-neutral-950/40 relative">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin mb-4" />
            <p className="text-sm font-semibold text-white animate-pulse">{statusText}</p>
            <p className="text-xs text-neutral-500 mt-1">Standby, drafting rhetorical frameworks...</p>
          </div>
        )}

        {error && (
          <div className="mt-6 border border-rose-950 bg-rose-500/5 text-rose-400 p-4 rounded-xl text-xs flex flex-col gap-1">
            <span className="font-bold">Structure Defect Error:</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header metadata */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-800/60 mb-6">
            <div>
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded uppercase font-bold font-mono tracking-wider">
                DECK BLUEPRINT OUTLINE
              </span>
              <h3 className="text-xl font-bold text-white mt-1.5">Interactive Presentation Deck</h3>
              <p className="text-xs text-neutral-400">Pacing Index: {result.slideCountRecommendation}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg hover:border-neutral-700 hover:text-white transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs text-neutral-400">
                Slide {activeSlideIndex + 1} / {result.slides.length}
              </span>
              <button
                onClick={handleNext}
                className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg hover:border-neutral-700 hover:text-white transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Slide Visual Layout Container */}
            <div className="md:col-span-8 bg-neutral-950 border border-neutral-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative min-h-[320px]">
              {/* Dynamic decorative shapes resembling deck presentation */}
              <div className="absolute top-4 right-4 text-[10px] font-mono text-neutral-600 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                SLIDE {result.slides[activeSlideIndex].slideNumber}
              </div>

              <div>
                <h4 className="text-xl font-bold text-white tracking-tight leading-snug max-w-lg mb-6 border-l-4 border-amber-500 pl-3">
                  {result.slides[activeSlideIndex].title}
                </h4>

                <ul className="space-y-4">
                  {result.slides[activeSlideIndex].keyPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                      <span className="leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-neutral-800/40 pt-4 mt-6 flex justify-between items-center text-xs text-neutral-500 font-mono">
                <span>EchoVerse Outline Blueprint</span>
                <span>Audience Focus: {audience || "General"}</span>
              </div>
            </div>

            {/* Speaker Notes and Scenography panel */}
            <div className="md:col-span-4 space-y-4 flex flex-col justify-between">
              <div className="bg-neutral-950/40 p-4 border border-neutral-800/80 rounded-xl space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-800/60 pb-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                    <span>Presenter Vocal Guide</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed mt-2 italic font-sans">
                    "{result.slides[activeSlideIndex].speakerNotes}"
                  </p>
                </div>
              </div>

              <div className="bg-neutral-950/40 p-4 border border-neutral-800/80 rounded-xl space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-800/60 pb-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    <span>Recommended Graphics</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed mt-2 font-sans">
                    {result.slides[activeSlideIndex].suggestedVisuals}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hooks + Calls to actions footnotes */}
          <div className="mt-8 border-t border-neutral-800/50 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-950/40 p-4 rounded-xl border border-neutral-800">
              <h5 className="text-[10px] font-bold text-neutral-500 uppercase font-mono tracking-wider">OPENING PRESENTATION HOOK</h5>
              <p className="text-xs text-amber-400 font-medium leading-relaxed mt-1">"{result.openingHook}"</p>
            </div>
            <div className="bg-neutral-950/40 p-4 rounded-xl border border-neutral-800">
              <h5 className="text-[10px] font-bold text-neutral-500 uppercase font-mono tracking-wider">CLOSING CALL-TO-ACTION (CTA)</h5>
              <p className="text-xs text-neutral-300 font-medium leading-relaxed mt-1">"{result.closingCta}"</p>
            </div>
          </div>

          {/* Action footnote */}
          <div className="mt-6 border-t border-neutral-800/50 pt-5 flex items-center justify-between text-xs">
            <span className="text-amber-500 font-medium font-mono">{result.nextStep}</span>
            <span className="text-neutral-500">Presentation sync saved</span>
          </div>
        </div>
      )}
    </div>
  );
}
