import React from 'react'
import type {
    EncryptedQuestionStats,
    DecryptedQuestionStats
} from '../../types/survey-stats'
import {
    calculateStats,
    prepareFrequencyDistribution,
    getFrequencyRange
} from '../../utils/stats-calculations'
import { StatsKPIs } from './StatsKPIs'
import { FrequencyChart } from './FrequencyChart'

interface StatsDetailsProps {
    stats: EncryptedQuestionStats
    decrypted: DecryptedQuestionStats | null
    maxScore: number
}

/**
 * Component displaying detailed statistics and distribution
 */
export const StatsDetails: React.FC<StatsDetailsProps> = ({
    stats,
    decrypted,
    maxScore
}) => {
    const hasFrequencies = decrypted?.frequencies &&
        Object.keys(decrypted.frequencies).length > 0

    // Calculate KPIs
    const computedStats = decrypted?.descriptive
        ? calculateStats(
            decrypted.descriptive,
            stats.totalRespondents,
            decrypted.frequencies,
            maxScore
        )
        : null

    // Prepare frequency distribution
    const distribution = hasFrequencies && decrypted?.frequencies
        ? prepareFrequencyDistribution(
            decrypted.frequencies,
            stats.totalRespondents
        )
        : null

    // Calculate min/max from frequencies
    const range = hasFrequencies && decrypted?.frequencies
        ? getFrequencyRange(decrypted.frequencies)
        : { min: null, max: null }

    const minValue = range.min ?? 0
    const maxValue = range.max ?? 0

    return (
        <>
            <p className="font-light italic text-xs mt-4 mb-1">Responses:</p>
            <div className="space-y-4">
                {computedStats && (
                    <StatsKPIs
                        stats={{
                            ...computedStats,
                            minValue,
                            maxValue
                        }}
                    />
                )}

                {distribution ? (
                    <FrequencyChart
                        distribution={distribution}
                        totalRespondents={stats.totalRespondents}
                        maxScore={maxScore}
                    />
                ) : (
                    <div className="rounded-md border p-3">
                        <p className="text-sm text-muted-foreground">
                            Answer distribution is not available. Grant decrypt access to see per-value frequencies.
                        </p>
                    </div>
                )}
            </div>
        </>
    )
}
