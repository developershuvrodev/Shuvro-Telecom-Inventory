import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, Save } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FormField, Select } from "@/components/ui/Primitives";
import { cx, uid } from "@/lib/utils";
import { buildProductSchema, type ProductFormValues } from "@/lib/validation";
import { AVATAR_COLORS } from "@/data/seed";
import type { Product, Category, Brand, Supplier } from "@/types";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (p: Product) => void;
  editing: Product | null;
  products: Product[];
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
}

const emptyForm: ProductFormValues = {
  name: "", category: "", brand: "", sku: "", barcode: "", model: "",
  purchasePrice: 0, salePrice: 0, stock: 0, minStock: 5, supplier: "",
  warranty: "", imageUrl: "", imageColor: AVATAR_COLORS[0], notes: "",
};

export function ProductFormModal({ open, onClose, onSave, editing, products, categories, brands, suppliers }: ProductFormModalProps) {
  const schema = buildProductSchema(products, editing?.id);
  const {
    register, handleSubmit, control, reset, watch, formState: { errors },
  } = useForm<ProductFormValues>({ resolver: zodResolver(schema), defaultValues: emptyForm, mode: "onBlur" });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({ ...emptyForm, ...editing } as ProductFormValues);
    } else {
      const nextNum = 1000 + products.length;
      reset({ ...emptyForm, sku: `SKU-${nextNum}`, barcode: `8801${(100000 + nextNum * 37).toString().padStart(9, "0")}` });
    }
  }, [open, editing]); // eslint-disable-line react-hooks/exhaustive-deps

  const imageColor = watch("imageColor");
  const category = watch("category");

  const submit = (values: ProductFormValues) => {
    const product: Product = {
      id: editing ? editing.id : uid("p"),
      name: values.name,
      category: values.category,
      brand: values.brand,
      sku: values.sku,
      barcode: values.barcode,
      model: values.model,
      purchasePrice: Number(values.purchasePrice),
      salePrice: Number(values.salePrice),
      stock: Number(values.stock),
      minStock: Number(values.minStock),
      supplier: values.supplier,
      warranty: values.warranty,
      imageUrl: values.imageUrl,
      imageColor: values.imageColor,
      notes: values.notes,
      createdAt: editing ? editing.createdAt : new Date().toISOString(),
    };
    onSave(product);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "পণ্য সম্পাদনা করুন" : "নতুন পণ্য যোগ করুন"}
      subtitle={editing ? editing.sku : "পণ্যের সম্পূর্ণ তথ্য দিন"}
      icon={Package}
      width={640}
      footer={
        <>
          <button onClick={onClose} className="btn-ghost">বাতিল</button>
          <button onClick={handleSubmit(submit)} className="btn-primary"><Save size={15} />{editing ? "পরিবর্তন সংরক্ষণ" : "পণ্য যোগ করুন"}</button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(submit)}>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl flex items-center justify-center flex-shrink-0" style={{ width: 56, height: 56, background: imageColor + "22", fontSize: 26 }}>
            {categories.find((c) => c.id === category)?.icon || "📦"}
          </div>
          <div className="flex-1">
            <div className="label mb-1.5">অ্যাভাটার রং</div>
            <Controller
              name="imageColor"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => field.onChange(c)}
                      className="w-6 h-6 rounded-full flex-shrink-0"
                      style={{ background: c, outline: field.value === c ? `2px solid ${c}` : "none", outlineOffset: 2 }}
                    />
                  ))}
                </div>
              )}
            />
          </div>
        </div>

        <FormField label="পণ্যের নাম" required error={errors.name?.message}>
          <input className={cx("input", errors.name && "input-err")} {...register("name")} placeholder="যেমনঃ HP Pavilion 15 Core i5" />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="ক্যাটাগরি" required error={errors.category?.message}>
            <Controller name="category" control={control} render={({ field }) => (
              <Select value={field.value} onChange={field.onChange} options={categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }))} error={errors.category?.message} />
            )} />
          </FormField>
          <FormField label="ব্র্যান্ড" required error={errors.brand?.message}>
            <Controller name="brand" control={control} render={({ field }) => (
              <Select value={field.value} onChange={field.onChange} options={brands.map((b) => ({ value: b.id, label: b.name }))} error={errors.brand?.message} />
            )} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="SKU" required error={errors.sku?.message}>
            <input className={cx("input", errors.sku && "input-err")} {...register("sku")} />
          </FormField>
          <FormField label="বারকোড" required error={errors.barcode?.message}>
            <input className={cx("input", errors.barcode && "input-err")} {...register("barcode")} />
          </FormField>
        </div>

        <FormField label="মডেল নম্বর">
          <input className="input" {...register("model")} placeholder="যেমনঃ Pavilion 15-eg2054TU" />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="ক্রয়মূল্য (৳)" required error={errors.purchasePrice?.message}>
            <input type="number" step="0.01" className={cx("input", errors.purchasePrice && "input-err")} {...register("purchasePrice")} />
          </FormField>
          <FormField label="বিক্রয়মূল্য (৳)" required error={errors.salePrice?.message}>
            <input type="number" step="0.01" className={cx("input", errors.salePrice && "input-err")} {...register("salePrice")} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="বর্তমান স্টক" required error={errors.stock?.message}>
            <input type="number" className={cx("input", errors.stock && "input-err")} {...register("stock")} />
          </FormField>
          <FormField label="সর্বনিম্ন স্টক (এলার্ট লিমিট)" required error={errors.minStock?.message}>
            <input type="number" className={cx("input", errors.minStock && "input-err")} {...register("minStock")} />
          </FormField>
        </div>

        <FormField label="সাপ্লায়ার" required error={errors.supplier?.message}>
          <Controller name="supplier" control={control} render={({ field }) => (
            <Select value={field.value} onChange={field.onChange} options={suppliers.map((s) => ({ value: s.id, label: s.name }))} error={errors.supplier?.message} />
          )} />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="ওয়ারেন্টি">
            <input className="input" {...register("warranty")} placeholder="যেমনঃ ১২ মাস" />
          </FormField>
          <FormField label="ছবির URL (ঐচ্ছিক)">
            <input className="input" {...register("imageUrl")} placeholder="https://…" />
          </FormField>
        </div>

        <FormField label="নোট">
          <textarea className="input" rows={2} {...register("notes")} placeholder="অতিরিক্ত তথ্য…" />
        </FormField>
      </form>
    </Modal>
  );
}
