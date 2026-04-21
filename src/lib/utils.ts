import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 8; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function isPlanActive(plan: string, expiresAt: Date | null): boolean {
  if (plan === "PREMIUM") return true;
  if (!expiresAt) return false;
  return new Date() < expiresAt;
}

export function limitString(str: string, limit: number): string {
  if (str.length <= limit) return str;
  return str.slice(0, limit) + "...";
}
