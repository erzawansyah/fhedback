import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

interface SurveyQuestion {
    id: string
    type: "text" | "multiple-choice" | "rating" | "boolean"
    question: string
    required: boolean
    options?: string[]
}

interface QuestionRendererProps {
    question: SurveyQuestion
    currentResponse: string | string[]
    onResponseChange: (questionId: string, answer: string | string[]) => void
}

export const QuestionRenderer = ({ question, currentResponse, onResponseChange }: QuestionRendererProps) => {
    const updateResponse = (answer: string | string[]) => {
        onResponseChange(question.id, answer)
    }

    switch (question.type) {
        case "text":
            return (
                <div className="space-y-3">
                    <Label htmlFor={question.id}>{question.question}</Label>
                    <Input
                        id={question.id}
                        placeholder="Type your answer here..."
                        value={currentResponse as string}
                        onChange={(e) => updateResponse(e.target.value)}
                    />
                </div>
            )

        case "multiple-choice":
            if (question.question.includes("Select all")) {
                // Multi-select checkbox
                const selectedOptions = currentResponse as string[]
                return (
                    <div className="space-y-3">
                        <Label>{question.question}</Label>
                        <div className="space-y-2">
                            {question.options?.map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`${question.id}-${option}`}
                                        checked={selectedOptions.includes(option)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                updateResponse([...selectedOptions, option])
                                            } else {
                                                updateResponse(selectedOptions.filter(o => o !== option))
                                            }
                                        }}
                                    />
                                    <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            } else {
                // Single select radio
                return (
                    <div className="space-y-3">
                        <Label>{question.question}</Label>
                        <RadioGroup
                            value={currentResponse as string}
                            onValueChange={(value) => updateResponse(value)}
                        >
                            {question.options?.map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                                    <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                )
            }

        case "rating":
            return (
                <div className="space-y-3">
                    <Label>{question.question}</Label>
                    <RadioGroup
                        value={currentResponse as string}
                        onValueChange={(value) => updateResponse(value)}
                    >
                        <div className="flex space-x-4">
                            {question.options?.map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                                    <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                                </div>
                            ))}
                        </div>
                    </RadioGroup>
                </div>
            )

        case "boolean":
            return (
                <div className="space-y-3">
                    <Label>{question.question}</Label>
                    <RadioGroup
                        value={currentResponse as string}
                        onValueChange={(value) => updateResponse(value)}
                    >
                        <div className="flex space-x-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                                <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id={`${question.id}-no`} />
                                <Label htmlFor={`${question.id}-no`}>No</Label>
                            </div>
                        </div>
                    </RadioGroup>
                </div>
            )

        default:
            return null
    }
}
