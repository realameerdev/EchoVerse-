import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Settings secrets panel.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// REST API Health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "EchoVerse AI API" });
});

// Module 1: Song From Lyrics
app.post("/api/generate/song-from-lyrics", async (req, res) => {
  try {
    const { lyrics } = req.body;
    if (!lyrics || typeof lyrics !== "string") {
      res.status(400).json({ error: "Missing or invalid lyrics field" });
      return;
    }

    const ai = getGeminiClient();
    const systemPrompt = `You are EchoVerse AI — the intelligent creative engine powering EchoVerse. 
Analyze the provided song lyrics to generate a production-ready music project plan. 
You must output a single JSON object strictly matching the requested schema. Provide real, specific musical values (BPM, key, subgenre, exact structures, etc.).`;

    const promptText = `Generate a complete music production plan based on these lyrics:
"""
${lyrics}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["genre", "mood", "bpm", "key", "instruments", "structure", "duration", "producerNotes", "nextStep"],
          properties: {
            genre: { type: Type.STRING, description: "Genre and subgenre (e.g. R&B / Neo-Soul)" },
            mood: { type: Type.STRING, description: "Emotional tones of the track" },
            bpm: { type: Type.INTEGER, description: "Beats per minute of the track" },
            key: { type: Type.STRING, description: "Musical scale and key (e.g. A Minor, C# Major)" },
            instruments: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of core instruments recommended"
            },
            structure: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Complete list of song sections with brief guides"
            },
            duration: { type: Type.STRING, description: "Estimated final duration (e.g. ~3:45)" },
            producerNotes: { type: Type.STRING, description: "Mixing tips, vocal guidance, master processing advice" },
            nextStep: { type: Type.STRING, description: "An encouraging 'Next Step' advice starting with '→'" }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Error generating song from lyrics:", err);
    res.status(500).json({ error: err.message || "Failed to generate plan" });
  }
});

// Module 2: Music from vibe/feel/concept
app.post("/api/generate/music-from-vibe", async (req, res) => {
  try {
    const { vibe } = req.body;
    if (!vibe || typeof vibe !== "string") {
      res.status(400).json({ error: "Missing or invalid vibe field" });
      return;
    }

    const ai = getGeminiClient();
    const systemPrompt = `You are EchoVerse AI — the intelligent creative engine powering EchoVerse. 
Translate the provided vibe, mood, scenery, or abstract description into a comprehensive musical blueprint plan. 
You must output a single JSON object strictly matching the requested schema. Make daring, highly specific and atmospheric choices.`;

    const promptText = `Generate a music plan for this description of a vibe:
"""
${vibe}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["style", "bpm", "key", "atmosphere", "instruments", "textures", "moodArc", "vocalsNeeded", "nextStep"],
          properties: {
            style: { type: Type.STRING, description: "Music style, style attributes and subgenres" },
            bpm: { type: Type.INTEGER, description: "Beats per minute (BPM) value" },
            key: { type: Type.STRING, description: "Key center selection" },
            atmosphere: { type: Type.STRING, description: "Description of the space, decay and depth qualities" },
            instruments: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Selected focus instruments"
            },
            textures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Atmospheric textures, field recordings, or synthesizer patches"
            },
            moodArc: { type: Type.STRING, description: "How the track progresses from start to finish" },
            vocalsNeeded: { type: Type.STRING, description: "Guidance on whether vocals or voice-tags are needed, and what style" },
            nextStep: { type: Type.STRING, description: "An encouraging 'Next Step' advice starting with '→'" }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Error generating music from vibe:", err);
    res.status(500).json({ error: err.message || "Failed to generate vibe plan" });
  }
});

// Module 3: Quran Video Script Generator
app.post("/api/generate/quran-video", async (req, res) => {
  try {
    const { theme } = req.body;
    if (!theme || typeof theme !== "string") {
      res.status(400).json({ error: "Missing or invalid theme field" });
      return;
    }

    const ai = getGeminiClient();
    const systemPrompt = `You are EchoVerse AI. Treat Quran content with highest level of reverence, precision, and academic accuracy. 
When given a theme, locate and reference genuine Quran ayahs (provide Surah name, surah number, and ayah number). 
Never fabricate or approximate Arabic text. You must output a single JSON object strictly matching the requested schema. Include transliteration and English translation.`;

    const promptText = `Find a highly relevant Quran verse representing this theme: "${theme}", and output the visual presentation/video outline.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["surah", "number", "ayah", "arabic", "transliteration", "translation", "visualStyle", "background", "reciterStyle", "caption", "nextStep"],
          properties: {
            surah: { type: Type.STRING, description: "Name of the Surah (e.g. Ibrahim)" },
            number: { type: Type.INTEGER, description: "Surah Number" },
            ayah: { type: Type.INTEGER, description: "Ayah Number" },
            arabic: { type: Type.STRING, description: "Exact Arabic Quranic text of the verse" },
            transliteration: { type: Type.STRING, description: "Phonetic transliteration in English characters" },
            translation: { type: Type.STRING, description: "Polished English translation (e.g. Sahih International)" },
            visualStyle: { type: Type.STRING, description: "Suggested cinematography, lighting properties, overlay elements, and color palettes" },
            background: { type: Type.STRING, description: "Scenic background description (sunset, rivers, geometry, stars, etc.)" },
            reciterStyle: { type: Type.STRING, description: "Recommended reciters (e.g. Mishary Al-Afasy) and emotional tone" },
            caption: { type: Type.STRING, description: "Engaging social media post caption with hashtaging templates (#Quran #Gratitude)" },
            nextStep: { type: Type.STRING, description: "An encouraging 'Next Step' advice starting with '→'" }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Error generating Quran verse visual concept:", err);
    res.status(500).json({ error: err.message || "Failed to generate Quran video concept" });
  }
});

// Module 4: Slide Presentation Generator
app.post("/api/generate/presentation", async (req, res) => {
  try {
    const { topic, audience } = req.body;
    if (!topic || typeof topic !== "string") {
      res.status(400).json({ error: "Missing or invalid topic field" });
      return;
    }

    const targetAudience = audience || "General Audience";
    const ai = getGeminiClient();
    const systemPrompt = `You are EchoVerse AI — the intelligent creative engine powering EchoVerse.
You transform slide request topics and audience settings into premium corporate/startup slide production blueprints.
Structure slide-by-slide breakdowns. For each slide, output clear numbers, punchy titles, precise bullet lists, visuals suggestions, and speaker guides.
You must output a single JSON object strictly matching the requested schema.`;

    const promptText = `Generate an elegant slide presentation outline for:
Topic: "${topic}"
Audience: "${targetAudience}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["openingHook", "slides", "closingCta", "slideCountRecommendation", "nextStep"],
          properties: {
            openingHook: { type: Type.STRING, description: "Introductory spoken phrase or prompt hook to grab attention" },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["slideNumber", "title", "keyPoints", "speakerNotes", "suggestedVisuals"],
                properties: {
                  slideNumber: { type: Type.INTEGER, description: "Chronological slide number" },
                  title: { type: Type.STRING, description: "Premium, clear slide header" },
                  keyPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 to 4 robust bullet points to write on the slide content area"
                  },
                  speakerNotes: { type: Type.STRING, description: "Slogan or vocal guide for the presenter during this segment" },
                  suggestedVisuals: { type: Type.STRING, description: "Descriptions of icons, background grids, bento sections or graphics" }
                }
              }
            },
            closingCta: { type: Type.STRING, description: "A high-retention call-to-action closing" },
            slideCountRecommendation: { type: Type.STRING, description: "Evaluation of length with justification" },
            nextStep: { type: Type.STRING, description: "An encouraging 'Next Step' advice starting with '→'" }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Error generating presentation outline:", err);
    res.status(500).json({ error: err.message || "Failed to generate presentation outline" });
  }
});

// Setup Vite Dev server / Production Static Assets Router
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to host 0.0.0.0 and port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[EchoVerse Server] Listening on http://0.0.0.0:${PORT} under environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
