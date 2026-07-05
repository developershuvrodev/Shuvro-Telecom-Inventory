import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, AlertTriangle, type LucideIcon } from "lucide-react";
import { cx } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: number;
  footer?: React.ReactNode;
  icon?: LucideIcon;
}

export function Modal({ open, onClose, title, subtitle, children, width = 560, footer, icon: Icon }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-start sm:items-center justify-center p-0 sm:p-6 no-print"
          style={{ background: "rgba(8,12,20,0.55)", backdropFilter: "blur(4px)" }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="card scrollbar w-full sm:w-auto overflow-hidden flex flex-col shadow-lg2 rounded-2xl2"
            style={{ maxWidth: width, maxHeight: "94vh" }}
          >
            <div className="flex items-start justify-between gap-3 px-5 py-4 flex-shrink-0 border-b border-border">
              <div className="flex items-center gap-3 min-w-0">
                {Icon && (
                  <div className="rounded-xl p-2 flex-shrink-0 bg-accent-soft text-accent">
                    <Icon size={18} />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-[16px] truncate text-text">{title}</h3>
                  {subtitle && <p className="text-[12.5px] mt-0.5 text-text-faint">{subtitle}</p>}
                </div>
              </div>
              <button onClick={onClose} className="rounded-full p-1.5 flex-shrink-0 text-text-faint">
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto scrollbar">{children}</div>
            {footer && <div className="px-5 py-4 flex-shrink-0 flex items-center justify-end gap-2 border-t border-border">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  danger?: boolean;
  confirmLabel?: string;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, danger = true, confirmLabel = "নিশ্চিত করুন" }: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[160] flex items-center justify-center p-6 no-print"
          style={{ background: "rgba(8,12,20,0.55)", backdropFilter: "blur(4px)" }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="card p-5 w-full shadow-lg2 rounded-2xl2"
            style={{ maxWidth: 400 }}
          >
            <div
              className="flex items-center justify-center rounded-full p-3 mx-auto mb-3 w-fit"
              style={{ background: danger ? "var(--danger-soft)" : "var(--accent-soft)", color: danger ? "var(--danger)" : "var(--accent)" }}
            >
              <AlertTriangle size={22} />
            </div>
            <h3 className="text-center font-bold text-[16px] mb-1.5 text-text">{title}</h3>
            <p className="text-center text-[13.5px] mb-5 text-text-dim">{message}</p>
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-ghost flex-1 justify-center">বাতিল</button>
              <button
                onClick={() => { onConfirm(); onClose(); }}
                className={cx("flex-1 justify-center", danger ? "btn-danger" : "btn-primary")}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
