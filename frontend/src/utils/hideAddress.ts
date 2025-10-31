import type { Address } from "viem";

export const hideAddress = (address: Address | `0x${string}` | undefined, method: 'start' | 'end' | 'default' = 'default') => {
    if (!address) return '';

  switch (method) {
    case 'start':
      return `...${address.substring(address.length - 4)}`;
    case 'end':
      return `${address.substring(0, 6)}...`;
    case 'default':
    default:
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
}
