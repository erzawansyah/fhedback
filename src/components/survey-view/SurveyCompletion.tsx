import { CheckCircle, Award, Sparkles, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SurveyCompletionProps {
    reward: number
    onContinue: () => void
}

export const SurveyCompletion = ({ reward, onContinue }: SurveyCompletionProps) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
            <Card className="w-full max-w-md text-center animate-fade-in celebrate shadow-2xl border-2 border-green-200">
                <CardHeader className="pb-6">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-lg">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        🎉 Survey Completed! 🎉
                    </CardTitle>
                    <div className="flex justify-center space-x-2 mt-2">
                        <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                        <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Thank you for your valuable feedback! Your response has been securely recorded on the blockchain.
                    </p>

                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-200 animate-pulse-glow">
                        <div className="flex items-center justify-center space-x-3 text-lg">
                            <Trophy className="w-6 h-6 text-yellow-600" />
                            <span className="font-bold text-yellow-800">Reward Earned:</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 mt-2">
                            <Award className="w-8 h-8 text-yellow-600 animate-spin" style={{ animationDuration: '3s' }} />
                            <span className="text-3xl font-bold text-yellow-700">+{reward}</span>
                            <span className="text-lg text-yellow-600">tokens</span>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>✅ Response submitted successfully</p>
                        <p>🔐 Data encrypted and stored securely</p>
                        <p>💰 Tokens will be credited to your wallet</p>
                    </div>

                    <Button
                        onClick={onContinue}
                        className="w-full text-lg py-6 submit-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                        size="lg"
                    >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Explore More Surveys
                        <Sparkles className="w-5 h-5 ml-2" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
