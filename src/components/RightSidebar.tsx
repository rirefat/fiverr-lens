import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  BookOpen,
  Video,
  Star,
  Share2,
  CreditCard,
  Check,
  Copy,
  Info,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Cpu,
  Globe,
  BrainCircuit,
  Loader2,
  X,
  HelpCircle,
  Terminal,
  ShieldAlert,
  LayoutTemplate,
  FileText
} from "lucide-react";
import { playbookData } from "../data/playbookData";
import { SafetyAnalysis } from "../types";
import { ComplianceRule } from "../complianceDatabase";
import { AnimatedCounter } from "./AnimatedCounter";
import { TypewriterText } from "./TypewriterText";

interface RightSidebarProps {
  isDark: boolean;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
  activeTab: string;
  sidebarView: "insights" | "playbook";
  setSidebarView: (view: "insights" | "playbook") => void;
  playbookTopic: "payment" | "meeting" | "review" | "assets";
  setPlaybookTopic: (topic: "payment" | "meeting" | "review" | "assets") => void;
  copiedTemplateIdx: string | null;
  handlePlaybookCopy: (text: string, id: string) => void;
  analysisResult: SafetyAnalysis | null;
  activeShields: Record<string, boolean>;
  setActiveShields: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isComposing: boolean;
  composedMessage: string;
  setComposedMessage: (msg: string) => void;
  selectedTone: string;
  getWordCount: (text: string) => number;
  handleCopy: (text: string, type: "inspect" | "compose") => void;
  composeCopied: boolean;
  selectedRule: ComplianceRule | null;
  setSelectedRule: (rule: ComplianceRule | null) => void;
  fullComplianceDatabase: ComplianceRule[];
  inspectCopied: boolean;
  setInspectCopied: (copied: boolean) => void;
  handleTestRuleInInspector: (rule: ComplianceRule) => void;
  messageTemplatesCount: number;
}

/**
 * RightSidebar acts as the diagnostic and metrics visualizer,
 * rendering context-specific content based on the active tab of the workspace.
 * It is structured for optimal clarity, clean aesthetics, and interactive controls.
 */
