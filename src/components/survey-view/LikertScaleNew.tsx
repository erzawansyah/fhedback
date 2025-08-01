import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/shadcn/utils"

interface LikertScaleProps {
    questionId: string
    question: string
    required?: boolean
    scale: number
    minLabel: string
    maxLabel: string
    value: number | null
    onChange: (value: number) => void
    questionNumber?: number
}

export const LikertScale = ({
    questionId,
    question,
    required = false,
    scale,
    minLabel,
    maxLabel,
    value,
    onChange,
    questionNumber
}: LikertScaleProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-start space-x-3">
                {questionNumber && (
                    <Badge
                        variant={value !== null ? "default" : "neutral"}
                        className="shrink-0 mt-1 text-sm"
                    >
                        {questionNumber}
                    </Badge>
                )}
                <div className="flex-1">
                    <Label className="text-lg font-medium leading-relaxed text-gray-900">
                        {question}
                        {required && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                    </Label>
                </div>
            </div>

            <div className={questionNumber ? "ml-12" : ""}>
                {/* Scale indicator */}
                <div className="flex justify-between items-center mb-4 px-1">
                    <span className="text-sm font-medium text-gray-600">{minLabel}</span>
                    <span className="text-xs text-gray-400">1 - {scale}</span>
                    <span className="text-sm font-medium text-gray-600">{maxLabel}</span>
                </div>

                <RadioGroup
                    value={value?.toString() || ""}
                    onValueChange={(val) => onChange(parseInt(val))}
                >
                    <div className="flex justify-between gap-2">
                        {Array.from({ length: scale }, (_, i) => i + 1).map((rating) => {
                            const isSelected = value === rating

                            return (
                                <div
                                    key={rating}
                                    className="flex flex-col items-center space-y-2 flex-1"
                                >
                                    <Label
                                        htmlFor={`${questionId}-${rating}`}
                                        className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                                    >
                                        {rating}
                                    </Label>

                                    <RadioGroupItem
                                        value={rating.toString()}
                                        id={`${questionId}-${rating}`}
                                        className={cn(
                                            "w-8 h-8 border-2 cursor-pointer transition-all duration-200",
                                            isSelected
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                                        )}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </RadioGroup>

                {/* Selected value indicator */}
                {value !== null && (
                    <div className="mt-3 text-center">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            Selected: {value}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
