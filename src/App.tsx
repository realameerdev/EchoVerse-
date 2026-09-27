import React, { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { UserProfile, Project, UserPlan } from "./types";
import LandingPage from "./pages/LandingPage";

// Dynamic Sub-Modules
import SongLyricsModule from "./components/SongLyricsModule";
import MusicVibeModule from "./components/MusicVibeModule";
import QuranVideoModule from "./components/QuranVideoModule";
import PresentationModule from "./components/PresentationModule";
import PricingModal from "./components/PricingModal";
import EchoVerseLogo from "./components/EchoVerseLogo";

// Icons
import {
  Music,
  Compass,
  Heart,
  Presentation,
  LogOut,
  Sparkles,
  Layers,
  History,
  Trash2,
  ExternalLink,
  ChevronRight,
  User,
  Zap,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<"song" | "video" | "quran" | "slides">("song");
  const [inspectionProject, setInspectionProject] = useState<Project | null>(null);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Bind Firebase Authentication state change listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (srvUser) => {
      setLoadingAuth(true);
      setErrorText(null);
      if (srvUser) {
        setUser(srvUser);
        // Direct read/check on profiles
        try {
          const userRef = doc(db, "users", srvUser.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            const newProfile: UserProfile = {
              uid: srvUser.uid,
              name: srvUser.displayName || "EchoVerse Creator",
              email: srvUser.email || "",
              plan: "free",
              createdAt: new Date().toISOString(),
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          } else {
            setProfile(userSnap.data() as UserProfile);
          }

          // Attach real-time Firestore sync on user document
          const unsubUser = onSnapshot(userRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
              setProfile(docSnapshot.data() as UserProfile);
            }
          });

          // Attach real-time project listener
          const q = query(
            collection(db, "projects"),
            where("uid", "==", srvUser.uid)
          );

          const unsubProjects = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map((d) => d.data() as Project);
            // Sort client-side by creation timestamp descending
            list.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setProjects(list);
          }, (err) => {
            handleFirestoreError(err, OperationType.GET, "projects");
          });

          setLoadingAuth(false);
          return () => {
            unsubUser();
            unsubProjects();
          };
        } catch (err: any) {
          console.error(err);
          setErrorText("Failed to establish secure synchronized database connections.");
          setLoadingAuth(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        setProjects([]);
        setInspectionProject(null);
        setLoadingAuth(false);
      }
    });

    return () => unsubAuth();
  }, []);

  const handleLoginGoogle = async () => {
    setErrorText(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorText("Authentication cancelled. Please try again when ready.");
      } else {
        setErrorText("Google Authentication failed. Please check network restrictions.");
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this creation?")) return;
    try {
      await deleteDoc(doc(db, "projects", projectId));
      if (inspectionProject?.projectId === projectId) {
        setInspectionProject(null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `projects/${projectId}`);
    }
  };

  const calculateCreationCount = (type: "song" | "video" | "quran" | "slides") => {
    return projects.filter((p) => p.type === type).length;
  };

  // Setup plan checks
  const getPlanLimitWarning = () => {
    if (!profile) return null;
    const plan = profile.plan;
    const sCount = calculateCreationCount("song");
    const vCount = calculateCreationCount("video");
    const qCount = calculateCreationCount("quran");
    const pCount = calculateCreationCount("slides");

    if (plan === "free") {
      if (sCount >= 5 || vCount >= 2 || qCount >= 3 || pCount >= 5) {
        return "You have almost reached the limit of your Free Plan. Feel free to upgrade to Creator plan to generate unlimited scripts.";
      }
    } else if (plan === "creator") {
      if (sCount >= 50 || vCount >= 20) {
        return "You are approaching Creator limits. Try the Studio Plan for unlimited workspace storage.";
      }
    }
    return null;
  };

  const handlePlanUpdatedLocal = (newPlan: UserPlan) => {
    if (profile) {
      setProfile({ ...profile, plan: newPlan });
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white antialiased">
        <EchoVerseLogo className="w-12 h-12 text-amber-500 animate-pulse mb-4" />
        <p className="text-sm font-semibold tracking-wider font-mono uppercase text-neutral-400">Loading EchoVerse Intelligence...</p>
      </div>
    );
  }

  // Not Logged In - High Fidelity Welcome Page
  if (!user || !profile) {
    return <LandingPage onGetStarted={handleLoginGoogle} />;
  }

  // Active Authenticated View
  const sCount = calculateCreationCount("song");
  const vCount = calculateCreationCount("video");
  const qCount = calculateCreationCount("quran");
  const pCount = calculateCreationCount("slides");
  const warningMessage = getPlanLimitWarning();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased selection:bg-amber-500/30 selection:text-white">
      {/* Banner limits warning */}
      {warningMessage && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950 font-bold text-xs py-2 px-4 text-center flex items-center justify-center gap-2 relative z-20">
          <Zap className="w-4 h-4 animate-bounce shrink-0" />
          <span>{warningMessage}</span>
          <button
            onClick={() => setIsPricingOpen(true)}
            className="ml-3 underline hover:text-neutral-900 font-black cursor-pointer text-[10px] uppercase font-mono bg-white/20 px-2 py-0.5 rounded"
          >
            Manage Subscription
          </button>
        </div>
      )}

      {/* Main App Header */}
      <header className="bg-neutral-900/60 border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between z-10 sticky top-0 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <EchoVerseLogo className="w-6 h-6 text-emerald-500" />
          <span className="font-extrabold text-base tracking-tight text-white">ECHO<span className="text-emerald-500">VERSE</span> AI</span>
        </div>

        {/* User profile controls and Plan Trigger */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPricingOpen(true)}
            className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 hover:text-amber-400 px-3 py-1.5 rounded-xl text-xs font-mono transition-colors text-amber-500"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="uppercase text-[10px] font-bold">{profile.plan} Workspace</span>
          </button>

          <div className="hidden md:flex items-center gap-2.5 border-l border-neutral-800 pl-4 text-xs">
            <User className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-300 font-medium truncate max-w-[160px]">{profile.email}</span>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Workspace and Grid */}
      <div className="flex-1 flex flex-col md:flex-row items-stretch overflow-hidden">
        {/* Left Side Sidebar - Drafts Ledger and Module Selection */}
        <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-neutral-800/80 bg-neutral-950 flex flex-col justify-between p-5 space-y-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono mb-3">WORKSPACE CORE</h3>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setInspectionProject(null);
                    setActiveTab("song");
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between text-xs font-semibold ${
                    activeTab === "song" && !inspectionProject
                      ? "bg-amber-500 text-neutral-950"
                      : "text-neutral-300 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    <span>Song from Lyrics</span>
                  </div>
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md ${activeTab === "song" && !inspectionProject ? "bg-amber-400/30 text-neutral-950" : "bg-neutral-900 border border-neutral-800 text-neutral-400"}`}>{sCount}</span>
                </button>

                <button
                  onClick={() => {
                    setInspectionProject(null);
                    setActiveTab("video");
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between text-xs font-semibold ${
                    activeTab === "video" && !inspectionProject
                      ? "bg-amber-500 text-neutral-950"
                      : "text-neutral-300 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    <span>Music from vibe</span>
                  </div>
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md ${activeTab === "video" && !inspectionProject ? "bg-amber-400/30 text-neutral-950" : "bg-neutral-900 border border-neutral-800 text-neutral-400"}`}>{vCount}</span>
                </button>

                <button
                  onClick={() => {
                    setInspectionProject(null);
                    setActiveTab("quran");
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between text-xs font-semibold ${
                    activeTab === "quran" && !inspectionProject
                      ? "bg-amber-500 text-neutral-950"
                      : "text-neutral-300 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span>Quran Video Concept</span>
                  </div>
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md ${activeTab === "quran" && !inspectionProject ? "bg-amber-400/30 text-neutral-950" : "bg-neutral-900 border border-neutral-800 text-neutral-400"}`}>{qCount}</span>
                </button>

                <button
                  onClick={() => {
                    setInspectionProject(null);
                    setActiveTab("slides");
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between text-xs font-semibold ${
                    activeTab === "slides" && !inspectionProject
                      ? "bg-amber-500 text-neutral-950"
                      : "text-neutral-300 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Presentation className="w-4 h-4" />
                    <span>Slide Presentation</span>
                  </div>
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md ${activeTab === "slides" && !inspectionProject ? "bg-amber-400/30 text-neutral-950" : "bg-neutral-900 border border-neutral-800 text-neutral-400"}`}>{pCount}</span>
                </button>
              </div>
            </div>

            {/* Creations Ledger */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-[220px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">WORKSPACE HISTORY ({projects.length})</h3>
                <History className="w-3.5 h-3.5 text-neutral-500" />
              </div>

              {projects.length === 0 ? (
                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 text-center text-xs text-neutral-500 flex-1 flex flex-col items-center justify-center">
                  <span>No blueprints generated yet. Choose a module and draft your first file!</span>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-[300px] flex-1 pb-4 pr-1">
                  {projects.map((proj) => {
                    const isSelected = inspectionProject?.projectId === proj.projectId;
                    const dateText = new Date(proj.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
                    return (
                      <div
                        key={proj.projectId}
                        onClick={() => {
                          setInspectionProject(proj);
                          setActiveTab(proj.type);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs group ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500/40 text-white"
                            : "bg-neutral-900/40 border-neutral-900 hover:border-neutral-800 hover:bg-neutral-900/60"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {proj.type === "song" && <Music className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          {proj.type === "video" && <Compass className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                          {proj.type === "quran" && <Heart className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          {proj.type === "slides" && <Presentation className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                          <div className="truncate text-left text-[11px]">
                            <span className="block font-medium truncate text-neutral-200">
                              {proj.type === "song" && (proj.inputData?.lyrics || "Lyrics plan")}
                              {proj.type === "video" && (proj.inputData?.vibe || "Vibe soundscape")}
                              {proj.type === "quran" && (proj.inputData?.theme || "Quran video")}
                              {proj.type === "slides" && (proj.inputData?.topic || "Slide outline")}
                            </span>
                            <span className="text-[9px] text-neutral-500 font-mono block mt-0.5">{dateText} • ID: {proj.projectId.split("_")[1]}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleDeleteProject(proj.projectId, e)}
                          className="text-neutral-500 hover:text-rose-400 p-1 rounded hover:bg-neutral-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete draft"
                          aria-label="Delete draft"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Core Profile info footnote */}
          <div className="border-t border-neutral-900 pt-4 flex items-center gap-3 text-xs w-full">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
              {profile.name[0]?.toUpperCase() || "E"}
            </div>
            <div className="overflow-hidden">
              <span className="block font-bold text-white truncate text-[11px]">{profile.name}</span>
              <span className="block text-[10px] text-neutral-500 font-mono truncate">{profile.plan.toUpperCase()} MEMBERSHIP</span>
            </div>
          </div>
        </aside>

        {/* Central Creation Arena */}
        <main className="flex-1 bg-neutral-950 p-6 md:p-8 overflow-y-auto">
          {/* Inspection block notification */}
          {inspectionProject ? (
            <div className="mb-6 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-400 uppercase font-mono tracking-wider">PROJECT INSPECTOR</h4>
                  <p className="text-sm text-white font-medium mt-0.5">
                    Viewing Saved Draft ({inspectionProject.type.toUpperCase()})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectionProject(null)}
                className="px-4 py-2 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 hover:text-white rounded-xl text-xs font-semibold text-neutral-300 transition-colors cursor-pointer self-start sm:self-auto"
              >
                Exit Inspection & Build New
              </button>
            </div>
          ) : (
            <div className="mb-6 invisible h-0" />
          )}

          {/* ACTIVE TAB MODULATORS */}
          {activeTab === "song" && (
            <SongLyricsModule
              userProfile={profile}
              onProjectSaved={() => {}}
              creationCount={calculateCreationCount("song")}
              onTriggerUpgrade={() => setIsPricingOpen(true)}
            />
          )}

          {activeTab === "video" && (
            <MusicVibeModule
              userProfile={profile}
              onProjectSaved={() => {}}
              creationCount={calculateCreationCount("video")}
              onTriggerUpgrade={() => setIsPricingOpen(true)}
            />
          )}

          {activeTab === "quran" && (
            <QuranVideoModule
              userProfile={profile}
              onProjectSaved={() => {}}
              creationCount={calculateCreationCount("quran")}
              onTriggerUpgrade={() => setIsPricingOpen(true)}
            />
          )}

          {activeTab === "slides" && (
            <PresentationModule
              userProfile={profile}
              onProjectSaved={() => {}}
              creationCount={calculateCreationCount("slides")}
              onTriggerUpgrade={() => setIsPricingOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Pricing Matrix upgrade Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        userProfile={profile}
        onPlanUpdated={handlePlanUpdatedLocal}
      />
    </div>
  );
}
