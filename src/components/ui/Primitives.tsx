import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpDown, AlertCircle, PackageSearch, TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cx, fmtNum } from "@/lib/utils";

/* Badge */
export function Badge({
  children, color = "var(--accent)", bg = "var(--accent-soft)", icon: Icon,
}: { children: React.ReactNode; color?: string; bg?: string; icon?: LucideIcon }) {
  return (
    <span className="tag" style={{ color, background: bg }}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

/* Skeleton */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={cx("shimmer rounded-lg", className)} />;
}

/* Empty state */
export function EmptyState({
  icon: Icon = PackageSearch, title, subtitle, action,
}: { icon?: LucideIcon; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="rounded-2xl p-4 mb-4 bg-bg-soft text-text-faint">
        <Icon size={30} />
      </div>
      <h4 className="font-bold text-[15px] mb-1 text-text">{title}</h4>
      {subtitle && <p className="text-[13px] max-w-xs mb-4 text-text-faint">{subtitle}</p>}
      {action}
    </div>
  );
}

/* Stat card */
export function StatCard({
  icon: Icon, label, value, sub, trend, color = "var(--accent)", bg = "var(--accent-soft)", onClick,
}: { icon: LucideIcon; label: string; value: string; sub?: string; trend?: number; color?: string; bg?: string; onClick?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cx("card card-hover p-4", onClick && "cursor-pointer")}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="rounded-xl p-2.5" style={{ background: bg, color }}>
          <Icon size={19} />
        </div>
        {trend != null && (
          <span className="tag" style={{ color: trend >= 0 ? "var(--accent)" : "var(--danger)", background: trend >= 0 ? "var(--accent-soft)" : "var(--danger-soft)" }}>
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="num text-[22px] font-extrabold leading-none mb-1 text-text">{value}</div>
      <div className="text-[12.5px] font-semibold text-text-dim">{label}</div>
      {sub && <div className="text-[11.5px] mt-1 text-text-faint">{sub}</div>}
    </motion.div>
  );
}

/* Select */
export function Select({
  value, onChange, options, placeholder = "নির্বাচন করুন", className = "", error,
}: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string; className?: string; error?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cx("input", error && "input-err", className)}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

/* Form field wrapper */
export function FormField({
  label, error, children, required,
}: { label: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
      {error && (
        <div className="text-[11.5px] mt-1 flex items-center gap-1 text-danger">
          <AlertCircle size={12} />{error}
        </div>
      )}
    </div>
  );
}

/* Switch */
export function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      className="w-[42px] h-6 rounded-full relative cursor-pointer transition-colors flex-shrink-0"
      style={{ background: on ? "var(--accent)" : "var(--border)" }}
      onClick={() => onChange(!on)}
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow"
        animate={{ x: on ? 18 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  );
}

/* Pagination */
export function Pagination({
  page, totalPages, onChange, totalItems,
}: { page: number; totalPages: number; onChange: (p: number) => void; totalItems: number }) {
  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between px-1 py-2 text-[12.5px] text-text-faint">
        <span>মোট {fmtNum(totalItems)} টি ফলাফল</span>
      </div>
    );
  }
  const pages: number[] = [];
  const start = Math.max(1, page - 1);
  const end = Math.min(totalPages, start + 2);
  for (let i = start; i <= end; i++) pages.push(i);
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 px-1 py-2">
      <span className="text-[12.5px] text-text-faint">
        মোট {fmtNum(totalItems)} টি ফলাফল · পৃষ্ঠা {fmtNum(page)}/{fmtNum(totalPages)}
      </span>
      <div className="flex items-center gap-1">
        <button disabled={page === 1} onClick={() => onChange(page - 1)} className="btn-ghost px-2 py-1.5"><ChevronLeft size={15} /></button>
        {start > 1 && <span className="px-1 text-[12px] text-text-faint">…</span>}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className="px-3 py-1.5 rounded-xl text-sm font-semibold"
            style={p === page ? { background: "var(--accent)", color: "#fff" } : { color: "var(--text-dim)" }}
          >
            {p}
          </button>
        ))}
        {end < totalPages && <span className="px-1 text-[12px] text-text-faint">…</span>}
        <button disabled={page === totalPages} onClick={() => onChange(page + 1)} className="btn-ghost px-2 py-1.5"><ChevronRight size={15} /></button>
      </div>
    </div>
  );
}

/* Sortable table header cell */
export interface SortState { key: string; dir: "asc" | "desc"; }
export function SortHeader({
  label, sortKey, sort, onSort,
}: { label: string; sortKey: string; sort: SortState; onSort: (key: string) => void }) {
  const active = sort.key === sortKey;
  return (
    <th onClick={() => onSort(sortKey)} className="cursor-pointer select-none">
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown size={11} style={{ opacity: active ? 1 : 0.35, color: active ? "var(--accent)" : "inherit" }} />
      </span>
    </th>
  );
}

/* Barcode strip visual */
export function BarcodeStrip({ code = "", height = 26, className = "" }: { code?: string; height?: number; className?: string }) {
  const bars = React.useMemo(() => (code || "0").split("").map((c) => 1 + (c.charCodeAt(0) % 4)), [code]);
  return (
    <div className={cx("barcode-strip", className)} style={{ height }}>
      {bars.map((w, i) => (
        <span key={i} style={{ width: w, height: "100%" }} />
      ))}
    </div>
  );
}
