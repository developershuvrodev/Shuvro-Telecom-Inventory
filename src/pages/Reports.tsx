import React, { useMemo, useState } from "react";
import {
  Boxes, AlertTriangle, CircleSlash, Tags, Truck, Wallet, ArrowRightLeft, FileBarChart2, Printer, FileSpreadsheet, TrendingUp, type LucideIcon,
} from "lucide-react";
import { Badge, EmptyState, StatCard } from "@/components/ui/Primitives";
import { exportProductsToExcel, exportRowsToExcel } from "@/lib/excel";
import { fmtDate, fmtDateTime, fmtMoney, fmtNum, stockStatus } from "@/lib/utils";
import type { Product, Category, Brand, Supplier, StockTx, ShopSettings } from "@/types";

interface ReportsProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
  history: StockTx[];
  settings: ShopSettings;
}

const REPORT_TABS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "stock", label: "বর্তমান স্টক", icon: Boxes },
  { key: "low", label: "লো স্টক", icon: AlertTriangle },
  { key: "out", label: "স্টক শেষ", icon: CircleSlash },
  { key: "category", label: "ক্যাটাগরি ভিত্তিক", icon: Tags },
  { key: "supplier", label: "সাপ্লায়ার ভিত্তিক", icon: Truck },
  { key: "value", label: "ইনভেন্টরি মূল্য", icon: Wallet },
  { key: "movement", label: "স্টক মুভমেন্ট", icon: ArrowRightLeft },
];

