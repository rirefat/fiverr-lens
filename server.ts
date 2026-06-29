import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { MongoClient } from "mongodb";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { fullComplianceDatabase } from "./src/complianceDatabase.js";

dotenv.config();

// =========================================================================
// FIRESTORE COMPLIANCE RULES STALE-WHILE-REVALIDATE ENGINE
// =========================================================================
let cachedRules = [...fullComplianceDatabase];
let lastFetched = 0;
let isFetching = false;

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBCwr7f4nITvQ3WBRab6KHNUVJsJgu9mPI",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "invertible-flow-rskkt.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "invertible-flow-rskkt",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "invertible-flow-rskkt.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "205665157452",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:205665157452:web:6a9144501365ad2a35cfe9",
};

const databaseId = "ai-studio-fiverrlens-ec6b32b2-6c56-4950-a5ed-3d4a84af943e";

let db: any = null;
try {
  const firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp, databaseId);
} catch (e) {
  console.warn("Firebase failed to initialize in server, using static fallback rules:", e);
}

async function refreshRulesCache() {
  if (!db || isFetching) return;
  isFetching = true;
  try {
    const querySnapshot = await getDocs(collection(db, "rules"));
    if (!querySnapshot.empty) {
      const rulesList: any[] = [];
      querySnapshot.forEach((docSnap) => {
        rulesList.push(docSnap.data());
      });
      cachedRules = rulesList;
      lastFetched = Date.now();
      console.log(`🔄 Compliance rules cache updated from Firestore: ${cachedRules.length} rules.`);
    }
  } catch (err) {
    console.error("Error refreshing compliance rules cache:", err);
  } finally {
    isFetching = false;
  }
}

// Firestore-based template stats fallback helper services
async function getFirestoreTemplateStats(): Promise<Record<string, number>> {
  const stats: Record<string, number> = {};
  if (!db) return stats;
  try {
    const querySnapshot = await getDocs(collection(db, "templateStats"));
    querySnapshot.forEach((docSnap) => {
      stats[docSnap.id] = docSnap.data().usageCount || 0;
    });
  } catch (err) {
    console.error("Error getting template stats from Firestore:", err);
  }
  return stats;
}

async function incrementFirestoreTemplateStat(id: string): Promise<number> {
  if (!db) return 0;
  try {
    const docRef = doc(db, "templateStats", id);
    const docSnap = await getDoc(docRef);
    let newCount = 1;
    if (docSnap.exists()) {
      newCount = (docSnap.data().usageCount || 0) + 1;
      await setDoc(docRef, { usageCount: newCount }, { merge: true });
    } else {
      await setDoc(docRef, { usageCount: 1 });
    }
    return newCount;
  } catch (err) {
    console.error(`Error incrementing template stat for ${id} in Firestore:`, err);
    return 0;
  }
}


const app = express();
const PORT = 3000;

// Custom body parser middleware that skips if Vercel already parsed the body
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Initialize GoogleGenAI SDK lazily to avoid startup crashes if GEMINI_API_KEY is not defined
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn(
        "⚠️ GEMINI_API_KEY is missing. Fiverr Lens will operate in highly-realistic Sandbox Intelligence Mode.",
      );
      throw new Error("API_KEY_MISSING");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Simple API status check
app.get("/api/status", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: "ready",
    hasApiKey: hasKey,
    message: hasKey
      ? "Fiverr Lens live AI engine is online! Running on Gemini 3.5-flash."
      : "Fiverr Lens Sandbox is online! Add GEMINI_API_KEY in settings to connect Live AI.",
  });
});

// =========================================================================
// MONGODB TEMPLATE USAGE TRACKING SERVICES
// =========================================================================
let mongoClient: MongoClient | null = null;
let dbInstance: any = null;
let isMongoAvailable = false;

// Graceful local memory fallback in case MongoDB is offline or unconfigured
const inMemoryTemplateStats: Record<string, number> = {};

