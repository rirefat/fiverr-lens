import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Trash2, 
  RefreshCw, 
  FileText 
} from "lucide-react";

interface TabComposerProps {
  isDark: boolean;
  rawThoughts: string;
  setRawThoughts: (thoughts: string) => void;
  selectedTone: string;
  setSelectedTone: (tone: string) => void;
  isListening: boolean;
  toggleDictation: () => void;
  interimSpeech: string;
  isComposing: boolean;
  handleCompose: (thoughts?: string, tone?: string) => void;
  quickTemplates: Array<{ 
    title: string; 
    description: string; 
    thoughts: string; 
    tone: string; 
  }>;
}

/**
 * TabComposer manages raw thought drafting, voice recognition dictate loops,
 * tone choice adjustments, and preset trigger compositions.
 */
export function TabComposer({
  isDark,
  rawThoughts,
  setRawThoughts,
  selectedTone,
  setSelectedTone,
  isListening,
  toggleDictation,
  interimSpeech,
  isComposing,
  handleCompose,
  quickTemplates,
}: TabComposerProps) {
  return (
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
          Transform your raw thoughts and ideas into pristine, fully compliant client proposals natively aligned with Fiverr's Terms of Service.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col relative group">
          <div className="flex items-center justify-between mb-1.5 shrink-0 select-none">
            <label className="text-[9px] font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300">
              Share Your Thoughts & Ideas
            </label>
            <div className="flex items-center gap-2.5">
              <button
                onClick={toggleDictation}
                className={`text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer px-2.5 py-0.5 rounded-md border ${
                  isListening
                    ? "bg-rose-500/15 dark:bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-400 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                    : "bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:opacity-80"
                }`}
                title={isListening ? "Stop dictating" : "Dictate with your voice"}
              >
                {isListening ? (
                  <>
                    <div className="flex items-center gap-0.5 h-3">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-0.5 bg-rose-500 dark:bg-rose-400 rounded-full"
                          animate={{
                            height: ["3px", "11px", "3px"],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.12,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                    <MicOff className="h-3 w-3 text-rose-500 dark:text-rose-400" />
                    <span>Stop Dictating</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-3 w-3 animate-[pulse_2s_infinite]" />
                    <span>Dictate</span>
                  </>
                )}
              </button>
              {rawThoughts.trim() && (
                <button
                  onClick={() => setRawThoughts("")}
                  className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:opacity-80 transition flex items-center gap-1 cursor-pointer bg-rose-500/10 dark:bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/25"
                  title="Clear draft notes"
                >
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
              )}
              <div
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 group/char cursor-default relative ${rawThoughts.length >= 2500 ? "text-rose-500 bg-rose-500/10 border-rose-500/20" : "text-zinc-500 dark:text-zinc-400 bg-zinc-500/10 dark:bg-zinc-800/60 border-zinc-200/10 dark:border-white/5"}`}
              >
                <span>
                  {rawThoughts.length}{" "}
                  <span className="opacity-60 ml-0.5">chars</span>
                </span>

                <div className="flex items-center relative">
                  <svg
                    className="w-3.5 h-3.5 -rotate-90 drop-shadow-sm"
                    viewBox="0 0 36 36"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      className="stroke-zinc-300 dark:stroke-zinc-700/50"
                      strokeWidth="4.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      className={`transition-all duration-500 ease-out ${rawThoughts.length >= 2500 ? "stroke-rose-500" : rawThoughts.length >= 2000 ? "stroke-amber-500" : "stroke-indigo-500"}`}
                      strokeWidth="4.5"
                      strokeDasharray="88"
                      strokeDashoffset={
                        88 - (Math.min(rawThoughts.length, 2500) / 2500) * 88
                      }
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="absolute bottom-full right-0 mb-2 px-2.5 py-1.5 bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover/char:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-xl font-sans tracking-tight">
                    {2500 - rawThoughts.length} characters remaining
                    <div className="absolute -bottom-1 right-1.5 border-4 border-transparent border-t-zinc-800 dark:border-t-zinc-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={rawThoughts}
              maxLength={2500}
              onChange={(e) => setRawThoughts(e.target.value)}
              placeholder="Share your thoughts, ideas, or what you want to convey to the client... (e.g., Thank them for the budget. Recommend a safe video call inside Fiverr on Monday, but no Skype.)"
              className={`w-full h-36 sm:h-40 p-4 text-xs font-semibold leading-relaxed outline-none rounded-2xl transition-all duration-300 resize-none shadow-inner ${
                isListening
                  ? isDark
                    ? "bg-rose-950/10 border-rose-500/50 focus:border-rose-500 text-zinc-200 placeholder-zinc-550 ring-4 ring-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
                    : "bg-rose-50/25 border-rose-400 focus:border-rose-500 text-zinc-900 placeholder-zinc-450 ring-4 ring-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.05)]"
                  : isDark
                    ? "bg-zinc-950/40 border border-zinc-800/60 focus:border-indigo-500/80 text-zinc-200 placeholder-zinc-550 focus:ring-4 focus:ring-indigo-500/10"
                    : "bg-white border border-zinc-250 focus:border-indigo-600 text-zinc-900 placeholder-zinc-450 focus:ring-4 focus:ring-indigo-500/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.03)]"
              }`}
            />
            <AnimatePresence>
              {isListening && interimSpeech && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                  className="absolute bottom-3 left-3 right-3 bg-zinc-900/95 dark:bg-zinc-950/95 backdrop-blur border border-white/10 dark:border-white/5 py-1.5 px-3 rounded-xl shadow-xl flex items-center gap-2 pointer-events-none select-none z-10"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                  <p className="text-[10px] font-sans font-medium text-zinc-300 line-clamp-1 italic">
                    "{interimSpeech}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[9px] font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300">
                Cognitive Speech & Tone Alignment
              </label>
              <span className="text-[9px] font-mono font-bold uppercase text-indigo-650 dark:text-indigo-400">
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
                { id: "Professional", label: "💼 Elite Pro", color: "bg-indigo-500" },
                { id: "Friendly", label: "👋 Warm", color: "bg-rose-500" },
                { id: "Humble", label: "🙏 Humble", color: "bg-amber-500" },
                { id: "Confident", label: "✨ Bold", color: "bg-purple-500" },
                { id: "Legal", label: "⚖️ Legal", color: "bg-teal-500" },
                { id: "Urgent", label: "🚨 Urgent", color: "bg-red-500" },
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
                      <span className={`h-1 w-1 rounded-full ${tone.color} shadow-sm animate-pulse`} />
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

      {/* Workspace presets */}
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
                    : "bg-white border-zinc-250 hover:bg-zinc-50/80 hover:border-zinc-300 shadow-3xs hover:shadow-sm"
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
  );
}
