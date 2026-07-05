import React, { useMemo, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, PackagePlus, PackageMinus, ArrowRightLeft } from "lucide-react";
import { EmptyState, FormField, Pagination, Select } from "@/components/ui/Primitives";
import { ProductAvatar } from "@/components/shared/ProductAvatar";
import { cx, fmtDate, fmtNum, uid } from "@/lib/utils";
import type { Product, StockTx, ShopSettings, ToastType } from "@/types";

interface StockFlowProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  history: StockTx[];
  addHistory: (tx: StockTx) => void;
  addToast: (msg: string, type?: ToastType) => void;
  settings: ShopSettings;
}

export function StockFlow({ products, setProducts, history, addHistory, addToast, settings }: StockFlowProps) {
  const [type, setType] = useState<"in" | "out">("in");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filterType, setFilterType] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const product = products.find((p) => p.id === productId);
  const reasonsIn = ["নতুন চালান গ্রহণ", "সাপ্লায়ার রিটার্ন প্রতিস্থাপন", "স্টক পুনঃপূরণ", "অন্যান্য"];
  const reasonsOut = ["বিক্রয়", "শোরুম ডিসপ্লে", "গ্রাহক রিটার্ন প্রক্রিয়া", "ড্যামেজ/নষ্ট", "অন্যান্য"];

  const submit = () => {
    const e: Record<string, string> = {};
    if (!productId) e.productId = "একটি পণ্য নির্বাচন করুন";
    if (!qty || isNaN(Number(qty)) || Number(qty) <= 0) e.qty = "সঠিক পরিমাণ দিন";
    if (!reason) e.reason = "একটি কারণ নির্বাচন করুন";
    if (type === "out" && product && Number(qty) > product.stock) e.qty = `স্টকে মাত্র ${product.stock} ইউনিট আছে`;
    setErrors(e);
    if (Object.keys(e).length || !product) return;

    const prevStock = product.stock;
    const newStock = type === "in" ? prevStock + Number(qty) : prevStock - Number(qty);
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)));
    addHistory({
      id: uid("tx"), date: new Date().toISOString(), productId, productName: product.name,
      type, qty: Number(qty), prevStock, newStock, reason,
      reference: reference || (type === "in" ? `PO-${Math.floor(2000 + Math.random() * 900)}` : `INV-${Math.floor(5000 + Math.random() * 900)}`),
      by: settings.ownerName,
    });
    addToast(`${product.name} — ${type === "in" ? "স্টক ইন" : "স্টক আউট"} সফল হয়েছে (নতুন স্টকঃ ${newStock})`, "success");
    setProductId(""); setQty(""); setReason(""); setReference(""); setErrors({});
  };

  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      const matchType = !filterType || h.type === filterType;
      const q = query.trim().toLowerCase();
      const matchQ = !q || h.productName.toLowerCase().includes(q) || h.reference.toLowerCase().includes(q);
      return matchType && matchQ && h.type !== "adjustment";
    });
  }, [history, filterType, query]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  const pageItems = filteredHistory.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-[20px] font-extrabold text-text">স্টক ইন / আউট</h1>
        <p className="text-[13px] mt-0.5 text-text-faint">পণ্যের স্টক গ্রহণ বা প্রদানের হিসাব রাখুন</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="card p-4 lg:col-span-2">
          <div className="flex gap-2 mb-4 p-1 rounded-xl bg-bg-soft">
            <button onClick={() => setType("in")} className="flex-1 justify-center inline-flex items-center gap-2 rounded-xl py-2 text-sm font-semibold" style={type === "in" ? { background: "var(--accent)", color: "#fff" } : { color: "var(--text-dim)" }}>
              <ArrowDownToLine size={15} />স্টক ইন
            </button>
            <button onClick={() => setType("out")} className="flex-1 justify-center inline-flex items-center gap-2 rounded-xl py-2 text-sm font-semibold" style={type === "out" ? { background: "var(--amber)", color: "#fff" } : { color: "var(--text-dim)" }}>
              <ArrowUpFromLine size={15} />স্টক আউট
            </button>
          </div>

          <div className="space-y-3.5">
            <FormField label="পণ্য নির্বাচন করুন" required error={errors.productId}>
              <Select value={productId} onChange={(v) => { setProductId(v); setErrors((e) => ({ ...e, productId: "" })); }} options={products.map((p) => ({ value: p.id, label: `${p.name} (স্টকঃ ${p.stock})` }))} error={errors.productId} />
            </FormField>
            {product && (
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-bg-soft">
                <ProductAvatar product={product} size={34} />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold truncate text-text">{product.name}</div>
                  <div className="text-[11.5px] text-text-faint">বর্তমান স্টকঃ {fmtNum(product.stock)} ইউনিট</div>
                </div>
              </div>
            )}
            <FormField label="পরিমাণ" required error={errors.qty}>
              <input type="number" className={cx("input", errors.qty && "input-err")} value={qty} onChange={(e) => { setQty(e.target.value); setErrors((er) => ({ ...er, qty: "" })); }} placeholder="0" />
            </FormField>
            <FormField label="কারণ" required error={errors.reason}>
              <Select value={reason} onChange={(v) => { setReason(v); setErrors((e) => ({ ...e, reason: "" })); }} options={(type === "in" ? reasonsIn : reasonsOut).map((r) => ({ value: r, label: r }))} error={errors.reason} />
            </FormField>
            <FormField label="রেফারেন্স নম্বর (ঐচ্ছিক)">
              <input className="input" value={reference} onChange={(e) => setReference(e.target.value)} placeholder={type === "in" ? "PO-2001" : "INV-5001"} />
            </FormField>
            <button onClick={submit} className="w-full justify-center py-2.5 inline-flex items-center gap-2 rounded-xl text-sm font-semibold" style={{ background: type === "in" ? "var(--accent)" : "var(--amber)", color: "#fff" }}>
              {type === "in" ? <PackagePlus size={16} /> : <PackageMinus size={16} />}
              {type === "in" ? "স্টক ইন নিশ্চিত করুন" : "স্টক আউট নিশ্চিত করুন"}
            </button>
          </div>
        </div>

        <div className="card p-4 lg:col-span-3">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <h3 className="font-bold text-[14.5px] text-text">লেনদেনের ইতিহাস</h3>
            <div className="flex items-center gap-2">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="খুঁজুন…" className="input w-36 text-[12.5px] py-1.5" />
              <Select value={filterType} onChange={setFilterType} options={[{ value: "in", label: "স্টক ইন" }, { value: "out", label: "স্টক আউট" }]} placeholder="সব ধরন" className="w-auto min-w-[110px] py-1.5" />
            </div>
          </div>
          {pageItems.length === 0 ? (
            <EmptyState icon={ArrowRightLeft} title="কোনো লেনদেন পাওয়া যায়নি" />
          ) : (
            <div className="space-y-1 max-h-[440px] overflow-y-auto scrollbar">
              {pageItems.map((h) => (
                <div key={h.id} className="flex items-center gap-3 py-2.5 px-2 rounded-lg border-b border-border last:border-0">
                  <div className="rounded-lg p-2 flex-shrink-0" style={{ background: h.type === "in" ? "var(--accent-soft)" : "var(--amber-soft)", color: h.type === "in" ? "var(--accent)" : "var(--amber)" }}>
                    {h.type === "in" ? <ArrowDownToLine size={15} /> : <ArrowUpFromLine size={15} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold truncate text-text">{h.productName}</div>
                    <div className="text-[11px] text-text-faint">{h.reason} · {h.reference} · {fmtDate(h.date)} · {h.by}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="num font-bold text-[13.5px]" style={{ color: h.type === "in" ? "var(--accent)" : "var(--amber)" }}>{h.type === "in" ? "+" : "-"}{fmtNum(h.qty)}</div>
                    <div className="num text-[10.5px] text-text-faint">{fmtNum(h.prevStock)} → {fmtNum(h.newStock)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {pageItems.length > 0 && <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filteredHistory.length} />}
        </div>
      </div>
    </div>
  );
}
