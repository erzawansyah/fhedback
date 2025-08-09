"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/shadcn/utils";

interface ThemeSwitcherProps {
    className?: string;
    showLabels?: boolean;
}

export const ThemeSwitcher = ({ className, showLabels = false }: ThemeSwitcherProps) => {
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
        <div
            className={cn("flex items-center gap-2", className)}
            data-slot="theme-switcher"
        >
            <div className="flex items-center gap-2">
                {isDark ? (
                    <Moon className="h-4 w-4 text-foreground" />
                ) : (
                    <Sun className="h-4 w-4 text-foreground" />
                )}
                <Switch
                    checked={isDark}
                    onCheckedChange={toggleTheme}
                    aria-label="Toggle theme"
                />
                {showLabels && (
                    <p className="text-sm font-mono text-foreground">
                        {isDark ? "Dark mode" : "Light mode"}
                    </p>
                )}
            </div>
        </div>
    );
};
