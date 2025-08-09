import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/shadcn/utils"
import PlainBox from "../layout/plain-box"

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
        <Card className="bg-background">
            <CardHeader className="flex justify-between items-start">
                <div className="flex items-start space-x-2">
                    {questionNumber && (
                        <Badge
                            variant={value !== null ? "default" : "neutral"}
                            className="shrink-0 mt-0.5 text-xs"
                        >
                            {questionNumber}
                        </Badge>
                    )}
                    <div className="flex-1">
                        <Label className="font-bold text-xl leading-snug text-foreground">
                            {question}
                            {required && (
                                <span className="text-red-500 ml-1">*</span>
                            )}
                        </Label>
                    </div>
                </div>
                {/* Selected value indicator */}
                {value !== null && (
                    <Badge>
                        Selected: {value}
                    </Badge>
                )}
            </CardHeader>

            <CardContent className="pt-0 space-y-2">
                {/* Scale indicator */}
                <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-base italic font-semibold">{minLabel}</span>
                    <span className="text-base italic font-semibold">{maxLabel}</span>
                </div>

                <RadioGroup
                    value={value?.toString() || ""}
                    onValueChange={(val) => onChange(parseInt(val))}
                >
                    <PlainBox className="flex justify-between gap-1 p-4">
                        {Array.from({ length: scale }, (_, i) => i + 1).map((rating) => {
                            const isSelected = value === rating

                            return (
                                <div
                                    key={rating}
                                    className="flex flex-col items-center space-y-1 flex-1"
                                >
                                    <Label
                                        htmlFor={`${questionId}-${rating}`}
                                        className="text-xs font-semibold cursor-pointer transition-colors"
                                    >
                                        {rating}
                                    </Label>

                                    <RadioGroupItem
                                        value={rating.toString()}
                                        id={`${questionId}-${rating}`}
                                        className={cn(
                                            "w-6 h-6 cursor-pointer transition-all duration-200 rounded-base",
                                            isSelected
                                                ? "border-main bg-background"
                                                : "border-main hover:border-background hover:bg-main"
                                        )}
                                    />
                                </div>
                            )
                        })}
                    </PlainBox>
                </RadioGroup>


            </CardContent>
        </Card>
    )
}
