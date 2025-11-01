import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import type { QuestionStats } from '../../types/survey-stats'
import { useQuestionStats } from '../../hooks/useQuestionStats'
import { useQuestionDecryption } from '../../hooks/useQuestionDecryption'
import { DecryptButton } from './DecryptButton'
import { StatsDetails } from './StatsDetails'
import { useSurveyView } from '../../hooks/useSurveyView'
import type { Address } from 'viem'

/**
 * Card component displaying statistics for a single question
 */
export const QuestionStatCard: React.FC<QuestionStats> = ({
    index,
    text,
    helperText,
    contractAddress
}) => {
    const { stats, isLoading, maxScore } = useQuestionStats(contractAddress, index)
    const { isOwner } = useSurveyView(contractAddress as Address)
    const {
        isDecrypted,
        decryptedData,
        isProcessing,
        isGranted,
        isWaitingForTx,
        handleDecrypt,
        grantAccess,
    } = useQuestionDecryption(contractAddress, index, stats)

    // Handle grant access button click
    const handleGrantClick = async () => {
        try {
            await grantAccess(isOwner ? "owner" : "respondent")
        } catch (error) {
            console.error('Error granting access:', error)
        }
    }

    // Handle decrypt button click
    const handleDecryptClick = async () => {
        try {
            await handleDecrypt()
        } catch (error) {
            console.error('Error decrypting:', error)
        }
    }


    return (
        <Card className="bg-secondary-background">
            <CardContent>
                <div className="flex items-center space-x-3 mb-2">
                    <Badge>{`Q${index + 1}`}</Badge>
                    <h4 className="text-lg font-medium">{text}</h4>
                </div>

                {helperText && (
                    <p className="text-xs text-muted-foreground mb-2">{helperText}</p>
                )}

                {isLoading || !stats ? (
                    <p className="mt-3 text-sm text-muted-foreground">Loading stats…</p>
                ) : !isGranted ? (
                    // Step 1: Grant access first
                    <DecryptButton
                        onClick={handleGrantClick}
                        isProcessing={isProcessing || isWaitingForTx}
                        buttonText="Grant Access"
                        buttonTextProcessing={isWaitingForTx ? "Waiting for confirmation…" : "Granting…"}
                    />
                ) : !isDecrypted ? (
                    // Step 2: Decrypt after access granted
                    <>
                        <p className="text-xs text-green-600 mb-3">Access granted ✅</p>
                        <DecryptButton
                            onClick={handleDecryptClick}
                            isProcessing={isProcessing}
                            buttonText="Decrypt Stats"
                            buttonTextProcessing="Decrypting…"
                        />
                    </>
                ) : (
                    <StatsDetails
                        stats={stats}
                        decrypted={decryptedData}
                        maxScore={maxScore}
                    />
                )}
            </CardContent>
        </Card>
    )
}
