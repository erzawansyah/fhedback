import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

type Question = {
    text: string;
    helperText?: string;
    id: number;
}

type QuestionCardProps = {
    index: number;
    selected?: number;
    question: Question;
    score: {
        min: number;
        max: number;
        minLabel: string;
        maxLabel: string;
    }
    handleRating: (qid: number, rating: number) => void;
}

export default function QuestionCard({ index, question: q, score, selected, handleRating }: QuestionCardProps) {
    const { min, max, minLabel, maxLabel } = score;
    return (
        <Card className={`bg-white ${selected ? 'ring-2 ring-main/20' : ''}`}>
            <CardHeader>
                <CardTitle className="text-2xl flex gap-3 items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold ${selected ? 'bg-main' : 'bg-muted-foreground/60'}`}>
                        {selected ? '✓' : index + 1}
                    </div>
                    {q.text}
                </CardTitle>
                {q.helperText && <p className="text-xs italic text-subtle">{q.helperText}</p>}
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-base">{minLabel}</span>
                    <div className="flex gap-2">
                        {Array.from({ length: max - min + 1 }, (_, i) => {
                            const score = min + i
                            const isSelected = selected === score
                            return (
                                <Button
                                    key={score}
                                    onClick={() => handleRating(q.id, score)}
                                    variant={isSelected ? "default" : "neutral"}
                                    size="icon"
                                    className={`w-12 h-12 rounded-full font-bold text-base ${isSelected ? 'ring-2 ring-offset-2 ring-main/50' : ''}`}
                                >
                                    {score}
                                </Button>
                            )
                        })}
                    </div>
                    <span>{maxLabel}</span>
                </div>
                {selected && (
                    <div className="text-center">
                        <Badge variant="neutral" className="animate-pulse">
                            Rating: {selected}
                        </Badge>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
