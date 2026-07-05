import type { Category, Brand, Supplier, Product, StockTx } from "@/types";

export const CATEGORIES: Category[] = [
  { id: "cat-1", name: "ল্যাপটপ", icon: "💻" },
  { id: "cat-2", name: "ডেস্কটপ পিসি", icon: "🖥️" },
  { id: "cat-3", name: "মনিটর", icon: "🖵" },
  { id: "cat-4", name: "প্রিন্টার ও স্ক্যানার", icon: "🖨️" },
  { id: "cat-5", name: "ইউপিএস ও পাওয়ার", icon: "🔋" },
  { id: "cat-6", name: "কম্পিউটার এক্সেসরিজ", icon: "🖱️" },
  { id: "cat-7", name: "নেটওয়ার্কিং", icon: "📶" },
  { id: "cat-8", name: "স্টোরেজ ডিভাইস", icon: "💾" },
  { id: "cat-9", name: "মোবাইল এক্সেসরিজ", icon: "📱" },
  { id: "cat-10", name: "ইলেকট্রিক্যাল পণ্য", icon: "⚡" },
];

export const BRANDS: Brand[] = [
  { id: "br-1", name: "HP" }, { id: "br-2", name: "Dell" }, { id: "br-3", name: "Lenovo" },
  { id: "br-4", name: "ASUS" }, { id: "br-5", name: "Acer" }, { id: "br-6", name: "MSI" },
  { id: "br-7", name: "Samsung" }, { id: "br-8", name: "LG" }, { id: "br-9", name: "APC" },
  { id: "br-10", name: "Walton" }, { id: "br-11", name: "Transcend" }, { id: "br-12", name: "SanDisk" },
  { id: "br-13", name: "Logitech" }, { id: "br-14", name: "A4Tech" }, { id: "br-15", name: "D-Link" },
  { id: "br-16", name: "TP-Link" }, { id: "br-17", name: "Havells" }, { id: "br-18", name: "Orient" },
  { id: "br-19", name: "Philips" }, { id: "br-20", name: "Xiaomi" },
];

export const SUPPLIERS: Supplier[] = [
  { id: "sup-1", name: "স্মার্ট টেকনোলজিস (বিডি) লিমিটেড", phone: "01711-223344", address: "আইডিবি ভবন, আগারগাঁও, ঢাকা", contact: "মোঃ কামরুল হাসান" },
  { id: "sup-2", name: "গ্লোবাল ব্র্যান্ড প্রাইভেট লিমিটেড", phone: "01819-556677", address: "মতিঝিল বাণিজ্যিক এলাকা, ঢাকা", contact: "সাবরিনা আহমেদ" },
  { id: "sup-3", name: "কম্পিউটার সোর্স লিমিটেড", phone: "01911-889900", address: "বিজয় নগর, ঢাকা", contact: "রফিকুল ইসলাম" },
  { id: "sup-4", name: "মাল্টিপ্ল্যান কম্পিউটার সিটি সাপ্লাই", phone: "01611-112233", address: "মাল্টিপ্ল্যান সেন্টার, বসুন্ধরা, ঢাকা", contact: "তানভীর হোসেন" },
  { id: "sup-5", name: "ইলেকট্রো বাজার হোলসেল", phone: "01511-445566", address: "নবাবপুর রোড, ঢাকা", contact: "জাহিদুল করিম" },
  { id: "sup-6", name: "টেক জোন ডিস্ট্রিবিউশন", phone: "01311-667788", address: "জিইসি মোড়, চট্টগ্রাম", contact: "নাসরিন সুলতানা" },
  { id: "sup-7", name: "রিয়াদ ইলেকট্রনিক্স হাউজ", phone: "01411-998877", address: "জিন্দাবাজার, সিলেট", contact: "আব্দুর রহিম" },
];

export const AVATAR_COLORS = ["#0F9E93", "#E08A2C", "#3E6DF0", "#B155D6", "#E14B4B", "#2F9E44", "#D6934A", "#5C6BC0"];

