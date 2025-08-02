"use client";

import { CheckCircle, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/shadcn/utils";

interface ProgressStepProps {
    title: string;
    description?: string;
    completed: boolean;
    current?: boolean;
    className?: string;
    icon?: React.ComponentType<{ className?: string }>;
}

export const ProgressStep = ({
    title,
    description,
    completed,
    current = false,
    className,
    icon: CustomIcon
}: ProgressStepProps) => {
    const IconComponent = completed
        ? CheckCircle
        : current
            ? Clock
            : CustomIcon || Circle;

    const iconColor = completed
        ? "text-success"
        : current
            ? "text-main"
            : "text-foreground/40";

    const textColor = completed
        ? "text-success"
        : current
            ? "text-foreground"
            : "text-foreground/60";

    return (
        <div
            className={cn(
                "flex items-start gap-3 p-3 rounded-base border-2 transition-all",
                completed && "bg-success/5 border-success/20",
                current && "bg-main/5 border-main/20",
                !completed && !current && "bg-secondary-background border-border",
                className
            )}
            data-slot="progress-step"
        >
            <IconComponent className={cn("w-5 h-5 mt-0.5 shrink-0", iconColor)} />
            <div className="min-w-0 flex-1">
                <h4 className={cn("font-mono font-semibold text-sm", textColor)}>
                    {title}
                </h4>
                {description && (
                    <p className={cn("text-xs font-mono mt-1", textColor)}>
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};
