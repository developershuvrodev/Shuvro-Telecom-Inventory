import React, { useState } from "react";
import { Plus, Pencil, Trash2, Award } from "lucide-react";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Badge, EmptyState, FormField } from "@/components/ui/Primitives";
import { cx, fmtNum, uid } from "@/lib/utils";
import type { Brand, Product, ToastType } from "@/types";

interface BrandsProps {
  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  products: Product[];
  addToast: (msg: string, type?: ToastType) => void;
}

export function Brands({ brands, setBrands, products, addToast }: BrandsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [confirmDel, setConfirmDel] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const openAdd = () => { setEditing(null); setName(""); setError(""); setModalOpen(true); };
  const openEdit = (b: Brand) => { setEditing(b); setName(b.name); setError(""); setModalOpen(true); };

  const save = () => {
    if (!name.trim()) { setError("ব্র্যান্ডের নাম আবশ্যক"); return; }
    if (brands.some((b) => b.name.toLowerCase() === name.toLowerCase() && b.id !== editing?.id)) { setError("এই নামে ব্র্যান্ড ইতিমধ্যে আছে"); return; }
    if (editing) { setBrands((bs) => bs.map((b) => (b.id === editing.id ? { ...b, name } : b))); addToast(`"${name}" ব্র্যান্ড আপডেট হয়েছে`, "success"); }
    else { setBrands((bs) => [...bs, { id: uid("br"), name }]); addToast(`"${name}" ব্র্যান্ড যোগ হয়েছে`, "success"); }
    setModalOpen(false);
  };

  const remove = (b: Brand) => {
    const count = products.filter((p) => p.brand === b.id).length;
    if (count > 0) { addToast(`এই ব্র্যান্ডে ${count} টি পণ্য আছে — প্রথমে সেগুলো সরান`, "error"); return; }
    setBrands((bs) => bs.filter((x) => x.id !== b.id));
    addToast(`"${b.name}" ব্র্যান্ড মুছে ফেলা হয়েছে`, "success");
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-text">ব্র্যান্ড</h1>
          <p className="text-[13px] mt-0.5 text-text-faint">মোট {fmtNum(brands.length)} টি ব্র্যান্ড</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={15} />নতুন ব্র্যান্ড</button>
      </div>
      {brands.length === 0 ? (
        <div className="card"><EmptyState icon={Award} title="কোনো ব্র্যান্ড নেই" action={<button onClick={openAdd} className="btn-primary"><Plus size={15} />ব্র্যান্ড যোগ করুন</button>} /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead><tr><th>ব্র্যান্ড</th><th>পণ্য সংখ্যা</th><th className="text-right">অ্যাকশন</th></tr></thead>
            <tbody>
              {brands.map((b) => {
                const count = products.filter((p) => p.brand === b.id).length;
                return (
                  <tr key={b.id}>
                    <td className="font-semibold text-text">{b.name}</td>
                    <td><Badge>{fmtNum(count)} টি পণ্য</Badge></td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(b)} className="btn-ghost p-1.5"><Pencil size={14} /></button>
                        <button onClick={() => setConfirmDel(b)} className="btn-ghost p-1.5 text-danger"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "ব্র্যান্ড সম্পাদনা" : "নতুন ব্র্যান্ড"}
        icon={Award}
        width={400}
        footer={<><button onClick={() => setModalOpen(false)} className="btn-ghost">বাতিল</button><button onClick={save} className="btn-primary">সংরক্ষণ করুন</button></>}
      >
        <FormField label="ব্র্যান্ডের নাম" required error={error}>
          <input className={cx("input", error && "input-err")} value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="যেমনঃ HP" />
        </FormField>
      </Modal>
      <ConfirmDialog open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={() => confirmDel && remove(confirmDel)} title="ব্র্যান্ড মুছবেন?" message={`"${confirmDel?.name}" স্থায়ীভাবে মুছে যাবে।`} />
    </div>
  );
}
