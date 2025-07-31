// Helper function to safely convert data
export const safeConvertData = {
  toString: (data: unknown, fallback: string = ""): string => {
    return data != null && data.toString().length > 0 ? String(data) : fallback;
  },
  toNumber: (data: unknown, fallback: number = 0): number => {
    const num = Number(data);
    return !isNaN(num) && isFinite(num) ? num : fallback;
  },
  toBoolean: (data: unknown, fallback: boolean = false): boolean => {
    return data === 1 || data === "1" || data === true ? true : fallback;
  },
};
