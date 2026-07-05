import React, { useEffect, useRef, useState } from "react";
import { Building2, Settings as SettingsIcon, Sun, Moon, RefreshCw, KeyRound, Info, Database, Download, Upload, CheckCircle2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/Modal";
import { FormField, Switch } from "@/components/ui/Primitives";
import { fmtDateTime } from "@/lib/utils";
import type { ShopSettings, ToastType } from "@/types";

interface SettingsProps {
  settings: ShopSettings;
  setSettings: React.Dispatch<React.SetStateAction<ShopSettings>>;
  dark: boolean;
  onToggleDark: () => void;
  addToast: (msg: string, type?: ToastType, opts?: { duration?: number }) => void;
  onResetDemo: () => void;
  onDownloadBackup: () => void;
  onRestoreBackup: (file: File) => void;
  lastSavedAt: string | null;
}

export function Settings({ settings, setSettings, dark, onToggleDark, addToast, onResetDemo, onDownloadBackup, onRestoreBackup, lastSavedAt }: SettingsProps) {
  const [form, setForm] = useState<ShopSettings>(settings);
  const [confirmReset, setConfirmReset] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setForm(settings), [settings]);

  const update = <K extends keyof ShopSettings>(k: K, v: ShopSettings[K]) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSettings(next);
      addToast("সেটিংস স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়েছে", "success", { duration: 1800 });
    }, 700);
  };

  const shortcuts = [
    { keys: "/", desc: "সার্চ বক্সে ফোকাস করুন" },
    { keys: "N", desc: "নতুন পণ্য যোগ করুন (পণ্য পাতায়)" },
    { keys: "Esc", desc: "মোডাল বা ডায়ালগ বন্ধ করুন" },
    { keys: "G তারপর D", desc: "ড্যাশবোর্ডে যান" },
    { keys: "G তারপর P", desc: "পণ্য তালিকায় যান" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-[20px] font-extrabold text-text">সেটিংস</h1>
        <p className="text-[13px] mt-0.5 text-text-faint">দোকানের তথ্য ও সিস্টেম পছন্দ পরিচালনা করুন — পরিবর্তন স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-4 lg:col-span-2 space-y-3.5">
          <h3 className="font-bold text-[14.5px] flex items-center gap-2 text-text"><Building2 size={16} />দোকানের তথ্য</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <FormField label="দোকানের নাম"><input className="input" value={form.shopName} onChange={(e) => update("shopName", e.target.value)} /></FormField>
            <FormField label="মালিকের নাম"><input className="input" value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} /></FormField>
            <FormField label="ফোন নম্বর"><input className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} /></FormField>
            <FormField label="ইমেইল"><input className="input" value={form.email} onChange={(e) => update("email", e.target.value)} /></FormField>
          </div>
          <FormField label="ঠিকানা"><input className="input" value={form.address} onChange={(e) => update("address", e.target.value)} /></FormField>
          <div className="grid sm:grid-cols-2 gap-3">
            <FormField label="ডিফল্ট সর্বনিম্ন স্টক লিমিট"><input type="number" className="input" value={form.lowStockDefault} onChange={(e) => update("lowStockDefault", Number(e.target.value))} /></FormField>
            <FormField label="ইনভয়েস প্রিফিক্স"><input className="input" value={form.invoicePrefix} onChange={(e) => update("invoicePrefix", e.target.value)} /></FormField>
          </div>

          <h3 className="font-bold text-[14.5px] flex items-center gap-2 pt-2 text-text"><SettingsIcon size={16} />সিস্টেম</h3>
          <div className="flex items-center justify-between p-3 rounded-xl bg-bg-soft">
            <div className="flex items-center gap-2.5">
              {dark ? <Moon size={17} className="text-text-dim" /> : <Sun size={17} className="text-text-dim" />}
              <div>
                <div className="text-[13px] font-semibold text-text">ডার্ক মোড</div>
                <div className="text-[11.5px] text-text-faint">চোখের আরামের জন্য গাঢ় থিম চালু করুন</div>
              </div>
            </div>
            <Switch on={dark} onChange={onToggleDark} />
          </div>

          <h3 className="font-bold text-[14.5px] flex items-center gap-2 pt-2 text-text"><Database size={16} />ব্যাকআপ ও পুনরুদ্ধার</h3>
          <div className="p-3 rounded-xl bg-bg-soft space-y-2.5">
            <div className="flex items-center gap-2 text-[12px] text-text-dim">
              <CheckCircle2 size={14} className="text-accent flex-shrink-0" />
              সব তথ্য এই ব্রাউজারে স্বয়ংক্রিয়ভাবে সংরক্ষিত হচ্ছে{lastSavedAt ? ` — সর্বশেষ সংরক্ষণঃ ${fmtDateTime(lastSavedAt)}` : ""}
            </div>
            <p className="text-[11.5px] text-text-faint">অন্য কম্পিউটারে স্থানান্তর করতে বা নিরাপদ কপি রাখতে নিয়মিত ব্যাকআপ ফাইল ডাউনলোড করুন। প্রয়োজনে সেই ফাইল থেকে যেকোনো সময় সম্পূর্ণ ডেটা পুনরুদ্ধার করা যাবে।</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={onDownloadBackup} className="btn-soft py-1.5"><Download size={13} />ব্যাকআপ ডাউনলোড করুন</button>
              <label className="btn-ghost py-1.5 cursor-pointer">
                <Upload size={13} />ব্যাকআপ পুনরুদ্ধার করুন
                <input type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onRestoreBackup(f); e.target.value = ""; }} />
              </label>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-danger-soft">
            <div className="text-[13px] font-bold mb-1 text-danger">ডেমো ডেটা রিসেট করুন</div>
            <div className="text-[11.5px] mb-2.5 text-text-dim">সকল পণ্য, ক্যাটাগরি ও লেনদেনের তথ্য মুছে প্রাথমিক ডেমো ডেটা ফিরিয়ে আনা হবে। রিসেট করার আগে ব্যাকআপ ডাউনলোড করে নেওয়ার পরামর্শ দেওয়া হচ্ছে।</div>
            <button onClick={() => setConfirmReset(true)} className="btn-danger py-1.5"><RefreshCw size={13} />রিসেট করুন</button>
          </div>
        </div>

        <div className="card p-4 space-y-1">
          <h3 className="font-bold text-[14.5px] flex items-center gap-2 mb-2 text-text"><KeyRound size={16} />কীবোর্ড শর্টকাট</h3>
          {shortcuts.map((s) => (
            <div key={s.keys} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-[12.5px] text-text-dim">{s.desc}</span>
              <kbd className="num text-[11px] font-bold px-2 py-1 rounded-md bg-bg-soft text-text">{s.keys}</kbd>
            </div>
          ))}
          <div className="pt-3 flex items-center gap-2 text-[11.5px] text-text-faint">
            <Info size={13} className="flex-shrink-0" />
            <span>ফর্ম ভ্যালিডেশন React Hook Form + Zod দিয়ে তৈরি, অ্যানিমেশন Framer Motion দিয়ে, এবং এক্সেল ইম্পোর্ট/এক্সপোর্ট SheetJS (xlsx) দিয়ে করা হয়েছে।</span>
          </div>
        </div>
      </div>

      <ConfirmDialog open={confirmReset} onClose={() => setConfirmReset(false)} onConfirm={onResetDemo} title="সব ডেটা রিসেট করবেন?" message="বর্তমান সকল পরিবর্তন হারিয়ে যাবে এবং প্রাথমিক ডেমো ডেটা ফিরিয়ে আনা হবে।" confirmLabel="রিসেট নিশ্চিত করুন" />
    </div>
  );
}
