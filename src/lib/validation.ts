import { z } from "zod";
import type { Product } from "@/types";

/**
 * Product form schema. Uniqueness of SKU / barcode is enforced with
 * .superRefine against the current product list, excluding the record
 * being edited (editingId).
 */
export function buildProductSchema(products: Product[], editingId?: string) {
  return z
    .object({
      name: z.string().trim().min(2, "পণ্যের নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
      category: z.string().min(1, "ক্যাটাগরি নির্বাচন করুন"),
      brand: z.string().min(1, "ব্র্যান্ড নির্বাচন করুন"),
      supplier: z.string().min(1, "সাপ্লায়ার নির্বাচন করুন"),
      sku: z.string().trim().min(1, "SKU আবশ্যক"),
      barcode: z.string().trim().min(1, "বারকোড আবশ্যক"),
      model: z.string().optional(),
      purchasePrice: z.coerce.number({ invalid_type_error: "সঠিক ক্রয়মূল্য দিন" }).positive("সঠিক ক্রয়মূল্য দিন"),
      salePrice: z.coerce.number({ invalid_type_error: "সঠিক বিক্রয়মূল্য দিন" }).positive("সঠিক বিক্রয়মূল্য দিন"),
      stock: z.coerce.number({ invalid_type_error: "সঠিক স্টক পরিমাণ দিন" }).int().min(0, "সঠিক স্টক পরিমাণ দিন"),
      minStock: z.coerce.number({ invalid_type_error: "সঠিক সর্বনিম্ন স্টক দিন" }).int().min(0, "সঠিক সর্বনিম্ন স্টক দিন"),
      warranty: z.string().optional(),
      imageUrl: z.string().optional(),
      imageColor: z.string().default("#0F9E93"),
      notes: z.string().optional(),
    })
    .superRefine((v, ctx) => {
      if (products.some((p) => p.sku.toLowerCase() === v.sku.toLowerCase() && p.id !== editingId)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sku"], message: "এই SKU ইতিমধ্যে ব্যবহৃত হয়েছে" });
      }
      if (products.some((p) => p.barcode === v.barcode && p.id !== editingId)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["barcode"], message: "এই বারকোড ইতিমধ্যে ব্যবহৃত হয়েছে" });
      }
      if (v.salePrice < v.purchasePrice) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["salePrice"], message: "বিক্রয়মূল্য ক্রয়মূল্যের চেয়ে কম হওয়া উচিত নয়" });
      }
    });
}

export type ProductFormValues = z.infer<ReturnType<typeof buildProductSchema>>;

export const supplierSchema = z.object({
  name: z.string().trim().min(1, "প্রতিষ্ঠানের নাম আবশ্যক"),
  phone: z.string().trim().min(1, "ফোন নম্বর আবশ্যক"),
  address: z.string().optional(),
  contact: z.string().optional(),
});
export type SupplierFormValues = z.infer<typeof supplierSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "ক্যাটাগরির নাম আবশ্যক"),
  icon: z.string().min(1),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;

export const brandSchema = z.object({
  name: z.string().trim().min(1, "ব্র্যান্ডের নাম আবশ্যক"),
});
export type BrandFormValues = z.infer<typeof brandSchema>;

export const stockFlowSchema = (maxStock: number | null, type: "in" | "out") =>
  z.object({
    productId: z.string().min(1, "একটি পণ্য নির্বাচন করুন"),
    qty: z.coerce
      .number({ invalid_type_error: "সঠিক পরিমাণ দিন" })
      .positive("সঠিক পরিমাণ দিন")
      .refine((v) => type !== "out" || maxStock === null || v <= maxStock, {
        message: `স্টকে মাত্র ${maxStock ?? 0} ইউনিট আছে`,
      }),
    reason: z.string().min(1, "একটি কারণ নির্বাচন করুন"),
    reference: z.string().optional(),
  });

export const adjustmentSchema = z.object({
  productId: z.string().min(1, "একটি পণ্য নির্বাচন করুন"),
  actual: z.coerce.number({ invalid_type_error: "সঠিক পরিমাণ দিন" }).int().min(0, "সঠিক পরিমাণ দিন"),
  reason: z.string().min(1, "একটি কারণ নির্বাচন করুন"),
});
