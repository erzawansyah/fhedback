import { MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PageTitleProps {
    title: string;
    description?: string;
    titleIcon?: React.ReactNode;
    hideAction?: boolean;
    actionText?: string;
    actionIcon?: React.ReactNode;
    handleAction?: () => void;
    withCard?: boolean;
}

interface TitleHeaderProps {
    title: string;
    titleIcon?: React.ReactNode;
}

interface ActionButtonProps {
    handleAction?: () => void;
    actionIcon?: React.ReactNode;
    actionText?: string;
    variant: "default" | "neutral";
}

const TitleHeader: React.FC<TitleHeaderProps> = ({ title, titleIcon }) => (
    <div className="flex items-center gap-2 mb-2">
        {titleIcon && titleIcon}
        <h1 className="text-3xl font-bold">{title}</h1>
    </div>
);

const ActionButton: React.FC<ActionButtonProps> = ({
    handleAction,
    actionIcon,
    actionText = "Refresh",
    variant
}) => (
    <Button
        onClick={handleAction}
        className="flex items-center gap-2"
        variant={variant}
    >
        {actionIcon || <MousePointer2 className="w-4 h-4" />}
        {actionText}
    </Button>
);

const PageTitleContent: React.FC<PageTitleProps> = ({
    title,
    description,
    titleIcon,
    hideAction = false,
    handleAction,
    actionIcon,
    actionText,
    withCard = false,
}) => {
    const buttonVariant = withCard ? "neutral" : "default";

    return (
        <div className="flex justify-between items-center gap-2">
            <div className="max-w-6xl">
                <TitleHeader title={title} titleIcon={titleIcon} />
                {description && (
                    <p className="text-subtle">{description}</p>
                )}
            </div>

            {!hideAction && (
                <div className="flex items-center gap-4">
                    <ActionButton
                        handleAction={handleAction}
                        actionIcon={actionIcon}
                        actionText={actionText}
                        variant={buttonVariant}
                    />
                </div>
            )}
        </div>
    );
};

const PageTitle: React.FC<PageTitleProps> = (props) => {
    const { withCard = false } = props;

    const content = <PageTitleContent {...props} />;

    return withCard ? (
        <Card className="mb-6 bg-main">
            <CardContent>{content}</CardContent>
        </Card>
    ) : (
        <div className="mb-6">{content}</div>
    );
}
export default PageTitle;
