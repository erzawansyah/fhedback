"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";

export const ThemeSwitcher = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Initialize theme based on localStorage or system preference
        const stored = localStorage.getItem("theme");
        const initial =
            stored === "dark" ||
            (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
        setIsDark(initial);
        document.documentElement.classList.toggle("dark", initial);
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("theme", next ? "dark" : "light");
    };

    return (
        <div className="flex items-center space-x-2">
            {
                isDark ? (
                    <Moon className="h-5 w-5 text-gray-500" />
                ) : (
                    <Sun className="h-5 w-5 text-yellow-500" />
                )
            }
            <Switch checked={isDark} onCheckedChange={toggleTheme} />
            {
                isDark ? (
                    <p className="text-sm">Dark mode</p>
                ) : (
                    <p className="text-sm">Light mode</p>
                )
            }
        </div>
    );
};
