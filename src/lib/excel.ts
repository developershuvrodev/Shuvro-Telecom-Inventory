import * as XLSX from "xlsx";
import type { Product, Category, Brand, Supplier, ImportSummary } from "@/types";
import { uid, stockStatus } from "./utils";
import { AVATAR_COLORS } from "@/data/seed";

export const EXCEL_HEADERS = [
  "পণ্যের নাম", "ক্যাটাগরি", "ব্র্যান্ড", "SKU", "বারকোড", "মডেল",
  "ক্রয়মূল্য", "বিক্রয়মূল্য", "স্টক", "সর্বনিম্ন স্টক", "সাপ্লায়ার", "ওয়ারেন্টি", "নোট",
];

export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();
  const wsData = [
    EXCEL_HEADERS,
    ["HP Pavilion 15 Core i5 12th Gen", "ল্যাপটপ", "HP", "SKU-2001", "8801100370037", "Pavilion 15-eg2054TU", 62500, 71000, 10, 5, "স্মার্ট টেকনোলজিস (বিডি) লিমিটেড", "১২ মাস", "উদাহরণ সারি — মুছে ফেলুন"],
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = EXCEL_HEADERS.map(() => ({ wch: 20 }));
  XLSX.utils.book_append_sheet(wb, ws, "পণ্য তালিকা");

  const guide = [
    ["নির্দেশনা — শুভ্র টেলিকম বাল্ক ইম্পোর্ট টেমপ্লেট"],
    [""],
    ["১. 'পণ্য তালিকা' শীটে আপনার সকল পণ্যের তথ্য লিখুন।"],
    ["২. SKU অথবা বারকোড মিলে গেলে বিদ্যমান পণ্য আপডেট হবে, নতুন হলে নতুন পণ্য তৈরি হবে।"],
    ["৩. ক্যাটাগরি, ব্র্যান্ড ও সাপ্লায়ার নাম না থাকলে সিস্টেম স্বয়ংক্রিয়ভাবে তৈরি করবে।"],
    ["৪. ক্রয়মূল্য, বিক্রয়মূল্য, স্টক ও সর্বনিম্ন স্টক অবশ্যই সংখ্যা হতে হবে।"],
    ["৫. উদাহরণ সারিটি মুছে ফেলে আপনার তথ্য দিয়ে প্রতিস্থাপন করুন।"],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(guide);
  ws2["!cols"] = [{ wch: 70 }];
  XLSX.utils.book_append_sheet(wb, ws2, "নির্দেশনা");
  XLSX.writeFile(wb, "শুভ্র_টেলিকম_ইম্পোর্ট_টেমপ্লেট.xlsx");
}

export function exportProductsToExcel(
  products: Product[],
  categories: Category[],
  brands: Brand[],
  suppliers: Supplier[],
  filename?: string
) {
  const catName = (id: string) => categories.find((c) => c.id === id)?.name || id;
  const brandName = (id: string) => brands.find((b) => b.id === id)?.name || id;
  const supName = (id: string) => suppliers.find((s) => s.id === id)?.name || id;
  const rows = products.map((p) => ({
    "পণ্যের নাম": p.name, "ক্যাটাগরি": catName(p.category), "ব্র্যান্ড": brandName(p.brand),
    SKU: p.sku, "বারকোড": p.barcode, "মডেল": p.model || "", "ক্রয়মূল্য": p.purchasePrice,
    "বিক্রয়মূল্য": p.salePrice, "স্টক": p.stock, "সর্বনিম্ন স্টক": p.minStock,
    "সাপ্লায়ার": supName(p.supplier), "ওয়ারেন্টি": p.warranty || "", "নোট": p.notes || "",
    "স্টক মূল্য": p.stock * p.purchasePrice, "অবস্থা": stockStatus(p).label,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = Object.keys(rows[0] || {}).map(() => ({ wch: 18 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "পণ্য তালিকা");
  XLSX.writeFile(wb, filename || `শুভ্র_টেলিকম_পণ্য_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportRowsToExcel(rows: Record<string, unknown>[], sheetName: string, filename: string) {
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = Object.keys(rows[0] || {}).map(() => ({ wch: 18 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

export function parseImportFile(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" }) as Record<string, unknown>[];
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function getVal(row: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    for (const rk of Object.keys(row)) {
      if (rk.trim().toLowerCase() === k.toLowerCase()) return String(row[rk] ?? "");
    }
  }
  return "";
}

interface ImportCtx {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
}

export function processImportRows(rows: Record<string, unknown>[], ctx: ImportCtx): ImportSummary {
  let newCategories = [...ctx.categories];
  let newBrands = [...ctx.brands];
  let newSuppliers = [...ctx.suppliers];
  let workingProducts = [...ctx.products];
  const errors: ImportSummary["errors"] = [];
  let created = 0;
  let updated = 0;

  function findOrCreate<T extends { id: string; name: string }>(list: T[], name: string, prefix: string): { id: string; list: T[] } | null {
    if (!name || String(name).trim() === "") return null;
    const trimmed = String(name).trim();
    const found = list.find((x) => x.name.toLowerCase() === trimmed.toLowerCase());
    if (found) return { id: found.id, list };
    const item = { id: uid(prefix), name: trimmed } as T;
    list.push(item);
    return { id: item.id, list };
  }

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const name = getVal(row, "পণ্যের নাম", "name").trim();
    if (!name) {
      errors.push({ row: rowNum, message: "পণ্যের নাম খালি রাখা যাবে না" });
      return;
    }

    const catRaw = getVal(row, "ক্যাটাগরি", "category");
    const brandRaw = getVal(row, "ব্র্যান্ড", "brand");
    const supRaw = getVal(row, "সাপ্লায়ার", "supplier");
    const sku = getVal(row, "SKU", "sku").trim();
    const barcode = getVal(row, "বারকোড", "barcode").trim();
    const model = getVal(row, "মডেল", "model").trim();
    const purchasePrice = Number(getVal(row, "ক্রয়মূল্য", "purchaseprice"));
    const salePrice = Number(getVal(row, "বিক্রয়মূল্য", "saleprice"));
    const stock = Number(getVal(row, "স্টক", "stock"));
    const minStock = Number(getVal(row, "সর্বনিম্ন স্টক", "minstock"));
    const warranty = getVal(row, "ওয়ারেন্টি", "warranty");
    const notes = getVal(row, "নোট", "notes");

    if (isNaN(purchasePrice) || purchasePrice <= 0) { errors.push({ row: rowNum, message: `"${name}" — ক্রয়মূল্য সঠিক নয়` }); return; }
    if (isNaN(salePrice) || salePrice <= 0) { errors.push({ row: rowNum, message: `"${name}" — বিক্রয়মূল্য সঠিক নয়` }); return; }
    if (isNaN(stock) || stock < 0) { errors.push({ row: rowNum, message: `"${name}" — স্টক পরিমাণ সঠিক নয়` }); return; }

    const catR = findOrCreate(newCategories, catRaw, "cat"); if (catR) newCategories = catR.list;
    const brR = findOrCreate(newBrands, brandRaw, "br"); if (brR) newBrands = brR.list;
    const supR = findOrCreate(newSuppliers, supRaw, "sup"); if (supR) newSuppliers = supR.list;

    let existing = sku ? workingProducts.find((p) => p.sku.toLowerCase() === sku.toLowerCase()) : undefined;
    if (!existing && barcode) existing = workingProducts.find((p) => p.barcode === barcode);

    const payload: Partial<Product> = {
      name,
      category: catR ? catR.id : existing?.category || newCategories[0]?.id,
      brand: brR ? brR.id : existing?.brand || newBrands[0]?.id,
      supplier: supR ? supR.id : existing?.supplier || newSuppliers[0]?.id,
      sku: sku || existing?.sku || `SKU-${9000 + idx}`,
      barcode: barcode || existing?.barcode || `880${Date.now().toString().slice(-10)}${idx}`,
      model, purchasePrice, salePrice, stock,
      minStock: isNaN(minStock) ? existing?.minStock ?? 5 : minStock,
      warranty, notes,
    };

    if (existing) {
      workingProducts = workingProducts.map((p) => (p.id === existing!.id ? { ...p, ...payload } : p));
      updated++;
    } else {
      workingProducts.push({
        id: uid("p"),
        imageColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
        createdAt: new Date().toISOString(),
        ...payload,
      } as Product);
      created++;
    }
  });

  return {
    products: workingProducts, categories: newCategories, brands: newBrands, suppliers: newSuppliers,
    created, updated, errors, total: rows.length,
  };
}