async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    isMongoAvailable = false;
    return null;
  }
  
  if (mongoClient && dbInstance) {
    try {
      // Serverless heartbeat: ping the DB to verify the cached socket is still alive and didn't time out
      await dbInstance.command({ ping: 1 });
      isMongoAvailable = true;
      return dbInstance;
    } catch (pingErr) {
      console.warn("⚠️ Cached MongoDB connection socket is dead, reconnecting...", pingErr);
      try {
        await mongoClient.close();
      } catch (e) {}
      mongoClient = null;
      dbInstance = null;
    }
  }
  
  try {
    mongoClient = new MongoClient(uri, {
      maxPoolSize: 1, // Minimize connections per lambdas in serverless
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    await mongoClient.connect();
    dbInstance = mongoClient.db("fiverrlens");
    isMongoAvailable = true;
    console.log("✅ Successfully connected to MongoDB!");
    return dbInstance;
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB, using In-Memory/Firestore backup:", err);
    isMongoAvailable = false;
    mongoClient = null;
    dbInstance = null;
    return null;
  }
}

// 1. Get all template usage statistics
app.get("/api/template-stats", async (req, res) => {
  // Explicitly disable any caching on GET responses on Vercel Edge/CDN
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  try {
    const mongoDb = await connectMongo();
    if (isMongoAvailable && mongoDb) {
      const collection = mongoDb.collection("template_stats");
      const results = await collection.find({}).toArray();
      const stats: Record<string, number> = {};
      results.forEach((item: any) => {
        stats[item.templateId] = item.usageCount || 0;
      });
      return res.json({ success: true, stats, source: "mongodb" });
    } else {
      try {
        const stats = await getFirestoreTemplateStats();
        // Sync with in-memory backup
        Object.assign(inMemoryTemplateStats, stats);
        return res.json({ success: true, stats, source: "firestore" });
      } catch (firestoreErr) {
        console.error("Firestore template stats failed:", firestoreErr);
        return res.json({ success: true, stats: inMemoryTemplateStats, source: "in-memory" });
      }
    }
  } catch (error: any) {
    console.error("Error fetching template stats:", error);
    return res.json({ success: true, stats: inMemoryTemplateStats, source: "in-memory" });
  }
});

// 2. Increment usage count for a single template
app.post("/api/template-stats/increment", async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Template ID is required" });
  }
  
  try {
    const mongoDb = await connectMongo();
    if (isMongoAvailable && mongoDb) {
      const collection = mongoDb.collection("template_stats");
      await collection.updateOne(
        { templateId: id },
        { $inc: { usageCount: 1 } },
        { upsert: true }
      );
      const updatedDoc = await collection.findOne({ templateId: id });
      const newCount = updatedDoc?.usageCount || 1;
      return res.json({ success: true, id, usageCount: newCount, source: "mongodb" });
    } else {
      try {
        const newCount = await incrementFirestoreTemplateStat(id);
        inMemoryTemplateStats[id] = newCount;
        return res.json({ success: true, id, usageCount: newCount, source: "firestore" });
      } catch (firestoreErr) {
        console.error("Firestore increment failed:", firestoreErr);
        inMemoryTemplateStats[id] = (inMemoryTemplateStats[id] || 0) + 1;
        return res.json({ success: true, id, usageCount: inMemoryTemplateStats[id], source: "in-memory" });
      }
    }
  } catch (error: any) {
    console.error("Error incrementing template stats:", error);
    inMemoryTemplateStats[id] = (inMemoryTemplateStats[id] || 0) + 1;
    return res.json({ success: true, id, usageCount: inMemoryTemplateStats[id], source: "in-memory" });
  }
});

// 3. Reset all template usage statistics
app.post("/api/template-stats/reset", async (req, res) => {
  try {
    const mongoDb = await connectMongo();
    if (isMongoAvailable && mongoDb) {
      const collection = mongoDb.collection("template_stats");
      await collection.deleteMany({});
      return res.json({ success: true, source: "mongodb" });
    } else {
      try {
        if (db) {
          const querySnapshot = await getDocs(collection(db, "templateStats"));
          for (const docSnap of querySnapshot.docs) {
            const docRef = doc(db, "templateStats", docSnap.id);
            await setDoc(docRef, { usageCount: 0 }, { merge: true });
          }
        }
      } catch (firestoreErr) {
        console.error("Firestore stats reset failed:", firestoreErr);
      }
      Object.keys(inMemoryTemplateStats).forEach((key) => {
        inMemoryTemplateStats[key] = 0;
      });
      return res.json({ success: true, source: "firestore/in-memory" });
    }
  } catch (error: any) {
    console.error("Error resetting template stats:", error);
    return res.status(500).json({ error: "Failed to reset stats" });
  }
});

/**
 * -------------------------------------------------------------
 * ENDPOINT 1: Fiverr Message Safety Checker
 * -------------------------------------------------------------
 */
