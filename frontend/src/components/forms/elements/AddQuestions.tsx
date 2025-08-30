import { useFormContext, useFieldArray, type Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Edit } from "lucide-react";
import type { FormIn } from "@/utils/survey-creation";
import TextInput from "./TextInput";
import TextAreaInput from "./TextAreaInput";
import { useState, useMemo, useCallback } from "react";
import type { FC } from "react";

type GlobalExtras = {
    global: {
        type: "scale" | "nominal";
        maxScore: number;
        minLabel?: string;
        maxLabel?: string;
        nominalLabels?: string[];
    };
};
type FormInUI = FormIn & GlobalExtras;

// Type definitions for component props
interface QuestionCardProps {
    field: {
        id: string;
        [key: string]: unknown;
    };
    index: number;
    questionText: string;
    helperText?: string;
    hasContent: boolean;
    isEditing: boolean;
    globalType: "scale" | "nominal";
    globalMaxScore: number;
    globalMinLabel?: string;
    globalMaxLabel?: string;
    globalNominalLabels?: string[];
    questionControl: Control<FormIn>;
    onToggleEdit: () => void;
    onRemove: () => void;
}

interface QuestionPreviewProps {
    questionText: string;
    helperText?: string;
    globalType: "scale" | "nominal";
    globalMaxScore: number;
    globalMinLabel?: string;
    globalMaxLabel?: string;
    globalNominalLabels?: string[];
}

interface QuestionFormProps {
    index: number;
    questionControl: Control<FormIn>;
    hasContent: boolean;
    globalType: "scale" | "nominal";
    globalMaxScore: number;
    globalMinLabel?: string;
    globalMaxLabel?: string;
    globalNominalLabels?: string[];
    onToggleEdit: () => void;
    onRemove: () => void;
}

interface ScalePreviewProps {
    globalMaxScore: number;
    globalMinLabel?: string;
    globalMaxLabel?: string;
}

interface NominalPreviewProps {
    globalMaxScore: number;
    globalNominalLabels?: string[];
}

interface AddQuestionAreaProps {
    onAddQuestion: () => void;
}

// Child Components
const ScalePreview: FC<ScalePreviewProps> = ({
    globalMaxScore,
    globalMinLabel,
    globalMaxLabel
}) => (
    <div className="space-y-3">
        <div className="flex justify-between text-sm font-medium text-subtle italic">
            <span className="font-base">{globalMinLabel || "1"}</span>
            <div className="flex gap-3 justify-evenly">
                {Array.from({ length: globalMaxScore || 5 }, (_, i) => (
                    <div key={i + 1} className="flex flex-col items-center gap-2">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                        </div>
                        <span className="text-xs font-medium text-gray-500">{i + 1}</span>
                    </div>
                ))}
            </div>
            <span className="font-base">{globalMaxLabel || globalMaxScore}</span>
        </div>
    </div>
);

const NominalPreview: FC<NominalPreviewProps> = ({
    globalMaxScore,
    globalNominalLabels
}) => (
    <div className="space-y-2">
        {(globalNominalLabels && globalNominalLabels.length > 0
            ? globalNominalLabels
            : Array.from({ length: globalMaxScore || 4 }, (_, i) => `Option ${i + 1}`)
        ).map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center gap-3 p-2 rounded-md border border-gray-200 bg-gray-50">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                </div>
                <span className="text-sm text-gray-700">{option}</span>
            </div>
        ))}
    </div>
);

const QuestionPreview: FC<QuestionPreviewProps> = ({
    questionText,
    helperText,
    globalType,
    globalMaxScore,
    globalMinLabel,
    globalMaxLabel,
    globalNominalLabels
}) => (
    <div className="space-y-3">
        <div className="mb-3">
            <h4 className="text-lg font-heading">
                {questionText}
            </h4>
            {helperText && (
                <p className="text-xs text-subtle italic">
                    {helperText}
                </p>
            )}
        </div>

        {globalType === "scale" ? (
            <ScalePreview
                globalMaxScore={globalMaxScore}
                globalMinLabel={globalMinLabel}
                globalMaxLabel={globalMaxLabel}
            />
        ) : (
            <NominalPreview
                globalMaxScore={globalMaxScore}
                globalNominalLabels={globalNominalLabels}
            />
        )}
    </div>
);

