import React, { useState } from "react";
import { AlertTriangle, CircleSlash, PackageCheck, PackagePlus } from "lucide-react";
import { Badge, EmptyState } from "@/components/ui/Primitives";
import { ProductAvatar } from "@/components/shared/ProductAvatar";
import { fmtNum } from "@/lib/utils";
import type { Product, Category, Brand, NavKey } from "@/types";

interface LowStockProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  setActiveTab: (k: NavKey) => void;
}

export function LowStock({ products, categories, brands, setActiveTab }: LowStockProps) {
  const [tab, setTab] = useState<"low" | "out">("low");
  const lowList = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).sort((a, b) => a.stock - b.stock);
  const outList = products.filter((p) => p.stock <= 0);
  const list = tab === "low" ? lowList : outList;
  const catName = (id: string) => categories.find((c) => c.id === id)?.name || "—";
  const brandName = (id: string) => brands.find((b) => b.id === id)?.name || "—";

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-[20px] font-extrabold text-text">লো স্টক এলার্ট</h1>
        <p className="text-[13px] mt-0.5 text-text-faint">দ্রুত রিস্টক প্রয়োজন এমন পণ্যসমূহ</p>
      </div>
      <div className="flex gap-2 p-1 rounded-xl w-fit bg-bg-soft">
        <button onClick={() => setTab("low")} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold" style={tab === "low" ? { background: "var(--amber)", color: "#fff" } : { color: "var(--text-dim)" }}>
          <AlertTriangle size={14} />লো স্টক ({fmtNum(lowList.length)})
        </button>
        <button onClick={() => setTab("out")} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold" style={tab === "out" ? { background: "var(--danger)", color: "#fff" } : { color: "var(--text-dim)" }}>
          <CircleSlash size={14} />স্টক শেষ ({fmtNum(outList.length)})
        </button>
      </div>
      <div className="card overflow-hidden">
        {list.length === 0 ? (
          <EmptyState icon={PackageCheck} title={tab === "low" ? "কোনো পণ্যে লো-স্টক নেই" : "কোনো পণ্যের স্টক শেষ নেই"} subtitle="ইনভেন্টরি সুস্থ অবস্থায় আছে" />
        ) : (
          <div className="overflow-x-auto scrollbar">
            <table className="data-table">
              <thead><tr><th>পণ্য</th><th>ক্যাটাগরি / ব্র্যান্ড</th><th>বর্তমান স্টক</th><th>সর্বনিম্ন স্টক</th><th>ঘাটতি</th><th className="text-right">অ্যাকশন</th></tr></thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-2.5 min-w-[180px]">
                        <ProductAvatar product={p} size={34} />
                        <div className="min-w-0">
                          <div className="font-semibold truncate max-w-[200px] text-text">{p.name}</div>
                          <div className="text-[11px] text-text-faint">SKU: {p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-[12.5px] text-text-dim">{catName(p.category)} · {brandName(p.brand)}</td>
                    <td className="num font-bold" style={{ color: tab === "out" ? "var(--danger)" : "var(--amber)" }}>{fmtNum(p.stock)}</td>
                    <td className="num text-text-dim">{fmtNum(p.minStock)}</td>
                    <td><Badge color="var(--danger)" bg="var(--danger-soft)">{fmtNum(Math.max(0, p.minStock - p.stock + 1))} প্রয়োজন</Badge></td>
                    <td className="text-right">
                      <button onClick={() => setActiveTab("stockflow")} className="btn-soft py-1.5"><PackagePlus size={13} />রিস্টক করুন</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
