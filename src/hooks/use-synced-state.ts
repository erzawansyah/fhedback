import { useState, useEffect, useCallback } from "react";

function useSyncedState<T>(key: string, initialValue: T) {
  const getInitial = () => {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      try {
        return JSON.parse(stored) as T;
      } catch {
        return initialValue;
      }
    }
    return initialValue;
  };

  const [value, setValue] = useState<T>(getInitial);

  // Stabilkan setValue dengan useCallback
  const setValueStable = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(newValue);
  }, []);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  useEffect(() => {
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
    localStorage.removeItem(key);
    setValue(initialValue);
  }, [initialValue, key]);

  // Gunakan setValueStable di return statement
  return [value, setValueStable, removeKey] as const;
}

export default useSyncedState;
