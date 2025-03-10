import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Custom utility to merge Tailwind classes
export function cn(...inputs: string[]) {
  return twMerge(clsx(inputs));
}