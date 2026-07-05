import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, Bell, Sun, Moon, AlertTriangle } from "lucide-react";

interface TopbarProps {
  onMenu: () => void;
  dark: boolean;
  onToggleDark: () => void;
  query: string;
  onQuery: (v: string) => void;
  onSearchEnter: () => void;
  lowCount: number;
  searchRef: React.RefObject<HTMLInputElement>;
}

export function Topbar({ onMenu, dark, onToggleDark, query, onQuery, onSearchEnter, lowCount, searchRef }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  return (
    <div className="glass sticky top-0 z-[80] no-print border-b border-border">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
        <button onClick={onMenu} className="lg:hidden btn-ghost p-2"><Menu size={19} /></button>
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onSearchEnter(); }}
            placeholder="পণ্য, SKU বা বারকোড খুঁজুন…  ( / )"
            className="input pl-9 text-[13.5px]"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <button onClick={() => setNotifOpen((v) => !v)} className="btn-ghost p-2 relative">
              <Bell size={18} />
              {lowCount > 0 && (
                <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-danger animate-pulse" />
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  className="card absolute right-0 top-11 w-72 p-3 z-50 shadow-lg2"
                >
                  <div className="font-bold text-[13px] mb-2 text-text">নোটিফিকেশন</div>
                  {lowCount > 0 ? (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-soft">
                      <AlertTriangle size={15} className="text-amber flex-shrink-0 mt-0.5" />
                      <div className="text-[12.5px] text-text-dim">{lowCount} টি পণ্যের স্টক কম বা শেষ হয়ে গেছে।</div>
                    </div>
                  ) : (
                    <div className="text-[12.5px] py-3 text-center text-text-faint">কোনো নতুন নোটিফিকেশন নেই</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={onToggleDark} className="btn-ghost p-2">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
