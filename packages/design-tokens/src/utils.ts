/**
 * Utility Functions for Design Tokens
 *
 * Provides the cn() utility function for merging class names with proper Tailwind CSS
 * conflict resolution using clsx and tailwind-merge.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with Tailwind CSS conflict resolution
 *
 * This utility combines clsx for conditional class names and tailwind-merge
 * for proper Tailwind class conflict resolution. It ensures that later classes
 * override earlier ones correctly.
 *
 * @example
 * cn("px-2 py-1", "px-4") // => "py-1 px-4"
 * cn("text-red-500", condition && "text-blue-500") // => conditionally applies classes
 *
 * @param inputs - Class values to merge (strings, objects, arrays, etc.)
 * @returns Merged class name string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
