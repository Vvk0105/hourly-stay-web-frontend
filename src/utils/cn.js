import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility to merge Tailwind classes safely
 * (shadcn/ui convention)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