const QuestionForm: FC<QuestionFormProps> = ({
    index,
    questionControl,
    hasContent,
    onToggleEdit,
    onRemove
}) => (
    <div className="space-y-3">
        {/* Mini header for form mode */}
        <div className="flex items-center justify-between pb-2">
            <span className="text-base font-bold text-subtle">Question {index + 1}</span>
            <Button
                type="button"
                variant="noShadow"
                size="icon"
                onClick={onRemove}
                className="h-6 w-6 p-2 bg-white text-danger  hover:text-white hover:bg-danger rounded-full"
            >
                <Trash2 className="h-3 w-3" />
            </Button>
        </div>

        <TextInput
            control={questionControl}
            name={`questions.${index}.text`}
            label="Question Text"
            placeholder="Enter your question here"
            required
        />

        <TextAreaInput
            control={questionControl}
            name={`questions.${index}.helperText`}
            label="Helper Text"
            placeholder="Optional helper text to guide respondents"
        />



        {/* Compact Done button */}
        {hasContent && (
            <div className="flex justify-end">
                <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={onToggleEdit}
                    className="h-7 px-3 text-xs"
                >
                    Done
                </Button>
            </div>
        )}
    </div>
);

const QuestionCard: FC<QuestionCardProps> = ({
    field,
    index,
    questionText,
    helperText,
    hasContent,
    isEditing,
    globalType,
    globalMaxScore,
    globalMinLabel,
    globalMaxLabel,
    globalNominalLabels,
    questionControl,
    onToggleEdit,
    onRemove
}) => {
    const shouldShowPreview = hasContent && !isEditing;

    return (
        <div key={field.id} className="border border-gray-200 rounded-lg overflow-hidden mb-4 relative group">
            {/* Overlay with action buttons - only appears on hover when in preview mode */}
            {shouldShowPreview && (
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="flex items-center gap-3">
                        <span className="bg-white/90 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border border-white/50">
                            Question {index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={onToggleEdit}
                                className="h-8 px-3 text-xs bg-white/90 text-gray-800 hover:bg-white shadow-lg backdrop-blur-sm border border-white/50 transition-all duration-200"
                            >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                            </Button>
                            <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={onRemove}
                                className="h-8 px-3 text-xs bg-red-500/90 text-white hover:bg-red-600 shadow-lg backdrop-blur-sm border border-red-400/50 transition-all duration-200"
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content area tanpa header */}
            <div className="p-4">
                {shouldShowPreview ? (
                    <QuestionPreview
                        questionText={questionText}
                        helperText={helperText}
                        globalType={globalType}
                        globalMaxScore={globalMaxScore}
                        globalMinLabel={globalMinLabel}
                        globalMaxLabel={globalMaxLabel}
                        globalNominalLabels={globalNominalLabels}
                    />
                ) : (
                    <QuestionForm
                        index={index}
                        questionControl={questionControl}
                        hasContent={hasContent}
                        globalType={globalType}
                        globalMaxScore={globalMaxScore}
                        globalMinLabel={globalMinLabel}
                        globalMaxLabel={globalMaxLabel}
                        globalNominalLabels={globalNominalLabels}
                        onToggleEdit={onToggleEdit}
                        onRemove={onRemove}
                    />
                )}
            </div>
        </div>
    );
};

const AddQuestionArea: FC<AddQuestionAreaProps> = ({ onAddQuestion }) => (
    <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
        onClick={onAddQuestion}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onAddQuestion();
            }
        }}
        tabIndex={0}
        role="button"
        aria-label="Add new question"
    >
        <p className="text-gray-600 text-sm mb-2 text-center">
            Click or press Enter to add a new question
        </p>
        <Button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onAddQuestion();
            }}
            className="flex items-center gap-2 mx-auto"
        >
            <Plus className="h-4 w-4" />
            Add Questions
        </Button>
    </div>
);

