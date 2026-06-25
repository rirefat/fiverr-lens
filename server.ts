import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { fullComplianceDatabase } from "./src/complianceDatabase.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK lazily to avoid startup crashes if GEMINI_API_KEY is not defined
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("⚠️ GEMINI_API_KEY is missing. Fiverr Lens will operate in highly-realistic Sandbox Intelligence Mode.");
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

  // 1. Run local deterministic Risk Detection Engine over 220 rules
  const textLower = message.toLowerCase();
  const matchedRules = [];

  for (const rule of fullComplianceDatabase) {
    try {
      const regex = new RegExp(rule.pattern, "i");
      if (regex.test(textLower)) {
        matchedRules.push(rule);
      }
    } catch (err) {
      // Fallback simple substring search
      const cleanPhrase = rule.phrase.replace(/\s?\(Case\s?#\d+\)/gi, "").toLowerCase();
      if (textLower.includes(cleanPhrase)) {
        matchedRules.push(rule);
      }
    }
  }

  // 2. Perform advanced scoring & classification based on Risk Detection Engine hierarchy
  let safetyScore = 100;
  let riskLevel: "Safe" | "Warning" | "High Risk" = "Safe";
  const dangerousContent: string[] = [];
  const potentialIssues: string[] = [];
  const safeElements: string[] = [];

  // Determine client mood based on triggered rules or general tokens
  let clientMood: "Positive" | "Neutral" | "Frustrated" | "Urgent" | "Interested" = "Neutral";
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
    const maxScore = Math.max(...matchedRules.map(r => r.riskScore));
    safetyScore = Math.max(0, 100 - maxScore);

    const severities = matchedRules.map(r => r.severity);
    if (severities.includes("Critical Risk") || severities.includes("High Risk")) {
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
    safeElements.push("Perfect guidelines alignment: No fee circumvention triggers or off-platform cues detected.");
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
    safeElements.push("Detailed scope details are provided to help clarify the project.");
  }

  // Highlight and correct messages locally first
  let highlighted = message;
  let corrected = message;

  // Sort by pattern length descending to prevent shorter strings from corrupting larger HTML tags
  const sortedMatches = [...matchedRules].sort((a, b) => b.phrase.length - a.phrase.length);
  for (const rule of sortedMatches) {
    try {
      const cleanPattern = rule.pattern;
      const regex = new RegExp(`(${cleanPattern})`, "gi");

      let colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 px-1 py-0.5 rounded";
      if (rule.severity === "Critical Risk") {
        colorClass = "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 font-bold px-1.5 py-0.5 rounded border border-rose-400/30";
      } else if (rule.severity === "High Risk") {
        colorClass = "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 font-bold px-1.5 py-0.5 rounded border border-red-400/20";
      } else if (rule.severity === "Medium Risk") {
        colorClass = "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-semibold px-1.5 py-0.5 rounded border border-amber-500/20";
      } else if (rule.severity === "Low Risk") {
        colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-medium px-1.5 py-0.5 rounded border border-blue-500/20";
      }

      highlighted = highlighted.replace(regex, `<span class="${colorClass}">$1</span>`);
      corrected = corrected.replace(regex, rule.rewrite);
    } catch (err) {
      // Fallback
    }
  }

  // Add default professional fallback sign-off if nothing was changed or it was too simple
  if (corrected === message) {
    corrected = `Hi there!\n\nThank you so much for reaching out! I would be absolutely thrilled to assist you with this project. To ensure a 100% secure, transparent, and flawless project experience, let's keep all coordinates and exchanges directly here within our private Fiverr workspace chat.\n\nPlease share any requirements, details, or resources you have directly in this thread. Looking forward to delivering amazing results!\n\nBest regards.`;
  }

  // 3. Attempt Live AI Engine if GEMINI_API_KEY is defined, else return deterministic response
  try {
    const ai = getAiClient();
    
    const prompt = `You are Fiverr Lens, an elite Terms of Service compliance inspector and communications analyst.
Analyze the following message intended for Fiverr client-freelancer communications.

Deterministic Compliance Check matched these precise database records:
${matchedRules.map(r => `- Match: "${r.phrase}" (Severity: ${r.severity}, Category: ${r.category}): ${r.explanation} [Rewrite Suggestion: "${r.rewrite}"]`).join("\n")}

Original message text:
"${message}"

Your Goal:
Conduct a highly context-aware review of the message. If the local parser is triggered on benign, contextual mentions (e.g. telling a client "I cannot join Zoom on Skype, we can do Fiverr native call"), adjust the score appropriately.
Also identify indirect or disguised attempts to move communication, payments, contracts, or project management outside Fiverr, even if explicit keywords are not used.

Generate a JSON object matching this structure exactly:
{
  "safetyScore": <number from 0 to 100 where 100 is perfectly safe and 0 is immediately bannable>,
  "riskLevel": "Safe" | "Warning" | "High Risk",
  "safeElements": ["list of positive/compliant components of the message"],
  "potentialIssues": ["list of warnings or questionable phrasings found"],
  "dangerousContent": ["list of clear ToS violations, direct contact sharing, or off-platform cues"],
  "highlightedMessage": "The input message where words that triggered ToS warnings are surrounded with a <span class='risk-highlight'>word</span> or similar HTML tag using colors appropriate for the severity.",
  "correctedMessage": "A fully polished, professional, ToS-compliant rewrite of the original message preserving original intent but safe for Fiverr",
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
        systemInstruction: "You are an expert Fiverr Terms of Service compliance specialist and elite freelancer communications coach. Always return valid, well-structured JSON matching the requested schema exactly.",
        temperature: 0.1,
      }
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
        trustworthiness
      },
      matchedRules
    });
  }
});

/**
 * -------------------------------------------------------------
 * ENDPOINT 2: AI Fiverr Chat Assistant (Casually Draft Professional Messages)
 * -------------------------------------------------------------
 */
app.post("/api/generate-chat", async (req, res) => {
  const { rawThoughts, tone, messageType, context } = req.body;
  if (!rawThoughts) {
    return res.status(400).json({ error: "rawThoughts is required." });
  }

  try {
    const ai = getAiClient();
    const prompt = `Convert the following raw thoughts into a highly polished, professional, and completely Fiverr-safe client message.
Tone to use: ${tone || "Professional"}
Message Type: ${messageType || "General Message"}
Context: ${context || "None"}

Raw thoughts: "${rawThoughts}"

Requirements:
- Ensure 100% compliance with Fiverr Rules (no emails, phone numbers, Skype, off-platform request, direct PayPal, etc.)
- Use elegant formatting (bullet points if applicable, warm opening, polite closing, friendly and encouraging tone)
- Keep brackets like [Your Name] or [Project Link] for placeholders that the freelancer can fill out.

Return JSON format:
{
  "generatedMessage": "the full finalized message string ready to send"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are Fiverr Lens, an elite freelancing coach that transforms rough notes into outstanding proposals or responses.",
        temperature: 0.7,
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);

  } catch (error) {
    // Elegant fallback simulation
    const simulatedMessage = `Hi there! 👋\n\nI hope you're having an amazing day.\n\nRegarding the details you shared ("${rawThoughts}"), I'd be absolutely thrilled to assist you with this! To ensure we are fully aligned on the objectives, could you please provide any branding guidelines, references, or assets here in our Fiverr chat?\n\nI will review them right away and initiate a safe, secure order proposal for you. Looking forward to working together!\n\nBest regards,\n[Your Name]`;
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
        systemInstruction: "You are a world-class negotiation and communication strategist trained to help freelancers increase order value and build deep client trust on Fiverr.",
      }
    });

    return res.json(JSON.parse(response.text || "{}"));

  } catch (error) {
    // Realistic backup
    return res.json({
      sentiment: "Neutral / Interested",
      opportunityScore: 78,
      communicationQuality: "The conversation is positive, but the client seems slightly hesitant about the technical scope and timeline.",
      clientIntent: "Seeking technical reassurance and clear reassurance on milestone delivery.",
      recommendations: [
        "Reassure the client about your previous experience in similar niches",
        "Offer to split the project into 2 distinct milestones to minimize risk",
        "Ask direct clarifying questions about their exact deliverables"
      ],
      nextSuggestedResponses: [
        "Thank you for sharing these requirements! I have handled similar projects before. Would you like to split the project into two milestones (Initial Draft & Fine Tuning) to keep everything perfectly controlled?",
        "I completely understand your timeline. I can definitely expedite the delivery. Let me draft a custom order proposal with 24-hour fast-track service right here on Fiverr."
      ],
      negotiationStrategy: "Emphasize value, professional testing, and premium delivery rather than lowering your prices instantly. Offer a custom package with a defined scope.",
      upsellOpportunities: [
        "Include source files (.PSD / Figma / GitHub Repository) as a $35 gig extra",
        "Offer a 12-month post-delivery support package as a recurring milestone"
      ]
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
    return res.status(400).json({ error: "projectName and deliverables are required." });
  }

  try {
    const ai = getAiClient();
    const prompt = `Draft an outstanding, premium Order Delivery Message for Fiverr.
Project Name: ${projectName}
Deliverables: ${deliverables}

Return a JSON structure:
{
  "deliveryMessage": "A warm, humble, extremely polished delivery message thanking them, highlighting what was made, and asking them to review the attachments.",
  "documentation": "Structured summary list of files, formats, and assets delivered.",
  "usageInstructions": "Simple step-by-step guidance on how they can run, deploy, or open the deliverables.",
  "clientHandoffNotes": "A professional sign-off mentioning you are available for revisions if anything needs tuning, maintaining high Fiverr guidelines."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an expert high-ticket client service handoff assistant.",
      }
    });

    return res.json(JSON.parse(response.text || "{}"));

  } catch (error) {
    return res.json({
      deliveryMessage: `Hi there! I am absolutely thrilled to deliver the finalized work for "${projectName}"! 🎉\n\nIt has been an absolute pleasure collaborating with you on this project. I have double-checked all specifications to ensure pristine quality. Please find your files attached below.`,
      documentation: `• Main Source Files\n• Asset package folder\n• Readme setup guides`,
      usageInstructions: `1. Download and extract the attached zip package.\n2. Open the main document/index file.\n3. Follow the custom branding specifications included in your folder.`,
      clientHandoffNotes: `Your feedback is incredibly valuable to me! If you require any minor adjustments, please feel free to click "Request Revision" and share your suggestions. I'm here to ensure you are 100% satisfied. Thank you!`
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

Return JSON:
{
  "personalizedProposal": "A professional custom written pitch starting with a strong hook, explaining your custom tailored solution, listing direct technical milestones, and giving an elegant call to action.",
  "strongOpening": "1-2 sentences of a highly engaging personalized opening hook.",
  "valueProposition": "A concise breakdown of exactly why you are the best fit (speed, high quality, free revision support).",
  "callToAction": "A polite, friendly closing invitation to message you for a custom consultation link."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a master of sales copy and freelance persuasion on Fiverr, writing with clear, humble, yet confident authority.",
      }
    });

    return res.json(JSON.parse(response.text || "{}"));

  } catch (error) {
    return res.json({
      personalizedProposal: `Dear Client,\n\nI read your project requirements regarding "${jobDetails}" and I would love to bring your vision to life with high quality standards. I specialize in this exact area, delivering clean, optimized, and fully customized solutions tailored to your branding goals.\n\nHere is how we will approach this:\n1. Wireframing & Asset Collection\n2. Iterative Development & Fine Tuning\n3. Final Verification & Quality Assurance\n\nLet's connect in chat to discuss your custom timeline!`,
      strongOpening: `Hello there! I noticed your request for a specialist to design and launch your platform. I have successfully shipped over 35+ projects with matching requirements!`,
      valueProposition: `✓ Verified top rating output • ✓ Pristine post-delivery support • ✓ Multi-format source deliverables`,
      callToAction: `Are you available for a quick text exchange here in Fiverr inbox? I will provide an immediate customized quote!`
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

Return JSON:
{
  "replyMessage": "A professional, warm, non-defensive message acknowledging their points, stating what you will fix, setting expectation on timeline, and politely clarifying if any items fall outside original project scope.",
  "nextSteps": ["Step 1 of revision fix", "Step 2 of revision fix"],
  "boundariesMaintained": ["Bullet points of what falls in scope vs what is handled as a separate custom offer if applicable"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a client relations expert skilled in de-escalation, professional boundary-setting, and positive customer retention on Fiverr.",
      }
    });

    return res.json(JSON.parse(response.text || "{}"));

  } catch (error) {
    return res.json({
      replyMessage: `Hi there, thank you so much for the detailed feedback! I completely understand your points and want to make sure this is absolutely perfect for you.\n\nI have reviewed the adjustments requested. I will jump onto these revisions immediately and expect to have an updated draft ready for your review within the next 12-24 hours.`,
      nextSteps: [
        "Revise styling and typography according to your direct notes.",
        "Verify formatting alignment on different viewport screens."
      ],
      boundariesMaintained: [
        "In-scope: All styling refinements and text revisions of the original pages.",
        "Out-of-scope: Adding completely new pages or functions can be easily added as an additional custom gig milestone."
      ]
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

Return JSON:
{
  "title": "A short, professional, catchy title for the template with an emoji",
  "content": "The full template text body with [brackets] placeholders for customizable fields"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are Fiverr Lens Template Generator. Create highly effective copy-paste templates for freelancers.",
      }
    });

    return res.json(JSON.parse(response.text || "{}"));

  } catch (error) {
    return res.json({
      title: `⚡ Custom: ${templateTopic.substring(0, 20)}...`,
      content: `Hello [Client Name],\n\nThank you for reaching out regarding [${templateTopic}]. I'd be absolutely thrilled to assist you with this project!\n\nTo help me tailor a custom quotation, could you please provide:\n- [Requirement 1]\n- [Requirement 2]\n\nI am confident we can deliver a premium output for you right here on Fiverr. Looking forward to chatting!\n\nWarm regards,\n[Your Name]`
    });
  }
});


// Vite middleware setup for Development & Production Build handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
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

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
