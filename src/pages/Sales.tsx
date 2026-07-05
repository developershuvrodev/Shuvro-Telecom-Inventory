import React, { useMemo, useState } from "react";
import { Plus, Search, Eye, Receipt } from "lucide-react";
import { Badge, EmptyState, Pagination } from "@/components/ui/Primitives";
import { SaleFormModal, CashMemoModal } from "@/components/sales/SalesModals";
import { fmtDate, fmtMoney, fmtNum } from "@/lib/utils";
import type { Product, Customer, Sale, ShopSettings, ToastType } from "@/types";

interface SalesProps {
  sales: Sale[];
  onCreateSale: (sale: Omit<Sale, "id" | "invoiceNo">) => void;
  products: Product[];
  customers: Customer[];
  settings: ShopSettings;
  addToast: (msg: string, type?: ToastType) => void;
}

export function Sales({ sales, onCreateSale, products, customers, settings, addToast }: SalesProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [memoSale, setMemoSale] = useState<Sale | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...sales]
      .filter((s) => !q || s.invoiceNo.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const todayTotal = sales.filter((s) => new Date(s.date).toDateString() === new Date().toDateString()).reduce((sum, s) => sum + s.total, 0);
  const totalDue = sales.reduce((sum, s) => sum + s.due, 0);

  const handleSave = (sale: Omit<Sale, "id" | "invoiceNo">) => {
    onCreateSale(sale);
    addToast(`"${sale.customerName}" — বিক্রয় সফলভাবে সম্পন্ন হয়েছে`, "success");
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-text">বিক্রয় / ক্যাশ মেমো</h1>
          <p className="text-[13px] mt-0.5 text-text-faint">আজকের বিক্রয়ঃ {fmtMoney(todayTotal)} · মোট বকেয়াঃ {fmtMoney(totalDue)}</p>
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-primary"><Plus size={15} />নতুন বিক্রয়</button>
      </div>

      <div className="card p-3">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="ইনভয়েস বা কাস্টমার নাম খুঁজুন…" className="input pl-9" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {pageItems.length === 0 ? (
          <EmptyState icon={Receipt} title="কোনো বিক্রয় পাওয়া যায়নি" subtitle="নতুন বিক্রয় তৈরি করে শুরু করুন" action={<button onClick={() => setFormOpen(true)} className="btn-primary"><Plus size={15} />নতুন বিক্রয়</button>} />
        ) : (
          <div className="overflow-x-auto scrollbar">
            <table className="data-table">
              <thead><tr><th>ইনভয়েস</th><th>কাস্টমার</th><th>তারিখ</th><th>আইটেম</th><th>মোট</th><th>পরিশোধিত</th><th>বাকি</th><th className="text-right">অ্যাকশন</th></tr></thead>
              <tbody>
                {pageItems.map((s) => (
                  <tr key={s.id}>
                    <td className="num font-semibold text-text">{s.invoiceNo}</td>
                    <td className="text-text-dim">{s.customerName}</td>
                    <td className="num text-[12.5px]">{fmtDate(s.date)}</td>
                    <td className="num text-[12.5px]">{fmtNum(s.items.length)} টি</td>
                    <td className="num font-semibold text-text">{fmtMoney(s.total)}</td>
                    <td className="num text-accent">{fmtMoney(s.paid)}</td>
                    <td>{s.due > 0 ? <Badge color="var(--danger)" bg="var(--danger-soft)">{fmtMoney(s.due)}</Badge> : <Badge>পরিশোধিত</Badge>}</td>
                    <td className="text-right"><button onClick={() => setMemoSale(s)} className="btn-ghost p-1.5"><Eye size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {pageItems.length > 0 && <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} />}

      <SaleFormModal open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} products={products} customers={customers} />
      <CashMemoModal open={!!memoSale} onClose={() => setMemoSale(null)} sale={memoSale} shopName={settings.shopName} shopAddress={settings.address} shopPhone={settings.phone} />
    </div>
  );
}
