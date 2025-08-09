// Re-export all utility functions from different modules
export * from "./validation";
export * from "./data";

// Main utility functions
import { StatusType } from "../types";
import { STATUS_COLORS, STATUS_BADGE_COLORS } from "../constants";

/**
 * Get status color classes for alerts and indicators
 */
export function getStatusColors(status: StatusType): string {
  return STATUS_COLORS[status] || STATUS_COLORS.info;
}

/**
 * Get status badge color classes
 */
export function getStatusBadgeColors(status: StatusType): string {
  return STATUS_BADGE_COLORS[status] || STATUS_BADGE_COLORS.info;
}

/**
 * Format contract address for display (truncate middle)
 */
export function formatAddress(
  address: string,
  startChars = 6,
  endChars = 4
): string {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Generate blockchain explorer URL
 */
export function getExplorerUrl(address: string, network = "mainnet"): string {
  const explorers = {
    mainnet: "https://etherscan.io",
    sepolia: "https://sepolia.etherscan.io",
    polygon: "https://polygonscan.com",
    mumbai: "https://mumbai.polygonscan.com",
  };

  const baseUrl =
    explorers[network as keyof typeof explorers] || explorers.mainnet;
  return `${baseUrl}/address/${address}`;
}

/**
 * Validate if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Generate slug from text (for URLs, IDs, etc.)
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Debounce function for form inputs
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if form has unsaved changes
 */
export function hasUnsavedChanges<T extends Record<string, unknown>>(
  currentValues: T,
  initialValues: T
): boolean {
  return JSON.stringify(currentValues) !== JSON.stringify(initialValues);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate random ID for components
 */
export function generateId(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}
