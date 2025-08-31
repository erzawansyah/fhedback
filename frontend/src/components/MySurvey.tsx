import { format } from "date-fns";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Pencil, BarChart, Trash2, Rocket, MessageCircle } from "lucide-react";
import { useSurveyDataById } from "../hooks/useSurveyData";

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
            {loading && (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            )}

            {isError && (
                <Alert variant="destructive">
                    <AlertDescription>
                        Error loading survey data. {error.join(" | ")}
                    </AlertDescription>
                </Alert>
            )}

            {!loading && !isError && config && (
                <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/5 border border-primary/20 text-primary font-medium overflow-hidden">
                                <span className="font-mono text-sm max-w-full px-1 truncate">{config.symbol}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-semibold truncate">{metadata?.title || config.symbol}</h2>
                                {metadata?.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {metadata.description}
                                    </p>
                                )}
                                {metadata?.tags && metadata.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {metadata.tags.slice(0, 3).map((tag, i) => (
                                            <span key={i} className="text-xs text-muted-foreground px-1.5 py-0.5 rounded-md bg-muted">
                                                #{tag}
                                            </span>
                                        ))}
                                        {metadata.tags.length > 3 && (
                                            <span className="text-xs text-muted-foreground px-1.5 py-0.5">
                                                +{metadata.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            {metadata?.category && (
                                <Badge
                                    variant="neutral"
                                    className={`${categoryColors[metadata.category.toLowerCase()]?.bg || categoryColors.other.bg} ${categoryColors[metadata.category.toLowerCase()]?.text || categoryColors.other.text} border-0`}
                                >
                                    {formatCategoryName(metadata.category)}
                                </Badge>
                            )}
                            <Badge variant={config.status === 1 || config.status === 2 ? "default" : "neutral"}>
                                {statusMap[config.status] ?? "Unknown"}
                            </Badge>
                        </div>
                    </div>

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

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        {/* Stats button - always available */}
                        <div className="ml-auto">
                            <Button variant="neutral" size="sm">
                                <BarChart className="w-4 h-4 mr-2" />
                                Stats
                            </Button>
                        </div>

                        {/* Response button - available when survey is active */}
                        {config.status === 1 && (
                            <Button variant="default" size="sm">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Respond
                            </Button>
                        )}

                        {/* Edit, Trash, and Publish buttons - only when status is Created (0) */}
                        {config.status === 0 && (
                            <>
                                <Button variant="neutral" size="sm">
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button variant="neutral" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Trash
                                </Button>
                                <Button variant="default" size="sm">
                                    <Rocket className="w-4 h-4 mr-2" />
                                    Publish
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
