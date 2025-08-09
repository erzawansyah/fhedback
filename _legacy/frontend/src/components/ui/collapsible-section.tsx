"use client";

import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/shadcn/utils";

interface CollapsibleSectionProps {
    title: string;
    badgeText?: string;
    badgeVariant?: "default" | "neutral";
    icon?: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
    triggerClassName?: string;
    contentClassName?: string;
}

export const CollapsibleSection = ({
    title,
    badgeText,
    badgeVariant = "default",
    icon: Icon,
    children,
    defaultOpen = false,
    className,
    triggerClassName,
    contentClassName
}: CollapsibleSectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className={cn("w-full", className)}
            data-slot="collapsible-section"
        >
            <CollapsibleTrigger
                className={cn(
                    "flex items-center justify-between w-full p-3",
                    "bg-secondary-background border-2 border-border rounded-base",
                    "hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none",
                    "transition-all font-mono text-foreground",
                    "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black",
                    triggerClassName
                )}
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    <span className="font-mono text-sm">{title}</span>
                    {badgeText && (
                        <Badge variant={badgeVariant} className="text-xs px-2 py-0">
                            {badgeText}
                        </Badge>
                    )}
                </div>
                {isOpen ? (
                    <ChevronDown className="w-4 h-4" />
                ) : (
                    <ChevronRight className="w-4 h-4" />
                )}
            </CollapsibleTrigger>
            <CollapsibleContent
                className={cn(
                    "mt-2 animate-in slide-in-from-top-2",
                    contentClassName
                )}
            >
                {children}
            </CollapsibleContent>
        </Collapsible>
    );
};
