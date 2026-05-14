import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind utility merge helper (shadcn standard).
 * Combines clsx + tailwind-merge so duplicate/conflicting classes resolve
 * with the rightmost one winning.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
