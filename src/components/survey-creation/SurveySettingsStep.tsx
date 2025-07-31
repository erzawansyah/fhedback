"use client"

import { useSurveyCreationContext } from "@/context/SurveyCreationContext"
import { useCallback, useEffect } from "react"
import { createSurvey } from "@/lib/utils/createSurvey"
import { SurveySettingsType } from "./formSchema"
import { SurveySettingsForm } from "./SurveySettingsForm"

import { toast } from "sonner"
import { Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSurveySteps } from "@/hooks/useSurveyCreation"

export const SurveySettingsStep: React.FC = () => {
    // Survey creation context
    const { steps, setSurveyAddress } = useSurveyCreationContext()

    // State for transaction hash and creation process
    const {
        status,
        receipt,
        handleError,
        handleStatus,
        handleTxHash,
        handleSign,
        resetStatus,
    } = useSurveySteps()

    const disabled = steps.step1 || status === "success" || status === "loading" || status === "verifying" || status === "signing"

    /**
     * Callback to set survey address when contract is deployed
     * This will trigger the context to fetch survey data from blockchain
     */
    const setAddress = useCallback((address: `0x${string}` | undefined) => {
        if (address) {
            setSurveyAddress(address)
        }
    }, [setSurveyAddress])

    /**
     * Effect to set initial state based on existing survey configuration
     * If survey already exists, maintain success state to keep form disabled
     * If steps are reset, reset the status back to idle
     */
    useEffect(() => {
        if (steps.step1 && status === "idle") {
            handleStatus("success")
        } else if (!steps.step1 && (status === "success" || status === "error")) {
            // Reset status when steps are reset (resetSteps is called)
            resetStatus()
        }
    }, [steps.step1, status, handleStatus, resetStatus])

    /**
     * Effect to handle transaction receipt and extract contract address
     * When transaction is successful, extract deployed contract address from logs
     */
    useEffect(() => {
        if (receipt && status === "success") {
            // Extract contract address from transaction logs
            const contractAddress = receipt.logs?.[0]?.address || undefined
            if (contractAddress) {
                setAddress(contractAddress)
                toast.success("Survey created successfully! Contract address: " + contractAddress)
                // Status will remain "success" and address will be set, making form non-editable
            } else {
                handleStatus("error")
                handleError("Failed to retrieve contract address from transaction receipt.")
            }
        }
    }, [handleError, handleStatus, receipt, setAddress, status])

    /**
     * Handle form submission for creating survey on blockchain
     * This function will:
     * 1. Verify wallet connection
     * 2. Request user signature for verification
     * 3. Deploy survey contract to blockchain
     * 4. Monitor transaction status
     */
    const onSubmit = async (data: SurveySettingsType) => {
        try {
            // Step 1: Verify wallet ownership by requesting signature
            await handleSign()

            // Step 3: Deploy survey contract to blockchain
            const hash = await createSurvey(data)
            if (hash) {
                handleTxHash(hash)
                toast.success("Transaction sent! Waiting for confirmation... " + hash)
            } else {
                throw new Error("Failed to create survey. Please try again.")
            }
        } catch (error) {
            handleError(error instanceof Error ? error.message : "Unknown error")
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Step 1: Survey Settings
                </CardTitle>
                <p className="text-sm text-gray-600">
                    This is the first step. You will be asked to confirm in your wallet, and the entered data cannot be changed after this process.
                </p>
            </CardHeader>

            <CardContent>
                <SurveySettingsForm
                    disabled={disabled}
                    status={status}
                    onSubmit={onSubmit}
                />
            </CardContent>
        </Card>
    )
}
