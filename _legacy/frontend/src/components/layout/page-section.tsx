import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/shadcn/utils";

interface PageSectionProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "highlighted";
}

const PageSection: React.FC<PageSectionProps> = ({
    title,
    description,
    children,
    className,
    variant = "default"
}) => {
    const cardClassName = variant === "highlighted" ? "bg-main" : undefined;

    return (
        <Card
            className={cn(cardClassName, className)}
            data-slot="page-section"
        >
            {(title || description) && (
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
            )}
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}

export default PageSection;
