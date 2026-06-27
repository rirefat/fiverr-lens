import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Trash2, 
  Copy, 
  Check, 
  Undo2, 
  Redo2, 
  History, 
  Activity, 
  PieChart, 
  X, 
  Sparkles, 
  ShieldAlert, 
  AlertCircle, 
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { SafetyAnalysis, InspectorVersion } from "../types";
import { runLocalAnalysis, getSegments, getDisguisedForms } from "../lib/complianceUtils";
import { AnimatedCounter } from "./AnimatedCounter";

interface TabInspectorProps {
  isDark: boolean;
  inspectText: string;
  setInspectText: (text: string) => void;
  handleInspect: (text?: string) => void;
  isInspecting: boolean;
  analysisResult: SafetyAnalysis | null;
  setAnalysisResult: (res: SafetyAnalysis | null) => void;
  inspectorViewMode: "edit" | "highlight" | "heatmap";
  setInspectorViewMode: (mode: "edit" | "highlight" | "heatmap") => void;
  inspectCopied: boolean;
  handleCopy: (text: string, type: "inspect" | "composed") => void;
  undoStack: string[];
  redoStack: string[];
  handleUndo: () => void;
  handleRedo: () => void;
  showVersionDropdown: boolean;
  setShowVersionDropdown: (show: boolean) => void;
  inspectVersions: InspectorVersion[];
  restoreVersion: (version: InspectorVersion) => void;
  formatVersionTime: (ts: number) => string;
  getWordCount: (text: string) => number;
  pushToUndoStack: (text: string) => void;
  fixSingleSegment: (idx: number, customReplacement?: string) => void;
  fixAllSegments: () => void;
  fixStrategy: "safe" | "compound" | "dotted" | "hyphenated" | "spaced";
  setFixStrategy: (strat: "safe" | "compound" | "dotted" | "hyphenated" | "spaced") => void;
  mainTextareaRef: React.RefObject<HTMLTextAreaElement>;
}

/**
 * TabInspector displays the primary draft text editor, live safety violations highlighter,
 * and sentence-by-sentence risk heatmapping system.
 */
