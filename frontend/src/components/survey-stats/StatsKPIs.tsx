import React from 'react'
import type { ComputedStats } from '../../types/survey-stats'

interface StatsKPIsProps {
    stats: ComputedStats
}

/**
 * Component displaying key performance indicators as cards
 */
export const StatsKPIs: React.FC<StatsKPIsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">Respondents</div>
                <div className="text-base font-semibold tabular-nums">
                    {stats.respondents}
                </div>
            </div>

            <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">Mean</div>
                <div className="text-base font-semibold tabular-nums">
                    {stats.mean.toFixed(2)}
                </div>
            </div>

            <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">Std Dev</div>
                <div className="text-base font-semibold tabular-nums">
                    {stats.stdDev.toFixed(2)}
                </div>
            </div>

            <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">Range</div>
                <div className="text-base font-semibold tabular-nums">
                    {stats.minValue}–{stats.maxValue}
                </div>
            </div>

            <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">Top-box</div>
                <div className="text-base font-semibold tabular-nums">
                    {stats.topBoxPercentage.toFixed(1)}%
                </div>
            </div>
        </div>
    )
}