app.post("/api/analyze-safety", async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message field is required." });
  }

  // Asynchronously trigger refresh of compliance rules cache if stale
  if (Date.now() - lastFetched > 30000) {
    refreshRulesCache().catch((err) => console.error("Revalidation failed:", err));
  }

  // 1. Extract all external links / URLs in the message to ignore inside compliance matches
  const urlRanges: { start: number; end: number; text: string }[] = [];
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.(com|net|org|io|gov|edu|me|us|uk|ca|co|info|biz|tv|xyz|app|dev|sh|fm|im|cc|live)\b[^\s]*)/gi;
  let urlMatch;
  while ((urlMatch = urlRegex.exec(message)) !== null) {
    urlRanges.push({
      start: urlMatch.index,
      end: urlMatch.index + urlMatch[0].length,
      text: urlMatch[0]
    });
  }

  // 2. Run local deterministic Risk Detection Engine over rules
  const textLower = message.toLowerCase();
  const matchedRules = [];

  for (const rule of cachedRules) {
    try {
      const regex = new RegExp(rule.pattern, "gi");
      let match;
      let hasMatchOutsideLinks = false;
      let hasAnyMatch = false;

      while ((match = regex.exec(message)) !== null) {
        hasAnyMatch = true;
        const start = match.index;
        const end = regex.lastIndex;
        if (start === end) {
          regex.lastIndex++;
          continue;
        }

        const overlapsUrl = urlRanges.some(
          (r) => (start >= r.start && start < r.end) || (end > r.start && end <= r.end) || (start <= r.start && end >= r.end)
        );
        if (!overlapsUrl) {
          hasMatchOutsideLinks = true;
        }
      }

      if (hasAnyMatch && hasMatchOutsideLinks) {
        matchedRules.push(rule);
      }
    } catch (err) {
      // Fallback simple substring search
      const cleanPhrase = rule.phrase
        .replace(/\s?\(Case\s?#\d+\)/gi, "")
        .toLowerCase();
      
      let index = textLower.indexOf(cleanPhrase);
      let hasMatchOutsideLinks = false;
      let hasAnyMatch = false;

      while (index !== -1) {
        hasAnyMatch = true;
        const start = index;
        const end = index + cleanPhrase.length;

        const overlapsUrl = urlRanges.some(
          (r) => (start >= r.start && start < r.end) || (end > r.start && end <= r.end) || (start <= r.start && end >= r.end)
        );
        if (!overlapsUrl) {
          hasMatchOutsideLinks = true;
        }
        index = textLower.indexOf(cleanPhrase, index + 1);
      }

      if (hasAnyMatch && hasMatchOutsideLinks) {
        matchedRules.push(rule);
      }
    }
  }

  // 3. Perform advanced scoring & classification based on Risk Detection Engine hierarchy
  let safetyScore = 100;
  let riskLevel: "Safe" | "Warning" | "High Risk" = "Safe";
  const dangerousContent: string[] = [];
  const potentialIssues: string[] = [];
  const safeElements: string[] = [];

  // Determine client mood based on triggered rules or general tokens
  let clientMood:
    | "Positive"
    | "Neutral"
    | "Frustrated"
    | "Urgent"
    | "Interested" = "Neutral";
  if (textLower.match(/urgent|quick|asap|fast|immediately/)) {
    clientMood = "Urgent";
  } else if (textLower.match(/interest|want|need|looking to/)) {
    clientMood = "Interested";
  } else if (textLower.match(/sad|bad|disappoint|angry|ruin|report/)) {
    clientMood = "Frustrated";
  } else if (textLower.match(/thank|great|perfect|awesome|good|love/)) {
    clientMood = "Positive";
  }

  if (matchedRules.length > 0) {
    const maxScore = Math.max(...matchedRules.map((r) => r.riskScore));
    safetyScore = Math.max(0, 100 - maxScore);

    const severities = matchedRules.map((r) => r.severity);
    if (
      severities.includes("Critical Risk") ||
      severities.includes("High Risk")
    ) {
      riskLevel = "High Risk";
    } else {
      riskLevel = "Warning";
    }

    // Add detailed violation and warning explanations
    for (const r of matchedRules) {
      const cleanPhrase = r.phrase.replace(/\s?\(Case\s?#\d+\)/gi, "");
      const alertMsg = `${r.category}: "${cleanPhrase}" triggers ${r.severity}. Reason: ${r.explanation}`;

      if (r.severity === "Critical Risk" || r.severity === "High Risk") {
        if (!dangerousContent.includes(alertMsg)) {
          dangerousContent.push(alertMsg);
        }
      } else {
        if (!potentialIssues.includes(alertMsg)) {
          potentialIssues.push(alertMsg);
        }
      }
    }
  } else {
    safetyScore = 100;
    riskLevel = "Safe";
    safeElements.push(
      "Perfect guidelines alignment: No fee circumvention triggers or off-platform cues detected.",
    );
    safeElements.push("Fiverr safe communication guidelines respected.");
  }

  // Analyze general positive aspects of communication quality
  if (textLower.match(/hello|hi |hey |dear|greetings|hope you/)) {
    safeElements.push("Friendly and professional buyer greeting.");
  }
  if (textLower.match(/thank|best regards|regards|thanks|sincerely/)) {
    safeElements.push("Polite and standardized sign-off.");
  }
  if (message.length > 40) {
    safeElements.push(
      "Detailed scope details are provided to help clarify the project.",
    );
  }

  // Highlight and correct messages locally first
  let highlighted = message;
  let corrected = message;

  // Sort by pattern length descending to prevent shorter strings from corrupting larger HTML tags
  const sortedMatches = [...matchedRules].sort(
    (a, b) => b.phrase.length - a.phrase.length,
  );
  for (const rule of sortedMatches) {
    try {
      const cleanPattern = rule.pattern;
      const regex = new RegExp(`(${cleanPattern})`, "gi");

      let colorClass =
        "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 px-1 py-0.5 rounded";
      if (rule.severity === "Critical Risk") {
        colorClass =
          "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 font-bold px-1.5 py-0.5 rounded border border-rose-400/30";
      } else if (rule.severity === "High Risk") {
        colorClass =
          "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 font-bold px-1.5 py-0.5 rounded border border-red-400/20";
      } else if (rule.severity === "Medium Risk") {
        colorClass =
          "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-semibold px-1.5 py-0.5 rounded border border-amber-500/20";
      } else if (rule.severity === "Low Risk") {
        colorClass =
          "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-medium px-1.5 py-0.5 rounded border border-blue-500/20";
      }

      highlighted = highlighted.replace(
        regex,
        `<span class="${colorClass}">$1</span>`,
      );
      corrected = corrected.replace(regex, rule.rewrite);
    } catch (err) {
      // Fallback
    }
  }

  // Add default professional fallback sign-off if nothing was changed or it was too simple
  if (corrected === message) {
    corrected = `Hi there!\n\nThank you so much for reaching out! I would be absolutely thrilled to assist you with this project. To ensure a 100% secure, transparent, and flawless project experience, let's keep all coordinates and exchanges directly here within our private Fiverr workspace chat.\n\nPlease share any requirements, details, or resources you have directly in this thread. Looking forward to delivering amazing results!\n\nBest regards.`;
  }

  // 4. Attempt Live AI Engine if GEMINI_API_KEY is defined, else return deterministic response
  try {
    const ai = getAiClient();

    const prompt = `You are Fiverr Lens, an elite Terms of Service compliance inspector and communications analyst.
Analyze the following message intended for Fiverr client-freelancer communications.

Deterministic Compliance Check matched these precise database records:
${matchedRules.map((r) => `- Match: "${r.phrase}" (Severity: ${r.severity}, Category: ${r.category}): ${r.explanation} [Rewrite Suggestion: "${r.rewrite}"]`).join("\n")}

Original message text:
"${message}"

Your Goal:
Conduct a highly context-aware review of the message. If the local parser is triggered on benign, contextual mentions (e.g. telling a client "I cannot join Zoom on Skype, we can do Fiverr native call"), adjust the score appropriately.
CRITICAL INSTRUCTION: If the user has explicitly obfuscated words (e.g. "whats app" instead of whatsapp, "p.h.o.n.e", "g m a i l", "s.k.y.p.e"), DO NOT flag them as violations. The user considers these successful filter bypasses. Treat obfuscated words as 100% compliant. Do not include them in dangerousContent, potentialIssues, or matchedRules.
CRITICAL INSTRUCTION FOR EXTERNAL LINKS: If there are any external links, websites, portfolios, or URLs in the message (e.g., starting with http://, https://, www., or containing domain extensions like myportfolio.com, github.com, google.com), DO NOT flag them as violations under any circumstances. External links are 100% compliant and safe. Do not include them or any words inside them in dangerousContent, potentialIssues, or matchedRules.
Also identify indirect or disguised attempts to move communication, payments, contracts, or project management outside Fiverr, EXCEPT when they are achieved via explicit text obfuscations like spacing, periods, or hyphens.

Generate a JSON object matching this structure exactly:
{
  "safetyScore": <number from 0 to 100 where 100 is perfectly safe and 0 is immediately bannable>,
  "riskLevel": "Safe" | "Warning" | "High Risk",
  "safeElements": ["list of positive/compliant components of the message"],
  "potentialIssues": ["list of warnings or questionable phrasings found"],
  "dangerousContent": ["list of clear ToS violations, direct contact sharing, or off-platform cues"],
  "highlightedMessage": "The input message where words that triggered ToS warnings are surrounded with a <span class='risk-highlight'>word</span> or similar HTML tag using colors appropriate for the severity.",
  "correctedMessage": "A fully polished, professional, ToS-compliant rewrite of the original message preserving original intent but safe for Fiverr. Do NOT use emojis.",
  "successScore": <communication effectiveness score 0-100 based on tone and impact>,
  "clientMood": "Positive" | "Neutral" | "Frustrated" | "Urgent" | "Interested",
  "communicationQualityScore": {
    "clarity": <1-10>,
    "professionalism": <1-10>,
    "persuasiveness": <1-10>,
    "trustworthiness": <1-10>
  },
  "matchedRules": [
    {
      "id": "string (unique ID, e.g., 'dynamic_ai_001')",
      "phrase": "the exact word or phrase from the message that is a violation",
      "riskScore": <number from 0 to 100>,
      "category": "Off-Platform Communication" | "External Payments" | "Fiverr Fee Circumvention" | "Personal Contact Information" | "Phishing & Suspicious Language" | "Academic Integrity Violations" | "Feedback & Review Manipulation" | "Harassment & Unprofessional" | "Prohibited & Illegal Services" | "Employment & Recruitment Off-Platform",
      "severity": "Low Risk" | "Medium Risk" | "High Risk" | "Critical Risk",
      "pattern": "the exact substring or regex matching the word or phrase in the message",
      "rewrite": "the safe alternative word or phrase to replace it",
      "explanation": "Detailed explanation of why it may violate Fiverr policies and what standard safe guidelines apply"
    }
  ]
}

Ensure 'matchedRules' contains all the issues you detected, including any that were passed from the deterministic check, as well as any new indirect/disguised issues you have identified. Make sure each phrase matches some substring in the original message exactly, so the UI can highlight it.

Always return valid, well-structured JSON matching the requested schema exactly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction:
          "You are an expert Fiverr Terms of Service compliance specialist and elite freelancer communications coach. Always return valid, well-structured JSON matching the requested schema exactly.",
        temperature: 0.1,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    if (!parsedData.matchedRules || !Array.isArray(parsedData.matchedRules)) {
      parsedData.matchedRules = matchedRules;
    } else {
      // Merge or prefer parsedData.matchedRules while backfilling any missing from local matchedRules
      const ruleIds = new Set(parsedData.matchedRules.map((r: any) => r.id));
      for (const r of matchedRules) {
        if (!ruleIds.has(r.id)) {
          parsedData.matchedRules.push(r);
        }
      }
    }

    // Post-process / Sanitize parsedData.matchedRules to enforce 100% compliant external links
    if (parsedData.matchedRules && Array.isArray(parsedData.matchedRules)) {
      parsedData.matchedRules = parsedData.matchedRules.filter((r: any) => {
        const phraseToCheck = (r.phrase || r.pattern || "").toLowerCase();
        if (!phraseToCheck) return true;

        let index = textLower.indexOf(phraseToCheck);
        let hasMatchOutsideLinks = false;
        let hasAnyMatch = false;

        while (index !== -1) {
          hasAnyMatch = true;
          const start = index;
          const end = index + phraseToCheck.length;

          const overlapsUrl = urlRanges.some(
            (ur) => (start >= ur.start && start < ur.end) || (end > ur.start && end <= ur.end) || (start <= ur.start && end >= ur.end)
          );
          if (!overlapsUrl) {
            hasMatchOutsideLinks = true;
          }
          index = textLower.indexOf(phraseToCheck, index + 1);
        }

        if (hasAnyMatch && !hasMatchOutsideLinks) {
          return false; // exclude because it is only found within external links
        }
        return true;
      });
    }

    // Filter out dangerousContent and potentialIssues related to external links
    if (parsedData.dangerousContent && Array.isArray(parsedData.dangerousContent)) {
      parsedData.dangerousContent = parsedData.dangerousContent.filter((dc: string) => {
        const lowerDc = dc.toLowerCase();
        return urlRanges.every((ur) => !lowerDc.includes(ur.text.toLowerCase()));
      });
    }
    if (parsedData.potentialIssues && Array.isArray(parsedData.potentialIssues)) {
      parsedData.potentialIssues = parsedData.potentialIssues.filter((pi: string) => {
        const lowerPi = pi.toLowerCase();
        return urlRanges.every((ur) => !lowerPi.includes(ur.text.toLowerCase()));
      });
    }

    // Recalculate safety score and risk level dynamically post-sanitization
    if (parsedData.matchedRules && Array.isArray(parsedData.matchedRules)) {
      if (parsedData.matchedRules.length === 0) {
        parsedData.safetyScore = 100;
        parsedData.riskLevel = "Safe";
        parsedData.dangerousContent = [];
        parsedData.potentialIssues = [];
        if (!parsedData.safeElements || !Array.isArray(parsedData.safeElements)) {
          parsedData.safeElements = [];
        }
        if (!parsedData.safeElements.includes("Perfect guidelines alignment: No fee circumvention triggers or off-platform cues detected.")) {
          parsedData.safeElements.push("Perfect guidelines alignment: No fee circumvention triggers or off-platform cues detected.");
        }
      } else {
        const maxScore = Math.max(...parsedData.matchedRules.map((r: any) => r.riskScore || 0));
        parsedData.safetyScore = Math.max(0, 100 - maxScore);
        const severities = parsedData.matchedRules.map((r: any) => r.severity);
        if (severities.includes("Critical Risk") || severities.includes("High Risk")) {
          parsedData.riskLevel = "High Risk";
        } else {
          parsedData.riskLevel = "Warning";
        }
      }
    }

    return res.json(parsedData);
  } catch (error: any) {
    // If live AI fails or is not connected, fallback to our incredible, precise deterministic results!
    const clarity = safetyScore > 75 ? 9 : 6;
    const professionalism = safetyScore > 85 ? 10 : 5;
    const persuasiveness = safetyScore > 70 ? 8 : 5;
    const trustworthiness = safetyScore > 85 ? 10 : 3;

    return res.json({
      safetyScore,
      riskLevel,
      safeElements,
      potentialIssues,
      dangerousContent,
      highlightedMessage: highlighted,
      correctedMessage: corrected,
      successScore: Math.floor(Math.random() * 20) + 75,
      clientMood,
      communicationQualityScore: {
        clarity,
        professionalism,
        persuasiveness,
        trustworthiness,
      },
      matchedRules,
    });
  }
});

/**
 * -------------------------------------------------------------
 * ENDPOINT 2: AI Fiverr Chat Assistant (Casually Draft Professional Messages)
 * -------------------------------------------------------------
 */
app.post("/api/generate-chat", async (req, res) => {
  const { rawThoughts, tone, messageType, context, templates } = req.body;
  if (!rawThoughts) {
    return res.status(400).json({ error: "rawThoughts is required." });
  }

  let templateContext = "";
  if (templates && Array.isArray(templates) && templates.length > 0) {
    templateContext = `\nUse the following user-provided templates as style and structure inspiration where applicable:\n`;
    templates.forEach((t, i) => {
      templateContext += `Template ${i + 1} (${t.category} - ${t.title}):\n${t.content}\n\n`;
    });
  }

  try {
    const ai = getAiClient();
    const prompt = `You are an AI assistant helping a freelancer write a highly polished, professional, and completely Fiverr-safe message to their client.
The user will provide their "thoughts, ideas, or instructions" below. Your job is to convert them into a final message ready to be sent to the client.
Tone to use: ${tone || "Professional"}
Message Type: ${messageType || "General Message"}
Context: ${context || "None"}${templateContext}

User's thoughts/ideas/instructions: "${rawThoughts}"

Requirements:
- The output should ONLY be the message to the client. Do NOT include phrases like "Here is your delivery message".
- Ensure 100% compliance with Fiverr Rules (no emails, phone numbers, Skype, off-platform request, direct PayPal, etc.)
- Use elegant formatting (bullet points if applicable, warm opening, polite closing, friendly and encouraging tone)
- Keep brackets like [Your Name] or [Project Link] for placeholders that the freelancer can fill out.
- MUST follow the style, formatting, and overall tone of the provided user templates.
- Do NOT use emojis.
- NEVER use the word "feedback" (use "thoughts" instead).
- Do NOT include any text, word, or phrasing that could violate platform rules and regulations.

Return JSON format:
{
  "generatedMessage": "the full finalized message string ready to send"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction:
          "You are Fiverr Lens, an elite freelancing coach that transforms rough notes into outstanding proposals or responses.",
        temperature: 0.7,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (error) { console.error('AI Generation Error:', error);
    // Elegant fallback simulation
    const simulatedMessage = `Hi there!\n\nI hope you're having an amazing day.\n\nI'd be absolutely thrilled to assist you with this! To ensure we are fully aligned on the objectives, could you please provide any branding guidelines, references, or assets here in our Fiverr chat?\n\nI will review them right away and initiate a safe, secure order proposal for you. Looking forward to working together!\n\nBest regards,\n[Your Name]`;
    return res.json({ generatedMessage: simulatedMessage });
  }
});

/**
 * -------------------------------------------------------------
 * ENDPOINT 3: Conversation Studio Analyzer
 * -------------------------------------------------------------
 */
app.post("/api/analyze-conversation", async (req, res) => {
  const { conversationHistory } = req.body;
  if (!conversationHistory) {
    return res.status(400).json({ error: "conversationHistory is required." });
  }

  try {
    const ai = getAiClient();
    const prompt = `Analyze this ongoing Fiverr freelancer-client conversation transcript. 
Extract key insights, customer sentiment, friction points, hidden upsell avenues, and potential risks.

Transcript:
"${conversationHistory}"

Requirements for nextSuggestedResponses:
- Ensure 100% compliance with Fiverr Rules. Do NOT include any text, word, or phrasing that could violate platform rules and regulations.
- NEVER use the word "feedback" (use "thoughts" instead).

Return a JSON object:
{
  "sentiment": "Positive" | "Neutral" | "Frustrated" | "Skeptic" | "Excited",
  "opportunityScore": <number from 0 to 100 on probability of closing an upsell or custom order>,
  "communicationQuality": "Brief summary of current exchange clarity and trust",
  "clientIntent": "What the client wants (e.g., fast delivery, budget discount, premium quality)",
  "recommendations": ["list of strategic communication recommendations"],
  "nextSuggestedResponses": ["suggested copy-paste reply option 1", "suggested copy-paste reply option 2"],
  "negotiationStrategy": "Suggested way to approach pricing or timeline discussion",
  "upsellOpportunities": ["Specific suggestions to upsell extra speed, files, mockups, or source code"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction:
          "You are a world-class negotiation and communication strategist trained to help freelancers increase order value and build deep client trust on Fiverr.",
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    return res.json(JSON.parse(response.text || "{}"));
  } catch (error) {
    // Realistic backup
    return res.json({
      sentiment: "Neutral / Interested",
      opportunityScore: 78,
      communicationQuality:
        "The conversation is positive, but the client seems slightly hesitant about the technical scope and timeline.",
      clientIntent:
        "Seeking technical reassurance and clear reassurance on milestone delivery.",
      recommendations: [
        "Reassure the client about your previous experience in similar niches",
        "Offer to split the project into 2 distinct milestones to minimize risk",
        "Ask direct clarifying questions about their exact deliverables",
      ],
      nextSuggestedResponses: [
        "Thank you for sharing these requirements! I have handled similar projects before. Would you like to split the project into two milestones (Initial Draft & Fine Tuning) to keep everything perfectly controlled?",
        "I completely understand your timeline. I can definitely expedite the delivery. Let me draft a custom order proposal with 24-hour fast-track service right here on Fiverr.",
      ],
      negotiationStrategy:
        "Emphasize value, professional testing, and premium delivery rather than lowering your prices instantly. Offer a custom package with a defined scope.",
      upsellOpportunities: [
        "Include source files (.PSD / Figma / GitHub Repository) as a $35 gig extra",
        "Offer a 12-month post-delivery support package as a recurring milestone",
      ],
    });
  }
});

/**
 * -------------------------------------------------------------
 * ENDPOINT 4: Delivery Assistant Generator
 * -------------------------------------------------------------
 */
app.post("/api/generate-delivery", async (req, res) => {
  const { projectName, deliverables } = req.body;
  if (!projectName || !deliverables) {
    return res
      .status(400)
      .json({ error: "projectName and deliverables are required." });
  }

  try {
    const ai = getAiClient();
    const prompt = `Draft an outstanding, premium Order Delivery Message for Fiverr.
Project Name: ${projectName}
Deliverables: ${deliverables}

Requirements:
- Ensure 100% compliance with Fiverr Rules. Do NOT include any text, word, or phrasing that could violate platform rules and regulations.
- NEVER use the word "feedback" (use "thoughts" instead).

Return a JSON structure:
{
  "deliveryMessage": "A warm, humble, extremely polished delivery message thanking them, highlighting what was made, and asking them to review the attachments. Do NOT use emojis.",
  "documentation": "Structured summary list of files, formats, and assets delivered.",
  "usageInstructions": "Simple step-by-step guidance on how they can run, deploy, or open the deliverables.",
  "clientHandoffNotes": "A professional sign-off mentioning you are available for revisions if anything needs tuning, maintaining high Fiverr guidelines."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction:
          "You are an expert high-ticket client service handoff assistant.",
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    return res.json(JSON.parse(response.text || "{}"));
  } catch (error) {
    return res.json({
      deliveryMessage: `Hi there! I am absolutely thrilled to deliver the finalized work for "${projectName}"!\n\nIt has been an absolute pleasure collaborating with you on this project. I have double-checked all specifications to ensure pristine quality. Please find your files attached below.`,
      documentation: `• Main Source Files\n• Asset package folder\n• Readme setup guides`,
      usageInstructions: `1. Download and extract the attached zip package.\n2. Open the main document/index file.\n3. Follow the custom branding specifications included in your folder.`,
      clientHandoffNotes: `Your thoughts are incredibly valuable to me! If you require any minor adjustments, please feel free to click "Request Revision" and share your suggestions. I'm here to ensure you are 100% satisfied. Thank you!`,
    });
  }
});

/**
 * -------------------------------------------------------------
 * ENDPOINT 5: Proposal Generator
 * -------------------------------------------------------------
 */
app.post("/api/generate-proposal", async (req, res) => {
  const { jobDetails, clientRequirements } = req.body;
  if (!jobDetails) {
    return res.status(400).json({ error: "jobDetails is required." });
  }

  try {
    const ai = getAiClient();
    const prompt = `Draft a compelling, high-converting custom Fiverr Proposal for the client's gig request or message.
Job details: "${jobDetails}"
Client requirements: "${clientRequirements || "General professional project"}"

Requirements:
- Ensure 100% compliance with Fiverr Rules. Do NOT include any text, word, or phrasing that could violate platform rules and regulations.
- NEVER use the word "feedback" (use "thoughts" instead).

Return JSON:
{
  "personalizedProposal": "A professional custom written pitch starting with a strong hook, explaining your custom tailored solution, listing direct technical milestones, and giving an elegant call to action. Do NOT use emojis.",
  "strongOpening": "1-2 sentences of a highly engaging personalized opening hook.",
  "valueProposition": "A concise breakdown of exactly why you are the best fit (speed, high quality, free revision support).",
  "callToAction": "A polite, friendly closing invitation to message you for a custom consultation link."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction:
          "You are a master of sales copy and freelance persuasion on Fiverr, writing with clear, humble, yet confident authority.",
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    return res.json(JSON.parse(response.text || "{}"));
  } catch (error) {
    return res.json({
      personalizedProposal: `Dear Client,\n\nI read your project requirements regarding "${jobDetails}" and I would love to bring your vision to life with high quality standards. I specialize in this exact area, delivering clean, optimized, and fully customized solutions tailored to your branding goals.\n\nHere is how we will approach this:\n1. Wireframing & Asset Collection\n2. Iterative Development & Fine Tuning\n3. Final Verification & Quality Assurance\n\nLet's connect in chat to discuss your custom timeline!`,
      strongOpening: `Hello there! I noticed your request for a specialist to design and launch your platform. I have successfully shipped over 35+ projects with matching requirements!`,
      valueProposition: `✓ Verified top rating output • ✓ Pristine post-delivery support • ✓ Multi-format source deliverables`,
      callToAction: `Are you available for a quick text exchange here in Fiverr inbox? I will provide an immediate customized quote!`,
    });
  }
});

/**
 * -------------------------------------------------------------
 * ENDPOINT 6: Revision & Complaint Response Generator
 * -------------------------------------------------------------
 */
app.post("/api/generate-revision", async (req, res) => {
  const { revisionRequest, complaints } = req.body;
  if (!revisionRequest) {
    return res.status(400).json({ error: "revisionRequest is required." });
  }

  try {
    const ai = getAiClient();
    const prompt = `Draft a polite, highly supportive response to this client revision request or complaint. Maintain extremely secure scope boundaries while remaining exceptionally humble and helpful.
Revision details: "${revisionRequest}"
Client complaints/irritation (if any): "${complaints || "None, general adjustment requested"}"

Requirements:
- Ensure 100% compliance with Fiverr Rules. Do NOT include any text, word, or phrasing that could violate platform rules and regulations.
- NEVER use the word "feedback" (use "thoughts" instead).

Return JSON:
{
  "replyMessage": "A professional, warm, non-defensive message acknowledging their points, stating what you will fix, setting expectation on timeline, and politely clarifying if any items fall outside original project scope. Do NOT use emojis.",
  "nextSteps": ["Step 1 of revision fix", "Step 2 of revision fix"],
  "boundariesMaintained": ["Bullet points of what falls in scope vs what is handled as a separate custom offer if applicable"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction:
          "You are a client relations expert skilled in de-escalation, professional boundary-setting, and positive customer retention on Fiverr.",
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    return res.json(JSON.parse(response.text || "{}"));
  } catch (error) {
    return res.json({
      replyMessage: `Hi there, thank you so much for the detailed thoughts! I completely understand your points and want to make sure this is absolutely perfect for you.\n\nI have reviewed the adjustments requested. I will jump onto these revisions immediately and expect to have an updated draft ready for your review within the next 12-24 hours.`,
      nextSteps: [
        "Revise styling and typography according to your direct notes.",
        "Verify formatting alignment on different viewport screens.",
      ],
      boundariesMaintained: [
        "In-scope: All styling refinements and text revisions of the original pages.",
        "Out-of-scope: Adding completely new pages or functions can be easily added as an additional custom gig milestone.",
      ],
    });
  }
});

/**
 * -------------------------------------------------------------
 * ENDPOINT 7: Template Generator
 * -------------------------------------------------------------
 */
app.post("/api/generate-template", async (req, res) => {
  const { templateTopic, category } = req.body;
  if (!templateTopic) {
    return res.status(400).json({ error: "templateTopic is required." });
  }

  try {
    const ai = getAiClient();
    const prompt = `Create a brand new Fiverr messaging template based on this topic: "${templateTopic}".
Category: "${category || "General"}"

Requirements:
- Ensure 100% compliance with Fiverr Rules. Do NOT include any text, word, or phrasing that could violate platform rules and regulations.
- NEVER use the word "feedback" (use "thoughts" instead).

Return JSON:
{
  "title": "A short, professional, catchy title for the template without any emojis",
  "content": "The full template text body with [brackets] placeholders for customizable fields. Do NOT use emojis."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction:
          "You are Fiverr Lens Template Generator. Create highly effective copy-paste templates for freelancers.",
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    return res.json(JSON.parse(response.text || "{}"));
  } catch (error) {
    return res.json({
      title: `Custom: ${templateTopic.substring(0, 20)}...`,
      content: `Hello [Client Name],\n\nThank you for reaching out regarding [${templateTopic}]. I'd be absolutely thrilled to assist you with this project!\n\nTo help me tailor a custom quotation, could you please provide:\n- [Requirement 1]\n- [Requirement 2]\n\nI am confident we can deliver a premium output for you right here on Fiverr. Looking forward to chatting!\n\nWarm regards,\n[Your Name]`,
    });
  }
});

// Vite middleware setup for Development & Production Build handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("Failed to start full-stack server:", err);
  });
}

export default app;
