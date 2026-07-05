import React, { useMemo, useState } from "react";
import { Plus, Search, ShoppingBag } from "lucide-react";
import { Badge, EmptyState, Pagination } from "@/components/ui/Primitives";
import { PurchaseFormModal } from "@/components/purchases/PurchaseModals";
import { fmtDate, fmtMoney, fmtNum } from "@/lib/utils";
import type { Product, Supplier, Purchase, ToastType } from "@/types";

interface PurchasesProps {
  purchases: Purchase[];
  onCreatePurchase: (purchase: Omit<Purchase, "id" | "refNo">) => void;
  products: Product[];
  suppliers: Supplier[];
  addToast: (msg: string, type?: ToastType) => void;
}

export function Purchases({ purchases, onCreatePurchase, products, suppliers, addToast }: PurchasesProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const supName = (id: string) => suppliers.find((s) => s.id === id)?.name || "—";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...purchases]
      .filter((p) => !q || p.refNo.toLowerCase().includes(q) || supName(p.supplierId).toLowerCase().includes(q))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [purchases, query, suppliers]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const todayTotal = purchases.filter((p) => new Date(p.date).toDateString() === new Date().toDateString()).reduce((sum, p) => sum + p.subtotal, 0);
  const totalDue = purchases.reduce((sum, p) => sum + p.due, 0);

  const handleSave = (purchase: Omit<Purchase, "id" | "refNo">) => {
    onCreatePurchase(purchase);
    addToast(`${supName(purchase.supplierId)} থেকে ক্রয় সফলভাবে সম্পন্ন হয়েছে`, "success");
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-text">ক্রয়</h1>
          <p className="text-[13px] mt-0.5 text-text-faint">আজকের ক্রয়ঃ {fmtMoney(todayTotal)} · সাপ্লায়ারদের মোট পাওনাঃ {fmtMoney(totalDue)}</p>
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-primary"><Plus size={15} />নতুন ক্রয়</button>
      </div>

      <div className="card p-3">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="রেফারেন্স বা সাপ্লায়ার নাম খুঁজুন…" className="input pl-9" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {pageItems.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="কোনো ক্রয় পাওয়া যায়নি" subtitle="নতুন ক্রয় তৈরি করে শুরু করুন" action={<button onClick={() => setFormOpen(true)} className="btn-primary"><Plus size={15} />নতুন ক্রয়</button>} />
        ) : (
          <div className="overflow-x-auto scrollbar">
            <table className="data-table">
              <thead><tr><th>রেফারেন্স</th><th>সাপ্লায়ার</th><th>তারিখ</th><th>আইটেম</th><th>মোট</th><th>পরিশোধিত</th><th>বাকি</th></tr></thead>
              <tbody>
                {pageItems.map((p) => (
                  <tr key={p.id}>
                    <td className="num font-semibold text-text">{p.refNo}</td>
                    <td className="text-text-dim">{supName(p.supplierId)}</td>
                    <td className="num text-[12.5px]">{fmtDate(p.date)}</td>
                    <td className="num text-[12.5px]">{fmtNum(p.items.length)} টি</td>
                    <td className="num font-semibold text-text">{fmtMoney(p.subtotal)}</td>
                    <td className="num text-accent">{fmtMoney(p.paid)}</td>
                    <td>{p.due > 0 ? <Badge color="var(--danger)" bg="var(--danger-soft)">{fmtMoney(p.due)}</Badge> : <Badge>পরিশোধিত</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {pageItems.length > 0 && <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} />}

      <PurchaseFormModal open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} products={products} suppliers={suppliers} />
    </div>
  );
}
