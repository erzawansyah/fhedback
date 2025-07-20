"use client";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { useSidebar } from "./ui/sidebar";

export const BrandLogo: FC = () => {
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
        <div className="w-full flex items-center">
            <Image
                src="/fhedback-logo.png"
                alt="Fhedback Logo"
                width={48}
                height={48}
            />
            {state === "expanded" && showText && (
                <div className="ml-2">
                    <h2 className="text-2xl uppercase">FHEdback</h2>
                    <p className="text-gray-700 dark:text-gray-300">Confidential Survey</p>
                </div>
            )}
        </div>
    );
};

