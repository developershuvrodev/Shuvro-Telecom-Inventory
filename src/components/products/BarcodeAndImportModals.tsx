import React, { useRef, useState } from "react";
import { Barcode as BarcodeIcon, Printer, Upload, FileDown, RefreshCw, Check, AlertCircle, FileSpreadsheet } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { BarcodeStrip } from "@/components/ui/Primitives";
import { fmtMoney, fmtNum, cx } from "@/lib/utils";
import { openPrintWindow, buildBarcodeLabelHtml } from "@/lib/print";
import { downloadExcelTemplate, parseImportFile, processImportRows } from "@/lib/excel";
import type { Product, Category, Brand, Supplier, ImportSummary } from "@/types";

/* ---------------- Barcode label modal ---------------- */
export function BarcodeModal({ open, onClose, product, shopName }: { open: boolean; onClose: () => void; product: Product | null; shopName: string }) {
  if (!product) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="বারকোড লেবেল"
      subtitle={product.name}
      icon={BarcodeIcon}
      width={380}
      footer={<button onClick={() => openPrintWindow(`বারকোড — ${product.sku}`, buildBarcodeLabelHtml(product, shopName))} className="btn-primary w-full justify-center"><Printer size={15} />প্রিন্ট করুন</button>}
    >
      <div className="rounded-2xl p-5 flex flex-col items-center text-center bg-white border border-border">
        <div className="text-[13px] font-bold mb-0.5 text-[#111]">{shopName}</div>
        <div className="text-[12px] mb-3 text-[#333]">{product.name}</div>
        <BarcodeStrip code={product.barcode} height={60} className="text-black" />
        <div className="num text-[13px] font-bold tracking-widest mt-2 text-[#111]">{product.barcode}</div>
        <div className="flex items-center gap-3 mt-2 text-[12px] font-semibold text-[#111]">
          <span>SKU: {product.sku}</span><span>{fmtMoney(product.salePrice)}</span>
        </div>
      </div>
      <p className="text-[11.5px] text-center mt-3 text-text-faint">স্ক্যানার-সামঞ্জস্যপূর্ণ ফরম্যাটে প্রিন্ট করতে থার্মাল/বারকোড প্রিন্টার ব্যবহার করুন।</p>
    </Modal>
  );
}

/* ---------------- Excel import modal ---------------- */
interface ImportCtx { products: Product[]; categories: Category[]; brands: Brand[]; suppliers: Supplier[]; }

export function ImportExcelModal({ open, onClose, onImport, ctx }: { open: boolean; onClose: () => void; onImport: (s: ImportSummary) => void; ctx: ImportCtx }) {
  const [dragActive, setDragActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const rows = await parseImportFile(file);
      const result = processImportRows(rows, ctx);
      setSummary(result);
    } catch {
      setSummary({ products: ctx.products, categories: ctx.categories, brands: ctx.brands, suppliers: ctx.suppliers, created: 0, updated: 0, errors: [{ row: "-", message: "ফাইল পড়া যায়নি। সঠিক .xlsx ফাইল আপলোড করুন।" }], total: 0 });
    }
    setBusy(false);
  };

  const applyAndClose = () => {
    if (!summary) return;
    onImport(summary);
    setSummary(null);
    onClose();
  };

  const reset = () => { setSummary(null); onClose(); };

  return (
    <Modal
      open={open}
      onClose={reset}
      title="এক্সেল থেকে বাল্ক ইম্পোর্ট"
      subtitle="নতুন পণ্য তৈরি বা বিদ্যমান পণ্য আপডেট করুন"
      icon={FileSpreadsheet}
      width={560}
      footer={
        summary ? (
          <>
            <button onClick={() => setSummary(null)} className="btn-ghost">আবার আপলোড করুন</button>
            <button onClick={applyAndClose} disabled={summary.created + summary.updated === 0} className="btn-primary"><Check size={15} />পরিবর্তন প্রয়োগ করুন</button>
          </>
        ) : (
          <button onClick={downloadExcelTemplate} className="btn-soft w-full justify-center"><FileDown size={15} />টেমপ্লেট ডাউনলোড করুন</button>
        )
      }
    >
      {!summary && (
        <div
          className={cx("border-2 border-dashed rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer transition-all", dragActive ? "border-accent bg-accent-soft" : "border-border")}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          {busy ? (
            <>
              <RefreshCw size={30} className="animate-spin mb-3 text-accent" />
              <p className="text-[13px] font-semibold text-text">ফাইল প্রসেস হচ্ছে…</p>
            </>
          ) : (
            <>
              <div className="rounded-2xl p-3 mb-3 bg-accent-soft text-accent"><Upload size={26} /></div>
              <p className="text-[13.5px] font-bold mb-1 text-text">এক্সেল ফাইল ড্র্যাগ করে ছাড়ুন</p>
              <p className="text-[12px] text-text-faint">অথবা ক্লিক করে ফাইল বেছে নিন (.xlsx, .xls)</p>
            </>
          )}
        </div>
      )}
      {summary && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="card p-3 text-center border-0 bg-accent-soft">
              <div className="num text-[20px] font-extrabold text-accent-ink">{fmtNum(summary.created)}</div>
              <div className="text-[11px] font-semibold text-accent-ink">নতুন পণ্য</div>
            </div>
            <div className="card p-3 text-center border-0 bg-blue-soft">
              <div className="num text-[20px] font-extrabold text-blue">{fmtNum(summary.updated)}</div>
              <div className="text-[11px] font-semibold text-blue">আপডেট হয়েছে</div>
            </div>
            <div className="card p-3 text-center border-0 bg-danger-soft">
              <div className="num text-[20px] font-extrabold text-danger">{fmtNum(summary.errors.length)}</div>
              <div className="text-[11px] font-semibold text-danger">ত্রুটি</div>
            </div>
          </div>
          {summary.errors.length > 0 && (
            <div>
              <div className="text-[12.5px] font-bold mb-1.5 text-text">ত্রুটি রিপোর্ট</div>
              <div className="card scrollbar p-2 max-h-40 overflow-y-auto space-y-1">
                {summary.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-[12px] px-2 py-1.5 rounded-lg bg-danger-soft">
                    <AlertCircle size={13} className="flex-shrink-0 mt-0.5 text-danger" />
                    <span className="text-text-dim"><b>সারি {e.row}:</b> {e.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-[12px] text-text-faint">মোট {fmtNum(summary.total)} সারি প্রসেস হয়েছে। প্রয়োগ করতে নিচের বাটনে ক্লিক করুন।</p>
        </div>
      )}
    </Modal>
  );
}
