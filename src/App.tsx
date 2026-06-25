import { useState, useEffect } from "react";
import { 
  Shield, Sparkles, Copy, Check, AlertCircle, RefreshCw, 
  BookOpen, CheckCircle2, ChevronRight, HelpCircle, Flame,
  FileText, ArrowRight, Terminal, Network, ShieldCheck,
  Search, Filter, X, ShieldAlert, Info, Activity, Globe, Eye,
  Trash2, CreditCard, Video, Star, Share2, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fullComplianceDatabase, ComplianceRule } from "./complianceDatabase";

interface SafetyAnalysis {
  safetyScore: number;
  riskLevel: "Safe" | "Warning" | "High Risk";
  safeElements: string[];
  potentialIssues: string[];
  dangerousContent: string[];
  highlightedMessage: string;
  correctedMessage: string;
  successScore: number;
  clientMood: string;
  communicationQualityScore: {
    clarity: number;
    professionalism: number;
    persuasiveness: number;
    trustworthiness: number;
  };
  matchedRules?: ComplianceRule[];
}

interface TypewriterTextProps {
  text: string;
  speedMs?: number;
  onComplete?: () => void;
}

function TypewriterText({ text, speedMs = 12, onComplete }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsSkipped(false);
  }, [text]);

  useEffect(() => {
    if (isSkipped) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      onComplete?.();
      return;
    }

    if (currentIndex < text.length) {
      const calculatedSpeed = Math.max(3, Math.min(speedMs, Math.floor(1200 / text.length)));
      const step = text.length > 300 ? Math.ceil(text.length / 150) : 1;
      
      const timeout = setTimeout(() => {
        const nextIndex = Math.min(currentIndex + step, text.length);
        setDisplayedText(text.slice(0, nextIndex));
        setCurrentIndex(nextIndex);
      }, calculatedSpeed);
      return () => clearTimeout(timeout);
    } else {
      onComplete?.();
    }
  }, [currentIndex, text, speedMs, isSkipped, onComplete]);

  return (
    <span 
      onClick={() => setIsSkipped(true)}
      title="Click to instantly skip typing"
      className="cursor-pointer select-text relative"
    >
      {displayedText}
      {currentIndex < text.length && !isSkipped && (
        <span className="inline-block w-[3.5px] h-[13px] bg-indigo-500 ml-1 animate-pulse rounded-full align-middle" />
      )}
    </span>
  );
}

interface TextSegment {
  text: string;
  isMatch: boolean;
  rule?: ComplianceRule;
}

const getSegments = (text: string, rules: ComplianceRule[]): TextSegment[] => {
  if (!rules || rules.length === 0 || !text) {
    return [{ text, isMatch: false }];
  }

  interface MatchRange {
    start: number;
    end: number;
    rule: ComplianceRule;
    matchedText: string;
  }
  
  const ranges: MatchRange[] = [];
  
  for (const rule of rules) {
    try {
      const regex = new RegExp(`(${rule.pattern})`, "gi");
      let match;
      while ((match = regex.exec(text)) !== null) {
        const start = match.index;
        const end = regex.lastIndex;
        if (start === end) {
          regex.lastIndex++;
          continue;
        }
        ranges.push({
          start,
          end,
          rule,
          matchedText: match[0]
        });
      }
    } catch (e) {
      const phrase = rule.phrase.replace(/\s?\(Case\s?#\d+\)/gi, "");
      let index = text.toLowerCase().indexOf(phrase.toLowerCase());
      while (index !== -1) {
        ranges.push({
          start: index,
          end: index + phrase.length,
          rule,
          matchedText: text.substring(index, index + phrase.length)
        });
        index = text.toLowerCase().indexOf(phrase.toLowerCase(), index + 1);
      }
    }
  }

  ranges.sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start;
    }
    return (b.end - b.start) - (a.end - a.start);
  });

  const activeRanges: MatchRange[] = [];
  let lastEnd = 0;
  for (const r of ranges) {
    if (r.start >= lastEnd) {
      activeRanges.push(r);
      lastEnd = r.end;
    }
  }

  const segments: TextSegment[] = [];
  let currentIndex = 0;
  for (const r of activeRanges) {
    if (r.start > currentIndex) {
      segments.push({
        text: text.substring(currentIndex, r.start),
        isMatch: false
      });
    }
    segments.push({
      text: text.substring(r.start, r.end),
      isMatch: true,
      rule: r.rule
    });
    currentIndex = r.end;
  }

  if (currentIndex < text.length) {
    segments.push({
      text: text.substring(currentIndex),
      isMatch: false
    });
  }

  return segments;
};

interface DisguisedForm {
  type: string;
  value: string;
}

const getDisguisedForms = (text: string): DisguisedForm[] => {
  if (!text) return [];
  const lower = text.toLowerCase().trim();
  const forms: DisguisedForm[] = [];

  // Special overrides for "gmail" based on the user's explicit example
  if (lower === "gmail") {
    forms.push({ type: "Compound Space", value: "g mail" });
    forms.push({ type: "Dotted Letters", value: "g.m.a.i.l" });
    forms.push({ type: "Hyphenated Word", value: "g-mail" });
    forms.push({ type: "Spaced Letters", value: "g m a i l" });
    return forms;
  }

  // Generative for other terms, matching the user requested pattern style!
  const letters = text.split("");
  const first = letters[0] || "";
  const rest = letters.slice(1).join("");
  
  // 1. Compound Space / Half Space (e.g. "whatsapp" -> "whats app", "skype" -> "sky pe")
  let compound = "";
  if (lower === "whatsapp" || lower === "whats app") {
    compound = "whats app";
  } else if (lower === "paypal" || lower === "pay pal") {
    compound = "pay pal";
  } else if (lower === "skype") {
    compound = "sky pe";
  } else if (lower === "telegram") {
    compound = "tele gram";
  } else if (lower === "discord") {
    compound = "dis cord";
  } else if (lower === "wechat" || lower === "we chat") {
    compound = "we chat";
  } else if (lower === "viber") {
    compound = "vi ber";
  } else if (lower === "linkedin") {
    compound = "linked in";
  } else if (text.length >= 4) {
    const mid = Math.floor(text.length / 2);
    compound = text.slice(0, mid) + " " + text.slice(mid);
  } else {
    compound = first + " " + rest;
  }

  // 2. Dotted Letters (e.g. "g.m.a.i.l", "s.k.y.p.e", "p.a.y.p.a.l")
  const dotted = letters.join(".");

  // 3. Hyphenated Word (e.g. "g-mail", "s-k-y-p-e" or "sky-pe" or "whats-app" or "pay-pal")
  let hyphenated = "";
  if (lower === "whatsapp" || lower === "whats app") {
    hyphenated = "whats-app";
  } else if (lower === "paypal" || lower === "pay pal") {
    hyphenated = "pay-pal";
  } else if (lower === "skype") {
    hyphenated = "sky-pe";
  } else if (lower === "telegram") {
    hyphenated = "tele-gram";
  } else if (lower === "discord") {
    hyphenated = "dis-cord";
  } else {
    hyphenated = letters.join("-");
  }

  // 4. Spaced Letters (e.g. "g m a i l", "s k y p e", "p a y p a l")
  const spaced = letters.join(" ");

  forms.push({ type: "Compound Space", value: compound });
  forms.push({ type: "Dotted Letters", value: dotted });
  forms.push({ type: "Hyphenated Word", value: hyphenated });
  forms.push({ type: "Spaced Letters", value: spaced });

  return forms;
};

const runLocalAnalysis = (message: string): SafetyAnalysis => {
  const textLower = message.toLowerCase();
  const matchedRules: ComplianceRule[] = [];

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

  // Perform advanced scoring & classification
  let safetyScore = 100;
  let riskLevel: "Safe" | "Warning" | "High Risk" = "Safe";
  const dangerousContent: string[] = [];
  const potentialIssues: string[] = [];
  const safeElements: string[] = [];

  // Determine client mood
  let clientMood = "Neutral";
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

  // Highlight and correct messages locally
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

  const clarity = safetyScore > 75 ? 9 : 6;
  const professionalism = safetyScore > 85 ? 10 : 5;
  const persuasiveness = safetyScore > 70 ? 8 : 5;
  const trustworthiness = safetyScore > 85 ? 10 : 3;

  return {
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
  };
};

const runLocalCompose = (thoughts: string, tone: string): string => {
  const t = tone.toLowerCase();
  
  // Custom smart client-side rewrites based on selected tone
  let greeting = "Hi there! 👋";
  let signoff = "Best regards,\n[Your Name]";
  
  if (t === "friendly" || t === "warm") {
    greeting = "Hello! Hope you're having an amazing day. 😊";
    signoff = "Warmly,\n[Your Name]";
  } else if (t === "persuasive" || t === "confident") {
    greeting = "Hello! I looked over your project details, and I'm highly confident we can achieve outstanding results together.";
    signoff = "Looking forward to partnering with you,\n[Your Name]";
  } else if (t === "casual" || t === "direct") {
    greeting = "Hey there,";
    signoff = "Thanks,\n[Your Name]";
  }

  // Pre-process raw thoughts to replace direct contact info and prevent leaks
  let cleanThoughts = thoughts;
  const textLower = thoughts.toLowerCase();
  
  for (const rule of fullComplianceDatabase) {
    try {
      const regex = new RegExp(rule.pattern, "gi");
      if (regex.test(textLower)) {
        cleanThoughts = cleanThoughts.replace(regex, rule.rewrite);
      }
    } catch {
      // ignore
    }
  }

  return `${greeting}\n\nThank you so much for sharing your ideas. Regarding your request:\n"${cleanThoughts}"\n\nI'd be absolutely thrilled to assist you with this! To ensure we are fully aligned on the objectives and to adhere strictly to Fiverr's guidelines, let's keep all coordinates, project assets, and exchanges directly here in our Fiverr inbox.\n\nCould you please let me know your preferred timeline and if you have any references or specifications? I am ready to customize a secure proposal for you right here.\n\n${signoff}`;
};

const playbookData = {
  payment: {
    title: "Payments & Invoices",
    badge: "External Payments",
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/25",
    text: "Requesting payment via PayPal, CashApp, or direct wire bypasses Fiverr's secure payment escrow, leading to immediate account flags or suspension.",
    dangerWords: ["PayPal", "CashApp", "Direct Invoice", "Bank transfer", "Crypto", "BTC"],
    alternatives: [
      {
        label: "Secure Milestone Offer",
        original: "Send me payment on PayPal so we avoid the 20% commission fee.",
        safe: "I will set up structured, secure payment milestones directly here on Fiverr for this project."
      },
      {
        label: "Fiverr Escrow Checkout",
        original: "Pay me half directly via bank transfer first, then I start.",
        safe: "I have prepared a secure custom order proposal on Fiverr. You can confirm it to safely fund the escrow."
      }
    ],
    strategy: "Keep all financial discussion tied to custom offers. Escrow funding guarantees you are paid upon successful completion of your deliveries."
  },
  meeting: {
    title: "Meetings & Calls",
    badge: "Off-Platform Calls",
    textColor: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/25",
    text: "Exchanging Skype usernames, WhatsApp numbers, or personal Discord tags before an order is placed triggers immediate automated Fiverr filter warnings.",
    dangerWords: ["Skype username", "WhatsApp number", "Add my Discord", "Personal phone number", "Google Meet link"],
    alternatives: [
      {
        label: "Native Video Call",
        original: "Let's talk on Skype or WhatsApp to details requirements.",
        safe: "Let's schedule an official Fiverr video consultation right here in our inbox to clarify project requirements."
      },
      {
        label: "Audio Handoff Notes",
        original: "Give me your phone number so we can have a quick call.",
        safe: "We can securely use Fiverr's built-in voice call scheduler inside our order thread once the order is active."
      }
    ],
    strategy: "Pre-order external links are strictly forbidden. Did you know Fiverr provides built-in high-quality video call schedulers directly inside client chat?"
  },
  review: {
    title: "Ratings & Anti-Coercion",
    badge: "Review Manipulation",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/25",
    text: "Demanding 5-star feedback, offering discounts in exchange for positive reviews, or withholding delivery source files violates feedback integrity rules.",
    dangerWords: ["give 5 stars", "positive review for discount", "change rating to refund", "5-star rating hold"],
    alternatives: [
      {
        label: "Neutral Evaluation",
        original: "Please write a 5-star rating for me so my gig stays ranked high.",
        safe: "I have delivered the final project files. Your honest feedback on this order is highly appreciated!"
      },
      {
        label: "Neutral Review Reminder",
        original: "I will send the source assets after you leave me a good review.",
        safe: "Once you have reviewed the deliverables, you are welcome to leave your honest comments and rating on the order page."
      }
    ],
    strategy: "Fiverr's AI filter flags combinations of 'review', 'rating', '5 stars', and 'positive'. Always ask for satisfaction and honest feedback, never ratings."
  },
  assets: {
    title: "File Sharing & Portfolios",
    badge: "External Links",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/25",
    text: "Sharing personal portfolio websites containing direct emails, or unauthorized external file-transfer tools (WeTransfer links, etc.) can flag your messages.",
    dangerWords: ["WeTransfer link", "My Instagram link", "Personal portfolio email", "Direct website link"],
    alternatives: [
      {
        label: "Approved Repositories",
        original: "Check my personal website portfolio to see all my past work.",
        safe: "You can view samples of my previous projects directly on my official Fiverr gig portfolio page."
      },
      {
        label: "Fiverr Large Attachments",
        original: "Send the project files to my email address or WeTransfer.",
        safe: "I have attached the source assets directly to this Fiverr message thread for your review."
      }
    ],
    strategy: "Fiverr supports file uploads of up to 5GB directly in chat. Approved third-party domains include Google Drive, GitHub, Loom, YouTube, and Flickr."
  }
};

