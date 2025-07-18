"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

type Theme = "light" | "dark";

interface UIContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "ui-theme";

export const UIProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    // Initialize theme from localStorage after component mounts
    useEffect(() => {
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        const initialTheme = storedTheme || systemTheme;

        setThemeState(initialTheme);
        setMounted(true);
    }, []);

    // Apply theme to document
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);

        // Store theme in localStorage
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme, mounted]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState(prevTheme => prevTheme === "light" ? "dark" : "light");
    }, []);

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <UIContext.Provider value={{ theme: "light", toggleTheme: () => { }, setTheme: () => { } }}>
                <div style={{ visibility: "hidden" }}>{children}</div>
            </UIContext.Provider>
        );
    }

    return (
        <UIContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = (): UIContextType => {
    const context = useContext(UIContext);

    if (context === undefined) {
        throw new Error("useUI must be used within a UIProvider");
    }

    return context;
};
