import React, { useEffect, useMemo, useState } from "react";
import {
  Search, Plus, Upload, Download, Pencil, Trash2, Barcode as BarcodeIcon, CircleSlash, PackageSearch,
} from "lucide-react";
import { Badge, EmptyState, Pagination, Select, Skeleton, SortHeader, type SortState } from "@/components/ui/Primitives";
import { ConfirmDialog } from "@/components/ui/Modal";
import { ProductAvatar } from "@/components/shared/ProductAvatar";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { BarcodeModal, ImportExcelModal } from "@/components/products/BarcodeAndImportModals";
import { exportProductsToExcel } from "@/lib/excel";
import { fmtMoney, fmtNum, stockStatus } from "@/lib/utils";
import type { Product, Category, Brand, Supplier, ImportSummary, ShopSettings, ToastType } from "@/types";

interface ProductsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  loading: boolean;
  initialQuery: string;
  addToast: (msg: string, type?: ToastType, opts?: { title?: string }) => void;
  settings: ShopSettings;
}

export function Products({
  products, setProducts, categories, setCategories, brands, setBrands, suppliers, setSuppliers, loading, initialQuery, addToast, settings,
}: ProductsProps) {
  const [query, setQuery] = useState(initialQuery || "");
  const [catFilter, setCatFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "name", dir: "asc" });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selected, setSelected] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  useEffect(() => setQuery(initialQuery || ""), [initialQuery]);
  useEffect(() => setPage(1), [query, catFilter, brandFilter, statusFilter]);

  useEffect(() => {
    const handler = () => { setEditing(null); setFormOpen(true); };
    window.addEventListener("st-new-product", handler);
    return () => window.removeEventListener("st-new-product", handler);
  }, []);

  const catName = (id: string) => categories.find((c) => c.id === id)?.name || "—";
  const brandName = (id: string) => brands.find((b) => b.id === id)?.name || "—";

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q) || (p.model || "").toLowerCase().includes(q);
      const matchCat = !catFilter || p.category === catFilter;
      const matchBrand = !brandFilter || p.brand === brandFilter;
      const matchStatus = !statusFilter || stockStatus(p).key === statusFilter;
      return matchQ && matchCat && matchBrand && matchStatus;
    });
    list.sort((a, b) => {
      let av: string | number = (a as any)[sort.key];
      let bv: string | number = (b as any)[sort.key];
      if (sort.key === "category") { av = catName(a.category); bv = catName(b.category); }
      if (typeof av === "string") { av = av.toLowerCase(); bv = String(bv).toLowerCase(); }
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [products, query, catFilter, brandFilter, statusFilter, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const onSort = (key: string) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const handleSave = (p: Product) => {
    setProducts((prev) => {
      const exists = prev.some((x) => x.id === p.id);
      return exists ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev];
    });
    addToast(editing ? `"${p.name}" সফলভাবে আপডেট হয়েছে` : `"${p.name}" ইনভেন্টরিতে যোগ হয়েছে`, "success");
    setEditing(null);
  };

  const handleDelete = (p: Product) => {
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
    addToast(`"${p.name}" মুছে ফেলা হয়েছে`, "success");
  };

  const handleBulkDelete = () => {
    setProducts((prev) => prev.filter((x) => !selected.includes(x.id)));
    addToast(`${selected.length} টি পণ্য মুছে ফেলা হয়েছে`, "success");
    setSelected([]);
  };

  const handleImport = (summary: ImportSummary) => {
    setProducts(summary.products);
    setCategories(summary.categories);
    setBrands(summary.brands);
    setSuppliers(summary.suppliers);
    addToast(`ইম্পোর্ট সম্পন্ন: ${summary.created} নতুন, ${summary.updated} আপডেট`, "success", { title: "এক্সেল ইম্পোর্ট" });
  };

  const toggleSelect = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleSelectAll = () => setSelected((s) => (s.length === pageItems.length ? [] : pageItems.map((p) => p.id)));

  const clearFilters = () => { setQuery(""); setCatFilter(""); setBrandFilter(""); setStatusFilter(""); };
  const hasFilters = !!(query || catFilter || brandFilter || statusFilter);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-text">পণ্য তালিকা</h1>
          <p className="text-[13px] mt-0.5 text-text-faint">মোট {fmtNum(products.length)} টি পণ্য ইনভেন্টরিতে রয়েছে</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setImportOpen(true)} className="btn-soft"><Upload size={15} />ইম্পোর্ট</button>
          <button onClick={() => exportProductsToExcel(filtered, categories, brands, suppliers)} className="btn-soft"><Download size={15} />এক্সপোর্ট</button>
          <button onClick={() => { setEditing(null); setFormOpen(true); }} className="btn-primary"><Plus size={15} />নতুন পণ্য</button>
        </div>
      </div>

      <div className="card p-3 flex items-center gap-2.5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="নাম, SKU বা বারকোড দিয়ে খুঁজুন…" className="input pl-9" />
        </div>
        <Select value={catFilter} onChange={setCatFilter} options={categories.map((c) => ({ value: c.id, label: c.name }))} placeholder="সব ক্যাটাগরি" className="w-auto min-w-[140px]" />
        <Select value={brandFilter} onChange={setBrandFilter} options={brands.map((b) => ({ value: b.id, label: b.name }))} placeholder="সব ব্র্যান্ড" className="w-auto min-w-[130px]" />
        <Select value={statusFilter} onChange={setStatusFilter} options={[{ value: "ok", label: "পর্যাপ্ত স্টক" }, { value: "low", label: "লো স্টক" }, { value: "out", label: "স্টক শেষ" }]} placeholder="সব অবস্থা" className="w-auto min-w-[120px]" />
        {hasFilters && <button onClick={clearFilters} className="btn-ghost"><CircleSlash size={14} />পরিষ্কার</button>}
      </div>

      {selected.length > 0 && (
        <div className="card p-3 flex items-center justify-between flex-wrap gap-2 border-0 bg-accent-soft">
          <span className="text-[13px] font-bold text-accent-ink">{selected.length} টি পণ্য নির্বাচিত</span>
          <div className="flex items-center gap-2">
            <button onClick={() => exportProductsToExcel(products.filter((p) => selected.includes(p.id)), categories, brands, suppliers)} className="btn-soft py-1.5"><Download size={13} />এক্সপোর্ট</button>
            <button onClick={() => setConfirmBulkDelete(true)} className="btn-danger py-1.5"><Trash2 size={13} />মুছে ফেলুন</button>
            <button onClick={() => setSelected([])} className="btn-ghost py-1.5">বাতিল</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : pageItems.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="কোনো পণ্য পাওয়া যায়নি"
            subtitle={hasFilters ? "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন" : "নতুন পণ্য যোগ করে শুরু করুন"}
            action={hasFilters ? <button onClick={clearFilters} className="btn-soft">ফিল্টার পরিষ্কার করুন</button> : <button onClick={() => setFormOpen(true)} className="btn-primary"><Plus size={15} />নতুন পণ্য যোগ করুন</button>}
          />
        ) : (
          <div className="overflow-x-auto scrollbar">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-8"><input type="checkbox" checked={selected.length === pageItems.length} onChange={toggleSelectAll} /></th>
                  <SortHeader label="পণ্য" sortKey="name" sort={sort} onSort={onSort} />
                  <SortHeader label="ক্যাটাগরি" sortKey="category" sort={sort} onSort={onSort} />
                  <th>SKU / বারকোড</th>
                  <SortHeader label="ক্রয়মূল্য" sortKey="purchasePrice" sort={sort} onSort={onSort} />
                  <SortHeader label="বিক্রয়মূল্য" sortKey="salePrice" sort={sort} onSort={onSort} />
                  <SortHeader label="স্টক" sortKey="stock" sort={sort} onSort={onSort} />
                  <th>অবস্থা</th>
                  <th className="text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((p) => {
                  const st = stockStatus(p);
                  return (
                    <tr key={p.id}>
                      <td><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                      <td>
                        <div className="flex items-center gap-2.5 min-w-[200px]">
                          <ProductAvatar product={p} size={36} />
                          <div className="min-w-0">
                            <div className="font-semibold truncate max-w-[220px] text-text">{p.name}</div>
                            <div className="text-[11px] text-text-faint">{brandName(p.brand)} {p.model && `· ${p.model}`}</div>
                          </div>
                        </div>
                      </td>
                      <td><Badge color="var(--blue)" bg="var(--blue-soft)">{catName(p.category)}</Badge></td>
                      <td>
                        <div className="num text-text-dim">{p.sku}</div>
                        <div className="num text-[11px] text-text-faint">{p.barcode}</div>
                      </td>
                      <td className="num text-text-dim">{fmtMoney(p.purchasePrice)}</td>
                      <td className="num font-semibold text-text">{fmtMoney(p.salePrice)}</td>
                      <td className="num font-bold text-text">{fmtNum(p.stock)}</td>
                      <td><Badge color={st.color} bg={st.bg}>{st.label}</Badge></td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setBarcodeProduct(p)} title="বারকোড দেখুন" className="btn-ghost p-1.5"><BarcodeIcon size={15} /></button>
                          <button onClick={() => { setEditing(p); setFormOpen(true); }} title="সম্পাদনা" className="btn-ghost p-1.5"><Pencil size={15} /></button>
                          <button onClick={() => setConfirmDelete(p)} title="মুছুন" className="btn-ghost p-1.5 text-danger"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && pageItems.length > 0 && <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} />}

      <ProductFormModal open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} onSave={handleSave} editing={editing} products={products} categories={categories} brands={brands} suppliers={suppliers} />
      <BarcodeModal open={!!barcodeProduct} onClose={() => setBarcodeProduct(null)} product={barcodeProduct} shopName={settings.shopName} />
      <ImportExcelModal open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport} ctx={{ products, categories, brands, suppliers }} />
      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={() => confirmDelete && handleDelete(confirmDelete)} title="পণ্য মুছে ফেলবেন?" message={`"${confirmDelete?.name}" ইনভেন্টরি থেকে স্থায়ীভাবে মুছে যাবে। এই কাজটি ফিরিয়ে নেওয়া যাবে না।`} />
      <ConfirmDialog open={confirmBulkDelete} onClose={() => setConfirmBulkDelete(false)} onConfirm={handleBulkDelete} title="নির্বাচিত পণ্যসমূহ মুছবেন?" message={`${selected.length} টি পণ্য স্থায়ীভাবে মুছে যাবে। এই কাজটি ফিরিয়ে নেওয়া যাবে না।`} />
    </div>
  );
}
