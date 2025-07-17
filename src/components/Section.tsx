import React, { ReactNode } from 'react'
import { cn } from "@/utils/cn";

// Tambahkan prop baru: bordered
type SectionVariant = "main" | "secondary" | "clean"

type SectionProps = {
    children: ReactNode;
    variant?: SectionVariant;
    sectionClassName?: string;
    bordered?: boolean; // true = ada border, false = tanpa border
    fullWidth?: boolean; // true = lebar, false = 
} & React.HTMLAttributes<HTMLDivElement>;

const variantClass: Record<SectionVariant, string> = {
    main: "bg-main",
    secondary: "bg-background",
    clean: "bg-secondary-background"
};

const Section: React.FC<SectionProps> = ({
    children,
    variant = "main",
    className = "",
    sectionClassName = "",
    bordered = true,
    fullWidth = false,
    ...rest
}) => {
    return (
        <section className={cn(
            "px-4 py-32",
            variantClass[variant],
            "flex flex-col gap-8",
            bordered && "border-b-4",
            sectionClassName
        )}>
            <div className={cn(
                fullWidth ? "w-full" : "max-w-6xl",
                "container mx-auto",
                className,
                { ...rest }
            )}>
                {children}
            </div>
        </section>
    );
};

export default Section
