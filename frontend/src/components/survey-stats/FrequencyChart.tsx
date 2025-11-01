import React from 'react'
import type { FrequencyDistribution } from '../../types/survey-stats'

interface FrequencyChartProps {
    distribution: FrequencyDistribution[]
    totalRespondents: number
    maxScore: number
}

/**
 * Component displaying frequency distribution as a bar chart
 */
export const FrequencyChart: React.FC<FrequencyChartProps> = ({
    distribution,
    totalRespondents,
    maxScore
}) => {
    // Check if all counts are zero
    const hasData = distribution.some(item => item.count > 0)

    return (
        <div className="rounded-md border p-3">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Answer Distribution</p>
                <p className="text-xs text-muted-foreground">Scale 1–{maxScore}</p>
            </div>

            {!hasData ? (
                <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        No responses recorded yet for this question.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {distribution.map((item) => (
                        <div key={item.value} className="grid grid-cols-12 items-center gap-2">
                            <div className="col-span-1 text-xs font-medium text-muted-foreground">
                                {item.value}
                            </div>

                            <div className="col-span-9">
                                <div className="h-3 rounded bg-muted relative overflow-hidden">
                                    {item.count > 0 && (
                                        <div
                                            className="h-full rounded bg-main transition-all duration-300 ease-out"
                                            style={{ width: `${item.percentage}%` }}
                                            aria-label={`Value ${item.value}: ${item.count} responses`}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="col-span-2 text-right text-xs tabular-nums">
                                <span className={item.count > 0 ? 'font-medium' : 'text-muted-foreground'}>
                                    {item.count}
                                </span>
                                {totalRespondents > 0 && item.count > 0 && (
                                    <span className="text-muted-foreground"> • {item.percentage.toFixed(1)}%</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