export function RightSidebar({
  isDark,
  toastMessage,
  setToastMessage,
  activeTab,
  sidebarView,
  setSidebarView,
  playbookTopic,
  setPlaybookTopic,
  copiedTemplateIdx,
  handlePlaybookCopy,
  analysisResult,
  activeShields,
  setActiveShields,
  isComposing,
  composedMessage,
  setComposedMessage,
  selectedTone,
  getWordCount,
  handleCopy,
  composeCopied,
  selectedRule,
  setSelectedRule,
  fullComplianceDatabase,
  inspectCopied,
  setInspectCopied,
  handleTestRuleInInspector,
  messageTemplatesCount,
}: RightSidebarProps) {
  return (
    <div
      className={`w-full md:w-[410px] md:flex-none p-6 md:p-8 flex flex-col justify-between relative md:overflow-y-auto min-h-[500px] md:min-h-0 shrink-0 md:shrink custom-scrollbar ${
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
                        Interactive safe-phrase translations & guidelines
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
                              const isCopied = copiedTemplateIdx === copyId;
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
                                      handlePlaybookCopy(alt.safe, copyId);
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
                                        <span>Copy Safe Translation</span>
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
                        <AnimatedCounter value={analysisResult.safetyScore} />%
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
                            analysisResult.clientMood?.toLowerCase().includes("urgent") ||
                            analysisResult.clientMood?.toLowerCase().includes("stress")
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
                    <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                      TELEMETRY DETAILED ALERTS
                    </span>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {analysisResult.dangerousContent &&
                      analysisResult.dangerousContent.length > 0 ? (
                        <div className="space-y-1.5">
                          {analysisResult.dangerousContent.map((err, idx) => (
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
                          ))}
                        </div>
                      ) : null}

                      {analysisResult.potentialIssues &&
                      analysisResult.potentialIssues.length > 0 ? (
                        <div className="space-y-1.5">
                          {analysisResult.potentialIssues.map((err, idx) => (
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
                          ))}
                        </div>
                      ) : null}

                      {(!analysisResult.dangerousContent ||
                        analysisResult.dangerousContent.length === 0) &&
                      (!analysisResult.potentialIssues ||
                        analysisResult.potentialIssues.length === 0) ? (
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
                    <span className="text-[9px] font-mono font-bold text-zinc-550 dark:text-zinc-400 uppercase">
                      COMMUNICATION PERFORMANCE
                    </span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                      {[
                        {
                          label: "Clarity",
                          score: analysisResult.communicationQualityScore.clarity,
                        },
                        {
                          label: "Professionalism",
                          score: analysisResult.communicationQualityScore.professionalism,
                        },
                        {
                          label: "Persuasion",
                          score: analysisResult.communicationQualityScore.persuasiveness,
                        },
                        {
                          label: "Trust Factor",
                          score: analysisResult.communicationQualityScore.trustworthiness,
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
                        <span className="text-[10px] font-mono font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" /> AI COMPLIANCE ENGINE ACTIVE
                        </span>

                        {/* Real-time automated activities logs */}
                        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[9px] font-mono text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Auto-Scan: Live
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
                          desc: "Blocks ratings/review requests manipulation",
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
                      <BrainCircuit className="h-8 w-8 text-indigo-650 dark:text-indigo-400" />
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
                  <p className="text-xs text-zinc-605 dark:text-zinc-400 mt-3 max-w-[260px] leading-relaxed font-medium">
                    The AI engine is currently structuring, formatting, and refining your communication asset.
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
                          ? "bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border-indigo-500/20"
                          : selectedTone === "Friendly"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            : selectedTone === "Humble"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : selectedTone === "Confident"
                                ? "bg-purple-500/10 text-purple-650 dark:text-purple-400 border-purple-500/20"
                                : selectedTone === "Legal"
                                  ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
                                  : "bg-red-500/10 text-red-650 dark:text-red-400 border-red-500/20";
                      return (
                        <span
                          className={`text-[10px] ${badgeStyle} px-3 py-1 rounded-full border font-black uppercase font-mono shadow-sm`}
                        >
                          {selectedTone}
                        </span>
                      );
                    })()}
                  </div>

                  <div className={`text-[13px] md:text-[14px] font-medium leading-relaxed flex flex-col min-h-0`}>
                    <div className="flex items-center justify-between text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 pb-3 shrink-0 select-none">
                      <span>COGNITIVE SUMMARY STATUS</span>
                      <span>
                        WORDS: {getWordCount(composedMessage)} • CHARS: {composedMessage.length}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 select-text whitespace-pre-line leading-relaxed min-h-[50px] mb-4 text-xs md:text-sm text-zinc-800 dark:text-zinc-200">
                      <TypewriterText text={composedMessage} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50 shrink-0">
                      <button
                        onClick={() => {
                          setComposedMessage("");
                        }}
                        className="px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-[0.96] bg-white/50 hover:bg-white dark:bg-zinc-800/50 dark:hover:bg-zinc-700/80 text-zinc-650 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 backdrop-blur-md"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Clear</span>
                      </button>
                      <button
                        onClick={() => handleCopy(composedMessage, "compose")}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-[0.96] ${
                          composeCopied
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)] border border-emerald-400/50"
                            : isDark
                              ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.1)]"
                              : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.5)] border border-indigo-400/50"
                        }`}
                      >
                        {composeCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Script</span>
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
                    <HelpCircle className="h-4 w-4 text-indigo-500" /> Compliance Safeguards
                  </span>
                  <p className="text-[10.5px] leading-relaxed font-semibold text-zinc-750 dark:text-zinc-450">
                    Our AI writer intercepts dangerous phrases (Skype, personal emails) and replaces them with standard fiverr identifiers:{" "}
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
                  Draft raw user ideas on the left and dispatch the secure builder to generate a polished, highly aligned communication asset.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-500 uppercase relative z-10">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-pulse" /> Standing by for instruction matrix
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
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-40 font-bold"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"></span>
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase text-indigo-500 dark:text-indigo-400 tracking-[0.2em]">
                      Intel Analysis
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50 font-display leading-tight tracking-tight">
                    {selectedRule.phrase.replace(/\s?\(Case\s?#\d+\)/gi, "")}
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
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white/60 border-white/80 shadow-sm"
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
                    <p className="text-[13px] leading-relaxed text-zinc-705 dark:text-zinc-300 font-semibold tracking-tight">
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
                      <p className="pr-10 relative z-10">{selectedRule.rewrite}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedRule.rewrite);
                          setInspectCopied(true);
                          setTimeout(() => setInspectCopied(false), 2000);
                        }}
                        className={`absolute right-3 top-3 p-2.5 rounded-xl transition-all cursor-pointer z-10 ${
                          isDark
                            ? "hover:bg-emerald-500/20 text-emerald-400"
                            : "hover:bg-emerald-200/50 text-emerald-600"
                        }`}
                        title="Copy safe alternative"
                      >
                        {inspectCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex gap-3 shrink-0 relative z-10">
                  <button
                    onClick={() => handleTestRuleInInspector(selectedRule)}
                    className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_8px_25px_rgba(79,70,229,0.4)] hover:-translate-y-0.5"
                  >
                    <Shield className="h-4 w-4" /> Test in Inspector
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
                      isDark ? "bg-white/[0.02] border-white/10" : "bg-white/60 border-white/80 shadow-sm"
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
                      isDark ? "bg-white/[0.02] border-white/10" : "bg-white/60 border-white/80 shadow-sm"
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
                        : "bg-amber-50/80 border-amber-200/60 text-zinc-850"
                    }`}
                  >
                    <Info className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                    <div>
                      <span className="font-extrabold block mb-1 text-[12px] tracking-tight">
                        Deep Inspection
                      </span>
                      <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                        Select any policy vector on the left to reveal its strictness index and view pre-approved safe communication patterns.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-2xl border backdrop-blur-xl flex items-start gap-3 ${
                      isDark
                        ? "bg-rose-500/5 border-rose-500/20 text-zinc-300"
                        : "bg-rose-50/80 border-rose-200/60 text-zinc-850"
                    }`}
                  >
                    <ShieldAlert className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                    <div>
                      <span className="font-extrabold block mb-1 text-[12px] tracking-tight">
                        Zero-Tolerance Bypasses
                      </span>
                      <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                        Attempting to share personal contacts, evade platform fees, or manipulate reviews triggers automated moderation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "templates" && (
          <motion.div
            key="side-templates"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`flex-1 flex flex-col justify-between gap-6 select-text p-6 md:p-8 rounded-[2rem] border relative overflow-hidden transition-all duration-500 ${
              isDark
                ? "bg-white/[0.02] border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
                : "bg-white/40 border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] backdrop-blur-2xl"
            }`}
          >
            {/* Liquid Glass ambient background behind content */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-pink-500/10 blur-3xl -z-10 pointer-events-none" />

            <div className="flex flex-col flex-1 gap-6 min-h-0 relative z-10 justify-center items-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-white/20 mb-4 shadow-xl backdrop-blur-md">
                <LayoutTemplate className="h-8 w-8 text-indigo-500" />
              </div>

              <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                Template Hub
              </h3>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 max-w-[250px] leading-relaxed">
                Use these pre-approved responses to communicate professionally and safely with buyers.
              </p>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent my-4"></div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <div
                  className={`p-4 rounded-2xl border backdrop-blur-xl flex flex-col items-center justify-center gap-2 ${
                    isDark ? "bg-white/[0.03] border-white/10" : "bg-white/60 border-white/80 shadow-sm"
                  }`}
                >
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-display">
                    {messageTemplatesCount}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider text-center">
                    Ready Templates
                  </span>
                </div>
                <div
                  className={`p-4 rounded-2xl border backdrop-blur-xl flex flex-col items-center justify-center gap-2 ${
                    isDark ? "bg-white/[0.03] border-white/10" : "bg-white/60 border-white/80 shadow-sm"
                  }`}
                >
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-display">
                    100%
                  </span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider text-center">
                    ToS Compliant
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimal Status Bar footer */}
      <div className="pt-3 border-t border-zinc-200/10 dark:border-white/5 flex flex-col gap-0.5 font-mono text-[9px] text-zinc-500/80 dark:text-zinc-400/80 select-none">
        <span className="flex items-center gap-1">
          <Terminal className="h-3 w-3 text-indigo-500" /> PERSISTENT_CHANNEL: SECURE
        </span>
        <span>SYSTEMS_LOAD: BALANCED • TOS_SHIELD: 100%</span>
      </div>
    </div>
  );
}
