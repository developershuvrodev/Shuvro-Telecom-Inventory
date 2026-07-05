import React, { useState } from "react";
import { Plus, Pencil, Trash2, Truck, Phone, MapPin } from "lucide-react";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Badge, EmptyState, FormField } from "@/components/ui/Primitives";
import { cx, fmtNum, uid } from "@/lib/utils";
import type { Supplier, Product, ToastType } from "@/types";

interface SuppliersProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  products: Product[];
  addToast: (msg: string, type?: ToastType) => void;
}

const emptyForm = { name: "", phone: "", address: "", contact: "" };

export function Suppliers({ suppliers, setSuppliers, products, addToast }: SuppliersProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [confirmDel, setConfirmDel] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (s: Supplier) => { setEditing(s); setForm(s); setErrors({}); setModalOpen(true); };

  const save = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "প্রতিষ্ঠানের নাম আবশ্যক";
    if (!form.phone.trim()) e.phone = "ফোন নম্বর আবশ্যক";
    setErrors(e);
    if (Object.keys(e).length) return;
    if (editing) { setSuppliers((ss) => ss.map((s) => (s.id === editing.id ? { ...s, ...form } : s))); addToast(`"${form.name}" আপডেট হয়েছে`, "success"); }
    else { setSuppliers((ss) => [...ss, { id: uid("sup"), ...form }]); addToast(`"${form.name}" সাপ্লায়ার হিসেবে যোগ হয়েছে`, "success"); }
    setModalOpen(false);
  };

  const remove = (s: Supplier) => {
    const count = products.filter((p) => p.supplier === s.id).length;
    if (count > 0) { addToast(`এই সাপ্লায়ারের ${count} টি পণ্য আছে — প্রথমে সেগুলো সরান`, "error"); return; }
    setSuppliers((ss) => ss.filter((x) => x.id !== s.id));
    addToast(`"${s.name}" মুছে ফেলা হয়েছে`, "success");
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-text">সাপ্লায়ার</h1>
          <p className="text-[13px] mt-0.5 text-text-faint">মোট {fmtNum(suppliers.length)} টি সাপ্লায়ার</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={15} />নতুন সাপ্লায়ার</button>
      </div>
      {suppliers.length === 0 ? (
        <div className="card"><EmptyState icon={Truck} title="কোনো সাপ্লায়ার নেই" action={<button onClick={openAdd} className="btn-primary"><Plus size={15} />সাপ্লায়ার যোগ করুন</button>} /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {suppliers.map((s) => {
            const count = products.filter((p) => p.supplier === s.id).length;
            return (
              <div key={s.id} className="card card-hover p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="rounded-xl p-2.5 bg-blue-soft text-blue"><Truck size={18} /></div>
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => openEdit(s)} className="btn-ghost p-1.5"><Pencil size={14} /></button>
                    <button onClick={() => setConfirmDel(s)} className="btn-ghost p-1.5 text-danger"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="font-bold text-[14.5px] text-text">{s.name}</div>
                <div className="text-[12px] mt-0.5 text-text-faint">যোগাযোগঃ {s.contact || "—"}</div>
                <div className="flex items-center gap-1.5 text-[12px] mt-2 text-text-dim"><Phone size={12} />{s.phone}</div>
                <div className="flex items-center gap-1.5 text-[12px] mt-1 text-text-dim"><MapPin size={12} /><span className="truncate">{s.address}</span></div>
                <div className="mt-3"><Badge>{fmtNum(count)} টি পণ্য সরবরাহ করেন</Badge></div>
              </div>
            );
          })}
        </div>
      )}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "সাপ্লায়ার সম্পাদনা" : "নতুন সাপ্লায়ার"}
        icon={Truck}
        width={460}
        footer={<><button onClick={() => setModalOpen(false)} className="btn-ghost">বাতিল</button><button onClick={save} className="btn-primary">সংরক্ষণ করুন</button></>}
      >
        <div className="space-y-4">
          <FormField label="প্রতিষ্ঠানের নাম" required error={errors.name}>
            <input className={cx("input", errors.name && "input-err")} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </FormField>
          <FormField label="যোগাযোগকারীর নাম">
            <input className="input" value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} />
          </FormField>
          <FormField label="ফোন নম্বর" required error={errors.phone}>
            <input className={cx("input", errors.phone && "input-err")} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </FormField>
          <FormField label="ঠিকানা">
            <input className="input" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </FormField>
        </div>
      </Modal>
      <ConfirmDialog open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={() => confirmDel && remove(confirmDel)} title="সাপ্লায়ার মুছবেন?" message={`"${confirmDel?.name}" স্থায়ীভাবে মুছে যাবে।`} />
    </div>
  );
}
