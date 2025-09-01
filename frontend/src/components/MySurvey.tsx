import { format } from "date-fns";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Pencil, BarChart, Trash2, Rocket, MessageCircle } from "lucide-react";
import { useSurveyDataById } from "../hooks/useSurveyData";
import type { Address } from "viem";
import { useSurveyManager } from "../hooks/useSurveyManager";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

const statusMap: Record<number, string> = {
    0: "Created",
    1: "Active",
    2: "Completed",
    3: "Trashed",
};

const SurveyCategories = {
    PRODUCT_FEEDBACK: "product_feedback",
    USER_EXPERIENCE: "user_experience",
    MARKET_RESEARCH: "market_research",
    ACADEMIC_RESEARCH: "academic_research",
    OTHER: "other",
} as const;

const categoryColors: Record<string, { bg: string, text: string }> = {
    [SurveyCategories.PRODUCT_FEEDBACK]: { bg: 'bg-blue-100', text: 'text-blue-700' },
    [SurveyCategories.USER_EXPERIENCE]: { bg: 'bg-purple-100', text: 'text-purple-700' },
    [SurveyCategories.MARKET_RESEARCH]: { bg: 'bg-green-100', text: 'text-green-700' },
    [SurveyCategories.ACADEMIC_RESEARCH]: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    [SurveyCategories.OTHER]: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

function formatCategoryName(category: string): string {
    switch (category) {
        case SurveyCategories.PRODUCT_FEEDBACK:
            return "Product Feedback";
        case SurveyCategories.USER_EXPERIENCE:
            return "User Experience";
        case SurveyCategories.MARKET_RESEARCH:
            return "Market Research";
        case SurveyCategories.ACADEMIC_RESEARCH:
            return "Academic Research";
        case SurveyCategories.OTHER:
            return "Other";
        default:
            return category
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
    }
}

type SurveyConfig = {
    symbol: string;
    status: number;
    totalQuestions: number;
    respondentLimit: number;
    createdAt: string;
}

type SurveyMetadata = {
    title?: string;
    description?: string;
    tags?: string[];
    category?: string;
}

const SurveyLoading = () => (
    <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
    </div>
);

const SurveyError = ({ error }: { error: string[] }) => (
    <Alert variant="destructive">
        <AlertDescription>
            Error loading survey data. {error.join(" | ")}
        </AlertDescription>
    </Alert>
);

const SurveySymbol = ({ symbol }: { symbol: string }) => (
    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/5 border border-primary/20 text-primary font-medium overflow-hidden">
        <span className="font-mono text-sm max-w-full px-1 truncate">{symbol}</span>
    </div>
);

const SurveyTags = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-wrap gap-1 mt-1">
        {tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-xs text-muted-foreground px-1.5 py-0.5 rounded-md bg-muted">
                #{tag}
            </span>
        ))}
        {tags.length > 3 && (
            <span className="text-xs text-muted-foreground px-1.5 py-0.5">
                +{tags.length - 3}
            </span>
        )}
    </div>
);

const SurveyBadges = ({ category, status }: { category?: string; status: number }) => (
    <div className="flex items-center gap-2 ml-4">
        {category && (
            <Badge
                variant="neutral"
                className={`${categoryColors[category.toLowerCase()]?.bg || categoryColors.other.bg} ${categoryColors[category.toLowerCase()]?.text || categoryColors.other.text} border-0`}
            >
                {formatCategoryName(category)}
            </Badge>
        )}
        <Badge variant={status === 1 || status === 2 ? "default" : "neutral"}>
            {statusMap[status] ?? "Unknown"}
        </Badge>
    </div>
);

const SurveyMetaInfo = ({ config, address }: { config: SurveyConfig; address?: string }) => (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex gap-4">
            <span>Questions: {config.totalQuestions}</span>
            <span>Limit: {config.respondentLimit}</span>
            <span>Created: {format(new Date(config.createdAt), "MMM d, yyyy")}</span>
        </div>
        {address && (
            <span className="truncate max-w-[200px]" title={address}>
                {address}
            </span>
        )}
    </div>
);

const PublishButton = ({ address }: { address: Address }) => {
    const [loading, setLoading] = useState(false);
    const manage = useSurveyManager(address!);

    const publish = async () => {
        setLoading(true);
        try {
            await manage.publish();
        } catch (error) {
            console.error("Failed to publish survey:", error);
        } finally {
            setLoading(false);
        }
    }

    if (!manage.isReady) return null;

    return (
        <Button variant="default" size="sm" onClick={publish}>
            <Rocket className="w-4 h-4 mr-2" />
            {loading ? "Publishing..." : "Publish"}
        </Button>
    );
}

const SurveyActions = ({ status, address, surveyId }: { status: number; address?: Address; surveyId: number }) => {
    return (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <div className="ml-auto flex items-center gap-2">
                <Link to="/survey/$surveyId/results" params={{ surveyId: surveyId.toString() }}>
                    <Button variant="neutral" size="sm">
                        <BarChart className="w-4 h-4 mr-2" />
                        Results
                    </Button>
                </Link>
            </div>

            {status === 1 && (
                <Button variant="default" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Respond
                </Button>
            )}

            {status === 0 && (
                <>
                    <Button variant="neutral" size="sm">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                    <Button variant="neutral" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Trash
                    </Button>
                    <PublishButton address={address!} />
                </>
            )}
        </div>
    );
}

const SurveyContent = ({ config, metadata, address, surveyId }: { config: SurveyConfig; metadata?: SurveyMetadata; address?: Address; surveyId: number }) => (
    <div className="p-4 rounded-lg border bg-card">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <SurveySymbol symbol={config.symbol} />
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold truncate">{metadata?.title || config.symbol}</h2>
                    {metadata?.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {metadata.description}
                        </p>
                    )}
                    {metadata?.tags && metadata.tags.length > 0 && (
                        <SurveyTags tags={metadata.tags} />
                    )}
                </div>
            </div>
            <SurveyBadges category={metadata?.category} status={config.status} />
        </div>

        <SurveyMetaInfo config={config} address={address} />
        <SurveyActions status={config.status} address={address} surveyId={surveyId} />
    </div>
);

export default function MySurvey({ surveyId }: { surveyId: number }) {
    const {
        loading,
        error,
        address,
        config,
        metadata,
    } = useSurveyDataById(surveyId);

    const isError = error.length > 0;

    return (
        <div className="mx-auto my-8">
            {loading && <SurveyLoading />}
            {isError && <SurveyError error={error} />}
            {!loading && !isError && config && (
                <SurveyContent
                    config={{
                        ...config,
                        createdAt: typeof config.createdAt === "string"
                            ? config.createdAt
                            : config.createdAt.toISOString()
                    }}
                    metadata={metadata ?? undefined}
                    address={address ?? undefined}
                    surveyId={surveyId}
                />
            )}
        </div>
    );
}
