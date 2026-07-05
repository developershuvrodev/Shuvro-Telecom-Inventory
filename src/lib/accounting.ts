import type {
  Sale, Purchase, LedgerEntry, Customer, CustomerPayment, OpeningBalance, ShopSettings,
} from "@/types";

/* ---------------- Invoice / reference number generators ---------------- */
export function genInvoiceNo(sales: Sale[], settings: ShopSettings): string {
  const year = new Date().getFullYear();
  const n = sales.length + 1;
  return `${settings.invoicePrefix || "ST-INV"}-${year}-${String(n).padStart(4, "0")}`;
}

export function genPurchaseRef(purchases: Purchase[]): string {
  const n = purchases.length + 1;
  return `PUR-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`;
}

/* ---------------- Customer ledger / due calculation ---------------- */
export function customerDue(customer: Customer, sales: Sale[], payments: CustomerPayment[]): number {
  const salesDue = sales.filter((s) => s.customerId === customer.id).reduce((sum, s) => sum + s.due, 0);
  const paid = payments.filter((p) => p.customerId === customer.id).reduce((sum, p) => sum + p.amount, 0);
  return customer.openingDue + salesDue - paid;
}

export interface CustomerLedgerRow {
  date: string;
  label: string;
  detail: string;
  debit: number; // customer owes more (sale due)
  credit: number; // customer pays (reduces due)
  runningBalance: number;
}

export function buildCustomerLedger(customer: Customer, sales: Sale[], payments: CustomerPayment[]): CustomerLedgerRow[] {
  type Raw = { date: string; label: string; detail: string; debit: number; credit: number };
  const rows: Raw[] = [];
  sales.filter((s) => s.customerId === customer.id).forEach((s) => {
    rows.push({ date: s.date, label: `ইনভয়েস ${s.invoiceNo}`, detail: `মোট ${s.total} — পরিশোধ ${s.paid}`, debit: s.due, credit: 0 });
  });
  payments.filter((p) => p.customerId === customer.id).forEach((p) => {
    rows.push({ date: p.date, label: "পেমেন্ট গ্রহণ", detail: p.note || "বকেয়া পরিশোধ", debit: 0, credit: p.amount });
  });
  rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let running = customer.openingDue;
  return [
    { date: customer.createdAt, label: "পূর্বের বকেয়া (ওপেনিং)", detail: "সিস্টেম শুরুর আগের হিসাব", debit: customer.openingDue, credit: 0, runningBalance: running },
    ...rows.map((r) => {
      running += r.debit - r.credit;
      return { ...r, runningBalance: running };
    }),
  ];
}

/* ---------------- Cashbook (দৈনিক আয়-ব্যয়) ---------------- */
export interface CashbookRow {
  id: string;
  date: string;
  type: "opening" | "income" | "expense";
  label: string;
  detail: string;
  amount: number;
  runningBalance: number;
}

export function buildCashbook(
  opening: OpeningBalance,
  ledger: LedgerEntry[],
  sales: Sale[],
  purchases: Purchase[]
): CashbookRow[] {
  type Raw = { id: string; date: string; type: "income" | "expense"; label: string; detail: string; amount: number };
  const raw: Raw[] = [];

  ledger.forEach((l) => {
    raw.push({ id: l.id, date: l.date, type: l.type, label: l.category, detail: l.note || "", amount: l.amount });
  });
  sales.forEach((s) => {
    if (s.paid > 0) raw.push({ id: `sale-${s.id}`, date: s.date, type: "income", label: `বিক্রয় — ${s.invoiceNo}`, detail: s.customerName, amount: s.paid });
  });
  purchases.forEach((p) => {
    if (p.paid > 0) raw.push({ id: `purchase-${p.id}`, date: p.date, type: "expense", label: `ক্রয় — ${p.refNo}`, detail: p.note || "", amount: p.paid });
  });

  raw.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let running = opening.cash;
  const rows: CashbookRow[] = [
    { id: "opening", date: opening.date, type: "opening", label: "হিসাব শুরুর ব্যালেন্স", detail: "ওপেনিং ব্যালেন্স", amount: opening.cash, runningBalance: running },
  ];
  raw.forEach((r) => {
    running += r.type === "income" ? r.amount : -r.amount;
    rows.push({ ...r, runningBalance: running });
  });
  return rows;
}

export function cashbookSummary(rows: CashbookRow[]) {
  const income = rows.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
  const expense = rows.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0);
  const balance = rows.length ? rows[rows.length - 1].runningBalance : 0;
  return { income, expense, net: income - expense, balance };
}

export const INCOME_CATEGORIES = ["পণ্য বিক্রয় (বাইরের)", "সার্ভিস চার্জ", "পুরাতন বকেয়া আদায়", "অন্যান্য আয়"];
export const EXPENSE_CATEGORIES = ["দোকান ভাড়া", "কর্মচারী বেতন", "বিদ্যুৎ বিল", "ইন্টারনেট/ফোন বিল", "পরিবহন খরচ", "চা-নাস্তা", "মেরামত ও রক্ষণাবেক্ষণ", "অন্যান্য খরচ"];
