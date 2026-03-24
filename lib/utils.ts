import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getTokenExpiry(token?: string | null) {
  if (!token) return 0;

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8")) as {
      exp?: number;
    };

    return decoded.exp ? decoded.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

export function toErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error && typeof error === "object") {
    const err = error as { message?: string; response?: { data?: { message?: string } } };
    return err.response?.data?.message || err.message || fallback;
  }

  return fallback;
}
