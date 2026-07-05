import {
  LayoutDashboard, Package, Tags, Award, Truck, ArrowRightLeft, SlidersHorizontal,
  AlertTriangle, FileBarChart2, Settings as SettingsIcon, Receipt, ShoppingBag, Wallet, Users,
  type LucideIcon,
} from "lucide-react";
import type { NavKey } from "@/types";

export interface NavItem {
  key: NavKey;
  label: string;
  icon: LucideIcon;
  badgeKey?: "low" | "due";
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  { title: "ওভারভিউ", items: [{ key: "dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard }] },
  {
    title: "বিক্রয় ও ক্রয়",
    items: [
      { key: "sales", label: "বিক্রয় / ক্যাশ মেমো", icon: Receipt },
      { key: "purchases", label: "ক্রয়", icon: ShoppingBag },
    ],
  },
  {
    title: "ইনভেন্টরি",
    items: [
      { key: "products", label: "পণ্য তালিকা", icon: Package },
      { key: "categories", label: "ক্যাটাগরি", icon: Tags },
      { key: "brands", label: "ব্র্যান্ড", icon: Award },
      { key: "suppliers", label: "সাপ্লায়ার", icon: Truck },
    ],
  },
  {
    title: "স্টক পরিচালনা",
    items: [
      { key: "stockflow", label: "স্টক ইন / আউট", icon: ArrowRightLeft },
      { key: "adjustment", label: "স্টক সমন্বয়", icon: SlidersHorizontal },
      { key: "lowstock", label: "লো স্টক এলার্ট", icon: AlertTriangle, badgeKey: "low" },
    ],
  },
  {
    title: "হিসাব",
    items: [
      { key: "cashbook", label: "দৈনিক আয়-ব্যয়", icon: Wallet },
      { key: "customers", label: "কাস্টমার", icon: Users },
    ],
  },
  {
    title: "বিশ্লেষণ",
    items: [
      { key: "reports", label: "রিপোর্ট", icon: FileBarChart2 },
      { key: "settings", label: "সেটিংস", icon: SettingsIcon },
    ],
  },
];
