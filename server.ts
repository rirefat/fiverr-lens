import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { scanMessage } from "./src/utils/rulesEngine.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Fallback drafts based on violation categories and chosen tone style
function getLocalFallbackDraft(categories: string[], isFreelancerDraft: boolean = false, tone: string = "professional"): string {
  let baseMsg = "";

  if (isFreelancerDraft) {
    if (categories.includes("Off-Platform Communication")) {
      baseMsg = "I would be happy to discuss the details and requirements of your project right here on Fiverr's secure platform!";
    } else if (categories.includes("Off-Platform Payment")) {
      baseMsg = "We can set up a secure, official custom milestone directly on Fiverr to handle order payments safely.";
    } else if (categories.includes("Academic Work (Homework/Exams)")) {
      baseMsg = "I can offer tutoring and concept explanation sessions to help you understand the topics, fully compliant with academic guidelines.";
    } else if (categories.includes("Review & Feedback Manipulation")) {
      baseMsg = "I am committed to providing high-quality service and honest guidance based on the technical requirements of the work.";
    } else {
      baseMsg = "Thank you! I would love to assist you with this project. We can discuss your specific goals and files safely here.";
    }
  } else {
    // Responding to client messages
    if (categories.includes("Off-Platform Communication")) {
      baseMsg = "I would love to help you with this project! However, to comply with Fiverr's Terms of Service and keep our communication secure, we must keep all discussions strictly here in Fiverr's chat. Please let me know your requirements right here, and we can get started!";
    } else if (categories.includes("Off-Platform Payment")) {
      baseMsg = "Thank you for reaching out! I am very excited to work with you. However, to respect Fiverr's safety guidelines and terms of service, all payments and orders must be processed safely and securely through the Fiverr system. I would be happy to send you a custom offer directly in this thread so we can begin!";
    } else if (categories.includes("Academic Work (Homework/Exams)")) {
      baseMsg = "Thank you for your message. Please note that I cannot complete academic homework, tests, quizzes, or university assignments on your behalf, as academic fraud violates educational codes of conduct and Fiverr's Terms of Service. If you need general coaching or tutoring helper sessions on these topics, let me know how we can collaborate within Fiverr's rules!";
    } else if (categories.includes("Review & Feedback Manipulation")) {
      baseMsg = "Thank you for contacting me! Please be aware that Fiverr strictly prohibits buying, selling, or swapping reviews or feedback ratings. I concentrate on delivering high-quality service and honest cooperation. I would be glad to help you with your actual project requirements here on Fiverr!";
    } else if (categories.includes("Free Work Demands")) {
      baseMsg = "Thank you for your interest! I do not offer unpaid custom test tasks or free trial designs. However, you are very welcome to browse my extensive work samples on my profile gig page, or we can open a small, paid test milestone to make sure everything matches your requirements perfectly.";
    } else {
      baseMsg = "Thank you so much for reaching out! I would love to assist you with this project. To get started, could you share more details about your timeline, design references, and any technical files you have? Let's discuss your requirements here!";
    }
  }

  // Adjust reply message based on the chosen tone selector
  const activeTone = (tone || "professional").toLowerCase();
  
  if (activeTone === "concise") {
    if (categories.includes("Off-Platform Communication")) {
      return isFreelancerDraft 
        ? "We can discuss and outline your project requirements strictly here on Fiverr." 
        : "Let's keep our communication here on Fiverr to respect the platform's guidelines.";
    }
    if (categories.includes("Off-Platform Payment")) {
      return isFreelancerDraft
        ? "I can only accept secure payments processed directly through Fiverr milestones."
        : "Let's process the ordering payment safely using an official Fiverr custom offer.";
    }
    if (categories.includes("Academic Work (Homework/Exams)")) {
      return "I cannot complete graded homework or online exams. I can only offer conceptual tutoring.";
    }
    return "Please share your project core files and details right here on Fiverr so we can start!";
  }

  if (activeTone === "friendly") {
    return "Hi there! 😊 " + baseMsg.replace("Thank you", "Thanks so much").replace("I would love", "I'd absolutely love to");
  }

  if (activeTone === "firm") {
    return "Official Notice: To fully comply with Fiverr's Terms of Service, all communications, files, and milestones of this order must be handled strictly inside our chat thread on Fiverr. " + baseMsg.replace("Thank you", "").trim();
  }

  // Default is professional
  return baseMsg;
}

