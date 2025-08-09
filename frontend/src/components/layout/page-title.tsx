import { MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PageTitleProps {
    title: string;
    description?: string;
    titleIcon?: React.ReactNode;
    actionText?: string;
    actionIcon?: React.ReactNode;
    handleAction: () => void;
    withCard?: boolean;
}

const PageTitle: React.FC<PageTitleProps> = ({
    title,
    description,
    titleIcon,
    actionText,
    actionIcon,
    handleAction,
    withCard = false
}) => {
    const PageTitleContent = () => (
        <div className="flex justify-between items-center gap-2">
            <div className="max-w-6xl">
                <div className="flex items-center gap-2 mb-2">
                    {titleIcon ? titleIcon : null}
                    <h1 className="text-3xl font-bold">
                        {title}
                    </h1>
                </div>
                <p className="text-subtle">
                    {description}
                </p>
            </div>
            <div className="flex items-center gap-4">
                <Button onClick={handleAction} className="flex items-center gap-2">
                    {actionIcon ? actionIcon : <MousePointer2 className="w-4 h-4" />}
                    {actionText ? actionText : "Refresh"}
                </Button>
            </div>
        </div>
    )


    return withCard ? (
        <Card className="mb-6">
            <CardContent>
                <PageTitleContent />
            </CardContent>
        </Card>
    ) : (
        <div className="mb-6">
            <PageTitleContent />
        </div>
    );
}
export default PageTitle;
