import { useState, useMemo, useEffect } from 'react'
import type { Address } from 'viem'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { ABIS } from '../../services/contracts'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Button } from '../ui/button'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Slider } from '../ui/slider'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import Section from '../layout/Section'
import { Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

import type { SurveyQuestion, NominalLabel } from '../../types/survey.schema'
import { useFhevm } from '@/hooks/useFhevm'
import { useAccount } from 'wagmi'

interface SurveyResponseFormProps {
    surveyAddress: Address
    questions: SurveyQuestion[]
    onSubmitSuccess?: () => void
}

// Create dynamic schema based on questions
function createResponseSchema(questions: SurveyQuestion[]) {
    const schemaFields: Record<string, z.ZodType> = {}

    questions.forEach((question: SurveyQuestion, index: number) => {
        if (question.response.type === 'scale') {
            schemaFields[`question_${index}`] = z.number()
                .min(question.response.minScore, `Minimum score is ${question.response.minScore}`)
                .max(question.response.maxScore, `Maximum score is ${question.response.maxScore}`)
        } else if (question.response.type === 'nominal') {
            schemaFields[`question_${index}`] = z.number()
                .min(1, 'Please select an option')
                .max(question.response.labels?.length || 4, 'Invalid option selected')
        }
    })

    return z.object(schemaFields)
}

type ResponseFormData = Record<string, number>

export default function SurveyResponseForm({
    surveyAddress,
    questions,
    onSubmitSuccess
}: SurveyResponseFormProps) {
    type Step = 'idle' | 'encrypting' | 'submitting' | 'confirming'
    const [step, setStep] = useState<Step>('idle')
    const writeContract = useWriteContract()
    const { address } = useAccount()
    type EIP1193Provider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }
    const provider = (globalThis as unknown as { ethereum?: EIP1193Provider }).ethereum
    const { instance: fhevmInstance, status: fhevmStatus } = useFhevm({ provider })

    const { data: receipt, isSuccess, isLoading: isConfirming, isError: isTxError, error: txError } = useWaitForTransactionReceipt({
        hash: writeContract.data,
        query: { enabled: !!writeContract.data }
    })

    const responseSchema = useMemo(() => createResponseSchema(questions), [questions])

    const form = useForm<ResponseFormData>({
        resolver: zodResolver(responseSchema),
        defaultValues: questions.reduce((acc: ResponseFormData, question: SurveyQuestion, index: number) => {
            acc[`question_${index}`] = question.response.type === 'scale'
                ? question.response.minScore
                : 1
            return acc
        }, {} as ResponseFormData)
    })

    const canSubmit = useMemo(() => {
        return Boolean(address) && fhevmStatus === 'ready' && step === 'idle' && !writeContract.isPending
    }, [address, fhevmStatus, step, writeContract.isPending])

    // Reflect write/receipt states to step machine
    useEffect(() => {
        if (writeContract.data) setStep('confirming')
    }, [writeContract.data])
    useEffect(() => {
        if (isConfirming) setStep('confirming')
    }, [isConfirming])

    const onSubmit = async (data: ResponseFormData) => {
        try {
            setStep('encrypting')

            // Collect clear responses as uint8
            const clearValues: number[] = questions.map((_: SurveyQuestion, index: number) => {
                return Number(data[`question_${index}`])
            })

            if (!address) {
                toast.error('Connect wallet to submit response')
                return
            }

            if (!fhevmInstance) {
                toast.error('FHEVM SDK not ready yet')
                return
            }

            // Tiny yield so UI can render spinner before heavy work
            await new Promise((r) => setTimeout(r, 30))

            const buffer = fhevmInstance.createEncryptedInput(surveyAddress as Address, address as Address)
            for (const v of clearValues) buffer.add8(BigInt(v))
            const ciphertexts = await buffer.encrypt().catch((e: unknown) => {
                console.error('FHE encrypt failed:', e)
                throw new Error('Encryption failed')
            }) as unknown as { handles: `0x${string}`[]; inputProof: `0x${string}` }
            const { handles, inputProof } = ciphertexts

            // Call the smart contract function with encrypted handles and proof
            setStep('submitting')
            try {
                await writeContract.writeContract({
                    address: surveyAddress,
                    abi: ABIS.survey,
                    functionName: 'submitResponses',
                    args: [handles, inputProof],
                })
            } catch (e) {
                console.error('Contract write failed:', e)
                throw e
            }

            toast.success('Response submitted!', {
                description: 'Your encrypted response has been recorded on-chain.'
            })

        } catch (error) {
            console.error('Error submitting response:', error)
            toast.error('Failed to submit response', {
                description: 'Please try again or contact support.'
            })
            setStep('idle')
        }
    }

    // Handle successful transaction
    if (isSuccess && receipt) {
        onSubmitSuccess?.()
        return (
            <Section variant="highlighted">
                <div className="text-center py-8">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Send className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Response Submitted Successfully!</h3>
                    <p className="text-muted-foreground mb-4">
                        Thank you for participating in this confidential survey. Your responses have been encrypted and stored securely.
                    </p>
                    <Badge variant="neutral">
                        Transaction: {receipt.transactionHash.slice(0, 8)}...{receipt.transactionHash.slice(-6)}
                    </Badge>
                </div>
            </Section>
        )
    }

    return (
        <Section title="Survey Questions" description="Your responses will be encrypted and kept confidential">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {questions.map((question: SurveyQuestion, index: number) => (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Question {index + 1}
                                </CardTitle>
                                <p className="text-muted-foreground">{question.text}</p>
                                {question.helperText && (
                                    <p className="text-sm text-muted-foreground italic">
                                        {question.helperText}
                                    </p>
                                )}
                            </CardHeader>

                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name={`question_${index}`}
                                    render={({ field }) => (
                                        <FormItem>
                                            {question.response.type === 'scale' ? (
                                                // Scale Question (Slider)
                                                <div className="space-y-4">
                                                    <div className="flex justify-between text-sm text-muted-foreground">
                                                        <span>{question.response.minLabel || `${question.response.minScore}`}</span>
                                                        <span>{question.response.maxLabel || `${question.response.maxScore}`}</span>
                                                    </div>

                                                    <FormControl>
                                                        <div className="px-4">
                                                            <Slider
                                                                min={question.response.minScore}
                                                                max={question.response.maxScore}
                                                                step={1}
                                                                value={[field.value]}
                                                                onValueChange={(value) => field.onChange(value[0])}
                                                                className="w-full"
                                                            />
                                                        </div>
                                                    </FormControl>

                                                    <div className="text-center">
                                                        <Badge variant="neutral">
                                                            Selected: {field.value}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Nominal Question (Radio buttons)
                                                <FormControl>
                                                    <RadioGroup
                                                        value={field.value.toString()}
                                                        onValueChange={(value: string) => field.onChange(parseInt(value))}
                                                        className="space-y-3"
                                                    >
                                                        {question.response.labels?.map((label: NominalLabel, labelIndex: number) => (
                                                            <div
                                                                key={label.id}
                                                                className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                                            >
                                                                <RadioGroupItem
                                                                    value={(labelIndex + 1).toString()}
                                                                    id={`question_${index}_option_${labelIndex}`}
                                                                />
                                                                <FormLabel
                                                                    htmlFor={`question_${index}_option_${labelIndex}`}
                                                                    className="flex-1 cursor-pointer"
                                                                >
                                                                    {label.text}
                                                                </FormLabel>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </FormControl>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    ))}

                                        {/* Submit Button */}
                                        <div className="flex justify-end pt-6">
                        <Button
                            type="submit"
                disabled={!canSubmit}
                            size="lg"
                        >
                                                        {step !== 'idle' || writeContract.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                        {(!address)
                                                                            ? 'Connect wallet'
                                                                            : (fhevmStatus !== 'ready')
                                                                            ? 'Preparing FHEVM…'
                                                                            : step === 'encrypting'
                                                                            ? 'Encrypting…'
                                                                            : step === 'submitting'
                                                                            ? 'Submitting…'
                                                                            : 'Confirming…'}
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Response
                                </>
                            )}
                        </Button>
                    </div>

                                        {isTxError && (
                                                <p className="text-xs text-red-600">Transaction failed: {String(txError?.message || txError)}</p>
                                        )}

                    {/* Privacy Notice */}
                    <Alert>
                        <AlertDescription>
                            🔐 <strong>Privacy Notice:</strong> Your responses are encrypted using Fully Homomorphic Encryption (FHE)
                            before being submitted. Only aggregate statistics will be available to the survey creator,
                            ensuring your individual responses remain completely private.
                        </AlertDescription>
                    </Alert>
                    {fhevmStatus !== 'ready' && (
                        <p className="text-xs text-muted-foreground">Preparing FHEVM SDK…</p>
                    )}
                </form>
            </Form>
        </Section>
    )
}
