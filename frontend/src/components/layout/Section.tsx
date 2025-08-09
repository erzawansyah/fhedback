import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/utils";

interface SectionProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "highlighted" | "plain";
    id?: string;
}

interface SectionHeaderProps {
    title?: string;
    description?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description }) => (
    <CardHeader>
        {title && (
            <CardTitle>
                <h4 className="text-xl font-heading">{title}</h4>
            </CardTitle>
        )}
        {description && (
            <CardDescription>
                <p className="font-mono text-foreground/70">{description}</p>
            </CardDescription>
        )}
    </CardHeader>
);

const getVariantStyles = (variant: "default" | "highlighted" | "plain") => {
    switch (variant) {
        case "highlighted":
            return "bg-main";
        case "plain":
            return "border-none shadow-none bg-transparent";
        case "default":
        default:
            return "";
    }
};

const Section: React.FC<SectionProps> = ({
    title,
    description,
    children,
    className,
    variant = "default"
}) => {
    const variantStyles = getVariantStyles(variant);
    const hasHeader = title || description;

    if (variant === "plain") {
        return (
            <div
                id={title ? title.toLowerCase().replace(/\s+/g, '-') : undefined}
                className={cn("space-y-4", className)}
                data-slot="page-section"
            >
                {hasHeader && (
                    <div className="space-y-2">
                        {title && (
                            <h4 className="text-xl font-heading">{title}</h4>
                        )}
                        {description && (
                            <p className="font-mono text-foreground/70">{description}</p>
                        )}
                    </div>
                )}
                <div>
                    {children}
                </div>
            </div>
        );
    }

    return (
        <Card
            id={title ? title.toLowerCase().replace(/\s+/g, '-') : undefined}
            className={cn(variantStyles, className)}
            data-slot="page-section"
        >
            {hasHeader && (
                <SectionHeader title={title} description={description} />
            )}
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}

export default Section;
