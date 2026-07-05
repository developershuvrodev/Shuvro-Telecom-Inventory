import type { Product, StockStatus } from "@/types";

export function cx(...args: (string | false | null | undefined)[]) {
  return args.filter(Boolean).join(" ");
}

export function fmtMoney(n: number): string {
  const num = Math.round(Number(n) || 0);
  const neg = num < 0;
  let s = Math.abs(num).toString();
  let last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  if (rest !== "") last3 = "," + last3;
  rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return (neg ? "-" : "") + "৳" + rest + last3;
}

export function fmtNum(n: number | undefined | null): string {
  return Number(n || 0).toLocaleString("en-US");
}

export function fmtDate(d: string | number | Date): string {
  const dt = new Date(d);
  return dt.toLocaleDateString("bn-BD", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateTime(d: string | number | Date): string {
  const dt = new Date(d);
  return (
    dt.toLocaleDateString("bn-BD", { day: "2-digit", month: "short", year: "numeric" }) +
    ", " +
    dt.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })
  );
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function stockStatus(p: Pick<Product, "stock" | "minStock">): StockStatus {
  if (p.stock <= 0) return { key: "out", label: "স্টক শেষ", color: "var(--danger)", bg: "var(--danger-soft)" };
  if (p.stock <= p.minStock) return { key: "low", label: "লো স্টক", color: "var(--amber)", bg: "var(--amber-soft)" };
  return { key: "ok", label: "পর্যাপ্ত", color: "var(--accent)", bg: "var(--accent-soft)" };
}
