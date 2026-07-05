import React, { useMemo } from "react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  Package, Wallet, TrendingUp, AlertTriangle, Clock, ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal, PackageCheck, ClipboardList,
} from "lucide-react";
import { StatCard, EmptyState, Skeleton, Badge } from "@/components/ui/Primitives";
import { ProductAvatar } from "@/components/shared/ProductAvatar";
import { fmtMoney, fmtNum, fmtDate, fmtDateTime, stockStatus } from "@/lib/utils";
import type { Product, Category, StockTx, ShopSettings, NavKey } from "@/types";

const PIE_COLORS = ["#0F9E93", "#E08A2C", "#3E6DF0", "#B155D6", "#E14B4B", "#2F9E44", "#D6934A", "#5C6BC0", "#26A6A0", "#F06292"];

interface DashboardProps {
  products: Product[];
  categories: Category[];
  history: StockTx[];
  settings: ShopSettings;
  onNavigate: (k: NavKey) => void;
  loading: boolean;
}

export function Dashboard({ products, categories, history, settings, onNavigate, loading }: DashboardProps) {
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStockQty = products.reduce((s, p) => s + p.stock, 0);
    const stockValue = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
    const potentialProfit = products.reduce((s, p) => s + p.stock * (p.salePrice - p.purchasePrice), 0);
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
    const outStock = products.filter((p) => p.stock <= 0).length;
    return { totalProducts, totalStockQty, stockValue, potentialProfit, lowStock, outStock };
  }, [products]);

  const categoryData = useMemo(
    () =>
      categories
        .map((c) => {
          const items = products.filter((p) => p.category === c.id);
          const value = items.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
          return { name: c.name, value, count: items.length };
        })
        .filter((c) => c.count > 0)
        .sort((a, b) => b.value - a.value),
    [products, categories]
  );

  const movementData = useMemo(() => {
    const days: { name: string; ইন: number; আউট: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toDateString();
      const label = d.toLocaleDateString("bn-BD", { weekday: "short" });
      const dayIn = history.filter((h) => new Date(h.date).toDateString() === key && h.type === "in").reduce((s, h) => s + h.qty, 0);
      const dayOut = history.filter((h) => new Date(h.date).toDateString() === key && h.type === "out").reduce((s, h) => s + h.qty, 0);
      days.push({ name: label, ইন: dayIn, আউট: dayOut });
    }
    return days;
  }, [history]);

  const lowStockList = useMemo(() => products.filter((p) => p.stock <= p.minStock).sort((a, b) => a.stock - b.stock).slice(0, 6), [products]);
  const recentActivity = history.slice(0, 6);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[104px]" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-text">স্বাগতম, {settings.ownerName.split(" ")[0]} 👋</h1>
          <p className="text-[13px] mt-0.5 text-text-faint">{settings.shopName} — আজকের ইনভেন্টরি ওভারভিউ</p>
        </div>
        <div className="flex items-center gap-2 text-[12px] font-semibold text-text-faint">
          <Clock size={13} /> {fmtDateTime(new Date())}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Package} label="মোট পণ্য" value={fmtNum(stats.totalProducts)} sub={`${fmtNum(stats.totalStockQty)} ইউনিট স্টকে`} color="var(--accent)" bg="var(--accent-soft)" onClick={() => onNavigate("products")} />
        <StatCard icon={Wallet} label="স্টক মূল্য (ক্রয়মূল্যে)" value={fmtMoney(stats.stockValue)} sub="বর্তমান ইনভেন্টরি" color="var(--blue)" bg="var(--blue-soft)" onClick={() => onNavigate("reports")} />
        <StatCard icon={TrendingUp} label="সম্ভাব্য লাভ" value={fmtMoney(stats.potentialProfit)} sub="বিক্রয়মূল্য বিয়োগ ক্রয়মূল্য" color="#2F9E44" bg="rgba(47,158,68,0.12)" />
        <StatCard icon={AlertTriangle} label="লো স্টক / স্টক শেষ" value={`${fmtNum(stats.lowStock)} / ${fmtNum(stats.outStock)}`} sub="দ্রুত রিস্টক প্রয়োজন" color="var(--amber)" bg="var(--amber-soft)" onClick={() => onNavigate("lowstock")} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[14.5px] text-text">স্টক মুভমেন্ট (গত ৭ দিন)</h3>
              <p className="text-[11.5px] text-text-faint">ইন ও আউট ট্রানজেকশনের পরিমাণ</p>
            </div>
            <div className="flex items-center gap-3 text-[11.5px] font-semibold">
              <span className="flex items-center gap-1.5 text-text-dim"><span className="w-2.5 h-2.5 rounded-full inline-block bg-accent" />ইন</span>
              <span className="flex items-center gap-1.5 text-text-dim"><span className="w-2.5 h-2.5 rounded-full inline-block bg-amber" />আউট</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={movementData} margin={{ left: -20, right: 8 }}>
              <defs>
                <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0F9E93" stopOpacity={0.35} /><stop offset="95%" stopColor="#0F9E93" stopOpacity={0} /></linearGradient>
                <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E08A2C" stopOpacity={0.35} /><stop offset="95%" stopColor="#E08A2C" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11.5, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} width={30} />
              <RTooltip contentStyle={{ background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12.5 }} />
              <Area type="monotone" dataKey="ইন" stroke="#0F9E93" fill="url(#gIn)" strokeWidth={2} />
              <Area type="monotone" dataKey="আউট" stroke="#E08A2C" fill="url(#gOut)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="font-bold text-[14.5px] mb-0.5 text-text">ক্যাটাগরি অনুযায়ী স্টক মূল্য</h3>
          <p className="text-[11.5px] mb-2 text-text-faint">শীর্ষ ক্যাটাগরিসমূহ</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={2}>
                {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <RTooltip formatter={(v: number) => fmtMoney(v)} contentStyle={{ background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1 max-h-[110px] overflow-y-auto scrollbar">
            {categoryData.slice(0, 5).map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-1.5 truncate text-text-dim">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="truncate">{c.name}</span>
                </span>
                <span className="num font-semibold flex-shrink-0 text-text">{fmtMoney(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[14.5px] text-text">লো স্টক পণ্যসমূহ</h3>
            <button onClick={() => onNavigate("lowstock")} className="text-[12px] font-bold text-accent">সব দেখুন →</button>
          </div>
          {lowStockList.length === 0 ? (
            <EmptyState icon={PackageCheck} title="সব পণ্যের স্টক পর্যাপ্ত" subtitle="বর্তমানে কোনো পণ্যে লো-স্টক এলার্ট নেই" />
          ) : (
            <div className="space-y-1">
              {lowStockList.map((p) => {
                const st = stockStatus(p);
                return (
                  <div key={p.id} className="flex items-center gap-3 py-2 px-1 rounded-lg border-b border-border last:border-0">
                    <ProductAvatar product={p} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold truncate text-text">{p.name}</div>
                      <div className="text-[11px] text-text-faint">SKU: {p.sku}</div>
                    </div>
                    <Badge color={st.color} bg={st.bg}>{fmtNum(p.stock)} স্টক</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[14.5px] text-text">সাম্প্রতিক কার্যক্রম</h3>
            <button onClick={() => onNavigate("stockflow")} className="text-[12px] font-bold text-accent">সব দেখুন →</button>
          </div>
          {recentActivity.length === 0 ? (
            <EmptyState icon={ClipboardList} title="কোনো কার্যক্রম নেই" />
          ) : (
            <div className="space-y-1">
              {recentActivity.map((h) => {
                const conf =
                  h.type === "in" ? { ic: ArrowDownToLine, c: "var(--accent)", bg: "var(--accent-soft)", l: "স্টক ইন" }
                  : h.type === "out" ? { ic: ArrowUpFromLine, c: "var(--amber)", bg: "var(--amber-soft)", l: "স্টক আউট" }
                  : { ic: SlidersHorizontal, c: "var(--blue)", bg: "var(--blue-soft)", l: "সমন্বয়" };
                return (
                  <div key={h.id} className="flex items-center gap-3 py-2 px-1 border-b border-border last:border-0">
                    <div className="rounded-lg p-1.5 flex-shrink-0" style={{ background: conf.bg, color: conf.c }}><conf.ic size={14} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold truncate text-text">{h.productName}</div>
                      <div className="text-[11px] text-text-faint">{conf.l} · {h.reason} · {fmtDate(h.date)}</div>
                    </div>
                    <span className="num text-[12.5px] font-bold flex-shrink-0" style={{ color: conf.c }}>
                      {h.type === "out" ? "-" : "+"}{fmtNum(h.qty)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