export default function AddQuestions() {
    const { control, watch } = useFormContext<FormInUI>();
    const { fields, append, remove } = useFieldArray({
        control: control as unknown as Control<FormIn>,
        name: "questions",
    });

    // State to control edit mode for each question
    const [editingQuestions, setEditingQuestions] = useState<Set<string>>(new Set());

    // Watch global settings - memoized for performance
    const globalType = watch("global.type");
    const globalMaxScore = watch("global.maxScore");
    const globalMinLabel = watch("global.minLabel");
    const globalMaxLabel = watch("global.maxLabel");
    const globalNominalLabels = watch("global.nominalLabels");

    const globalSettings = useMemo(() => ({
        type: globalType,
        maxScore: globalMaxScore,
        minLabel: globalMinLabel,
        maxLabel: globalMaxLabel,
        nominalLabels: globalNominalLabels
    }), [globalType, globalMaxScore, globalMinLabel, globalMaxLabel, globalNominalLabels]);

    const addQuestion = () => {
        if (globalSettings.type === "scale") {
            const newQuestion = {
                type: "scale" as const,
                minScore: 1 as const,
                maxScore: globalSettings.maxScore || 5,
                minLabel: globalSettings.minLabel || "",
                maxLabel: globalSettings.maxLabel || "",
                text: "",
                helperText: "",
            };
            append(newQuestion);
        } else {
            // For nominal, create labels based on global settings
            const labels = globalSettings.nominalLabels && globalSettings.nominalLabels.length > 0
                ? globalSettings.nominalLabels.map((label: string, i: number) => ({ id: i + 1, text: label }))
                : Array.from({ length: globalSettings.maxScore || 4 }, (_, i) => ({
                    id: i + 1,
                    text: `Option ${i + 1}`,
                }));

            const newQuestion = {
                type: "nominal" as const,
                minScore: 1 as const,
                maxScore: globalSettings.maxScore || 4,
                labels,
                text: "",
                helperText: "",
            };
            append(newQuestion);
        }

        // Add new question to edit mode immediately
        setTimeout(() => {
            const newFieldIndex = fields.length;
            if (fields[newFieldIndex]) {
                const newFieldId = fields[newFieldIndex].id;
                if (newFieldId) {
                    setEditingQuestions(prev => new Set(prev).add(newFieldId));
                }
            }
        }, 0);
    };

    // Create memoized toggle function factory
    const createToggleEditMode = useCallback((fieldId: string) => {
        return () => {
            setEditingQuestions(prev => {
                const newEditingSet = new Set(prev);
                if (newEditingSet.has(fieldId)) {
                    newEditingSet.delete(fieldId);
                } else {
                    newEditingSet.add(fieldId);
                }
                return newEditingSet;
            });
        };
    }, []);

    // Create memoized remove function factory
    const createRemoveHandler = useCallback((index: number) => {
        return () => remove(index);
    }, [remove]);

    const questionControl = control as unknown as Control<FormIn>;

    return (
        <div className="space-y-6">
            {/* Questions List */}
            <div className="space-y-4">
                {fields.map((field, index) => {
                    const questionText = watch(`questions.${index}.text`);
                    const helperText = watch(`questions.${index}.helperText`);
                    const hasContent = Boolean(questionText && questionText.trim().length > 0);
                    const isEditing = editingQuestions.has(field.id);

                    return (
                        <QuestionCard
                            key={field.id}
                            field={field}
                            index={index}
                            questionText={questionText || ""}
                            helperText={helperText}
                            hasContent={hasContent}
                            isEditing={isEditing}
                            globalType={globalType}
                            globalMaxScore={globalMaxScore}
                            globalMinLabel={globalMinLabel}
                            globalMaxLabel={globalMaxLabel}
                            globalNominalLabels={globalNominalLabels}
                            questionControl={questionControl}
                            onToggleEdit={createToggleEditMode(field.id)}
                            onRemove={createRemoveHandler(index)}
                        />
                    );
                })}

                <AddQuestionArea onAddQuestion={addQuestion} />
            </div>
        </div>
    );
}
