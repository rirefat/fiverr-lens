import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  X, 
  Copy, 
  Check, 
  Eye, 
  LayoutTemplate,
  Zap,
  Target,
  MessageSquare,
  RefreshCw,
  Send,
  CheckCircle2,
  CalendarClock,
  LifeBuoy,
  BarChart3,
  TrendingUp,
  Award,
  Trash2,
  Flame,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { MessageTemplate } from "../types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface TabTemplatesProps {
  isDark: boolean;
  templateSearchQuery: string;
  setTemplateSearchQuery: (q: string) => void;
  selectedTemplateCategory: string;
  setSelectedTemplateCategory: (cat: string) => void;
  templateCategories: string[];
  messageTemplates: MessageTemplate[];
  setMessageTemplates: React.Dispatch<React.SetStateAction<MessageTemplate[]>>;
  setPreviewTemplate: (t: MessageTemplate | null) => void;
  handleTemplateCopy: (content: string, id: string) => void;
  copiedTemplateIdx: string | null;
}

/**
 * TabTemplates handles displaying, editing, and copying Fiverr-safe responses
 * & outreach templates organized by category.
 */
export function TabTemplates({
  isDark,
  templateSearchQuery,
  setTemplateSearchQuery,
  selectedTemplateCategory,
  setSelectedTemplateCategory,
  templateCategories,
  messageTemplates,
  setMessageTemplates,
  setPreviewTemplate,
  handleTemplateCopy,
  copiedTemplateIdx,
}: TabTemplatesProps) {
  const [showAnalytics, setShowAnalytics] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);

  // Compute analytics
  const totalUsage = messageTemplates.reduce((sum, t) => sum + (t.usageCount || 0), 0);

  const sortedTemplates = [...messageTemplates]
    .filter((t) => (t.usageCount || 0) > 0)
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

  const topTemplate = sortedTemplates[0];

  const categoryUsage: Record<string, number> = {};
  messageTemplates.forEach((t) => {
    categoryUsage[t.category] = (categoryUsage[t.category] || 0) + (t.usageCount || 0);
  });
  let topCategory = "N/A";
  let maxCatUsage = 0;
  Object.entries(categoryUsage).forEach(([cat, usage]) => {
    if (usage > maxCatUsage) {
      maxCatUsage = usage;
      topCategory = cat;
    }
  });

  const handleResetStats = async () => {
    try {
      await fetch("/api/template-stats/reset", {
        method: "POST",
      });
      setMessageTemplates((prev) => prev.map((t) => ({ ...t, usageCount: 0 })));
      setConfirmReset(false);
    } catch (e) {
      console.error("Failed to reset template stats in MongoDB:", e);
    }
  };

  const chartData = sortedTemplates.slice(0, 5).map((t) => ({
    name: t.title.length > 12 ? t.title.substring(0, 12) + "..." : t.title,
    count: t.usageCount || 0,
    fullTitle: t.title,
  }));

  return (
    <motion.div
      key="tab-templates"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex flex-col gap-6 select-text relative"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-white/10">
            <LayoutTemplate className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight mb-1 flex items-center gap-2">
              Message Templates
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Fiverr-safe responses & communication templates.
            </p>
          </div>
        </div>

        {/* Dashboard Quick Toggle */}
        <button
          onClick={() => {
            setShowAnalytics(!showAnalytics);
            setConfirmReset(false);
          }}
          className={`h-9 px-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center gap-2 border select-none active:scale-95 ${
            showAnalytics
              ? isDark
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                : "bg-indigo-50 border-indigo-200 text-indigo-600"
              : isDark
                ? "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]"
                : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 shadow-sm"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Usage Insights</span>
          {showAnalytics ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Analytics Panel */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: -12 }}
            animate={{ height: "auto", opacity: 1, marginBottom: 0 }}
            exit={{ height: 0, opacity: 0, marginBottom: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className={`p-5 rounded-2xl border ${isDark ? "bg-white/[0.02] border-white/5" : "bg-zinc-50/70 border-zinc-200/60"} flex flex-col gap-5`}>
              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Metric 1 */}
                <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${isDark ? "bg-black/25 border-white/5" : "bg-white border-zinc-200/50 shadow-sm"}`}>
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">Total Copies</span>
                    <h4 className="text-xl font-black text-zinc-800 dark:text-white leading-none mt-1">{totalUsage}</h4>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${isDark ? "bg-black/25 border-white/5" : "bg-white border-zinc-200/50 shadow-sm"}`}>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Award className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">Most Used Template</span>
                    <h4 className="text-[13px] font-black text-zinc-800 dark:text-white truncate leading-none mt-1" title={topTemplate?.title || "None"}>
                      {topTemplate ? `${topTemplate.title} (${topTemplate.usageCount})` : "None"}
                    </h4>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${isDark ? "bg-black/25 border-white/5" : "bg-white border-zinc-200/50 shadow-sm"}`}>
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <Flame className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">Hot Category</span>
                    <h4 className="text-xl font-black text-zinc-800 dark:text-white leading-none mt-1">{topCategory}</h4>
                  </div>
                </div>
              </div>

              {totalUsage === 0 ? (
                <div className="py-6 text-center text-xs font-medium text-zinc-400 dark:text-zinc-500 select-none">
                  No message templates have been used yet. Copy templates to generate usage metrics!
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                  {/* Leaderboard Progress Bars */}
                  <div className="flex flex-col gap-3">
                    <h5 className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">Usage Leaderboard</h5>
                    <div className="flex flex-col gap-2.5 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                      {sortedTemplates.slice(0, 10).map((t, index) => {
                        const pct = Math.max(5, (t.usageCount || 0) / (topTemplate?.usageCount || 1) * 100);
                        return (
                          <div key={t.id} className="flex flex-col gap-1">
                            <div className="flex justify-between items-center text-xs font-medium">
                              <span className="text-zinc-700 dark:text-zinc-300 truncate pr-4">{index + 1}. {t.title}</span>
                              <span className="font-bold text-indigo-500 shrink-0">{t.usageCount} copies</span>
                            </div>
                            <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recharts Bar Chart */}
                  <div className="flex flex-col gap-3 h-full">
                    <h5 className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">Metrics Visualization</h5>
                    <div className="h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                          <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip
                            cursor={{ fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" }}
                            content={
                              ({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className={`p-2.5 rounded-lg border text-xs font-mono shadow-md ${isDark ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"}`}>
                                      <p className="font-bold">{payload[0].payload.fullTitle}</p>
                                      <p className="text-indigo-500 font-medium">Used: {payload[0].value} times</p>
                                    </div>
                                  );
                                }
                                return null;
                              }
                            }
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, idx) => (
                              <Cell
                                key={`cell-${idx}`}
                                fill={`url(#barGradient-${idx})`}
                              />
                            ))}
                          </Bar>
                          <defs>
                            {chartData.map((_, idx) => (
                              <linearGradient key={`grad-${idx}`} id={`barGradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.7} />
                              </linearGradient>
                            ))}
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Reset Controller */}
              <div className="flex justify-end pt-2 border-t border-zinc-200/20 dark:border-white/5">
                {!confirmReset ? (
                  <button
                    onClick={() => setConfirmReset(true)}
                    disabled={totalUsage === 0}
                    className="flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-rose-500 hover:text-rose-400 dark:text-rose-400 dark:hover:text-rose-300 transition-colors py-1 px-2.5 rounded-lg hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 disabled:opacity-40 disabled:cursor-not-allowed select-none"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Reset Telemetry</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-rose-500 animate-pulse uppercase tracking-wider">Are you sure? This clears Firebase stats.</span>
                    <button
                      onClick={handleResetStats}
                      className="text-[10px] font-black tracking-widest uppercase text-white bg-rose-500 hover:bg-rose-600 py-1 px-3 rounded-md transition-colors"
                    >
                      Yes, Clear
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className={`text-[10px] font-black tracking-widest uppercase py-1 px-3 rounded-md border ${isDark ? "border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-white/5" : "border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"}`}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative shrink-0">
        <Search
          className={`absolute left-3.5 top-3.5 h-4 w-4 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
        />
        <input
          type="text"
          value={templateSearchQuery}
          onChange={(e) => setTemplateSearchQuery(e.target.value)}
          placeholder="Search templates by title or description..."
          className={`w-full h-11 pl-10 pr-4 rounded-xl text-sm transition-all duration-300 outline-none ${
            isDark
              ? "bg-black/20 text-white placeholder:text-zinc-500 border border-white/10 focus:border-indigo-500/50 focus:bg-white/5"
              : "bg-white text-zinc-900 placeholder:text-zinc-400 border border-zinc-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:border-indigo-500/40 focus:shadow-[0_4px_20px_rgba(99,102,241,0.08)]"
          }`}
        />
        {templateSearchQuery && (
          <button
            onClick={() => setTemplateSearchQuery("")}
            className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="relative w-full mb-4 mt-2 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 w-full">
          {templateCategories.map((category) => {
            const isActive = selectedTemplateCategory === category;

            let Icon = Zap;
            let shortLabel = category;
            if (category === "Onboarding") {
              Icon = Target;
            } else if (category === "Communication") {
              Icon = MessageSquare;
              shortLabel = "Comms";
            } else if (category === "Project Update") {
              Icon = RefreshCw;
              shortLabel = "Updates";
            } else if (category === "Delivery Follow-up") {
              Icon = Send;
              shortLabel = "Follow-up";
            } else if (category === "Delivery") {
              Icon = CheckCircle2;
            } else if (category === "Extension Request") {
              Icon = CalendarClock;
              shortLabel = "Extension";
            } else if (category === "Support") {
              Icon = LifeBuoy;
            }

            const isSupport = category === "Support";

            // Custom colors for Support vs Standard tabs
            const activeBgDark = isSupport
              ? "bg-rose-500/20 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
              : "bg-zinc-800/80 border border-white/10 shadow-md";
            const activeBgLight = isSupport
              ? "bg-rose-50 border border-rose-200 shadow-[0_2px_10px_rgba(244,63,94,0.1)]"
              : "bg-white border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]";

            const activeTextDark = isSupport ? "text-rose-100" : "text-white";
            const activeTextLight = isSupport ? "text-rose-700" : "text-zinc-900";

            const inactiveTextDark = isSupport
              ? "text-rose-400/60 hover:text-rose-300"
              : "text-zinc-400 hover:text-zinc-200";
            const inactiveTextLight = isSupport
              ? "text-rose-600/60 hover:text-rose-700"
              : "text-zinc-500 hover:text-zinc-800";

            const activeIconColorDark = isSupport ? "text-rose-400" : "text-indigo-400";
            const activeIconColorLight = isSupport ? "text-rose-600" : "text-indigo-600";

            return (
              <button
                key={category}
                onClick={() => setSelectedTemplateCategory(category)}
                className={`relative px-3 py-2.5 rounded-[12px] text-[10px] font-black tracking-[0.1em] uppercase transition-all duration-300 outline-none group active:scale-[0.98] flex flex-col items-center justify-center gap-1.5 ${
                  isDark
                    ? "bg-black/20 border border-white/5 hover:bg-white/5"
                    : "bg-zinc-100/50 border border-zinc-200/50 hover:bg-zinc-200/50"
                } ${
                  isActive
                    ? isDark
                      ? activeTextDark
                      : activeTextLight
                    : isDark
                      ? inactiveTextDark
                      : inactiveTextLight
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTemplateCategoryTab"
                    className={`absolute inset-0 rounded-[12px] z-0 ${
                      isDark ? activeBgDark : activeBgLight
                    }`}
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}

                <span className="relative z-10 flex flex-col items-center gap-1.5 w-full justify-center">
                  <Icon
                    className={`w-4 h-4 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"} ${isActive ? (isDark ? activeIconColorDark : activeIconColorLight) : "opacity-60"}`}
                  />
                  <span className="text-[9px] leading-tight text-center">
                    {shortLabel}
                  </span>
                </span>

                {/* Support specific flair */}
                {isSupport && isActive && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white dark:border-zinc-900"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
        {messageTemplates
          .filter((t) => {
            const matchesCategory =
              selectedTemplateCategory === "All" ||
              t.category === selectedTemplateCategory;
            const matchesSearch =
              templateSearchQuery === "" ||
              t.title.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
              t.description.toLowerCase().includes(templateSearchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
          })
          .map((template) => (
            <div
              key={template.id}
              className={`p-4 rounded-2xl border backdrop-blur-xl flex flex-col gap-3 group transition-all duration-300 ${
                isDark
                  ? "bg-white/[0.03] border-white/10 hover:bg-white/[0.05]"
                  : "bg-white/60 border-zinc-200/50 hover:bg-white"
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-100 mb-1">
                    {template.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium line-clamp-2">
                    {template.description}
                  </p>
                </div>
                <div className="flex items-center shrink-0">
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border backdrop-blur-md flex items-center gap-1.5 select-none ${
                      isDark
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/25"
                        : "bg-indigo-50 text-indigo-600 border-indigo-100/80 shadow-[0_1px_3px_rgba(99,102,241,0.05)]"
                    }`}
                  >
                    <BarChart3 className="h-2.5 w-2.5" />
                    <span>Used {template.usageCount || 0} times</span>
                  </span>
                </div>
              </div>
              <textarea
                value={template.content}
                maxLength={2500}
                onChange={(e) => {
                  setMessageTemplates((prev) =>
                    prev.map((t) =>
                      t.id === template.id
                        ? { ...t, content: e.target.value }
                        : t
                    )
                  );
                }}
                className={`p-3.5 rounded-xl border text-[13px] font-medium whitespace-pre-line leading-relaxed resize-y min-h-[280px] outline-none transition-all duration-300 focus:ring-2 focus:ring-indigo-500/30 custom-scrollbar ${
                  isDark
                    ? "bg-black/20 border-white/5 text-zinc-300 focus:border-indigo-500/50 focus:bg-black/40"
                    : "bg-zinc-50/80 border-zinc-200/50 text-zinc-600 focus:border-indigo-500/40 focus:bg-white shadow-inner"
                }`}
              />
              <div className="flex justify-between items-center mt-2 relative z-10">
                <button
                  onClick={() => setPreviewTemplate(template)}
                  className={`group flex items-center h-9 px-2.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
                    isDark
                      ? "bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50 hover:border-zinc-600/50"
                      : "bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 border border-zinc-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                  }`}
                  title="Quick Preview"
                >
                  <Eye className="h-4 w-4 shrink-0 transition-transform duration-500 group-hover:scale-110" />
                  <div className="grid grid-rows-[1fr] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-0 group-hover:max-w-[80px] group-hover:ml-2 opacity-0 group-hover:opacity-100">
                    <span className="text-[10px] font-bold tracking-widest uppercase whitespace-nowrap overflow-hidden">
                      Preview
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => handleTemplateCopy(template.content, template.id)}
                  className={`group relative px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 cursor-pointer overflow-hidden active:scale-[0.96] ${
                    copiedTemplateIdx === template.id
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)] border border-emerald-400/50"
                      : isDark
                        ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.1)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.3)]"
                        : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.5)] border border-indigo-400/50"
                  }`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_60%)] pointer-events-none" />
                  <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-center min-w-[120px]">
                    <AnimatePresence mode="wait">
                      {copiedTemplateIdx === template.id ? (
                        <motion.div
                          key="check"
                          initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-3.5 w-3.5 drop-shadow-md" />
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
                          <Copy className="h-3.5 w-3.5 group-hover:-rotate-12 transition-transform duration-300 ease-out" />
                          <span>Copy Template</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              </div>
            </div>
          ))}
      </div>
    </motion.div>
  );
}
