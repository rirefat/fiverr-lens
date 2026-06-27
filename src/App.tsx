import { useState, useEffect, useRef } from "react";
import {
  Shield,
  Sparkles,
  LayoutTemplate,
  BookOpen,
  Command,
  HelpCircle,
  X,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Local database, rules database, and Firebase integration
import { fullComplianceDatabase, ComplianceRule } from "./complianceDatabase";
import { db } from "./lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
} from "firebase/firestore";

// High-performance modular sub-components
import { CommandPalette } from "./components/CommandPalette";
import { TabInspector } from "./components/TabInspector";
import { TabComposer } from "./components/TabComposer";
import { TabRules } from "./components/TabRules";
import { TabTemplates } from "./components/TabTemplates";
import { RightSidebar } from "./components/RightSidebar";

// Interfaces and types
import { SafetyAnalysis, MessageTemplate, InspectorVersion } from "./types";
import { runLocalAnalysis, runLocalCompose, getSegments, getDisguisedForms } from "./lib/complianceUtils";

/**
 * Fiverr Lens - Standard App Entrypoint
 * Orchestrates the global state, layout panels, keyboard shortcuts, dictation services,
 * and passes props down to clean, highly modular sub-components.
 */
export default function App() {
  // Theme state (system-level light/dark theme)
  const [isDark, setIsDark] = useState(false);

  // Active workspace tab state
  const [activeTab, setActiveTab] = useState<
    "inspector" | "composer" | "rules" | "templates"
  >("inspector");

  // Live status state of backend API connections
  const [apiStatus, setApiStatus] = useState({
    ready: false,
    hasApiKey: false,
    message: "Verifying connection...",
  });

  // =========================================================================
  // 1. SAFETY INSPECTOR MODULE STATES
  // =========================================================================
  const [inspectText, setInspectText] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("fiverrlens_inspectText") || "";
    }
    return "";
  });

  const mainTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [inspectVersions, setInspectVersions] = useState<InspectorVersion[]>(
    () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("fiverrlens_inspect_versions");
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch (e) {
            return [];
          }
        }
      }
      return [];
    },
  );
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SafetyAnalysis | null>(
    null,
  );
  const [inspectCopied, setInspectCopied] = useState(false);
  const [inspectorViewMode, setInspectorViewMode] = useState<
    "edit" | "highlight" | "heatmap"
  >("edit");
  const [fixStrategy, setFixStrategy] = useState<
    "safe" | "compound" | "dotted" | "hyphenated" | "spaced"
  >("safe");
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState<number | null>(null);

  // =========================================================================
  // 2. RIGHT-SIDE DIAGNOSTIC SIDEBAR STATES
  // =========================================================================
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

  // Modals and visual overlay controls
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [previewTemplate, setPreviewTemplate] =
    useState<MessageTemplate | null>(null);

  // =========================================================================
  // 3. COGNITIVE WRITER / COMPOSER STATES
  // =========================================================================
  const [rawThoughts, setRawThoughts] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("fiverrlens_rawThoughts") || "";
    }
    return "";
  });

  // Speech Dictation States
  const [isListening, setIsListening] = useState(false);
  const [interimSpeech, setInterimSpeech] = useState("");
  const [recognition, setRecognition] = useState<any>(null);

  const [selectedTone, setSelectedTone] = useState("Professional");
  const [isComposing, setIsComposing] = useState(false);
  const [composedMessage, setComposedMessage] = useState("");
  const [composeCopied, setComposeCopied] = useState(false);
  const [clipboardHistory, setClipboardHistory] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("fiverrlens_clipboard_history");
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // =========================================================================
  // 4. PROTOCOLS & INTEGRATED TEMPLATES DATA
  // =========================================================================
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [selectedRule, setSelectedRule] = useState<ComplianceRule | null>(null);

  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([
    {
      id: "onboarding-1",
      category: "Onboarding",
      title: "New Order Welcome",
      description: "Welcoming a buyer after they place an order.",
      content:
        "Hello [Client Name],\n\nI hope you and your family are safe and doing well!\n\nThank you so much for placing the order and trusting me with your project. I am really excited to collaborate with you on this.\n\nThis is just a quick message to let you know that I have officially started working on your project today. I have carefully reviewed all your requirements and the details we discussed.\n\nCommunication & Next Steps:\nI believe in keeping my clients fully in the loop, so I will send you regular updates as the project progresses. You will not have to guess what is happening with your website!\n\nIf you have any sudden ideas, questions, or extra details you want to share while I am working, please feel free to send me a message anytime.\n\nThank you again for this opportunity. I will be in touch soon with our first progress update.\n\nBest regards,\n[Name]",
    },
    {
      id: "clarification-1",
      category: "Communication",
      title: "Requirement Clarification",
      description: "Asking the buyer for more details.",
      content:
        "Hi [Name],\n\nThank you for providing the requirements! Before I begin, I just have a quick question to ensure I deliver exactly what you're looking for.\n\nCould you please clarify [Specific Question]?\n\nLooking forward to your response!\n\nBest regards,\n[Your Name]",
    },
    {
      id: "project-update-1",
      category: "Project Update",
      title: "Project Update",
      description: "Keeping the buyer informed about progress.",
      content:
        "Hello [Client Name],\n\nI hope you are having a great week!\n\nI am reaching out to share a quick update on our progress with the project. Things are moving along smoothly, and here is a summary of what has been completed so far:\n\n- [Action taken]: [e.g., Designed the main layout for the Home and About pages.]\n- [Action taken]: [e.g., Integrated the contact forms and ensured they are mobile-responsive.]\n- [Action taken]: [e.g., Cleaned up the navigation menu for a better user experience.]\n\n🔗 You can review the current progress here:\n[Insert Link, if applicable]\n\nNext Steps:\nI will now be moving on to [mention the next task, e.g., setting up the database].\n\nWhat I Need From You:\nTo keep our momentum going, could you please [mention any required action]?\n\nIf you have any questions or notice anything you would like adjusted, please feel free to let me know.\n\nBest regards,\n[Name]",
    },
    {
      id: "delivery-followup-1",
      category: "Delivery Follow-up",
      title: "Delivery Follow-up",
      description: "Checking in after delivery if the buyer hasn't responded.",
      content:
        "Hello [Client Name],\n\nI hope you and your family are doing well and staying safe!\n\nI am just checking in to see if you have had a chance to review the final draft I submitted recently.\n\nI want to ensure you are completely satisfied with the final result. If you have had time to test the website and noticed anything that needs a minor tweak, adjustment, or modification, please do not hesitate to let me know. I am always here to help, and I will gladly make any changes exactly as per your instructions.\n\nAs a quick reminder, even after the order is completed, I will provide you with 30 days of free ongoing support for any minor adjustments you might need. You will not be left in the dark once the project is closed!\n\nIf everything looks great and meets your expectations, please feel free to accept the delivery on the order page whenever you are ready.\n\nBest regards,\n[Name]",
    },
    {
      id: "delivery-1",
      category: "Delivery",
      title: "Standard Delivery",
      description: "Professional delivery message for completed orders.",
      content:
        "Hello [Client Name],\n\nI hope you and your family are doing well and staying safe!\n\nI am excited to let you know that I have successfully completed your project based on your requirements and our previous discussions.\n\nHere is a quick breakdown of what has been implemented:\n\n- Core Setup: [e.g., Configured the client dashboard and structures.]\n- Page Design: [e.g., Optimized user interfaces to match your vision.]\n- Responsiveness: Optimized the entire asset to perform beautifully on mobile, tablet, and desktop devices.\n\n🔗 Please review the live assets here:\n[Insert Web URL]\n\nRevisions & Support:\nYour complete satisfaction is my top priority. If you need any minor tweaks, modifications, or adjustments, please do not hesitate to share your thoughts. I will gladly make the changes exactly as per your instructions.\n\nAdditionally, I am happy to provide you with 30 days of free ongoing support after the project is completed.\n\nNext Steps:\nIf everything looks great, please accept the delivery request on the order page. Sharing your honest experience would also mean a lot to me!\n\nThanks,\n[Name]",
    },
    {
      id: "extension-1",
      category: "Extension Request",
      title: "Project Extension Request",
      description: "Politely requesting an extension.",
      content:
        "Hello [Client Name],\n\nJust a quick update! The project is coming along great. To ensure the final delivery is perfect without rushing the final details, would you be open to a brief extension of [Number] days?\n\nThis gives me the needed time to fully polish and test everything to the highest standard for you. I’ll send the request over shortly. Thank you!",
    },
    {
      id: "support-1",
      category: "Support",
      title: "Support Request",
      description: "Standard format for contacting Customer Support.",
      content:
        "Dear Fiverr Support Team,\n\nI am writing to you today regarding order ID: [Insert Order ID]. I always pour my soul into my work, and I have tried absolutely everything in my power to resolve this peacefully, but I am now feeling completely helpless.\n\nI have spent countless hours and late nights working on this project. I have remained perfectly polite, followed all Fiverr terms, and delivered my absolute best effort to make this client happy. However, despite my complete dedication, the situation has become impossible because [Briefly state the problem in one sentence].\n\nFiverr is my livelihood, and I work incredibly hard to maintain my reputation and provide excellent service. It is truly heartbreaking to put so much honest effort into a project only to face a situation like this that is completely out of my control.\n\nI respectfully ask a human agent to please read our chat history. I humbly beg for your empathy and support to resolve this fairly, and to please protect my hard-earned seller profile from being unjustly penalized for a situation I could not prevent.\n\nThank you so much for your time, understanding, and compassion during this stressful time.\n\nWarm regards,\n[Your Name / Fiverr Username]",
    },
  ]);

  const [selectedTemplateCategory, setSelectedTemplateCategory] =
    useState("All");
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const templateCategories: string[] = [
    "All",
    ...Array.from(new Set(messageTemplates.map((t) => t.category))) as string[],
  ];

  // Quick templates pre-configurations list for composer
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

  const rulesCategories = [
    "Off-Platform Communication",
    "External Payments",
    "Fiverr Fee Circumvention",
    "Personal Contact Information",
    "Phishing & Suspicious Language",
    "Academic Integrity Violations",
    "Ratings & Review Manipulation",
    "Harassment & Unprofessional",
  ];

  // =========================================================================
  // 5. EFFECT LIFECYCLES & ACTIONS
  // =========================================================================

  // Save inspect draft text to local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fiverrlens_inspectText", inspectText);
    }
  }, [inspectText]);

  // Debounced auto-save drafts to local history when user pauses typing
  useEffect(() => {
    if (!inspectText.trim()) return;

    const timer = setTimeout(() => {
      setInspectVersions((prev) => {
        if (prev.length > 0 && prev[0].text.trim() === inspectText.trim()) {
          return prev;
        }

        const newVersion: InspectorVersion = {
          id: Math.random().toString(36).substring(2, 9),
          text: inspectText,
          timestamp: Date.now(),
        };

        const filtered = prev.filter(
          (v) => v.text.trim() !== inspectText.trim(),
        );
        const updated = [newVersion, ...filtered].slice(0, 5);

        localStorage.setItem(
          "fiverrlens_inspect_versions",
          JSON.stringify(updated),
        );
        return updated;
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [inspectText]);

  const formatVersionTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hrs = String(date.getHours()).padStart(2, "0");
    const mins = String(date.getMinutes()).padStart(2, "0");
    const secs = String(date.getSeconds()).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // Auto-dismiss Lens Toast messages after delay
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Save raw ideas draft notes to local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fiverrlens_rawThoughts", rawThoughts);
    }
  }, [rawThoughts]);

  // Speech Recognition Service Setup
  const toggleDictation = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setToastMessage(
        "Speech recognition is not supported in this browser. Try Chrome or Safari!",
      );
      return;
    }

    if (isListening) {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {}
      }
      setIsListening(false);
      setInterimSpeech("");
    } else {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === "not-allowed") {
          setToastMessage(
            "Microphone permission denied. Please allow mic access in your browser.",
          );
        } else {
          setToastMessage(`Speech error: ${event.error}`);
        }
        setIsListening(false);
        setInterimSpeech("");
      };

      rec.onend = () => {
        setIsListening(false);
        setInterimSpeech("");
      };

      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (interimTranscript) {
          setInterimSpeech(interimTranscript);
        }

        if (finalTranscript) {
          setInterimSpeech("");
          setRawThoughts((prev) => {
            const trimmed = prev.trim();
            const connector = trimmed ? " " : "";
            return trimmed + connector + finalTranscript;
          });
        }
      };

      try {
        rec.start();
        setRecognition(rec);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {}
      }
    };
  }, [recognition]);

  // Fetch AI server status on startup
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

  // Listen for template metrics real-time updates from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "templateStats"),
      (snapshot) => {
        const statsMap = new Map<string, number>();
        snapshot.forEach((doc) => {
          statsMap.set(doc.id, doc.data().usageCount);
        });

        setMessageTemplates((prev) =>
          prev.map((template) => {
            const count = statsMap.get(template.id);
            return count !== undefined && count !== template.usageCount
              ? { ...template, usageCount: count }
              : template;
          }),
        );
      },
    );

    return () => unsubscribe();
  }, []);

  // Synchronize system dark classes on global tags
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, [isDark]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // '?' key opens Shortcuts reference
      if (e.key === "?" && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setShowShortcuts(true);
      }

      // 'Escape' key closes active modulations
      if (e.key === "Escape") {
        setShowShortcuts(false);
      }

      // 'Ctrl+Enter' triggers direct safety scan
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (inspectText.trim()) {
          e.preventDefault();
          handleInspect();
          setToastMessage("⚡ Safety Audit Initiated");
        }
      }

      // 'Ctrl+I' highlights and focuses draft editor
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setActiveTab("inspector");
        setInspectorViewMode("edit");
        setTimeout(() => {
          mainTextareaRef.current?.focus();
        }, 50);
        setToastMessage("⌨️ Focused Editor Input");
      }

      // 'Ctrl+D' toggles light/dark themes
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setIsDark((prev) => !prev);
      }

      // 'Ctrl+Shift+E' clears draft inspection editor
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "e"
      ) {
        e.preventDefault();
        setInspectText("");
        setToastMessage("🗑️ Cleared Inspector Editor");
      }

      // 'Ctrl+Shift+R' clears AI thoughts writer
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "r"
      ) {
        e.preventDefault();
        setRawThoughts("");
        setToastMessage("🗑️ Cleared AI Composer");
      }

      // 'Tab' key cycles cleanly between primary views
      if (e.key === "Tab") {
        e.preventDefault();
        const tabs: ("inspector" | "composer" | "rules" | "templates")[] = [
          "inspector",
          "composer",
          "rules",
          "templates",
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

  // Handler for full ToS Compliance Scan
  const handleInspect = async (overrideText?: string, silent?: boolean) => {
    const textToAnalyze =
      overrideText !== undefined ? overrideText : inspectText;
    if (!textToAnalyze.trim()) return;

    if (!silent) {
      setIsInspecting(true);
      setAnalysisResult(null);
      setSelectedSegmentIdx(null);
    }

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
      if (!silent) {
        if (
          data &&
          (data.dangerousContent?.length > 0 || data.potentialIssues?.length > 0)
        ) {
          setInspectorViewMode("highlight");
        } else {
          setInspectorViewMode("edit");
        }
      }
    } catch (err) {
      console.warn(
        "Fiverr live analysis backend unavailable. Using local Sandbox Fallback:",
        err,
      );
      const localData = runLocalAnalysis(textToAnalyze);
      setAnalysisResult(localData);
      if (!silent) {
        if (
          localData &&
          (localData.dangerousContent?.length > 0 ||
            localData.potentialIssues?.length > 0)
        ) {
          setInspectorViewMode("highlight");
        } else {
          setInspectorViewMode("edit");
        }
      }
    } finally {
      if (!silent) {
        setIsInspecting(false);
      }
    }
  };

  const pushToUndoStack = (text: string) => {
    setUndoStack((prev) => [...prev, text]);
    setRedoStack([]);
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

  const restoreVersion = (version: InspectorVersion) => {
    if (inspectText.trim() && inspectText.trim() !== version.text.trim()) {
      setInspectVersions((prev) => {
        const currentVersion: InspectorVersion = {
          id: Math.random().toString(36).substring(2, 9),
          text: inspectText,
          timestamp: Date.now(),
        };
        const filtered = prev.filter(
          (v) => v.text.trim() !== inspectText.trim(),
        );
        const updated = [currentVersion, ...filtered].slice(0, 5);
        localStorage.setItem(
          "fiverrlens_inspect_versions",
          JSON.stringify(updated),
        );
        return updated;
      });
    }

    setInspectText(version.text);
    handleInspect(version.text);
    setShowVersionDropdown(false);
    setToastMessage("⏱️ Draft Version Restored!");
  };

  const fixSingleSegment = (idx: number, customReplacement?: string) => {
    if (!analysisResult) return;
    const runLocalSegs = getSegments(
      inspectText,
      analysisResult.matchedRules || [],
    );
    const newSegments = runLocalSegs.map((seg: any, sIdx: number) => {
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

    // Instantly update local analysis results to prevent flashes and provide 0ms feedback
    const localData = runLocalAnalysis(newText);
    setAnalysisResult(localData);

    // Seamlessly re-inspect via backend AI in the background
    handleInspect(newText, true);

    setSelectedSegmentIdx(null);
  };

  const fixAllSegments = () => {
    if (!analysisResult) return;
    const runLocalSegs = getSegments(
      inspectText,
      analysisResult.matchedRules || [],
    );
    const newText = runLocalSegs
      .map((seg: any) => {
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

    // Instantly update local analysis results to prevent flashes and provide 0ms feedback
    const localData = runLocalAnalysis(newText);
    setAnalysisResult(localData);

    // Seamlessly re-inspect via backend AI in the background
    handleInspect(newText, true);

    setSelectedSegmentIdx(null);
  };

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

  const addToClipboardHistory = (msg: string) => {
    if (!msg || !msg.trim()) return;
    setClipboardHistory((prev) => {
      const filtered = prev.filter((x) => x.trim() !== msg.trim());
      const updated = [msg, ...filtered].slice(0, 5);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            "fiverrlens_clipboard_history",
            JSON.stringify(updated),
          );
        } catch (e) {
          console.error("Failed to save clipboard history", e);
        }
      }
      return updated;
    });
  };

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
          templates: messageTemplates,
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
      addToClipboardHistory(data.generatedMessage);
      setActiveTab("composer");
    } catch (err) {
      console.warn(
        "Fiverr live composition failed. Using local Sandbox Fallback:",
        err,
      );
      const localMessage = runLocalCompose(
        thoughtsToUse,
        customTone || selectedTone,
      );
      setComposedMessage(localMessage);
      addToClipboardHistory(localMessage);
      setActiveTab("composer");
    } finally {
      setIsComposing(false);
    }
  };

  const handleCopy = (text: string, type: "inspect" | "composed" | "compose") => {
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

  const handleTemplateCopy = async (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplateIdx(id);

    setMessageTemplates((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, usageCount: (t.usageCount || 0) + 1 } : t,
      ),
    );

    try {
      const docRef = doc(db, "templateStats", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const currentCount = docSnap.data()?.usageCount || 0;
        await setDoc(docRef, { usageCount: currentCount + 1 }, { merge: true });
      } else {
        await setDoc(docRef, { usageCount: 1 }, { merge: true });
      }
    } catch (error) {
      console.error("Error updating template usage count:", error);
    }

    setTimeout(() => setCopiedTemplateIdx(null), 1500);
  };

  const getWordCount = (text: string) => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  // =========================================================================
  // 6. LAYOUT RENDERING PIPELINE
  // =========================================================================
  return (
    <div
      className={`min-h-[100dvh] md:h-screen md:max-h-screen w-screen max-w-full md:overflow-hidden overflow-x-hidden transition-colors duration-500 font-sans relative p-3 md:p-6 flex flex-col items-center justify-center ${
        isDark
          ? "bg-gradient-to-tr from-[#0F1015] via-[#161720] to-[#1D142A] text-zinc-100"
          : "bg-gradient-to-tr from-[#E1E4F5] via-[#F4F5FA] to-[#FFEBE9] text-zinc-800"
      }`}
    >
      {/* Minimal grid decoration background */}
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

      {/* Ambient background glows */}
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
      </div>

      <div className="w-full max-w-7xl flex-1 min-h-0 z-10 relative flex flex-col items-center justify-between py-1 md:overflow-hidden">
        {/* Main macOS-Style Glass Window */}
        <div
          id="mac-window-root"
          className={`w-full flex-1 md:min-h-0 rounded-[24px] transition-all duration-500 relative flex flex-col md:overflow-hidden ${
            isDark ? "glass-panel-dark" : "glass-panel-light"
          }`}
        >
          {/* Header Window Title Bar */}
          <div
            className={`px-4 sm:px-5 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 border-b select-none ${
              isDark
                ? "border-zinc-800/40 bg-zinc-950/20"
                : "border-white/40 bg-white/20"
            }`}
          >
            {/* Traffic Lights / App Title */}
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
              className="flex items-center p-1 rounded-xl border max-w-full overflow-x-auto no-scrollbar shrink-0 select-none gap-1 bg-zinc-200/25 dark:bg-zinc-950/45 backdrop-blur-md border-zinc-300/30 dark:border-zinc-800/50"
            >
              {[
                { id: "inspector", label: "Inspector", icon: Shield },
                { id: "composer", label: "AI Writer", icon: Sparkles },
                { id: "rules", label: "ToS Rules", icon: BookOpen },
                { id: "templates", label: "Templates", icon: LayoutTemplate },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-bold tracking-tight transition-all duration-300 flex items-center gap-1.5 shrink-0 cursor-pointer relative overflow-hidden group ${
                      isActive
                        ? isDark
                          ? "bg-white/[0.08] text-white shadow-[0_4px_12px_rgba(99,102,241,0.15)] border border-white/10 backdrop-blur-sm"
                          : "bg-white/80 text-indigo-650 shadow-[0_4px_12px_rgba(99,102,241,0.08)] border border-zinc-200/80 backdrop-blur-sm"
                        : isDark
                          ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-500/5"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50 blur-xs" />
                    )}
                    <tab.icon
                      className={`h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                        isActive
                          ? "text-indigo-500 animate-pulse"
                          : "text-zinc-450 dark:text-zinc-500"
                      }`}
                    />
                    <span className="relative z-10 shrink-0">{tab.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_8px_#6366f1] animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Top-Right Connection Indicator & Theme Switcher */}
            <div className="flex items-center gap-3">
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

          {/* Window Split Panels (Left Column, Right Column) */}
          <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-200/20 dark:divide-white/5 md:min-h-0 md:overflow-hidden">
            {/* LEFT USER CONTROL SHEET */}
            <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 md:overflow-y-auto min-h-0 hide-scrollbar">
              <AnimatePresence mode="wait">
                {activeTab === "inspector" && (
                  <TabInspector
                    isDark={isDark}
                    inspectText={inspectText}
                    setInspectText={setInspectText}
                    handleInspect={handleInspect}
                    isInspecting={isInspecting}
                    analysisResult={analysisResult}
                    setAnalysisResult={setAnalysisResult}
                    inspectorViewMode={inspectorViewMode}
                    setInspectorViewMode={setInspectorViewMode}
                    inspectCopied={inspectCopied}
                    handleCopy={handleCopy}
                    undoStack={undoStack}
                    redoStack={redoStack}
                    handleUndo={handleUndo}
                    handleRedo={handleRedo}
                    showVersionDropdown={showVersionDropdown}
                    setShowVersionDropdown={setShowVersionDropdown}
                    inspectVersions={inspectVersions}
                    restoreVersion={restoreVersion}
                    formatVersionTime={formatVersionTime}
                    getWordCount={getWordCount}
                    pushToUndoStack={pushToUndoStack}
                    fixSingleSegment={fixSingleSegment}
                    fixAllSegments={fixAllSegments}
                    fixStrategy={fixStrategy}
                    setFixStrategy={setFixStrategy}
                    mainTextareaRef={mainTextareaRef}
                  />
                )}

                {activeTab === "composer" && (
                  <TabComposer
                    isDark={isDark}
                    rawThoughts={rawThoughts}
                    setRawThoughts={setRawThoughts}
                    selectedTone={selectedTone}
                    setSelectedTone={setSelectedTone}
                    isListening={isListening}
                    toggleDictation={toggleDictation}
                    interimSpeech={interimSpeech}
                    isComposing={isComposing}
                    handleCompose={handleCompose}
                    quickTemplates={quickTemplates}
                  />
                )}

                {activeTab === "rules" && (
                  <TabRules
                    isDark={isDark}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedSeverity={selectedSeverity}
                    setSelectedSeverity={setSelectedSeverity}
                    selectedRule={selectedRule}
                    setSelectedRule={setSelectedRule}
                    categories={rulesCategories}
                    fullComplianceDatabase={fullComplianceDatabase}
                  />
                )}

                {activeTab === "templates" && (
                  <TabTemplates
                    isDark={isDark}
                    templateSearchQuery={templateSearchQuery}
                    setTemplateSearchQuery={setTemplateSearchQuery}
                    selectedTemplateCategory={selectedTemplateCategory}
                    setSelectedTemplateCategory={setSelectedTemplateCategory}
                    templateCategories={templateCategories}
                    messageTemplates={messageTemplates}
                    setMessageTemplates={setMessageTemplates}
                    setPreviewTemplate={setPreviewTemplate}
                    handleTemplateCopy={handleTemplateCopy}
                    copiedTemplateIdx={copiedTemplateIdx}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT TELEMETRY DIAGNOSTICS & DETAILS COLUMN */}
            <RightSidebar
              isDark={isDark}
              toastMessage={toastMessage}
              setToastMessage={setToastMessage}
              activeTab={activeTab}
              sidebarView={sidebarView}
              setSidebarView={setSidebarView}
              playbookTopic={playbookTopic}
              setPlaybookTopic={setPlaybookTopic}
              copiedTemplateIdx={copiedTemplateIdx}
              handlePlaybookCopy={handlePlaybookCopy}
              analysisResult={analysisResult}
              activeShields={activeShields}
              setActiveShields={setActiveShields}
              isComposing={isComposing}
              composedMessage={composedMessage}
              setComposedMessage={setComposedMessage}
              selectedTone={selectedTone}
              getWordCount={getWordCount}
              handleCopy={handleCopy}
              composeCopied={composeCopied}
              selectedRule={selectedRule}
              setSelectedRule={setSelectedRule}
              fullComplianceDatabase={fullComplianceDatabase}
              inspectCopied={inspectCopied}
              setInspectCopied={setInspectCopied}
              handleTestRuleInInspector={handleTestRuleInInspector}
              messageTemplatesCount={messageTemplates.length}
              clipboardHistory={clipboardHistory}
              setClipboardHistory={setClipboardHistory}
            />
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Overlay modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShortcuts(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative overflow-hidden ${
                isDark
                  ? "bg-zinc-900 border-white/10 text-white"
                  : "bg-white border-zinc-200 text-zinc-800"
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-500/10 to-transparent blur-xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-zinc-200/10 dark:border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                    LENS MANUAL
                  </span>
                  <h3 className="text-base font-black tracking-tight font-display">
                    Interactive Shortcuts
                  </h3>
                </div>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                </button>
              </div>

              <div className="space-y-3 font-semibold text-xs leading-relaxed">
                {[
                  { key: "Shift + ?", desc: "Toggle interactive shortcuts map" },
                  { key: "Tab", desc: "Cleanly cycle through active workspace tabs" },
                  { key: "Ctrl + Enter", desc: "Initiate direct compliance script safety audit" },
                  { key: "Ctrl + I", desc: "Highlight and focus draft editor text area" },
                  { key: "Ctrl + D", desc: "Toggle system light/dark theme profiles" },
                  { key: "Ctrl + K", desc: "Display deep command palette overlay" },
                  { key: "Ctrl + Shift + E", desc: "Purge the active safety inspector workspace" },
                  { key: "Ctrl + Shift + R", desc: "Purge the active raw thoughts writer drafts" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-zinc-150/5 dark:border-white/5 last:border-0"
                  >
                    <span className="text-zinc-500 dark:text-zinc-450">
                      {item.desc}
                    </span>
                    <kbd className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-xl border border-black/5 dark:border-white/5 font-extrabold text-[10.5px] text-zinc-700 dark:text-zinc-300 shadow-sm whitespace-nowrap">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Preview / Quick Copy Modal sheet */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewTemplate(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl h-[80vh] flex flex-col p-6 rounded-3xl border shadow-2xl relative overflow-hidden ${
                isDark
                  ? "bg-zinc-900 border-white/10 text-white"
                  : "bg-white border-zinc-200 text-zinc-800"
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-zinc-200/10 dark:border-white/5 pb-4 mb-4 shrink-0 select-none">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <LayoutTemplate className="h-4.5 w-4.5 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                      {previewTemplate.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        {previewTemplate.description}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                        {previewTemplate.category}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar select-text">
                <div
                  className={`p-5 rounded-2xl border text-sm md:text-[15px] font-medium whitespace-pre-line leading-relaxed ${
                    isDark
                      ? "bg-black/20 border-white/5 text-zinc-300"
                      : "bg-zinc-50/80 border-zinc-200/50 text-zinc-600"
                  }`}
                >
                  {previewTemplate.content}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-200/50 dark:border-white/5 flex justify-end shrink-0 select-none">
                <button
                  onClick={() => {
                    handleTemplateCopy(
                      previewTemplate.content,
                      previewTemplate.id,
                    );
                  }}
                  className={`group relative px-6 py-2.5 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all duration-300 cursor-pointer overflow-hidden active:scale-[0.96] ${
                    copiedTemplateIdx === previewTemplate.id
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)] border border-emerald-400/50"
                      : isDark
                        ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.1)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.3)]"
                        : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.5)] border border-indigo-400/50"
                  }`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_60%)] pointer-events-none" />
                  <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-center min-w-[130px]">
                    <AnimatePresence mode="wait">
                      {copiedTemplateIdx === previewTemplate.id ? (
                        <motion.div
                          key="check"
                          initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-4 w-4 drop-shadow-md" />
                          <span>Copied!</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4 group-hover:-rotate-12 transition-transform duration-300 ease-out" />
                          <span>Copy Template</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Command Palette Trigger button */}
      <button
        onClick={() => setShowCommandPalette(true)}
        className="fixed bottom-6 left-6 z-50 group cursor-pointer outline-none w-14 h-14 select-none"
        title="Open Command Palette (Cmd/Ctrl + K)"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 blur-xl group-hover:blur-2xl group-hover:scale-150 transition-all duration-700 ease-out"></div>
          <div className="absolute inset-2 rounded-full border border-indigo-500/30 dark:border-indigo-400/20 scale-100 group-hover:scale-[1.8] opacity-100 group-hover:opacity-0 transition-all duration-1000 ease-out"></div>
          <div className="absolute inset-3 rounded-full border border-indigo-400/40 dark:border-indigo-300/20 scale-100 group-hover:scale-[1.5] opacity-100 group-hover:opacity-0 transition-all duration-700 ease-out delay-75"></div>

          <div className="relative w-full h-full rounded-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/80 dark:border-white/10 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-110 group-active:scale-95">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-transparent to-fuchsia-500/20 dark:from-indigo-500/30 dark:via-transparent dark:to-fuchsia-500/30 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/60 dark:from-white/20 to-transparent rounded-t-full"></div>
            <Command className="w-5 h-5 text-indigo-600 dark:text-indigo-400 drop-shadow-sm transition-transform duration-500 relative z-10" />
            <Sparkles className="absolute top-2 right-2 w-2 h-2 text-fuchsia-500 dark:text-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
            <Sparkles className="absolute bottom-2 left-2 w-2 h-2 text-indigo-500 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200" />
          </div>

          <div className="absolute left-full ml-4 px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-[13px] font-medium opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-black/5 dark:border-white/10 flex items-center gap-3">
            <span>Command Palette</span>
            <kbd className="font-sans font-bold bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded-lg text-[10px] text-zinc-500 dark:text-zinc-400 border border-black/5 dark:border-white/5">
              ⌘K
            </kbd>
          </div>
        </div>
      </button>

      <CommandPalette
        open={showCommandPalette}
        setOpen={setShowCommandPalette}
        isDark={isDark}
        setIsDark={setIsDark}
        setActiveTab={setActiveTab}
        setInspectText={setInspectText}
        setRawThoughts={setRawThoughts}
        setShowShortcuts={setShowShortcuts}
      />
    </div>
  );
}
