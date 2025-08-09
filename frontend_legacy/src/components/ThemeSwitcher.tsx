"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "./ui/button";
import { useUI } from "@/context/UIContext";

const ThemeSwitcher = () => {
    const { toggleTheme, theme } = useUI();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <Button
                size="icon"
                variant="default"
                className="relative overflow-hidden"
                aria-label="Toggle theme"
            >
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            </Button>
        );
    }

    return (
        <Button
            size="icon"
            variant="default"
            onClick={toggleTheme}
            className="relative overflow-hidden cursor-pointer"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
            <span
                className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${theme === 'light'
                        ? 'opacity-100 scale-100 rotate-0'
                        : 'opacity-0 scale-90 rotate-180'
                    }`}
            >
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            </span>
            <span
                className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${theme === 'dark'
                        ? 'opacity-100 scale-100 rotate-0'
                        : 'opacity-0 scale-90 -rotate-90'
                    }`}
            >
                <Moon className="h-[1.2rem] w-[1.2rem]" />
            </span>
            {/* For accessibility - screen reader only */}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
};

export default ThemeSwitcher;
