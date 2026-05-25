import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * shadcn/ui + 21st.dev component utility.
 * Merges Tailwind class strings, deduping conflicts.
 * Usage: cn("p-2", condition && "p-4", "rounded-md")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
