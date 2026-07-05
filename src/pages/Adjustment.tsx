import React, { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { EmptyState, FormField, Select } from "@/components/ui/Primitives";
import { cx, fmtNum, uid } from "@/lib/utils";
import type { Product, StockTx, ShopSettings, ToastType } from "@/types";

interface AdjustmentProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  history: StockTx[];
  addHistory: (tx: StockTx) => void;
  addToast: (msg: string, type?: ToastType) => void;
  settings: ShopSettings;
}

export function Adjustment({ products, setProducts, history, addHistory, addToast, settings }: AdjustmentProps) {
  const [productId, setProductId] = useState("");
  const [actual, setActual] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const product = products.find((p) => p.id === productId);
  const diff = product && actual !== "" && !isNaN(Number(actual)) ? Number(actual) - product.stock : null;

  const reasons = ["ফিজিক্যাল রিকাউন্ট", "ড্যামেজড আইটেম বাদ", "হারানো পণ্য সমন্বয়", "চুরি/ক্ষতি", "অন্যান্য"];

  const submit = () => {
    const e: Record<string, string> = {};
    if (!productId) e.productId = "একটি পণ্য নির্বাচন করুন";
    if (actual === "" || isNaN(Number(actual)) || Number(actual) < 0) e.actual = "সঠিক পরিমাণ দিন";
    if (!reason) e.reason = "একটি কারণ নির্বাচন করুন";
    setErrors(e);
    if (Object.keys(e).length || !product) return;
    if (diff === 0) { addToast("নতুন পরিমাণ বর্তমান স্টকের সমান — কোনো সমন্বয়ের প্রয়োজন নেই", "info"); return; }

    const prevStock = product.stock;
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock: Number(actual) } : p)));
    addHistory({
      id: uid("tx"), date: new Date().toISOString(), productId, productName: product.name,
      type: "adjustment", qty: Math.abs(diff ?? 0), prevStock, newStock: Number(actual), reason,
      reference: `ADJ-${Math.floor(300 + Math.random() * 700)}`, by: settings.ownerName,
    });
    addToast(`${product.name} — স্টক ${prevStock} থেকে ${actual}-এ সমন্বয় করা হয়েছে`, "success");
    setProductId(""); setActual(""); setReason(""); setErrors({});
  };

  const recentAdjustments = history.filter((h) => h.type === "adjustment").slice(0, 10);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-[20px] font-extrabold text-text">স্টক সমন্বয়</h1>
        <p className="text-[13px] mt-0.5 text-text-faint">ফিজিক্যাল কাউন্টের সাথে মিলিয়ে সিস্টেমের স্টক সংশোধন করুন</p>
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="card p-4 lg:col-span-2 space-y-3.5">
          <FormField label="পণ্য নির্বাচন করুন" required error={errors.productId}>
            <Select value={productId} onChange={(v) => { setProductId(v); setErrors((e) => ({ ...e, productId: "" })); }} options={products.map((p) => ({ value: p.id, label: `${p.name} (সিস্টেম স্টকঃ ${p.stock})` }))} error={errors.productId} />
          </FormField>
          {product && (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="card p-3 text-center border-0 bg-bg-soft">
                <div className="num text-[19px] font-extrabold text-text">{fmtNum(product.stock)}</div>
                <div className="text-[11px] font-semibold text-text-faint">সিস্টেম স্টক</div>
              </div>
              <div className="card p-3 text-center border-0" style={{ background: diff == null ? "var(--bg-soft)" : diff > 0 ? "var(--accent-soft)" : diff < 0 ? "var(--danger-soft)" : "var(--bg-soft)" }}>
                <div className="num text-[19px] font-extrabold" style={{ color: diff == null ? "var(--text)" : diff > 0 ? "var(--accent)" : diff < 0 ? "var(--danger)" : "var(--text)" }}>{diff == null ? "—" : (diff > 0 ? "+" : "") + fmtNum(diff)}</div>
                <div className="text-[11px] font-semibold text-text-faint">পার্থক্য</div>
              </div>
            </div>
          )}
          <FormField label="প্রকৃত গণনাকৃত পরিমাণ" required error={errors.actual}>
            <input type="number" className={cx("input", errors.actual && "input-err")} value={actual} onChange={(e) => { setActual(e.target.value); setErrors((er) => ({ ...er, actual: "" })); }} placeholder="ফিজিক্যাল কাউন্টের ফলাফল লিখুন" />
          </FormField>
          <FormField label="সমন্বয়ের কারণ" required error={errors.reason}>
            <Select value={reason} onChange={(v) => { setReason(v); setErrors((e) => ({ ...e, reason: "" })); }} options={reasons.map((r) => ({ value: r, label: r }))} error={errors.reason} />
          </FormField>
          <button onClick={submit} className="btn-primary w-full justify-center py-2.5"><SlidersHorizontal size={16} />সমন্বয় নিশ্চিত করুন</button>
        </div>
        <div className="card p-4 lg:col-span-3">
          <h3 className="font-bold text-[14.5px] mb-3 text-text">সাম্প্রতিক সমন্বয়সমূহ</h3>
          {recentAdjustments.length === 0 ? (
            <EmptyState icon={SlidersHorizontal} title="কোনো সমন্বয় নেই" />
          ) : (
            <div className="space-y-1">
              {recentAdjustments.map((h) => (
                <div key={h.id} className="flex items-center gap-3 py-2.5 px-2 border-b border-border last:border-0">
                  <div className="rounded-lg p-2 flex-shrink-0 bg-blue-soft text-blue"><SlidersHorizontal size={15} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold truncate text-text">{h.productName}</div>
                    <div className="text-[11px] text-text-faint">{h.reason} · {h.by}</div>
                  </div>
                  <div className="num text-[12.5px] font-bold flex-shrink-0 text-text-dim">{fmtNum(h.prevStock)} → {fmtNum(h.newStock)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
