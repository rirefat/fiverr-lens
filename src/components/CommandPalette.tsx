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
            className="relative w-full max-w-[520px] mx-4 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-[40px] saturate-[1.8] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden font-sans ring-1 ring-black/5 dark:ring-white/10"
          >
            <Command
              label="Global Command Palette"
              className="relative z-10"
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
              }}
            >
              <div className="flex items-center px-5 pt-5 pb-3 relative">
                <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500 shrink-0 ml-1 transition-colors duration-200" />
                <Command.Input
                  placeholder="What do you need?"
                  className="w-full bg-transparent border-none focus:ring-0 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 py-1.5 px-3.5 outline-none text-sm md:text-base font-normal tracking-tight"
                  autoFocus
                />
                <button
                  onClick={() => setOpen(false)}
                  className="hidden sm:flex items-center justify-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 w-7 h-7 rounded-lg transition-colors group/esc"
                >
                  <kbd className="px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded-md text-[10px] font-medium text-zinc-400 dark:text-zinc-500 shadow-xs backdrop-blur-md group-hover/esc:text-zinc-700 dark:group-hover/esc:text-zinc-300 transition-colors">
                    esc
                  </kbd>
                </button>
              </div>

              <div className="mx-6 h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent"></div>

              <Command.List className="max-h-[360px] overflow-y-auto p-3 scrollbar-none">
                <Command.Empty className="py-10 flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400">
                  <div className="w-8 h-8 mb-2.5 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/10">
                    <Search className="w-3.5 h-3.5 opacity-50" />
                  </div>
                  <span className="text-xs font-medium tracking-tight">
                    No magic found for this command.
                  </span>
                </Command.Empty>

                <Command.Group
                  heading="Navigation"
                  className="px-2 pt-2 pb-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase"
                >
                  <Command.Item
                    onSelect={() => {
                      setActiveTab("inspector");
                      setOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 mx-0.5 my-0.5 text-xs md:text-[13px] font-medium text-zinc-600 dark:text-zinc-300 rounded-lg cursor-pointer transition-all duration-200 ease-out data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10 data-[selected=true]:translate-x-0.5 outline-none group"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/90 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-xs group-data-[selected=true]:bg-white dark:group-data-[selected=true]:bg-white/10 group-data-[selected=true]:shadow-sm transition-all duration-200">
                      <Shield className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 group-data-[selected=true]:scale-105 transition-transform duration-200" />
                    </div>
                    <div className="flex flex-col relative z-10">
                      <span className="group-data-[selected=true]:text-indigo-600 dark:group-data-[selected=true]:text-indigo-300 transition-colors duration-200">
                        ToS Inspector
                      </span>
                    </div>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setActiveTab("composer");
                      setOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 mx-0.5 my-0.5 text-xs md:text-[13px] font-medium text-zinc-600 dark:text-zinc-300 rounded-lg cursor-pointer transition-all duration-200 ease-out data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10 data-[selected=true]:translate-x-0.5 outline-none group"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/90 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-xs group-data-[selected=true]:bg-white dark:group-data-[selected=true]:bg-white/10 group-data-[selected=true]:shadow-sm transition-all duration-200">
                      <PenTool className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 group-data-[selected=true]:scale-105 transition-transform duration-200" />
                    </div>
                    <div className="flex flex-col relative z-10">
                      <span className="group-data-[selected=true]:text-emerald-600 dark:group-data-[selected=true]:text-emerald-300 transition-colors duration-200">
                        AI Writer
                      </span>
                    </div>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setActiveTab("rules");
                      setOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 mx-0.5 my-0.5 text-xs md:text-[13px] font-medium text-zinc-600 dark:text-zinc-300 rounded-lg cursor-pointer transition-all duration-200 ease-out data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10 data-[selected=true]:translate-x-0.5 outline-none group"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/90 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-xs group-data-[selected=true]:bg-white dark:group-data-[selected=true]:bg-white/10 group-data-[selected=true]:shadow-sm transition-all duration-200">
                      <BookOpen className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 group-data-[selected=true]:scale-105 transition-transform duration-200" />
                    </div>
                    <div className="flex flex-col relative z-10">
                      <span className="group-data-[selected=true]:text-amber-600 dark:group-data-[selected=true]:text-amber-300 transition-colors duration-200">
                        Rule Database
                      </span>
                    </div>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setActiveTab("templates");
                      setOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 mx-0.5 my-0.5 text-xs md:text-[13px] font-medium text-zinc-600 dark:text-zinc-300 rounded-lg cursor-pointer transition-all duration-200 ease-out data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10 data-[selected=true]:translate-x-0.5 outline-none group"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/90 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-xs group-data-[selected=true]:bg-white dark:group-data-[selected=true]:bg-white/10 group-data-[selected=true]:shadow-md transition-all duration-200">
                      <FileText className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 group-data-[selected=true]:scale-105 transition-transform duration-200" />
                    </div>
                    <div className="flex flex-col relative z-10">
                      <span className="group-data-[selected=true]:text-rose-600 dark:group-data-[selected=true]:text-rose-300 transition-colors duration-200">
                        Message Templates
                      </span>
                    </div>
                  </Command.Item>
                </Command.Group>

                <div className="mx-4 my-2 h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent"></div>

                <Command.Group
                  heading="Actions"
                  className="px-2 pt-2 pb-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase"
                >
                  <Command.Item
                    onSelect={() => {
                      setIsDark(!isDark);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 mx-0.5 my-0.5 text-xs md:text-[13px] font-medium text-zinc-600 dark:text-zinc-300 rounded-lg cursor-pointer transition-all duration-200 ease-out data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10 data-[selected=true]:translate-x-0.5 outline-none group"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/90 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-xs group-data-[selected=true]:bg-white dark:group-data-[selected=true]:bg-white/10 group-data-[selected=true]:shadow-sm transition-all duration-200">
                      {isDark ? (
                        <Sun className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400 group-data-[selected=true]:scale-105 transition-transform duration-200" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-zinc-500 group-data-[selected=true]:scale-105 transition-transform duration-200" />
                      )}
                    </div>
                    <div className="flex flex-col relative z-10 flex-1">
                      <span className="group-data-[selected=true]:text-zinc-900 dark:group-data-[selected=true]:text-white transition-colors duration-200">
                        Toggle {isDark ? "Light" : "Dark"} Mode
                      </span>
                    </div>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-white/60 dark:bg-black/40 rounded text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 border border-black/5 dark:border-white/10 shadow-xs opacity-0 group-data-[selected=true]:opacity-100 transition-all duration-200 group-data-[selected=true]:translate-x-0 translate-x-1">
                      ⌘D
                    </kbd>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setInspectText("");
                      setOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 mx-0.5 my-0.5 text-xs md:text-[13px] font-medium text-zinc-600 dark:text-zinc-300 rounded-lg cursor-pointer transition-all duration-200 ease-out data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10 data-[selected=true]:translate-x-0.5 outline-none group"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/90 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-xs group-data-[selected=true]:bg-white dark:group-data-[selected=true]:bg-white/10 group-data-[selected=true]:shadow-sm transition-all duration-200">
                      <Eraser className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-data-[selected=true]:scale-105 transition-transform duration-200" />
                    </div>
                    <div className="flex flex-col relative z-10 flex-1">
                      <span className="group-data-[selected=true]:text-zinc-900 dark:group-data-[selected=true]:text-white transition-colors duration-200">
                        Clear Inspector Text
                      </span>
                    </div>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-white/60 dark:bg-black/40 rounded text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 border border-black/5 dark:border-white/10 shadow-xs opacity-0 group-data-[selected=true]:opacity-100 transition-all duration-200 group-data-[selected=true]:translate-x-0 translate-x-1">
                      ⌘⇧E
                    </kbd>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setRawThoughts("");
                      setOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 mx-0.5 my-0.5 text-xs md:text-[13px] font-medium text-zinc-600 dark:text-zinc-300 rounded-lg cursor-pointer transition-all duration-200 ease-out data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10 data-[selected=true]:translate-x-0.5 outline-none group"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/90 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-xs group-data-[selected=true]:bg-white dark:group-data-[selected=true]:bg-white/10 group-data-[selected=true]:shadow-sm transition-all duration-200">
                      <Eraser className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-data-[selected=true]:scale-105 transition-transform duration-200" />
                    </div>
                    <div className="flex flex-col relative z-10 flex-1">
                      <span className="group-data-[selected=true]:text-zinc-900 dark:group-data-[selected=true]:text-white transition-colors duration-200">
                        Clear AI Writer Draft
                      </span>
                    </div>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-white/60 dark:bg-black/40 rounded text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 border border-black/5 dark:border-white/10 shadow-xs opacity-0 group-data-[selected=true]:opacity-100 transition-all duration-200 group-data-[selected=true]:translate-x-0 translate-x-1">
                      ⌘⇧R
                    </kbd>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setShowShortcuts(true);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 mx-0.5 my-0.5 text-xs md:text-[13px] font-medium text-zinc-600 dark:text-zinc-300 rounded-lg cursor-pointer transition-all duration-200 ease-out data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10 data-[selected=true]:translate-x-0.5 outline-none group"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/90 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-xs group-data-[selected=true]:bg-white dark:group-data-[selected=true]:bg-white/10 group-data-[selected=true]:shadow-sm transition-all duration-200">
                      <TerminalSquare className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 group-data-[selected=true]:scale-105 transition-transform duration-200" />
                    </div>
                    <div className="flex flex-col relative z-10 flex-1">
                      <span className="group-data-[selected=true]:text-cyan-600 dark:group-data-[selected=true]:text-cyan-300 transition-colors duration-200">
                        Show Keyboard Shortcuts
                      </span>
                    </div>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-white/60 dark:bg-black/40 rounded text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 border border-black/5 dark:border-white/10 shadow-xs opacity-0 group-data-[selected=true]:opacity-100 transition-all duration-200 group-data-[selected=true]:translate-x-0 translate-x-1">
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
