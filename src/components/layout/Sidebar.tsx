import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Barcode as BarcodeIcon } from "lucide-react";
import { cx, fmtNum } from "@/lib/utils";
import { NAV_SECTIONS } from "./nav";
import type { NavKey } from "@/types";

interface SidebarProps {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  open: boolean;
  onCloseMobile: () => void;
  lowCount: number;
  shopName: string;
}

export function Sidebar({ active, onNavigate, open, onCloseMobile, lowCount, shopName }: SidebarProps) {
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] lg:hidden no-print bg-black/50"
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>
      <aside
        className={cx(
          "glass scrollbar fixed lg:sticky top-0 left-0 h-screen z-[95] flex flex-col flex-shrink-0 no-print transition-transform duration-300 border-r border-border",
          "w-[264px] overflow-y-auto",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 flex-shrink-0">
          <div className="rounded-2xl p-2.5 flex-shrink-0 bg-accent text-white">
            <Zap size={20} fill="currentColor" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-[15px] truncate text-text">{shopName}</div>
            <div className="text-[11px] font-semibold text-text-faint">ইনভেন্টরি ম্যানেজমেন্ট</div>
          </div>
          <button onClick={onCloseMobile} className="ml-auto lg:hidden text-text-faint">
            <X size={20} />
          </button>
        </div>
        <div className="px-3 flex-1">
          {NAV_SECTIONS.map((sec) => (
            <div key={sec.title} className="mb-4">
              <div className="px-3 mb-1.5 text-[10.5px] font-bold tracking-wider uppercase text-text-faint">{sec.title}</div>
              {sec.items.map((it) => (
                <div key={it.key} className={cx("sidebar-item", active === it.key && "active")} onClick={() => onNavigate(it.key)}>
                  <it.icon size={17} className="flex-shrink-0" style={{ color: active === it.key ? "var(--accent)" : undefined }} />
                  <span className="flex-1">{it.label}</span>
                  {it.badgeKey === "low" && lowCount > 0 && (
                    <span className="num text-[10.5px] font-extrabold rounded-full px-1.5 py-0.5 bg-danger text-white" style={{ minWidth: 18, textAlign: "center" }}>
                      {fmtNum(lowCount)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="px-4 pb-4 pt-2 flex-shrink-0">
          <div className="card p-3 flex items-center gap-2 border-0 bg-accent-soft">
            <BarcodeIcon size={18} className="text-accent" />
            <div className="text-[11px] leading-snug font-semibold text-accent-ink">বারকোড রেডি সিস্টেম সক্রিয়</div>
          </div>
        </div>
      </aside>
    </>
  );
}
