import React, { useEffect } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Moon,
  Sun,
  Shield,
  FileText,
  PenTool,
  Eraser,
  TerminalSquare,
  BookOpen,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  setActiveTab: (tab: "inspector" | "composer" | "rules" | "templates") => void;
  setInspectText: (text: string) => void;
  setRawThoughts: (text: string) => void;
  setShowShortcuts: (show: boolean) => void;
}

export function CommandPalette({
  open,
  setOpen,
  isDark,
  setIsDark,
  setActiveTab,
  setInspectText,
  setRawThoughts,
  setShowShortcuts,
}: CommandPaletteProps) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[4px]"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, y: 10, filter: "blur(8px)" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
            className="relative w-full max-w-[680px] mx-4 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-[120px] saturate-[2] border border-white/80 dark:border-white/10 rounded-[32px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden font-sans ring-1 ring-black/5 dark:ring-white/10 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/60 before:via-white/0 before:to-transparent dark:before:from-white/20 dark:before:via-white/0 dark:before:to-transparent before:pointer-events-none after:absolute after:inset-0 after:rounded-[32px] after:ring-1 after:ring-inset after:ring-white/50 dark:after:ring-white/5 after:pointer-events-none"
          >
            <Command
              label="Global Command Palette"
              className="relative z-10"
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
              }}
            >
              <div className="flex items-center px-6 pt-6 pb-4 relative">
                <Search className="w-6 h-6 text-indigo-500 dark:text-indigo-400 shrink-0 ml-2 animate-pulse drop-shadow-sm" />
                <Command.Input
                  placeholder="What do you need?"
                  className="w-full bg-transparent border-none focus:ring-0 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 py-2 px-5 outline-none text-[22px] font-medium tracking-tight"
                  autoFocus
                />
                <button
                  onClick={() => setOpen(false)}
                  className="hidden sm:flex items-center justify-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 w-8 h-8 rounded-xl transition-colors group/esc"
                >
                  <kbd className="px-2 py-1 bg-black/5 dark:bg-white/10 rounded-lg text-[11px] font-bold text-zinc-500 dark:text-zinc-400 shadow-sm backdrop-blur-md group-hover/esc:text-zinc-800 dark:group-hover/esc:text-zinc-200 transition-colors">
                    esc
                  </kbd>
                </button>
              </div>

              <div className="mx-8 h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent"></div>

              <Command.List className="max-h-[420px] overflow-y-auto p-4 scrollbar-none">
                <Command.Empty className="py-14 flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400">
                  <div className="w-10 h-10 mb-3 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/10">
                    <Search className="w-4 h-4 opacity-50" />
                  </div>
                  <span className="text-[14px] font-medium tracking-tight">
                    No magic found for this command.
                  </span>
                </Command.Empty>

                <Command.Group
                  heading="Navigation"
                  className="px-3 py-2.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-[0.2em] uppercase"
                >
                  <Command.Item
                    onSelect={() => {
                      setActiveTab("inspector");
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 mx-1 my-1 text-[15px] font-medium text-zinc-700 dark:text-zinc-300 rounded-[14px] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10 data-[selected=true]:translate-x-1 outline-none group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm group-data-[selected=true]:bg-white dark:group-data-[selected=true]:bg-white/10 group-data-[selected=true]:shadow-md transition-all duration-300">
                      <Shield className="w-[18px] h-[18px] text-indigo-500 dark:text-indigo-400 group-data-[selected=true]:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex flex-col relative z-10">
                      <span className="group-data-[selected=true]:text-indigo-600 dark:group-data-[selected=true]:text-indigo-300 transition-colors duration-300">
                        ToS Inspector
                      </span>
                    </div>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setActiveTab("composer");
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 mx-1 my-1 text-[15px] font-medium text-zinc-700 dark:text-zinc-300 rounded-[14px] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10 data-[selected=true]:translate-x-1 outline-none group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm group-data-[selected=true]:bg-white dark:group-data-[selected=true]:bg-white/10 group-data-[selected=true]:shadow-md transition-all duration-300">
                      <PenTool className="w-[18px] h-[18px] text-emerald-500 dark:text-emerald-400 group-data-[selected=true]:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex flex-col relative z-10">
                      <span className="group-data-[selected=true]:text-emerald-600 dark:group-data-[selected=true]:text-emerald-300 transition-colors duration-300">
                        AI Writer
                      </span>
                    </div>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setActiveTab("rules");
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 mx-1 my-1 text-[15px] font-medium text-zinc-700 dark:text-zinc-300 rounded-[14px] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10 data-[selected=true]:translate-x-1 outline-none group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm group-data-[selected=true]:bg-white dark:group-data-[selected=true]:bg-white/10 group-data-[selected=true]:shadow-md transition-all duration-300">
                      <BookOpen className="w-[18px] h-[18px] text-amber-500 dark:text-amber-400 group-data-[selected=true]:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex flex-col relative z-10">
                      <span className="group-data-[selected=true]:text-amber-600 dark:group-data-[selected=true]:text-amber-300 transition-colors duration-300">
                        Rule Database
                      </span>
                    </div>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setActiveTab("templates");
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 mx-1 my-1 text-[15px] font-medium text-zinc-700 dark:text-zinc-300 rounded-[14px] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10 data-[selected=true]:translate-x-1 outline-none group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm group-data-[selected=true]:bg-white dark:group-data-[selected=true]:bg-white/10 group-data-[selected=true]:shadow-md transition-all duration-300">
                      <FileText className="w-[18px] h-[18px] text-rose-500 dark:text-rose-400 group-data-[selected=true]:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex flex-col relative z-10">
                      <span className="group-data-[selected=true]:text-rose-600 dark:group-data-[selected=true]:text-rose-300 transition-colors duration-300">
                        Message Templates
                      </span>
                    </div>
                  </Command.Item>
                </Command.Group>

                <div className="mx-6 my-3 h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent"></div>

                <Command.Group
                  heading="Actions"
                  className="px-3 py-2.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-[0.2em] uppercase"
                >
                  <Command.Item
                    onSelect={() => {
                      setIsDark(!isDark);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 mx-1 my-1 text-[15px] font-medium text-zinc-700 dark:text-zinc-300 rounded-[14px] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10 data-[selected=true]:translate-x-1 outline-none group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm group-data-[selected=true]:bg-white dark:group-data-[selected=true]:bg-white/10 group-data-[selected=true]:shadow-md transition-all duration-300">
                      {isDark ? (
                        <Sun className="w-[18px] h-[18px] text-yellow-500 dark:text-yellow-400 group-data-[selected=true]:scale-110 transition-transform duration-300" />
                      ) : (
                        <Moon className="w-[18px] h-[18px] text-zinc-500 group-data-[selected=true]:scale-110 transition-transform duration-300" />
                      )}
                    </div>
                    <div className="flex flex-col relative z-10 flex-1">
                      <span className="group-data-[selected=true]:text-zinc-900 dark:group-data-[selected=true]:text-white transition-colors duration-300">
                        Toggle {isDark ? "Light" : "Dark"} Mode
                      </span>
                    </div>
                    <kbd className="hidden sm:inline-block px-2 py-1 bg-white/60 dark:bg-black/40 rounded-md text-[10px] font-bold text-zinc-400 dark:text-zinc-500 border border-black/5 dark:border-white/10 shadow-sm opacity-0 group-data-[selected=true]:opacity-100 transition-all duration-300 group-data-[selected=true]:translate-x-0 translate-x-2">
                      ⌘D
                    </kbd>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setInspectText("");
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 mx-1 my-1 text-[15px] font-medium text-zinc-700 dark:text-zinc-300 rounded-[14px] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10 data-[selected=true]:translate-x-1 outline-none group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm group-data-[selected=true]:bg-white dark:group-data-[selected=true]:bg-white/10 group-data-[selected=true]:shadow-md transition-all duration-300">
                      <Eraser className="w-[18px] h-[18px] text-zinc-500 dark:text-zinc-400 group-data-[selected=true]:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex flex-col relative z-10 flex-1">
                      <span className="group-data-[selected=true]:text-zinc-900 dark:group-data-[selected=true]:text-white transition-colors duration-300">
                        Clear Inspector Text
                      </span>
                    </div>
                    <kbd className="hidden sm:inline-block px-2 py-1 bg-white/60 dark:bg-black/40 rounded-md text-[10px] font-bold text-zinc-400 dark:text-zinc-500 border border-black/5 dark:border-white/10 shadow-sm opacity-0 group-data-[selected=true]:opacity-100 transition-all duration-300 group-data-[selected=true]:translate-x-0 translate-x-2">
                      ⌘⇧E
                    </kbd>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setRawThoughts("");
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 mx-1 my-1 text-[15px] font-medium text-zinc-700 dark:text-zinc-300 rounded-[14px] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10 data-[selected=true]:translate-x-1 outline-none group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm group-data-[selected=true]:bg-white dark:group-data-[selected=true]:bg-white/10 group-data-[selected=true]:shadow-md transition-all duration-300">
                      <Eraser className="w-[18px] h-[18px] text-zinc-500 dark:text-zinc-400 group-data-[selected=true]:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex flex-col relative z-10 flex-1">
                      <span className="group-data-[selected=true]:text-zinc-900 dark:group-data-[selected=true]:text-white transition-colors duration-300">
                        Clear AI Writer Draft
                      </span>
                    </div>
                    <kbd className="hidden sm:inline-block px-2 py-1 bg-white/60 dark:bg-black/40 rounded-md text-[10px] font-bold text-zinc-400 dark:text-zinc-500 border border-black/5 dark:border-white/10 shadow-sm opacity-0 group-data-[selected=true]:opacity-100 transition-all duration-300 group-data-[selected=true]:translate-x-0 translate-x-2">
                      ⌘⇧R
                    </kbd>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setShowShortcuts(true);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 mx-1 my-1 text-[15px] font-medium text-zinc-700 dark:text-zinc-300 rounded-[14px] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10 data-[selected=true]:translate-x-1 outline-none group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm group-data-[selected=true]:bg-white dark:group-data-[selected=true]:bg-white/10 group-data-[selected=true]:shadow-md transition-all duration-300">
                      <TerminalSquare className="w-[18px] h-[18px] text-cyan-500 dark:text-cyan-400 group-data-[selected=true]:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex flex-col relative z-10 flex-1">
                      <span className="group-data-[selected=true]:text-cyan-600 dark:group-data-[selected=true]:text-cyan-300 transition-colors duration-300">
                        Show Keyboard Shortcuts
                      </span>
                    </div>
                    <kbd className="hidden sm:inline-block px-2 py-1 bg-white/60 dark:bg-black/40 rounded-md text-[10px] font-bold text-zinc-400 dark:text-zinc-500 border border-black/5 dark:border-white/10 shadow-sm opacity-0 group-data-[selected=true]:opacity-100 transition-all duration-300 group-data-[selected=true]:translate-x-0 translate-x-2">
                      ?
                    </kbd>
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
