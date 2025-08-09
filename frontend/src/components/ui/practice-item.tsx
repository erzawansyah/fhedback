"use client";

import { cn } from "@/lib/shadcn/utils";

interface PracticeItemProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    variant?: "critical" | "important" | "helpful";
    className?: string;
}

const variantStyles = {
    critical: "border-danger/20 bg-danger/5 hover:bg-danger/10",
    important: "border-warning/20 bg-warning/5 hover:bg-warning/10",
    helpful: "border-info/20 bg-info/5 hover:bg-info/10"
};

const iconStyles = {
    critical: "text-danger",
    important: "text-warning",
    helpful: "text-info"
};

const textStyles = {
    critical: "text-danger",
    important: "text-warning",
    helpful: "text-info"
};

export const PracticeItem = ({
    icon: Icon,
    title,
    description,
    variant = "helpful",
    className
}: PracticeItemProps) => {
    return (
        <div
            className={cn(
                "flex items-start gap-3 p-3 rounded-base border-2 transition-colors",
                variantStyles[variant],
                className
            )}
            data-slot="practice-item"
        >
            <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", iconStyles[variant])} />
            <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-mono font-semibold", textStyles[variant])}>
                    {title}
                </p>
                <p className="text-xs font-mono text-foreground/70 mt-1 leading-tight">
                    {description}
                </p>
            </div>
        </div>
    );
};
