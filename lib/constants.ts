import {
  BadgeCheck,
  Boxes,
  CircleDollarSign,
  CreditCard,
  Gauge,
  ListOrdered,
  Package,
  Settings,
  SquareChartGantt,
  Users,
  UserRoundCog,
} from "lucide-react";

export const APP_NAME = "ATTUALITY";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_NEXTPUBLICBASEURL ||
  process.env.NEXT_PUBLIC_BASEURL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXTPUBLICBASEURL ||
  "http://localhost:5000/api/v1";

export const PAGINATION_LIMIT = 10;

export const DASHBOARD_NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: Gauge },
  { title: "Orders", href: "/orders", icon: ListOrdered },
  { title: "Product", href: "/products", icon: Package },
  { title: "Category", href: "/category", icon: SquareChartGantt },
  { title: "Customer", href: "/customers", icon: Users },
  { title: "Vendors", href: "/vendors", icon: Boxes },
  { title: "Manage Staff", href: "/staff", icon: UserRoundCog },
  { title: "Subscribe", href: "/subscribe", icon: CreditCard },
  { title: "Coupons", href: "/coupons", icon: BadgeCheck },
  { title: "Commission", href: "/commission", icon: CircleDollarSign },
  { title: "Settings", href: "/settings", icon: Settings },
] as const;