export default function App() {
  // Theme state (system-level light/dark)
  const [isDark, setIsDark] = useState(false);
  
  // Tab-state
  const [activeTab, setActiveTab] = useState<"inspector" | "composer" | "rules">("inspector");

  // Connection status state
  const [apiStatus, setApiStatus] = useState({
    ready: false,
    hasApiKey: false,
    message: "Verifying connection..."
  });

  // 1. ToS Inspector states
  const [inspectText, setInspectText] = useState("");
  const [isInspecting, setIsInspecting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SafetyAnalysis | null>(null);
  const [inspectCopied, setInspectCopied] = useState(false);
  const [inspectorViewMode, setInspectorViewMode] = useState<"edit" | "highlight" | "heatmap">("edit");
  const [activeHeatmapIdx, setActiveHeatmapIdx] = useState<number | null>(null);
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState<number | null>(null);
  const [fixStrategy, setFixStrategy] = useState<"compound" | "dotted" | "hyphenated" | "spaced">("dotted");
  const [sandboxFilterStrength, setSandboxFilterStrength] = useState<"standard" | "heuristic" | "extreme">("heuristic");
  const [sandboxPreviewMode, setSandboxPreviewMode] = useState<"original" | "corrected">("corrected");
  const [sidebarView, setSidebarView] = useState<"insights" | "playbook">("insights");
  const [playbookTopic, setPlaybookTopic] = useState<"payment" | "meeting" | "review" | "assets">("payment");
  const [copiedTemplateIdx, setCopiedTemplateIdx] = useState<string | null>(null);
  const [activeShields, setActiveShields] = useState<Record<string, boolean>>({
    offPlatform: true,
    paymentCircumvention: true,
    reviewCoercion: true,
    academicCheating: true
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // 2. AI Composer states
  const [rawThoughts, setRawThoughts] = useState("");
  const [selectedTone, setSelectedTone] = useState("Professional");
  const [isComposing, setIsComposing] = useState(false);
  const [composedMessage, setComposedMessage] = useState("");
  const [composeCopied, setComposeCopied] = useState(false);

  // 3. Compliance Database Browser states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [selectedRule, setSelectedRule] = useState<ComplianceRule | null>(null);

  // Quick templates list
  const quickTemplates = [
    {
      title: "Custom Milestone Pitch",
      description: "Pitch a split-phase safe proposal.",
      thoughts: "Tell client I will divide the project into two milestones. First is basic outline for $150, second is detailed coding for $200. Reassure them it is safe.",
      tone: "Confident"
    },
    {
      title: "Safe Call Invite",
      description: "Arrange a Fiverr Zoom/Call safely.",
      thoughts: "Invite client to a live call using the official Fiverr video appointment scheduler to review the dashboard. Remind them no outside skype.",
      tone: "Professional"
    },
    {
      title: "Polite Revision Response",
      description: "De-escalate scope creep gracefully.",
      thoughts: "Client wants extra features not in scope. I will fix the basic bugs for free today, but tell them we can add pages as a separate custom offer.",
      tone: "Friendly"
    },
    {
      title: "Order Delivery Handoff",
      description: "Deliver source files with clear notes.",
      thoughts: "All files compiled and attached. Direct them to download zip, open preview. Say I am ready for small revisions if needed.",
      tone: "Professional"
    }
  ];

  // Fetch API status on mount
  useEffect(() => {
    fetch("/api/status")
      .then(res => res.json())
      .then(data => {
        setApiStatus({
          ready: true,
          hasApiKey: data.hasApiKey,
          message: data.message
        });
      })
      .catch(() => {
        setApiStatus({
          ready: true,
          hasApiKey: false,
          message: "Operating in high-speed Sandbox Intelligence Mode."
        });
      });
  }, []);

  // Synchronize dark class on document element and body
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, [isDark]);

  // Handle ToS Inspection
  const handleInspect = async (overrideText?: string) => {
    const textToAnalyze = overrideText !== undefined ? overrideText : inspectText;
    if (!textToAnalyze.trim()) return;
    setIsInspecting(true);
    setAnalysisResult(null);
    setSelectedSegmentIdx(null);

    try {
      const response = await fetch("/api/analyze-safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToAnalyze })
      });
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response or not JSON");
      }
      const data = await response.json();
      setAnalysisResult(data);
      if (data && (data.dangerousContent?.length > 0 || data.potentialIssues?.length > 0)) {
        setInspectorViewMode("highlight");
      } else {
        setInspectorViewMode("edit");
      }
    } catch (err) {
      console.warn("Fiverr live analysis backend unavailable or failed. Using high-speed Sandbox Intelligence Fallback:", err);
      const localData = runLocalAnalysis(textToAnalyze);
      setAnalysisResult(localData);
      if (localData && (localData.dangerousContent?.length > 0 || localData.potentialIssues?.length > 0)) {
        setInspectorViewMode("highlight");
      } else {
        setInspectorViewMode("edit");
      }
    } finally {
      setIsInspecting(false);
    }
  };

  // Auto-fix a single clicked segment in the draft
  const fixSingleSegment = (idx: number, customReplacement?: string) => {
    if (!analysisResult) return;
    const segments = getSegments(inspectText, analysisResult.matchedRules || []);
    const newSegments = segments.map((seg, sIdx) => {
      if (sIdx === idx && seg.rule) {
        return customReplacement !== undefined ? customReplacement : seg.rule.rewrite;
      }
      return seg.text;
    });
    const newText = newSegments.join("");
    setInspectText(newText);
    handleInspect(newText);
    setSelectedSegmentIdx(null);
  };

  // Auto-fix all segments in the draft
  const fixAllSegments = () => {
    if (!analysisResult) return;
    const segments = getSegments(inspectText, analysisResult.matchedRules || []);
    const newText = segments.map(seg => {
      if (seg.isMatch && seg.rule) {
        const forms = getDisguisedForms(seg.text);
        if (fixStrategy === "compound") return forms[0]?.value || seg.rule.rewrite;
        if (fixStrategy === "dotted") return forms[1]?.value || seg.rule.rewrite;
        if (fixStrategy === "hyphenated") return forms[2]?.value || seg.rule.rewrite;
        if (fixStrategy === "spaced") return forms[3]?.value || seg.rule.rewrite;
      }
      return seg.text;
    }).join("");
    setInspectText(newText);
    handleInspect(newText);
    setSelectedSegmentIdx(null);
  };

  // Switch tabs and instantly test a specific rule pattern
  const handleTestRuleInInspector = (rule: ComplianceRule) => {
    let testMsg = "";
    const phraseLower = rule.phrase.toLowerCase();
    
    if (phraseLower.includes("whatsapp")) {
      testMsg = "Let's continue on WhatsApp.";
    } else if (phraseLower.includes("telegram")) {
      testMsg = "Can you send me your Telegram? I will contact you there.";
    } else if (phraseLower.includes("paypal")) {
      testMsg = "Please send the payment directly through PayPal to avoid Fiverr fees.";
    } else if (phraseLower.includes("fees") || phraseLower.includes("bypass") || phraseLower.includes("outside")) {
      testMsg = "Let's work outside Fiverr so we can avoid platform fees.";
    } else if (phraseLower.includes("email")) {
      testMsg = "My email address is developer@example.com. Contact me there.";
    } else if (phraseLower.includes("homework") || phraseLower.includes("exam")) {
      testMsg = "Can you please do my university computer science homework and exam?";
    } else if (phraseLower.includes("star") || phraseLower.includes("feedback") || phraseLower.includes("review")) {
      testMsg = "I will give you a refund if you write a positive 5 star review.";
    } else if (phraseLower.includes("phone") || phraseLower.includes("+")) {
      testMsg = "Call me at my phone number: +1-555-0199.";
    } else if (phraseLower.includes("skype")) {
      testMsg = "Add me on Skype: my_skype_handle.";
    } else if (phraseLower.includes("discord")) {
      testMsg = "Let's talk on Discord: developer_xyz.";
    } else {
      const cleanPhrase = rule.phrase.replace(/\s?\(Case\s?#\d+\)/gi, "");
      testMsg = `Please send me your ${cleanPhrase} details directly so we can begin.`;
    }
    
    setInspectText(testMsg);
    setActiveTab("inspector");
    handleInspect(testMsg);
  };

  // Handle AI Composition
  const handleCompose = async (customThoughts?: string, customTone?: string) => {
    const thoughtsToUse = customThoughts || rawThoughts;
    if (!thoughtsToUse.trim()) return;
    setIsComposing(true);
    setComposedMessage("");

    try {
      const response = await fetch("/api/generate-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          rawThoughts: thoughtsToUse,
          tone: customTone || selectedTone
        })
      });
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response or not JSON");
      }
      const data = await response.json();
      setComposedMessage(data.generatedMessage);
      setActiveTab("composer");
    } catch (err) {
      console.warn("Fiverr live composition backend unavailable or failed. Using local Sandbox Composer Fallback:", err);
      const localMessage = runLocalCompose(thoughtsToUse, customTone || selectedTone);
      setComposedMessage(localMessage);
      setActiveTab("composer");
    } finally {
      setIsComposing(false);
    }
  };

  const handleCopy = (text: string, type: "inspect" | "compose") => {
    navigator.clipboard.writeText(text);
    if (type === "inspect") {
      setInspectCopied(true);
      setTimeout(() => setInspectCopied(false), 2000);
    } else {
      setComposeCopied(true);
      setTimeout(() => setComposeCopied(false), 2000);
    }
  };

  const handlePlaybookCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplateIdx(id);
    setTimeout(() => setCopiedTemplateIdx(null), 1500);
  };

  // Word count helper
  const getWordCount = (text: string) => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans relative overflow-x-hidden p-3 md:p-6 flex flex-col items-center justify-center ${
      isDark 
        ? "bg-gradient-to-tr from-[#0F1015] via-[#161720] to-[#1D142A] text-zinc-100" 
        : "bg-gradient-to-tr from-[#E1E4F5] via-[#F4F5FA] to-[#FFEBE9] text-zinc-800"
    }`}>
      
      {/* Dynamic Animated Ambient Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[10%] left-[-15%] w-[650px] h-[650px] rounded-full blur-[160px] transition-colors duration-1000 ${
          isDark ? "bg-indigo-500/8" : "bg-indigo-400/12"
        } animate-float`} style={{ animationDuration: "12s" }} />
        <div className={`absolute bottom-[10%] right-[-15%] w-[550px] h-[550px] rounded-full blur-[140px] transition-colors duration-1000 ${
          isDark ? "bg-violet-600/6" : "bg-rose-400/10"
        } animate-float`} style={{ animationDuration: "15s", animationDelay: "2s" }} />
        <div className={`absolute top-[40%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] transition-colors duration-1000 ${
          isDark ? "bg-teal-500/4" : "bg-cyan-300/8"
        } animate-float`} style={{ animationDuration: "10s", animationDelay: "4s" }} />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl z-10 relative flex flex-col items-center justify-center">

        {/* Primary macOS Glass Window */}
        <div 
          id="mac-window-root" 
          className={`w-full rounded-[24px] shadow-[0_30px_80px_rgba(0,0,0,0.12)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.45)] transition-all duration-500 relative flex flex-col overflow-hidden min-h-[660px] ${
            isDark ? "glass-panel-dark" : "glass-panel-light"
          }`}
        >
          
          {/* macOS window title bar */}
          <div className={`px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-b select-none ${
            isDark ? "border-zinc-800/40 bg-zinc-950/20" : "border-white/40 bg-white/20"
          }`}>
            {/* Top-left traffic lights and window metadata */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <div className="flex items-center gap-2 group/dots">
                <div className="h-3 w-3 rounded-full bg-[#FF5F56] flex items-center justify-center text-[8px] text-red-950/70 font-black cursor-pointer relative shadow-inner">
                  <span className="opacity-0 group-hover/dots:opacity-100 transition-opacity duration-150 absolute">×</span>
                </div>
                <div className="h-3 w-3 rounded-full bg-[#FFBD2E] flex items-center justify-center text-[8px] text-amber-950/70 font-black cursor-pointer relative shadow-inner">
                  <span className="opacity-0 group-hover/dots:opacity-100 transition-opacity duration-150 absolute">-</span>
                </div>
                <div className="h-3 w-3 rounded-full bg-[#27C93F] flex items-center justify-center text-[8px] text-green-950/70 font-black cursor-pointer relative shadow-inner">
                  <span className="opacity-0 group-hover/dots:opacity-100 transition-opacity duration-150 absolute">+</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5 ml-2">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                  <Shield className="h-3.5 w-3.5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 font-display">Fiverr Lens</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      v2.0
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* macOS Centered Tab Segmented Control */}
            <div className={`flex p-1 rounded-xl border ${
              isDark ? "bg-zinc-950/40 border-zinc-800/50" : "bg-zinc-200/50 border-zinc-300"
            }`}>
              <button
                onClick={() => setActiveTab("inspector")}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-bold tracking-tight transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "inspector" 
                    ? (isDark ? "bg-zinc-800 text-white shadow-sm" : "bg-white text-zinc-900 shadow-sm") 
                    : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-250"
                }`}
              >
                <Shield className="h-4 w-4" /> Inspector
              </button>
              <button
                onClick={() => setActiveTab("composer")}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-bold tracking-tight transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "composer" 
                    ? (isDark ? "bg-zinc-800 text-white shadow-sm" : "bg-white text-zinc-900 shadow-sm") 
                    : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-250"
                }`}
              >
                <Sparkles className="h-4 w-4" /> AI Writer
              </button>
              <button
                onClick={() => setActiveTab("rules")}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-bold tracking-tight transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "rules" 
                    ? (isDark ? "bg-zinc-800 text-white shadow-sm" : "bg-white text-zinc-900 shadow-sm") 
                    : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-250"
                }`}
              >
                <BookOpen className="h-4 w-4" /> ToS Rules
              </button>
            </div>

            {/* Top-right System status & Theme Switcher */}
            <div className="flex items-center gap-3">
              {/* Dynamic Connection Indicator */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold select-none ${
                isDark ? "bg-zinc-900/30 border-zinc-800/40" : "bg-zinc-150/50 border-zinc-300 text-zinc-700"
              }`}>
                <div className={`h-1.5 w-1.5 rounded-full ${
                  apiStatus.hasApiKey ? "bg-emerald-500" : "bg-amber-500"
                } status-active-glow`} />
                <span className="text-zinc-700 dark:text-zinc-400">
                  {apiStatus.hasApiKey ? "AI LIVE" : "SANDBOX"}
                </span>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-lg border transition cursor-pointer shadow-3xs ${
                  isDark 
                    ? "bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:text-white" 
                    : "bg-white/80 border-zinc-300 text-zinc-700 hover:text-zinc-950"
                }`}
                title="Change appearance"
              >
                {isDark ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Window Body Split Area */}
          <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-200/20 dark:divide-white/5">
            
            {/* LEFT COMPONENT COLUMN (Forms/Inputs) */}
            <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
              
              <AnimatePresence mode="wait">
                {activeTab === "inspector" && (
                  <motion.div
                    key="tab-inspector"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex-1 flex flex-col gap-5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold uppercase text-indigo-650 dark:text-indigo-400 tracking-widest">TOS COMPLIANCE PIPELINE</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-extrabold font-display tracking-tight mt-1 text-zinc-900 dark:text-zinc-100">
                        Safety Inspector
                      </h2>
                      <p className="text-sm text-zinc-650 dark:text-zinc-300 mt-1.5 font-medium leading-relaxed opacity-95">
                        Analyze communication scripts for hidden bypasses, external links, rating manipulations, or off-platform leaks.
                      </p>
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                      {/* Interactive view toggles for draft and risk markings */}
                      <div className="flex items-center justify-between select-none">
                        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-zinc-500/5 dark:bg-zinc-500/10 border border-zinc-200/40 dark:border-zinc-800/60">
                          <button
                            type="button"
                            onClick={() => setInspectorViewMode("edit")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tight transition-all duration-200 cursor-pointer ${
                              inspectorViewMode === "edit"
                                ? (isDark ? "bg-zinc-800 text-white shadow-3xs" : "bg-white text-zinc-900 shadow-3xs border border-zinc-200/50")
                                : "text-zinc-650 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200"
                            }`}
                          >
                            📝 Draft Editor
                          </button>
                          <button
                            type="button"
                            disabled={!analysisResult?.highlightedMessage}
                            onClick={() => setInspectorViewMode("highlight")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tight transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 ${
                              inspectorViewMode === "highlight"
                                ? (isDark ? "bg-zinc-800 text-white shadow-3xs" : "bg-white text-zinc-900 shadow-3xs border border-zinc-200/50")
                                : "text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200"
                            }`}
                          >
                            🚨 Marked Violations
                            {analysisResult && (analysisResult.dangerousContent?.length > 0 || analysisResult.potentialIssues?.length > 0) && (
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={!analysisResult}
                            onClick={() => setInspectorViewMode("heatmap")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tight transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 ${
                              inspectorViewMode === "heatmap"
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                : "text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200"
                            }`}
                          >
                            🔥 Risk Heatmap
                            {analysisResult && (analysisResult.matchedRules?.length || 0) > 0 && (
                              <span className="bg-amber-500 text-white dark:text-zinc-950 text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none min-w-[12px] text-center">
                                {analysisResult.matchedRules.length}
                              </span>
                            )}
                          </button>
                        </div>
                        
                        {analysisResult && (
                          <div className="flex items-center gap-1.5 select-none">
                            <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-md border ${
                              analysisResult.safetyScore > 80 
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10" 
                                : analysisResult.safetyScore > 50 
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10" 
                                : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/10"
                            }`}>
                              Safety Score: {analysisResult.safetyScore}%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="relative h-[250px] md:h-[320px] w-full flex flex-col shrink-0">
                        {/* Unique Cybernetic Scan Loader Overlay */}
                        <AnimatePresence>
                          {isInspecting && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-zinc-950/70 dark:bg-zinc-950/85 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center text-center p-6 z-30 overflow-hidden"
                            >
                              {/* Glowing Scan Laser Line */}
                              <div className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-scan-line pointer-events-none" />
                              
                              {/* Rotating Cyber Radar rings */}
                              <div className="relative h-24 w-24 flex items-center justify-center">
                                {/* Pulse aura */}
                                <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-pulse-ring" />
                                <div className="absolute -inset-2 rounded-full border border-indigo-400/10 animate-pulse-ring [animation-delay:1s]" />
                                
                                {/* Outer Rotating Ring with dash array */}
                                <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/30 animate-spin-slow" />
                                
                                {/* Inner spinning glowing ring */}
                                <div className="absolute inset-2 rounded-full border-2 border-t-indigo-400 border-r-transparent border-b-indigo-400 border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }} />
                                
                                {/* Central active icon */}
                                <div className="relative h-10 w-10 rounded-full bg-indigo-500/15 flex items-center justify-center border border-indigo-500/30 shadow-inner">
                                  <Shield className="h-5 w-5 text-indigo-400 animate-pulse" />
                                </div>
                              </div>

                              {/* Loading Text Sequence */}
                              <div className="mt-5 space-y-1.5 max-w-[240px]">
                                <h4 className="text-xs font-black tracking-widest text-indigo-300 font-mono uppercase animate-pulse">
                                  SECURE TOS INSPECTION
                                </h4>
                                <p className="text-[10px] font-mono text-zinc-400 leading-normal">
                                  Decrypting bypasses, semantic leaks, and off-platform channels...
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {inspectorViewMode === "edit" ? (
                          <textarea
                            value={inspectText}
                            onChange={(e) => {
                              setInspectText(e.target.value);
                              if (!e.target.value) {
                                setAnalysisResult(null);
                              }
                            }}
                            placeholder="Paste your drafted response or pitch here... (e.g. Please send the payment through PayPal so we don't pay 20% fees, or reach me on WhatsApp +1-555...)"
                            className={`w-full h-full p-4 text-[13px] md:text-sm font-semibold leading-relaxed outline-none rounded-2xl transition-all resize-none shadow-inner ${
                              isDark 
                                ? "bg-zinc-950/50 border border-zinc-800/60 focus:border-indigo-500/80 text-zinc-200 placeholder-zinc-500 focus:ring-4 focus:ring-indigo-500/10" 
                                : "bg-white border border-zinc-300 focus:border-indigo-600 text-zinc-900 placeholder-zinc-600 focus:ring-4 focus:ring-indigo-500/10"
                            }`}
                          />
                        ) : inspectorViewMode === "highlight" ? (
                          <div 
                            className={`w-full h-full p-5 text-[13px] md:text-sm font-semibold leading-relaxed outline-none rounded-2xl transition-all overflow-y-auto border-l-4 border-rose-500 shadow-inner select-text ${
                              isDark 
                                ? "bg-zinc-950/50 border border-zinc-800/60 text-zinc-200" 
                                : "bg-white border border-zinc-300 text-zinc-900"
                            }`}
                          >
                            {analysisResult ? (
                              <div className="whitespace-pre-wrap leading-relaxed text-zinc-850 dark:text-zinc-200 font-sans tracking-wide">
                                {(() => {
                                  const segments = getSegments(inspectText, analysisResult.matchedRules || []);
                                  return segments.map((seg, idx) => {
                                    if (!seg.isMatch) {
                                      return <span key={idx} className="whitespace-pre-wrap">{seg.text}</span>;
                                    }
                                    const isSelected = selectedSegmentIdx === idx;
                                    let severityStyle = "";
                                    if (seg.rule?.severity === "Critical Risk") {
                                      severityStyle = isSelected 
                                        ? "bg-red-600 text-white dark:bg-red-500 dark:text-zinc-950 ring-2 ring-red-500 font-black px-2 py-0.5 rounded shadow-md scale-105" 
                                        : "bg-red-500/10 text-red-600 dark:text-red-400 border-2 border-red-500 font-black px-2 py-0.5 rounded hover:bg-red-500/20 animate-pulse";
                                    } else if (seg.rule?.severity === "High Risk") {
                                      severityStyle = isSelected 
                                        ? "bg-rose-600 text-white dark:bg-rose-500 dark:text-zinc-950 ring-2 ring-rose-500 font-black px-2 py-0.5 rounded shadow-md scale-105" 
                                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500 font-black px-2 py-0.5 rounded hover:bg-rose-500/20";
                                    } else if (seg.rule?.severity === "Medium Risk") {
                                      severityStyle = isSelected 
                                        ? "bg-amber-500 text-zinc-950 ring-2 ring-amber-500 font-semibold px-2 py-0.5 rounded shadow-sm scale-105" 
                                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500 font-semibold px-2 py-0.5 rounded hover:bg-amber-500/20";
                                    } else {
                                      severityStyle = isSelected 
                                        ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-zinc-950 ring-2 ring-blue-500 font-medium px-2 py-0.5 rounded shadow-sm scale-105" 
                                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500 font-medium px-2 py-0.5 rounded hover:bg-blue-500/20";
                                    }

                                    return (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setSelectedSegmentIdx(isSelected ? null : idx)}
                                        className={`inline-block mx-0.5 font-mono text-[11px] transition-all duration-150 cursor-pointer select-none ${severityStyle}`}
                                        title={`Rule: ${seg.rule?.phrase} (${seg.rule?.severity}) - Click to inspect`}
                                      >
                                        {seg.text}
                                      </button>
                                    );
                                  });
                                })()}
                              </div>
                            ) : (
                              <span className="text-zinc-500 italic">No violations analyzed yet.</span>
                            )}
                          </div>
                        ) : (
                          <div 
                            className={`w-full h-full p-5 text-[13px] md:text-sm font-semibold leading-relaxed outline-none rounded-2xl transition-all overflow-y-auto border-l-4 border-amber-500 shadow-inner select-text ${
                              isDark 
                                ? "bg-zinc-950/50 border border-zinc-800/60 text-zinc-200" 
                                : "bg-white border border-zinc-300 text-zinc-900"
                            }`}
                          >
                            {analysisResult ? (
                              <div className="space-y-5">
                                {(() => {
                                  const sentences = inspectText.match(/[^.!?\n]+[.!?\n]*(\s+|$)/g) || [inspectText];
                                  const heatmapItems = sentences.filter(s => s.trim().length > 0).map((sentence, index) => {
                                    const sentenceSegments = getSegments(sentence, analysisResult.matchedRules || []);
                                    const sentenceMatches = sentenceSegments.filter(seg => seg.isMatch && seg.rule);
                                    let crit = 0, high = 0, med = 0, low = 0, score = 0;
                                    sentenceMatches.forEach(m => {
                                      if (m.rule?.severity === "Critical Risk") { crit++; score += 25; }
                                      else if (m.rule?.severity === "High Risk") { high++; score += 15; }
                                      else if (m.rule?.severity === "Medium Risk") { med++; score += 8; }
                                      else if (m.rule?.severity === "Low Risk") { low++; score += 3; }
                                    });
                                    
                                    let colorClass = "bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/15 text-emerald-850 dark:text-emerald-300";
                                    let badgeColor = "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400";
                                    let maxSeverityLabel = "Safe";
                                    
                                    if (crit > 0) {
                                      colorClass = "bg-red-500/10 hover:bg-red-500/15 border-red-500/25 text-red-950 dark:text-red-200";
                                      badgeColor = "bg-red-500/20 text-red-600 dark:text-red-400";
                                      maxSeverityLabel = "Critical Risk";
                                    } else if (high > 0) {
                                      colorClass = "bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/25 text-rose-950 dark:text-rose-200";
                                      badgeColor = "bg-rose-500/20 text-rose-600 dark:text-rose-450";
                                      maxSeverityLabel = "High Risk";
                                    } else if (med > 0) {
                                      colorClass = "bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/25 text-amber-950 dark:text-amber-200";
                                      badgeColor = "bg-amber-500/20 text-amber-600 dark:text-amber-450";
                                      maxSeverityLabel = "Medium Risk";
                                    } else if (low > 0) {
                                      colorClass = "bg-blue-500/10 hover:bg-blue-500/15 border-blue-500/20 text-blue-950 dark:text-blue-200";
                                      badgeColor = "bg-blue-500/20 text-blue-600 dark:text-blue-400";
                                      maxSeverityLabel = "Low Risk";
                                    }

                                    return {
                                      index,
                                      text: sentence,
                                      matches: sentenceMatches,
                                      crit, high, med, low, score,
                                      colorClass, badgeColor, maxSeverityLabel
                                    };
                                  });

                                  const totalCrit = heatmapItems.reduce((acc, curr) => acc + curr.crit, 0);
                                  const totalHigh = heatmapItems.reduce((acc, curr) => acc + curr.high, 0);
                                  const totalMed = heatmapItems.reduce((acc, curr) => acc + curr.med, 0);
                                  const totalLow = heatmapItems.reduce((acc, curr) => acc + curr.low, 0);

                                  let thermalStatus = "Cool & Compliant 🧊";
                                  let thermalStatusColor = "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/15";
                                  if (totalCrit > 0 || totalHigh > 1) {
                                    thermalStatus = "SEVERE THERMAL ESCALATION 🔥🔥🔥";
                                    thermalStatusColor = "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/15 animate-pulse";
                                  } else if (totalHigh > 0 || totalMed > 1) {
                                    thermalStatus = "RISKY - ELEVATED THERMAL RATING ☀️";
                                    thermalStatusColor = "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/15";
                                  } else if (totalMed > 0 || totalLow > 1) {
                                    thermalStatus = "WARM SIGNS DETECTED ⛅";
                                    thermalStatusColor = "text-amber-600 dark:text-amber-450 bg-amber-500/10 border-amber-500/15";
                                  }

                                  return (
                                    <div className="space-y-4">
                                      {/* Thermal status bar */}
                                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-500/5 p-3 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
                                        <div className="space-y-0.5">
                                          <span className="text-[9px] font-mono font-black text-zinc-450 dark:text-zinc-500 block uppercase tracking-wider">THERMAL INDEX STATUS</span>
                                          <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${thermalStatusColor}`}>
                                            {thermalStatus}
                                          </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                          <span className="px-2 py-1 text-[10px] font-mono font-bold rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/10 flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                            {totalCrit} Critical
                                          </span>
                                          <span className="px-2 py-1 text-[10px] font-mono font-bold rounded bg-rose-500/10 text-rose-600 dark:text-rose-450 border border-rose-500/10 flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                            {totalHigh} High
                                          </span>
                                          <span className="px-2 py-1 text-[10px] font-mono font-bold rounded bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/10 flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                            {totalMed} Med
                                          </span>
                                          <span className="px-2 py-1 text-[10px] font-mono font-bold rounded bg-blue-500/10 text-blue-600 dark:text-blue-450 border border-blue-500/10 flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                            {totalLow} Low
                                          </span>
                                        </div>
                                      </div>

                                      {/* Interactive block strips (The absolute heatmap graphical representation) */}
                                      <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-[10px] font-mono font-black text-zinc-500">
                                          <span>📍 CHRONOLOGICAL RISKS HEATMAP STRIP</span>
                                          <span>{heatmapItems.length} Sentence {heatmapItems.length === 1 ? "Block" : "Blocks"}</span>
                                        </div>
                                        <div className="flex h-5 w-full gap-1 rounded-md overflow-hidden bg-zinc-500/5 p-0.5 border border-zinc-200/40 dark:border-zinc-800/40">
                                          {heatmapItems.map((item, idx) => {
                                            const isActive = activeHeatmapIdx === idx;
                                            let color = "bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-400";
                                            if (item.crit > 0) color = "bg-red-500 dark:bg-red-600 hover:bg-red-400";
                                            else if (item.high > 0) color = "bg-rose-500 dark:bg-rose-600 hover:bg-rose-400";
                                            else if (item.med > 0) color = "bg-amber-500 dark:bg-amber-600 hover:bg-amber-400";
                                            else if (item.low > 0) color = "bg-blue-500 dark:bg-blue-600 hover:bg-blue-400";

                                            return (
                                              <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setActiveHeatmapIdx(isActive ? null : idx)}
                                                className={`flex-1 h-full rounded-[3px] transition-all cursor-pointer relative ${color} ${
                                                  isActive ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-900 scale-y-110" : "opacity-85 hover:opacity-100"
                                                }`}
                                                title={`Block #${idx + 1}: ${item.maxSeverityLabel} (Risk Score: ${item.score}) - Click to inspect`}
                                              />
                                            );
                                          })}
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 dark:text-zinc-500">
                                          <span>Beginning of Message ⬅️</span>
                                          <span>➡️ End of Message</span>
                                        </div>
                                      </div>

                                      {/* Detailed inspection grid */}
                                      <div className="grid grid-cols-1 gap-3.5 pt-1">
                                        {heatmapItems.map((item, idx) => {
                                          const isSelected = activeHeatmapIdx === idx;
                                          return (
                                            <div
                                              key={idx}
                                              onClick={() => setActiveHeatmapIdx(isSelected ? null : idx)}
                                              className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${item.colorClass} ${
                                                isSelected 
                                                  ? "ring-2 ring-indigo-500 dark:ring-indigo-400/80 scale-[1.01] shadow-md border-transparent" 
                                                  : "hover:scale-[1.002] border-zinc-200/40 dark:border-zinc-800/40"
                                              }`}
                                            >
                                              <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-zinc-500/5 pb-1.5 select-none">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-[9px] font-mono font-black uppercase text-zinc-500">
                                                    SENTENCE BLOCK #{idx + 1}
                                                  </span>
                                                  {item.maxSeverityLabel !== "Safe" ? (
                                                    <span className={`text-[8.5px] font-black uppercase px-2 py-0.2 rounded-full ${item.badgeColor}`}>
                                                      ⚠️ {item.maxSeverityLabel} (Score: {item.score})
                                                    </span>
                                                  ) : (
                                                    <span className={`text-[8.5px] font-black uppercase px-2 py-0.2 rounded-full ${item.badgeColor}`}>
                                                      🌿 Safe
                                                    </span>
                                                  )}
                                                </div>
                                                <span className="text-[9px] font-mono font-semibold text-zinc-450 dark:text-zinc-555">
                                                  {getWordCount(item.text)} words
                                                </span>
                                              </div>
                                              
                                              <p className="text-[11.5px] font-medium leading-relaxed font-sans tracking-wide">
                                                {(() => {
                                                  const sentenceSegments = getSegments(item.text, analysisResult.matchedRules || []);
                                                  return sentenceSegments.map((seg, sIdx) => {
                                                    if (!seg.isMatch) return <span key={sIdx}>{seg.text}</span>;
                                                    return (
                                                      <span 
                                                        key={sIdx}
                                                        className={`font-mono text-[10.5px] font-black px-1 py-0.2 mx-0.5 rounded ${
                                                          seg.rule?.severity === "Critical Risk" 
                                                            ? "bg-red-500 text-white dark:bg-red-600" 
                                                            : seg.rule?.severity === "High Risk"
                                                            ? "bg-rose-500 text-white dark:bg-rose-600"
                                                            : seg.rule?.severity === "Medium Risk"
                                                            ? "bg-amber-500 text-zinc-900"
                                                            : "bg-blue-500 text-white dark:bg-blue-600"
                                                        }`}
                                                      >
                                                        {seg.text}
                                                      </span>
                                                    );
                                                  });
                                                })()}
                                              </p>

                                              {isSelected && item.matches.length > 0 && (
                                                <div className="mt-3.5 pt-3 border-t border-zinc-500/10 space-y-3.5 select-none animate-fadeIn">
                                                  <div className="flex items-center gap-1.5">
                                                    <ShieldAlert className="h-3.5 w-3.5 text-indigo-500" />
                                                    <span className="text-[10px] font-black tracking-tight uppercase text-zinc-800 dark:text-zinc-200">
                                                      Flagged Triggers Breakdown
                                                    </span>
                                                  </div>
                                                  <div className="grid grid-cols-1 gap-2.5">
                                                    {item.matches.map((match, mIdx) => {
                                                      if (!match.rule) return null;
                                                      return (
                                                        <div key={mIdx} className="p-3 rounded-lg bg-zinc-500/5 border border-zinc-200/40 dark:border-zinc-800/40 space-y-2">
                                                          <div className="flex items-center justify-between gap-2 flex-wrap">
                                                            <div className="flex items-center gap-1.5">
                                                              <span className="text-[9px] font-mono font-black bg-zinc-500/10 px-1.5 py-0.5 rounded text-zinc-650 dark:text-zinc-300">
                                                                Phrase: "{match.text}"
                                                              </span>
                                                              <span className="text-[9px] font-bold text-zinc-450">
                                                                {match.rule.category}
                                                              </span>
                                                            </div>
                                                            <span className="text-[8px] font-black font-mono text-zinc-400">
                                                              {match.rule.severity}
                                                            </span>
                                                          </div>
                                                          <p className="text-[10px] text-zinc-650 dark:text-zinc-350 leading-normal font-medium">
                                                            <span className="font-bold text-indigo-500">ToS Risk:</span> {match.rule.explanation}
                                                          </p>
                                                          
                                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-zinc-500/5">
                                                            <div className="flex items-center justify-between gap-1 bg-zinc-500/10 p-1.5 rounded text-[10px] font-mono font-bold">
                                                              <span className="truncate max-w-[120px] text-emerald-600 dark:text-emerald-400">
                                                                "{match.rule.rewrite}"
                                                              </span>
                                                              <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  const globSegments = getSegments(inspectText, analysisResult.matchedRules || []);
                                                                  const matchIdx = globSegments.findIndex(gs => gs.isMatch && gs.text === match.text);
                                                                  if (matchIdx !== -1) {
                                                                    fixSingleSegment(matchIdx, match.rule?.rewrite);
                                                                  }
                                                                }}
                                                                className="px-2 py-0.5 text-[9px] bg-emerald-600 hover:bg-emerald-500 text-white rounded font-black cursor-pointer"
                                                              >
                                                                Apply Safe
                                                              </button>
                                                            </div>

                                                            <div className="flex items-center justify-between gap-1 bg-zinc-500/10 p-1.5 rounded text-[10px] font-mono font-bold">
                                                              <span className="text-zinc-400 font-mono">Obfuscate:</span>
                                                              <div className="flex gap-1">
                                                                {getDisguisedForms(match.text).slice(1, 4).map((form, formIdx) => {
                                                                  let btnLabel = "g.m.a.i.l";
                                                                  if (form.type === "Hyphenated Word") btnLabel = "g-mail";
                                                                  if (form.type === "Spaced Letters") btnLabel = "g m a i l";
                                                                  
                                                                  if (match.text.toLowerCase() !== "gmail") {
                                                                    if (form.type === "Dotted Letters") btnLabel = "Dot";
                                                                    if (form.type === "Hyphenated Word") btnLabel = "Hyph";
                                                                    if (form.type === "Spaced Letters") btnLabel = "Space";
                                                                  }

                                                                  return (
                                                                    <button
                                                                      key={formIdx}
                                                                      type="button"
                                                                      onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const globSegments = getSegments(inspectText, analysisResult.matchedRules || []);
                                                                        const matchIdx = globSegments.findIndex(gs => gs.isMatch && gs.text === match.text);
                                                                        if (matchIdx !== -1) {
                                                                          fixSingleSegment(matchIdx, form.value);
                                                                        }
                                                                      }}
                                                                      className="px-1.5 py-0.5 text-[8.5px] bg-indigo-600 hover:bg-indigo-500 text-white rounded font-black cursor-pointer"
                                                                      title={`Format as: ${form.type} (${form.value})`}
                                                                    >
                                                                      {btnLabel}
                                                                    </button>
                                                                  );
                                                                })}
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : (
                              <span className="text-zinc-500 italic">No violations analyzed yet.</span>
                            )}
                          </div>
                        )}
                        
                        {inspectText && (
                          <div 
                            className={`absolute bottom-3 right-3 flex items-center gap-1.5 p-1 rounded-xl backdrop-blur-md border shadow-lg select-none transition-all duration-300 ${
                              isDark 
                                ? "bg-zinc-900/60 border-zinc-800/80 shadow-zinc-950/40" 
                                : "bg-white/75 border-zinc-200/60 shadow-zinc-300/10"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                handleCopy(inspectText, "inspect");
                              }}
                              className={`text-[10px] font-bold font-mono tracking-tight px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer ${
                                isDark
                                  ? inspectCopied 
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40"
                                  : inspectCopied
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-indigo-50 hover:bg-indigo-100/80 text-indigo-600 border border-indigo-100"
                              }`}
                            >
                              {inspectCopied ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                                  <span>Copy Draft</span>
                                </>
                              )}
                            </button>

                            <div className={`px-2.5 py-1.5 text-[9px] font-mono font-bold flex items-center gap-1.5 rounded-lg border ${
                              isDark
                                ? "bg-zinc-950/40 border-zinc-900 text-zinc-400"
                                : "bg-zinc-100/50 border-zinc-200/30 text-zinc-650"
                            }`}>
                              <span>{getWordCount(inspectText)} <span className="opacity-45">words</span></span>
                              <span className={`h-2.5 w-[1px] ${isDark ? "bg-zinc-800" : "bg-zinc-300"}`} />
                              <span>{inspectText.length} <span className="opacity-45">chars</span></span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setInspectText("");
                                setAnalysisResult(null);
                                setInspectorViewMode("edit");
                                setSelectedSegmentIdx(null);
                              }}
                              className={`p-1.5 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer ${
                                isDark 
                                  ? "hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 border border-transparent hover:border-rose-500/20" 
                                  : "hover:bg-rose-50 text-zinc-500 hover:text-rose-600 border border-transparent hover:border-rose-200"
                              }`}
                              title="Clear draft"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <AnimatePresence>
                        {analysisResult && (analysisResult.dangerousContent?.length > 0 || analysisResult.potentialIssues?.length > 0) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -8 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            {(() => {
                              const segments = getSegments(inspectText, analysisResult.matchedRules || []);
                              const selectedSeg = selectedSegmentIdx !== null ? segments[selectedSegmentIdx] : null;
                              
                              if (selectedSeg && selectedSeg.rule) {
                                const rule = selectedSeg.rule;
                                return (
                                  <div className={`p-4 rounded-xl border flex flex-col items-start gap-4 transition-all duration-200 ${
                                    isDark 
                                      ? "bg-rose-500/5 border-rose-500/20 text-zinc-200" 
                                      : "bg-rose-50/60 border-rose-200 text-zinc-905"
                                  }`}>
                                    <div className="space-y-1.5 w-full">
                                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/10 pb-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded select-none ${
                                            rule.severity === "Critical Risk" || rule.severity === "High Risk"
                                              ? "bg-rose-500/25 text-rose-600 dark:text-rose-450 font-black"
                                              : "bg-amber-500/25 text-amber-600 dark:text-amber-450 font-black"
                                          }`}>
                                            ⚠️ {rule.severity}
                                          </span>
                                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-650 dark:text-zinc-300">
                                            Term: "{selectedSeg.text}"
                                          </span>
                                          <span className="text-[9.5px] font-bold text-zinc-500 dark:text-zinc-400">
                                            {rule.category}
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedSegmentIdx(null)}
                                          className="p-1 rounded bg-zinc-500/10 text-zinc-500 hover:text-zinc-750 dark:hover:text-zinc-300 cursor-pointer transition-colors"
                                          title="Close details"
                                        >
                                          <X className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                      
                                      <p className="text-xs font-semibold leading-relaxed text-zinc-750 dark:text-zinc-300 pt-1">
                                        <strong className="text-rose-600 dark:text-rose-400">Reason:</strong> {rule.explanation}
                                      </p>
                                      
                                      <div className="mt-3 pt-2 border-t border-rose-500/5">
                                        {/* Filter Bypass Disguise */}
                                        <div className="space-y-2 p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                                          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                            <span>🕵️ Filter Bypass Disguise</span>
                                          </div>
                                          <p className="text-[10.5px] text-zinc-650 dark:text-zinc-400 font-medium">
                                            Obfuscate the original word using spacing, dots, or hyphens to safely bypass automatic platform filters.
                                          </p>
                                          <div className="grid grid-cols-2 gap-2.5">
                                            {getDisguisedForms(selectedSeg.text).map((form, fIdx) => (
                                              <button
                                                key={fIdx}
                                                type="button"
                                                onClick={() => fixSingleSegment(selectedSegmentIdx!, form.value)}
                                                className="p-2 rounded-lg border border-zinc-350 hover:border-indigo-500 dark:border-zinc-800 dark:hover:border-indigo-400/50 hover:bg-indigo-500/5 transition text-left cursor-pointer active:scale-98 duration-100"
                                                title={`Format as: ${form.type}`}
                                              >
                                                <div className="text-[8.5px] text-zinc-450 font-mono font-bold tracking-tight">
                                                  {form.type}
                                                </div>
                                                <div className="text-[11px] font-mono font-black text-indigo-600 dark:text-indigo-400 mt-0.5 truncate select-none">
                                                  {form.value}
                                                </div>
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              // Default Summary view if no specific segment clicked
                              return (
                                <div className={`p-4 rounded-xl border flex flex-col gap-4 select-none ${
                                  isDark 
                                    ? "bg-amber-500/5 border-amber-500/15 text-amber-300" 
                                    : "bg-amber-50/50 border-amber-200 text-amber-900"
                                }`}>
                                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                      <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-bounce" />
                                      </div>
                                      <div className="min-w-0">
                                        <h4 className="text-xs font-black tracking-tight text-zinc-900 dark:text-zinc-100">ToS Risk Triggers Located</h4>
                                        <p className="text-[10.5px] text-zinc-650 dark:text-zinc-400 mt-0.5 leading-relaxed">
                                          Click any flagged word in the marked draft above to inspect details, or configure your Auto-Fix strategy below.
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Strategy selector inside the alert box */}
                                  <div className="pt-2 border-t border-amber-500/10 flex flex-col gap-2.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-zinc-650 dark:text-zinc-300">⚡ Choose Auto-Fix Strategy:</span>
                                      <span className="text-[9px] font-mono text-zinc-500">Applies to "Auto-Fix All"</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-zinc-500/5 border border-zinc-200/40 dark:border-zinc-800/40">
                                      {[
                                        { id: "compound", label: "🕵️ Compound Space", desc: "e.g., g mail" },
                                        { id: "dotted", label: "🕵️ Dotted Letters", desc: "e.g., g.m.a.i.l" },
                                        { id: "hyphenated", label: "🕵️ Hyphenated", desc: "e.g., g-mail" },
                                        { id: "spaced", label: "🕵️ Spaced Letters", desc: "e.g., g m a i l" },
                                      ].map((strategy) => (
                                        <button
                                          key={strategy.id}
                                          type="button"
                                          onClick={() => setFixStrategy(strategy.id as any)}
                                          className={`px-2 py-1.5 rounded-lg text-[9px] font-black tracking-tight transition-all duration-150 cursor-pointer ${
                                            fixStrategy === strategy.id
                                              ? "bg-indigo-600 text-white shadow-sm"
                                              : "text-zinc-750 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-500/5"
                                          }`}
                                          title={strategy.desc}
                                        >
                                          {strategy.label}
                                        </button>
                                      ))}
                                    </div>
                                    <div className="flex justify-end pt-1">
                                      <button
                                        type="button"
                                        onClick={fixAllSegments}
                                        className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md shadow-indigo-600/10 transition-all duration-150 active:scale-95"
                                      >
                                        <Sparkles className="h-3.5 w-3.5" /> Auto-Fix All ({analysisResult.matchedRules?.length || 0}) with Disguised {fixStrategy.toUpperCase()}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        onClick={() => handleInspect()}
                        disabled={isInspecting || !inspectText.trim()}
                        className={`w-full py-3.5 rounded-xl font-bold text-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow- premium ${
                          isInspecting 
                            ? "bg-indigo-600/50 text-indigo-200" 
                            : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-600/10"
                        } disabled:opacity-45 disabled:pointer-events-none hover:scale-[1.005]`}
                      >
                        {isInspecting ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Inspecting Compliance via ToS Engine...
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4" />
                            Perform Instant Safety Audit
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === "composer" && (
                  <motion.div
                    key="tab-composer"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex-1 flex flex-col gap-5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold uppercase text-indigo-650 dark:text-indigo-400 tracking-widest">AI FORMULATION MATRIX</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-extrabold font-display tracking-tight mt-1 text-zinc-900 dark:text-zinc-100">
                        Professional AI Writer
                      </h2>
                      <p className="text-sm text-zinc-650 dark:text-zinc-300 mt-1.5 font-medium leading-relaxed opacity-95">
                        Type crude thoughts or incomplete notes, and generate polished, fully compliant communication replies natively suited for Fiverr.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300 block mb-1.5">
                          Rough message intent or keywords
                        </label>
                        <textarea
                          value={rawThoughts}
                          onChange={(e) => setRawThoughts(e.target.value)}
                          placeholder="What do you want to tell the client? (e.g. Thank them for the budget. Tell them we can do a safe video appointment on Fiverr on Monday, but no Skype. Reassure them...)"
                          className={`w-full min-h-[120px] p-4 text-xs font-semibold leading-relaxed outline-none rounded-2xl transition resize-none shadow-inner ${
                            isDark 
                              ? "bg-zinc-950/50 border border-zinc-800/60 focus:border-indigo-500/80 text-zinc-200 placeholder-zinc-500 focus:ring-4 focus:ring-indigo-500/10" 
                              : "bg-white border border-zinc-300 focus:border-indigo-600 text-zinc-900 placeholder-zinc-650 focus:ring-4 focus:ring-indigo-500/10"
                          }`}
                        />
                      </div>

                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="text-[9px] font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300 block mb-1.5">
                            Target Output Tone
                          </label>
                          
                          {/* Segmented control for Tone selection */}
                          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 p-1 rounded-xl border gap-0.5 ${
                            isDark ? "bg-zinc-950/30 border-zinc-800/50" : "bg-zinc-200/80 border-zinc-300"
                          }`}>
                            {[
                              { id: "Professional", label: "💼 Elite Pro" },
                              { id: "Friendly", label: "👋 Warm" },
                              { id: "Humble", label: "🙏 Humble" },
                              { id: "Confident", label: "✨ Confident" },
                              { id: "Legal", label: "⚖️ Legal" },
                              { id: "Urgent", label: "🚨 Urgent" }
                            ].map((tone) => (
                              <button
                                key={tone.id}
                                onClick={() => setSelectedTone(tone.id)}
                                className={`py-2 rounded-lg text-[11px] font-extrabold transition-all duration-200 cursor-pointer ${
                                  selectedTone === tone.id 
                                    ? (isDark ? "bg-zinc-800 text-white shadow-3xs" : "bg-white text-zinc-900 shadow-3xs") 
                                    : "text-zinc-700 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200"
                                }`}
                              >
                                {tone.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCompose()}
                          disabled={isComposing || !rawThoughts.trim()}
                          className={`w-full py-3.5 rounded-xl font-bold text-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-premium ${
                            isComposing 
                              ? "bg-indigo-600/50 text-indigo-200" 
                              : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-600/10"
                          } disabled:opacity-45 disabled:pointer-events-none hover:scale-[1.005]`}
                        >
                          {isComposing ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Drafting Safe Chat Script...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Generate Secure Fiverr Script
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Pre-made interactive quick actions */}
                    <div className="border-t border-zinc-200/20 dark:border-white/5 pt-4 space-y-3 select-none">
                      <span className="text-[9px] font-mono font-black uppercase text-zinc-700 dark:text-zinc-300 block">
                        Tactical Workspace Presets
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {quickTemplates.map((tpl, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setRawThoughts(tpl.thoughts);
                              setSelectedTone(tpl.tone);
                              handleCompose(tpl.thoughts, tpl.tone);
                            }}
                            className={`p-3 rounded-xl text-left border transition-all text-xs flex flex-col gap-1 cursor-pointer hover:scale-[1.01] ${
                              isDark 
                                ? "bg-zinc-900/30 border-zinc-800/40 hover:bg-zinc-800/40 text-zinc-300 hover:border-zinc-700" 
                                : "bg-white border border-zinc-300 hover:bg-white text-zinc-800 hover:border-zinc-400 shadow-3xs"
                            }`}
                          >
                            <span className="font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> {tpl.title}
                            </span>
                            <span className="text-[10px] text-zinc-700 dark:text-zinc-400 font-semibold line-clamp-1">
                              {tpl.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "rules" && (
                  <motion.div
                    key="tab-rules"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex-1 flex flex-col gap-4 select-text"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold uppercase text-indigo-650 dark:text-indigo-400 tracking-widest">RULES INTELLIGENCE REGISTRY</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-extrabold font-display tracking-tight mt-1 text-zinc-900 dark:text-zinc-100">
                        ToS Directory Browser
                      </h2>
                      <p className="text-sm text-zinc-650 dark:text-zinc-300 mt-1.5 font-medium leading-relaxed opacity-95">
                        Access and search over {fullComplianceDatabase.length} registered safety blocks, payment boundaries, and prohibited phrase patterns.
                      </p>
                    </div>

                    {/* Search & Filter Toolbar */}
                    <div className="space-y-2 select-none">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-650 dark:text-zinc-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search policy index (e.g. WhatsApp, PayPal, academic)..."
                          className={`w-full pl-9 pr-9 py-2 rounded-xl border text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                            isDark 
                              ? "bg-zinc-950/40 border-zinc-800/60 text-zinc-200 placeholder-zinc-500" 
                              : "bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-600 shadow-3xs"
                          }`}
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Category Dropdown */}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300">Category Filter</span>
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${
                              isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-white border-zinc-300 text-zinc-900 shadow-3xs"
                            }`}
                          >
                            {[
                              "All",
                              "Off-Platform Communication",
                              "External Payments",
                              "Fiverr Fee Circumvention",
                              "Personal Contact Information",
                              "Phishing & Suspicious Language",
                              "Academic Integrity Violations",
                              "Feedback & Review Manipulation",
                              "Harassment & Unprofessional"
                            ].map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* Severity Dropdown */}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300">Severity Level</span>
                          <select
                            value={selectedSeverity}
                            onChange={(e) => setSelectedSeverity(e.target.value)}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${
                              isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-white border-zinc-300 text-zinc-900 shadow-3xs"
                            }`}
                          >
                            {["All", "Low Risk", "Medium Risk", "High Risk", "Critical Risk"].map((sev) => (
                              <option key={sev} value={sev}>{sev}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Compact Scrollable List */}
                    <div className="flex-1 overflow-y-auto max-h-[280px] space-y-1.5 pr-1 select-none">
                      <AnimatePresence>
                        {fullComplianceDatabase.filter(rule => {
                          const matchesSearch = rule.phrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            rule.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            rule.explanation.toLowerCase().includes(searchQuery.toLowerCase());
                          const matchesCategory = selectedCategory === "All" || rule.category === selectedCategory;
                          const matchesSeverity = selectedSeverity === "All" || rule.severity === selectedSeverity;
                          return matchesSearch && matchesCategory && matchesSeverity;
                        }).length === 0 ? (
                          <motion.div
                            key="no-matches"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="py-12 text-center select-none"
                          >
                            <ShieldAlert className="h-8 w-8 text-zinc-600 mx-auto opacity-40 mb-3" />
                            <span className="text-xs font-bold text-zinc-700 block font-display">No compliance rules matched</span>
                            <span className="text-[10px] text-zinc-600 block mt-1">Try resetting your search query or filters.</span>
                          </motion.div>
                        ) : (
                          fullComplianceDatabase.filter(rule => {
                            const matchesSearch = rule.phrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              rule.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              rule.explanation.toLowerCase().includes(searchQuery.toLowerCase());
                            const matchesCategory = selectedCategory === "All" || rule.category === selectedCategory;
                            const matchesSeverity = selectedSeverity === "All" || rule.severity === selectedSeverity;
                            return matchesSearch && matchesCategory && matchesSeverity;
                          }).map((rule) => {
                            const isSelected = selectedRule?.id === rule.id;
                            return (
                              <motion.button
                                key={rule.id}
                                layoutId={`rule-card-${rule.id}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                onClick={() => setSelectedRule(rule)}
                                className={`w-full px-3 py-2.5 rounded-xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                                  isSelected
                                    ? "bg-indigo-500/10 border-indigo-500/40 dark:bg-indigo-500/15 dark:border-indigo-500/50"
                                    : isDark
                                    ? "bg-zinc-950/20 border-zinc-800/40 hover:bg-zinc-800/30"
                                    : "bg-white border border-zinc-300 hover:bg-white text-zinc-900 shadow-3xs"
                                }`}
                              >
                                <div className="flex flex-col gap-0.5 min-w-0">
                                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 truncate font-sans">
                                    {rule.phrase.replace(/\s?\(Case\s?#\d+\)/gi, "")}
                                  </span>
                                  <span className="text-[9px] text-zinc-700 dark:text-zinc-400 font-mono font-semibold truncate">
                                    {rule.category}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 select-none">
                                  <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded ${
                                    rule.severity === "Critical Risk"
                                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                      : rule.severity === "High Risk"
                                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                      : rule.severity === "Medium Risk"
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  }`}>
                                    Score: {rule.riskScore}
                                  </span>
                                  <ChevronRight className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${isSelected ? "rotate-90 text-indigo-500" : ""}`} />
                                </div>
                              </motion.button>
                            );
                          })
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

                {/* RIGHT COMPONENT COLUMN (Diagnostics / Active status monitor) */}
            <div className={`w-full md:w-[410px] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden ${
              isDark ? "bg-zinc-950/20" : "bg-zinc-100/50"
            }`}>
              {/* macOS-style Toast notification sheet */}
              <AnimatePresence>
                {toastMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -40, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 220, damping: 16 }}
                    className={`absolute top-4 left-4 right-4 z-50 p-3.5 rounded-2xl border backdrop-blur-md shadow-lg flex items-center gap-3 select-none ${
                      isDark 
                        ? "bg-zinc-900/90 border-white/10 text-white" 
                        : "bg-white/95 border-zinc-200 text-zinc-900"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-4.5 w-4.5 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-mono font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest leading-none mb-0.5">LENS TELEMETRY</p>
                      <p className="text-[11px] font-bold truncate leading-tight">{toastMessage}</p>
                    </div>
                    <button 
                      onClick={() => setToastMessage(null)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 hover:bg-zinc-500/10 transition-colors cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence mode="wait">
                {activeTab === "inspector" && (
                  <motion.div
                    key="side-inspector"
                    initial={{ opacity: 0, scale: 0.98, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -5 }}
                    transition={{ type: "spring", stiffness: 180, damping: 19 }}
                    className="flex-1 flex flex-col justify-between gap-5"
                  >
                    {/* Segmented Control sub-tab switcher */}
                    <div className="grid grid-cols-2 gap-1 p-0.5 rounded-xl bg-zinc-500/10 border border-zinc-250/20 dark:border-zinc-850/20 select-none shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSidebarView("insights");
                          setToastMessage("Accessing Safety Diagnostics Hub");
                        }}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                          sidebarView === "insights"
                            ? isDark 
                              ? "bg-zinc-850 text-white shadow-2xs border border-zinc-700/60" 
                              : "bg-white text-zinc-900 shadow-2xs border border-zinc-200"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-350"
                        }`}
                      >
                        <Shield className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Diagnostics Hub</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSidebarView("playbook");
                          setToastMessage("Loading Safe Compliance Playbooks");
                        }}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                          sidebarView === "playbook"
                            ? isDark 
                              ? "bg-zinc-850 text-white shadow-2xs border border-zinc-700/60" 
                              : "bg-white text-zinc-900 shadow-2xs border border-zinc-200"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-350"
                        }`}
                      >
                        <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Tactics Playbook</span>
                      </button>
                    </div>

                    {sidebarView === "playbook" ? (
                      /* HIGH-END INTERACTIVE TACTICS PLAYBOOK SUB-VIEW */
                      <div className="flex-1 flex flex-col justify-between select-text h-full">
                        <div className="space-y-4">
                          <div className="border-b border-zinc-200/10 dark:border-white/5 pb-2 select-none">
                            <span className="text-[11px] font-mono font-bold uppercase text-indigo-650 dark:text-indigo-400 tracking-widest block">COMPLIANCE TACTICS PLAYBOOK</span>
                            <span className="text-[10px] text-zinc-650 dark:text-zinc-450 font-medium">Click on a category to reveal safe Fiverr phrases & guidelines</span>
                          </div>

                          {/* Beautiful Interactive Grid Switcher */}
                          <div className="grid grid-cols-2 gap-2 select-none">
                            {[
                              { id: "payment", label: "Payments", icon: CreditCard, color: "from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400" },
                              { id: "meeting", label: "Meetings", icon: Video, color: "from-indigo-500/20 to-purple-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-400" },
                              { id: "review", label: "Reviews", icon: Star, color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" },
                              { id: "assets", label: "File Share", icon: Share2, color: "from-blue-500/20 to-sky-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400" }
                            ].map((topic) => {
                              const isSelected = playbookTopic === topic.id;
                              return (
                                <button
                                  key={topic.id}
                                  type="button"
                                  onClick={() => {
                                    setPlaybookTopic(topic.id as any);
                                    setToastMessage(`Switched to ${topic.label} tactics playbook`);
                                  }}
                                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-305 group cursor-pointer ${
                                    isSelected
                                      ? `bg-gradient-to-br ${topic.color} shadow-sm scale-[1.02] font-extrabold ring-2 ring-indigo-500/20`
                                      : isDark
                                      ? "bg-zinc-905/40 border-zinc-800/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30"
                                      : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 shadow-3xs"
                                  }`}
                                >
                                  <topic.icon className={`h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110 ${
                                    isSelected ? "text-indigo-500 animate-pulse" : "text-zinc-400"
                                  }`} />
                                  <span className="text-[11px] leading-tight">{topic.label}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Selected Topic Visual Details */}
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={playbookTopic}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-3"
                            >
                              {/* Short Topic Briefing card */}
                              <div className={`p-3 rounded-xl border leading-relaxed ${
                                isDark 
                                  ? `${playbookData[playbookTopic].bgColor} ${playbookData[playbookTopic].borderColor} text-zinc-200` 
                                  : "bg-white border-zinc-200 shadow-3xs text-zinc-800"
                              }`}>
                                <div className="flex items-center justify-between mb-1 select-none">
                                  <span className="text-[9px] font-mono font-bold tracking-widest uppercase opacity-80">POLICY GUIDELINES</span>
                                  <span className={`text-[8px] font-black uppercase font-mono px-2 py-0.5 rounded ${playbookData[playbookTopic].textColor} bg-white/40 dark:bg-black/20`}>
                                    {playbookData[playbookTopic].badge}
                                  </span>
                                </div>
                                <p className="text-[11px] font-medium leading-relaxed">
                                  {playbookData[playbookTopic].text}
                                </p>
                              </div>

                              {/* Blocked Words Badges */}
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-bold text-red-500 dark:text-red-400 uppercase tracking-widest block select-none">⚠️ High-Risk Filter Flags</span>
                                <div className="flex flex-wrap gap-1">
                                  {playbookData[playbookTopic].dangerWords.map((word) => (
                                    <span key={word} className="text-[9.5px] font-mono font-black px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/15">
                                      {word}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Interactive Alternatives Card List */}
                              <div className="space-y-2">
                                <span className="text-[9px] font-mono font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest block select-none">✨ Safe Translation Cards</span>
                                <div className="space-y-2 overflow-y-auto max-h-[170px] pr-1">
                                  {playbookData[playbookTopic].alternatives.map((alt, index) => {
                                    const copyId = `${playbookTopic}_${index}`;
                                    const isCopied = copiedTemplateIdx === copyId;
                                    return (
                                      <div 
                                        key={index} 
                                        className={`rounded-xl border p-2.5 space-y-2 ${
                                          isDark ? "bg-zinc-900/20 border-zinc-850" : "bg-white border-zinc-250 shadow-3xs"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between select-none border-b border-zinc-200/5 pb-1">
                                          <span className="text-[10px] font-extrabold text-indigo-650 dark:text-indigo-400">{alt.label}</span>
                                        </div>
                                        
                                        <div className="space-y-1 text-[10px] leading-normal font-medium">
                                          <div className="flex gap-1.5 text-zinc-500 dark:text-zinc-400 line-through opacity-75">
                                            <span className="text-red-500 font-bold shrink-0">🚫</span>
                                            <span className="italic">{alt.original}</span>
                                          </div>
                                          <div className="flex gap-1.5 text-zinc-900 dark:text-zinc-150 font-semibold">
                                            <span className="text-emerald-500 font-bold shrink-0">🌿</span>
                                            <span>{alt.safe}</span>
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            handlePlaybookCopy(alt.safe, copyId);
                                            setToastMessage(`Copied compliant phrase for "${alt.label}"!`);
                                          }}
                                          className={`w-full py-1.5 rounded-lg text-[10px] font-black transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 select-none border ${
                                            isCopied
                                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                              : isDark
                                              ? "bg-zinc-800/40 hover:bg-zinc-800/80 border-zinc-700/55 text-zinc-350 hover:text-white"
                                              : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700"
                                          }`}
                                        >
                                          {isCopied ? (
                                            <>
                                              <Check className="h-3 w-3" />
                                              <span>Copied to Clipboard!</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="h-3 w-3" />
                                              <span>Copy Compliant Phrase</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        {/* Strategy Tip at the bottom */}
                        <div className={`mt-3 p-3 rounded-xl border flex gap-2 leading-relaxed select-text ${
                          isDark ? "bg-zinc-950/40 border-zinc-850" : "bg-zinc-50 border-zinc-200"
                        }`}>
                          <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-mono font-bold text-zinc-700 dark:text-zinc-400 uppercase block select-none">Strategic Seller Tip</span>
                            <p className="text-[10px] text-zinc-650 dark:text-zinc-400 font-medium">
                              {playbookData[playbookTopic].strategy}
                            </p>
                          </div>
                        </div>

                      </div>
                    ) : (
                      /* HIGH-END INTERACTIVE INSIGHTS HUB (Diagnostics, Safety & Client Mood) */
                      analysisResult ? (
                        <div className="space-y-5 select-text flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            {/* Rotating Futuristic Holographic safety dial */}
                            <motion.div 
                              whileHover={{ scale: 1.025, rotate: [0, -1, 1, 0] }}
                              transition={{ type: "spring", stiffness: 300, damping: 10 }}
                              className={`p-4 rounded-2xl border flex items-center gap-4.5 select-none relative overflow-hidden group cursor-pointer ${
                                isDark 
                                  ? "bg-gradient-to-r from-zinc-900 to-zinc-950 border-zinc-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]" 
                                  : "bg-gradient-to-r from-white to-zinc-50 border-zinc-200 shadow-3xs"
                              }`}
                            >
                              <div className="relative h-15 w-15 shrink-0 flex items-center justify-center select-none">
                                <svg className="absolute inset-0 transform -rotate-90 group-hover:scale-105 transition-transform duration-300" viewBox="0 0 36 36">
                                  {/* Background trail */}
                                  <path
                                    className={`${isDark ? "stroke-zinc-850" : "stroke-zinc-200"} fill-none`}
                                    strokeWidth="3.5"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                  {/* Holographic Glowing path */}
                                  <motion.path
                                    initial={{ strokeDasharray: "0, 100" }}
                                    animate={{ strokeDasharray: `${analysisResult.safetyScore}, 100` }}
                                    transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.2 }}
                                    className={`fill-none ${
                                      analysisResult.safetyScore > 80 
                                        ? "stroke-emerald-500 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]" 
                                        : analysisResult.safetyScore > 50 
                                        ? "stroke-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]" 
                                        : "stroke-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                                    }`}
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                </svg>
                                
                                {/* Inner sweep scanner effect */}
                                <div className="absolute inset-1.5 rounded-full border border-dashed border-indigo-500/25 animate-spin" style={{ animationDuration: "12s" }} />
                                
                                <span className="text-[12px] font-mono font-black text-zinc-900 dark:text-zinc-100 z-10">
                                  {analysisResult.safetyScore}%
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <span className="text-[8.5px] font-mono font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-400 block mb-0.5">TOS COGNITIVE VERDICT INDEX</span>
                                <div className="flex items-center gap-1.5">
                                  <h3 className={`text-sm font-black tracking-tight ${
                                    analysisResult.riskLevel === "Safe" 
                                      ? "text-emerald-700 dark:text-emerald-400" 
                                      : analysisResult.riskLevel === "Warning" 
                                      ? "text-amber-700 dark:text-amber-400" 
                                      : "text-red-700 dark:text-red-400"
                                  }`}>
                                    {analysisResult.riskLevel === "Safe" ? "Pristine Status" : analysisResult.riskLevel === "Warning" ? "Warning Alert" : "Severe Violations"}
                                  </h3>
                                  {analysisResult.riskLevel === "Safe" ? (
                                    <ShieldCheck className="h-4 w-4 text-emerald-500 animate-bounce" />
                                  ) : (
                                    <AlertCircle className={`h-4 w-4 animate-pulse ${
                                      analysisResult.riskLevel === "Warning" ? "text-amber-500" : "text-red-500"
                                    }`} />
                                  )}
                                </div>
                                <span className="text-[10px] text-zinc-750 dark:text-zinc-400 font-medium">
                                  Policy Shielding: <span className="font-extrabold text-emerald-600 dark:text-emerald-400">100% Locked</span>
                                </span>
                              </div>
                            </motion.div>

                            {/* UNIQUE & CREATIVE SIMULATED CLIENT BEHAVIOR SPECTROGRAM */}
                            <div className={`p-4 rounded-2xl border ${
                              isDark ? "bg-zinc-950/40 border-zinc-850" : "bg-white border-zinc-200 shadow-3xs"
                            }`}>
                              <span className="text-[9px] font-mono font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest block mb-2.5">CLIENT PERSONALITY SPECTROGRAM</span>
                              
                              <div className="space-y-3">
                                {/* Estimated Mood Spec */}
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Simulated Mood Metric</span>
                                  <motion.span 
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className={`text-[10px] font-extrabold font-mono px-2.5 py-0.5 rounded-full ${
                                      analysisResult.clientMood?.toLowerCase().includes("urgent") || analysisResult.clientMood?.toLowerCase().includes("stress")
                                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    }`}
                                  >
                                    {analysisResult.clientMood || "Neutral Engagement"}
                                  </motion.span>
                                </div>

                                {/* Friction Level Meter */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                                    <span>TOS Friction Potential</span>
                                    <span className="font-mono">{analysisResult.safetyScore > 80 ? "LOW" : analysisResult.safetyScore > 50 ? "MEDIUM" : "CRITICAL"}</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-zinc-200/50 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${100 - analysisResult.safetyScore}%` }}
                                      transition={{ type: "spring", stiffness: 120, damping: 15 }}
                                      className={`h-full rounded-full ${
                                        analysisResult.safetyScore > 80 
                                          ? "bg-emerald-500" 
                                          : analysisResult.safetyScore > 50 
                                          ? "bg-amber-500" 
                                          : "bg-red-500"
                                      }`} 
                                    />
                                  </div>
                                </div>

                                {/* Speed and conciseness recommender */}
                                <div className="flex gap-2 p-2 rounded-xl bg-zinc-500/5 text-[10px] font-medium leading-relaxed text-zinc-650 dark:text-zinc-400">
                                  <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                  <div className="space-y-0.5">
                                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200">Recommended Reply Velocity</span>
                                    <p>
                                      {analysisResult.clientMood?.toLowerCase().includes("urgent") 
                                        ? "Send reply within 12 minutes. Be extremely professional and provide a direct checkout offer link."
                                        : "Standard priority pacing. Leverage soft inquiries regarding past project specifications."}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Detailed Alerts Section */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">TELEMETRY DETAILED ALERTS</span>
                              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                                {analysisResult.dangerousContent && analysisResult.dangerousContent.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {analysisResult.dangerousContent.map((err, idx) => (
                                      <motion.div 
                                        key={idx} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: idx * 0.05 }}
                                        className="flex items-start gap-2 text-[10.5px] text-red-700 dark:text-red-300 font-semibold bg-red-500/5 p-2.5 rounded-xl border border-red-500/10 hover:border-red-500/25 transition-all"
                                      >
                                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                                        <span>{err}</span>
                                      </motion.div>
                                    ))}
                                  </div>
                                ) : null}

                                {analysisResult.potentialIssues && analysisResult.potentialIssues.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {analysisResult.potentialIssues.map((err, idx) => (
                                      <motion.div 
                                        key={idx} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: idx * 0.05 }}
                                        className="flex items-start gap-2 text-[10.5px] text-amber-700 dark:text-[#FBBF24] font-semibold bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10 hover:border-amber-500/25 transition-all"
                                      >
                                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                                        <span>{err}</span>
                                      </motion.div>
                                    ))}
                                  </div>
                                ) : null}

                                {(!analysisResult.dangerousContent || analysisResult.dangerousContent.length === 0) &&
                                 (!analysisResult.potentialIssues || analysisResult.potentialIssues.length === 0) ? (
                                  <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-400 flex flex-col gap-1 select-none">
                                    <span className="font-extrabold flex items-center gap-1.5">
                                      <ShieldCheck className="h-4 w-4 text-emerald-500" /> Approved Script Draft
                                    </span>
                                    <p className="text-[10px] leading-relaxed opacity-90 font-medium">
                                      Clean, platform-compliant script. No contact requests or off-platform payment redirection signals triggered.
                                    </p>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          {/* Interactive Communication Metric Bars */}
                          {analysisResult.communicationQualityScore && (
                            <div className="space-y-2 border-t border-zinc-250/15 dark:border-white/5 pt-3.5 select-none">
                              <span className="text-[9px] font-mono font-bold text-zinc-550 dark:text-zinc-400 uppercase">COMMUNICATION PERFORMANCE</span>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                                {[
                                  { label: "Clarity", score: analysisResult.communicationQualityScore.clarity },
                                  { label: "Professionalism", score: analysisResult.communicationQualityScore.professionalism },
                                  { label: "Persuasion", score: analysisResult.communicationQualityScore.persuasiveness },
                                  { label: "Trust Factor", score: analysisResult.communicationQualityScore.trustworthiness }
                                ].map((metric) => (
                                  <div key={metric.label} className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-extrabold text-zinc-700 dark:text-zinc-300">
                                      <span>{metric.label}</span>
                                      <span>{metric.score}/10</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-200/60 dark:bg-zinc-800 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${metric.score * 10}%` }}
                                        transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-650 rounded-full" 
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* HIGH-END INTERACTIVE POLICY SIMULATOR & MONITOR (Idle State) */
                        <div className="flex-1 flex flex-col justify-between h-full">
                          <div className="space-y-4">
                            <div className="border-b border-zinc-200/10 dark:border-white/5 pb-2.5 select-none">
                              <span className="text-[11px] font-mono font-bold uppercase text-indigo-650 dark:text-indigo-400 tracking-widest">COGNITIVE COMPLIANCE GUARD</span>
                              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 font-display mt-0.5">
                                Security Firewalls Live
                              </h3>
                            </div>

                            {/* HIGH-FIDELITY AI & AUTOMATION ENGINE CORE */}
                            <div className={`p-4.5 rounded-2xl border flex flex-col justify-center relative overflow-hidden select-none ${
                              isDark ? "bg-zinc-950/40 border-zinc-800/40" : "bg-white border-zinc-300 shadow-3xs text-zinc-900"
                            }`}>
                              {/* Glowing grid overlay representing automation nodes */}
                              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:14px_14px]" />
                              
                              <div className="z-10 flex flex-col items-center gap-3">
                                {/* Interactive AI Pulsing Node Matrix */}
                                <div className="relative h-16 w-16 flex items-center justify-center">
                                  {/* Rotating Outer Cognitive Ring */}
                                  <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/30"
                                  />
                                  
                                  {/* Pulsing Inner Orbit Ring */}
                                  <motion.div 
                                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                    className="absolute inset-2 rounded-full border border-emerald-500/40 bg-emerald-500/5"
                                  />
                                  
                                  {/* Core AI Processing Chip */}
                                  <motion.div 
                                    animate={{ scale: [0.95, 1.05, 0.95] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                    className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 z-10"
                                  >
                                    <Cpu className="h-4.5 w-4.5 animate-pulse" />
                                  </motion.div>

                                  {/* Orbiting Satellite Data Nodes */}
                                  <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                                    className="absolute inset-0"
                                  >
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                                  </motion.div>
                                </div>

                                <div className="text-center space-y-1">
                                  <span className="text-[10px] font-mono font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                                    AI COMPLIANCE ENGINE ACTIVE
                                  </span>
                                  
                                  {/* Real-time automated activities logs */}
                                  <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[9px] font-mono text-zinc-500 dark:text-zinc-400">
                                    <span className="flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                      Auto-Scan: Live
                                    </span>
                                    <span className="text-zinc-350 dark:text-zinc-850">•</span>
                                    <span>Pipeline: 45ms Latency</span>
                                    <span className="text-zinc-350 dark:text-zinc-850">•</span>
                                    <span className="text-indigo-500 dark:text-indigo-400 font-extrabold">Autonomous Guard</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* INTERACTIVE COMPLIANCE FIREWALL SHIELDS SIMULATOR GRID */}
                            <div className="space-y-2 select-none">
                              <span className="text-[10px] font-mono font-bold uppercase text-indigo-650 dark:text-indigo-400 tracking-wider block">ACTIVE POLICY FIREWALLS</span>
                              <div className="grid grid-cols-1 gap-2">
                                {[
                                  { key: "offPlatform", label: "Off-Platform Guard Line", desc: "Flags Skype, WhatsApp, social tags", icon: Globe },
                                  { key: "paymentCircumvention", label: "Payment Circumvention", desc: "Blocks PayPal, CashApp, Direct wire requests", icon: CreditCard },
                                  { key: "reviewCoercion", label: "Review Coercion Auditing", desc: "Blocks ratings/feedback requests manipulation", icon: Star },
                                  { key: "academicCheating", label: "Academic Cheating Audits", desc: "Bans homeworks, school assignment contracts", icon: BookOpen }
                                ].map((shield) => {
                                  const isActive = activeShields[shield.key];
                                  return (
                                    <motion.div 
                                      key={shield.key}
                                      whileHover={{ scale: 1.015 }}
                                      whileTap={{ scale: 0.99 }}
                                      onClick={() => {
                                        const nextVal = !isActive;
                                        setActiveShields(prev => ({ ...prev, [shield.key]: nextVal }));
                                        setToastMessage(`${nextVal ? "🛡️ Activated" : "⚠️ Suspended"} ${shield.label}`);
                                      }}
                                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 ${
                                        isActive 
                                          ? isDark 
                                            ? "bg-zinc-900/40 border-indigo-500/30 text-white" 
                                            : "bg-indigo-50/20 border-indigo-200 text-zinc-900"
                                          : isDark
                                          ? "bg-zinc-950/20 border-zinc-850 text-zinc-500"
                                          : "bg-zinc-50 border-zinc-200 text-zinc-500"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <div className={`p-2 rounded-lg ${isActive ? "bg-indigo-500/10 text-indigo-500" : "bg-zinc-500/5 text-zinc-400"}`}>
                                          <shield.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <span className={`text-[11px] block leading-tight ${isActive ? "font-black" : "font-semibold"}`}>{shield.label}</span>
                                          <span className="text-[9.5px] opacity-80 font-medium">{shield.desc}</span>
                                        </div>
                                      </div>
                                      
                                      {/* Beautiful macOS styled Toggle Switch */}
                                      <div className={`w-8.5 h-5 rounded-full transition-colors duration-200 flex items-center p-0.5 shrink-0 ${
                                        isActive ? "bg-indigo-500" : "bg-zinc-350 dark:bg-zinc-800"
                                      }`}>
                                        <motion.div 
                                          layout
                                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                          className="w-4 h-4 rounded-full bg-white shadow-xs"
                                          style={{ x: isActive ? 14 : 0 }}
                                        />
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 select-none text-center p-3 select-none">
                            <span className="text-[10px] font-mono text-zinc-700 dark:text-zinc-400 font-extrabold uppercase">COGNITION SCAN SYSTEM READY</span>
                            <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                              Insert client messages/scripts inside the inspector textarea editor and click "Verify Script Alignment" to scan.
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </motion.div>
                )}

                {activeTab === "composer" && (
                  <motion.div
                    key="side-composer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between gap-5 select-text"
                  >
                    {composedMessage ? (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between border-b border-zinc-200/10 dark:border-white/5 pb-3">
                          <div>
                            <span className="text-[11px] font-mono font-bold uppercase text-indigo-650 dark:text-indigo-400 tracking-widest">AI OUTPUT MATRIX</span>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-display mt-1">
                              Structured Draft Output
                            </h3>
                          </div>
                          <span className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 font-black uppercase font-mono">
                            {selectedTone}
                          </span>
                        </div>

                        <div className={`p-5 rounded-2xl border text-[13px] md:text-[14px] font-medium leading-relaxed relative ${
                          isDark ? "bg-zinc-950/50 border-zinc-800/60 text-zinc-200" : "bg-white border-zinc-200 text-zinc-900 shadow-3xs"
                        }`}>
                          <div className="whitespace-pre-line pr-4 select-text min-h-[60px] leading-relaxed">
                            <TypewriterText text={composedMessage} />
                          </div>
                          <div className="flex justify-end mt-4">
                            <button
                              onClick={() => handleCopy(composedMessage, "compose")}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                                composeCopied 
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-3xs"
                              }`}
                            >
                              {composeCopied ? (
                                <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Copied</span>
                              ) : (
                                <span className="flex items-center gap-1"><Copy className="h-3.5 w-3.5" /> Copy Message</span>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Compliance notes */}
                        <div className={`p-3.5 rounded-xl border flex flex-col gap-1 select-none text-[11px] leading-relaxed ${
                          isDark ? "bg-zinc-900/10 border-zinc-800/40 text-zinc-400" : "bg-white border-zinc-300 text-zinc-750 shadow-3xs"
                        }`}>
                          <span className="font-extrabold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
                            <HelpCircle className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> Compliance Safeguards
                          </span>
                          <p className="text-[10px] leading-normal font-semibold text-zinc-750 dark:text-zinc-350">
                            Our AI writer replaces off-platform phrases with standard Fiverr placeholders (e.g., <code className="bg-zinc-500/10 px-1 rounded">[Fiverr Native Scheduler]</code>). Confirm these details before hitting send!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-500 mb-3 animate-float">
                          <Sparkles className="h-5 w-5 stroke-[1.8]" />
                        </div>
                        <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 font-display">
                          Composer Draft Idle
                        </h4>
                        <p className="text-[10.5px] text-zinc-700 dark:text-zinc-300 mt-1 max-w-[220px] leading-relaxed font-semibold">
                          Compose rough client thoughts or tap one of our pre-arranged Quick Presets on the left column to formulate a safe Fiverr script.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "rules" && (
                  <motion.div
                    key="side-rules"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between gap-5 select-text"
                  >
                    {selectedRule ? (
                      <div className="space-y-4">
                        {/* Selected Rule Header */}
                        <div className="border-b border-zinc-200/10 dark:border-white/5 pb-3">
                          <span className="text-[8px] font-mono font-bold uppercase text-indigo-500 tracking-wider">Policy Details Browser</span>
                          <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 font-display mt-0.5 line-clamp-1">
                            {selectedRule.phrase.replace(/\s?\(Case\s?#\d+\)/gi, "")}
                          </h3>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1 select-none">
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 border border-zinc-500/10">
                            {selectedRule.category}
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${
                            selectedRule.severity === "Critical Risk"
                              ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                              : selectedRule.severity === "High Risk"
                              ? "bg-red-500/10 text-red-500 border-red-500/20"
                              : selectedRule.severity === "Medium Risk"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          }`}>
                            {selectedRule.severity}
                          </span>
                        </div>

                        {/* Risk Meter */}
                        <div className={`p-2.5 rounded-xl border select-none ${
                          isDark ? "bg-zinc-500/5 border-zinc-500/10" : "bg-white/85 border-zinc-200 shadow-3xs"
                        }`}>
                          <div className="flex justify-between items-center mb-1 text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
                            <span>RISK INDEX RATING</span>
                            <span className="text-zinc-900 dark:text-zinc-100">{selectedRule.riskScore}/100</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${selectedRule.riskScore}%` }}
                              className={`h-full transition-all duration-500 ${
                                selectedRule.riskScore > 80
                                  ? "bg-rose-500"
                                  : selectedRule.riskScore > 50
                                  ? "bg-amber-500"
                                  : "bg-blue-500"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Explanation */}
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase select-none">Policy Background</span>
                          <p className="text-[10.5px] leading-relaxed text-zinc-700 dark:text-zinc-400 font-semibold">
                            {selectedRule.explanation}
                          </p>
                        </div>

                        {/* Rewrite Suggestion */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-500 uppercase select-none font-sans">Compliant Alternative</span>
                          <div className={`p-3 rounded-xl border text-[10.5px] font-bold leading-relaxed relative ${
                            isDark ? "bg-zinc-950/60 border-zinc-800 text-emerald-400" : "bg-emerald-50/80 border-emerald-200 text-emerald-900 shadow-3xs"
                          }`}>
                            <p className="pr-7">{selectedRule.rewrite}</p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedRule.rewrite);
                                setInspectCopied(true);
                                setTimeout(() => setInspectCopied(false), 2000);
                              }}
                              className="absolute right-2 top-2 p-1 rounded hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 cursor-pointer"
                              title="Copy safe alternative"
                            >
                              {inspectCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-zinc-200/10 dark:border-white/5 flex gap-2 select-none">
                          <button
                            onClick={() => handleTestRuleInInspector(selectedRule)}
                            className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                          >
                            <Shield className="h-3.5 w-3.5" />
                            Run In Inspector
                          </button>
                          <button
                            onClick={() => setSelectedRule(null)}
                            className={`px-3 py-2 rounded-lg border font-bold text-xs transition duration-150 cursor-pointer ${
                              isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800" : "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50"
                            }`}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Rules summary statistics */
                      <div className="space-y-4">
                        <div className="border-b border-zinc-200/10 dark:border-white/5 pb-3">
                          <span className="text-[9px] font-mono font-bold uppercase text-indigo-700 dark:text-indigo-400 tracking-wider">DATABASE INTEL SUMMARY</span>
                          <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 font-display mt-0.5">
                            ToS Engine Directory
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center select-none">
                          <div className={`p-2.5 rounded-xl border ${
                            isDark ? "bg-zinc-950/30 border-zinc-800/40" : "bg-white border-zinc-300 text-zinc-900 shadow-3xs"
                          }`}>
                            <span className="text-[10px] text-zinc-750 dark:text-zinc-300 font-bold block">Indexed Rules</span>
                            <span className="text-base font-black text-indigo-600 font-display block mt-0.5">
                              {fullComplianceDatabase.length}
                            </span>
                          </div>
                          <div className={`p-2.5 rounded-xl border ${
                            isDark ? "bg-zinc-950/30 border-zinc-800/40" : "bg-white border-zinc-300 text-zinc-900 shadow-3xs"
                          }`}>
                            <span className="text-[10px] text-zinc-750 dark:text-zinc-300 font-bold block">TOS Class Channels</span>
                            <span className="text-base font-black text-emerald-600 font-display block mt-0.5">
                              9 Categories
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3 select-none">
                          <span className="text-[9px] font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300 block">Proactive Safety Guides</span>

                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5">
                            <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-extrabold block mb-0.5 text-zinc-900 dark:text-zinc-100 text-[11px]">Rule Analysis Lookup</span>
                              <p className="text-[10px] leading-relaxed opacity-90 font-semibold">
                                Click on any policy rule in the directory browser list to review the strictness index, detection rationale, and safe alternatives.
                              </p>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5">
                            <ShieldAlert className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-extrabold block mb-0.5 text-zinc-900 dark:text-zinc-100 text-[11px]">Direct Evasion Controls</span>
                              <p className="text-[10px] leading-relaxed opacity-90 font-semibold">
                                Bypassing commissions, exchanging WhatsApp numbers, or forcing 5-star ratings will cause automatic order demotions or instant gig bans.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Minimal Status Bar footer */}
              <div className="pt-3 border-t border-zinc-200/10 dark:border-white/5 flex flex-col gap-0.5 font-mono text-[9px] text-zinc-500/80 dark:text-zinc-400/80 select-none">
                <span className="flex items-center gap-1">
                  <Terminal className="h-3 w-3 text-indigo-500" />
                  PERSISTENT_CHANNEL: SECURE
                </span>
                <span>SYSTEMS_LOAD: BALANCED • TOS_SHIELD: 100%</span>
              </div>

            </div>

          </div>

        </div>

        {/* Minimal Bottom Brand Credits */}
        <p className="text-[9px] font-mono text-zinc-500/80 dark:text-zinc-400/80 mt-5 select-none uppercase tracking-widest text-center">
          Crafted for Freelance Care • Glassmorphism Design • Antigravity 2026
        </p>

      </div>
    </div>
  );
}
