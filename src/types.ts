export type UserPlan = "free" | "creator" | "studio";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  plan: UserPlan;
  createdAt: any; // Firestore Timestamp or ISO string
}

export interface SongContent {
  genre: string;
  mood: string;
  bpm: number;
  key: string;
  instruments: string[];
  structure: string[];
  duration: string;
  producerNotes: string;
  nextStep: string;
}

export interface VibeContent {
  style: string;
  bpm: number;
  key: string;
  atmosphere: string;
  instruments: string[];
  textures: string[];
  moodArc: string;
  vocalsNeeded: string;
  nextStep: string;
}

export interface QuranContent {
  surah: string;
  number: number;
  ayah: number;
  arabic: string;
  transliteration: string;
  translation: string;
  visualStyle: string;
  background: string;
  reciterStyle: string;
  caption: string;
  nextStep: string;
}

export interface Slide {
  slideNumber: number;
  title: string;
  keyPoints: string[];
  speakerNotes: string;
  suggestedVisuals: string;
}

export interface SlidesContent {
  openingHook: string;
  slides: Slide[];
  closingCta: string;
  slideCountRecommendation: string;
  nextStep: string;
}

export interface Project {
  projectId: string;
  uid: string;
  type: "song" | "video" | "quran" | "slides";
  inputData: {
    lyrics?: string;
    vibe?: string;
    theme?: string;
    topic?: string;
    audience?: string;
  };
  aiOutput: SongContent | VibeContent | QuranContent | SlidesContent;
  fileUrl?: string;
  createdAt: any;
}
