import { useState, useEffect, useRef } from "react";
import {
  Shield,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Flame,
  FileText,
  ArrowRight,
  Terminal,
  Network,
  ShieldCheck,
  Search,
  Filter,
  X,
  ShieldAlert,
  Info,
  Activity,
  Globe,
  Eye,
  Trash2,
  CreditCard,
  Video,
  Star,
  Share2,
  Cpu,
  Undo2,
  Redo2,
  BrainCircuit,
  Loader2,
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

function TypewriterText({
  text,
  speedMs = 12,
  onComplete,
}: TypewriterTextProps) {
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
      const calculatedSpeed = Math.max(
        3,
        Math.min(speedMs, Math.floor(1200 / text.length)),
      );
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

interface AnimatedCounterProps {
  value: number;
  duration?: number;
}

function AnimatedCounter({ value, duration = 1200 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const startTime = performance.now();
    let animationFrameId: number;

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function - easeOutQuad
      const easeProgress = progress * (2 - progress);
      const current = Math.round(start + easeProgress * (end - start));

      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return <>{count}</>;
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
          matchedText: match[0],
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
          matchedText: text.substring(index, index + phrase.length),
        });
        index = text.toLowerCase().indexOf(phrase.toLowerCase(), index + 1);
      }
    }
  }

  ranges.sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start;
    }
    return b.end - b.start - (a.end - a.start);
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
        isMatch: false,
      });
    }
    segments.push({
      text: text.substring(r.start, r.end),
      isMatch: true,
      rule: r.rule,
    });
    currentIndex = r.end;
  }

  if (currentIndex < text.length) {
    segments.push({
      text: text.substring(currentIndex),
      isMatch: false,
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
      const cleanPhrase = rule.phrase
        .replace(/\s?\(Case\s?#\d+\)/gi, "")
        .toLowerCase();
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

  // Highlight and correct messages locally
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
      trustworthiness,
    },
    matchedRules,
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
    greeting =
      "Hello! I looked over your project details, and I'm highly confident we can achieve outstanding results together.";
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
    dangerWords: [
      "PayPal",
      "CashApp",
      "Direct Invoice",
      "Bank transfer",
      "Crypto",
      "BTC",
    ],
    alternatives: [
      {
        label: "Secure Milestone Offer",
        original:
          "Send me payment on PayPal so we avoid the 20% commission fee.",
        safe: "I will set up structured, secure payment milestones directly here on Fiverr for this project.",
      },
      {
        label: "Fiverr Escrow Checkout",
        original: "Pay me half directly via bank transfer first, then I start.",
        safe: "I have prepared a secure custom order proposal on Fiverr. You can confirm it to safely fund the escrow.",
      },
    ],
    strategy:
      "Keep all financial discussion tied to custom offers. Escrow funding guarantees you are paid upon successful completion of your deliveries.",
  },
  meeting: {
    title: "Meetings & Calls",
    badge: "Off-Platform Calls",
    textColor: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/25",
    text: "Exchanging Skype usernames, WhatsApp numbers, or personal Discord tags before an order is placed triggers immediate automated Fiverr filter warnings.",
    dangerWords: [
      "Skype username",
      "WhatsApp number",
      "Add my Discord",
      "Personal phone number",
      "Google Meet link",
    ],
    alternatives: [
      {
        label: "Native Video Call",
        original: "Let's talk on Skype or WhatsApp to details requirements.",
        safe: "Let's schedule an official Fiverr video consultation right here in our inbox to clarify project requirements.",
      },
      {
        label: "Audio Handoff Notes",
        original: "Give me your phone number so we can have a quick call.",
        safe: "We can securely use Fiverr's built-in voice call scheduler inside our order thread once the order is active.",
      },
    ],
    strategy:
      "Pre-order external links are strictly forbidden. Did you know Fiverr provides built-in high-quality video call schedulers directly inside client chat?",
  },
  review: {
    title: "Ratings & Anti-Coercion",
    badge: "Review Manipulation",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/25",
    text: "Demanding 5-star feedback, offering discounts in exchange for positive reviews, or withholding delivery source files violates feedback integrity rules.",
    dangerWords: [
      "give 5 stars",
      "positive review for discount",
      "change rating to refund",
      "5-star rating hold",
    ],
    alternatives: [
      {
        label: "Neutral Evaluation",
        original:
          "Please write a 5-star rating for me so my gig stays ranked high.",
        safe: "I have delivered the final project files. Your honest feedback on this order is highly appreciated!",
      },
      {
        label: "Neutral Review Reminder",
        original:
          "I will send the source assets after you leave me a good review.",
        safe: "Once you have reviewed the deliverables, you are welcome to leave your honest comments and rating on the order page.",
      },
    ],
    strategy:
      "Fiverr's AI filter flags combinations of 'review', 'rating', '5 stars', and 'positive'. Always ask for satisfaction and honest feedback, never ratings.",
  },
  assets: {
    title: "File Sharing & Portfolios",
    badge: "External Links",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/25",
    text: "Sharing personal portfolio websites containing direct emails, or unauthorized external file-transfer tools (WeTransfer links, etc.) can flag your messages.",
    dangerWords: [
      "WeTransfer link",
      "My Instagram link",
      "Personal portfolio email",
      "Direct website link",
    ],
    alternatives: [
      {
        label: "Approved Repositories",
        original:
          "Check my personal website portfolio to see all my past work.",
        safe: "You can view samples of my previous projects directly on my official Fiverr gig portfolio page.",
      },
      {
        label: "Fiverr Large Attachments",
        original: "Send the project files to my email address or WeTransfer.",
        safe: "I have attached the source assets directly to this Fiverr message thread for your review.",
      },
    ],
    strategy:
      "Fiverr supports file uploads of up to 5GB directly in chat. Approved third-party domains include Google Drive, GitHub, Loom, YouTube, and Flickr.",
  },
};

export default function App() {
  // Theme state (system-level light/dark)
  const [isDark, setIsDark] = useState(false);

  // Tab-state
  const [activeTab, setActiveTab] = useState<
    "inspector" | "composer" | "rules"
  >("inspector");

  // Connection status state
  const [apiStatus, setApiStatus] = useState({
    ready: false,
    hasApiKey: false,
    message: "Verifying connection...",
  });

  // 1. ToS Inspector states
  const [inspectText, setInspectText] = useState("");
  const mainTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [isInspecting, setIsInspecting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SafetyAnalysis | null>(
    null,
  );
  const [inspectCopied, setInspectCopied] = useState(false);
  const [inspectorViewMode, setInspectorViewMode] = useState<
    "edit" | "highlight" | "heatmap"
  >("edit");
  const [activeHeatmapIdx, setActiveHeatmapIdx] = useState<number | null>(null);
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState<number | null>(
    null,
  );
  const [fixStrategy, setFixStrategy] = useState<
    "safe" | "compound" | "dotted" | "hyphenated" | "spaced"
  >("safe");
  const [sandboxFilterStrength, setSandboxFilterStrength] = useState<
    "standard" | "heuristic" | "extreme"
  >("heuristic");
  const [sandboxPreviewMode, setSandboxPreviewMode] = useState<
    "original" | "corrected"
  >("corrected");
  const [sidebarView, setSidebarView] = useState<"insights" | "playbook">(
    "insights",
  );
  const [playbookTopic, setPlaybookTopic] = useState<
    "payment" | "meeting" | "review" | "assets"
  >("payment");
  const [copiedTemplateIdx, setCopiedTemplateIdx] = useState<string | null>(
    null,
  );
  const [activeShields, setActiveShields] = useState<Record<string, boolean>>({
    offPlatform: true,
    paymentCircumvention: true,
    reviewCoercion: true,
    academicCheating: true,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Ctrl+Enter to run the compliance inspector
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (inspectText.trim()) {
          e.preventDefault();
          handleInspect();
          setToastMessage("⚡ Safety Audit Initiated");
        }
      }

      // 2. Ctrl+I to focus the inspector input area
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setActiveTab("inspector");
        setInspectorViewMode("edit");
        setTimeout(() => {
          mainTextareaRef.current?.focus();
        }, 50);
        setToastMessage("⌨️ Focused Editor Input");
      }

      // 3. Tab to cycle through the primary tabs
      if (e.key === "Tab") {
        e.preventDefault();
        const tabs: ("inspector" | "composer" | "rules")[] = [
          "inspector",
          "composer",
          "rules",
        ];
        const currentIndex = tabs.indexOf(activeTab);
        const nextIndex = e.shiftKey
          ? (currentIndex - 1 + tabs.length) % tabs.length
          : (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [inspectText, activeTab, inspectorViewMode]);

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
      thoughts:
        "Tell client I will divide the project into two milestones. First is basic outline for $150, second is detailed coding for $200. Reassure them it is safe.",
      tone: "Confident",
    },
    {
      title: "Safe Call Invite",
      description: "Arrange a Fiverr Zoom/Call safely.",
      thoughts:
        "Invite client to a live call using the official Fiverr video appointment scheduler to review the dashboard. Remind them no outside skype.",
      tone: "Professional",
    },
    {
      title: "Polite Revision Response",
      description: "De-escalate scope creep gracefully.",
      thoughts:
        "Client wants extra features not in scope. I will fix the basic bugs for free today, but tell them we can add pages as a separate custom offer.",
      tone: "Friendly",
    },
    {
      title: "Order Delivery Handoff",
      description: "Deliver source files with clear notes.",
      thoughts:
        "All files compiled and attached. Direct them to download zip, open preview. Say I am ready for small revisions if needed.",
      tone: "Professional",
    },
  ];

  // Fetch API status on mount
  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        setApiStatus({
          ready: true,
          hasApiKey: data.hasApiKey,
          message: data.message,
        });
      })
      .catch(() => {
        setApiStatus({
          ready: true,
          hasApiKey: false,
          message: "Operating in high-speed Sandbox Intelligence Mode.",
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
    const textToAnalyze =
      overrideText !== undefined ? overrideText : inspectText;
    if (!textToAnalyze.trim()) return;
    setIsInspecting(true);
    setAnalysisResult(null);
    setSelectedSegmentIdx(null);

    try {
      const response = await fetch("/api/analyze-safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToAnalyze }),
      });
      const contentType = response.headers.get("content-type");
      if (
        !response.ok ||
        !contentType ||
        !contentType.includes("application/json")
      ) {
        throw new Error("Invalid response or not JSON");
      }
      const data = await response.json();
      setAnalysisResult(data);
      if (
        data &&
        (data.dangerousContent?.length > 0 || data.potentialIssues?.length > 0)
      ) {
        setInspectorViewMode("highlight");
      } else {
        setInspectorViewMode("edit");
      }
    } catch (err) {
      console.warn(
        "Fiverr live analysis backend unavailable or failed. Using high-speed Sandbox Intelligence Fallback:",
        err,
      );
      const localData = runLocalAnalysis(textToAnalyze);
      setAnalysisResult(localData);
      if (
        localData &&
        (localData.dangerousContent?.length > 0 ||
          localData.potentialIssues?.length > 0)
      ) {
        setInspectorViewMode("highlight");
      } else {
        setInspectorViewMode("edit");
      }
    } finally {
      setIsInspecting(false);
    }
  };

  // Push to undo stack
  const pushToUndoStack = (text: string) => {
    setUndoStack((prev) => [...prev, text]);
    setRedoStack([]); // Clear redo stack on new action
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousText = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, inspectText]);
    setInspectText(previousText);
    handleInspect(previousText);
    setToastMessage("↩️ Reverted Auto-Fix Change");
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextText = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, inspectText]);
    setInspectText(nextText);
    handleInspect(nextText);
    setToastMessage("↪️ Redid Auto-Fix Change");
  };

  // Auto-fix a single clicked segment in the draft
  const fixSingleSegment = (idx: number, customReplacement?: string) => {
    if (!analysisResult) return;
    const segments = getSegments(
      inspectText,
      analysisResult.matchedRules || [],
    );
    const newSegments = segments.map((seg, sIdx) => {
      if (sIdx === idx && seg.rule) {
        return customReplacement !== undefined
          ? customReplacement
          : seg.rule.rewrite;
      }
      return seg.text;
    });
    const newText = newSegments.join("");
    pushToUndoStack(inspectText);
    setInspectText(newText);
    handleInspect(newText);
    setSelectedSegmentIdx(null);
  };

  // Auto-fix all segments in the draft
  const fixAllSegments = () => {
    if (!analysisResult) return;
    const segments = getSegments(
      inspectText,
      analysisResult.matchedRules || [],
    );
    const newText = segments
      .map((seg) => {
        if (seg.isMatch && seg.rule) {
          if (fixStrategy === "safe") return seg.rule.rewrite;
          const forms = getDisguisedForms(seg.text);
          if (fixStrategy === "compound")
            return forms[0]?.value || seg.rule.rewrite;
          if (fixStrategy === "dotted")
            return forms[1]?.value || seg.rule.rewrite;
          if (fixStrategy === "hyphenated")
            return forms[2]?.value || seg.rule.rewrite;
          if (fixStrategy === "spaced")
            return forms[3]?.value || seg.rule.rewrite;
        }
        return seg.text;
      })
      .join("");
    pushToUndoStack(inspectText);
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
      testMsg =
        "Please send the payment directly through PayPal to avoid Fiverr fees.";
    } else if (
      phraseLower.includes("fees") ||
      phraseLower.includes("bypass") ||
      phraseLower.includes("outside")
    ) {
      testMsg = "Let's work outside Fiverr so we can avoid platform fees.";
    } else if (phraseLower.includes("email")) {
      testMsg = "My email address is developer@example.com. Contact me there.";
    } else if (
      phraseLower.includes("homework") ||
      phraseLower.includes("exam")
    ) {
      testMsg =
        "Can you please do my university computer science homework and exam?";
    } else if (
      phraseLower.includes("star") ||
      phraseLower.includes("feedback") ||
      phraseLower.includes("review")
    ) {
      testMsg =
        "I will give you a refund if you write a positive 5 star review.";
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

    pushToUndoStack(inspectText);
    setInspectText(testMsg);
    setActiveTab("inspector");
    handleInspect(testMsg);
  };

  // Handle AI Composition
  const handleCompose = async (
    customThoughts?: string,
    customTone?: string,
  ) => {
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
          tone: customTone || selectedTone,
        }),
      });
      const contentType = response.headers.get("content-type");
      if (
        !response.ok ||
        !contentType ||
        !contentType.includes("application/json")
      ) {
        throw new Error("Invalid response or not JSON");
      }
      const data = await response.json();
      setComposedMessage(data.generatedMessage);
      setActiveTab("composer");
    } catch (err) {
      console.warn(
        "Fiverr live composition backend unavailable or failed. Using local Sandbox Composer Fallback:",
        err,
      );
      const localMessage = runLocalCompose(
        thoughtsToUse,
        customTone || selectedTone,
      );
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
    <div
      className={`h-screen max-h-screen w-screen max-w-full overflow-hidden transition-colors duration-500 font-sans relative p-3 md:p-6 flex flex-col items-center justify-center ${
        isDark
          ? "bg-gradient-to-tr from-[#0F1015] via-[#161720] to-[#1D142A] text-zinc-100"
          : "bg-gradient-to-tr from-[#E1E4F5] via-[#F4F5FA] to-[#FFEBE9] text-zinc-800"
      }`}
    >
      {/* Minimal Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`
            : `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)",
        }}
      />

      {/* Dynamic Animated Ambient Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className={`absolute top-[10%] left-[-15%] w-[650px] h-[650px] rounded-full blur-[160px] transition-colors duration-1000 ${
            isDark ? "bg-indigo-500/8" : "bg-indigo-400/12"
          } animate-float`}
          style={{ animationDuration: "12s" }}
        />
        <div
          className={`absolute bottom-[10%] right-[-15%] w-[550px] h-[550px] rounded-full blur-[140px] transition-colors duration-1000 ${
            isDark ? "bg-violet-600/6" : "bg-rose-400/10"
          } animate-float`}
          style={{ animationDuration: "15s", animationDelay: "2s" }}
        />
        <div
          className={`absolute top-[40%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] transition-colors duration-1000 ${
            isDark ? "bg-teal-500/4" : "bg-cyan-300/8"
          } animate-float`}
          style={{ animationDuration: "10s", animationDelay: "4s" }}
        />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl flex-1 min-h-0 z-10 relative flex flex-col items-center justify-between py-1 overflow-hidden">
        {/* Primary macOS Glass Window */}
        <div
          id="mac-window-root"
          className={`w-full flex-1 min-h-0 rounded-[24px] transition-all duration-500 relative flex flex-col overflow-hidden ${
            isDark ? "glass-panel-dark" : "glass-panel-light"
          }`}
        >
          {/* macOS window title bar */}
          <div
            className={`px-4 sm:px-5 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 border-b select-none ${
              isDark
                ? "border-zinc-800/40 bg-zinc-950/20"
                : "border-white/40 bg-white/20"
            }`}
          >
            {/* Top-left traffic lights and window metadata */}
            <div className="flex items-center justify-between w-full md:w-auto gap-4">
              <div className="flex items-center gap-2 group/dots">
                <div className="h-3 w-3 rounded-full bg-[#FF5F56] flex items-center justify-center text-[8px] text-red-950/70 font-black cursor-pointer relative shadow-inner">
                  <span className="opacity-0 group-hover/dots:opacity-100 transition-opacity duration-150 absolute">
                    ×
                  </span>
                </div>
                <div className="h-3 w-3 rounded-full bg-[#FFBD2E] flex items-center justify-center text-[8px] text-amber-950/70 font-black cursor-pointer relative shadow-inner">
                  <span className="opacity-0 group-hover/dots:opacity-100 transition-opacity duration-150 absolute">
                    -
                  </span>
                </div>
                <div className="h-3 w-3 rounded-full bg-[#27C93F] flex items-center justify-center text-[8px] text-green-950/70 font-black cursor-pointer relative shadow-inner">
                  <span className="opacity-0 group-hover/dots:opacity-100 transition-opacity duration-150 absolute">
                    +
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 ml-2">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0 relative overflow-hidden">
                  <Shield className="h-3.5 w-3.5 stroke-[2.2] relative z-10" />
                  {/* Dynamic continuous glass shine effect */}
                  <span className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer-shine pointer-events-none" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 font-display">
                      Fiverr Lens
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                      v2.0
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* macOS Centered Tab Segmented Control */}
            <div
              title="Cycle tabs using Tab key"
              className={`flex items-center p-1 rounded-xl border max-w-full overflow-x-auto no-scrollbar shrink-0 select-none gap-1 bg-zinc-200/25 dark:bg-zinc-950/45 backdrop-blur-md border-zinc-300/30 dark:border-zinc-800/50`}
            >
              <button
                onClick={() => setActiveTab("inspector")}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-bold tracking-tight transition-all duration-300 flex items-center gap-1.5 shrink-0 cursor-pointer relative overflow-hidden group ${
                  activeTab === "inspector"
                    ? isDark
                      ? "bg-white/[0.08] text-white shadow-[0_4px_12px_rgba(99,102,241,0.15)] border border-white/10 backdrop-blur-sm"
                      : "bg-white/80 text-indigo-650 shadow-[0_4px_12px_rgba(99,102,241,0.08)] border border-zinc-200/80 backdrop-blur-sm"
                    : isDark
                      ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-500/5"
                }`}
              >
                {/* Dynamic glass glow effect */}
                {activeTab === "inspector" && (
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50 blur-xs" />
                )}
                <Shield
                  className={`h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    activeTab === "inspector"
                      ? "text-indigo-500 animate-pulse"
                      : "text-zinc-450 dark:text-zinc-500"
                  }`}
                />
                <span className="relative z-10 shrink-0">Inspector</span>
                {activeTab === "inspector" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_8px_#6366f1] animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("composer")}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-bold tracking-tight transition-all duration-300 flex items-center gap-1.5 shrink-0 cursor-pointer relative overflow-hidden group ${
                  activeTab === "composer"
                    ? isDark
                      ? "bg-white/[0.08] text-white shadow-[0_4px_12px_rgba(99,102,241,0.15)] border border-white/10 backdrop-blur-sm"
                      : "bg-white/80 text-indigo-650 shadow-[0_4px_12px_rgba(99,102,241,0.08)] border border-zinc-200/80 backdrop-blur-sm"
                    : isDark
                      ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-500/5"
                }`}
              >
                {/* Dynamic glass glow effect */}
                {activeTab === "composer" && (
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50 blur-xs" />
                )}
                <Sparkles
                  className={`h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    activeTab === "composer"
                      ? "text-indigo-500 animate-pulse"
                      : "text-zinc-450 dark:text-zinc-500"
                  }`}
                />
                <span className="relative z-10 shrink-0">AI Writer</span>
                {activeTab === "composer" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_8px_#6366f1] animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("rules")}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-bold tracking-tight transition-all duration-300 flex items-center gap-1.5 shrink-0 cursor-pointer relative overflow-hidden group ${
                  activeTab === "rules"
                    ? isDark
                      ? "bg-white/[0.08] text-white shadow-[0_4px_12px_rgba(99,102,241,0.15)] border border-white/10 backdrop-blur-sm"
                      : "bg-white/80 text-indigo-650 shadow-[0_4px_12px_rgba(99,102,241,0.08)] border border-zinc-200/80 backdrop-blur-sm"
                    : isDark
                      ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-500/5"
                }`}
              >
                {/* Dynamic glass glow effect */}
                {activeTab === "rules" && (
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50 blur-xs" />
                )}
                <BookOpen
                  className={`h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    activeTab === "rules"
                      ? "text-indigo-500 animate-pulse"
                      : "text-zinc-450 dark:text-zinc-500"
                  }`}
                />
                <span className="relative z-10 shrink-0">ToS Rules</span>
                {activeTab === "rules" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_8px_#6366f1] animate-pulse" />
                )}
              </button>
            </div>

            {/* Top-right System status & Theme Switcher */}
            <div className="flex items-center gap-3">
              {/* Dynamic Connection Indicator */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold select-none ${
                  isDark
                    ? "bg-zinc-900/30 border-zinc-800/40"
                    : "bg-zinc-150/50 border-zinc-300 text-zinc-700"
                }`}
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    apiStatus.hasApiKey ? "bg-emerald-500" : "bg-amber-500"
                  } status-active-glow`}
                />
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
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Window Body Split Area */}
          <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-200/20 dark:divide-white/5 min-h-0 overflow-hidden">
            {/* LEFT COMPONENT COLUMN (Forms/Inputs) */}
            <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto min-h-0 hide-scrollbar">
              <AnimatePresence mode="wait">
                {activeTab === "inspector" && (
                  <motion.div
                    key="tab-inspector"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 flex flex-col gap-5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold uppercase text-indigo-650 dark:text-indigo-400 tracking-widest">
                          TOS COMPLIANCE PIPELINE
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-extrabold font-display tracking-tight mt-1 text-zinc-900 dark:text-zinc-100">
                        Safety Inspector
                      </h2>
                      <p className="text-sm text-zinc-650 dark:text-zinc-300 mt-1.5 font-medium leading-relaxed opacity-95">
                        Analyze communication scripts for hidden bypasses,
                        external links, rating manipulations, or off-platform
                        leaks.
                      </p>
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                      {/* Interactive view toggles for draft and risk markings */}
                      <div className="flex items-center justify-between select-none">
                        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-250/25 dark:bg-zinc-950/45 backdrop-blur-md border border-zinc-300/30 dark:border-zinc-800/50">
                          <button
                            type="button"
                            onClick={() => setInspectorViewMode("edit")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tight transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                              inspectorViewMode === "edit"
                                ? isDark
                                  ? "bg-white/[0.08] text-white shadow-[0_4px_12px_rgba(99,102,241,0.15)] border border-white/10 backdrop-blur-sm"
                                  : "bg-white/80 text-indigo-650 shadow-[0_4px_12px_rgba(99,102,241,0.08)] border border-zinc-200/80 backdrop-blur-sm"
                                : isDark
                                  ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]"
                                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-500/5"
                            }`}
                          >
                            📝 Draft Editor
                          </button>
                          <button
                            type="button"
                            disabled={!analysisResult?.highlightedMessage}
                            onClick={() => setInspectorViewMode("highlight")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tight transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 relative overflow-hidden group ${
                              inspectorViewMode === "highlight"
                                ? isDark
                                  ? "bg-white/[0.08] text-white shadow-[0_4px_12px_rgba(99,102,241,0.15)] border border-white/10 backdrop-blur-sm"
                                  : "bg-white/80 text-indigo-650 shadow-[0_4px_12px_rgba(99,102,241,0.08)] border border-zinc-200/80 backdrop-blur-sm"
                                : isDark
                                  ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]"
                                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-500/5"
                            }`}
                          >
                            🚨 Marked Violations
                            {analysisResult &&
                              (analysisResult.dangerousContent?.length > 0 ||
                                analysisResult.potentialIssues?.length > 0) && (
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shrink-0 shadow-[0_0_8px_#f43f5e]" />
                              )}
                          </button>
                          <button
                            type="button"
                            disabled={!analysisResult}
                            onClick={() => setInspectorViewMode("heatmap")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tight transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 relative overflow-hidden group ${
                              inspectorViewMode === "heatmap"
                                ? isDark
                                  ? "bg-amber-500/10 text-amber-400 shadow-[0_4px_12px_rgba(245,158,11,0.15)] border border-amber-500/20 backdrop-blur-sm"
                                  : "bg-amber-500/10 text-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.08)] border border-amber-500/25 backdrop-blur-sm"
                                : isDark
                                  ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]"
                                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-500/5"
                            }`}
                          >
                            🔥 Risk Heatmap
                            {analysisResult &&
                              (analysisResult.matchedRules?.length || 0) >
                                0 && (
                                <span className="bg-amber-500 text-white dark:text-zinc-950 text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none min-w-[12px] text-center shadow-xs">
                                  {analysisResult.matchedRules.length}
                                </span>
                              )}
                          </button>
                        </div>

                        {analysisResult && (
                          <div className="flex items-center gap-1.5 select-none">
                            <span
                              className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-md border ${
                                analysisResult.safetyScore > 80
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
                                  : analysisResult.safetyScore > 50
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10"
                                    : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/10"
                              }`}
                            >
                              Safety Score:{" "}
                              <AnimatedCounter
                                value={analysisResult.safetyScore}
                              />
                              %
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="relative flex-1 min-h-[250px] md:min-h-[320px] w-full flex flex-col">
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
                                <div
                                  className="absolute inset-2 rounded-full border-2 border-t-indigo-400 border-r-transparent border-b-indigo-400 border-l-transparent animate-spin"
                                  style={{ animationDuration: "1.5s" }}
                                />

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
                                  Decrypting bypasses, semantic leaks, and
                                  off-platform channels...
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {inspectorViewMode === "edit" ? (
                          <textarea
                            ref={mainTextareaRef}
                            value={inspectText}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInspectText(val);
                              if (!val) {
                                setAnalysisResult(null);
                              } else if (analysisResult) {
                                setAnalysisResult(runLocalAnalysis(val));
                              }
                            }}
                            onKeyDown={(e) => {
                              if ((e.ctrlKey || e.metaKey) && e.key === "z") {
                                e.preventDefault();
                                handleUndo();
                              }
                              if (
                                (e.ctrlKey || e.metaKey) &&
                                (e.key === "y" || (e.shiftKey && e.key === "z"))
                              ) {
                                e.preventDefault();
                                handleRedo();
                              }
                            }}
                            placeholder="Paste your drafted response or pitch here..."
                            className={`w-full h-full p-4 text-[13px] md:text-sm font-semibold leading-relaxed outline-none rounded-2xl transition-all resize-none shadow-inner hide-scrollbar ${
                              isDark
                                ? "bg-zinc-950/50 border border-zinc-800/60 focus:border-indigo-500/80 text-zinc-200 placeholder-zinc-500 focus:ring-4 focus:ring-indigo-500/10"
                                : "bg-white border border-zinc-300 focus:border-indigo-600 text-zinc-900 placeholder-zinc-600 focus:ring-4 focus:ring-indigo-500/10"
                            }`}
                          />
                        ) : inspectorViewMode === "highlight" ? (
                          <div
                            className={`w-full h-full p-5 text-[13px] md:text-sm font-semibold leading-relaxed outline-none rounded-2xl transition-all overflow-y-auto hide-scrollbar border-l-4 shadow-inner select-text ${
                              analysisResult?.riskLevel === "Safe"
                                ? "border-emerald-500"
                                : analysisResult?.riskLevel === "Warning"
                                  ? "border-amber-500"
                                  : "border-rose-500"
                            } ${
                              isDark
                                ? "bg-zinc-950/50 border-r border-y border-zinc-800/60 text-zinc-200"
                                : "bg-white border-r border-y border-zinc-300 text-zinc-900"
                            }`}
                          >
                            {analysisResult ? (
                              <div className="whitespace-pre-wrap leading-relaxed text-zinc-850 dark:text-zinc-200 font-sans tracking-wide">
                                {(() => {
                                  const segments = getSegments(
                                    inspectText,
                                    analysisResult.matchedRules || [],
                                  );
                                  return segments.map((seg, idx) => {
                                    if (!seg.isMatch) {
                                      return (
                                        <span
                                          key={idx}
                                          className="whitespace-pre-wrap"
                                        >
                                          {seg.text}
                                        </span>
                                      );
                                    }
                                    const isSelected =
                                      selectedSegmentIdx === idx;
                                    let severityStyle = "";
                                    if (
                                      seg.rule?.severity === "Critical Risk"
                                    ) {
                                      severityStyle = isSelected
                                        ? "bg-red-600 text-white dark:bg-red-500 dark:text-zinc-950 ring-2 ring-red-500 font-black px-2 py-0.5 rounded shadow-md scale-105"
                                        : "bg-red-500/10 text-red-600 dark:text-red-400 border-2 border-red-500 font-black px-2 py-0.5 rounded hover:bg-red-500/20 animate-pulse";
                                    } else if (
                                      seg.rule?.severity === "High Risk"
                                    ) {
                                      severityStyle = isSelected
                                        ? "bg-rose-600 text-white dark:bg-rose-500 dark:text-zinc-950 ring-2 ring-rose-500 font-black px-2 py-0.5 rounded shadow-md scale-105"
                                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500 font-black px-2 py-0.5 rounded hover:bg-rose-500/20";
                                    } else if (
                                      seg.rule?.severity === "Medium Risk"
                                    ) {
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
                                        onClick={() =>
                                          setSelectedSegmentIdx(
                                            isSelected ? null : idx,
                                          )
                                        }
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
                              <span className="text-zinc-500 italic">
                                No violations analyzed yet.
                              </span>
                            )}
                          </div>
                        ) : (
                          <div
                            className={`w-full h-full p-5 text-[13px] md:text-sm font-semibold leading-relaxed outline-none rounded-2xl transition-all overflow-y-auto hide-scrollbar border-l-4 shadow-inner select-text ${
                              analysisResult?.riskLevel === "Safe"
                                ? "border-emerald-500"
                                : analysisResult?.riskLevel === "Warning"
                                  ? "border-amber-500"
                                  : "border-rose-500"
                            } ${
                              isDark
                                ? "bg-zinc-950/50 border-r border-y border-zinc-800/60 text-zinc-200"
                                : "bg-white border-r border-y border-zinc-300 text-zinc-900"
                            }`}
                          >
                            {analysisResult ? (
                              <div className="space-y-5">
                                {(() => {
                                  const sentences = inspectText.match(
                                    /[^.!?\n]+[.!?\n]*(\s+|$)/g,
                                  ) || [inspectText];
                                  const heatmapItems = sentences
                                    .filter((s) => s.trim().length > 0)
                                    .map((sentence, index) => {
                                      const sentenceSegments = getSegments(
                                        sentence,
                                        analysisResult.matchedRules || [],
                                      );
                                      const sentenceMatches =
                                        sentenceSegments.filter(
                                          (seg) => seg.isMatch && seg.rule,
                                        );
                                      let crit = 0,
                                        high = 0,
                                        med = 0,
                                        low = 0,
                                        score = 0;
                                      sentenceMatches.forEach((m) => {
                                        if (
                                          m.rule?.severity === "Critical Risk"
                                        ) {
                                          crit++;
                                          score += 25;
                                        } else if (
                                          m.rule?.severity === "High Risk"
                                        ) {
                                          high++;
                                          score += 15;
                                        } else if (
                                          m.rule?.severity === "Medium Risk"
                                        ) {
                                          med++;
                                          score += 8;
                                        } else if (
                                          m.rule?.severity === "Low Risk"
                                        ) {
                                          low++;
                                          score += 3;
                                        }
                                      });

                                      let colorClass =
                                        "bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/15 text-emerald-850 dark:text-emerald-300";
                                      let badgeColor =
                                        "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400";
                                      let maxSeverityLabel = "Safe";

                                      if (crit > 0) {
                                        colorClass =
                                          "bg-red-500/10 hover:bg-red-500/15 border-red-500/25 text-red-950 dark:text-red-200";
                                        badgeColor =
                                          "bg-red-500/20 text-red-600 dark:text-red-400";
                                        maxSeverityLabel = "Critical Risk";
                                      } else if (high > 0) {
                                        colorClass =
                                          "bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/25 text-rose-950 dark:text-rose-200";
                                        badgeColor =
                                          "bg-rose-500/20 text-rose-600 dark:text-rose-450";
                                        maxSeverityLabel = "High Risk";
                                      } else if (med > 0) {
                                        colorClass =
                                          "bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/25 text-amber-950 dark:text-amber-200";
                                        badgeColor =
                                          "bg-amber-500/20 text-amber-600 dark:text-amber-450";
                                        maxSeverityLabel = "Medium Risk";
                                      } else if (low > 0) {
                                        colorClass =
                                          "bg-blue-500/10 hover:bg-blue-500/15 border-blue-500/20 text-blue-950 dark:text-blue-200";
                                        badgeColor =
                                          "bg-blue-500/20 text-blue-600 dark:text-blue-400";
                                        maxSeverityLabel = "Low Risk";
                                      }

                                      return {
                                        index,
                                        text: sentence,
                                        matches: sentenceMatches,
                                        crit,
                                        high,
                                        med,
                                        low,
                                        score,
                                        colorClass,
                                        badgeColor,
                                        maxSeverityLabel,
                                      };
                                    });

                                  const totalCrit = heatmapItems.reduce(
                                    (acc, curr) => acc + curr.crit,
                                    0,
                                  );
                                  const totalHigh = heatmapItems.reduce(
                                    (acc, curr) => acc + curr.high,
                                    0,
                                  );
                                  const totalMed = heatmapItems.reduce(
                                    (acc, curr) => acc + curr.med,
                                    0,
                                  );
                                  const totalLow = heatmapItems.reduce(
                                    (acc, curr) => acc + curr.low,
                                    0,
                                  );

                                  let thermalStatus = "Cool & Compliant 🧊";
                                  let thermalStatusColor =
                                    "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/15";
                                  if (totalCrit > 0 || totalHigh > 1) {
                                    thermalStatus =
                                      "SEVERE THERMAL ESCALATION 🔥🔥🔥";
                                    thermalStatusColor =
                                      "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/15 animate-pulse";
                                  } else if (totalHigh > 0 || totalMed > 1) {
                                    thermalStatus =
                                      "RISKY - ELEVATED THERMAL RATING ☀️";
                                    thermalStatusColor =
                                      "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/15";
                                  } else if (totalMed > 0 || totalLow > 1) {
                                    thermalStatus = "WARM SIGNS DETECTED ⛅";
                                    thermalStatusColor =
                                      "text-amber-600 dark:text-amber-450 bg-amber-500/10 border-amber-500/15";
                                  }

                                  return (
                                    <div className="space-y-4">
                                      {/* Thermal status bar */}
                                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-500/5 p-3 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
                                        <div className="space-y-0.5">
                                          <span className="text-[9px] font-mono font-black text-zinc-450 dark:text-zinc-500 block uppercase tracking-wider">
                                            THERMAL INDEX STATUS
                                          </span>
                                          <span
                                            className={`text-[11px] font-black px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${thermalStatusColor}`}
                                          >
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
                                          <span>
                                            📍 CHRONOLOGICAL RISKS HEATMAP STRIP
                                          </span>
                                          <span>
                                            {heatmapItems.length} Sentence{" "}
                                            {heatmapItems.length === 1
                                              ? "Block"
                                              : "Blocks"}
                                          </span>
                                        </div>
                                        <div className="flex h-5 w-full gap-1 rounded-md overflow-hidden bg-zinc-500/5 p-0.5 border border-zinc-200/40 dark:border-zinc-800/40">
                                          {heatmapItems.map((item, idx) => {
                                            const isActive =
                                              activeHeatmapIdx === idx;
                                            let color =
                                              "bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-400";
                                            if (item.crit > 0)
                                              color =
                                                "bg-red-500 dark:bg-red-600 hover:bg-red-400";
                                            else if (item.high > 0)
                                              color =
                                                "bg-rose-500 dark:bg-rose-600 hover:bg-rose-400";
                                            else if (item.med > 0)
                                              color =
                                                "bg-amber-500 dark:bg-amber-600 hover:bg-amber-400";
                                            else if (item.low > 0)
                                              color =
                                                "bg-blue-500 dark:bg-blue-600 hover:bg-blue-400";

                                            return (
                                              <button
                                                key={idx}
                                                type="button"
                                                onClick={() =>
                                                  setActiveHeatmapIdx(
                                                    isActive ? null : idx,
                                                  )
                                                }
                                                className={`flex-1 h-full rounded-[3px] transition-all cursor-pointer relative ${color} ${
                                                  isActive
                                                    ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-900 scale-y-110"
                                                    : "opacity-85 hover:opacity-100"
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
                                          const isSelected =
                                            activeHeatmapIdx === idx;
                                          return (
                                            <div
                                              key={idx}
                                              onClick={() =>
                                                setActiveHeatmapIdx(
                                                  isSelected ? null : idx,
                                                )
                                              }
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
                                                  {item.maxSeverityLabel !==
                                                  "Safe" ? (
                                                    <span
                                                      className={`text-[8.5px] font-black uppercase px-2 py-0.2 rounded-full ${item.badgeColor}`}
                                                    >
                                                      ⚠️ {item.maxSeverityLabel}{" "}
                                                      (Score: {item.score})
                                                    </span>
                                                  ) : (
                                                    <span
                                                      className={`text-[8.5px] font-black uppercase px-2 py-0.2 rounded-full ${item.badgeColor}`}
                                                    >
                                                      🌿 Safe
                                                    </span>
                                                  )}
                                                </div>
                                                <span className="text-[9px] font-mono font-semibold text-zinc-450 dark:text-zinc-555">
                                                  {getWordCount(item.text)}{" "}
                                                  words
                                                </span>
                                              </div>

                                              <p className="text-[11.5px] font-medium leading-relaxed font-sans tracking-wide">
                                                {(() => {
                                                  const sentenceSegments =
                                                    getSegments(
                                                      item.text,
                                                      analysisResult.matchedRules ||
                                                        [],
                                                    );
                                                  return sentenceSegments.map(
                                                    (seg, sIdx) => {
                                                      if (!seg.isMatch)
                                                        return (
                                                          <span key={sIdx}>
                                                            {seg.text}
                                                          </span>
                                                        );
                                                      return (
                                                        <span
                                                          key={sIdx}
                                                          className={`font-mono text-[10.5px] font-black px-1 py-0.2 mx-0.5 rounded ${
                                                            seg.rule
                                                              ?.severity ===
                                                            "Critical Risk"
                                                              ? "bg-red-500 text-white dark:bg-red-600"
                                                              : seg.rule
                                                                    ?.severity ===
                                                                  "High Risk"
                                                                ? "bg-rose-500 text-white dark:bg-rose-600"
                                                                : seg.rule
                                                                      ?.severity ===
                                                                    "Medium Risk"
                                                                  ? "bg-amber-500 text-zinc-900"
                                                                  : "bg-blue-500 text-white dark:bg-blue-600"
                                                          }`}
                                                        >
                                                          {seg.text}
                                                        </span>
                                                      );
                                                    },
                                                  );
                                                })()}
                                              </p>

                                              {isSelected &&
                                                item.matches.length > 0 && (
                                                  <div className="mt-3.5 pt-3 border-t border-zinc-500/10 space-y-3.5 select-none animate-fadeIn">
                                                    <div className="flex items-center gap-1.5">
                                                      <ShieldAlert className="h-3.5 w-3.5 text-indigo-500" />
                                                      <span className="text-[10px] font-black tracking-tight uppercase text-zinc-800 dark:text-zinc-200">
                                                        Flagged Triggers
                                                        Breakdown
                                                      </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2.5">
                                                      {item.matches.map(
                                                        (match, mIdx) => {
                                                          if (!match.rule)
                                                            return null;
                                                          return (
                                                            <div
                                                              key={mIdx}
                                                              className="p-3 rounded-lg bg-zinc-500/5 border border-zinc-200/40 dark:border-zinc-800/40 space-y-2"
                                                            >
                                                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                                                <div className="flex items-center gap-1.5">
                                                                  <span className="text-[9px] font-mono font-black bg-zinc-500/10 px-1.5 py-0.5 rounded text-zinc-650 dark:text-zinc-300">
                                                                    Phrase: "
                                                                    {match.text}
                                                                    "
                                                                  </span>
                                                                  <span className="text-[9px] font-bold text-zinc-450">
                                                                    {
                                                                      match.rule
                                                                        .category
                                                                    }
                                                                  </span>
                                                                </div>
                                                                <span className="text-[8px] font-black font-mono text-zinc-400">
                                                                  {
                                                                    match.rule
                                                                      .severity
                                                                  }
                                                                </span>
                                                              </div>
                                                              <p className="text-[10px] text-zinc-650 dark:text-zinc-350 leading-normal font-medium">
                                                                <span className="font-bold text-indigo-500">
                                                                  ToS Risk:
                                                                </span>{" "}
                                                                {
                                                                  match.rule
                                                                    .explanation
                                                                }
                                                              </p>

                                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-zinc-500/5">
                                                                <div className="flex items-center justify-between gap-1 bg-zinc-500/10 p-1.5 rounded text-[10px] font-mono font-bold">
                                                                  <span className="truncate max-w-[120px] text-emerald-600 dark:text-emerald-400">
                                                                    "
                                                                    {
                                                                      match.rule
                                                                        .rewrite
                                                                    }
                                                                    "
                                                                  </span>
                                                                  <button
                                                                    type="button"
                                                                    onClick={(
                                                                      e,
                                                                    ) => {
                                                                      e.stopPropagation();
                                                                      const globSegments =
                                                                        getSegments(
                                                                          inspectText,
                                                                          analysisResult.matchedRules ||
                                                                            [],
                                                                        );
                                                                      const matchIdx =
                                                                        globSegments.findIndex(
                                                                          (
                                                                            gs,
                                                                          ) =>
                                                                            gs.isMatch &&
                                                                            gs.text ===
                                                                              match.text,
                                                                        );
                                                                      if (
                                                                        matchIdx !==
                                                                        -1
                                                                      ) {
                                                                        fixSingleSegment(
                                                                          matchIdx,
                                                                          match
                                                                            .rule
                                                                            ?.rewrite,
                                                                        );
                                                                      }
                                                                    }}
                                                                    className="px-2 py-0.5 text-[9px] bg-emerald-600 hover:bg-emerald-500 text-white rounded font-black cursor-pointer"
                                                                  >
                                                                    Apply Safe
                                                                  </button>
                                                                </div>

                                                                <div className="flex items-center justify-between gap-1 bg-zinc-500/10 p-1.5 rounded text-[10px] font-mono font-bold">
                                                                  <span className="text-zinc-400 font-mono">
                                                                    Test
                                                                    Evasion:
                                                                  </span>
                                                                  <div className="flex gap-1">
                                                                    {getDisguisedForms(
                                                                      match.text,
                                                                    )
                                                                      .slice(
                                                                        1,
                                                                        4,
                                                                      )
                                                                      .map(
                                                                        (
                                                                          form,
                                                                          formIdx,
                                                                        ) => {
                                                                          let btnLabel =
                                                                            "g.m.a.i.l";
                                                                          if (
                                                                            form.type ===
                                                                            "Hyphenated Word"
                                                                          )
                                                                            btnLabel =
                                                                              "g-mail";
                                                                          if (
                                                                            form.type ===
                                                                            "Spaced Letters"
                                                                          )
                                                                            btnLabel =
                                                                              "g m a i l";

                                                                          if (
                                                                            match.text.toLowerCase() !==
                                                                            "gmail"
                                                                          ) {
                                                                            if (
                                                                              form.type ===
                                                                              "Dotted Letters"
                                                                            )
                                                                              btnLabel =
                                                                                "Dot";
                                                                            if (
                                                                              form.type ===
                                                                              "Hyphenated Word"
                                                                            )
                                                                              btnLabel =
                                                                                "Hyph";
                                                                            if (
                                                                              form.type ===
                                                                              "Spaced Letters"
                                                                            )
                                                                              btnLabel =
                                                                                "Space";
                                                                          }

                                                                          return (
                                                                            <button
                                                                              key={
                                                                                formIdx
                                                                              }
                                                                              type="button"
                                                                              onClick={(
                                                                                e,
                                                                              ) => {
                                                                                e.stopPropagation();
                                                                                const globSegments =
                                                                                  getSegments(
                                                                                    inspectText,
                                                                                    analysisResult.matchedRules ||
                                                                                      [],
                                                                                  );
                                                                                const matchIdx =
                                                                                  globSegments.findIndex(
                                                                                    (
                                                                                      gs,
                                                                                    ) =>
                                                                                      gs.isMatch &&
                                                                                      gs.text ===
                                                                                        match.text,
                                                                                  );
                                                                                if (
                                                                                  matchIdx !==
                                                                                  -1
                                                                                ) {
                                                                                  fixSingleSegment(
                                                                                    matchIdx,
                                                                                    form.value,
                                                                                  );
                                                                                }
                                                                              }}
                                                                              className="px-1.5 py-0.5 text-[8.5px] bg-indigo-600 hover:bg-indigo-500 text-white rounded font-black cursor-pointer"
                                                                              title={`Format as: ${form.type} (${form.value})`}
                                                                            >
                                                                              {
                                                                                btnLabel
                                                                              }
                                                                            </button>
                                                                          );
                                                                        },
                                                                      )}
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          );
                                                        },
                                                      )}
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
                              <span className="text-zinc-500 italic">
                                No violations analyzed yet.
                              </span>
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

                            <span
                              className={`h-4.5 w-[1px] ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}
                            />

                            {/* Undo / Redo Buttons */}
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                disabled={undoStack.length === 0}
                                onClick={handleUndo}
                                className={`p-1.5 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer disabled:opacity-25 disabled:pointer-events-none ${
                                  isDark
                                    ? "hover:bg-zinc-800 text-zinc-300 border border-transparent hover:border-zinc-700/50"
                                    : "hover:bg-zinc-100 text-zinc-650 border border-transparent hover:border-zinc-200/60"
                                }`}
                                title="Undo auto-fix (Ctrl+Z)"
                              >
                                <Undo2 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                disabled={redoStack.length === 0}
                                onClick={handleRedo}
                                className={`p-1.5 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer disabled:opacity-25 disabled:pointer-events-none ${
                                  isDark
                                    ? "hover:bg-zinc-800 text-zinc-300 border border-transparent hover:border-zinc-700/50"
                                    : "hover:bg-zinc-100 text-zinc-650 border border-transparent hover:border-zinc-200/60"
                                }`}
                                title="Redo auto-fix (Ctrl+Y)"
                              >
                                <Redo2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <span
                              className={`h-4.5 w-[1px] ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}
                            />

                            <div
                              className={`px-2.5 py-1.5 text-[9px] font-mono font-bold flex items-center gap-1.5 rounded-lg border ${
                                isDark
                                  ? "bg-zinc-950/40 border-zinc-900 text-zinc-400"
                                  : "bg-zinc-100/50 border-zinc-200/30 text-zinc-650"
                              }`}
                            >
                              <span>
                                {getWordCount(inspectText)}{" "}
                                <span className="opacity-45">words</span>
                              </span>
                              <span
                                className={`h-2.5 w-[1px] ${isDark ? "bg-zinc-800" : "bg-zinc-300"}`}
                              />
                              <span>
                                {inspectText.length}{" "}
                                <span className="opacity-45">chars</span>
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                pushToUndoStack(inspectText);
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
                        {analysisResult &&
                          (analysisResult.dangerousContent?.length > 0 ||
                            analysisResult.potentialIssues?.length > 0) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, y: -8 }}
                              animate={{ opacity: 1, height: "auto", y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -8 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              {(() => {
                                const segments = getSegments(
                                  inspectText,
                                  analysisResult.matchedRules || [],
                                );
                                const selectedSeg =
                                  selectedSegmentIdx !== null
                                    ? segments[selectedSegmentIdx]
                                    : null;

                                if (selectedSeg && selectedSeg.rule) {
                                  const rule = selectedSeg.rule;
                                  return (
                                    <div
                                      className={`p-4 rounded-xl border flex flex-col items-start gap-4 transition-all duration-200 ${
                                        isDark
                                          ? "bg-rose-500/5 border-rose-500/20 text-zinc-200"
                                          : "bg-rose-50/60 border-rose-200 text-zinc-905"
                                      }`}
                                    >
                                      <div className="space-y-1.5 w-full">
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/10 pb-2">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span
                                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded select-none ${
                                                rule.severity ===
                                                  "Critical Risk" ||
                                                rule.severity === "High Risk"
                                                  ? "bg-rose-500/25 text-rose-600 dark:text-rose-450 font-black"
                                                  : "bg-amber-500/25 text-amber-600 dark:text-amber-450 font-black"
                                              }`}
                                            >
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
                                            onClick={() =>
                                              setSelectedSegmentIdx(null)
                                            }
                                            className="p-1 rounded bg-zinc-500/10 text-zinc-500 hover:text-zinc-750 dark:hover:text-zinc-300 cursor-pointer transition-colors"
                                            title="Close details"
                                          >
                                            <X className="h-3.5 w-3.5" />
                                          </button>
                                        </div>

                                        <p className="text-xs font-semibold leading-relaxed text-zinc-750 dark:text-zinc-300 pt-1">
                                          <strong className="text-rose-600 dark:text-rose-400">
                                            Reason:
                                          </strong>{" "}
                                          {rule.explanation}
                                        </p>

                                        <div className="mt-3 pt-2 border-t border-rose-500/5">
                                          {/* Filter Bypass Disguise */}
                                          <div className="space-y-2 p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                              <span>
                                                🕵️ Test AI Evasion Pattern
                                              </span>
                                            </div>
                                            <p className="text-[10.5px] text-zinc-650 dark:text-zinc-400 font-medium">
                                              Test if the Live AI engine catches
                                              these common evasion attempts used
                                              to bypass basic platform filters.
                                            </p>
                                            <div className="grid grid-cols-2 gap-2.5">
                                              {getDisguisedForms(
                                                selectedSeg.text,
                                              ).map((form, fIdx) => (
                                                <button
                                                  key={fIdx}
                                                  type="button"
                                                  onClick={() =>
                                                    fixSingleSegment(
                                                      selectedSegmentIdx!,
                                                      form.value,
                                                    )
                                                  }
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
                                  <div
                                    className={`p-4 rounded-xl border flex flex-col gap-4 select-none ${
                                      isDark
                                        ? "bg-amber-500/5 border-amber-500/15 text-amber-300"
                                        : "bg-amber-50/50 border-amber-200 text-amber-900"
                                    }`}
                                  >
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                      <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-bounce" />
                                        </div>
                                        <div className="min-w-0">
                                          <h4 className="text-xs font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                                            ToS Risk Triggers Located
                                          </h4>
                                          <p className="text-[10.5px] text-zinc-650 dark:text-zinc-400 mt-0.5 leading-relaxed">
                                            Click any flagged word in the marked
                                            draft above to inspect details, or
                                            configure your Auto-Fix strategy
                                            below.
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Strategy selector inside the alert box */}
                                    <div className="pt-2 border-t border-amber-500/10 flex flex-col gap-2.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-zinc-650 dark:text-zinc-300">
                                          ⚡ Choose Auto-Fix Strategy:
                                        </span>
                                        <span className="text-[9px] font-mono text-zinc-500">
                                          Applies to "Auto-Fix All"
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 rounded-xl bg-zinc-500/5 border border-zinc-200/50 dark:border-white/10 backdrop-blur-md shadow-inner">
                                        {[
                                          {
                                            id: "safe",
                                            label: "✅ Safe Fix",
                                            desc: "e.g., Fiverr native tools",
                                          },
                                          {
                                            id: "compound",
                                            label: "🕵️ Compound Space",
                                            desc: "e.g., g mail",
                                          },
                                          {
                                            id: "dotted",
                                            label: "🕵️ Dotted Letters",
                                            desc: "e.g., g.m.a.i.l",
                                          },
                                          {
                                            id: "hyphenated",
                                            label: "🕵️ Hyphenated",
                                            desc: "e.g., g-mail",
                                          },
                                          {
                                            id: "spaced",
                                            label: "🕵️ Spaced Letters",
                                            desc: "e.g., g m a i l",
                                          },
                                        ].map((strategy) => (
                                          <button
                                            key={strategy.id}
                                            type="button"
                                            onClick={() =>
                                              setFixStrategy(strategy.id as any)
                                            }
                                            className={`px-3 py-2.5 rounded-lg text-[9px] font-black tracking-tight transition-all duration-200 cursor-pointer relative overflow-hidden group/strat active:scale-95 flex flex-col items-center justify-center gap-0.5 ${
                                              fixStrategy === strategy.id
                                                ? "bg-gradient-to-r from-indigo-600/90 to-violet-600/90 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] border border-white/20"
                                                : "bg-white/40 hover:bg-white/80 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/75 text-zinc-700 hover:text-zinc-900 dark:text-zinc-350 dark:hover:text-white border border-zinc-200/40 dark:border-white/5"
                                            }`}
                                            title={strategy.desc}
                                          >
                                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/strat:animate-glass-shimmer pointer-events-none" />
                                            <span className="relative z-10 text-center">
                                              {strategy.label}
                                            </span>
                                          </button>
                                        ))}
                                      </div>
                                      <div className="flex justify-end pt-1">
                                        <button
                                          type="button"
                                          onClick={fixAllSegments}
                                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 hover:from-indigo-600 hover:to-indigo-600 text-white cursor-pointer shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)] border border-white/20 backdrop-blur-md transition-all duration-300 active:scale-95 relative overflow-hidden group/fixall"
                                        >
                                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/fixall:animate-glass-shimmer pointer-events-none" />
                                          <Sparkles className="h-4 w-4 text-indigo-200 group-hover/fixall:scale-110 transition-transform duration-250" />
                                          <span>
                                            Auto-Fix All (
                                            {analysisResult.matchedRules
                                              ?.length || 0}
                                            ) with{" "}
                                            {fixStrategy === "safe"
                                              ? "Safe Alternatives"
                                              : `Disguised ${fixStrategy.toUpperCase()}`}
                                          </span>
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
                        title="Perform Safety Audit (Ctrl+Enter)"
                        className={`w-full py-4 rounded-2xl font-extrabold text-xs transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer relative overflow-hidden group select-none shadow-[0_4px_25px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_35px_rgba(99,102,241,0.4)] border border-indigo-400/30 ${
                          isInspecting
                            ? "bg-indigo-600/40 text-indigo-200 border-indigo-500/20 backdrop-blur-md"
                            : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white hover:brightness-110"
                        } disabled:opacity-45 disabled:pointer-events-none active:scale-[0.985]`}
                      >
                        {/* Dynamic Glass Shimmer Effect */}
                        {!isInspecting && (
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-glass-shimmer pointer-events-none" />
                        )}
                        {isInspecting ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Inspecting Compliance via ToS Engine...</span>
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4 text-indigo-250 group-hover:scale-110 transition-transform duration-300" />
                            <span>
                              Perform Instant Safety Audit{" "}
                              <span className="opacity-60 text-[10px] ml-1 font-normal font-mono">
                                (Ctrl+Enter)
                              </span>
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === "composer" && (
                  <motion.div
                    key="tab-composer"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-6"
                  >
                    <div className="shrink-0">
                      <div className="flex items-center gap-2 mb-1 px-0.5">
                        <span className="flex items-center gap-1.5 text-[10px] font-mono font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest bg-indigo-500/10 dark:bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/20 shadow-sm animate-pulse">
                          <Sparkles className="h-3 w-3 text-indigo-500" />{" "}
                          COGNITIVE COMPOSER SYSTEM
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-black font-display tracking-tight mt-1 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        Professional AI Writer
                      </h2>
                      <p className="text-xs text-zinc-650 dark:text-zinc-300 mt-1.5 font-medium leading-relaxed opacity-95">
                        Transform rough bullet points, crude notes, or sloppy
                        thoughts into pristine, fully compliant client proposals
                        natively aligned with Fiverr's Terms of Service.
                      </p>
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col relative group">
                        <div className="flex items-center justify-between mb-1.5 shrink-0 select-none">
                          <label className="text-[9px] font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300">
                            Raw Bullet Points & Notes
                          </label>
                          <div className="flex items-center gap-2.5">
                            {rawThoughts.trim() && (
                              <button
                                onClick={() => setRawThoughts("")}
                                className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:opacity-80 transition flex items-center gap-1 cursor-pointer bg-rose-500/10 dark:bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/25"
                                title="Clear draft notes"
                              >
                                <Trash2 className="h-3 w-3" /> Clear
                              </button>
                            )}
                            <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-500/10 dark:bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-200/10 dark:border-white/5">
                              {rawThoughts.length} chars
                            </span>
                          </div>
                        </div>

                        <textarea
                          value={rawThoughts}
                          onChange={(e) => setRawThoughts(e.target.value)}
                          placeholder="What do you want to tell the client? (e.g., Thank them for the budget. Recommend a safe video call inside Fiverr on Monday, but no Skype. Reassure them about prompt turnaround.)"
                          className={`w-full h-36 sm:h-40 p-4 text-xs font-semibold leading-relaxed outline-none rounded-2xl transition-all duration-300 resize-none shadow-inner ${
                            isDark
                              ? "bg-zinc-950/40 border border-zinc-800/60 focus:border-indigo-500/80 text-zinc-200 placeholder-zinc-550 focus:ring-4 focus:ring-indigo-500/10"
                              : "bg-white border border-zinc-250 focus:border-indigo-600 text-zinc-900 placeholder-zinc-450 focus:ring-4 focus:ring-indigo-500/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.03)]"
                          }`}
                        />
                      </div>

                      <div className="flex flex-col gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[9px] font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300">
                              Cognitive Speech & Tone Alignment
                            </label>
                            <span className="text-[9px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                              Active: {selectedTone}
                            </span>
                          </div>

                          {/* Segmented control for Tone selection */}
                          <div
                            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 p-1.5 rounded-2xl border gap-1.5 backdrop-blur-md transition-all duration-300 ${
                              isDark
                                ? "bg-zinc-950/45 border-zinc-800/50"
                                : "bg-zinc-200/20 border-zinc-300/30"
                            }`}
                          >
                            {[
                              {
                                id: "Professional",
                                label: "💼 Elite Pro",
                                color: "bg-indigo-500",
                              },
                              {
                                id: "Friendly",
                                label: "👋 Warm",
                                color: "bg-rose-500",
                              },
                              {
                                id: "Humble",
                                label: "🙏 Humble",
                                color: "bg-amber-500",
                              },
                              {
                                id: "Confident",
                                label: "✨ Bold",
                                color: "bg-purple-500",
                              },
                              {
                                id: "Legal",
                                label: "⚖️ Legal",
                                color: "bg-teal-500",
                              },
                              {
                                id: "Urgent",
                                label: "🚨 Urgent",
                                color: "bg-red-500",
                              },
                            ].map((tone) => {
                              const isSelected = selectedTone === tone.id;
                              return (
                                <button
                                  key={tone.id}
                                  onClick={() => setSelectedTone(tone.id)}
                                  className={`py-2 rounded-xl text-[11px] font-black transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col items-center justify-center gap-1 ${
                                    isSelected
                                      ? isDark
                                        ? "bg-white/[0.08] text-white shadow-[0_4px_14px_rgba(99,102,241,0.2)] border border-white/10 backdrop-blur-sm"
                                        : "bg-white text-indigo-650 shadow-[0_4px_14px_rgba(99,102,241,0.12)] border border-zinc-200 backdrop-blur-sm"
                                      : isDark
                                        ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.02]"
                                        : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-500/5"
                                  }`}
                                >
                                  <span>{tone.label}</span>
                                  {isSelected && (
                                    <span
                                      className={`h-1 w-1 rounded-full ${tone.color} shadow-sm animate-pulse`}
                                    />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCompose()}
                          disabled={isComposing || !rawThoughts.trim()}
                          className={`w-full py-4 rounded-2xl font-extrabold text-xs transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer relative overflow-hidden group select-none shadow-[0_4px_25px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_35px_rgba(99,102,241,0.4)] border border-indigo-400/30 ${
                            isComposing
                              ? "bg-indigo-600/40 text-indigo-200 border-indigo-500/20 backdrop-blur-md"
                              : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white hover:brightness-110"
                          } disabled:opacity-45 disabled:pointer-events-none active:scale-[0.985]`}
                        >
                          {/* Dynamic Glass Shimmer Effect */}
                          {!isComposing && (
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-glass-shimmer pointer-events-none" />
                          )}
                          {isComposing ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              <span>Drafting Compliant Script...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 text-indigo-250 group-hover:scale-110 transition-transform duration-300" />
                              <span>Assemble Secure Fiverr Script</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Pre-made interactive quick actions */}
                    <div className="border-t border-zinc-200/20 dark:border-white/5 pt-4 space-y-3 select-none shrink-0">
                      <span className="text-[9px] font-mono font-black uppercase text-zinc-700 dark:text-zinc-300 block tracking-widest">
                        Tactical Workspace Presets
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {quickTemplates.map((tpl, idx) => {
                          const iconStyle =
                            tpl.tone === "Confident"
                              ? "text-purple-500 bg-purple-500/10 dark:bg-purple-500/10"
                              : tpl.tone === "Professional"
                                ? "text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/10"
                                : tpl.tone === "Friendly"
                                  ? "text-rose-500 bg-rose-500/10 dark:bg-rose-500/10"
                                  : "text-amber-500 bg-amber-500/10 dark:bg-amber-500/10";
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setRawThoughts(tpl.thoughts);
                                setSelectedTone(tpl.tone);
                                handleCompose(tpl.thoughts, tpl.tone);
                              }}
                              className={`p-3 rounded-2xl text-left border transition-all duration-300 text-xs flex items-center gap-3 cursor-pointer group ${
                                isDark
                                  ? "bg-zinc-900/30 border-zinc-800/80 hover:bg-zinc-800/60 hover:border-zinc-700/80 hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
                                  : "bg-white border-zinc-200 hover:bg-zinc-50/80 hover:border-zinc-300 shadow-3xs hover:shadow-sm"
                              }`}
                            >
                              <div
                                className={`p-2 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-105 ${iconStyle}`}
                              >
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="font-extrabold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                                  {tpl.title}
                                </span>
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium line-clamp-1">
                                  {tpl.description}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "rules" && (
                  <motion.div
                    key="tab-rules"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 flex flex-col gap-6 select-text relative"
                  >
                    {/* Liquid Glass ambient background behind header */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-2xl -z-10 rounded-t-3xl pointer-events-none" />

                    <div className="px-2">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="h-6 w-6 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 backdrop-blur-md">
                          <ShieldCheck className="h-3 w-3 text-indigo-500" />
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase text-indigo-650 dark:text-indigo-400 tracking-[0.2em]">
                          Liquid Intel Engine
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
                        Safety Protocols
                      </h2>
                      <p className="text-[13px] text-zinc-600 dark:text-zinc-400 mt-2 font-medium leading-relaxed max-w-md">
                        Explore the centralized compliance database protecting
                        against off-platform routing, fee bypass, and bad
                        actors.
                      </p>
                    </div>

                    {/* Search & Filter Toolbar - Glassified */}
                    <div
                      className={`p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                        isDark
                          ? "bg-white/[0.02] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl"
                          : "bg-white/40 border border-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl"
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative space-y-3">
                        <div className="relative">
                          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search protocol registry (e.g., Skype, crypto)..."
                            className={`w-full pl-10 pr-10 py-3 rounded-xl border text-[13px] font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder-zinc-400 ${
                              isDark
                                ? "bg-black/20 border-white/10 text-zinc-100"
                                : "bg-white/60 border-zinc-200/60 text-zinc-900 shadow-sm"
                            }`}
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery("")}
                              className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Category Dropdown */}
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-widest pl-1">
                              Category Vector
                            </span>
                            <div className="relative">
                              <select
                                value={selectedCategory}
                                onChange={(e) =>
                                  setSelectedCategory(e.target.value)
                                }
                                className={`w-full px-3 py-2 rounded-xl border text-[11px] font-bold cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                                  isDark
                                    ? "bg-black/20 border-white/10 text-zinc-300"
                                    : "bg-white/60 border-zinc-200/60 text-zinc-800"
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
                                  "Harassment & Unprofessional",
                                ].map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute right-3 top-2.5 pointer-events-none">
                                <ChevronRight className="h-3 w-3 text-zinc-400 rotate-90" />
                              </div>
                            </div>
                          </div>

                          {/* Severity Dropdown */}
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-widest pl-1">
                              Threat Level
                            </span>
                            <div className="relative">
                              <select
                                value={selectedSeverity}
                                onChange={(e) =>
                                  setSelectedSeverity(e.target.value)
                                }
                                className={`w-full px-3 py-2 rounded-xl border text-[11px] font-bold cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                                  isDark
                                    ? "bg-black/20 border-white/10 text-zinc-300"
                                    : "bg-white/60 border-zinc-200/60 text-zinc-800"
                                }`}
                              >
                                {[
                                  "All",
                                  "Low Risk",
                                  "Medium Risk",
                                  "High Risk",
                                  "Critical Risk",
                                ].map((sev) => (
                                  <option key={sev} value={sev}>
                                    {sev}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute right-3 top-2.5 pointer-events-none">
                                <ChevronRight className="h-3 w-3 text-zinc-400 rotate-90" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Liquid Glass Scrollable List */}
                    <motion.div
                      layout="position"
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="flex-1 overflow-y-auto min-h-[280px] md:max-h-[450px] space-y-2 pr-2 select-none hide-scrollbar relative z-10"
                    >
                      <AnimatePresence mode="popLayout">
                        {fullComplianceDatabase.filter((rule) => {
                          const matchesSearch =
                            rule.phrase
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            rule.category
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            rule.explanation
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase());
                          const matchesCategory =
                            selectedCategory === "All" ||
                            rule.category === selectedCategory;
                          const matchesSeverity =
                            selectedSeverity === "All" ||
                            rule.severity === selectedSeverity;
                          return (
                            matchesSearch && matchesCategory && matchesSeverity
                          );
                        }).length === 0 ? (
                          <motion.div
                            key="no-matches"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="py-16 text-center select-none"
                          >
                            <div className="h-12 w-12 rounded-full bg-zinc-500/10 flex items-center justify-center mx-auto mb-4 border border-zinc-500/20">
                              <ShieldAlert className="h-5 w-5 text-zinc-500" />
                            </div>
                            <span className="text-[13px] font-bold text-zinc-700 dark:text-zinc-300 block font-display tracking-tight">
                              Zero matches found
                            </span>
                            <span className="text-[11px] text-zinc-500 block mt-1.5 font-medium">
                              Clear your filters to reset the matrix.
                            </span>
                          </motion.div>
                        ) : (
                          fullComplianceDatabase
                            .filter((rule) => {
                              const matchesSearch =
                                rule.phrase
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()) ||
                                rule.category
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()) ||
                                rule.explanation
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase());
                              const matchesCategory =
                                selectedCategory === "All" ||
                                rule.category === selectedCategory;
                              const matchesSeverity =
                                selectedSeverity === "All" ||
                                rule.severity === selectedSeverity;
                              return (
                                matchesSearch &&
                                matchesCategory &&
                                matchesSeverity
                              );
                            })
                            .map((rule) => {
                              const isSelected = selectedRule?.id === rule.id;
                              return (
                                <motion.button
                                  key={rule.id}
                                  layout
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                  }}
                                  onClick={() => setSelectedRule(rule)}
                                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group relative overflow-hidden ${
                                    isSelected
                                      ? isDark
                                        ? "bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                                        : "bg-indigo-50/80 border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.1)] backdrop-blur-xl"
                                      : isDark
                                        ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10 backdrop-blur-xl"
                                        : "bg-white/40 border-white/80 hover:bg-white/80 shadow-sm hover:shadow-md backdrop-blur-xl"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-50" />
                                  )}

                                  <div className="flex flex-col gap-1 min-w-0 relative z-10 flex-1">
                                    <span
                                      className={`text-[13px] font-extrabold truncate font-display transition-colors ${
                                        isSelected
                                          ? "text-indigo-700 dark:text-indigo-300"
                                          : "text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                                      }`}
                                    >
                                      {rule.phrase.replace(
                                        /\s?\(Case\s?#\d+\)/gi,
                                        "",
                                      )}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate flex items-center gap-1.5">
                                      <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                                      {rule.category}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0 relative z-10">
                                    <span
                                      className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border backdrop-blur-md ${
                                        rule.severity === "Critical Risk"
                                          ? "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
                                          : rule.severity === "High Risk"
                                            ? "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
                                            : rule.severity === "Medium Risk"
                                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                                              : "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400"
                                      }`}
                                    >
                                      Lvl: {rule.riskScore}
                                    </span>
                                    <div
                                      className={`h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                                        isSelected
                                          ? "bg-indigo-500 text-white shadow-md rotate-90"
                                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 group-hover:text-indigo-500"
                                      }`}
                                    >
                                      <ChevronRight className="h-3.5 w-3.5" />
                                    </div>
                                  </div>
                                </motion.button>
                              );
                            })
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT COMPONENT COLUMN (Diagnostics / Active status monitor) */}
            <div
              className={`w-full md:w-[410px] p-6 md:p-8 flex flex-col justify-between relative overflow-y-auto min-h-0 custom-scrollbar ${
                isDark ? "bg-zinc-950/20" : "bg-zinc-100/50"
              }`}
            >
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
                      <p className="text-[11px] font-mono font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest leading-none mb-0.5">
                        LENS TELEMETRY
                      </p>
                      <p className="text-[11px] font-bold truncate leading-tight">
                        {toastMessage}
                      </p>
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
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 flex flex-col justify-between gap-5"
                  >
                    {/* Segmented Control sub-tab switcher */}
                    <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-zinc-200/25 dark:bg-zinc-950/45 backdrop-blur-md border border-zinc-300/30 dark:border-zinc-800/50 select-none shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSidebarView("insights");
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group ${
                          sidebarView === "insights"
                            ? isDark
                              ? "bg-white/[0.08] text-white shadow-[0_4px_12px_rgba(99,102,241,0.15)] border border-white/10 backdrop-blur-sm"
                              : "bg-white/80 text-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.08)] border border-zinc-200/80 backdrop-blur-sm"
                            : isDark
                              ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]"
                              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-500/5"
                        }`}
                      >
                        {/* Dynamic glass glow effect */}
                        {sidebarView === "insights" && (
                          <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50 blur-xs" />
                        )}
                        <Shield
                          className={`h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110 ${
                            sidebarView === "insights"
                              ? "text-indigo-500 animate-pulse"
                              : "text-zinc-400 dark:text-zinc-500"
                          }`}
                        />
                        <span className="relative z-10">Diagnostics Hub</span>
                        {sidebarView === "insights" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_8px_#6366f1] animate-pulse" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSidebarView("playbook");
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group ${
                          sidebarView === "playbook"
                            ? isDark
                              ? "bg-white/[0.08] text-white shadow-[0_4px_12px_rgba(99,102,241,0.15)] border border-white/10 backdrop-blur-sm"
                              : "bg-white/80 text-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.08)] border border-zinc-200/80 backdrop-blur-sm"
                            : isDark
                              ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]"
                              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-500/5"
                        }`}
                      >
                        {/* Dynamic glass glow effect */}
                        {sidebarView === "playbook" && (
                          <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50 blur-xs" />
                        )}
                        <BookOpen
                          className={`h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110 ${
                            sidebarView === "playbook"
                              ? "text-indigo-500 animate-pulse"
                              : "text-zinc-400 dark:text-zinc-500"
                          }`}
                        />
                        <span className="relative z-10">Tactics Playbook</span>
                        {sidebarView === "playbook" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_8px_#6366f1] animate-pulse" />
                        )}
                      </button>
                    </div>

                    {sidebarView === "playbook" ? (
                      /* HIGH-END INTERACTIVE TACTICS PLAYBOOK SUB-VIEW */
                      <div className="flex-1 flex flex-col justify-between select-text h-full min-h-0">
                        <div className="space-y-4 flex flex-col flex-1 min-h-0">
                          {/* macOS-style Widget Header */}
                          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-200/10 dark:border-white/5 select-none shrink-0">
                            <div className="h-6 w-6 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                              <BookOpen className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                            </div>
                            <div>
                              <span className="text-xs font-extrabold text-zinc-900 dark:text-white tracking-tight block">
                                Tactics Playbook Portal
                              </span>
                              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block">
                                Interactive safe-phrase translations &
                                guidelines
                              </span>
                            </div>
                          </div>

                          {/* Beautiful Interactive Grid Switcher */}
                          <div className="grid grid-cols-2 gap-2.5 select-none shrink-0">
                            {[
                              {
                                id: "payment",
                                label: "Payments",
                                icon: CreditCard,
                                glow: "from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/40 text-amber-700 dark:text-amber-400 shadow-[0_4px_12px_rgba(245,158,11,0.12)]",
                                activeDot: "bg-amber-500",
                              },
                              {
                                id: "meeting",
                                label: "Meetings",
                                icon: Video,
                                glow: "from-indigo-500/15 via-indigo-500/5 to-transparent border-indigo-500/40 text-indigo-700 dark:text-indigo-400 shadow-[0_4px_12px_rgba(99,102,241,0.12)]",
                                activeDot: "bg-indigo-500",
                              },
                              {
                                id: "review",
                                label: "Reviews",
                                icon: Star,
                                glow: "from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/40 text-emerald-700 dark:text-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.12)]",
                                activeDot: "bg-emerald-500",
                              },
                              {
                                id: "assets",
                                label: "File Share",
                                icon: Share2,
                                glow: "from-sky-500/15 via-sky-500/5 to-transparent border-sky-500/40 text-sky-700 dark:text-sky-400 shadow-[0_4px_12px_rgba(14,165,233,0.12)]",
                                activeDot: "bg-sky-400",
                              },
                            ].map((topic) => {
                              const isSelected = playbookTopic === topic.id;
                              return (
                                <button
                                  key={topic.id}
                                  type="button"
                                  onClick={() => {
                                    setPlaybookTopic(topic.id as any);
                                    setToastMessage(
                                      `Switched to ${topic.label} tactics playbook`,
                                    );
                                  }}
                                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group cursor-pointer active:scale-95 ${
                                    isSelected
                                      ? `bg-gradient-to-br ${topic.glow} scale-[1.02] font-black border-opacity-100 ring-1 ring-white/10`
                                      : "bg-white/30 hover:bg-white/60 dark:bg-white/[0.01] dark:hover:bg-white/[0.04] border-zinc-200/40 dark:border-white/5 text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                                  }`}
                                >
                                  {/* Glass Shimmer Reflection */}
                                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-glass-shimmer pointer-events-none" />

                                  <div
                                    className={`p-1.5 rounded-xl transition-all duration-300 ${
                                      isSelected
                                        ? "bg-white/40 dark:bg-white/10"
                                        : "bg-zinc-500/5 group-hover:bg-zinc-500/10"
                                    }`}
                                  >
                                    <topic.icon
                                      className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${
                                        isSelected ? "scale-105" : "opacity-80"
                                      }`}
                                    />
                                  </div>

                                  <span className="text-[11px] font-bold tracking-tight">
                                    {topic.label}
                                  </span>

                                  {/* Hardware LED style active indicator dot */}
                                  {isSelected && (
                                    <span
                                      className={`absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full ${topic.activeDot} shadow-[0_0_6px_currentColor] animate-pulse`}
                                    />
                                  )}
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
                              className="space-y-3.5 flex-1 min-h-0 flex flex-col"
                            >
                              {/* Short Topic Briefing card */}
                              <div className="relative rounded-2xl border border-zinc-200/50 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] p-3.5 backdrop-blur-md overflow-hidden shadow-xs shrink-0">
                                {/* Thin accent bar on the left */}
                                <div
                                  className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
                                    playbookTopic === "payment"
                                      ? "bg-amber-500"
                                      : playbookTopic === "meeting"
                                        ? "bg-indigo-500"
                                        : playbookTopic === "review"
                                          ? "bg-emerald-500"
                                          : "bg-sky-500"
                                  }`}
                                />

                                <div className="pl-1.5">
                                  <div className="flex items-center justify-between mb-1.5 select-none">
                                    <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                                      POLICY PROTOCOL
                                    </span>
                                    <span
                                      className={`text-[9px] font-extrabold uppercase font-mono px-2 py-0.5 rounded-lg border bg-white/60 dark:bg-white/5 ${
                                        playbookTopic === "payment"
                                          ? "text-amber-600 dark:text-amber-400 border-amber-500/20"
                                          : playbookTopic === "meeting"
                                            ? "text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                                            : playbookTopic === "review"
                                              ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                              : "text-sky-600 dark:text-sky-400 border-sky-500/20"
                                      }`}
                                    >
                                      {playbookData[playbookTopic].badge}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                                    {playbookData[playbookTopic].text}
                                  </p>
                                </div>
                              </div>

                              {/* Blocked Words Badges */}
                              <div className="p-3.5 rounded-2xl border border-red-500/10 dark:border-red-500/5 bg-red-500/[0.02] dark:bg-red-500/[0.01] backdrop-blur-sm space-y-2 shrink-0">
                                <div className="flex items-center gap-1.5 select-none">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                  <span className="text-[9px] font-mono font-bold text-red-500 dark:text-red-400 uppercase tracking-wider block">
                                    High-Risk Filter Flags
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {playbookData[playbookTopic].dangerWords.map(
                                    (word) => (
                                      <span
                                        key={word}
                                        className="text-[9.5px] font-mono font-bold px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/15 transition-colors duration-200"
                                      >
                                        {word}
                                      </span>
                                    ),
                                  )}
                                </div>
                              </div>

                              {/* Interactive Alternatives Card List */}
                              <div className="space-y-2 flex-1 min-h-0 flex flex-col">
                                <div className="flex items-center justify-between select-none px-0.5 shrink-0">
                                  <span className="text-[9px] font-mono font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider">
                                    Safe Translation Cards
                                  </span>
                                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">
                                    Click to copy phrase
                                  </span>
                                </div>
                                <div className="space-y-2.5 overflow-y-auto max-h-[175px] pr-1 flex-1 custom-scrollbar">
                                  {playbookData[playbookTopic].alternatives.map(
                                    (alt, index) => {
                                      const copyId = `${playbookTopic}_${index}`;
                                      const isCopied =
                                        copiedTemplateIdx === copyId;
                                      return (
                                        <div
                                          key={index}
                                          className="rounded-2xl border border-zinc-200/50 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] p-3 backdrop-blur-md space-y-3 hover:border-zinc-300/80 dark:hover:border-white/10 transition-all duration-300 shadow-xs group/altcard"
                                        >
                                          <div className="flex items-center justify-between select-none border-b border-zinc-200/10 dark:border-white/5 pb-1.5">
                                            <span className="text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                              {alt.label}
                                            </span>
                                          </div>

                                          <div className="space-y-2 text-[10px] leading-relaxed">
                                            <div className="flex gap-2 items-start text-zinc-500 dark:text-zinc-400 line-through opacity-70">
                                              <span className="text-red-500/80 font-bold shrink-0 mt-0.5 text-xs">
                                                🚫
                                              </span>
                                              <span className="font-medium italic leading-relaxed">
                                                {alt.original}
                                              </span>
                                            </div>
                                            <div className="flex gap-2 items-start text-zinc-900 dark:text-zinc-150 font-semibold bg-emerald-500/[0.03] dark:bg-emerald-500/[0.01] p-2 rounded-xl border border-emerald-500/10 dark:border-emerald-500/5">
                                              <span className="text-emerald-500 font-bold shrink-0 mt-0.5 text-xs">
                                                🌿
                                              </span>
                                              <span className="leading-relaxed">
                                                {alt.safe}
                                              </span>
                                            </div>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              handlePlaybookCopy(
                                                alt.safe,
                                                copyId,
                                              );
                                              setToastMessage(
                                                `Copied compliant phrase for "${alt.label}"!`,
                                              );
                                            }}
                                            className={`w-full py-2 rounded-xl text-[10px] font-extrabold transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 select-none border relative overflow-hidden group/copybtn active:scale-95 ${
                                              isCopied
                                                ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-[0_4px_12px_rgba(16,185,129,0.1)]"
                                                : "bg-white/60 dark:bg-zinc-900/40 hover:bg-white/90 dark:hover:bg-zinc-900/80 border-zinc-200/50 dark:border-white/5 text-zinc-650 hover:text-zinc-900 dark:text-zinc-350 dark:hover:text-white"
                                            }`}
                                          >
                                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/copybtn:animate-glass-shimmer pointer-events-none" />
                                            {isCopied ? (
                                              <>
                                                <Check className="h-3 w-3 text-emerald-500 animate-pulse" />
                                                <span>Phrase Copied!</span>
                                              </>
                                            ) : (
                                              <>
                                                <Copy className="h-3 w-3 opacity-75 group-hover/copybtn:scale-115 transition-transform duration-200" />
                                                <span>
                                                  Copy Safe Translation
                                                </span>
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      );
                                    },
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        {/* Strategy Tip at the bottom */}
                        <div className="mt-3.5 p-3.5 rounded-2xl border border-indigo-500/10 dark:border-indigo-500/5 bg-gradient-to-r from-indigo-500/[0.03] to-purple-500/[0.03] flex gap-2.5 leading-relaxed select-text shadow-xs shrink-0">
                          <div className="h-6 w-6 rounded-lg bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Info className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-mono font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block select-none">
                              Strategic Seller Tip
                            </span>
                            <p className="text-[10.5px] text-zinc-650 dark:text-zinc-400 font-medium leading-relaxed">
                              {playbookData[playbookTopic].strategy}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : /* HIGH-END INTERACTIVE INSIGHTS HUB (Diagnostics, Safety & Client Mood) */
                    analysisResult ? (
                      <div className="space-y-5 select-text flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          {/* Rotating Futuristic Holographic safety dial */}
                          <motion.div
                            whileHover={{ scale: 1.025, rotate: [0, -1, 1, 0] }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 10,
                            }}
                            className={`p-4 rounded-2xl border flex items-center gap-4.5 select-none relative overflow-hidden group cursor-pointer ${
                              isDark
                                ? "bg-gradient-to-r from-zinc-900 to-zinc-950 border-zinc-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                                : "bg-gradient-to-r from-white to-zinc-50 border-zinc-200 shadow-3xs"
                            }`}
                          >
                            <div className="relative h-15 w-15 shrink-0 flex items-center justify-center select-none">
                              <svg
                                className="absolute inset-0 transform -rotate-90 group-hover:scale-105 transition-transform duration-300"
                                viewBox="0 0 36 36"
                              >
                                {/* Background trail */}
                                <path
                                  className={`${isDark ? "stroke-zinc-850" : "stroke-zinc-200"} fill-none`}
                                  strokeWidth="3.5"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                {/* Holographic Glowing path */}
                                <motion.path
                                  initial={{ strokeDasharray: "0, 100" }}
                                  animate={{
                                    strokeDasharray: `${analysisResult.safetyScore}, 100`,
                                  }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 80,
                                    damping: 14,
                                    delay: 0.2,
                                  }}
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
                              <div
                                className="absolute inset-1.5 rounded-full border border-dashed border-indigo-500/25 animate-spin"
                                style={{ animationDuration: "12s" }}
                              />

                              <span className="text-[12px] font-mono font-black text-zinc-900 dark:text-zinc-100 z-10">
                                <AnimatedCounter
                                  value={analysisResult.safetyScore}
                                />
                                %
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <span className="text-[8.5px] font-mono font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-400 block mb-0.5">
                                TOS COGNITIVE VERDICT INDEX
                              </span>
                              <div className="flex items-center gap-1.5">
                                <h3
                                  className={`text-sm font-black tracking-tight ${
                                    analysisResult.riskLevel === "Safe"
                                      ? "text-emerald-700 dark:text-emerald-400"
                                      : analysisResult.riskLevel === "Warning"
                                        ? "text-amber-700 dark:text-amber-400"
                                        : "text-red-700 dark:text-red-400"
                                  }`}
                                >
                                  {analysisResult.riskLevel === "Safe"
                                    ? "Pristine Status"
                                    : analysisResult.riskLevel === "Warning"
                                      ? "Warning Alert"
                                      : "Severe Violations"}
                                </h3>
                                {analysisResult.riskLevel === "Safe" ? (
                                  <ShieldCheck className="h-4 w-4 text-emerald-500 animate-bounce" />
                                ) : (
                                  <AlertCircle
                                    className={`h-4 w-4 animate-pulse ${
                                      analysisResult.riskLevel === "Warning"
                                        ? "text-amber-500"
                                        : "text-red-500"
                                    }`}
                                  />
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-750 dark:text-zinc-400 font-medium">
                                Policy Shielding:{" "}
                                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                  100% Locked
                                </span>
                              </span>
                            </div>
                          </motion.div>

                          {/* UNIQUE & CREATIVE SIMULATED CLIENT BEHAVIOR SPECTROGRAM */}
                          <div
                            className={`p-4 rounded-2xl border ${
                              isDark
                                ? "bg-zinc-950/40 border-zinc-800"
                                : "bg-white border-zinc-200 shadow-3xs"
                            }`}
                          >
                            <span className="text-[9px] font-mono font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest block mb-2.5">
                              CLIENT PERSONALITY SPECTROGRAM
                            </span>

                            <div className="space-y-3">
                              {/* Estimated Mood Spec */}
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                                  Simulated Mood Metric
                                </span>
                                <motion.span
                                  animate={{ scale: [1, 1.05, 1] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className={`text-[10px] font-extrabold font-mono px-2.5 py-0.5 rounded-full ${
                                    analysisResult.clientMood
                                      ?.toLowerCase()
                                      .includes("urgent") ||
                                    analysisResult.clientMood
                                      ?.toLowerCase()
                                      .includes("stress")
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  }`}
                                >
                                  {analysisResult.clientMood ||
                                    "Neutral Engagement"}
                                </motion.span>
                              </div>

                              {/* Friction Level Meter */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                                  <span>TOS Friction Potential</span>
                                  <span className="font-mono">
                                    {analysisResult.safetyScore > 80
                                      ? "LOW"
                                      : analysisResult.safetyScore > 50
                                        ? "MEDIUM"
                                        : "CRITICAL"}
                                  </span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-200/50 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${100 - analysisResult.safetyScore}%`,
                                    }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 120,
                                      damping: 15,
                                    }}
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
                                  <span className="font-extrabold text-zinc-800 dark:text-zinc-200">
                                    Recommended Reply Velocity
                                  </span>
                                  <p>
                                    {analysisResult.clientMood
                                      ?.toLowerCase()
                                      .includes("urgent")
                                      ? "Send reply within 12 minutes. Be extremely professional and provide a direct checkout offer link."
                                      : "Standard priority pacing. Leverage soft inquiries regarding past project specifications."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Detailed Alerts Section */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                              TELEMETRY DETAILED ALERTS
                            </span>
                            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                              {analysisResult.dangerousContent &&
                              analysisResult.dangerousContent.length > 0 ? (
                                <div className="space-y-1.5">
                                  {analysisResult.dangerousContent.map(
                                    (err, idx) => (
                                      <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                          type: "spring",
                                          stiffness: 200,
                                          damping: 15,
                                          delay: idx * 0.05,
                                        }}
                                        className="flex items-start gap-2 text-[10.5px] text-red-700 dark:text-red-300 font-semibold bg-red-500/5 p-2.5 rounded-xl border border-red-500/10 hover:border-red-500/25 transition-all"
                                      >
                                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                                        <span>{err}</span>
                                      </motion.div>
                                    ),
                                  )}
                                </div>
                              ) : null}

                              {analysisResult.potentialIssues &&
                              analysisResult.potentialIssues.length > 0 ? (
                                <div className="space-y-1.5">
                                  {analysisResult.potentialIssues.map(
                                    (err, idx) => (
                                      <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                          type: "spring",
                                          stiffness: 200,
                                          damping: 15,
                                          delay: idx * 0.05,
                                        }}
                                        className="flex items-start gap-2 text-[10.5px] text-amber-700 dark:text-[#FBBF24] font-semibold bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10 hover:border-amber-500/25 transition-all"
                                      >
                                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                                        <span>{err}</span>
                                      </motion.div>
                                    ),
                                  )}
                                </div>
                              ) : null}

                              {(!analysisResult.dangerousContent ||
                                analysisResult.dangerousContent.length === 0) &&
                              (!analysisResult.potentialIssues ||
                                analysisResult.potentialIssues.length === 0) ? (
                                <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-400 flex flex-col gap-1 select-none">
                                  <span className="font-extrabold flex items-center gap-1.5">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />{" "}
                                    Approved Script Draft
                                  </span>
                                  <p className="text-[10px] leading-relaxed opacity-90 font-medium">
                                    Clean, platform-compliant script. No contact
                                    requests or off-platform payment redirection
                                    signals triggered.
                                  </p>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Communication Metric Bars */}
                        {analysisResult.communicationQualityScore && (
                          <div className="space-y-2 border-t border-zinc-250/15 dark:border-white/5 pt-3.5 select-none">
                            <span className="text-[9px] font-mono font-bold text-zinc-550 dark:text-zinc-400 uppercase">
                              COMMUNICATION PERFORMANCE
                            </span>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                              {[
                                {
                                  label: "Clarity",
                                  score:
                                    analysisResult.communicationQualityScore
                                      .clarity,
                                },
                                {
                                  label: "Professionalism",
                                  score:
                                    analysisResult.communicationQualityScore
                                      .professionalism,
                                },
                                {
                                  label: "Persuasion",
                                  score:
                                    analysisResult.communicationQualityScore
                                      .persuasiveness,
                                },
                                {
                                  label: "Trust Factor",
                                  score:
                                    analysisResult.communicationQualityScore
                                      .trustworthiness,
                                },
                              ].map((metric) => (
                                <div key={metric.label} className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-extrabold text-zinc-700 dark:text-zinc-300">
                                    <span>{metric.label}</span>
                                    <span>{metric.score}/10</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-zinc-200/60 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{
                                        width: `${metric.score * 10}%`,
                                      }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 100,
                                        damping: 15,
                                        delay: 0.3,
                                      }}
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
                            <span className="text-[11px] font-mono font-bold uppercase text-indigo-650 dark:text-indigo-400 tracking-widest">
                              COGNITIVE COMPLIANCE GUARD
                            </span>
                            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 font-display mt-0.5">
                              Security Firewalls Live
                            </h3>
                          </div>

                          {/* HIGH-FIDELITY AI & AUTOMATION ENGINE CORE */}
                          <div
                            className={`p-4.5 rounded-2xl border flex flex-col justify-center relative overflow-hidden select-none ${
                              isDark
                                ? "bg-zinc-950/40 border-zinc-800/40"
                                : "bg-white border-zinc-300 shadow-3xs text-zinc-900"
                            }`}
                          >
                            {/* Glowing grid overlay representing automation nodes */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:14px_14px]" />

                            <div className="z-10 flex flex-col items-center gap-3">
                              {/* Interactive AI Pulsing Node Matrix */}
                              <div className="relative h-16 w-16 flex items-center justify-center">
                                {/* Rotating Outer Cognitive Ring */}
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 10,
                                    ease: "linear",
                                  }}
                                  className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/30"
                                />

                                {/* Pulsing Inner Orbit Ring */}
                                <motion.div
                                  animate={{
                                    scale: [1, 1.15, 1],
                                    opacity: [0.3, 0.7, 0.3],
                                  }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 3,
                                    ease: "easeInOut",
                                  }}
                                  className="absolute inset-2 rounded-full border border-emerald-500/40 bg-emerald-500/5"
                                />

                                {/* Core AI Processing Chip */}
                                <motion.div
                                  animate={{ scale: [0.95, 1.05, 0.95] }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 2,
                                    ease: "easeInOut",
                                  }}
                                  className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 z-10"
                                >
                                  <Cpu className="h-4.5 w-4.5 animate-pulse" />
                                </motion.div>

                                {/* Orbiting Satellite Data Nodes */}
                                <motion.div
                                  animate={{ rotate: -360 }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 6,
                                    ease: "linear",
                                  }}
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
                                  <span className="text-zinc-350 dark:text-zinc-850">
                                    •
                                  </span>
                                  <span>Pipeline: 45ms Latency</span>
                                  <span className="text-zinc-350 dark:text-zinc-850">
                                    •
                                  </span>
                                  <span className="text-indigo-500 dark:text-indigo-400 font-extrabold">
                                    Autonomous Guard
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* INTERACTIVE COMPLIANCE FIREWALL SHIELDS SIMULATOR GRID */}
                          <div className="space-y-2 select-none">
                            <span className="text-[10px] font-mono font-bold uppercase text-indigo-650 dark:text-indigo-400 tracking-wider block">
                              ACTIVE POLICY FIREWALLS
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              {[
                                {
                                  key: "offPlatform",
                                  label: "Off-Platform Guard Line",
                                  desc: "Flags Skype, WhatsApp, social tags",
                                  icon: Globe,
                                },
                                {
                                  key: "paymentCircumvention",
                                  label: "Payment Circumvention",
                                  desc: "Blocks PayPal, CashApp, Direct wire requests",
                                  icon: CreditCard,
                                },
                                {
                                  key: "reviewCoercion",
                                  label: "Review Coercion Auditing",
                                  desc: "Blocks ratings/feedback requests manipulation",
                                  icon: Star,
                                },
                                {
                                  key: "academicCheating",
                                  label: "Academic Cheating Audits",
                                  desc: "Bans homeworks, school assignment contracts",
                                  icon: BookOpen,
                                },
                              ].map((shield) => {
                                const isActive = activeShields[shield.key];
                                return (
                                  <motion.div
                                    key={shield.key}
                                    whileHover={{ scale: 1.015 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => {
                                      const nextVal = !isActive;
                                      setActiveShields((prev) => ({
                                        ...prev,
                                        [shield.key]: nextVal,
                                      }));
                                      setToastMessage(
                                        `${nextVal ? "🛡️ Activated" : "⚠️ Suspended"} ${shield.label}`,
                                      );
                                    }}
                                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-300 select-none ${
                                      isActive
                                        ? isDark
                                          ? "bg-indigo-500/10 border-indigo-500/30 text-white shadow-[0_4px_15px_rgba(99,102,241,0.1)]"
                                          : "bg-indigo-50/30 border-indigo-200/80 text-zinc-900 shadow-[0_4px_12px_rgba(99,102,241,0.04)]"
                                        : isDark
                                          ? "bg-zinc-950/25 border-zinc-800/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/10"
                                          : "bg-zinc-100/40 border-zinc-200/60 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100/60"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div
                                        className={`p-2 rounded-lg transition-colors duration-300 ${
                                          isActive
                                            ? "bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 shadow-[0_2px_8px_rgba(99,102,241,0.15)]"
                                            : "bg-zinc-500/10 text-zinc-400 dark:text-zinc-500"
                                        }`}
                                      >
                                        <shield.icon className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <span
                                          className={`text-xs block leading-tight transition-all duration-300 ${
                                            isActive
                                              ? "font-extrabold text-indigo-650 dark:text-indigo-300"
                                              : "font-semibold text-zinc-700 dark:text-zinc-350"
                                          }`}
                                        >
                                          {shield.label}
                                        </span>
                                        <span className="text-[10px] text-zinc-550 dark:text-zinc-450 opacity-95 block mt-0.5">
                                          {shield.desc}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Beautiful macOS styled Toggle Switch */}
                                    <div
                                      className={`w-10 h-6 rounded-full transition-all duration-300 flex items-center p-0.5 shrink-0 border ${
                                        isActive
                                          ? "bg-indigo-500 border-indigo-600/50 shadow-[0_2px_10px_rgba(99,102,241,0.4)]"
                                          : "bg-zinc-300/60 dark:bg-zinc-800/60 border-zinc-400/30 dark:border-zinc-700/50"
                                      }`}
                                    >
                                      <motion.div
                                        animate={{ x: isActive ? 16 : 0 }}
                                        transition={{
                                          type: "spring",
                                          stiffness: 500,
                                          damping: 28,
                                        }}
                                        className={`w-4.5 h-4.5 rounded-full shadow-sm transition-colors duration-300 ${
                                          isActive
                                            ? "bg-white"
                                            : "bg-zinc-500 dark:bg-zinc-400"
                                        }`}
                                      />
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 select-none text-center p-3 select-none">
                          <span className="text-[10px] font-mono text-zinc-700 dark:text-zinc-400 font-extrabold uppercase">
                            COGNITION SCAN SYSTEM READY
                          </span>
                          <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                            Insert client messages/scripts inside the inspector
                            textarea editor and click "Verify Script Alignment"
                            to scan.
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "composer" && (
                  <motion.div
                    key="side-composer"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 flex flex-col justify-between gap-5 select-text min-h-0"
                  >
                    {isComposing ? (
                      <div className="relative flex-1 flex flex-col items-center justify-center text-center p-6 select-none rounded-3xl border border-dashed border-indigo-500/30 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-900/10 overflow-hidden">
                        {/* Background glowing effects */}
                        <div className="absolute inset-0 z-0 overflow-hidden">
                          <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl animate-pulse"
                            style={{ animationDuration: "3s" }}
                          />
                          <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-2xl animate-pulse"
                            style={{
                              animationDuration: "2s",
                              animationDelay: "0.5s",
                            }}
                          />
                        </div>

                        {/* Central AI Core Animation */}
                        <div className="relative z-10 w-32 h-32 mb-8 flex items-center justify-center">
                          {/* Orbiting rings */}
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute inset-0 rounded-full border border-indigo-500/30 dark:border-indigo-400/20 border-t-indigo-500 dark:border-t-indigo-400"
                          />
                          <motion.div
                            animate={{ rotate: -360 }}
                            transition={{
                              duration: 12,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute inset-2 rounded-full border border-purple-500/30 dark:border-purple-400/20 border-b-purple-500 dark:border-b-purple-400"
                          />
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 15,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute inset-4 rounded-full border border-dashed border-zinc-400/40 dark:border-zinc-500/30"
                          />

                          {/* Inner pulsing core */}
                          <div className="absolute inset-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] dark:shadow-[0_0_30px_rgba(99,102,241,0.2)] border border-indigo-200 dark:border-indigo-500/30">
                            <motion.div
                              animate={{
                                scale: [0.8, 1.1, 0.8],
                                opacity: [0.5, 1, 0.5],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            >
                              <BrainCircuit className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            </motion.div>
                          </div>

                          {/* Floating particles/sparkles */}
                          <motion.div
                            animate={{ y: [-5, 5, -5], opacity: [0, 1, 0] }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="absolute -top-2 -right-2"
                          >
                            <Sparkles className="h-4 w-4 text-amber-500" />
                          </motion.div>
                          <motion.div
                            animate={{ y: [5, -5, 5], opacity: [0, 1, 0] }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 1,
                            }}
                            className="absolute -bottom-2 -left-2"
                          >
                            <Sparkles className="h-3 w-3 text-purple-400" />
                          </motion.div>
                        </div>

                        {/* Status text */}
                        <div className="relative z-10 flex flex-col items-center">
                          <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-100 font-display tracking-tight flex items-center gap-2">
                            Synthesizing Output
                            <motion.span
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              ...
                            </motion.span>
                          </h4>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-3 max-w-[260px] leading-relaxed font-medium">
                            The AI engine is currently structuring, formatting,
                            and refining your communication asset.
                          </p>

                          {/* Processing steps ticker */}
                          <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-white/10 shadow-sm backdrop-blur-md">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              <Loader2 className="h-3 w-3 text-indigo-500" />
                            </motion.div>
                            <span className="text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                              Processing Neural Context
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : composedMessage ? (
                      <div className="flex-1 flex flex-col gap-5">
                        <div
                          className={`p-6 rounded-3xl border backdrop-blur-xl shadow-xl ${
                            isDark
                              ? "bg-zinc-900/40 border-zinc-800/50 shadow-black/20"
                              : "bg-white/60 border-zinc-200/30 shadow-zinc-200/30"
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-zinc-200/10 dark:border-white/5 pb-4 mb-4 shrink-0">
                            <div>
                              <span className="text-[10px] font-mono font-bold uppercase text-indigo-500 dark:text-indigo-400 tracking-widest flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2 shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                AI OUTPUT MATRIX
                              </span>
                              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 font-display mt-0.5">
                                Formulated Safe Draft
                              </h3>
                            </div>

                            {/* Rich colored badge based on selectedTone */}
                            {(() => {
                              const badgeStyle =
                                selectedTone === "Professional"
                                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                                  : selectedTone === "Friendly"
                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                    : selectedTone === "Humble"
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                      : selectedTone === "Confident"
                                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                                        : selectedTone === "Legal"
                                          ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
                                          : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
                              return (
                                <span
                                  className={`text-[10px] ${badgeStyle} px-3 py-1 rounded-full border font-black uppercase font-mono shadow-sm`}
                                >
                                  {selectedTone}
                                </span>
                              );
                            })()}
                          </div>

                          <div
                            className={`text-[13px] md:text-[14px] font-medium leading-relaxed flex flex-col min-h-0`}
                          >
                            <div className="flex items-center justify-between text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 pb-3 shrink-0 select-none">
                              <span>COGNITIVE SUMMARY STATUS</span>
                              <span>
                                WORDS: {getWordCount(composedMessage)} • CHARS:{" "}
                                {composedMessage.length}
                              </span>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 select-text whitespace-pre-line leading-relaxed min-h-[50px] mb-4 text-xs md:text-sm text-zinc-800 dark:text-zinc-200">
                              <TypewriterText text={composedMessage} />
                            </div>
                            <div className="flex justify-end pt-3 border-t border-zinc-200/10 dark:border-white/5 shrink-0">
                              <button
                                onClick={() =>
                                  handleCopy(composedMessage, "compose")
                                }
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-md active:scale-[0.97] ${
                                  composeCopied
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 border border-indigo-500/20"
                                }`}
                              >
                                {composeCopied ? (
                                  <>
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Draft Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>Copy Chat Script</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Compliance notes */}
                        <div
                          className={`p-5 rounded-3xl border backdrop-blur-lg flex flex-col gap-2 select-none text-[11px] leading-relaxed shrink-0 ${
                            isDark
                              ? "bg-zinc-900/30 border-zinc-800/40 text-zinc-400"
                              : "bg-white/50 border-zinc-200/50 text-zinc-700"
                          }`}
                        >
                          <span className="font-extrabold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5 text-xs">
                            <HelpCircle className="h-4 w-4 text-indigo-500" />{" "}
                            Compliance Safeguards
                          </span>
                          <p className="text-[10.5px] leading-relaxed font-semibold text-zinc-700 dark:text-zinc-450">
                            Our AI writer intercepts dangerous phrases (Skype,
                            personal emails) and replaces them with standard
                            fiverr identifiers:{" "}
                            <code className="bg-emerald-500/10 dark:bg-emerald-500/25 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 text-[10px]">
                              [Fiverr Native Scheduler]
                            </code>
                            . Always crosscheck coordinates.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative flex-1 flex flex-col items-center justify-center text-center p-6 select-none rounded-3xl border border-dashed border-zinc-200/50 dark:border-white/5 bg-zinc-50/30 dark:bg-zinc-900/10 overflow-hidden">
                        {/* Dashed Center Fade Grid */}
                        <div
                          className="absolute inset-0 z-0 pointer-events-none"
                          style={{
                            backgroundImage: isDark
                              ? `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`
                              : `linear-gradient(to right, #d6d3d1 1px, transparent 1px), linear-gradient(to bottom, #d6d3d1 1px, transparent 1px)`,
                            backgroundSize: "20px 20px",
                            backgroundPosition: "0 0, 0 0",
                            maskImage: `
                             repeating-linear-gradient(
                                    to right,
                                    black 0px,
                                    black 3px,
                                    transparent 3px,
                                    transparent 8px
                                  ),
                                  repeating-linear-gradient(
                                    to bottom,
                                    black 0px,
                                    black 3px,
                                    transparent 3px,
                                    transparent 8px
                                  ),
                                radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)
                            `,
                            WebkitMaskImage: `
                             repeating-linear-gradient(
                                    to right,
                                    black 0px,
                                    black 3px,
                                    transparent 3px,
                                    transparent 8px
                                  ),
                                  repeating-linear-gradient(
                                    to bottom,
                                    black 0px,
                                    black 3px,
                                    transparent 3px,
                                    transparent 8px
                                  ),
                                radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)
                            `,
                            maskComposite: "intersect",
                            WebkitMaskComposite: "source-in",
                          }}
                        />
                        {/* High-end diagnostic dynamic vector loader illustration */}
                        <div className="relative w-24 h-24 mb-6 flex items-center justify-center z-10">
                          <div
                            className="absolute inset-0 rounded-full border border-dashed border-indigo-500/20 animate-spin"
                            style={{ animationDuration: "20s" }}
                          />
                          <div
                            className="absolute inset-2 rounded-full border border-indigo-500/10 animate-reverse-spin"
                            style={{ animationDuration: "12s" }}
                          />
                          <div className="absolute inset-4 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center animate-pulse" />
                          <Sparkles className="h-7 w-7 text-indigo-500 relative z-10 animate-float" />
                        </div>
                        <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100 font-display relative z-10">
                          Composer Output Offline
                        </h4>
                        <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-2 max-w-[240px] leading-relaxed font-semibold relative z-10">
                          Draft raw user ideas on the left and dispatch the
                          secure builder to generate a polished, highly aligned
                          communication asset.
                        </p>
                        <div className="mt-4 flex items-center gap-1.5 text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-500 uppercase relative z-10">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-pulse" />
                          Standing by for instruction matrix
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "rules" && (
                  <motion.div
                    key="side-rules"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex-1 flex flex-col justify-between gap-6 select-text p-6 md:p-8 rounded-[2rem] border relative overflow-hidden transition-all duration-500 ${
                      isDark
                        ? "bg-black/20 border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
                        : "bg-white/40 border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] backdrop-blur-2xl"
                    }`}
                  >
                    {/* Liquid Glass ambient background behind content */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 blur-3xl -z-10 pointer-events-none" />

                    {selectedRule ? (
                      <div className="flex flex-col flex-1 gap-6 min-h-0 relative z-10">
                        {/* Selected Rule Header */}
                        <div className="shrink-0 relative">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="flex h-6 w-6 relative items-center justify-center">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-40"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"></span>
                            </span>
                            <span className="text-[10px] font-mono font-bold uppercase text-indigo-500 dark:text-indigo-400 tracking-[0.2em]">
                              Intel Analysis
                            </span>
                          </div>
                          <h3 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50 font-display leading-tight tracking-tight">
                            {selectedRule.phrase.replace(
                              /\s?\(Case\s?#\d+\)/gi,
                              "",
                            )}
                          </h3>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 shrink-0">
                          <span
                            className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border backdrop-blur-md ${
                              isDark
                                ? "bg-white/5 text-zinc-300 border-white/10"
                                : "bg-black/5 text-zinc-700 border-black/10"
                            }`}
                          >
                            {selectedRule.category}
                          </span>
                          <span
                            className={`text-[9px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest backdrop-blur-md ${
                              selectedRule.severity === "Critical Risk"
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
                                : selectedRule.severity === "High Risk"
                                  ? "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
                                  : selectedRule.severity === "Medium Risk"
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                                    : "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400"
                            }`}
                          >
                            {selectedRule.severity}
                          </span>
                        </div>

                        {/* Liquid Risk Meter */}
                        <div
                          className={`p-5 rounded-2xl border backdrop-blur-xl relative overflow-hidden group ${
                            isDark
                              ? "bg-white/[0.02] border-white/10"
                              : "bg-white/60 border-white/80 shadow-sm"
                          }`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
                          <div className="flex justify-between items-end mb-3">
                            <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.15em]">
                              Threat Level
                            </span>
                            <span className="text-zinc-900 dark:text-zinc-50 text-2xl font-black leading-none">
                              {selectedRule.riskScore}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${selectedRule.riskScore}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                                selectedRule.riskScore > 80
                                  ? "bg-gradient-to-r from-rose-500 to-rose-400"
                                  : selectedRule.riskScore > 50
                                    ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                    : "bg-gradient-to-r from-blue-500 to-blue-400"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Explanation & Alternative - Liquid Cards */}
                        <div className="space-y-4 flex-1 min-h-0 overflow-y-auto hide-scrollbar pr-1 relative z-10">
                          <div className="space-y-2">
                            <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.15em] pl-1">
                              Rationale
                            </span>
                            <p className="text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300 font-semibold tracking-tight">
                              {selectedRule.explanation}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.15em] pl-1">
                              Safe Alternative
                            </span>
                            <div
                              className={`p-5 rounded-2xl border text-[13px] font-semibold leading-relaxed relative overflow-hidden group ${
                                isDark
                                  ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-100"
                                  : "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm"
                              }`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                              <p className="pr-10 relative z-10">
                                {selectedRule.rewrite}
                              </p>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    selectedRule.rewrite,
                                  );
                                  setInspectCopied(true);
                                  setTimeout(
                                    () => setInspectCopied(false),
                                    2000,
                                  );
                                }}
                                className={`absolute right-3 top-3 p-2.5 rounded-xl transition-all cursor-pointer z-10 ${
                                  isDark
                                    ? "hover:bg-emerald-500/20 text-emerald-400"
                                    : "hover:bg-emerald-200/50 text-emerald-600"
                                }`}
                                title="Copy safe alternative"
                              >
                                {inspectCopied ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 flex gap-3 shrink-0 relative z-10">
                          <button
                            onClick={() =>
                              handleTestRuleInInspector(selectedRule)
                            }
                            className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_8px_25px_rgba(79,70,229,0.4)] hover:-translate-y-0.5"
                          >
                            <Shield className="h-4 w-4" />
                            Test in Inspector
                          </button>
                          <button
                            onClick={() => setSelectedRule(null)}
                            className={`px-5 py-3.5 rounded-xl border font-black text-[11px] uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center ${
                              isDark
                                ? "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
                                : "bg-white/60 border-zinc-300/80 text-zinc-700 hover:bg-white shadow-sm"
                            }`}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Rules summary statistics - Liquid theme */
                      <div className="space-y-6 relative z-10 flex flex-col h-full justify-center">
                        <div className="text-center mb-2">
                          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                            <ShieldCheck className="h-8 w-8 text-indigo-500" />
                          </div>
                          <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-[0.2em] block mb-2">
                            System Active
                          </span>
                          <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-display tracking-tight">
                            Intel Directory
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center select-none">
                          <div
                            className={`p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${
                              isDark
                                ? "bg-white/[0.02] border-white/10"
                                : "bg-white/60 border-white/80 shadow-sm"
                            }`}
                          >
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                              Indexed Policies
                            </span>
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-display block">
                              {fullComplianceDatabase.length}
                            </span>
                          </div>
                          <div
                            className={`p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${
                              isDark
                                ? "bg-white/[0.02] border-white/10"
                                : "bg-white/60 border-white/80 shadow-sm"
                            }`}
                          >
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                              Rule Vectors
                            </span>
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display block">
                              9
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3 select-none mt-2">
                          <div
                            className={`p-4 rounded-2xl border backdrop-blur-xl flex items-start gap-3 ${
                              isDark
                                ? "bg-amber-500/5 border-amber-500/20 text-zinc-300"
                                : "bg-amber-50/80 border-amber-200/60 text-zinc-800"
                            }`}
                          >
                            <Info className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                            <div>
                              <span className="font-extrabold block mb-1 text-[12px] tracking-tight">
                                Deep Inspection
                              </span>
                              <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                                Select any policy vector on the left to reveal
                                its strictness index and view pre-approved safe
                                communication patterns.
                              </p>
                            </div>
                          </div>

                          <div
                            className={`p-4 rounded-2xl border backdrop-blur-xl flex items-start gap-3 ${
                              isDark
                                ? "bg-rose-500/5 border-rose-500/20 text-zinc-300"
                                : "bg-rose-50/80 border-rose-200/60 text-zinc-800"
                            }`}
                          >
                            <ShieldAlert className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                            <div>
                              <span className="font-extrabold block mb-1 text-[12px] tracking-tight">
                                Zero-Tolerance Bypasses
                              </span>
                              <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                                Attempting to share personal contacts, evade
                                platform fees, or manipulate reviews triggers
                                automated moderation.
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
      </div>

      {/* Dedicated Footer Text (outside of mac window) */}
      <div className="mt-6 shrink-0">
        <p className="text-[9px] font-mono text-zinc-500/80 dark:text-zinc-400/80 select-none uppercase tracking-widest text-center">
          Crafted for Freelance Care • Design & Developed By RIR • 2026
        </p>
      </div>
    </div>
  );
}
