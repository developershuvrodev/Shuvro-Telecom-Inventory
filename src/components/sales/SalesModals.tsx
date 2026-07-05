import React, { useEffect, useState } from "react";
import { Receipt, Plus, Trash2, Printer, Save } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FormField, Select } from "@/components/ui/Primitives";
import { fmtMoney, fmtNum, cx } from "@/lib/utils";
import { openPrintWindow, buildCashMemoHtml } from "@/lib/print";
import type { Product, Customer, Sale, SaleItem } from "@/types";

/* ============================================================================
   SALE FORM MODAL — বিক্রয় / ক্যাশ মেমো তৈরি
   ========================================================================= */
interface RowState { productId: string; qty: string; price: string; }
const emptyRow: RowState = { productId: "", qty: "1", price: "" };

interface SaleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (sale: Omit<Sale, "id" | "invoiceNo">) => void;
  products: Product[];
  customers: Customer[];
}

export function SaleFormModal({ open, onClose, onSave, products, customers }: SaleFormModalProps) {
  const [customerId, setCustomerId] = useState("");
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [rows, setRows] = useState<RowState[]>([{ ...emptyRow }]);
  const [discount, setDiscount] = useState("0");
  const [paid, setPaid] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setCustomerId(""); setWalkInName(""); setWalkInPhone("");
    setRows([{ ...emptyRow }]); setDiscount("0"); setPaid(""); setNote(""); setErrors({});
  }, [open]);

  const updateRow = (i: number, patch: Partial<RowState>) => {
    setRows((rs) => rs.map((r, idx) => {
      if (idx !== i) return r;
      const next = { ...r, ...patch };
      if (patch.productId) {
        const prod = products.find((p) => p.id === patch.productId);
        if (prod) next.price = String(prod.salePrice);
      }
      return next;
    }));
  };
  const addRow = () => setRows((rs) => [...rs, { ...emptyRow }]);
  const removeRow = (i: number) => setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs));

  const lineTotals = rows.map((r) => {
    const qty = Number(r.qty) || 0;
    const price = Number(r.price) || 0;
    return qty * price;
  });
  const subtotal = lineTotals.reduce((s, v) => s + v, 0);
  const disc = Number(discount) || 0;
  const total = Math.max(0, subtotal - disc);
  const paidNum = paid === "" ? total : Number(paid) || 0;
  const due = Math.max(0, total - paidNum);

  // Aggregate requested qty per product across rows, to validate against stock.
  const requestedByProduct: Record<string, number> = {};
  rows.forEach((r) => {
    if (!r.productId) return;
    requestedByProduct[r.productId] = (requestedByProduct[r.productId] || 0) + (Number(r.qty) || 0);
  });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!customerId && !walkInName.trim()) e.customer = "একজন কাস্টমার নির্বাচন করুন অথবা ওয়াক-ইন নাম দিন";
    const validRows = rows.filter((r) => r.productId && Number(r.qty) > 0);
    if (validRows.length === 0) e.rows = "কমপক্ষে একটি পণ্য যোগ করুন";
    for (const pid of Object.keys(requestedByProduct)) {
      const prod = products.find((p) => p.id === pid);
      if (prod && requestedByProduct[pid] > prod.stock) {
        e.rows = `"${prod.name}" — স্টকে মাত্র ${prod.stock} ইউনিট আছে`;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const customer = customers.find((c) => c.id === customerId);
    const items: SaleItem[] = rows
      .filter((r) => r.productId && Number(r.qty) > 0)
      .map((r) => {
        const prod = products.find((p) => p.id === r.productId)!;
        const qty = Number(r.qty);
        const price = Number(r.price) || prod.salePrice;
        return { productId: prod.id, name: prod.name, qty, price, total: qty * price };
      });
    onSave({
      date: new Date().toISOString(),
      customerId: customer?.id,
      customerName: customer?.name || walkInName.trim() || "ওয়াক-ইন কাস্টমার",
      customerPhone: customer?.phone || walkInPhone.trim() || undefined,
      items, subtotal, discount: disc, total, paid: paidNum, due, note,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="নতুন বিক্রয় / ক্যাশ মেমো"
      subtitle="পণ্য যোগ করে ক্যাশ মেমো তৈরি করুন"
      icon={Receipt}
      width={680}
      footer={<>
        <button onClick={onClose} className="btn-ghost">বাতিল</button>
        <button onClick={submit} className="btn-primary"><Save size={15} />বিক্রয় সম্পন্ন করুন</button>
      </>}
    >
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <FormField label="নিবন্ধিত কাস্টমার (ঐচ্ছিক)">
            <Select value={customerId} onChange={setCustomerId} options={customers.map((c) => ({ value: c.id, label: `${c.name} — ${c.phone}` }))} placeholder="ওয়াক-ইন কাস্টমার" />
          </FormField>
          {!customerId && (
            <div className="grid grid-cols-2 gap-2">
              <FormField label="ওয়াক-ইন নাম">
                <input className="input" value={walkInName} onChange={(e) => setWalkInName(e.target.value)} placeholder="কাস্টমারের নাম" />
              </FormField>
              <FormField label="ফোন (ঐচ্ছিক)">
                <input className="input" value={walkInPhone} onChange={(e) => setWalkInPhone(e.target.value)} placeholder="01XXX-XXXXXX" />
              </FormField>
            </div>
          )}
        </div>
        {errors.customer && <div className="text-[12px] text-danger">{errors.customer}</div>}

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="label mb-0">পণ্যসমূহ</div>
            <button onClick={addRow} className="btn-soft py-1 px-2.5 text-[12px]"><Plus size={13} />সারি যোগ করুন</button>
          </div>
          <div className="space-y-2">
            {rows.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <Select value={r.productId} onChange={(v) => updateRow(i, { productId: v })} options={products.map((p) => ({ value: p.id, label: `${p.name} (স্টকঃ ${p.stock})` }))} placeholder="পণ্য নির্বাচন করুন" />
                </div>
                <input type="number" min={1} className="input w-20 flex-shrink-0" value={r.qty} onChange={(e) => updateRow(i, { qty: e.target.value })} placeholder="পরিমাণ" />
                <input type="number" className="input w-28 flex-shrink-0" value={r.price} onChange={(e) => updateRow(i, { price: e.target.value })} placeholder="দাম" />
                <div className="num text-[13px] font-semibold w-24 flex-shrink-0 text-right text-text">{fmtMoney(lineTotals[i] || 0)}</div>
                <button onClick={() => removeRow(i)} className="btn-ghost p-1.5 text-danger flex-shrink-0"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          {errors.rows && <div className="text-[12px] text-danger mt-1.5">{errors.rows}</div>}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <FormField label="নোট (ঐচ্ছিক)">
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
          </FormField>
          <FormField label="ডিসকাউন্ট (৳)">
            <input type="number" className="input" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </FormField>
        </div>

        <div className="card p-3 space-y-1.5 bg-bg-soft border-0">
          <div className="flex items-center justify-between text-[13px]"><span className="text-text-dim">সাবটোটাল</span><span className="num font-semibold text-text">{fmtMoney(subtotal)}</span></div>
          <div className="flex items-center justify-between text-[13px]"><span className="text-text-dim">ডিসকাউন্ট</span><span className="num font-semibold text-danger">-{fmtMoney(disc)}</span></div>
          <div className="flex items-center justify-between text-[15px] pt-1 border-t border-border"><span className="font-bold text-text">সর্বমোট</span><span className="num font-extrabold text-accent">{fmtMoney(total)}</span></div>
          <FormField label="গ্রহণকৃত টাকা">
            <input type="number" className="input" value={paid} onChange={(e) => setPaid(e.target.value)} placeholder={String(total)} />
          </FormField>
          <div className="flex items-center justify-between text-[13px]"><span className="text-text-dim">বাকি (বকেয়া)</span><span className="num font-bold" style={{ color: due > 0 ? "var(--danger)" : "var(--accent)" }}>{fmtMoney(due)}</span></div>
        </div>
      </div>
    </Modal>
  );
}

/* ============================================================================
   CASH MEMO (printable invoice) MODAL
   ========================================================================= */
export function CashMemoModal({ open, onClose, sale, shopName, shopAddress, shopPhone }: {
  open: boolean; onClose: () => void; sale: Sale | null; shopName: string; shopAddress: string; shopPhone: string;
}) {
  if (!sale) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ক্যাশ মেমো"
      subtitle={sale.invoiceNo}
      icon={Receipt}
      width={440}
      footer={<button onClick={() => openPrintWindow(`ক্যাশ মেমো — ${sale.invoiceNo}`, buildCashMemoHtml(sale, shopName, shopAddress, shopPhone))} className="btn-primary w-full justify-center"><Printer size={15} />প্রিন্ট করুন</button>}
    >
      <div className="rounded-2xl p-5 bg-white border border-border text-[#111]">
        <div className="text-center mb-3">
          <div className="text-[16px] font-extrabold">{shopName}</div>
          <div className="text-[11px] text-[#444]">{shopAddress}</div>
          <div className="text-[11px] text-[#444]">ফোনঃ {shopPhone}</div>
        </div>
        <div className="flex items-center justify-between text-[12px] mb-2 pb-2" style={{ borderBottom: "1px dashed #ccc" }}>
          <span>ইনভয়েসঃ <b>{sale.invoiceNo}</b></span>
          <span>{new Date(sale.date).toLocaleDateString("bn-BD")}</span>
        </div>
        <div className="text-[12px] mb-2">
          <div>কাস্টমারঃ <b>{sale.customerName}</b></div>
          {sale.customerPhone && <div>ফোনঃ {sale.customerPhone}</div>}
        </div>
        <table className="w-full text-[12px] mb-2">
          <thead><tr style={{ borderBottom: "1px solid #ccc" }}><th className="text-left py-1">পণ্য</th><th className="text-right py-1">পরিমাণ</th><th className="text-right py-1">দাম</th><th className="text-right py-1">মোট</th></tr></thead>
          <tbody>
            {sale.items.map((it, i) => (
              <tr key={i}><td className="py-1">{it.name}</td><td className="text-right py-1">{fmtNum(it.qty)}</td><td className="text-right py-1">{fmtMoney(it.price)}</td><td className="text-right py-1">{fmtMoney(it.total)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="pt-2 space-y-1 text-[12px]" style={{ borderTop: "1px dashed #ccc" }}>
          <div className="flex justify-between"><span>সাবটোটাল</span><span>{fmtMoney(sale.subtotal)}</span></div>
          <div className="flex justify-between"><span>ডিসকাউন্ট</span><span>-{fmtMoney(sale.discount)}</span></div>
          <div className="flex justify-between font-bold text-[13px]"><span>সর্বমোট</span><span>{fmtMoney(sale.total)}</span></div>
          <div className="flex justify-between"><span>পরিশোধিত</span><span>{fmtMoney(sale.paid)}</span></div>
          <div className="flex justify-between font-bold"><span>বাকি</span><span>{fmtMoney(sale.due)}</span></div>
        </div>
        <div className="text-center text-[11px] mt-4 text-[#666]">আমাদের সাথে থাকার জন্য ধন্যবাদ! আবার আসবেন।</div>
      </div>
    </Modal>
  );
}
