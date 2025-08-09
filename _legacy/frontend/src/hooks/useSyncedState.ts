import { useState, useEffect, useCallback, useRef } from "react";

function useSyncedState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);
  const initialValueRef = useRef(initialValue);

  // Update ref jika initialValue berubah
  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  // Inisialisasi data dari localStorage setelah component mount di client
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      try {
        const stored = localStorage.getItem(key);
        if (stored !== null) {
          const parsedValue = JSON.parse(stored) as T;
          setValue(parsedValue);
        }
      } catch (error) {
        console.warn(
          `Failed to parse localStorage value for key "${key}":`,
          error
        );
        // Jika gagal parse, hapus item yang corrupt
        localStorage.removeItem(key);
      } finally {
        setIsInitialized(true);
      }
    }
  }, [key, isInitialized]);

  // Stabilkan setValue dengan useCallback
  const setValueStable = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue((prevValue) => {
      const nextValue =
        typeof newValue === "function"
          ? (newValue as (prev: T) => T)(prevValue)
          : newValue;
      return nextValue;
    });
  }, []);

  // Simpan ke localStorage setiap kali value berubah
  useEffect(() => {
    if (typeof window !== "undefined" && isInitialized) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(
          `Failed to save to localStorage for key "${key}":`,
          error
        );
      }
    }
  }, [key, value, isInitialized]);

  // Event listener untuk sinkronisasi antar tab
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          if (e.newValue !== null) {
            const parsedValue = JSON.parse(e.newValue) as T;
            setValue(parsedValue);
          } else {
            setValue(initialValueRef.current);
          }
        } catch (error) {
          console.warn(
            `Failed to parse storage event value for key "${key}":`,
            error
          );
          setValue(initialValueRef.current);
        }
      }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key]); // Hanya bergantung pada key

  const removeKey = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to remove localStorage key "${key}":`, error);
      }
    }
    setValue(initialValueRef.current);
  }, [key]); // Tidak perlu initialValue di dependency

  return [value, setValueStable, removeKey, isInitialized] as const;
}

export default useSyncedState;
