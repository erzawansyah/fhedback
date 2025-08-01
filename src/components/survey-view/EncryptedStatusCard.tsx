"use client"
import {
    QUESTIONNAIRE_FACTORY_ABI as abi,
    QUESTIONNAIRE_FACTORY_ADDRESS as factoryAddress
} from "@/lib/contracts"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield } from "lucide-react"
import { useEffect, useState } from "react"
import { Address } from "viem"
import { useReadContract } from "wagmi"

interface EncryptedStatusCardProps {
    address: Address
}


export const EncryptedStatusCard = ({ address }: EncryptedStatusCardProps) => {
    const [isEncrypted, setIsEncrypted] = useState<boolean | null>(null)
    const { data, isLoading, error } = useReadContract({
        address: factoryAddress,
        abi: abi,
        functionName: "getQuestionnaireType",
        args: [address],
        query: {
            enabled: !!address,
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        }
    })

    useEffect(() => {
        if (!isLoading) {
            if (data !== undefined && !error) {
                // Convert data to number and check if it equals 1 (encrypted)
                const surveyType = Number(data)
                setIsEncrypted(surveyType === 1)
                console.log('Survey type:', surveyType, 'Is encrypted:', surveyType === 1)
            } else if (error) {
                console.error('Error fetching survey type:', error)
                setIsEncrypted(false)
            }
        }
    }, [data, isLoading, error])

    if (isLoading && isEncrypted === null) {
        return (
            <Alert className="animate-pulse">
                <Shield className="h-4 w-4" />
                <AlertTitle>Loading survey status...</AlertTitle>
                <AlertDescription>
                    Checking encryption status for contract <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
                </AlertDescription>
            </Alert>
        )
    }

    if (isEncrypted) {
        return (
            <Alert className="bg-info">
                <Shield className="h-4 w-4 text-foreground" />
                <AlertTitle className="text-foreground">FHE Powered Survey</AlertTitle>
                <AlertDescription className="flex flex-wrap gap-x-1 items-center text-foreground">
                    Data is encrypted & private. Only <span className="font-semibold inline">respondents</span> can view the original data.
                    <span className="font-semibold inline">Survey owners</span> can only perform aggregate calculations without access to raw data.
                    Contract: <span className="font-mono inline">{address.slice(0, 6)}...{address.slice(-4)}</span>
                </AlertDescription>
            </Alert>
        )
    }

    // Default to non-encrypted (includes error cases and type 0)
    return (
        <Alert variant="destructive" className="bg-danger">
            <Shield className="h-4 w-4" />
            <AlertTitle>Non-Encrypted Survey</AlertTitle>
            <AlertDescription>
                Survey data can be accessed by the survey owner. No encryption, raw data is visible to the owner. Contract: <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
                {error && <span className="block mt-1">Note: Error reading contract type</span>}
            </AlertDescription>
        </Alert>
    )
}