const TEMPLATES: [string, string, string, number, number, string, string][] = [
  ["HP Pavilion 15 Core i5 12th Gen", "cat-1", "br-1", 62500, 71000, "১২ মাস", "Pavilion 15-eg2054TU"],
  ["Dell Vostro 3510 Core i3 11th Gen", "cat-1", "br-2", 47000, 54500, "১২ মাস", "Vostro 3510"],
  ["Lenovo IdeaPad Slim 3 Ryzen 5", "cat-1", "br-3", 55000, 63000, "১২ মাস", "IdeaPad Slim 3 15ABR8"],
  ["ASUS Vivobook 15 Core i7 13th Gen", "cat-1", "br-4", 78000, 89500, "২৪ মাস", "Vivobook X1504VA"],
  ["Acer Aspire 7 Gaming Ryzen 5 RTX2050", "cat-1", "br-5", 82000, 94000, "১২ মাস", "Aspire A715-51G"],
  ["MSI Modern 14 Core i5 Business", "cat-1", "br-6", 68000, 77500, "১২ মাস", "Modern 14 C13M"],
  ["HP EliteDesk 800 G4 Core i5 Tower", "cat-2", "br-1", 32000, 38500, "১২ মাস", "EliteDesk 800 G4"],
  ["Dell OptiPlex 3080 Micro Core i5", "cat-2", "br-2", 35500, 42000, "১২ মাস", "OptiPlex 3080 MFF"],
  ["Walton Assembled Desktop Core i3 12th Gen", "cat-2", "br-10", 28000, 33500, "৬ মাস", "WPB-CI3-12100"],
  ["Lenovo ThinkCentre M70q Tiny PC", "cat-2", "br-3", 41000, 48000, "১২ মাস", "ThinkCentre M70q"],
  ["Samsung 24 inch FHD Monitor", "cat-3", "br-7", 9800, 12500, "৩৬ মাস", "S24R350FHW"],
  ["LG 27 inch IPS FHD Monitor", "cat-3", "br-8", 13500, 16800, "৩৬ মাস", "27MP60G-B"],
  ["ASUS TUF Gaming 24 inch 165Hz", "cat-3", "br-4", 21500, 25900, "৩৬ মাস", "VG249Q3A"],
  ["HP M24fw 24 inch FHD Monitor", "cat-3", "br-1", 10800, 13400, "৩৬ মাস", "M24fw"],
  ["HP LaserJet M1136 MFP Printer", "cat-4", "br-1", 15500, 18900, "১২ মাস", "LaserJet M1136"],
  ["Canon Pixma G2020 Ink Tank Printer", "cat-4", "br-1", 12800, 15600, "১২ মাস", "Pixma G2020"],
  ["Epson L3210 Ink Tank Printer", "cat-4", "br-1", 13200, 16200, "১২ মাস", "L3210"],
  ["APC Back-UPS 650VA", "cat-5", "br-9", 4200, 5400, "২৪ মাস", "BX650U-MS"],
  ["APC Smart-UPS 1500VA", "cat-5", "br-9", 21500, 26500, "২৪ মাস", "SMT1500IC"],
  ["Walton UPS 1000VA Line Interactive", "cat-5", "br-10", 6800, 8600, "১২ মাস", "WUPS-LI1000"],
  ["Logitech MK270 Wireless Combo", "cat-6", "br-13", 1450, 1850, "১২ মাস", "MK270"],
  ["A4Tech Bloody W60 Gaming Mouse", "cat-6", "br-14", 950, 1300, "১২ মাস", "W60 Max"],
  ["Logitech K380 Bluetooth Keyboard", "cat-6", "br-13", 2600, 3300, "১২ মাস", "K380"],
  ["A4Tech FSTYLER Wireless Keyboard Combo", "cat-6", "br-14", 1150, 1500, "১২ মাস", "FG1010S"],
  ["Logitech C270 HD Webcam", "cat-6", "br-13", 2400, 3000, "১২ মাস", "C270"],
  ["TP-Link TL-WR841N Wireless Router", "cat-7", "br-16", 1650, 2100, "২৪ মাস", "TL-WR841N"],
  ["D-Link DIR-806A AC750 Router", "cat-7", "br-15", 2350, 2950, "২৪ মাস", "DIR-806A"],
  ["TP-Link Archer C6 AC1200 Router", "cat-7", "br-16", 3400, 4200, "২৪ মাস", "Archer C6"],
  ["D-Link 8-Port Switch DES-1008C", "cat-7", "br-15", 1150, 1500, "১২ মাস", "DES-1008C"],
  ["Transcend 256GB SATA SSD", "cat-8", "br-11", 2100, 2650, "৩৬ মাস", "SSD230S"],
  ["Transcend 512GB NVMe SSD", "cat-8", "br-11", 3900, 4850, "৩৬ মাস", "MTE220S"],
  ["SanDisk 1TB External HDD", "cat-8", "br-12", 4900, 5900, "৩৬ মাস", "Extreme Portable"],
  ["SanDisk 64GB USB 3.0 Pendrive", "cat-8", "br-12", 480, 650, "৫ বছর", "Ultra Dual Drive"],
  ["Samsung 1TB 970 EVO NVMe SSD", "cat-8", "br-7", 8600, 10200, "৬০ মাস", "970 EVO Plus"],
  ["Xiaomi Mi 20000mAh Power Bank", "cat-9", "br-20", 2200, 2750, "১২ মাস", "PB2050"],
  ["Xiaomi 33W Fast Charger Type-C", "cat-9", "br-20", 950, 1250, "১২ মাস", "MDY-11-EZ"],
  ["Generic Type-C Data Cable 1m", "cat-9", "br-20", 180, 280, "৬ মাস", "USB-C 1M"],
  ["Havells Crompton Ceiling Fan 56 inch", "cat-10", "br-17", 2650, 3400, "২৪ মাস", "Aureole"],
  ["Orient Table Fan 16 inch", "cat-10", "br-18", 1850, 2400, "১২ মাস", "Orient TF16"],
  ["Philips LED Bulb 12W (Pack of 4)", "cat-10", "br-19", 480, 680, "২৪ মাস", "Ess LEDBulb"],
  ["Havells Extension Socket 4-Way", "cat-10", "br-17", 620, 850, "১২ মাস", "Hex4"],
  ["Walton Electric Iron 1200W", "cat-10", "br-10", 1350, 1750, "১২ মাস", "WEI-DL301"],
  ["APC Surge Protector 6-Outlet", "cat-5", "br-9", 1450, 1900, "১২ মাস", "P63"],
  ["HP 15s Core i5 13th Gen Laptop", "cat-1", "br-1", 71000, 81500, "১২ মাস", "15s-fq5330TU"],
  ["Dell Inspiron 15 3520 Core i5", "cat-1", "br-2", 58500, 66900, "১২ মাস", "Inspiron 3520"],
];

