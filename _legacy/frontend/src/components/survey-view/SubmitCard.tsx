import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Award, CheckCircle2, AlertCircle } from "lucide-react"

interface SubmitCardProps {
    progress: number
    canSubmit: boolean
    onSubmit: () => void
    isSubmitting: boolean
    questionsLength: number
    reward: number
}

const SubmitCard = ({
    progress,
    canSubmit,
    onSubmit,
    isSubmitting,
    questionsLength,
    reward
}: SubmitCardProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                    {canSubmit ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                    )}
                    <span>Progress</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Completion</span>
                        <span className="font-semibold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="text-xs text-gray-500 mt-1 text-center">
                        {Math.round((progress / 100) * questionsLength)} of {questionsLength} questions
                    </div>
                </div>

                <div className="text-sm">
                    {canSubmit ? (
                        <div className="text-green-600 font-medium">
                            ✓ Ready to submit!
                        </div>
                    ) : (
                        <div className="text-orange-600">
                            Complete all questions to submit
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <Button
                        onClick={onSubmit}
                        disabled={!canSubmit || isSubmitting}
                        size="lg"
                        className={`w-full h-12 text-base font-semibold ${canSubmit && !isSubmitting
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                            : ''
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Submitting...
                            </>
                        ) : canSubmit ? (
                            <>
                                Submit Survey
                                <Award className="w-4 h-4 ml-2" />
                            </>
                        ) : (
                            "Complete All Questions"
                        )}
                    </Button>

                    {canSubmit && !isSubmitting && (
                        <div className="text-xs text-green-600 font-medium text-center mt-2">
                            You&apos;ll earn {reward} tokens
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default SubmitCard
