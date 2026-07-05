import type { AppData } from "@/types";

const STORAGE_KEY = "shuvro-telecom-inventory-v1";
export const DATA_VERSION = 1;

export function saveAppData(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
  } catch (err) {
    console.error("localStorage সংরক্ষণ ব্যর্থ হয়েছে:", err);
  }
}

export function loadAppData(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (err) {
    console.error("localStorage পড়া ব্যর্থ হয়েছে:", err);
    return null;
  }
}

export function clearAppData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export function downloadBackup(data: AppData) {
  const payload = { ...data, savedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `শুভ্র_টেলিকম_ব্যাকআপ_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function parseBackupFile(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(String(e.target?.result)) as AppData;
        if (!parsed.products || !parsed.settings) {
          reject(new Error("এটি একটি বৈধ শুভ্র টেলিকম ব্যাকআপ ফাইল নয়।"));
          return;
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
