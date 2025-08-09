"use client";
import { type FC, useEffect, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/utils";

interface BrandLogoProps {
    className?: string;
}

export const BrandLogo: FC<BrandLogoProps> = ({ className }) => {
    const { state } = useSidebar();
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (state === "expanded") {
            timer = setTimeout(() => setShowText(true), 300);
        } else {
            setShowText(false);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [state]);

    return (
        <div
            className={cn("w-full flex items-center", className)}
            data-slot="brand-logo"
        >
            <img
                src="/fhedback-logo.png"
                alt="Fhedback Logo"
                width={48}
                height={48}
                className="shrink-0"
            />
            {state === "expanded" && showText && (
                <div className="ml-2 min-w-0">
                    <h2 className="text-2xl font-heading text-foreground uppercase">FHEdback</h2>
                    <p className="text-sm font-mono text-foreground/70">Confidential Survey</p>
                </div>
            )}
        </div>
    );
};

