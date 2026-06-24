import { useState, useEffect } from "react";
import { 
  Shield, Sparkles, Copy, Check, AlertCircle, RefreshCw, 
  BookOpen, CheckCircle2, ChevronRight, HelpCircle, Flame,
  FileText, ArrowRight, Terminal, Network, ShieldCheck,
  Search, Filter, X, ShieldAlert, Info, Activity, Globe, Eye
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
}

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

  // Handle ToS Inspection
  const handleInspect = async (overrideText?: string) => {
    const textToAnalyze = overrideText !== undefined ? overrideText : inspectText;
    if (!textToAnalyze.trim()) return;
    setIsInspecting(true);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/analyze-safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToAnalyze })
      });
      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInspecting(false);
    }
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
      const data = await response.json();
      setComposedMessage(data.generatedMessage);
      setActiveTab("composer");
    } catch (err) {
      console.error(err);
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
      <div className="w-full max-w-5xl z-10 relative flex flex-col items-center justify-center">

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
                    <span className="text-xs font-bold tracking-tight text-zinc-800 dark:text-zinc-200">Fiverr Lens</span>
                    <span className="text-[9px] font-mono font-bold px-1 py-0.5 rounded-sm bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      v2.0
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* macOS Centered Tab Segmented Control */}
            <div className={`flex p-0.75 rounded-xl border ${
              isDark ? "bg-zinc-950/40 border-zinc-800/50" : "bg-zinc-200/40 border-zinc-200/50"
            }`}>
              <button
                onClick={() => setActiveTab("inspector")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-tight transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "inspector" 
                    ? (isDark ? "bg-zinc-800 text-white shadow-sm" : "bg-white text-zinc-900 shadow-sm") 
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                }`}
              >
                <Shield className="h-3.5 w-3.5" /> Inspector
              </button>
              <button
                onClick={() => setActiveTab("composer")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-tight transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "composer" 
                    ? (isDark ? "bg-zinc-800 text-white shadow-sm" : "bg-white text-zinc-900 shadow-sm") 
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" /> AI Writer
              </button>
              <button
                onClick={() => setActiveTab("rules")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-tight transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "rules" 
                    ? (isDark ? "bg-zinc-800 text-white shadow-sm" : "bg-white text-zinc-900 shadow-sm") 
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" /> ToS Rules
              </button>
            </div>

            {/* Top-right System status & Theme Switcher */}
            <div className="flex items-center gap-3">
              {/* Dynamic Connection Indicator */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold select-none ${
                isDark ? "bg-zinc-900/30 border-zinc-800/40" : "bg-zinc-100/40 border-zinc-200/40"
              }`}>
                <div className={`h-1.5 w-1.5 rounded-full ${
                  apiStatus.hasApiKey ? "bg-emerald-500" : "bg-amber-500"
                } status-active-glow`} />
                <span className="text-zinc-500 dark:text-zinc-400">
                  {apiStatus.hasApiKey ? "AI LIVE" : "SANDBOX"}
                </span>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-lg border transition cursor-pointer shadow-3xs ${
                  isDark 
                    ? "bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:text-white" 
                    : "bg-white/40 border-zinc-200 text-zinc-600 hover:text-zinc-900"
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
                        <span className="text-[9px] font-mono font-black uppercase text-indigo-500 tracking-wider">TOS COMPLIANCE PIPELINE</span>
                      </div>
                      <h2 className="text-lg font-black font-display tracking-tight mt-0.5 text-zinc-900 dark:text-zinc-100">
                        Safety Inspector
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-[#A1A1AA] mt-1 font-medium leading-relaxed">
                        Analyze communication scripts for hidden bypasses, external links, rating manipulations, or off-platform leaks.
                      </p>
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                      <div className="relative flex-1 flex flex-col">
                        <textarea
                          value={inspectText}
                          onChange={(e) => setInspectText(e.target.value)}
                          placeholder="Paste your drafted response or pitch here... (e.g. Please send the payment through PayPal so we don't pay 20% fees, or reach me on WhatsApp +1-555...)"
                          className={`w-full flex-1 min-h-[220px] md:min-h-[280px] p-4 text-xs font-semibold leading-relaxed outline-none rounded-2xl transition-all resize-none shadow-inner ${
                            isDark 
                              ? "bg-zinc-950/50 border border-zinc-800/60 focus:border-indigo-500/80 text-zinc-200 placeholder-zinc-600 focus:ring-4 focus:ring-indigo-500/10" 
                              : "bg-white/50 border border-zinc-200/80 focus:border-indigo-500/80 text-zinc-800 placeholder-zinc-400 focus:ring-4 focus:ring-indigo-500/10"
                          }`}
                        />
                        
                        <div className="absolute bottom-3 right-3 flex items-center gap-2 select-none">
                          {inspectText && (
                            <span className="text-[9px] font-mono font-bold text-zinc-400 px-2 py-1 rounded bg-zinc-500/10 backdrop-blur-sm">
                              {getWordCount(inspectText)} words • {inspectText.length} chars
                            </span>
                          )}
                          {inspectText && (
                            <button
                              onClick={() => setInspectText("")}
                              className={`text-[10px] font-mono font-black px-2 py-1 rounded cursor-pointer transition-colors ${
                                isDark 
                                  ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300" 
                                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
                              }`}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

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
                        <span className="text-[9px] font-mono font-black uppercase text-indigo-500 tracking-wider">AI FORMULATION MATRIX</span>
                      </div>
                      <h2 className="text-lg font-black font-display tracking-tight mt-0.5 text-zinc-900 dark:text-zinc-100">
                        Professional AI Writer
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-[#A1A1AA] mt-1 font-medium leading-relaxed">
                        Type crude thoughts or incomplete notes, and generate polished, fully compliant communication replies natively suited for Fiverr.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-mono font-bold uppercase text-zinc-400 block mb-1.5">
                          Rough message intent or keywords
                        </label>
                        <textarea
                          value={rawThoughts}
                          onChange={(e) => setRawThoughts(e.target.value)}
                          placeholder="What do you want to tell the client? (e.g. Thank them for the budget. Tell them we can do a safe video appointment on Fiverr on Monday, but no Skype. Reassure them...)"
                          className={`w-full min-h-[120px] p-4 text-xs font-semibold leading-relaxed outline-none rounded-2xl transition resize-none shadow-inner ${
                            isDark 
                              ? "bg-zinc-950/50 border border-zinc-800/60 focus:border-indigo-500/80 text-zinc-200 placeholder-zinc-600 focus:ring-4 focus:ring-indigo-500/10" 
                              : "bg-white/50 border border-zinc-200/80 focus:border-indigo-500/80 text-zinc-800 placeholder-zinc-400 focus:ring-4 focus:ring-indigo-500/10"
                          }`}
                        />
                      </div>

                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="text-[9px] font-mono font-bold uppercase text-zinc-400 block mb-1.5">
                            Target Output Tone
                          </label>
                          
                          {/* Segmented control for Tone selection */}
                          <div className={`grid grid-cols-2 sm:grid-cols-4 p-1 rounded-xl border ${
                            isDark ? "bg-zinc-950/30 border-zinc-800/50" : "bg-zinc-100/40 border-zinc-200/50"
                          }`}>
                            {[
                              { id: "Professional", label: "💼 Elite Pro" },
                              { id: "Friendly", label: "👋 Warm" },
                              { id: "Humble", label: "🙏 Humble" },
                              { id: "Confident", label: "✨ Confident" }
                            ].map((tone) => (
                              <button
                                key={tone.id}
                                onClick={() => setSelectedTone(tone.id)}
                                className={`py-2 rounded-lg text-[11px] font-extrabold transition-all duration-200 cursor-pointer ${
                                  selectedTone === tone.id 
                                    ? (isDark ? "bg-zinc-800 text-white shadow-3xs" : "bg-white text-zinc-900 shadow-3xs") 
                                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
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
                      <span className="text-[9px] font-mono font-black uppercase text-zinc-400 block">
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
                                : "bg-white/40 border-zinc-200/60 hover:bg-zinc-50/80 text-zinc-700 hover:border-zinc-300 shadow-3xs"
                            }`}
                          >
                            <span className="font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-indigo-500" /> {tpl.title}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium line-clamp-1">
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
                        <span className="text-[9px] font-mono font-black uppercase text-indigo-500 tracking-wider">RULES INTELLIGENCE REGISTRY</span>
                      </div>
                      <h2 className="text-lg font-black font-display tracking-tight mt-0.5 text-zinc-900 dark:text-zinc-100">
                        ToS Directory Browser
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-[#A1A1AA] mt-1 font-medium leading-relaxed">
                        Access and search over {fullComplianceDatabase.length} registered safety blocks, payment boundaries, and prohibited phrase patterns.
                      </p>
                    </div>

                    {/* Search & Filter Toolbar */}
                    <div className="space-y-2 select-none">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search policy index (e.g. WhatsApp, PayPal, academic)..."
                          className={`w-full pl-9 pr-9 py-2 rounded-xl border text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                            isDark 
                              ? "bg-zinc-950/40 border-zinc-800/60 text-zinc-200 placeholder-zinc-500" 
                              : "bg-white/50 border-zinc-200 text-zinc-800 placeholder-zinc-400 shadow-3xs"
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
                          <span className="text-[8px] font-mono font-bold uppercase text-zinc-400">Category Filter</span>
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${
                              isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-white border-zinc-200 text-zinc-700 shadow-3xs"
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
                          <span className="text-[8px] font-mono font-bold uppercase text-zinc-400">Severity Level</span>
                          <select
                            value={selectedSeverity}
                            onChange={(e) => setSelectedSeverity(e.target.value)}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${
                              isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-white border-zinc-200 text-zinc-700 shadow-3xs"
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
                      {fullComplianceDatabase.filter(rule => {
                        const matchesSearch = rule.phrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rule.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rule.explanation.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesCategory = selectedCategory === "All" || rule.category === selectedCategory;
                        const matchesSeverity = selectedSeverity === "All" || rule.severity === selectedSeverity;
                        return matchesSearch && matchesCategory && matchesSeverity;
                      }).length === 0 ? (
                        <div className="py-12 text-center select-none">
                          <ShieldAlert className="h-8 w-8 text-zinc-400 mx-auto opacity-40 mb-3" />
                          <span className="text-xs font-bold text-zinc-400 block font-display">No compliance rules matched</span>
                          <span className="text-[10px] text-zinc-400 block mt-1">Try resetting your search query or filters.</span>
                        </div>
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
                            <button
                              key={rule.id}
                              onClick={() => setSelectedRule(rule)}
                              className={`w-full px-3 py-2.5 rounded-xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-500/10 border-indigo-500/40 dark:bg-indigo-500/15 dark:border-indigo-500/50"
                                  : isDark
                                  ? "bg-zinc-950/20 border-zinc-800/40 hover:bg-zinc-800/30"
                                  : "bg-white/40 border-zinc-200/60 hover:bg-zinc-100/40 shadow-3xs"
                              }`}
                            >
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate font-sans">
                                  {rule.phrase.replace(/\s?\(Case\s?#\d+\)/gi, "")}
                                </span>
                                <span className="text-[9px] text-zinc-400 font-mono font-medium truncate">
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
                            </button>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT COMPONENT COLUMN (Diagnostics / Active status monitor) */}
            <div className={`w-full md:w-[410px] p-6 md:p-8 flex flex-col justify-between ${
              isDark ? "bg-zinc-950/20" : "bg-zinc-50/20"
            }`}>
              
              <AnimatePresence mode="wait">
                {activeTab === "inspector" && (
                  <motion.div
                    key="side-inspector"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between gap-5"
                  >
                    {analysisResult ? (
                      <div className="space-y-5 select-text">
                        {/* High-fidelity circular dial */}
                        <div className="flex items-center gap-4 border-b border-zinc-200/10 dark:border-white/5 pb-4">
                          <div className="relative h-14 w-14 shrink-0 flex items-center justify-center select-none">
                            <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                className={`${isDark ? "stroke-zinc-800/80" : "stroke-zinc-200/80"} fill-none`}
                                strokeWidth="3"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className={`fill-none transition-all duration-1000 ${
                                  analysisResult.safetyScore > 80 
                                    ? "stroke-emerald-500 shadow-glow-safe" 
                                    : analysisResult.safetyScore > 50 
                                    ? "stroke-amber-500 shadow-glow-caution" 
                                    : "stroke-red-500 shadow-glow-danger"
                                }`}
                                strokeDasharray={`${analysisResult.safetyScore}, 100`}
                                strokeWidth="3"
                                strokeLinecap="round"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <span className="text-[11px] font-mono font-black text-zinc-900 dark:text-zinc-100">
                              {analysisResult.safetyScore}%
                            </span>
                          </div>

                          <div>
                            <span className="text-[9px] font-mono font-bold uppercase text-zinc-400 block">TOS VERDICT INDEX</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <h3 className={`text-xs font-black font-display tracking-tight ${
                                analysisResult.riskLevel === "Safe" 
                                  ? "text-emerald-500" 
                                  : analysisResult.riskLevel === "Warning" 
                                  ? "text-amber-500" 
                                  : "text-red-500"
                              }`}>
                                {analysisResult.riskLevel === "Safe" ? "Pristine Status" : analysisResult.riskLevel === "Warning" ? "Warning Alert" : "Severe Violations"}
                              </h3>
                              {analysisResult.riskLevel === "Safe" && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-medium">
                              Estimated Mood: <span className="font-bold text-indigo-400">{analysisResult.clientMood || "Neutral"}</span>
                            </span>
                          </div>
                        </div>

                        {/* Detailed Alerts */}
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                          {analysisResult.dangerousContent && analysisResult.dangerousContent.length > 0 ? (
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono font-bold text-red-500 uppercase tracking-wider block">Critical Breaches</span>
                              <div className="space-y-1">
                                {analysisResult.dangerousContent.map((err, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-[10.5px] text-red-600 dark:text-red-300 font-semibold bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-red-500" />
                                    <span>{err}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {analysisResult.potentialIssues && analysisResult.potentialIssues.length > 0 ? (
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-wider block">Quality Flag Warnings</span>
                              <div className="space-y-1">
                                {analysisResult.potentialIssues.map((err, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-[10.5px] text-amber-600 dark:text-[#FBBF24] font-semibold bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                                    <span>{err}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {(!analysisResult.dangerousContent || analysisResult.dangerousContent.length === 0) &&
                           (!analysisResult.potentialIssues || analysisResult.potentialIssues.length === 0) ? (
                            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-600 dark:text-emerald-400 flex flex-col gap-1 select-none">
                              <span className="font-extrabold flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5" /> Approved Script Draft
                              </span>
                              <p className="text-[10px] leading-relaxed opacity-90 font-medium">
                                Clean, platform-compliant script. No contact requests or off-platform payment redirection signals triggered.
                              </p>
                            </div>
                          ) : null}

                          {/* Highlight visualization */}
                          {analysisResult.highlightedMessage && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">Interactive Risk Highlight</span>
                              <div 
                                className={`text-[11px] p-3 rounded-lg border leading-relaxed ${
                                  isDark ? "bg-zinc-950/40 border-zinc-800/40 text-zinc-300" : "bg-white border-zinc-200/60 text-zinc-600"
                                }`}
                                dangerouslySetInnerHTML={{ __html: analysisResult.highlightedMessage }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Interactive Communication Metric Bars */}
                        {analysisResult.communicationQualityScore && (
                          <div className="space-y-2 border-t border-zinc-200/10 dark:border-white/5 pt-3 select-none">
                            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">COMMUNICATION PERFORMANCE</span>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                              {[
                                { label: "Clarity", score: analysisResult.communicationQualityScore.clarity },
                                { label: "Professionalism", score: analysisResult.communicationQualityScore.professionalism },
                                { label: "Persuasion", score: analysisResult.communicationQualityScore.persuasiveness },
                                { label: "Trust Factor", score: analysisResult.communicationQualityScore.trustworthiness }
                              ].map((metric) => (
                                <div key={metric.label} className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                                    <span>{metric.label}</span>
                                    <span>{metric.score}/10</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-indigo-500 rounded-full transition-all duration-700" 
                                      style={{ width: `${metric.score * 10}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Compliant Output View */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">RECOMMENDED POLISHED VERSION</span>
                          <div className={`p-3.5 rounded-xl border text-[11px] leading-relaxed font-semibold relative ${
                            isDark ? "bg-zinc-950/50 border-zinc-800/60 text-zinc-200" : "bg-white border-zinc-200/80 text-zinc-800 shadow-3xs"
                          }`}>
                            <p className="whitespace-pre-line pr-4 select-text">
                              {analysisResult.correctedMessage}
                            </p>
                            <div className="flex justify-end mt-3">
                              <button
                                onClick={() => handleCopy(analysisResult.correctedMessage, "inspect")}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                                  inspectCopied 
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-3xs"
                                }`}
                              >
                                {inspectCopied ? (
                                  <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Copied</span>
                                ) : (
                                  <span className="flex items-center gap-1"><Copy className="h-3.5 w-3.5" /> Copy Clean Response</span>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* High-end System Status Monitor dashboard (Idle State) */
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="border-b border-zinc-200/10 dark:border-white/5 pb-3 select-none">
                            <span className="text-[9px] font-mono font-black uppercase text-indigo-500 tracking-wider">LENS COGNITIVE MONITOR</span>
                            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 font-display mt-0.5">
                              Safety Systems Active
                            </h3>
                          </div>

                          {/* Dynamic SVG Animated Wave/Radar */}
                          <div className={`h-20 rounded-xl border flex items-center justify-center relative overflow-hidden select-none ${
                            isDark ? "bg-zinc-950/40 border-zinc-800/40" : "bg-white/40 border-zinc-200/60 shadow-3xs"
                          }`}>
                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                              <Globe className="h-32 w-32 animate-spin" style={{ animationDuration: "20s" }} />
                            </div>
                            <div className="flex flex-col items-center gap-1 z-10">
                              <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                                Real-time Guard active
                              </span>
                              <span className="text-[9px] text-zinc-400 font-mono">SCANNERS RECONSTRUCTING COGNITION</span>
                            </div>
                          </div>

                          {/* Visual Guard Checklist */}
                          <div className="space-y-1.5 select-none">
                            <span className="text-[9px] font-mono font-bold uppercase text-zinc-400 block">DURABLE CLOUD COMPLIANCE CHECKLIST</span>
                            {[
                              { label: "Off-Platform Guard Line", status: "ONLINE", desc: "Monitors Skype, WhatsApp, email, social tags" },
                              { label: "Payment Circumvention", status: "ONLINE", desc: "Flags PayPal, CashApp, Venmo, Direct invoices" },
                              { label: "Review Coercion Blocker", status: "ONLINE", desc: "Audits requests for forced 5-star ratings" },
                              { label: "Academic Cheating Detector", status: "ONLINE", desc: "Blocks school homeworks and exam scripts" }
                            ].map((shield) => (
                              <div key={shield.label} className={`p-2 rounded-lg border flex items-center justify-between text-[11px] font-bold ${
                                isDark ? "bg-zinc-900/10 border-zinc-800/40" : "bg-white/20 border-zinc-200/40"
                              }`}>
                                <div>
                                  <span className="text-zinc-800 dark:text-zinc-200 block leading-tight">{shield.label}</span>
                                  <span className="text-[9px] text-zinc-400 font-medium">{shield.desc}</span>
                                </div>
                                <span className="text-[9px] font-mono font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                  {shield.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 select-none text-center p-3">
                          <p className="text-[10.5px] text-zinc-400 font-medium leading-relaxed">
                            Draft a client pitch in the textarea editor on the left column and click analyze to run compliance evaluations.
                          </p>
                        </div>
                      </div>
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
                            <span className="text-[9px] font-mono font-black uppercase text-indigo-500 tracking-wider">AI OUTPUT MATRIX</span>
                            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 font-display mt-0.5">
                              Structured Draft Output
                            </h3>
                          </div>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 font-black uppercase font-mono">
                            {selectedTone}
                          </span>
                        </div>

                        <div className={`p-4 rounded-xl border text-[11px] font-medium leading-relaxed relative ${
                          isDark ? "bg-zinc-950/50 border-zinc-800/60 text-zinc-200" : "bg-white border-zinc-200 text-zinc-800 shadow-3xs"
                        }`}>
                          <p className="whitespace-pre-line pr-4 select-text">
                            {composedMessage}
                          </p>
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
                          isDark ? "bg-zinc-900/10 border-zinc-800/40 text-zinc-400" : "bg-zinc-500/5 border-zinc-200 text-zinc-500 shadow-3xs"
                        }`}>
                          <span className="font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <HelpCircle className="h-3.5 w-3.5 text-indigo-500" /> Compliance Safeguards
                          </span>
                          <p className="text-[10px] leading-normal font-medium">
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
                        <p className="text-[10.5px] text-zinc-400 mt-1 max-w-[220px] leading-relaxed font-medium">
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
                        <div className="bg-zinc-500/5 p-2.5 rounded-xl border border-zinc-500/10 select-none">
                          <div className="flex justify-between items-center mb-1 text-[9px] font-mono font-bold text-zinc-400">
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
                          <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase select-none">Policy Background</span>
                          <p className="text-[10.5px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
                            {selectedRule.explanation}
                          </p>
                        </div>

                        {/* Rewrite Suggestion */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase select-none font-sans">Compliant Alternative</span>
                          <div className={`p-3 rounded-xl border text-[10.5px] font-semibold leading-relaxed relative ${
                            isDark ? "bg-zinc-950/60 border-zinc-800 text-emerald-400" : "bg-emerald-50/40 border-emerald-100/60 text-emerald-800 shadow-3xs"
                          }`}>
                            <p className="pr-7">{selectedRule.rewrite}</p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedRule.rewrite);
                                setInspectCopied(true);
                                setTimeout(() => setInspectCopied(false), 2000);
                              }}
                              className="absolute right-2 top-2 p-1 rounded hover:bg-emerald-500/10 text-emerald-500 cursor-pointer"
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
                              isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
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
                          <span className="text-[9px] font-mono font-bold uppercase text-indigo-500 tracking-wider">DATABASE INTEL SUMMARY</span>
                          <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 font-display mt-0.5">
                            ToS Engine Directory
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center select-none">
                          <div className={`p-2.5 rounded-xl border ${
                            isDark ? "bg-zinc-950/30 border-zinc-800/40" : "bg-white border-zinc-200/60 shadow-3xs"
                          }`}>
                            <span className="text-[10px] text-zinc-400 font-bold block">Indexed Rules</span>
                            <span className="text-base font-black text-indigo-500 font-display block mt-0.5">
                              {fullComplianceDatabase.length}
                            </span>
                          </div>
                          <div className={`p-2.5 rounded-xl border ${
                            isDark ? "bg-zinc-950/30 border-zinc-800/40" : "bg-white border-zinc-200/60 shadow-3xs"
                          }`}>
                            <span className="text-[10px] text-zinc-400 font-bold block">TOS Class Channels</span>
                            <span className="text-base font-black text-emerald-500 font-display block mt-0.5">
                              9 Categories
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3 select-none">
                          <span className="text-[9px] font-mono font-bold uppercase text-zinc-400 block">Proactive Safety Guides</span>

                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5">
                            <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-extrabold block mb-0.5 text-zinc-900 dark:text-zinc-100 text-[11px]">Rule Analysis Lookup</span>
                              <p className="text-[10px] leading-relaxed opacity-90">
                                Click on any policy rule in the directory browser list to review the strictness index, detection rationale, and safe alternatives.
                              </p>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5">
                            <ShieldAlert className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-extrabold block mb-0.5 text-zinc-900 dark:text-zinc-100 text-[11px]">Direct Evasion Controls</span>
                              <p className="text-[10px] leading-relaxed opacity-90">
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
              <div className="pt-3 border-t border-zinc-200/10 dark:border-white/5 flex flex-col gap-0.5 font-mono text-[9px] text-zinc-400/80 select-none">
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
        <p className="text-[9px] font-mono text-zinc-400/80 mt-5 select-none uppercase tracking-widest text-center">
          Crafted for Freelance Care • Glassmorphism Design • Antigravity 2026
        </p>

      </div>
    </div>
  );
}
