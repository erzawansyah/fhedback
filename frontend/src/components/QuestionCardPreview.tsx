import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

type Question = {
    text: string;
    helperText?: string;
    id: number;
}

type QuestionCardPreviewProps = {
    index: number;
    question: Question;
    score: {
        min: number;
        max: number;
        minLabel: string;
        maxLabel: string;
    };
    storedResponse?: number; // Rating yang tersimpan jika ada
    onReveal?: () => void; // Callback untuk decrypt/reveal response
}

export default function QuestionCardPreview({ index, question: q, score, storedResponse, onReveal }: QuestionCardPreviewProps) {
    const { min, max, minLabel, maxLabel } = score;
    const [isRevealed, setIsRevealed] = useState(false);
    const hasStoredResponse = storedResponse !== undefined;

    const handleReveal = () => {
        if (onReveal) {
            onReveal();
        }
        setIsRevealed(true);
    };
    return (
        <Card className="bg-white">
            <CardHeader>
                <CardTitle className="text-lg md:text-2xl flex gap-3 items-center">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold bg-muted-foreground/60 shrink-0">
                        {index + 1}
                    </div>
                    {q.text}
                </CardTitle>
                {q.helperText && <p className="text-xs italic text-subtle">{q.helperText}</p>}
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
                {/* Desktop Layout */}
                <div className="hidden md:flex justify-between items-center text-sm">
                    <span className="text-base">{minLabel}</span>
                    <div className="flex gap-2">
                        {Array.from({ length: max - min + 1 }, (_, i) => {
                            const scoreValue = min + i
                            const isSelectedResponse = isRevealed && storedResponse === scoreValue
                            return (
                                <Button
                                    key={scoreValue}
                                    variant={isSelectedResponse ? "default" : "neutral"}
                                    size="icon"
                                    className={`w-12 h-12 rounded-full font-bold text-base ${isSelectedResponse ? 'ring-2 ring-offset-2 ring-main/50' : ''
                                        }`}
                                    disabled
                                >
                                    {scoreValue}
                                </Button>
                            )
                        })}
                    </div>
                    <span>{maxLabel}</span>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden space-y-3">
                    <div className="flex justify-between text-xs text-subtle">
                        <span>{minLabel}</span>
                        <span>{maxLabel}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: max - min + 1 }, (_, i) => {
                            const scoreValue = min + i
                            const isSelectedResponse = isRevealed && storedResponse === scoreValue
                            return (
                                <Button
                                    key={scoreValue}
                                    variant={isSelectedResponse ? "default" : "neutral"}
                                    size="icon"
                                    className={`w-full aspect-square rounded-full font-bold text-sm ${isSelectedResponse ? 'ring-2 ring-offset-2 ring-main/50' : ''
                                        }`}
                                    disabled
                                >
                                    {scoreValue}
                                </Button>
                            )
                        })}
                    </div>
                </div>

                {/* Tombol Reveal */}
                {hasStoredResponse && (
                    <div className="flex flex-col items-center gap-3 pt-4 border-t">
                        {!isRevealed ? (
                            <Button
                                onClick={handleReveal}
                                variant="neutral"
                                className="w-full max-w-xs border border-main/30 hover:bg-main/10"
                            >
                                🔓 Reveal Response
                            </Button>
                        ) : (
                            <div className="text-center space-y-2">
                                <Badge variant="default" className="animate-pulse">
                                    Response: {storedResponse}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                    Response has been decrypted and revealed
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
