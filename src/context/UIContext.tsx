'use client'
import React, { createContext, useContext, useState, ReactNode } from "react";

interface UIContextType {
    theme: "light" | "dark"
    toggleTheme: () => void
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    React.useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    const toggleTheme = () => {
        if (theme === "light") {
            setTheme("dark")
        } else {
            setTheme("light")
        }
    }

    return (
        <UIContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error("useUI harus digunakan di dalam UIProvider");
    }
    return context;
};