export function TabInspector({
  isDark,
  inspectText,
  setInspectText,
  handleInspect,
  isInspecting,
  analysisResult,
  setAnalysisResult,
  inspectorViewMode,
  setInspectorViewMode,
  inspectCopied,
  handleCopy,
  undoStack,
  redoStack,
  handleUndo,
  handleRedo,
  showVersionDropdown,
  setShowVersionDropdown,
  inspectVersions,
  restoreVersion,
  formatVersionTime,
  getWordCount,
  pushToUndoStack,
  fixSingleSegment,
  fixAllSegments,
  fixStrategy,
  setFixStrategy,
  mainTextareaRef,
}: TabInspectorProps) {
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState<number | null>(null);
  const [activeHeatmapIdx, setActiveHeatmapIdx] = useState<number | null>(null);

  const fuzzyRestructureBlock = (blockText: string, matches: any[]) => {
    let restructured = blockText;
    matches.forEach((match) => {
      if (match.rule && match.rule.rewrite) {
        const fuzzyPattern = match.text
          .split("")
          .map((char: string) => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("[\\s\\.\\-]*");

        try {
          const hasWordChars = /\w/.test(match.text);
          const regexStr = hasWordChars ? `\\b${fuzzyPattern}\\b` : fuzzyPattern;
          const regex = new RegExp(regexStr, "gi");
          restructured = restructured.replace(regex, match.rule.rewrite);
        } catch (e) {
          restructured = restructured.replace(match.text, match.rule.rewrite);
        }
      }
    });

    if (restructured !== blockText && inspectText.includes(blockText)) {
      if (inspectText !== restructured) {
        const newText = inspectText.replace(blockText, restructured);
        setInspectText(newText);
        handleInspect(newText);
      }
    }
  };

  return (
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
          Analyze communication scripts for hidden bypasses, external links, rating manipulations, or off-platform leaks.
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
                (analysisResult.matchedRules?.length || 0) > 0 && (
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
                <AnimatedCounter value={analysisResult.safetyScore} />
                %
              </span>
            </div>
          )}
        </div>

        <div className="relative flex-1 min-h-[250px] md:min-h-[320px] w-full flex flex-col">
          {/* Scan Loader Overlay */}
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

                <div className="relative h-24 w-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-pulse-ring" />
                  <div className="absolute -inset-2 rounded-full border border-indigo-400/10 animate-pulse-ring [animation-delay:1s]" />
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/30 animate-spin-slow" />
                  <div
                    className="absolute inset-2 rounded-full border-2 border-t-indigo-400 border-r-transparent border-b-indigo-400 border-l-transparent animate-spin"
                    style={{ animationDuration: "1.5s" }}
                  />
                  <div className="relative h-10 w-10 rounded-full bg-indigo-500/15 flex items-center justify-center border border-indigo-500/30 shadow-inner">
                    <Shield className="h-5 w-5 text-indigo-400 animate-pulse" />
                  </div>
                </div>

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
              ref={mainTextareaRef}
              value={inspectText}
              maxLength={2500}
              onChange={(e) => {
                const val = e.target.value;
                setInspectText(val);
                if (!val) {
                  setAnalysisResult(null);
                } else {
                  setAnalysisResult(runLocalAnalysis(val));
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
                      analysisResult.matchedRules || []
                    );
                    return segments.map((seg, idx) => {
                      if (!seg.isMatch) {
                        return (
                          <span key={idx} className="whitespace-pre-wrap">
                            {seg.text}
                          </span>
                        );
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
                    const sentences = inspectText.match(/[^.!?\n]+[.!?\n]*(\s+|$)/g) || [inspectText];
                    const heatmapItems = sentences
                      .filter((s) => s.trim().length > 0)
                      .map((sentence, index) => {
                        const sentenceSegments = getSegments(sentence, analysisResult.matchedRules || []);
                        const sentenceMatches = sentenceSegments.filter((seg) => seg.isMatch && seg.rule);
                        let crit = 0, high = 0, med = 0, low = 0, score = 0;
                        sentenceMatches.forEach((m) => {
                          if (m.rule?.severity === "Critical Risk") {
                            crit++; score += 25;
                          } else if (m.rule?.severity === "High Risk") {
                            high++; score += 15;
                          } else if (m.rule?.severity === "Medium Risk") {
                            med++; score += 8;
                          } else if (m.rule?.severity === "Low Risk") {
                            low++; score += 3;
                          }
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
                          badgeColor = "bg-amber-500/20 text-amber-600 dark:text-amber-455";
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

                    const totalWords = getWordCount(inspectText);
                    const flaggedWords = heatmapItems.reduce(
                      (acc, item) => acc + item.matches.reduce((mAcc, m) => mAcc + getWordCount(m.text), 0),
                      0
                    );
                    const safeWords = Math.max(0, totalWords - flaggedWords);
                    const safeRatio = totalWords > 0 ? (safeWords / totalWords) * 100 : 100;

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
                      <div className="space-y-5">
                        {/* Enhanced Thermal Status Widget */}
                        <div className="relative overflow-hidden rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm p-4 group">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-transparent pointer-events-none" />
                          <div
                            className={`absolute -right-20 -top-20 w-40 h-40 blur-3xl opacity-20 dark:opacity-30 rounded-full ${
                              totalCrit > 0 || totalHigh > 1
                                ? "bg-red-500"
                                : totalHigh > 0 || totalMed > 1
                                  ? "bg-orange-500"
                                  : totalMed > 0 || totalLow > 1
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                            } pointer-events-none transition-colors duration-1000`}
                          />

                          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-black tracking-widest uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                                <Activity className="h-3.5 w-3.5" />
                                Thermal Index Status
                              </span>
                              <span className={`text-sm sm:text-base font-black tracking-tight flex items-center gap-2 ${thermalStatusColor.split(" ")[0]}`}>
                                {thermalStatus}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {[
                                { count: totalCrit, label: "Critical", color: "red" },
                                { count: totalHigh, label: "High", color: "rose" },
                                { count: totalMed, label: "Med", color: "amber" },
                                { count: totalLow, label: "Low", color: "blue" },
                              ].map(
                                (stat, i) =>
                                  stat.count > 0 && (
                                    <div
                                      key={i}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border backdrop-blur-md shadow-sm transition-transform hover:scale-105
                                      ${stat.color === "red" ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" : ""}
                                      ${stat.color === "rose" ? "bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-500/20" : ""}
                                      ${stat.color === "amber" ? "bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/20" : ""}
                                      ${stat.color === "blue" ? "bg-blue-500/10 text-blue-600 dark:text-blue-450 border-blue-500/20" : ""}
                                    `}
                                    >
                                      <span className={`h-1.5 w-1.5 rounded-full ${stat.color === "red" ? "bg-red-500" : stat.color === "rose" ? "bg-rose-500" : stat.color === "amber" ? "bg-amber-500" : "bg-blue-500"} animate-pulse`} />
                                      {stat.count} {stat.label}
                                    </div>
                                  )
                              )}
                              {totalCrit === 0 && totalHigh === 0 && totalMed === 0 && totalLow === 0 && (
                                <div className="px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  All Clear
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Creative Safety Ratio Bar */}
                        <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm relative overflow-hidden group">
                          <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-500">
                                <PieChart className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                                Safety-to-Risk Ratio
                              </span>
                            </div>
                            <div className="text-[10px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                              {safeWords} Safe / {flaggedWords} Flagged
                            </div>
                          </div>

                          <div className="relative h-3.5 w-full rounded-full overflow-hidden bg-zinc-200/50 dark:bg-zinc-800/50 shadow-inner flex mb-2 z-10 p-0.5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${safeRatio}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)] relative overflow-hidden"
                            >
                              <div className="absolute top-0 inset-x-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                            </motion.div>

                            {safeRatio < 100 && (
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${100 - safeRatio}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-500 dark:from-red-500 dark:to-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] ml-0.5 relative overflow-hidden"
                              >
                                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InBhdHRlcm4iIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0tMSwxIGwyLC0yIE0wLDQgbDQsLTQgTTMsNSBsMiwtMiIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')] mix-blend-overlay" />
                              </motion.div>
                            )}
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-bold relative z-10 px-1">
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {safeRatio.toFixed(1)}% Compliant
                            </div>
                            {safeRatio < 100 && (
                              <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                                {(100 - safeRatio).toFixed(1)}% Flagged
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive Timeline Heatmap */}
                        <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black tracking-widest uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                              <Activity className="h-3.5 w-3.5" />
                              Chronological Heatmap
                            </span>
                            <span className="text-[10px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                              {heatmapItems.length} Segment{heatmapItems.length === 1 ? "" : "s"}
                            </span>
                          </div>

                          <div className="relative">
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 rounded-full" />
                            <div className="flex h-8 w-full gap-1.5 rounded-xl overflow-x-auto hide-scrollbar relative z-10 px-0.5 items-center">
                              {heatmapItems.map((item, idx) => {
                                const isActive = activeHeatmapIdx === idx;
                                let color = "bg-emerald-400/80 dark:bg-emerald-500/80 hover:bg-emerald-400 border-emerald-500/30";
                                let glow = "shadow-[0_0_8px_rgba(52,211,153,0)]";

                                if (item.crit > 0) {
                                  color = "bg-red-500/90 dark:bg-red-500/90 hover:bg-red-400 border-red-500/50";
                                  glow = isActive ? "shadow-[0_0_12px_rgba(239,68,68,0.6)]" : "hover:shadow-[0_0_8px_rgba(239,68,68,0.4)]";
                                } else if (item.high > 0) {
                                  color = "bg-rose-500/90 dark:bg-rose-500/90 hover:bg-rose-400 border-rose-500/50";
                                  glow = isActive ? "shadow-[0_0_12px_rgba(244,63,94,0.6)]" : "hover:shadow-[0_0_8px_rgba(244,63,94,0.4)]";
                                } else if (item.med > 0) {
                                  color = "bg-amber-500/90 dark:bg-amber-500/90 hover:bg-amber-400 border-amber-500/50";
                                  glow = isActive ? "shadow-[0_0_12px_rgba(245,158,11,0.6)]" : "hover:shadow-[0_0_8px_rgba(245,158,11,0.4)]";
                                } else if (item.low > 0) {
                                  color = "bg-blue-500/90 dark:bg-blue-500/90 hover:bg-blue-400 border-blue-500/50";
                                  glow = isActive ? "shadow-[0_0_12px_rgba(59,130,246,0.6)]" : "hover:shadow-[0_0_8px_rgba(59,130,246,0.4)]";
                                }

                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveHeatmapIdx(isActive ? null : idx)}
                                    className={`flex-1 h-5 rounded-full transition-all duration-300 cursor-pointer relative border backdrop-blur-sm ${color} ${glow} ${
                                      isActive
                                        ? "h-8 ring-2 ring-indigo-500 dark:ring-indigo-400 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-950 scale-100 z-20"
                                        : "scale-y-100 hover:scale-y-125 z-10"
                                    }`}
                                    title={`Segment #${idx + 1}: ${item.maxSeverityLabel} (Risk Score: ${item.score})`}
                                  >
                                    {isActive && (
                                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500 border border-white dark:border-zinc-900" />
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-mono font-medium text-zinc-400 dark:text-zinc-500 px-1">
                            <div className="flex items-center gap-1">
                              <span className="text-[12px]">⇤</span> Start
                            </div>
                            <div className="flex items-center gap-1">
                              End <span className="text-[12px]">⇥</span>
                            </div>
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
                                      if (!seg.isMatch) {
                                        return <span key={sIdx}>{seg.text}</span>;
                                      }
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
                                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                      <div className="flex items-center gap-1.5">
                                        <ShieldAlert className="h-4 w-4 text-indigo-500" />
                                        <span className="text-[11px] font-black tracking-wider uppercase text-zinc-800 dark:text-zinc-200">
                                          Flagged Triggers Breakdown
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          fuzzyRestructureBlock(item.text, item.matches);
                                        }}
                                        className="px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                                      >
                                        <Sparkles className="h-3 w-3" />
                                        Smart Suggest
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                      {item.matches.map((match, mIdx) => {
                                        if (!match.rule) return null;
                                        return (
                                          <div
                                            key={mIdx}
                                            className="relative overflow-hidden p-4 rounded-xl bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md hover:border-indigo-500/30 dark:hover:border-indigo-400/30 group"
                                          >
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                            <div className="relative z-10 flex flex-col gap-3">
                                              <div className="flex items-center justify-between gap-3 flex-wrap">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md border border-indigo-500/20">
                                                    "{match.text}"
                                                  </span>
                                                  <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                                                    {match.rule.category}
                                                  </span>
                                                </div>
                                                <span
                                                  className={`text-[9px] font-black font-mono uppercase px-2 py-0.5 rounded-full ${
                                                    match.rule.severity === "Critical Risk"
                                                      ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20"
                                                      : match.rule.severity === "High Risk"
                                                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                                        : match.rule.severity === "Medium Risk"
                                                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                                          : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                                  }`}
                                                >
                                                  {match.rule.severity}
                                                </span>
                                              </div>

                                              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                                                <span className="font-bold text-zinc-800 dark:text-zinc-100 mr-1">
                                                  ToS Risk:
                                                </span>
                                                {match.rule.explanation}
                                              </p>

                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 mt-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
                                                <div className="flex items-center justify-between gap-2 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
                                                  <span className="truncate max-w-[120px] text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                                    "{match.rule.rewrite}"
                                                  </span>
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      const sSegs = getSegments(item.text, analysisResult.matchedRules || []);
                                                      let matchCount = 0;
                                                      let sIdx = -1;
                                                      for (let i = 0; i < sSegs.length; i++) {
                                                        if (sSegs[i].isMatch && sSegs[i].rule) {
                                                          if (matchCount === mIdx) {
                                                            sIdx = i;
                                                            break;
                                                          }
                                                          matchCount++;
                                                        }
                                                      }
                                                      if (sIdx !== -1) {
                                                        let sentenceStartChar = 0;
                                                        for (let i = 0; i < item.index; i++) {
                                                          sentenceStartChar += sentences[i].length;
                                                        }
                                                        let matchStartInSentence = 0;
                                                        for (let i = 0; i < sIdx; i++) {
                                                          matchStartInSentence += sSegs[i].text.length;
                                                        }
                                                        const absoluteMatchStart = sentenceStartChar + matchStartInSentence;

                                                        const globSegments = getSegments(inspectText, analysisResult.matchedRules || []);
                                                        let globCharOffset = 0;
                                                        let matchIdx = -1;
                                                        for (let g = 0; g < globSegments.length; g++) {
                                                          if (globCharOffset === absoluteMatchStart) {
                                                            matchIdx = g;
                                                            break;
                                                          }
                                                          globCharOffset += globSegments[g].text.length;
                                                        }

                                                        if (matchIdx !== -1) {
                                                          fixSingleSegment(matchIdx, match.rule?.rewrite);
                                                        }
                                                      }
                                                    }}
                                                    className="px-2.5 py-1 text-[9px] bg-emerald-500 hover:bg-emerald-600 text-white rounded-md font-bold transition-colors cursor-pointer shadow-sm active:scale-95"
                                                  >
                                                    Apply Safe
                                                  </button>
                                                </div>

                                                <div className="flex items-center justify-between gap-2 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 p-2 rounded-lg">
                                                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                                                    Test Evasion:
                                                  </span>
                                                  <div className="flex gap-1.5">
                                                    {getDisguisedForms(match.text)
                                                      .slice(1, 4)
                                                      .map((form, formIdx) => {
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
                                                              const sSegs = getSegments(item.text, analysisResult.matchedRules || []);
                                                              let matchCount = 0;
                                                              let sIdx = -1;
                                                              for (let i = 0; i < sSegs.length; i++) {
                                                                if (sSegs[i].isMatch && sSegs[i].rule) {
                                                                  if (matchCount === mIdx) {
                                                                    sIdx = i;
                                                                    break;
                                                                  }
                                                                  matchCount++;
                                                                }
                                                              }
                                                              if (sIdx !== -1) {
                                                                let sentenceStartChar = 0;
                                                                for (let i = 0; i < item.index; i++) {
                                                                  sentenceStartChar += sentences[i].length;
                                                                }
                                                                let matchStartInSentence = 0;
                                                                for (let i = 0; i < sIdx; i++) {
                                                                  matchStartInSentence += sSegs[i].text.length;
                                                                }
                                                                const absoluteMatchStart = sentenceStartChar + matchStartInSentence;

                                                                const globSegments = getSegments(inspectText, analysisResult.matchedRules || []);
                                                                let globCharOffset = 0;
                                                                let matchIdx = -1;
                                                                for (let g = 0; g < globSegments.length; g++) {
                                                                  if (globCharOffset === absoluteMatchStart) {
                                                                    matchIdx = g;
                                                                    break;
                                                                  }
                                                                  globCharOffset += globSegments[g].text.length;
                                                                }

                                                                if (matchIdx !== -1) {
                                                                  fixSingleSegment(matchIdx, form.value);
                                                                }
                                                              }
                                                            }}
                                                            className="px-2 py-1 text-[9px] bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-md font-bold transition-colors cursor-pointer active:scale-95"
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
                onClick={() => handleCopy(inspectText, "inspect")}
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

              <span className={`h-4.5 w-[1px] ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />

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

              <span className={`h-4.5 w-[1px] ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />

              {/* Version History Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                  className={`p-1.5 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer ${
                    isDark
                      ? showVersionDropdown
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : "hover:bg-zinc-800 text-zinc-300 border border-transparent hover:border-zinc-700/50"
                      : showVersionDropdown
                        ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                        : "hover:bg-zinc-100 text-zinc-650 border border-transparent hover:border-zinc-200/60"
                  }`}
                  title="Draft version history"
                >
                  <History className="h-3.5 w-3.5" />
                </button>

                <AnimatePresence>
                  {showVersionDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className={`absolute bottom-full right-0 mb-2.5 w-64 rounded-xl border p-2.5 shadow-xl backdrop-blur-lg z-50 flex flex-col gap-1.5 ${
                        isDark
                          ? "bg-zinc-950/95 border-zinc-800 text-zinc-200 shadow-black/80"
                          : "bg-white/95 border-zinc-200 text-zinc-900 shadow-zinc-300/40"
                      }`}
                    >
                      <div className="flex items-center justify-between px-1 pb-1 border-b border-zinc-200/50 dark:border-zinc-800/50 select-none">
                        <span className="text-[10px] font-mono font-black uppercase text-indigo-650 dark:text-indigo-400 flex items-center gap-1">
                          <History className="h-3 w-3" /> Version History
                        </span>
                        <span className="text-[8px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-550">
                          Last 5 edits
                        </span>
                      </div>

                      <div className="max-h-[180px] overflow-y-auto flex flex-col gap-1 hide-scrollbar">
                        {inspectVersions.length === 0 ? (
                          <p className="text-[10px] text-zinc-500 italic p-3 text-center select-none">
                            No saved versions yet. Keep typing to auto-save!
                          </p>
                        ) : (
                          inspectVersions.map((version, vIdx) => {
                            const isActive = version.text.trim() === inspectText.trim();
                            return (
                              <button
                                key={version.id}
                                type="button"
                                onClick={() => restoreVersion(version)}
                                disabled={isActive}
                                className={`w-full text-left p-2 rounded-lg transition-all duration-200 flex flex-col gap-0.5 border cursor-pointer select-none ${
                                  isActive
                                    ? isDark
                                      ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-300 cursor-default"
                                      : "bg-indigo-50 border-indigo-100 text-indigo-700 cursor-default"
                                    : isDark
                                      ? "bg-transparent border-transparent hover:bg-zinc-900 hover:border-zinc-800 text-zinc-300"
                                      : "bg-transparent border-transparent hover:bg-zinc-50 hover:border-zinc-250 text-zinc-700"
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-[9px] font-bold font-mono uppercase tracking-wide opacity-80 flex items-center gap-1">
                                    {vIdx === 0 ? "Latest Draft" : `Version ${inspectVersions.length - vIdx}`}
                                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />}
                                  </span>
                                  <span className="text-[8px] font-mono opacity-50">
                                    {formatVersionTime(version.timestamp)}
                                  </span>
                                </div>
                                <p className="text-[10px] font-medium truncate w-full opacity-90">
                                  {version.text.trim()}
                                </p>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <span className={`h-4.5 w-[1px] ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />

              <div
                className={`px-2.5 py-1.5 text-[9px] font-mono font-bold flex items-center gap-1.5 rounded-lg border ${
                  isDark
                    ? "bg-zinc-950/40 border-zinc-900 text-zinc-400"
                    : "bg-zinc-100/50 border-zinc-200/30 text-zinc-650"
                }`}
              >
                <span>
                  {getWordCount(inspectText)} <span className="opacity-45">words</span>
                </span>
                <span className={`h-2.5 w-[1px] ${isDark ? "bg-zinc-800" : "bg-zinc-300"}`} />
                <div className="flex items-center gap-1.5 relative group/char cursor-default">
                  <span className={`${inspectText.length >= 2500 ? "text-rose-500" : ""}`}>
                    {inspectText.length}
                    <span className="opacity-45 ml-1">chars</span>
                  </span>

                  <div className="flex items-center relative">
                    <svg className="w-3.5 h-3.5 -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                      <circle
                        cx="18" cx-y="18" cy="18" r="14" fill="none"
                        className="stroke-zinc-300 dark:stroke-zinc-700/50" strokeWidth="4.5"
                      />
                      <circle
                        cx="18" cy="18" r="14" fill="none"
                        className={`transition-all duration-500 ease-out ${inspectText.length >= 2500 ? "stroke-rose-500" : inspectText.length >= 2000 ? "stroke-amber-500" : "stroke-indigo-500"}`}
                        strokeWidth="4.5" strokeDasharray="88"
                        strokeDashoffset={88 - (Math.min(inspectText.length, 2500) / 2500) * 88}
                        strokeLinecap="round"
                      />
                    </svg>

                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover/char:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-xl font-sans tracking-tight">
                      {2500 - inspectText.length} characters remaining
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800 dark:border-t-zinc-200" />
                    </div>
                  </div>
                </div>
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
                  const segments = getSegments(inspectText, analysisResult.matchedRules || []);
                  const selectedSeg = selectedSegmentIdx !== null ? segments[selectedSegmentIdx] : null;

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
                                  rule.severity === "Critical Risk" || rule.severity === "High Risk"
                                    ? "bg-rose-500/25 text-rose-600 dark:text-rose-450 font-black"
                                    : "bg-amber-500/25 text-amber-600 dark:text-amber-455 font-black"
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

                          {/* Recommended Safe Alternative Block */}
                          {rule.rewrite && (
                            <div className="mt-3.5 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 dark:border-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                              <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                                  <span>🛡️ Recommended Safe Alternative</span>
                                </div>
                                <div className="text-xs font-mono font-black text-emerald-750 dark:text-emerald-300 mt-1 truncate">
                                  "{rule.rewrite}"
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => fixSingleSegment(selectedSegmentIdx!, rule.rewrite)}
                                className="w-full sm:w-auto px-3.5 py-1.5 text-[11px] bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
                              >
                                Apply Safe Fix
                              </button>
                            </div>
                          )}

                          <div className="mt-3 pt-2 border-t border-rose-500/5">
                            {/* Filter Bypass Disguise */}
                            <div className="space-y-2 p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                <span>🕵️ Test AI Evasion Pattern</span>
                              </div>
                              <p className="text-[10.5px] text-zinc-650 dark:text-zinc-400 font-medium">
                                Test if the Live AI engine catches these common evasion attempts used to bypass basic platform filters.
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
                              Click any flagged word in the marked draft above to inspect details, or configure your Auto-Fix strategy below.
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
                            { id: "safe", label: "✅ Safe Fix", desc: "e.g., Fiverr native tools" },
                            { id: "compound", label: "🕵️ Compound Space", desc: "e.g., g mail" },
                            { id: "dotted", label: "🕵️ Dotted Letters", desc: "e.g., g.m.a.i.l" },
                            { id: "hyphenated", label: "🕵️ Hyphenated", desc: "e.g., g-mail" },
                            { id: "spaced", label: "🕵️ Spaced Letters", desc: "e.g., g m a i l" },
                          ].map((strategy) => (
                            <button
                              key={strategy.id}
                              type="button"
                              onClick={() => setFixStrategy(strategy.id as any)}
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
                              Auto-Fix All ({analysisResult.matchedRules?.length || 0}) with{" "}
                              {fixStrategy === "safe" ? "Safe Alternatives" : `Disguised ${fixStrategy.toUpperCase()}`}
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
  );
}
