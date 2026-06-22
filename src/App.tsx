import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight,
  Info,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  SlidersHorizontal,
  Eye,
  Camera
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { RULE_CATEGORIES, scanMessage, Violation } from "./utils/rulesEngine";

interface ScanResultResponse {
  safetyScore: number;
  safetyStatus: "safe" | "caution" | "danger";
  aiSummary: string;
  compliantDraft: string;
  detectedThemes: string[];
  violations: Violation[];
  isFreelancerDraft?: boolean;
  usingFallback?: boolean;
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-100 rounded-2xl shadow-premium text-[11px] text-gray-800 font-sans max-w-[210px] z-50">
        <p className="font-semibold text-gray-950 truncate leading-snug">{data.name}</p>
        <p className="text-gray-500 mt-1 font-mono">
          {data.name === "Guaranteed Safe" 
            ? "No risks detected!" 
            : `Flags detected: ${data.value}`}
        </p>
      </div>
    );
  }
  return null;
};

const PRESET_MESSAGES = [
  // Section: Pasted Client Inquiries (Incoming)
  {
    id: "off_platform",
    title: "📞 incoming: Zoom bypass",
    description: "Client phone & WhatsApp requests",
    text: "Hey! I looked at your profile and I would love to hire you. Can we quick hop on a Zoom meeting or talk on WhatsApp first? My phone number is +1 (555) 482-1922. Let's deal outside, my email address is client_hire@gmail.com."
  },
  {
    id: "payment",
    title: "💳 incoming: Zelle request",
    description: "Client PayPal or bank discount",
    text: "Can we handle the payment directly via PayPal or BTC? If we do it cheaper outside Fiverr, I can save on service taxes and I will send money directly to your Zelle or bank transfer."
  },
  {
    id: "academic",
    title: "🎓 incoming: Exam helper",
    description: "Client asking for school homework help",
    text: "Hello, I need someone to log into my university blackboard canvas portal and do my upcoming programming calculus exam / blackboard quiz. It is a school project and grading assignment. Can you do my homework for a higher grade?"
  },
  // Section: Pasted Outgoing Messages (Drafts to check)
  {
    id: "draft_zoom",
    title: "💬 Outgoing: Zoom draft",
    description: "Your proposal sharing personal info",
    text: "I can build this responsive React portal easily. Let's schedule a call on Skype or WhatsApp to discuss the layout details. Here is my Skype name: developer_pro, and you can email me at dev@example.com."
  },
  {
    id: "draft_academic",
    title: "💬 Outgoing: Exam tutor",
    description: "Your proposal taking on test work",
    text: "Yes, I will log into your school blackboard account and take care of your programming quiz. Please send over your university portal login credentials."
  },
  {
    id: "draft_safe",
    title: "💬 Outgoing: Safe project",
    description: "Your proposal using Fiverr natively",
    text: "Hi there! I am happy to audit your frontend layouts. We can discuss all design specifications safely right here on Fiverr. I'll send an official custom offer milestone for your review."
  }
];