export function Reports({ products, categories, brands, suppliers, history, settings }: ReportsProps) {
  const [tab, setTab] = useState("stock");
  const catName = (id: string) => categories.find((c) => c.id === id)?.name || "—";
  const brandNameOf = (id: string) => brands.find((b) => b.id === id)?.name || "—";
  const supName = (id: string) => suppliers.find((s) => s.id === id)?.name || "—";

  const categoryRows = useMemo(
    () =>
      categories
        .map((c) => {
          const items = products.filter((p) => p.category === c.id);
          return {
            name: c.name, count: items.length,
            stockQty: items.reduce((s, p) => s + p.stock, 0),
            purchaseValue: items.reduce((s, p) => s + p.stock * p.purchasePrice, 0),
            saleValue: items.reduce((s, p) => s + p.stock * p.salePrice, 0),
          };
        })
        .filter((c) => c.count > 0),
    [products, categories]
  );

  const supplierRows = useMemo(
    () =>
      suppliers
        .map((s) => {
          const items = products.filter((p) => p.supplier === s.id);
          return {
            name: s.name, count: items.length,
            stockQty: items.reduce((s2, p) => s2 + p.stock, 0),
            purchaseValue: items.reduce((s2, p) => s2 + p.stock * p.purchasePrice, 0),
          };
        })
        .filter((s) => s.count > 0),
    [products, suppliers]
  );

  const totals = useMemo(() => {
    const purchaseValue = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
    const saleValue = products.reduce((s, p) => s + p.stock * p.salePrice, 0);
    const qty = products.reduce((s, p) => s + p.stock, 0);
    return { purchaseValue, saleValue, qty, profit: saleValue - purchaseValue };
  }, [products]);

  const lowList = products.filter((p) => p.stock > 0 && p.stock <= p.minStock);
  const outList = products.filter((p) => p.stock <= 0);

  const doExport = () => {
    if (tab === "stock") exportProductsToExcel(products, categories, brands, suppliers, "রিপোর্ট_বর্তমান_স্টক.xlsx");
    else if (tab === "low") exportProductsToExcel(lowList, categories, brands, suppliers, "রিপোর্ট_লো_স্টক.xlsx");
    else if (tab === "out") exportProductsToExcel(outList, categories, brands, suppliers, "রিপোর্ট_স্টক_শেষ.xlsx");
    else if (tab === "category") exportRowsToExcel(categoryRows.map((r) => ({ "ক্যাটাগরি": r.name, "পণ্য সংখ্যা": r.count, "স্টক পরিমাণ": r.stockQty, "ক্রয়মূল্যে": r.purchaseValue, "বিক্রয়মূল্যে": r.saleValue })), "ক্যাটাগরি রিপোর্ট", "রিপোর্ট_ক্যাটাগরি.xlsx");
    else if (tab === "supplier") exportRowsToExcel(supplierRows.map((r) => ({ "সাপ্লায়ার": r.name, "পণ্য সংখ্যা": r.count, "স্টক পরিমাণ": r.stockQty, "ক্রয়মূল্যে": r.purchaseValue })), "সাপ্লায়ার রিপোর্ট", "রিপোর্ট_সাপ্লায়ার.xlsx");
    else if (tab === "value") exportRowsToExcel(products.map((p) => ({ "পণ্য": p.name, SKU: p.sku, "স্টক": p.stock, "ক্রয়মূল্য": p.purchasePrice, "মোট ক্রয়মূল্যে": p.stock * p.purchasePrice, "বিক্রয়মূল্য": p.salePrice, "মোট বিক্রয়মূল্যে": p.stock * p.salePrice })), "ইনভেন্টরি মূল্য", "রিপোর্ট_ইনভেন্টরি_মূল্য.xlsx");
    else if (tab === "movement") exportRowsToExcel(history.map((h) => ({ "তারিখ": fmtDate(h.date), "পণ্য": h.productName, "ধরন": h.type === "in" ? "স্টক ইন" : h.type === "out" ? "স্টক আউট" : "সমন্বয়", "পরিমাণ": h.qty, "পূর্বের স্টক": h.prevStock, "নতুন স্টক": h.newStock, "কারণ": h.reason, "রেফারেন্স": h.reference, "দ্বারা": h.by })), "স্টক মুভমেন্ট", "রিপোর্ট_স্টক_মুভমেন্ট.xlsx");
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h1 className="text-[20px] font-extrabold text-text">রিপোর্ট</h1>
          <p className="text-[13px] mt-0.5 text-text-faint">ইনভেন্টরির বিস্তারিত বিশ্লেষণ ও রপ্তানি</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={doExport} className="btn-soft"><FileSpreadsheet size={15} />এক্সেল এক্সপোর্ট</button>
          <button onClick={() => window.print()} className="btn-primary"><Printer size={15} />প্রিন্ট / PDF</button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar pb-1 no-print">
        {REPORT_TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold" style={tab === t.key ? { background: "var(--accent)", color: "#fff" } : { color: "var(--text-dim)", background: "var(--bg-soft)" }}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      <div className="hidden print:block mb-3">
        <h2 className="font-extrabold text-lg">{settings.shopName} — {REPORT_TABS.find((t) => t.key === tab)?.label} রিপোর্ট</h2>
        <p className="text-xs">তৈরির তারিখঃ {fmtDateTime(new Date())}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Boxes} label="মোট স্টক ইউনিট" value={fmtNum(totals.qty)} color="var(--accent)" bg="var(--accent-soft)" />
        <StatCard icon={Wallet} label="ক্রয়মূল্যে ইনভেন্টরি" value={fmtMoney(totals.purchaseValue)} color="var(--blue)" bg="var(--blue-soft)" />
        <StatCard icon={FileBarChart2} label="বিক্রয়মূল্যে ইনভেন্টরি" value={fmtMoney(totals.saleValue)} color="#2F9E44" bg="rgba(47,158,68,0.12)" />
        <StatCard icon={TrendingUp} label="সম্ভাব্য লাভ" value={fmtMoney(totals.profit)} color="var(--amber)" bg="var(--amber-soft)" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar">
          {tab === "stock" && (
            <table className="data-table"><thead><tr><th>পণ্য</th><th>ক্যাটাগরি</th><th>স্টক</th><th>ক্রয়মূল্য</th><th>বিক্রয়মূল্য</th><th>স্টক মূল্য</th><th>অবস্থা</th></tr></thead>
              <tbody>{products.map((p) => { const st = stockStatus(p); return (
                <tr key={p.id}><td className="font-semibold text-text">{p.name}</td><td>{catName(p.category)}</td><td className="num font-bold">{fmtNum(p.stock)}</td><td className="num">{fmtMoney(p.purchasePrice)}</td><td className="num">{fmtMoney(p.salePrice)}</td><td className="num font-semibold">{fmtMoney(p.stock * p.purchasePrice)}</td><td><Badge color={st.color} bg={st.bg}>{st.label}</Badge></td></tr>
              ); })}</tbody></table>
          )}
          {tab === "low" && (
            lowList.length === 0 ? <EmptyState icon={AlertTriangle} title="লো স্টকে কোনো পণ্য নেই" /> :
            <table className="data-table"><thead><tr><th>পণ্য</th><th>বর্তমান স্টক</th><th>সর্বনিম্ন স্টক</th><th>সাপ্লায়ার</th></tr></thead>
              <tbody>{lowList.map((p) => (<tr key={p.id}><td className="font-semibold text-text">{p.name}</td><td className="num font-bold text-amber">{fmtNum(p.stock)}</td><td className="num">{fmtNum(p.minStock)}</td><td>{supName(p.supplier)}</td></tr>))}</tbody></table>
          )}
          {tab === "out" && (
            outList.length === 0 ? <EmptyState icon={CircleSlash} title="কোনো পণ্যের স্টক শেষ নেই" /> :
            <table className="data-table"><thead><tr><th>পণ্য</th><th>ক্যাটাগরি</th><th>সাপ্লায়ার</th><th>শেষ বিক্রয়মূল্য</th></tr></thead>
              <tbody>{outList.map((p) => (<tr key={p.id}><td className="font-semibold text-text">{p.name}</td><td>{catName(p.category)}</td><td>{supName(p.supplier)}</td><td className="num">{fmtMoney(p.salePrice)}</td></tr>))}</tbody></table>
          )}
          {tab === "category" && (
            <table className="data-table"><thead><tr><th>ক্যাটাগরি</th><th>পণ্য সংখ্যা</th><th>স্টক পরিমাণ</th><th>ক্রয়মূল্যে</th><th>বিক্রয়মূল্যে</th></tr></thead>
              <tbody>{categoryRows.map((r) => (<tr key={r.name}><td className="font-semibold text-text">{r.name}</td><td className="num">{fmtNum(r.count)}</td><td className="num">{fmtNum(r.stockQty)}</td><td className="num">{fmtMoney(r.purchaseValue)}</td><td className="num font-semibold">{fmtMoney(r.saleValue)}</td></tr>))}</tbody></table>
          )}
          {tab === "supplier" && (
            <table className="data-table"><thead><tr><th>সাপ্লায়ার</th><th>পণ্য সংখ্যা</th><th>স্টক পরিমাণ</th><th>ক্রয়মূল্যে</th></tr></thead>
              <tbody>{supplierRows.map((r) => (<tr key={r.name}><td className="font-semibold text-text">{r.name}</td><td className="num">{fmtNum(r.count)}</td><td className="num">{fmtNum(r.stockQty)}</td><td className="num font-semibold">{fmtMoney(r.purchaseValue)}</td></tr>))}</tbody></table>
          )}
          {tab === "value" && (
            <table className="data-table"><thead><tr><th>পণ্য</th><th>স্টক</th><th>ক্রয়মূল্য</th><th>মোট ক্রয়মূল্যে</th><th>বিক্রয়মূল্য</th><th>মোট বিক্রয়মূল্যে</th><th>লাভ</th></tr></thead>
              <tbody>{products.map((p) => (<tr key={p.id}><td className="font-semibold text-text">{p.name}</td><td className="num">{fmtNum(p.stock)}</td><td className="num">{fmtMoney(p.purchasePrice)}</td><td className="num">{fmtMoney(p.stock * p.purchasePrice)}</td><td className="num">{fmtMoney(p.salePrice)}</td><td className="num">{fmtMoney(p.stock * p.salePrice)}</td><td className="num font-semibold text-accent">{fmtMoney(p.stock * (p.salePrice - p.purchasePrice))}</td></tr>))}</tbody></table>
          )}
          {tab === "movement" && (
            history.length === 0 ? <EmptyState icon={ArrowRightLeft} title="কোনো লেনদেন নেই" /> :
            <table className="data-table"><thead><tr><th>তারিখ</th><th>পণ্য</th><th>ধরন</th><th>পরিমাণ</th><th>পূর্বের → নতুন স্টক</th><th>কারণ</th><th>দ্বারা</th></tr></thead>
              <tbody>{history.map((h) => (<tr key={h.id}><td className="num">{fmtDate(h.date)}</td><td className="font-semibold text-text">{h.productName}</td><td><Badge color={h.type === "in" ? "var(--accent)" : h.type === "out" ? "var(--amber)" : "var(--blue)"} bg={h.type === "in" ? "var(--accent-soft)" : h.type === "out" ? "var(--amber-soft)" : "var(--blue-soft)"}>{h.type === "in" ? "স্টক ইন" : h.type === "out" ? "স্টক আউট" : "সমন্বয়"}</Badge></td><td className="num font-bold">{fmtNum(h.qty)}</td><td className="num">{fmtNum(h.prevStock)} → {fmtNum(h.newStock)}</td><td>{h.reason}</td><td>{h.by}</td></tr>))}</tbody></table>
          )}
        </div>
      </div>
    </div>
  );
}
