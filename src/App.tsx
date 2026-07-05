import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Dashboard } from "@/pages/Dashboard";
import { Sales } from "@/pages/Sales";
import { Purchases } from "@/pages/Purchases";
import { Products } from "@/pages/Products";
import { Categories } from "@/pages/Categories";
import { Brands } from "@/pages/Brands";
import { Suppliers } from "@/pages/Suppliers";
import { StockFlow } from "@/pages/StockFlow";
import { Adjustment } from "@/pages/Adjustment";
import { LowStock } from "@/pages/LowStock";
import { Cashbook } from "@/pages/Cashbook";
import { Customers } from "@/pages/Customers";
import { Reports } from "@/pages/Reports";
import { Settings } from "@/pages/Settings";
import {
  CATEGORIES, BRANDS, SUPPLIERS, DEFAULT_SETTINGS, DEFAULT_OPENING_BALANCE,
  seedProducts, seedStockHistory, seedCustomers, seedSalesAndLedger,
} from "@/data/seed";
import { genInvoiceNo, genPurchaseRef } from "@/lib/accounting";
import { saveAppData, loadAppData, downloadBackup, parseBackupFile } from "@/lib/storage";
import { cx, uid } from "@/lib/utils";
import type {
  Product, Category, Brand, Supplier, StockTx, ShopSettings, NavKey,
  Customer, CustomerPayment, Sale, Purchase, LedgerEntry, OpeningBalance, AppData,
} from "@/types";

function buildInitialData(): AppData {
  const products = seedProducts();
  const customers = seedCustomers();
  const { sales, ledger, purchases } = seedSalesAndLedger(products, customers);
  return {
    version: 1,
    products,
    categories: CATEGORIES,
    brands: BRANDS,
    suppliers: SUPPLIERS,
    history: seedStockHistory(products),
    settings: DEFAULT_SETTINGS,
    customers,
    customerPayments: [],
    sales,
    purchases,
    ledger,
    openingBalance: DEFAULT_OPENING_BALANCE,
    savedAt: new Date().toISOString(),
  };
}

