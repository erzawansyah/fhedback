import { Card, CardContent } from "@/components/ui/card";

interface PageSectionProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

const PageSection: React.FC<PageSectionProps> = ({
    title,
    description,
    children,
    className
}) => {
    return (
        <Card className={className}>
            <CardContent>
                {title && (
                    <div className="space-y-2 mb-4">
                        <h4 className="text-xl font-bold">{title}</h4>
                        {description && <p className="text-subtle">{description}</p>}
                    </div>
                )}
                {children}
            </CardContent>
        </Card>
    );
}

export default PageSection;
