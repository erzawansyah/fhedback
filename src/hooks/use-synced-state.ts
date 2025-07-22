import { useState, useEffect, useCallback } from "react";

function useSyncedState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inisialisasi data dari localStorage setelah component mount di client
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        try {
          setValue(JSON.parse(stored) as T);
        } catch {
          // Jika gagal parse, gunakan initialValue
        }
      }
      setIsInitialized(true);
    }
  }, [key, initialValue, isInitialized]);

  // Stabilkan setValue dengan useCallback
  const setValueStable = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(newValue);
  }, []);

  useEffect(() => {
    // Hanya simpan ke localStorage jika sudah diinisialisasi dan di client-side
    if (typeof window !== "undefined" && isInitialized) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value, isInitialized]);

  useEffect(() => {
    // Hanya tambahkan event listener jika di client-side
    if (typeof window === "undefined") return;

    const handler = (e: StorageEvent) => {
      if (e.key === key) {
        if (e.newValue !== null) {
          setValue(JSON.parse(e.newValue));
        } else {
          setValue(initialValue);
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key, initialValue]);

  const removeKey = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
    setValue(initialValue);
  }, [initialValue, key]);

  // Gunakan setValueStable di return statement
  return [value, setValueStable, removeKey] as const;
}

export default useSyncedState;
