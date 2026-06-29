import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  ShieldAlert,
  BookOpen, 
  User, 
  TrendingUp, 
  AlertTriangle, 
  CreditCard, 
  Scale, 
  ExternalLink,
  ChevronDown,
  Info,
  Shield,
  FileText
} from "lucide-react";
import { ComplianceRule } from "../complianceDatabase";
import { FIVERR_TOS_DATABASE, OFFICIAL_LINKS, TosSection, TosClause } from "../fiverrTosDatabase";

interface TabRulesProps {
  isDark: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSeverity: string;
  setSelectedSeverity: (sev: string) => void;
  selectedRule: ComplianceRule | null;
  setSelectedRule: (rule: ComplianceRule | null) => void;
  categories: string[];
  fullComplianceDatabase: ComplianceRule[];
}

/**
 * Renders the Compliance / TOS Safety Rules directory where sellers can query guidelines,
 * see risk scores, categories, and learn safe practices.
 * Also integrates an interactive Fiverr Terms & Conditions Handbook.
 */
export function TabRules({
  isDark,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedSeverity,
  setSelectedSeverity,
  selectedRule,
  setSelectedRule,
  categories,
  fullComplianceDatabase,
}: TabRulesProps) {
  const [subTab, setSubTab] = useState<"database" | "handbook">("database");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "overview-key-terms": true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getSectionIcon = (name: string) => {
    switch (name) {
      case "BookOpen":
        return <BookOpen className="h-4 w-4 text-indigo-500" />;
      case "User":
        return <User className="h-4 w-4 text-emerald-500" />;
      case "TrendingUp":
        return <TrendingUp className="h-4 w-4 text-sky-500" />;
      case "AlertTriangle":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "CreditCard":
        return <CreditCard className="h-4 w-4 text-purple-500" />;
      case "Scale":
        return <Scale className="h-4 w-4 text-teal-500" />;
      default:
        return <FileText className="h-4 w-4 text-indigo-500" />;
    }
  };

  const filteredRules = fullComplianceDatabase.filter((rule) => {
    const matchesSearch =
      rule.phrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || rule.category === selectedCategory;
    const matchesSeverity =
      selectedSeverity === "All" || rule.severity === selectedSeverity;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const filteredHandbook = FIVERR_TOS_DATABASE.filter((section) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    const sectionMatches = 
      section.title.toLowerCase().includes(q) ||
      section.category.toLowerCase().includes(q) ||
      section.summary.toLowerCase().includes(q);
      
    if (sectionMatches) return true;
    
    return section.clauses.some(
      (clause) =>
        clause.title.toLowerCase().includes(q) ||
        clause.description.toLowerCase().includes(q) ||
        (clause.bulletPoints && clause.bulletPoints.some(bp => bp.toLowerCase().includes(q)))
    );
  });

  return (
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

      <div className="px-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-6 w-6 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 backdrop-blur-md">
              <ShieldCheck className="h-3 w-3 text-indigo-500" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase text-indigo-650 dark:text-indigo-400 tracking-[0.2em]">
              Liquid Intel Engine
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
            {subTab === "database" ? "Safety Protocols" : "Fiverr ToS Handbook"}
          </h2>
          <p className="text-[13px] text-zinc-600 dark:text-zinc-400 mt-2 font-medium leading-relaxed max-w-md">
            {subTab === "database" 
              ? "Explore the centralized compliance database protecting against off-platform routing, fee bypass, and bad actors."
              : "Browse the complete, official-style Fiverr terms and conditions database with interactive guidelines."}
          </p>
        </div>

        {/* Subtab Toggle Buttons */}
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/50 dark:border-white/5 relative z-10 self-start shrink-0">
          <button
            onClick={() => setSubTab("database")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-tight transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
              subTab === "database"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200/60 dark:border-white/5"
                : "text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Safety Protocols
          </button>
          <button
            onClick={() => setSubTab("handbook")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-tight transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
              subTab === "handbook"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200/60 dark:border-white/5"
                : "text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Fiverr ToS Handbook
          </button>
        </div>
      </div>

      {subTab === "database" ? (
        <>
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
                    Category
                  </span>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-[11px] font-bold cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                        isDark
                          ? "bg-black/20 border-white/10 text-zinc-300"
                          : "bg-white/60 border-zinc-200/60 text-zinc-800"
                      }`}
                    >
                      <option value="All">All Categories</option>
                      {categories.map((cat) => (
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
                      onChange={(e) => setSelectedSeverity(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-[11px] font-bold cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                        isDark
                          ? "bg-black/20 border-white/10 text-zinc-300"
                          : "bg-white/60 border-zinc-200/60 text-zinc-800"
                      }`}
                    >
                      {["All", "Low Risk", "Medium Risk", "High Risk", "Critical Risk"].map((sev) => (
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

          {/* Scrollable List */}
          <motion.div
            layout="position"
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 overflow-y-auto min-h-[280px] md:max-h-[450px] space-y-2 pr-2 select-none custom-scrollbar relative z-10"
          >
            <AnimatePresence mode="popLayout">
              {filteredRules.length === 0 ? (
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
                filteredRules.map((rule) => {
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
                            ? "bg-indigo-50/10 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
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
                          {rule.phrase.replace(/\s?\(Case\s?#\d+\)/gi, "")}
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
        </>
      ) : (
        <>
          {/* Handbook Search & Quick Info */}
          <div className="space-y-4 relative z-10">
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
                    placeholder="Search standard Fiverr terms (e.g. commission, homework, PayPal)..."
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
              </div>
            </div>

            {/* Quick Warning / Helper Banner */}
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex gap-3">
              <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-normal text-zinc-600 dark:text-zinc-400 font-medium">
                <strong className="text-indigo-650 dark:text-indigo-400 font-bold">Important Notice:</strong> This portal is a summarized reference representation of Fiverr's Community Standards and Terms of Service. Always adhere strictly to official policy guidelines. Violations typically lead to warnings, gig demotions, or permanent account suspensions.
              </div>
            </div>

            {/* Official Fiverr Links Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {OFFICIAL_LINKS.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3.5 rounded-xl border transition-all duration-350 flex flex-col gap-1 cursor-pointer group relative overflow-hidden ${
                    isDark
                      ? "bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-indigo-500/20"
                      : "bg-white/30 border-white/80 hover:bg-white/80 hover:border-indigo-300 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black tracking-tight text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-indigo-500" />
                      {link.title}
                    </span>
                    <ExternalLink className="h-3 w-3 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                    {link.description}
                  </span>
                </a>
              ))}
            </div>

            {/* Accordion List of Policy Sections */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredHandbook.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="h-10 w-10 rounded-full bg-zinc-500/10 flex items-center justify-center mx-auto mb-3 border border-zinc-500/20">
                    <ShieldAlert className="h-4 w-4 text-zinc-500" />
                  </div>
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">No terms found matching "{searchQuery}"</span>
                </div>
              ) : (
                filteredHandbook.map((section) => {
                  const isOpen = !!expandedSections[section.id];
                  return (
                    <div
                      key={section.id}
                      className={`rounded-2xl border transition-all duration-350 overflow-hidden ${
                        isDark
                          ? "bg-white/[0.01] border-white/5"
                          : "bg-white/35 border-white/70 shadow-sm"
                      }`}
                    >
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`w-full p-4 flex items-center justify-between gap-4 text-left transition-all cursor-pointer ${
                          isOpen 
                            ? "border-b border-zinc-200/55 dark:border-white/5 bg-indigo-50/5 dark:bg-indigo-500/5"
                            : "hover:bg-zinc-50/40 dark:hover:bg-white/[0.01]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-white/60 dark:bg-zinc-900 border border-zinc-200/40 dark:border-white/10 flex items-center justify-center shadow-sm shrink-0">
                            {getSectionIcon(section.iconName)}
                          </div>
                          <div>
                            <h3 className="text-xs font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                              {section.title}
                            </h3>
                            <span className="text-[9px] font-mono text-indigo-650 dark:text-indigo-400 font-bold uppercase tracking-widest block">
                              {section.category}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isOpen ? "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 rotate-180" : "text-zinc-400"
                          }`}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </div>
                      </button>

                      {/* Section Content */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <div className="p-4 space-y-4">
                              <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                                {section.summary}
                              </p>

                              {/* Clauses list */}
                              <div className="space-y-3.5 border-t border-zinc-150/40 dark:border-white/5 pt-4">
                                {section.clauses.map((clause, cIdx) => (
                                  <div
                                    key={cIdx}
                                    className={`p-3 rounded-xl border relative transition-all ${
                                      isDark
                                        ? "bg-black/20 border-white/5"
                                        : "bg-white/60 border-zinc-150/60 shadow-sm"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3 mb-1.5">
                                      <h4 className="text-[11.5px] font-black text-zinc-900 dark:text-zinc-100">
                                        {clause.title}
                                      </h4>
                                      {clause.riskLevel && (
                                        <span
                                          className={`text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0 ${
                                            clause.riskLevel === "Critical Risk"
                                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
                                              : clause.riskLevel === "High Risk"
                                                ? "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
                                                : clause.riskLevel === "Medium Risk"
                                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                                                  : clause.riskLevel === "Low Risk"
                                                    ? "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400"
                                                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                                          }`}
                                        >
                                          {clause.riskLevel}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10.5px] text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
                                      {clause.description}
                                    </p>

                                    {clause.bulletPoints && clause.bulletPoints.length > 0 && (
                                      <ul className="mt-2 space-y-1 pl-4 list-disc text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                                        {clause.bulletPoints.map((bp, bpIdx) => (
                                          <li key={bpIdx} className="leading-relaxed">
                                            {bp}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
