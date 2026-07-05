import React, { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { uid } from "@/lib/utils";
import type { ToastItem, ToastType } from "@/types";

type PushFn = (msg: string, type?: ToastType, opts?: { title?: string; duration?: number }) => void;

const ToastCtx = createContext<PushFn | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push: PushFn = useCallback((msg, type = "info", opts = {}) => {
    const id = uid("toast");
    setToasts((t) => [...t, { id, msg, type, title: opts.title }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), opts.duration || 3400);
  }, []);

  const dismiss = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  const icons: Record<ToastType, typeof Info> = { success: CheckCircle2, error: XCircle, info: Info, warning: AlertTriangle };
  const colors: Record<ToastType, { c: string; bg: string }> = {
    success: { c: "var(--accent)", bg: "var(--accent-soft)" },
    error: { c: "var(--danger)", bg: "var(--danger-soft)" },
    info: { c: "var(--blue)", bg: "var(--blue-soft)" },
    warning: { c: "var(--amber)", bg: "var(--amber-soft)" },
  };

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed z-[200] top-4 right-4 flex flex-col gap-2 w-[92vw] max-w-[360px] no-print">
        <AnimatePresence>
          {toasts.map((t) => {
            const Ic = icons[t.type];
            const col = colors[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 24, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                className="card p-3 flex items-start gap-3 shadow-lg2"
              >
                <div className="rounded-full p-1.5 flex-shrink-0" style={{ background: col.bg, color: col.c }}>
                  <Ic size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  {t.title && <div className="text-sm font-bold mb-0.5 text-text">{t.title}</div>}
                  <div className="text-[13px] text-text-dim">{t.msg}</div>
                </div>
                <button onClick={() => dismiss(t.id)} className="flex-shrink-0 text-text-faint">
                  <X size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast(): PushFn {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
