export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  contact: string;
}

export interface Product {
  id: string;
  name: string;
  category: string; // Category.id
  brand: string; // Brand.id
  sku: string;
  barcode: string;
  model?: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  supplier: string; // Supplier.id
  warranty?: string;
  imageUrl?: string;
  imageColor: string;
  notes?: string;
  createdAt: string;
}

export type StockTxType = "in" | "out" | "adjustment";

export interface StockTx {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: StockTxType;
  qty: number;
  prevStock: number;
  newStock: number;
  reason: string;
  reference: string;
  by: string;
}

export interface ShopSettings {
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  lowStockDefault: number;
  invoicePrefix: string;
}

export type StockStatusKey = "ok" | "low" | "out";

export interface StockStatus {
  key: StockStatusKey;
  label: string;
  color: string;
  bg: string;
}

export interface ImportSummary {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
  created: number;
  updated: number;
  errors: { row: number | string; message: string }[];
  total: number;
}

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  msg: string;
  type: ToastType;
  title?: string;
}

export type NavKey =
  | "dashboard"
  | "sales"
  | "purchases"
  | "products"
  | "categories"
  | "brands"
  | "suppliers"
  | "stockflow"
  | "adjustment"
  | "lowstock"
  | "cashbook"
  | "customers"
  | "reports"
  | "settings";

/* ---------------------------------------------------------------------------
   ACCOUNTING / সেলস-পারচেজ / ক্যাশবুক / কাস্টমার লেজার
   ------------------------------------------------------------------------ */

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  /** সিস্টেম ব্যবহারের আগের বকেয়া হিসাব — পুরানো খাতা থেকে মাইগ্রেট করার জন্য */
  openingDue: number;
  createdAt: string;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  note?: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  due: number;
  note?: string;
}

export interface PurchaseItem {
  productId: string;
  name: string;
  qty: number;
  cost: number;
  total: number;
}

export interface Purchase {
  id: string;
  refNo: string;
  date: string;
  supplierId: string;
  items: PurchaseItem[];
  subtotal: number;
  paid: number;
  due: number;
  note?: string;
}

export type PaymentMethod = "cash" | "bank" | "mobile";
export type LedgerEntryType = "income" | "expense";
export type LedgerRefType = "sale" | "purchase" | "customer-payment" | "manual";

export interface LedgerEntry {
  id: string;
  date: string;
  type: LedgerEntryType;
  category: string;
  amount: number;
  method: PaymentMethod;
  note?: string;
  refType: LedgerRefType;
  refId?: string;
}

export interface OpeningBalance {
  cash: number;
  date: string;
}

/** পুরো অ্যাপ্লিকেশনের ডেটা — localStorage/ব্যাকআপ ফাইলে সংরক্ষণের জন্য একটি একক শেপ */
export interface AppData {
  version: number;
  products: Product[];
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
  history: StockTx[];
  settings: ShopSettings;
  customers: Customer[];
  customerPayments: CustomerPayment[];
  sales: Sale[];
  purchases: Purchase[];
  ledger: LedgerEntry[];
  openingBalance: OpeningBalance;
  savedAt: string;
}
