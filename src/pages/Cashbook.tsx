import React, { useMemo, useState } from "react";
import { Wallet, Plus, TrendingUp, TrendingDown, PiggyBank, FileSpreadsheet, Pencil, Check } from "lucide-react";
import { EmptyState, FormField, Select, StatCard } from "@/components/ui/Primitives";
import { Modal } from "@/components/ui/Modal";
import { buildCashbook, cashbookSummary, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/accounting";
import { exportRowsToExcel } from "@/lib/excel";
import { cx, fmtDate, fmtMoney, uid } from "@/lib/utils";
import type { LedgerEntry, Sale, Purchase, OpeningBalance, ToastType } from "@/types";

interface CashbookProps {
  ledger: LedgerEntry[];
  addLedgerEntry: (entry: LedgerEntry) => void;
  sales: Sale[];
  purchases: Purchase[];
  openingBalance: OpeningBalance;
  setOpeningBalance: React.Dispatch<React.SetStateAction<OpeningBalance>>;
  addToast: (msg: string, type?: ToastType) => void;
}

export function Cashbook({ ledger, addLedgerEntry, sales, purchases, openingBalance, setOpeningBalance, addToast }: CashbookProps) {
  const [entryOpen, setEntryOpen] = useState(false);
  const [openingOpen, setOpeningOpen] = useState(false);
  const [entryType, setEntryType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [obAmount, setObAmount] = useState(String(openingBalance.cash));
  const [obDate, setObDate] = useState(openingBalance.date.slice(0, 10));

  const rows = useMemo(() => buildCashbook(openingBalance, ledger, sales, purchases), [openingBalance, ledger, sales, purchases]);
  const summary = useMemo(() => cashbookSummary(rows), [rows]);

  const todayRows = rows.filter((r) => r.type !== "opening" && new Date(r.date).toDateString() === new Date().toDateString());
  const todayIncome = todayRows.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
  const todayExpense = todayRows.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0);

  const submitEntry = () => {
    const e: Record<string, string> = {};
    if (!category) e.category = "একটি খাত নির্বাচন করুন";
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = "সঠিক পরিমাণ দিন";
    setErrors(e);
    if (Object.keys(e).length) return;
    addLedgerEntry({
      id: uid("ldg"), date: new Date().toISOString(), type: entryType, category, amount: Number(amount),
      method: "cash", note, refType: "manual",
    });
    addToast(`${entryType === "income" ? "আয়" : "ব্যয়"} এন্ট্রি সফলভাবে যোগ হয়েছে`, "success");
    setEntryOpen(false); setCategory(""); setAmount(""); setNote("");
  };

  const saveOpening = () => {
    if (isNaN(Number(obAmount))) { addToast("সঠিক পরিমাণ দিন", "error"); return; }
    setOpeningBalance({ cash: Number(obAmount), date: new Date(obDate).toISOString() });
    addToast("হিসাব শুরুর ব্যালেন্স সংরক্ষিত হয়েছে — এখান থেকেই এখন হিসাব শুরু হবে", "success");
    setOpeningOpen(false);
  };

  const doExport = () => {
    exportRowsToExcel(
      rows.map((r) => ({ "তারিখ": fmtDate(r.date), "বিবরণ": r.label, "নোট": r.detail, "ধরন": r.type === "income" ? "আয়" : r.type === "expense" ? "ব্যয়" : "ওপেনিং", "পরিমাণ": r.amount, "ব্যালেন্স": r.runningBalance })),
      "ক্যাশবুক", `ক্যাশবুক_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-text">দৈনিক আয়-ব্যয় (ক্যাশবুক)</h1>
          <p className="text-[13px] mt-0.5 text-text-faint">সকল নগদ লেনদেনের হিসাব — বিক্রয়, ক্রয় ও ম্যানুয়াল এন্ট্রি সহ</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOpeningOpen(true)} className="btn-soft"><Pencil size={14} />ওপেনিং ব্যালেন্স</button>
          <button onClick={doExport} className="btn-soft"><FileSpreadsheet size={15} />এক্সপোর্ট</button>
          <button onClick={() => setEntryOpen(true)} className="btn-primary"><Plus size={15} />নতুন এন্ট্রি</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={PiggyBank} label="বর্তমান ব্যালেন্স" value={fmtMoney(summary.balance)} color="var(--accent)" bg="var(--accent-soft)" />
        <StatCard icon={TrendingUp} label="আজকের আয়" value={fmtMoney(todayIncome)} color="var(--blue)" bg="var(--blue-soft)" />
        <StatCard icon={TrendingDown} label="আজকের ব্যয়" value={fmtMoney(todayExpense)} color="var(--amber)" bg="var(--amber-soft)" />
        <StatCard icon={Wallet} label="সর্বমোট আয় − ব্যয়" value={fmtMoney(summary.net)} color="#2F9E44" bg="rgba(47,158,68,0.12)" />
      </div>

      <div className="card p-3 flex items-center gap-2 border-0 bg-accent-soft">
        <PiggyBank size={16} className="text-accent flex-shrink-0" />
        <div className="text-[12px] text-accent-ink">
          হিসাব শুরুর ব্যালেন্সঃ <b>{fmtMoney(openingBalance.cash)}</b> ({fmtDate(openingBalance.date)} তারিখ থেকে) — আপনি যেকোনো সময় "ওপেনিং ব্যালেন্স" বাটন থেকে এটি পরিবর্তন করে নতুন জায়গা থেকে হিসাব শুরু করতে পারবেন।
        </div>
      </div>

      <div className="card overflow-hidden">
        {rows.length <= 1 ? (
          <EmptyState icon={Wallet} title="কোনো লেনদেন নেই" subtitle="নতুন আয়/ব্যয় এন্ট্রি যোগ করুন" action={<button onClick={() => setEntryOpen(true)} className="btn-primary"><Plus size={15} />নতুন এন্ট্রি</button>} />
        ) : (
          <div className="overflow-x-auto scrollbar max-h-[520px]">
            <table className="data-table">
              <thead><tr><th>তারিখ</th><th>বিবরণ</th><th>নোট</th><th className="text-right">আয়</th><th className="text-right">ব্যয়</th><th className="text-right">ব্যালেন্স</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="num text-[12px]">{fmtDate(r.date)}</td>
                    <td className="font-semibold text-text">{r.label}</td>
                    <td className="text-[12px] text-text-faint">{r.detail}</td>
                    <td className="num text-right text-accent">{r.type === "income" ? fmtMoney(r.amount) : "—"}</td>
                    <td className="num text-right text-danger">{r.type === "expense" ? fmtMoney(r.amount) : "—"}</td>
                    <td className="num text-right font-bold text-text">{fmtMoney(r.runningBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual income/expense entry */}
      <Modal
        open={entryOpen} onClose={() => setEntryOpen(false)} title="নতুন আয়/ব্যয় এন্ট্রি" icon={Wallet} width={420}
        footer={<><button onClick={() => setEntryOpen(false)} className="btn-ghost">বাতিল</button><button onClick={submitEntry} className="btn-primary"><Check size={15} />সংরক্ষণ করুন</button></>}
      >
        <div className="space-y-4">
          <div className="flex gap-2 p-1 rounded-xl bg-bg-soft">
            <button onClick={() => { setEntryType("income"); setCategory(""); }} className="flex-1 justify-center inline-flex items-center gap-2 rounded-xl py-2 text-sm font-semibold" style={entryType === "income" ? { background: "var(--accent)", color: "#fff" } : { color: "var(--text-dim)" }}>আয়</button>
            <button onClick={() => { setEntryType("expense"); setCategory(""); }} className="flex-1 justify-center inline-flex items-center gap-2 rounded-xl py-2 text-sm font-semibold" style={entryType === "expense" ? { background: "var(--amber)", color: "#fff" } : { color: "var(--text-dim)" }}>ব্যয়</button>
          </div>
          <FormField label="খাত" required error={errors.category}>
            <Select value={category} onChange={setCategory} options={(entryType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => ({ value: c, label: c }))} error={errors.category} />
          </FormField>
          <FormField label="পরিমাণ (৳)" required error={errors.amount}>
            <input type="number" className={cx("input", errors.amount && "input-err")} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </FormField>
          <FormField label="নোট (ঐচ্ছিক)">
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
          </FormField>
        </div>
      </Modal>

      {/* Opening balance editor */}
      <Modal
        open={openingOpen} onClose={() => setOpeningOpen(false)} title="হিসাব শুরুর ব্যালেন্স" subtitle="পুরানো খাতা থেকে সিস্টেমে হিসাব স্থানান্তর করুন" icon={PiggyBank} width={380}
        footer={<><button onClick={() => setOpeningOpen(false)} className="btn-ghost">বাতিল</button><button onClick={saveOpening} className="btn-primary"><Check size={15} />সংরক্ষণ করুন</button></>}
      >
        <div className="space-y-4">
          <FormField label="ওপেনিং ক্যাশ ব্যালেন্স (৳)">
            <input type="number" className="input" value={obAmount} onChange={(e) => setObAmount(e.target.value)} />
          </FormField>
          <FormField label="তারিখ">
            <input type="date" className="input" value={obDate} onChange={(e) => setObDate(e.target.value)} />
          </FormField>
          <p className="text-[11.5px] text-text-faint">এই তারিখ থেকে ক্যাশবুকের হিসাব শুরু হবে। পুরানো খাতায় যা হাতে আছে তা এখানে লিখে দিন — এরপর থেকে সিস্টেমেই সম্পূর্ণ হিসাব রাখা যাবে।</p>
        </div>
      </Modal>
    </div>
  );
}
