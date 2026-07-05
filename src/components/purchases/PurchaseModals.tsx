import React, { useEffect, useState } from "react";
import { ShoppingBag, Plus, Trash2, Save } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FormField, Select } from "@/components/ui/Primitives";
import { fmtMoney } from "@/lib/utils";
import type { Product, Supplier, Purchase, PurchaseItem } from "@/types";

interface RowState { productId: string; qty: string; cost: string; }
const emptyRow: RowState = { productId: "", qty: "1", cost: "" };

interface PurchaseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (purchase: Omit<Purchase, "id" | "refNo">) => void;
  products: Product[];
  suppliers: Supplier[];
}

export function PurchaseFormModal({ open, onClose, onSave, products, suppliers }: PurchaseFormModalProps) {
  const [supplierId, setSupplierId] = useState("");
  const [rows, setRows] = useState<RowState[]>([{ ...emptyRow }]);
  const [paid, setPaid] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setSupplierId(""); setRows([{ ...emptyRow }]); setPaid(""); setNote(""); setErrors({});
  }, [open]);

  const updateRow = (i: number, patch: Partial<RowState>) => {
    setRows((rs) => rs.map((r, idx) => {
      if (idx !== i) return r;
      const next = { ...r, ...patch };
      if (patch.productId) {
        const prod = products.find((p) => p.id === patch.productId);
        if (prod) next.cost = String(prod.purchasePrice);
      }
      return next;
    }));
  };
  const addRow = () => setRows((rs) => [...rs, { ...emptyRow }]);
  const removeRow = (i: number) => setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs));

  const lineTotals = rows.map((r) => (Number(r.qty) || 0) * (Number(r.cost) || 0));
  const subtotal = lineTotals.reduce((s, v) => s + v, 0);
  const paidNum = paid === "" ? subtotal : Number(paid) || 0;
  const due = Math.max(0, subtotal - paidNum);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!supplierId) e.supplier = "একটি সাপ্লায়ার নির্বাচন করুন";
    const validRows = rows.filter((r) => r.productId && Number(r.qty) > 0);
    if (validRows.length === 0) e.rows = "কমপক্ষে একটি পণ্য যোগ করুন";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const items: PurchaseItem[] = rows
      .filter((r) => r.productId && Number(r.qty) > 0)
      .map((r) => {
        const prod = products.find((p) => p.id === r.productId)!;
        const qty = Number(r.qty);
        const cost = Number(r.cost) || prod.purchasePrice;
        return { productId: prod.id, name: prod.name, qty, cost, total: qty * cost };
      });
    onSave({ date: new Date().toISOString(), supplierId, items, subtotal, paid: paidNum, due, note });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="নতুন ক্রয়"
      subtitle="সাপ্লায়ার থেকে পণ্য গ্রহণ করুন"
      icon={ShoppingBag}
      width={680}
      footer={<>
        <button onClick={onClose} className="btn-ghost">বাতিল</button>
        <button onClick={submit} className="btn-primary"><Save size={15} />ক্রয় সম্পন্ন করুন</button>
      </>}
    >
      <div className="space-y-4">
        <FormField label="সাপ্লায়ার" required error={errors.supplier}>
          <Select value={supplierId} onChange={setSupplierId} options={suppliers.map((s) => ({ value: s.id, label: s.name }))} error={errors.supplier} />
        </FormField>

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
                <input type="number" className="input w-28 flex-shrink-0" value={r.cost} onChange={(e) => updateRow(i, { cost: e.target.value })} placeholder="ক্রয়মূল্য" />
                <div className="num text-[13px] font-semibold w-24 flex-shrink-0 text-right text-text">{fmtMoney(lineTotals[i] || 0)}</div>
                <button onClick={() => removeRow(i)} className="btn-ghost p-1.5 text-danger flex-shrink-0"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          {errors.rows && <div className="text-[12px] text-danger mt-1.5">{errors.rows}</div>}
        </div>

        <FormField label="নোট (ঐচ্ছিক)">
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
        </FormField>

        <div className="card p-3 space-y-1.5 bg-bg-soft border-0">
          <div className="flex items-center justify-between text-[15px]"><span className="font-bold text-text">সর্বমোট</span><span className="num font-extrabold text-accent">{fmtMoney(subtotal)}</span></div>
          <FormField label="পরিশোধিত টাকা">
            <input type="number" className="input" value={paid} onChange={(e) => setPaid(e.target.value)} placeholder={String(subtotal)} />
          </FormField>
          <div className="flex items-center justify-between text-[13px]"><span className="text-text-dim">বাকি (সাপ্লায়ারকে পাওনা)</span><span className="num font-bold" style={{ color: due > 0 ? "var(--danger)" : "var(--accent)" }}>{fmtMoney(due)}</span></div>
        </div>
      </div>
    </Modal>
  );
}
