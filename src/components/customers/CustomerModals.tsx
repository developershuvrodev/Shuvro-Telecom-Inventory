import React, { useEffect, useState } from "react";
import { Users, Save, Wallet, Printer } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/Primitives";
import { buildCustomerLedger, customerDue } from "@/lib/accounting";
import { cx, fmtDate, fmtMoney, uid } from "@/lib/utils";
import { openPrintWindow, buildCustomerLedgerHtml } from "@/lib/print";
import type { Customer, Sale, CustomerPayment } from "@/types";

/* ---------------- Add / edit customer ---------------- */
const emptyForm = { name: "", phone: "", address: "", openingDue: "0" };

export function CustomerFormModal({
  open, onClose, onSave, editing,
}: { open: boolean; onClose: () => void; onSave: (c: Customer) => void; editing: Customer | null }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  useEffect(() => {
    if (!open) return;
    setForm(editing ? { name: editing.name, phone: editing.phone, address: editing.address || "", openingDue: String(editing.openingDue) } : emptyForm);
    setErrors({});
  }, [open, editing]);

  const save = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "কাস্টমারের নাম আবশ্যক";
    if (!form.phone.trim()) e.phone = "ফোন নম্বর আবশ্যক";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({
      id: editing ? editing.id : uid("cus"),
      name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim(),
      openingDue: Number(form.openingDue) || 0,
      createdAt: editing ? editing.createdAt : new Date().toISOString(),
    });
    onClose();
  };

  return (
    <Modal
      open={open} onClose={onClose} title={editing ? "কাস্টমার সম্পাদনা" : "নতুন কাস্টমার"} icon={Users} width={440}
      footer={<><button onClick={onClose} className="btn-ghost">বাতিল</button><button onClick={save} className="btn-primary"><Save size={15} />সংরক্ষণ করুন</button></>}
    >
      <div className="space-y-4">
        <FormField label="কাস্টমারের নাম" required error={errors.name}>
          <input className={cx("input", errors.name && "input-err")} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </FormField>
        <FormField label="ফোন নম্বর" required error={errors.phone}>
          <input className={cx("input", errors.phone && "input-err")} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </FormField>
        <FormField label="ঠিকানা">
          <input className="input" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </FormField>
        <FormField label="পূর্বের বকেয়া (ঐচ্ছিক)">
          <input type="number" className="input" value={form.openingDue} onChange={(e) => setForm((f) => ({ ...f, openingDue: e.target.value }))} placeholder="0" />
          <p className="text-[11px] mt-1 text-text-faint">সিস্টেম ব্যবহারের আগে খাতায় লেখা পুরানো বকেয়া থাকলে এখানে লিখুন — এখান থেকেই হিসাব শুরু হবে।</p>
        </FormField>
      </div>
    </Modal>
  );
}

/* ---------------- Record a payment against due ---------------- */
export function PaymentFormModal({
  open, onClose, onSave, customer,
}: { open: boolean; onClose: () => void; onSave: (p: Omit<CustomerPayment, "id">) => void; customer: Customer | null }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { if (open) { setAmount(""); setNote(""); setError(""); } }, [open]);
  if (!customer) return null;

  const submit = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError("সঠিক পরিমাণ দিন"); return; }
    onSave({ customerId: customer.id, date: new Date().toISOString(), amount: Number(amount), method: "cash", note });
    onClose();
  };

  return (
    <Modal
      open={open} onClose={onClose} title="পেমেন্ট গ্রহণ করুন" subtitle={customer.name} icon={Wallet} width={380}
      footer={<><button onClick={onClose} className="btn-ghost">বাতিল</button><button onClick={submit} className="btn-primary"><Save size={15} />পেমেন্ট সংরক্ষণ করুন</button></>}
    >
      <div className="space-y-4">
        <FormField label="পরিমাণ (৳)" required error={error}>
          <input type="number" className={cx("input", error && "input-err")} value={amount} onChange={(e) => { setAmount(e.target.value); setError(""); }} autoFocus />
        </FormField>
        <FormField label="নোট (ঐচ্ছিক)">
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="যেমনঃ নগদ পরিশোধ" />
        </FormField>
      </div>
    </Modal>
  );
}

/* ---------------- Customer ledger (পুরানো হিসাব) ---------------- */
export function CustomerLedgerModal({
  open, onClose, customer, sales, payments, onRecordPayment, shopName, shopAddress, shopPhone,
}: {
  open: boolean; onClose: () => void; customer: Customer | null; sales: Sale[]; payments: CustomerPayment[]; onRecordPayment: () => void;
  shopName: string; shopAddress: string; shopPhone: string;
}) {
  if (!customer) return null;
  const rows = buildCustomerLedger(customer, sales, payments);
  const due = customerDue(customer, sales, payments);
  const doPrint = () => openPrintWindow(`কাস্টমার হিসাব — ${customer.name}`, buildCustomerLedgerHtml(customer, rows, due, shopName, shopAddress, shopPhone));

  return (
    <Modal
      open={open} onClose={onClose} title="কাস্টমার হিসাব" subtitle={`${customer.name} — ${customer.phone}`} icon={Users} width={560}
      footer={<>
        <button onClick={doPrint} className="btn-soft"><Printer size={15} />প্রিন্ট</button>
        <button onClick={onRecordPayment} className="btn-primary"><Wallet size={15} />পেমেন্ট গ্রহণ করুন</button>
      </>}
    >
      <div className="space-y-4">
        <div className="card p-3 flex items-center justify-between border-0" style={{ background: due > 0 ? "var(--danger-soft)" : "var(--accent-soft)" }}>
          <span className="text-[13px] font-semibold" style={{ color: due > 0 ? "var(--danger)" : "var(--accent-ink)" }}>বর্তমান মোট বকেয়া</span>
          <span className="num text-[18px] font-extrabold" style={{ color: due > 0 ? "var(--danger)" : "var(--accent-ink)" }}>{fmtMoney(due)}</span>
        </div>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto scrollbar max-h-[340px]">
            <table className="data-table">
              <thead><tr><th>তারিখ</th><th>বিবরণ</th><th className="text-right">দেনা</th><th className="text-right">পাওনা</th><th className="text-right">ব্যালেন্স</th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="num text-[12px]">{fmtDate(r.date)}</td>
                    <td>
                      <div className="text-[12.5px] font-semibold text-text">{r.label}</div>
                      <div className="text-[11px] text-text-faint">{r.detail}</div>
                    </td>
                    <td className="num text-right text-danger">{r.debit > 0 ? fmtMoney(r.debit) : "—"}</td>
                    <td className="num text-right text-accent">{r.credit > 0 ? fmtMoney(r.credit) : "—"}</td>
                    <td className="num text-right font-bold text-text">{fmtMoney(r.runningBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}
