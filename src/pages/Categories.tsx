import React, { useState } from "react";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState, FormField } from "@/components/ui/Primitives";
import { cx, fmtNum, uid } from "@/lib/utils";
import type { Category, Product, ToastType } from "@/types";

const EMOJI_SET = ["💻", "🖥️", "🖵", "🖨️", "🔋", "🖱️", "📶", "💾", "📱", "⚡", "🎧", "⌨️", "🔌", "📷", "🖇️", "🧰"];

interface CategoriesProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  products: Product[];
  addToast: (msg: string, type?: ToastType) => void;
}

export function Categories({ categories, setCategories, products, addToast }: CategoriesProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirmDel, setConfirmDel] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", icon: "📦" });
  const [error, setError] = useState("");

  const openAdd = () => { setEditing(null); setForm({ name: "", icon: "📦" }); setError(""); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, icon: c.icon }); setError(""); setModalOpen(true); };

  const save = () => {
    if (!form.name.trim()) { setError("ক্যাটাগরির নাম আবশ্যক"); return; }
    if (categories.some((c) => c.name.toLowerCase() === form.name.toLowerCase() && c.id !== editing?.id)) { setError("এই নামে ক্যাটাগরি ইতিমধ্যে আছে"); return; }
    if (editing) {
      setCategories((cs) => cs.map((c) => (c.id === editing.id ? { ...c, ...form } : c)));
      addToast(`"${form.name}" ক্যাটাগরি আপডেট হয়েছে`, "success");
    } else {
      setCategories((cs) => [...cs, { id: uid("cat"), ...form }]);
      addToast(`"${form.name}" ক্যাটাগরি যোগ হয়েছে`, "success");
    }
    setModalOpen(false);
  };

  const remove = (c: Category) => {
    const count = products.filter((p) => p.category === c.id).length;
    if (count > 0) { addToast(`এই ক্যাটাগরিতে ${count} টি পণ্য আছে — প্রথমে সেগুলো সরান`, "error"); setConfirmDel(null); return; }
    setCategories((cs) => cs.filter((x) => x.id !== c.id));
    addToast(`"${c.name}" ক্যাটাগরি মুছে ফেলা হয়েছে`, "success");
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-text">ক্যাটাগরি</h1>
          <p className="text-[13px] mt-0.5 text-text-faint">মোট {fmtNum(categories.length)} টি ক্যাটাগরি</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={15} />নতুন ক্যাটাগরি</button>
      </div>
      {categories.length === 0 ? (
        <div className="card"><EmptyState icon={Tags} title="কোনো ক্যাটাগরি নেই" action={<button onClick={openAdd} className="btn-primary"><Plus size={15} />ক্যাটাগরি যোগ করুন</button>} /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((c) => {
            const count = products.filter((p) => p.category === c.id).length;
            return (
              <div key={c.id} className="card card-hover p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="rounded-xl p-2.5 text-[20px] bg-accent-soft">{c.icon}</div>
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => openEdit(c)} className="btn-ghost p-1.5"><Pencil size={14} /></button>
                    <button onClick={() => setConfirmDel(c)} className="btn-ghost p-1.5 text-danger"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="font-bold text-[14px] truncate text-text">{c.name}</div>
                <div className="text-[11.5px] mt-0.5 text-text-faint">{fmtNum(count)} টি পণ্য</div>
              </div>
            );
          })}
        </div>
      )}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "ক্যাটাগরি সম্পাদনা" : "নতুন ক্যাটাগরি"}
        icon={Tags}
        width={420}
        footer={<><button onClick={() => setModalOpen(false)} className="btn-ghost">বাতিল</button><button onClick={save} className="btn-primary">সংরক্ষণ করুন</button></>}
      >
        <div className="space-y-4">
          <FormField label="আইকন">
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_SET.map((e) => (
                <button key={e} onClick={() => setForm((f) => ({ ...f, icon: e }))} className="text-[18px] rounded-lg p-1.5" style={{ background: form.icon === e ? "var(--accent-soft)" : "var(--bg-soft)", outline: form.icon === e ? "2px solid var(--accent)" : "none" }}>{e}</button>
              ))}
            </div>
          </FormField>
          <FormField label="ক্যাটাগরির নাম" required error={error}>
            <input className={cx("input", error && "input-err")} value={form.name} onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError(""); }} placeholder="যেমনঃ ল্যাপটপ" />
          </FormField>
        </div>
      </Modal>
      <ConfirmDialog open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={() => confirmDel && remove(confirmDel)} title="ক্যাটাগরি মুছবেন?" message={`"${confirmDel?.name}" স্থায়ীভাবে মুছে যাবে।`} />
    </div>
  );
}
