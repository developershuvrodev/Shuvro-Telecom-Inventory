import React from "react";
import { CATEGORIES } from "@/data/seed";
import type { Product } from "@/types";

export function ProductAvatar({ product, size = 40 }: { product: Product; size?: number }) {
  const icon = CATEGORIES.find((c) => c.id === product.category)?.icon || "📦";
  if (product.imageUrl) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        className="rounded-xl object-cover flex-shrink-0 border border-border"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, background: (product.imageColor || "#0F9E93") + "22", fontSize: size * 0.48 }}
    >
      {icon}
    </div>
  );
}
