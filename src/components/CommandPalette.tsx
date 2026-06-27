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
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

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
            initial={{ opacity: 0, scale: 0.98, y: -15, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, y: -15, filter: "blur(12px)" }}
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 30,
              mass: 0.8,
            }}
            className="relative w-full max-w-2xl mx-4 bg-white/30 dark:bg-black/30 backdrop-blur-[60px] saturate-[2.5] border border-white/50 dark:border-white/10 rounded-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden font-sans ring-1 ring-white/70 dark:ring-white/10 before:absolute before:inset-0 before:bg-gradient-to-tr before:from-white/40 before:via-white/5 before:to-transparent dark:before:from-white/10 dark:before:via-white/0 dark:before:to-transparent before:pointer-events-none after:absolute after:inset-0 after:rounded-3xl after:ring-1 after:ring-inset after:ring-black/5 dark:after:ring-white/5 after:pointer-events-none"
          >
            <Command label="Global Command Palette" className="relative z-10">
              <div className="flex items-center border-b border-black/5 dark:border-white/10 px-5 bg-white/20 dark:bg-white/5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] dark:shadow-none">
                <Search className="w-5 h-5 text-indigo-500/80 dark:text-fuchsia-400/80 shrink-0" />
                <Command.Input
                  placeholder="Type a command or search..."
                  className="w-full bg-transparent border-none focus:ring-0 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500/80 dark:placeholder:text-zinc-400/80 py-6 px-4 outline-none text-[18px] font-medium tracking-tight"
                  autoFocus
                />
                <div className="hidden sm:flex items-center gap-1">
                  <kbd className="px-2.5 py-1.5 bg-white/40 dark:bg-black/40 rounded-lg text-[10px] font-bold text-zinc-500 dark:text-zinc-400 border border-white/60 dark:border-white/10 shadow-sm backdrop-blur-md">
                    ESC
                  </kbd>
                </div>
              </div>
              <Command.List className="max-h-[380px] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
                <Command.Empty className="py-12 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  No results found.
                </Command.Empty>

                <Command.Group
                  heading="Navigation"
                  className="px-3 py-2 text-[11px] font-bold text-zinc-500/80 dark:text-zinc-400/80 tracking-widest uppercase mb-1"
                >
                  <Command.Item
                    onSelect={() => {
                      setActiveTab("inspector");
                      setOpen(false);
                    }}
                    className="flex items-center gap-4 px-4 py-3 mx-1 my-1 text-[15px] font-medium text-zinc-800 dark:text-zinc-200 rounded-2xl cursor-pointer transition-all data-[selected=true]:bg-white/60 dark:data-[selected=true]:bg-white/10 data-[selected=true]:shadow-sm outline-none group border border-transparent data-[selected=true]:border-white/50 dark:data-[selected=true]:border-white/5 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-data-[selected=true]:from-indigo-500/10 dark:group-data-[selected=true]:from-fuchsia-500/10 group-data-[selected=true]:via-transparent transition-colors"></div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/60 dark:bg-black/40 shadow-sm border border-white/70 dark:border-white/5 group-data-[selected=true]:bg-indigo-500 dark:group-data-[selected=true]:bg-fuchsia-500 group-data-[selected=true]:border-transparent group-data-[selected=true]:shadow-md transition-all relative z-10">
                      <Shield className="w-4 h-4 text-indigo-500 dark:text-fuchsia-400 group-data-[selected=true]:text-white drop-shadow-sm" />
                    </div>
                    <span className="relative z-10 group-data-[selected=true]:font-semibold group-data-[selected=true]:text-indigo-900 dark:group-data-[selected=true]:text-fuchsia-100 transition-colors">
                      ToS Inspector
                    </span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setActiveTab("composer");
                      setOpen(false);
                    }}
                    className="flex items-center gap-4 px-4 py-3 mx-1 my-1 text-[15px] font-medium text-zinc-800 dark:text-zinc-200 rounded-2xl cursor-pointer transition-all data-[selected=true]:bg-white/60 dark:data-[selected=true]:bg-white/10 data-[selected=true]:shadow-sm outline-none group border border-transparent data-[selected=true]:border-white/50 dark:data-[selected=true]:border-white/5 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-data-[selected=true]:from-emerald-500/10 dark:group-data-[selected=true]:from-emerald-500/10 group-data-[selected=true]:via-transparent transition-colors"></div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/60 dark:bg-black/40 shadow-sm border border-white/70 dark:border-white/5 group-data-[selected=true]:bg-emerald-500 dark:group-data-[selected=true]:bg-emerald-500 group-data-[selected=true]:border-transparent group-data-[selected=true]:shadow-md transition-all relative z-10">
                      <PenTool className="w-4 h-4 text-emerald-500 group-data-[selected=true]:text-white drop-shadow-sm" />
                    </div>
                    <span className="relative z-10 group-data-[selected=true]:font-semibold group-data-[selected=true]:text-emerald-900 dark:group-data-[selected=true]:text-emerald-100 transition-colors">
                      AI Writer
                    </span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setActiveTab("rules");
                      setOpen(false);
                    }}
                    className="flex items-center gap-4 px-4 py-3 mx-1 my-1 text-[15px] font-medium text-zinc-800 dark:text-zinc-200 rounded-2xl cursor-pointer transition-all data-[selected=true]:bg-white/60 dark:data-[selected=true]:bg-white/10 data-[selected=true]:shadow-sm outline-none group border border-transparent data-[selected=true]:border-white/50 dark:data-[selected=true]:border-white/5 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/0 group-data-[selected=true]:from-amber-500/10 dark:group-data-[selected=true]:from-amber-500/10 group-data-[selected=true]:via-transparent transition-colors"></div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/60 dark:bg-black/40 shadow-sm border border-white/70 dark:border-white/5 group-data-[selected=true]:bg-amber-500 dark:group-data-[selected=true]:bg-amber-500 group-data-[selected=true]:border-transparent group-data-[selected=true]:shadow-md transition-all relative z-10">
                      <BookOpen className="w-4 h-4 text-amber-500 group-data-[selected=true]:text-white drop-shadow-sm" />
                    </div>
                    <span className="relative z-10 group-data-[selected=true]:font-semibold group-data-[selected=true]:text-amber-900 dark:group-data-[selected=true]:text-amber-100 transition-colors">
                      Rule Database
                    </span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setActiveTab("templates");
                      setOpen(false);
                    }}
                    className="flex items-center gap-4 px-4 py-3 mx-1 my-1 text-[15px] font-medium text-zinc-800 dark:text-zinc-200 rounded-2xl cursor-pointer transition-all data-[selected=true]:bg-white/60 dark:data-[selected=true]:bg-white/10 data-[selected=true]:shadow-sm outline-none group border border-transparent data-[selected=true]:border-white/50 dark:data-[selected=true]:border-white/5 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/0 to-rose-500/0 group-data-[selected=true]:from-rose-500/10 dark:group-data-[selected=true]:from-rose-500/10 group-data-[selected=true]:via-transparent transition-colors"></div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/60 dark:bg-black/40 shadow-sm border border-white/70 dark:border-white/5 group-data-[selected=true]:bg-rose-500 dark:group-data-[selected=true]:bg-rose-500 group-data-[selected=true]:border-transparent group-data-[selected=true]:shadow-md transition-all relative z-10">
                      <FileText className="w-4 h-4 text-rose-500 group-data-[selected=true]:text-white drop-shadow-sm" />
                    </div>
                    <span className="relative z-10 group-data-[selected=true]:font-semibold group-data-[selected=true]:text-rose-900 dark:group-data-[selected=true]:text-rose-100 transition-colors">
                      Message Templates
                    </span>
                  </Command.Item>
                </Command.Group>

                <div className="mx-6 my-3 border-t border-black/5 dark:border-white/5 relative">
                  <div className="absolute inset-x-0 -top-[1px] h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent"></div>
                </div>

                <Command.Group
                  heading="Actions"
                  className="px-3 py-2 text-[11px] font-bold text-zinc-500/80 dark:text-zinc-400/80 tracking-widest uppercase mb-1"
                >
                  <Command.Item
                    onSelect={() => {
                      setIsDark(!isDark);
                      setOpen(false);
                    }}
                    className="flex items-center gap-4 px-4 py-3 mx-1 my-1 text-[15px] font-medium text-zinc-800 dark:text-zinc-200 rounded-2xl cursor-pointer transition-all data-[selected=true]:bg-white/60 dark:data-[selected=true]:bg-white/10 data-[selected=true]:shadow-sm outline-none group border border-transparent data-[selected=true]:border-white/50 dark:data-[selected=true]:border-white/5 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/0 via-zinc-500/0 to-zinc-500/0 group-data-[selected=true]:from-zinc-500/10 dark:group-data-[selected=true]:from-white/5 group-data-[selected=true]:via-transparent transition-colors"></div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/60 dark:bg-black/40 shadow-sm border border-white/70 dark:border-white/5 group-data-[selected=true]:bg-zinc-800 dark:group-data-[selected=true]:bg-zinc-700 group-data-[selected=true]:border-transparent group-data-[selected=true]:shadow-md transition-all relative z-10">
                      {isDark ? (
                        <Sun className="w-4 h-4 text-yellow-500 group-data-[selected=true]:text-yellow-400 drop-shadow-sm" />
                      ) : (
                        <Moon className="w-4 h-4 text-zinc-600 group-data-[selected=true]:text-white drop-shadow-sm" />
                      )}
                    </div>
                    <span className="relative z-10 group-data-[selected=true]:font-semibold group-data-[selected=true]:text-zinc-900 dark:group-data-[selected=true]:text-white transition-colors">
                      Toggle {isDark ? "Light" : "Dark"} Mode
                    </span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setInspectText("");
                      setOpen(false);
                    }}
                    className="flex items-center gap-4 px-4 py-3 mx-1 my-1 text-[15px] font-medium text-zinc-800 dark:text-zinc-200 rounded-2xl cursor-pointer transition-all data-[selected=true]:bg-white/60 dark:data-[selected=true]:bg-white/10 data-[selected=true]:shadow-sm outline-none group border border-transparent data-[selected=true]:border-white/50 dark:data-[selected=true]:border-white/5 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/0 via-zinc-500/0 to-zinc-500/0 group-data-[selected=true]:from-zinc-500/10 dark:group-data-[selected=true]:from-white/5 group-data-[selected=true]:via-transparent transition-colors"></div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/60 dark:bg-black/40 shadow-sm border border-white/70 dark:border-white/5 group-data-[selected=true]:bg-zinc-800 dark:group-data-[selected=true]:bg-zinc-700 group-data-[selected=true]:border-transparent group-data-[selected=true]:shadow-md transition-all relative z-10">
                      <Eraser className="w-4 h-4 text-zinc-500 group-data-[selected=true]:text-white drop-shadow-sm" />
                    </div>
                    <span className="relative z-10 group-data-[selected=true]:font-semibold group-data-[selected=true]:text-zinc-900 dark:group-data-[selected=true]:text-white transition-colors">
                      Clear Inspector Text
                    </span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setRawThoughts("");
                      setOpen(false);
                    }}
                    className="flex items-center gap-4 px-4 py-3 mx-1 my-1 text-[15px] font-medium text-zinc-800 dark:text-zinc-200 rounded-2xl cursor-pointer transition-all data-[selected=true]:bg-white/60 dark:data-[selected=true]:bg-white/10 data-[selected=true]:shadow-sm outline-none group border border-transparent data-[selected=true]:border-white/50 dark:data-[selected=true]:border-white/5 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/0 via-zinc-500/0 to-zinc-500/0 group-data-[selected=true]:from-zinc-500/10 dark:group-data-[selected=true]:from-white/5 group-data-[selected=true]:via-transparent transition-colors"></div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/60 dark:bg-black/40 shadow-sm border border-white/70 dark:border-white/5 group-data-[selected=true]:bg-zinc-800 dark:group-data-[selected=true]:bg-zinc-700 group-data-[selected=true]:border-transparent group-data-[selected=true]:shadow-md transition-all relative z-10">
                      <Eraser className="w-4 h-4 text-zinc-500 group-data-[selected=true]:text-white drop-shadow-sm" />
                    </div>
                    <span className="relative z-10 group-data-[selected=true]:font-semibold group-data-[selected=true]:text-zinc-900 dark:group-data-[selected=true]:text-white transition-colors">
                      Clear AI Writer Draft
                    </span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setShowShortcuts(true);
                      setOpen(false);
                    }}
                    className="flex items-center gap-4 px-4 py-3 mx-1 my-1 text-[15px] font-medium text-zinc-800 dark:text-zinc-200 rounded-2xl cursor-pointer transition-all data-[selected=true]:bg-white/60 dark:data-[selected=true]:bg-white/10 data-[selected=true]:shadow-sm outline-none group border border-transparent data-[selected=true]:border-white/50 dark:data-[selected=true]:border-white/5 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-data-[selected=true]:from-cyan-500/10 dark:group-data-[selected=true]:from-cyan-500/10 group-data-[selected=true]:via-transparent transition-colors"></div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/60 dark:bg-black/40 shadow-sm border border-white/70 dark:border-white/5 group-data-[selected=true]:bg-cyan-500 dark:group-data-[selected=true]:bg-cyan-600 group-data-[selected=true]:border-transparent group-data-[selected=true]:shadow-md transition-all relative z-10">
                      <TerminalSquare className="w-4 h-4 text-cyan-500 group-data-[selected=true]:text-white drop-shadow-sm" />
                    </div>
                    <span className="relative z-10 group-data-[selected=true]:font-semibold group-data-[selected=true]:text-cyan-900 dark:group-data-[selected=true]:text-cyan-100 transition-colors">
                      Show Keyboard Shortcuts
                    </span>
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