// API: Analyze message
app.post("/api/analyze", async (req, res) => {
  try {
    const { message, tone = "professional" } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message must be a non-empty string" });
    }

    // 1. Run local rules engine scanner
    const scanResult = scanMessage(message);

    // Detect if the text sounds like a freelancer's proposed draft/outgoing text
    // (e.g., has "i can do", "i will", "my rate", "my gig", "send me", or starts with "Hi [Name]")
    const lowercaseMessage = message.toLowerCase();
    const isFreelancerDraft = lowercaseMessage.includes("i can") || 
                              lowercaseMessage.includes("i will") || 
                              lowercaseMessage.includes("my gig") || 
                              lowercaseMessage.includes("my profile") ||
                              lowercaseMessage.includes("my price") || 
                              lowercaseMessage.includes("delivery");

    // 2. Try the Gemini API
    const ai = getGeminiClient();
    if (ai) {
      try {
        const systemPrompt = `You are an expert safety auditor and compliant reply/message sanitizer for Fiverr freelancers and sellers.
Your goal is to inspect any input message to ensure it does not violate Fiverr's strict Terms of Service (TOS). This includes off-platform payments, off-platform communication sharing (Skype, WhatsApp, Zoom, emails, phone numbers), academic fraud, review manipulation, and work for free.

Analyze the input message: "${message}".

The desired tone for the recommended compliantDraft is: "${tone.toUpperCase()}".
The guidelines for each tone are:
- PROFESSIONAL: Business-focused, respectful, polished, clear boundaries, polite. Default tone.
- FRIENDLY: Warm, enthusiastic, empathetic, uses positive phrasing and active help while remaining fully compliant and safe.
- FIRM: Direct, strict adherence to rules, uncompromising, unambiguous, making it extremely clear that complying with Fiverr's Terms of Service is non-negotiable.
- CONCISE: Extremely short, directly to the point, zero extra sentences, minimal phrasing (1-2 sentences maximum).

Determine which situation applies:
1. If the input message is a draft the freelancer/seller intends to send, clean up and sanitize it: rewrite it to be 100% safe, professional, and free of any warnings or policy-violating terms, maintaining the freelancer's technical intent while keeping communications and payments strictly on Fiverr. Shape it exactly into the requested tone ("${tone.toUpperCase()}").
2. If the input message is a client inquiry arriving to the freelancer: draft a rule-compliant, polite, and persuasive Response Reply that addresses the client's business demand but refuses any violations gracefully while trying to open the project safely on-platform. Shape it exactly into the requested tone ("${tone.toUpperCase()}").

Return the response strictly as a JSON object matching this schema structure:
{
  "safetyScore": number, // 0 to 100, where 100 is perfectly safe and 0 is high danger
  "safetyStatus": "safe" | "caution" | "danger", // matching overall severity
  "aiSummary": string, // a warm, supportive 2-3 sentence explanation of the safety assessment and why changes/improvements were recommended
  "compliantDraft": string, // the recommended improved/sanitized/response version of that message
  "detectedThemes": string[] // list of violating themes (e.g., ["Off-Platform Communication", "Off-Platform Payment"])
}
Make sure you never output any markdown formatting around the JSON string. Do not include any trailing commas or invalid JSON attributes.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: systemPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                safetyScore: { type: Type.INTEGER },
                safetyStatus: { type: Type.STRING },
                aiSummary: { type: Type.STRING },
                compliantDraft: { type: Type.STRING },
                detectedThemes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["safetyScore", "safetyStatus", "aiSummary", "compliantDraft", "detectedThemes"]
            }
          }
        });

        const rawText = response.text;
        if (rawText) {
          const jsonResult = JSON.parse(rawText.trim());
          
          return res.json({
            ...jsonResult,
            violations: scanResult.violations,
            isFreelancerDraft,
            usingFallback: false
          });
        }
      } catch (err) {
        console.warn("Gemini content generation failed, defaulting to local fallback rules:", err);
      }
    }

    // 3. Fallback Mode (No API key or API failure)
    const activeCategories = Array.from(new Set(scanResult.violations.map(v => v.category)));
    const compliantDraft = getLocalFallbackDraft(activeCategories, isFreelancerDraft, tone);
    
    return res.json({
      customMessage: true,
      safetyScore: scanResult.safetyScore,
      safetyStatus: scanResult.overallStatus,
      aiSummary: `${scanResult.summaryText} (Note: Running in high-performance local analysis mode)`,
      compliantDraft,
      detectedThemes: activeCategories,
      violations: scanResult.violations,
      isFreelancerDraft,
      usingFallback: true
    });

  } catch (error: any) {
    console.error("API Error during analysis:", error);
    res.status(500).json({ error: "Internal server error occurred during message scanning." });
  }
});

// Configure Vite middleware or serve static build
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting developer experience server (Vite middleware inside express)...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fiverr Safety app running at http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to start server:", err);
});