export default function App() {
  const [inputText, setInputText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<ScanResultResponse | null>(null);
  const [streamedReply, setStreamedReply] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "inspect">("edit");
  const [currentPreset, setCurrentPreset] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<"professional" | "friendly" | "firm" | "concise">("professional");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Keep textarea and backdrop scroll position synchronized
  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Perform local live scan as user types (non-blocking)
  const localScan = scanMessage(inputText);

  // Handle Scan Request
  const handleScan = async (textToScan: string = inputText, toneToUse = selectedTone) => {
    if (!textToScan || !textToScan.trim()) return;
    setIsScanning(true);
    setAnalysis(null);
    setStreamedReply("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToScan, tone: toneToUse }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data: ScanResultResponse = await response.json();
      setAnalysis(data);

      // Trigger typewriter streaming effect for AI compliant draft
      simulateTypewriter(data.compliantDraft);
    } catch (error) {
      console.error("Error analyzing message:", error);
      // Fallback directly to local client rules
      const fallbacks = scanMessage(textToScan);
      const activeCategories = Array.from(new Set(fallbacks.violations.map(v => v.category)));
      
      const lowercaseMessage = textToScan.toLowerCase();
      const isFreelancerDraft = lowercaseMessage.includes("i can") || 
                                lowercaseMessage.includes("i will") || 
                                lowercaseMessage.includes("my gig") || 
                                lowercaseMessage.includes("my profile") ||
                                lowercaseMessage.includes("my price") || 
                                lowercaseMessage.includes("delivery");

      const draftText = getLocalFallbackDraft(activeCategories, isFreelancerDraft, toneToUse);
      const dummyAnalysis: ScanResultResponse = {
        safetyScore: fallbacks.safetyScore,
        safetyStatus: fallbacks.overallStatus,
        aiSummary: `${fallbacks.summaryText} (Using fallback local analysis engine)`,
        compliantDraft: draftText,
        detectedThemes: activeCategories,
        violations: fallbacks.violations,
        isFreelancerDraft,
        usingFallback: true
      };
      setAnalysis(dummyAnalysis);
      simulateTypewriter(dummyAnalysis.compliantDraft);
    } finally {
      setIsScanning(false);
    }
  };

  const simulateTypewriter = (text: string) => {
    setIsStreaming(true);
    setStreamedReply("");
    let index = 0;
    const intervalTime = Math.max(5, Math.min(30, Math.floor(1000 / (text.split(" ").length || 1)))); // dynamic fast speed
    const words = text.split(" ");
    
    const interval = setInterval(() => {
      if (index < words.length) {
        setStreamedReply((prev) => prev + (prev ? " " : "") + words[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, intervalTime * 2);
  };

  const getLocalFallbackDraft = (categories: string[], isFreelancerDraft = false, tone = "professional"): string => {
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

    return baseMsg;
  };

  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.compliantDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePresetSelect = (preset: typeof PRESET_MESSAGES[0]) => {
    setInputText(preset.text);
    setCurrentPreset(preset.id);
    setActiveTab("edit");
    // Trigger quick analysis automatically
    handleScan(preset.text);
  };

  const handleClear = () => {
    setInputText("");
    setAnalysis(null);
    setStreamedReply("");
    setCurrentPreset(null);
    if (textareaRef.current) textareaRef.current.focus();
  };

  // Helper to render high-contrast highlighted HTML backdrop behind the textarea
  const renderBackdropText = () => {
    if (!inputText) return <span className="text-gray-400 text-lg">Pasted message will highlight here...</span>;

    let cursor = 0;
    const elements: React.ReactNode[] = [];
    const textLower = inputText.toLowerCase();

    // Collect all matched violation ranges
    const matchedRanges: { start: number; end: number; violation: Violation }[] = [];

    // Let's grab the violations from active analysis if available, otherwise use preview results
    const activeViolations = analysis ? analysis.violations : localScan.violations;

    activeViolations.forEach((v) => {
      // Find where v.word is in inputText starting near v.index
      const startIdx = v.index;
      const endIdx = v.index + v.length;
      
      // Make sure we have a valid index range
      if (startIdx >= 0 && endIdx <= inputText.length) {
        matchedRanges.push({ start: startIdx, end: endIdx, violation: v });
      }
    });

    // Sort ranges by start
    matchedRanges.sort((a, b) => a.start - b.start);

    // Render text segmented with highlighted spans
    matchedRanges.forEach((range, idx) => {
      if (range.start > cursor) {
        elements.push(inputText.substring(cursor, range.start));
      }
      
      const isDanger = range.violation.severity === "danger";
      elements.push(
        <mark
          key={idx}
          className={`px-1 rounded-sm text-transparent ${
            isDanger ? "bg-red-200/50 outline-2 outline-red-300" : "bg-amber-100/60 outline-2 outline-amber-300"
          }`}
          title={`${range.violation.category}: "${range.violation.word}"`}
        >
          {inputText.substring(range.start, range.end)}
        </mark>
      );
      
      cursor = range.end;
    });

    if (cursor < inputText.length) {
      elements.push(inputText.substring(cursor));
    }

    return <>{elements}</>;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 selection:bg-black selection:text-white pb-16 flex flex-col">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-md border-b border-gray-100/60 px-6 py-4">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-600/20 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-700 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Eye className="h-5 w-5 text-white relative z-10 animate-pulse-slow" />
              <div className="absolute right-1 bottom-1 w-2 h-2 bg-white rounded-full border border-emerald-600 z-20" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 font-display flex items-center">
              Fiverr<span className="text-emerald-600 font-medium ml-1">Lens</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100/55 rounded-full px-1.5 py-0.5 ml-2 font-semibold font-sans">
                TOS Active
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="tos-badge bg-emerald-50 text-emerald-800 border-emerald-100/60">
              <span className="badge-dot bg-emerald-500"></span>
              <span>LENS ACTIVE</span>
            </div>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
              <span className="hover:text-gray-950 transition-colors cursor-pointer">Dashboard</span>
              <span className="hover:text-gray-950 transition-colors cursor-pointer">History</span>
              <span className="hover:text-gray-950 transition-colors cursor-pointer">Guidelines</span>
              <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300/30"></div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Primary Layout Container */}
      <main className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 flex-1">
        
        {/* Left Column (Input Hub - 7 Grid Spans) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">
              Message Risk Scanner
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
              Paste client messages to check for risks or audit your own custom drafts before hitting send. Identify Terms of Service flags instantly and automatically generate policy-compliant, polished message improvements.
            </p>
          </div>

          {/* Quick Preset Templates Bar */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 tracking-wider uppercase">
              <BookOpen className="h-3 w-3" />
              <span>Diagnostic Sandbox Scenarios</span>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_MESSAGES.map((preset) => {
                const isActive = currentPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isActive 
                        ? "bg-black border-black text-white shadow-premium" 
                        : "bg-white border-gray-100 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-semibold text-xs truncate">{preset.title}</div>
                    <div className={`text-[9px] truncate mt-0.5 ${isActive ? "text-gray-300" : "text-gray-400"}`}>
                      {preset.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone Selector Segment */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-antigravity flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 tracking-wider uppercase">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Select Target Draft Tone</span>
              </div>
              <span className="text-[10px] bg-gray-100 font-mono text-gray-500 px-1.5 py-0.5 rounded-md">
                Active: {selectedTone.toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: "Professional", id: "professional", desc: "Corporate, polite & secure" },
                { name: "Friendly", id: "friendly", desc: "Warm, empathetic & kind" },
                { name: "Firm", id: "firm", desc: "Strict rules compliance" },
                { name: "Concise", id: "concise", desc: "Brief, direct 1-2 sentences" }
              ].map((t) => {
                const isSelected = selectedTone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTone(t.id as any);
                      if (inputText.trim()) {
                        handleScan(inputText, t.id as any);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all outline-none ${
                      isSelected 
                        ? "bg-black border-black text-white shadow-premium scale-[1.02] cursor-default" 
                        : "bg-[#FAFAFA] border-gray-100 hover:border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    <div className="font-semibold text-xs">{t.name}</div>
                    <div className={`text-[9px] mt-0.5 leading-normal ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
                      {t.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Box Canvas Container */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-antigravity overflow-hidden relative flex flex-col flex-1 min-h-[360px]">
            {/* Interactive View Toggle */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-b border-gray-100">
              <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeTab === "edit" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Message Canvas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("inspect")}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                    activeTab === "inspect" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <span>Inspector Highlights</span>
                  {localScan.violations.length > 0 && (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-red-100 bg-red-600 rounded-full animate-bounce">
                      {localScan.violations.length}
                    </span>
                  )}
                </button>
              </div>

              {inputText && (
                <button
                  onClick={handleClear}
                  className="text-xs text-gray-400 hover:text-red-500 transition-all flex items-center gap-1 py-1 px-2 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear Canvas</span>
                </button>
              )}
            </div>

            {/* Editable Canvas Panel */}
            <div className="relative flex-1 p-6 flex flex-col min-h-[260px]">
              {activeTab === "edit" ? (
                <div className="relative flex-1 w-full h-full">
                  {/* Highlighted Visual Backdrop */}
                  <div
                    ref={backdropRef}
                    className="absolute inset-0 w-full h-full pointer-events-none select-none font-sans text-lg leading-relaxed whitespace-pre-wrap break-words overflow-auto text-transparent px-1 py-1"
                    style={{ fontSize: "18px" }}
                  >
                    {renderBackdropText()}
                  </div>

                  {/* Real Floating Textarea with transparent overlay text */}
                  <textarea
                    ref={textareaRef}
                    onScroll={handleScroll}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your client's message here to scan for TOS violations..."
                    className="absolute inset-0 w-full h-full font-sans text-lg leading-relaxed bg-transparent border-0 outline-none resize-none focus:ring-0 text-[#1F1F1F] caret-black placeholder-gray-400/80 p-1"
                    style={{ fontSize: "18px", wordBreak: "break-word" }}
                  />
                </div>
              ) : (
                /* Static High Fidelity Highlights Inspector */
                <div className="flex-1 overflow-y-auto space-y-4">
                  {inputText ? (
                    <div className="font-sans text-sm leading-relaxed text-gray-700 bg-[#FAFAFA] p-5 rounded-2xl border border-gray-100/80 whitespace-pre-wrap break-words">
                      {/* Fully interactive highlights with inline widgets */}
                      {(() => {
                        let cursor = 0;
                        const renderedTags: React.ReactNode[] = [];
                        const activeViolations = analysis ? analysis.violations : localScan.violations;

                        activeViolations.forEach((v, idx) => {
                          const startIdx = v.index;
                          const endIdx = v.index + v.length;
                          
                          if (startIdx >= 0 && endIdx <= inputText.length) {
                            if (startIdx > cursor) {
                              renderedTags.push(<span key={`text-${idx}`}>{inputText.substring(cursor, startIdx)}</span>);
                            }

                            const isDanger = v.severity === "danger";
                            renderedTags.push(
                              <span
                                key={`v-${idx}`}
                                className={`inline-flex flex-col items-start mx-0.5 p-1 rounded-lg border leading-tight ${
                                  isDanger 
                                    ? "bg-red-50 text-red-800 border-red-200" 
                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                }`}
                              >
                                <span className="font-semibold underline decoration-dashed decoration-2 decoration-red-400">
                                  {inputText.substring(startIdx, endIdx)}
                                </span>
                                <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5 opacity-80 flex items-center gap-0.5">
                                  <AlertTriangle className="h-2 w-2" />
                                  {v.category}
                                </span>
                              </span>
                            );
                            cursor = endIdx;
                          }
                        });

                        if (cursor < inputText.length) {
                          renderedTags.push(<span key="text-end">{inputText.substring(cursor)}</span>);
                        }

                        return renderedTags;
                      })()}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                      <Info className="h-8 w-8 mb-2 stroke-1" />
                      <p className="text-xs">No text written to inspect. Use the editing canvas first or click a diagnostic scenario above.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Floating Action Bar */}
            <div className="p-4 bg-gray-50/50 border-t border-gray-100/60 flex items-center justify-between">
              <div className="text-xs text-gray-400 flex items-center gap-1.5 font-mono">
                {inputText ? (
                  <>
                    <span>Characters: <strong>{inputText.length}</strong></span>
                    <span className="block h-2 w-2 rounded-full bg-gray-200" />
                    <span>Forbidden Terms Found: <strong className={localScan.violations.length > 0 ? "text-red-500 font-bold" : "text-green-600 font-bold"}>{localScan.violations.length}</strong></span>
                  </>
                ) : (
                  <span>Ready to paste</span>
                )}
              </div>

              <button
                type="button"
                disabled={isScanning || !inputText.trim()}
                onClick={() => handleScan()}
                className={`py-3 px-8 rounded-full font-sans font-medium text-sm flex items-center gap-2.5 transition-all outline-none ${
                  isScanning 
                    ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    : !inputText.trim()
                    ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    : "bg-[#1F1F1F] text-white hover:bg-black shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:scale-[1.02] active:scale-[0.97] cursor-pointer"
                }`}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Shield Engine Auditing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 fill-white/10" />
                    <span>Scan & Analyze</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Right Column (Safety & Insights Center - 5 Grid Spans) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {!analysis && !isScanning ? (
              /* Idle Empty State */
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-antigravity p-8 flex flex-col items-center justify-center text-center flex-1 min-h-[460px]"
              >
                <div className="p-4 bg-[#F5F5F7] rounded-full text-black mb-6 animate-float relative shadow-sm">
                  <ShieldCheck className="h-12 w-12 stroke-[1.5]" />
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                
                <h2 className="font-display text-xl font-bold tracking-tight text-gray-900">
                  Antigravity Safety Guard
                </h2>
                <p className="text-sm text-gray-500 max-w-sm mt-2 leading-relaxed">
                  Your custom workspace defense. Type or click any sample client query on the left to activate premium, real-time message scanning and secure AI composition.
                </p>

                {/* Micro educational tips inside the card */}
                <div className="mt-8 pt-6 border-t border-gray-100/80 w-full text-left space-y-3.5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Fiverr TOS Safeguard List
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                      <span className="text-green-500 font-bold font-mono">1.</span> Off-Platform Contacts
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                      <span className="text-green-500 font-bold font-mono">2.</span> Off-Platform Payment
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                      <span className="text-green-500 font-bold font-mono">3.</span> Academic Integrity
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                      <span className="text-green-500 font-bold font-mono">4.</span> Review Manipulation
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : isScanning ? (
              /* Auditing State */
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-antigravity p-8 flex flex-col items-center justify-center text-center flex-1 min-h-[460px] space-y-6"
              >
                <div className="relative">
                  {/* Outer spinning ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-black/5 animate-pulse" />
                  <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-black animate-spin flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-black animate-bounce" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-lg font-bold">Deep Scanning Message Structure...</h3>
                  <div className="flex flex-col gap-1 items-center justify-center">
                    <span className="text-xs text-gray-500 font-mono flex items-center gap-1.5 justify-center py-1">
                      <span className="h-1.5 w-1.5 bg-black rounded-full animate-ping" />
                      Analyzing lexical patterns
                    </span>
                    <span className="text-xs text-gray-400 font-mono">Comparing with Fiverr Terms & Conditions</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Analysis Results View */
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6 flex-1"
              >
                {/* Floating Safety Core Dashboard Card with Clean Minimalism Dynamic Border */}
                <div className={`antigravity-card p-6 relative overflow-hidden border-l-4 ${
                  analysis.safetyStatus === "safe" 
                    ? "border-green-500" 
                    : analysis.safetyStatus === "caution" 
                    ? "border-amber-500" 
                    : "border-red-500"
                }`}>
                  
                  {/* Performance indicator background glow */}
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[64px] pointer-events-none opacity-30 ${
                    analysis.safetyStatus === "safe" 
                      ? "bg-green-400" 
                      : analysis.safetyStatus === "caution" 
                      ? "bg-amber-400" 
                      : "bg-red-400"
                  }`} />

                  {(() => {
                    const counts: { [key: string]: number } = {};
                    analysis.violations.forEach((v) => {
                      counts[v.category] = (counts[v.category] || 0) + 1;
                    });

                    const getCategoryColor = (name: string) => {
                      if (name === "Guaranteed Safe") return "#10B981";
                      if (name.includes("Communication")) return "#EF4444";
                      if (name.includes("Payment")) return "#B91C1C";
                      if (name.includes("Academic")) return "#F59E0B";
                      if (name.includes("Review")) return "#D97706";
                      if (name.includes("Free Work")) return "#FBBF24";
                      return "#6B7280";
                    };

                    const chartData = analysis.violations.length === 0
                      ? [{ name: "Guaranteed Safe", value: 1 }]
                      : Object.entries(counts).map(([name, value]) => ({
                          name,
                          value
                        }));

                    const chartColors = chartData.map(d => getCategoryColor(d.name));

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                        {/* Left Section - Status, Commentary, Red Flags List */}
                        <div className="md:col-span-7 flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                                Safety Status
                              </h3>
                              <div className="flex items-center gap-1.5 mt-1">
                                {analysis.safetyStatus === "safe" ? (
                                  <p className="text-xl font-bold text-green-600">Clean & Secure</p>
                                ) : analysis.safetyStatus === "caution" ? (
                                  <p className="text-xl font-bold text-amber-500">Possible Caution</p>
                                ) : (
                                  <p className="text-xl font-bold text-red-600">High Risk Violation</p>
                                )}
                              </div>
                            </div>

                            {/* Circular Score Meter */}
                            <div className="relative h-14 w-14 flex items-center justify-center shrink-0">
                              <svg className="absolute h-full w-full -rotate-90">
                                <circle
                                  cx="28"
                                  cy="28"
                                  r="24"
                                  className="stroke-gray-100 fill-none"
                                  strokeWidth="4"
                                />
                                <circle
                                  cx="28"
                                  cy="28"
                                  r="24"
                                  className={`fill-none transition-all duration-1000 ${
                                    analysis.safetyStatus === "safe" 
                                      ? "stroke-green-500" 
                                      : analysis.safetyStatus === "caution" 
                                      ? "stroke-amber-500" 
                                      : "stroke-red-500"
                                  }`}
                                  strokeWidth="4"
                                  strokeDasharray="150"
                                  strokeDashoffset={150 - (150 * analysis.safetyScore) / 100}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="font-mono font-bold text-xs text-gray-950">
                                {analysis.safetyScore}
                              </span>
                            </div>
                          </div>

                          {/* Summary commentary segment */}
                          <div className="bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100/60 shadow-sm">
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {analysis.aiSummary}
                            </p>
                          </div>

                          {/* Detected violations and red-flag terms */}
                          <div className="space-y-2.5">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                              Detected Red Flags ({analysis.violations.length})
                            </span>

                            {analysis.violations.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                                {analysis.violations.map((violation, idx) => (
                                  <span
                                    key={idx}
                                    className="red-flag animate-pulse-slow cursor-help"
                                    title={`${violation.category}: ${violation.description}`}
                                  >
                                    {violation.category}: "{violation.word}"
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 p-3 bg-green-50/50 text-green-800 rounded-2xl border border-green-100/50 text-xs">
                                <Check className="h-4 w-4 bg-green-200 text-green-700 rounded-full p-0.5 shrink-0" />
                                <span>No policy restricted words found in local dictionary rules!</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Section - Small and Elegant Recharts Pie Chart */}
                        <div className="md:col-span-5 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-100/80 pt-5 md:pt-0 md:pl-5">
                          <div className="text-center w-full mb-1">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                              Risk Distribution
                            </span>
                          </div>
                          
                          <div className="w-full h-[140px] relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={chartData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={30}
                                  outerRadius={48}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Sparkly Micro legend keys */}
                          <div className="w-full mt-2 flex flex-col gap-1.5 text-[10px] text-gray-500">
                            {chartData.map((entry, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 justify-start px-1.5">
                                <span 
                                  className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse-slow" 
                                  style={{ backgroundColor: chartColors[idx % chartColors.length] }} 
                                />
                                <span className="truncate max-w-[120px] font-medium text-gray-600">
                                  {entry.name}
                                </span>
                                <span className="ml-auto font-mono text-gray-400">
                                  {analysis.violations.length === 0 ? "100%" : `${entry.value}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* AI Compliant Draft Reply Column */}
                <div className="antigravity-card p-6 flex flex-col gap-4 border border-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-black fill-black/10" />
                      <span className="font-display font-semibold text-sm">
                        {analysis.isFreelancerDraft ? "Recommended Safe Draft" : "Recommended Safe Reply"}
                      </span>
                    </div>

                    {/* Copy action Button */}
                    <button
                      onClick={handleCopy}
                      disabled={isStreaming || !analysis.compliantDraft}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all outline-none ${
                        copied 
                          ? "bg-green-500 border-green-500 text-white shadow-premium" 
                          : "bg-[#FAFAFA] border-gray-150 text-gray-600 hover:text-black hover:border-gray-300"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Copied Draft!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>{analysis.isFreelancerDraft ? "Copy Safe Version" : "Copy Response"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Streaming Reply Draft Box with design specifications */}
                  <div className="relative rounded-2xl border border-gray-100/80 bg-[#FAFAFA] p-5 font-sans leading-relaxed text-gray-700 min-h-[140px] flex flex-col justify-between streaming-text">
                    <div>
                      <p className="whitespace-pre-line text-[#1F1F1F] text-sm font-medium">
                        "{streamedReply}"
                        {isStreaming && (
                          <span className="inline-block w-1.5 h-4 bg-[#1967D2] ml-1 animate-pulse" />
                        )}
                      </p>
                    </div>

                    {!isStreaming && (
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200/40 mt-4 text-[10px] text-gray-400">
                        <span>Complies strictly with Fiverr's TOS rules.</span>
                        <span className="flex items-center gap-0.5">
                          Powered by GenAI
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Disclaimer banner */}
                  <div className="flex items-start gap-1.5 text-[10px] text-gray-400 leading-normal bg-gray-55 p-2 rounded-xl">
                    <Info className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>
                      {analysis.isFreelancerDraft 
                        ? "This is an improved, fully policy-compliant version of your message. It maintains your business offering while removing all communication or payment triggers that could suspend your account."
                        : "Copy this reply. It politely shifts the request back onto Fiverr's platform, explaining TOS constraints to keep your conversation secure and retain clients safely."
                      }
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </main>

      {/* 3. Footer Informatives */}
      <footer className="mt-auto pt-12 text-center text-xs text-gray-400 px-6 font-mono">
        <div className="max-w-7xl mx-auto w-full border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; 2026 Fiverr Shield and Security Firewall. All rights registered.
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.fiverr.com/terms_of_service" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              <span>Fiverr Official TOS Docs</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
