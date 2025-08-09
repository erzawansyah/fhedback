"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/shadcn/utils";

const statusIndicatorVariants = cva(
    "inline-flex items-center gap-2 px-3 py-1 rounded-base border-2 font-mono text-sm",
    {
        variants: {
            status: {
                idle: "bg-secondary-background border-border text-foreground",
                loading: "bg-info/10 border-info text-info animate-pulse",
                success: "bg-success/10 border-success text-success",
                error: "bg-danger/10 border-danger text-danger",
                warning: "bg-warning/10 border-warning text-warning",
            },
            size: {
                sm: "px-2 py-0.5 text-xs",
                default: "px-3 py-1 text-sm",
                lg: "px-4 py-2 text-base",
            }
        },
        defaultVariants: {
            status: "idle",
            size: "default",
        },
    }
);

interface StatusIndicatorProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusIndicatorVariants> {
    icon?: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
}

export const StatusIndicator = ({
    className,
    status,
    size,
    icon: Icon,
    children,
    ...props
}: StatusIndicatorProps) => {
    return (
        <div
            className={cn(statusIndicatorVariants({ status, size, className }))}
            data-slot="status-indicator"
            {...props}
        >
            {Icon && <Icon className="w-4 h-4 shrink-0" />}
            <span className="truncate">{children}</span>
        </div>
    );
};
