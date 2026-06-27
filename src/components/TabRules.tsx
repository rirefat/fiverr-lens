import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  ShieldAlert 
} from "lucide-react";
import { ComplianceRule } from "../complianceDatabase";

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
          Explore the centralized compliance database protecting against off-platform routing, fee bypass, and bad actors.
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
        className="flex-1 overflow-y-auto min-h-[280px] md:max-h-[450px] space-y-2 pr-2 select-none hide-scrollbar relative z-10"
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
    </motion.div>
  );
}
