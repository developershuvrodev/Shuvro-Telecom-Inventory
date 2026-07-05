import { fmtDate, fmtMoney, fmtNum } from "./utils";
import type { CustomerLedgerRow } from "./accounting";
import type { Sale, Customer, Product } from "@/types";

/**
 * Opens a small dedicated window containing only the printable receipt/ledger
 * markup and triggers the native print dialog on it. This sidesteps the app's
 * own layout entirely (no dependence on CSS "display/visibility" tricks
 * inside the live app, which get tangled up with modals, animation wrappers,
 * fixed positioning, etc.) — the same reliable pattern used by most POS
 * systems for printing cash memos / receipts.
 */
export function openPrintWindow(title: string, bodyHtml: string) {
  const win = window.open("", "_blank", "width=420,height=640");
  if (!win) {
    alert("পপ-আপ ব্লক করা হয়েছে। ব্রাউজারে এই সাইটের জন্য পপ-আপ অনুমতি দিয়ে আবার চেষ্টা করুন।");
    return;
  }
  win.document.open();
  win.document.write(`<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'Nirmala UI', sans-serif;
    color: #111; margin: 0; padding: 22px; max-width: 420px; margin: 0 auto;
  }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  th, td { padding: 5px 3px; text-align: left; vertical-align: top; }
  .right { text-align: right; }
  .center { text-align: center; }
  .bold { font-weight: 700; }
  .muted { color: #555; font-size: 11px; }
  .divider { border-top: 1px dashed #999; margin: 10px 0; }
  .solid-divider { border-top: 1px solid #ccc; margin: 6px 0; }
  h1 { font-size: 17px; margin: 0 0 2px; }
  .row { display: flex; justify-content: space-between; font-size: 12.5px; padding: 2px 0; }
  .total-row { font-size: 14px; font-weight: 700; }
  .barcode span { display: inline-block; background: #000; }
  @media print {
    body { padding: 8px; }
  }
</style>
</head>
<body>
${bodyHtml}
<script>
  window.onload = function () {
    setTimeout(function () { window.focus(); window.print(); }, 200);
  };
<\/script>
</body>
</html>`);
  win.document.close();
}

function escapeHtml(s: string): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

/* ---------------- Cash Memo ---------------- */
export function buildCashMemoHtml(sale: Sale, shopName: string, shopAddress: string, shopPhone: string): string {
  const rows = sale.items
    .map(
      (it) => `<tr>
        <td>${escapeHtml(it.name)}</td>
        <td class="right">${fmtNum(it.qty)}</td>
        <td class="right">${fmtMoney(it.price)}</td>
        <td class="right">${fmtMoney(it.total)}</td>
      </tr>`
    )
    .join("");

  return `
    <div class="center">
      <h1>${escapeHtml(shopName)}</h1>
      <div class="muted">${escapeHtml(shopAddress)}</div>
      <div class="muted">ফোনঃ ${escapeHtml(shopPhone)}</div>
    </div>
    <div class="solid-divider"></div>
    <div class="row"><span>ইনভয়েসঃ <b>${escapeHtml(sale.invoiceNo)}</b></span><span>${fmtDate(sale.date)}</span></div>
    <div class="row"><span>কাস্টমারঃ <b>${escapeHtml(sale.customerName)}</b></span><span>${sale.customerPhone ? escapeHtml(sale.customerPhone) : ""}</span></div>
    <div class="solid-divider"></div>
    <table>
      <thead><tr class="bold"><td>পণ্য</td><td class="right">পরিমাণ</td><td class="right">দাম</td><td class="right">মোট</td></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="solid-divider"></div>
    <div class="row"><span>সাবটোটাল</span><span>${fmtMoney(sale.subtotal)}</span></div>
    <div class="row"><span>ডিসকাউন্ট</span><span>-${fmtMoney(sale.discount)}</span></div>
    <div class="row total-row"><span>সর্বমোট</span><span>${fmtMoney(sale.total)}</span></div>
    <div class="row"><span>পরিশোধিত</span><span>${fmtMoney(sale.paid)}</span></div>
    <div class="row bold"><span>বাকি</span><span>${fmtMoney(sale.due)}</span></div>
    <div class="divider"></div>
    <div class="center muted">আমাদের সাথে থাকার জন্য ধন্যবাদ! আবার আসবেন।</div>
  `;
}

/* ---------------- Customer ledger (পুরানো/বকেয়া হিসাব) ---------------- */
export function buildCustomerLedgerHtml(
  customer: Customer,
  rows: CustomerLedgerRow[],
  due: number,
  shopName: string,
  shopAddress: string,
  shopPhone: string
): string {
  const body = rows
    .map(
      (r) => `<tr>
        <td>${fmtDate(r.date)}</td>
        <td><div class="bold">${escapeHtml(r.label)}</div><div class="muted">${escapeHtml(r.detail)}</div></td>
        <td class="right">${r.debit > 0 ? fmtMoney(r.debit) : "—"}</td>
        <td class="right">${r.credit > 0 ? fmtMoney(r.credit) : "—"}</td>
        <td class="right bold">${fmtMoney(r.runningBalance)}</td>
      </tr>`
    )
    .join("");

  return `
    <div class="center">
      <h1>${escapeHtml(shopName)}</h1>
      <div class="muted">${escapeHtml(shopAddress)} · ফোনঃ ${escapeHtml(shopPhone)}</div>
    </div>
    <div class="solid-divider"></div>
    <div class="row"><span class="bold">কাস্টমার হিসাব</span><span>${fmtDate(new Date())}</span></div>
    <div class="row"><span>${escapeHtml(customer.name)}</span><span>${escapeHtml(customer.phone)}</span></div>
    ${customer.address ? `<div class="muted">${escapeHtml(customer.address)}</div>` : ""}
    <div class="solid-divider"></div>
    <div class="row total-row"><span>বর্তমান মোট বকেয়া</span><span>${fmtMoney(due)}</span></div>
    <div class="solid-divider"></div>
    <table>
      <thead><tr class="bold"><td>তারিখ</td><td>বিবরণ</td><td class="right">দেনা</td><td class="right">পাওনা</td><td class="right">ব্যালেন্স</td></tr></thead>
      <tbody>${body}</tbody>
    </table>
    <div class="divider"></div>
    <div class="center muted">এই হিসাব ${escapeHtml(shopName)} থেকে স্বয়ংক্রিয়ভাবে তৈরি।</div>
  `;
}

/* ---------------- Barcode label ---------------- */
export function buildBarcodeLabelHtml(product: Product, shopName: string): string {
  const bars = (product.barcode || "0")
    .split("")
    .map((c) => 1 + (c.charCodeAt(0) % 4))
    .map((w) => `<span style="width:${w * 2}px;height:50px;margin-right:2px;"></span>`)
    .join("");

  return `
    <div class="center">
      <div class="bold">${escapeHtml(shopName)}</div>
      <div class="muted">${escapeHtml(product.name)}</div>
      <div class="barcode" style="margin:10px 0;">${bars}</div>
      <div class="bold" style="letter-spacing:2px;">${escapeHtml(product.barcode)}</div>
      <div class="row" style="justify-content:center; gap:14px;">
        <span>SKU: ${escapeHtml(product.sku)}</span>
        <span>${fmtMoney(product.salePrice)}</span>
      </div>
    </div>
  `;
}
