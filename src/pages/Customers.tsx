import React, { useMemo, useState } from "react";
import { Plus, Pencil, Users, Phone, MapPin, Wallet, Search } from "lucide-react";
import { Badge, EmptyState } from "@/components/ui/Primitives";
import { CustomerFormModal, PaymentFormModal, CustomerLedgerModal } from "@/components/customers/CustomerModals";
import { customerDue } from "@/lib/accounting";
import { fmtMoney, fmtNum } from "@/lib/utils";
import type { Customer, Sale, CustomerPayment, ShopSettings, ToastType } from "@/types";

interface CustomersProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  sales: Sale[];
  payments: CustomerPayment[];
  addPayment: (p: CustomerPayment) => void;
  addToast: (msg: string, type?: ToastType) => void;
  settings: ShopSettings;
}

export function Customers({ customers, setCustomers, sales, payments, addPayment, addToast, settings }: CustomersProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [ledgerCustomer, setLedgerCustomer] = useState<Customer | null>(null);
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);
  const [query, setQuery] = useState("");

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (c: Customer) => { setEditing(c); setFormOpen(true); };

  const save = (c: Customer) => {
    setCustomers((cs) => {
      const exists = cs.some((x) => x.id === c.id);
      return exists ? cs.map((x) => (x.id === c.id ? c : x)) : [c, ...cs];
    });
    addToast(editing ? `"${c.name}" আপডেট হয়েছে` : `"${c.name}" কাস্টমার হিসেবে যোগ হয়েছে`, "success");
  };

  const handlePayment = (p: Omit<CustomerPayment, "id">) => {
    addPayment({ ...p, id: `cp-${Date.now().toString(36)}` });
    addToast("পেমেন্ট সফলভাবে সংরক্ষিত হয়েছে", "success");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }, [customers, query]);

  const totalReceivable = customers.reduce((s, c) => s + customerDue(c, sales, payments), 0);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-text">কাস্টমার</h1>
          <p className="text-[13px] mt-0.5 text-text-faint">মোট {fmtNum(customers.length)} জন কাস্টমার · মোট পাওনাঃ {fmtMoney(totalReceivable)}</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={15} />নতুন কাস্টমার</button>
      </div>

      <div className="card p-3">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="নাম বা ফোন নম্বর খুঁজুন…" className="input pl-9" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={Users} title="কোনো কাস্টমার নেই" action={<button onClick={openAdd} className="btn-primary"><Plus size={15} />কাস্টমার যোগ করুন</button>} /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => {
            const due = customerDue(c, sales, payments);
            return (
              <div key={c.id} className="card card-hover p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="rounded-xl p-2.5 bg-blue-soft text-blue"><Users size={18} /></div>
                  <button onClick={() => openEdit(c)} className="btn-ghost p-1.5"><Pencil size={14} /></button>
                </div>
                <div className="font-bold text-[14.5px] text-text">{c.name}</div>
                <div className="flex items-center gap-1.5 text-[12px] mt-1.5 text-text-dim"><Phone size={12} />{c.phone}</div>
                {c.address && <div className="flex items-center gap-1.5 text-[12px] mt-1 text-text-dim"><MapPin size={12} /><span className="truncate">{c.address}</span></div>}
                <div className="flex items-center justify-between mt-3">
                  <Badge color={due > 0 ? "var(--danger)" : "var(--accent)"} bg={due > 0 ? "var(--danger-soft)" : "var(--accent-soft)"}>বকেয়াঃ {fmtMoney(due)}</Badge>
                  <button onClick={() => setLedgerCustomer(c)} className="text-[12px] font-bold text-accent">হিসাব দেখুন →</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CustomerFormModal open={formOpen} onClose={() => setFormOpen(false)} onSave={save} editing={editing} />
      <CustomerLedgerModal
        open={!!ledgerCustomer} onClose={() => setLedgerCustomer(null)} customer={ledgerCustomer} sales={sales} payments={payments}
        onRecordPayment={() => { setPaymentCustomer(ledgerCustomer); setLedgerCustomer(null); }}
        shopName={settings.shopName} shopAddress={settings.address} shopPhone={settings.phone}
      />
      <PaymentFormModal open={!!paymentCustomer} onClose={() => setPaymentCustomer(null)} onSave={handlePayment} customer={paymentCustomer} />
    </div>
  );
}