function AppShell() {
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NavKey>("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [routedQuery, setRoutedQuery] = useState("");

  // Hydrate from localStorage on first render if a previous session exists.
  const initial = useRef<AppData | null>(null);
  if (initial.current === null) {
    initial.current = loadAppData() || buildInitialData();
  }
  const seed = initial.current;

  const [products, setProducts] = useState<Product[]>(seed.products);
  const [categories, setCategories] = useState<Category[]>(seed.categories);
  const [brands, setBrands] = useState<Brand[]>(seed.brands);
  const [suppliers, setSuppliers] = useState<Supplier[]>(seed.suppliers);
  const [history, setHistory] = useState<StockTx[]>(seed.history);
  const [settings, setSettings] = useState<ShopSettings>(seed.settings);
  const [customers, setCustomers] = useState<Customer[]>(seed.customers);
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(seed.customerPayments);
  const [sales, setSales] = useState<Sale[]>(seed.sales);
  const [purchases, setPurchases] = useState<Purchase[]>(seed.purchases);
  const [ledger, setLedger] = useState<LedgerEntry[]>(seed.ledger);
  const [openingBalance, setOpeningBalance] = useState<OpeningBalance>(seed.openingBalance);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(loadAppData()?.savedAt || null);

  const addToast = useToast();
  const searchRef = useRef<HTMLInputElement>(null);
  const gPressed = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  // Auto-persist everything to localStorage whenever core data changes (debounced).
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const snapshot: AppData = {
        version: 1, products, categories, brands, suppliers, history, settings,
        customers, customerPayments, sales, purchases, ledger, openingBalance,
        savedAt: new Date().toISOString(),
      };
      saveAppData(snapshot);
      setLastSavedAt(snapshot.savedAt);
    }, 600);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [products, categories, brands, suppliers, history, settings, customers, customerPayments, sales, purchases, ledger, openingBalance]);

  const addHistory = useCallback((tx: StockTx) => setHistory((h) => [tx, ...h]), []);
  const addLedgerEntry = useCallback((entry: LedgerEntry) => setLedger((l) => [entry, ...l]), []);

  const lowCount = useMemo(() => products.filter((p) => p.stock <= p.minStock).length, [products]);

  const navigate = (key: NavKey) => { setActiveTab(key); setMobileNavOpen(false); };

  const handleSearchEnter = () => {
    setRoutedQuery(searchQuery);
    setActiveTab("products");
  };

  /* ---------------- Sales: create invoice, decrement stock, log ledger ---------------- */
  const createSale = (input: Omit<Sale, "id" | "invoiceNo">) => {
    const invoiceNo = genInvoiceNo(sales, settings);
    const sale: Sale = { ...input, id: uid("sale"), invoiceNo };
    setSales((s) => [sale, ...s]);
    const qtyByProduct: Record<string, number> = {};
    sale.items.forEach((it) => { qtyByProduct[it.productId] = (qtyByProduct[it.productId] || 0) + it.qty; });
    setProducts((prev) =>
      prev.map((p) => (qtyByProduct[p.id] ? { ...p, stock: p.stock - qtyByProduct[p.id] } : p))
    );
    sale.items.forEach((it) => {
      const prod = products.find((p) => p.id === it.productId);
      addHistory({
        id: uid("tx"), date: sale.date, productId: it.productId, productName: it.name,
        type: "out", qty: it.qty, prevStock: prod?.stock ?? 0, newStock: (prod?.stock ?? 0) - it.qty,
        reason: "বিক্রয়", reference: sale.invoiceNo, by: settings.ownerName,
      });
    });
    if (sale.paid > 0) {
      addLedgerEntry({
        id: uid("ldg"), date: sale.date, type: "income", category: "বিক্রয় আয়", amount: sale.paid,
        method: "cash", note: `ইনভয়েস ${sale.invoiceNo} — ${sale.customerName}`, refType: "sale", refId: sale.id,
      });
    }
  };

  /* ---------------- Purchases: create ref, increment stock, log ledger ---------------- */
  const createPurchase = (input: Omit<Purchase, "id" | "refNo">) => {
    const refNo = genPurchaseRef(purchases);
    const purchase: Purchase = { ...input, id: uid("pur"), refNo };
    setPurchases((p) => [purchase, ...p]);
    const qtyByProduct: Record<string, number> = {};
    purchase.items.forEach((it) => { qtyByProduct[it.productId] = (qtyByProduct[it.productId] || 0) + it.qty; });
    setProducts((prev) =>
      prev.map((p) => (qtyByProduct[p.id] ? { ...p, stock: p.stock + qtyByProduct[p.id] } : p))
    );
    purchase.items.forEach((it) => {
      const prod = products.find((p) => p.id === it.productId);
      addHistory({
        id: uid("tx"), date: purchase.date, productId: it.productId, productName: it.name,
        type: "in", qty: it.qty, prevStock: prod?.stock ?? 0, newStock: (prod?.stock ?? 0) + it.qty,
        reason: "ক্রয়", reference: purchase.refNo, by: settings.ownerName,
      });
    });
    if (purchase.paid > 0) {
      const supplierName = suppliers.find((s) => s.id === purchase.supplierId)?.name || "সাপ্লায়ার";
      addLedgerEntry({
        id: uid("ldg"), date: purchase.date, type: "expense", category: "পণ্য ক্রয়", amount: purchase.paid,
        method: "cash", note: `রেফারেন্স ${purchase.refNo} — ${supplierName}`, refType: "purchase", refId: purchase.id,
      });
    }
  };

  const addCustomerPayment = (p: CustomerPayment) => {
    setCustomerPayments((cp) => [p, ...cp]);
    const customerName = customers.find((c) => c.id === p.customerId)?.name || "কাস্টমার";
    addLedgerEntry({
      id: uid("ldg"), date: p.date, type: "income", category: "পুরাতন বকেয়া আদায়", amount: p.amount,
      method: p.method, note: `${customerName} — ${p.note || "বকেয়া পরিশোধ"}`, refType: "customer-payment", refId: p.id,
    });
  };

  const resetDemo = () => {
    const fresh = buildInitialData();
    setProducts(fresh.products);
    setCategories(fresh.categories);
    setBrands(fresh.brands);
    setSuppliers(fresh.suppliers);
    setHistory(fresh.history);
    setSettings(fresh.settings);
    setCustomers(fresh.customers);
    setCustomerPayments(fresh.customerPayments);
    setSales(fresh.sales);
    setPurchases(fresh.purchases);
    setLedger(fresh.ledger);
    setOpeningBalance(fresh.openingBalance);
    addToast("ডেমো ডেটা সফলভাবে রিসেট করা হয়েছে", "success");
  };

  const handleDownloadBackup = () => {
    downloadBackup({
      version: 1, products, categories, brands, suppliers, history, settings,
      customers, customerPayments, sales, purchases, ledger, openingBalance,
      savedAt: new Date().toISOString(),
    });
    addToast("ব্যাকআপ ফাইল ডাউনলোড হয়েছে", "success");
  };

  const handleRestoreBackup = async (file: File) => {
    try {
      const data = await parseBackupFile(file);
      setProducts(data.products || []);
      setCategories(data.categories || []);
      setBrands(data.brands || []);
      setSuppliers(data.suppliers || []);
      setHistory(data.history || []);
      setSettings(data.settings || DEFAULT_SETTINGS);
      setCustomers(data.customers || []);
      setCustomerPayments(data.customerPayments || []);
      setSales(data.sales || []);
      setPurchases(data.purchases || []);
      setLedger(data.ledger || []);
      setOpeningBalance(data.openingBalance || DEFAULT_OPENING_BALANCE);
      addToast("ব্যাকআপ থেকে সফলভাবে পুনরুদ্ধার করা হয়েছে", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "ব্যাকআপ ফাইল পড়া যায়নি", "error");
    }
  };

  // Keyboard shortcuts: "/" focus search, "n" new product, "g d" / "g p" navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = (target.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || target.isContentEditable;
      if (e.key === "/" && !typing) { e.preventDefault(); searchRef.current?.focus(); return; }
      if (typing) return;
      if (gPressed.current) {
        gPressed.current = false;
        if (e.key.toLowerCase() === "d") setActiveTab("dashboard");
        if (e.key.toLowerCase() === "p") setActiveTab("products");
        return;
      }
      if (e.key.toLowerCase() === "g") { gPressed.current = true; setTimeout(() => (gPressed.current = false), 800); return; }
      if (e.key.toLowerCase() === "n" && activeTab === "products") {
        window.dispatchEvent(new CustomEvent("st-new-product"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTab]);

  return (
    <div className={cx(dark && "dark")}>
      <div className="flex min-h-screen bg-bg text-text">
        <Sidebar active={activeTab} onNavigate={navigate} open={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} lowCount={lowCount} shopName={settings.shopName} />
        <div className="flex-1 min-w-0">
          <Topbar onMenu={() => setMobileNavOpen(true)} dark={dark} onToggleDark={() => setDark((d) => !d)} query={searchQuery} onQuery={setSearchQuery} onSearchEnter={handleSearchEnter} lowCount={lowCount} searchRef={searchRef} />
          <main className="min-h-[calc(100vh-57px)] scrollbar">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                {activeTab === "dashboard" && <Dashboard products={products} categories={categories} history={history} settings={settings} onNavigate={navigate} loading={loading} />}
                {activeTab === "sales" && <Sales sales={sales} onCreateSale={createSale} products={products} customers={customers} settings={settings} addToast={addToast} />}
                {activeTab === "purchases" && <Purchases purchases={purchases} onCreatePurchase={createPurchase} products={products} suppliers={suppliers} addToast={addToast} />}
                {activeTab === "products" && (
                  <Products
                    products={products} setProducts={setProducts}
                    categories={categories} setCategories={setCategories}
                    brands={brands} setBrands={setBrands}
                    suppliers={suppliers} setSuppliers={setSuppliers}
                    loading={loading} initialQuery={routedQuery} addToast={addToast} settings={settings}
                  />
                )}
                {activeTab === "categories" && <Categories categories={categories} setCategories={setCategories} products={products} addToast={addToast} />}
                {activeTab === "brands" && <Brands brands={brands} setBrands={setBrands} products={products} addToast={addToast} />}
                {activeTab === "suppliers" && <Suppliers suppliers={suppliers} setSuppliers={setSuppliers} products={products} addToast={addToast} />}
                {activeTab === "stockflow" && <StockFlow products={products} setProducts={setProducts} history={history} addHistory={addHistory} addToast={addToast} settings={settings} />}
                {activeTab === "adjustment" && <Adjustment products={products} setProducts={setProducts} history={history} addHistory={addHistory} addToast={addToast} settings={settings} />}
                {activeTab === "lowstock" && <LowStock products={products} categories={categories} brands={brands} setActiveTab={navigate} />}
                {activeTab === "cashbook" && <Cashbook ledger={ledger} addLedgerEntry={addLedgerEntry} sales={sales} purchases={purchases} openingBalance={openingBalance} setOpeningBalance={setOpeningBalance} addToast={addToast} />}
                {activeTab === "customers" && <Customers customers={customers} setCustomers={setCustomers} sales={sales} payments={customerPayments} addPayment={addCustomerPayment} addToast={addToast} settings={settings} />}
                {activeTab === "reports" && <Reports products={products} categories={categories} brands={brands} suppliers={suppliers} history={history} settings={settings} />}
                {activeTab === "settings" && (
                  <Settings
                    settings={settings} setSettings={setSettings} dark={dark} onToggleDark={() => setDark((d) => !d)}
                    addToast={addToast} onResetDemo={resetDemo}
                    onDownloadBackup={handleDownloadBackup} onRestoreBackup={handleRestoreBackup} lastSavedAt={lastSavedAt}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