export function seedProducts(): Product[] {
  const suppliersCycle = SUPPLIERS.map((s) => s.id);
  const stockSeedArr = [0, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 22, 25, 30];
  return TEMPLATES.map((t, i) => {
    const [name, category, brand, purchasePrice, salePrice, warranty, model] = t;
    const stock = stockSeedArr[i % stockSeedArr.length];
    const minStock = [3, 5, 4, 6, 5, 8][i % 6];
    return {
      id: `p-${1000 + i}`,
      name,
      category,
      brand,
      sku: `SKU-${1000 + i}`,
      barcode: `8801${(100000 + i * 37).toString().padStart(9, "0")}`,
      model,
      purchasePrice,
      salePrice,
      stock,
      minStock,
      supplier: suppliersCycle[i % suppliersCycle.length],
      warranty,
      imageColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
      notes: "",
      createdAt: new Date(Date.now() - (TEMPLATES.length - i) * 86400000 * 1.4).toISOString(),
    };
  });
}

export function seedStockHistory(products: Product[]): StockTx[] {
  const reasons: Record<string, string[]> = {
    in: ["নতুন চালান গ্রহণ", "সাপ্লায়ার রিটার্ন প্রতিস্থাপন", "স্টক পুনঃপূরণ"],
    out: ["বিক্রয়", "শোরুম ডিসপ্লে", "গ্রাহক রিটার্ন প্রক্রিয়া"],
    adjustment: ["ফিজিক্যাল রিকাউন্ট", "ড্যামেজড আইটেম বাদ", "হারানো পণ্য সমন্বয়"],
  };
  const list: StockTx[] = [];
  let idc = 1;
  const sample = products.slice(0, 22);
  sample.forEach((p, i) => {
    const daysAgo = ((sample.length - i) % 14) + 1;
    const type = i % 5 === 0 ? "adjustment" : i % 2 === 0 ? "in" : "out";
    const qty = type === "adjustment" ? [1, 2, -1, -2, 3][i % 5] : 2 + (i % 6);
    const prev = Math.max(0, p.stock - (type === "out" ? -qty : qty));
    list.push({
      id: `tx-${idc++}`,
      date: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      productId: p.id,
      productName: p.name,
      type: type as StockTx["type"],
      qty: Math.abs(qty),
      prevStock: prev,
      newStock: p.stock,
      reason: reasons[type][i % reasons[type].length],
      reference: type === "in" ? `PO-${2400 + i}` : type === "out" ? `INV-${5100 + i}` : `ADJ-${300 + i}`,
      by: ["সজীব রহমান", "মিতু আক্তার", "রাকিব হাসান"][i % 3],
    });
  });
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const DEFAULT_SETTINGS = {
  shopName: "শুভ্র টেলিকম",
  ownerName: "শুভ্রদেব বড়াল",
  phone: "01644485939",
  email: "shuvrotelecom@gmail.com",
  address: "হারতা বাজার, হারতা, উজিরপুর, বরিশাল",
  lowStockDefault: 5,
  invoicePrefix: "ST-INV",
};

/* ---------------------------------------------------------------------------
   ACCOUNTING DEMO DATA — Customers, Sales, Purchases, Ledger, Opening Balance
   ------------------------------------------------------------------------ */
import type { Customer, Sale, Purchase, LedgerEntry, OpeningBalance } from "@/types";

export function seedCustomers(): Customer[] {
  const list: [string, string, string, number][] = [
    ["রহিম উদ্দিন", "01711-100200", "মিরপুর-১০, ঢাকা", 0],
    ["করিম ট্রেডার্স", "01822-300400", "নিউ মার্কেট, ঢাকা", 4500],
    ["সজল হোসেন", "01933-500600", "ধানমন্ডি, ঢাকা", 0],
    ["ফাতেমা এন্টারপ্রাইজ", "01644-700800", "যাত্রাবাড়ী, ঢাকা", 12500],
    ["আশরাফুল আলম", "01555-900100", "মোহাম্মদপুর, ঢাকা", 0],
    ["তানিয়া কম্পিউটার্স", "01766-110220", "ফার্মগেট, ঢাকা", 3200],
  ];
  return list.map((c, i) => ({
    id: `cus-${100 + i}`,
    name: c[0],
    phone: c[1],
    address: c[2],
    openingDue: c[3],
    createdAt: new Date(Date.now() - (30 - i * 3) * 86400000).toISOString(),
  }));
}

export function seedSalesAndLedger(products: Product[], customers: Customer[]) {
  const sales: Sale[] = [];
  const ledger: LedgerEntry[] = [];
  const purchases: Purchase[] = [];
  const sample = products.slice(5, 15);

  sample.forEach((p, i) => {
    const daysAgo = (sample.length - i) % 7;
    const qty = 1 + (i % 2);
    const price = p.salePrice;
    const total = qty * price;
    const discount = i % 3 === 0 ? Math.round(total * 0.02) : 0;
    const grand = total - discount;
    const customer = i % 2 === 0 ? customers[i % customers.length] : undefined;
    const paid = i % 4 === 0 ? Math.round(grand * 0.6) : grand;
    const due = grand - paid;
    const date = new Date(Date.now() - daysAgo * 86400000).toISOString();
    const sale: Sale = {
      id: `sale-${1000 + i}`,
      invoiceNo: `ST-INV-${new Date().getFullYear()}-${String(1000 + i).slice(-4)}`,
      date,
      customerId: customer?.id,
      customerName: customer?.name || "ওয়াক-ইন কাস্টমার",
      customerPhone: customer?.phone,
      items: [{ productId: p.id, name: p.name, qty, price, total }],
      subtotal: total,
      discount,
      total: grand,
      paid,
      due,
      note: "",
    };
    sales.push(sale);
    if (paid > 0) {
      ledger.push({
        id: `ldg-sale-${i}`, date, type: "income", category: "বিক্রয় আয়", amount: paid,
        method: "cash", note: `ইনভয়েস ${sale.invoiceNo}`, refType: "sale", refId: sale.id,
      });
    }
  });

  const expenseSeed: [string, string, number][] = [
    ["দোকান ভাড়া", "জুন মাসের ভাড়া", 15000],
    ["বিদ্যুৎ বিল", "জুন মাসের বিদ্যুৎ বিল", 2200],
    ["কর্মচারী বেতন", "সহকারীর মাসিক বেতন", 12000],
    ["চা-নাস্তা", "দৈনিক নাস্তা খরচ", 250],
    ["পরিবহন খরচ", "পণ্য আনা-নেওয়া", 800],
  ];
  expenseSeed.forEach((e, i) => {
    ledger.push({
      id: `ldg-exp-${i}`,
      date: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
      type: "expense", category: e[0], amount: e[2], method: "cash", note: e[1], refType: "manual",
    });
  });

  return { sales, ledger, purchases };
}

export const DEFAULT_OPENING_BALANCE: OpeningBalance = {
  cash: 25000,
  date: new Date(Date.now() - 10 * 86400000).toISOString(),
};
