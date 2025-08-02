// Utility functions
// Common utility functions used across the application

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Example utility functions:
// export const formatDate = (date: Date): string => {
//   return date.toLocaleDateString();
// };

// export const truncateText = (text: string, maxLength: number): string => {
//   return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
// };

// export const generateId = (): string => {
//   return Math.random().toString(36).substr(2, 9);
// };
