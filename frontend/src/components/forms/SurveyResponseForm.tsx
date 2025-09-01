import { useState, useMemo } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import type { Address } from 'viem'
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
    const [isSubmitting, setIsSubmitting] = useState(false)
    const writeContract = useWriteContract()

    const { data: receipt, isSuccess } = useWaitForTransactionReceipt({
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

    const onSubmit = async (data: ResponseFormData) => {
        try {
            setIsSubmitting(true)

            // Convert form data to array of encrypted responses
            const responses = questions.map((_: SurveyQuestion, index: number) => {
                return data[`question_${index}`]
            })

            console.log('Submitting responses:', responses)

            // Call the smart contract function
            writeContract.writeContract({
                address: surveyAddress,
                abi: ABIS.survey,
                functionName: 'submitResponse',
                args: [responses], // This will be encrypted by the FHE library
            })

            toast.success('Response submitted!', {
                description: 'Your encrypted response has been recorded on-chain.'
            })

        } catch (error) {
            console.error('Error submitting response:', error)
            toast.error('Failed to submit response', {
                description: 'Please try again or contact support.'
            })
        } finally {
            setIsSubmitting(false)
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
                            disabled={isSubmitting || writeContract.isPending}
                            size="lg"
                        >
                            {isSubmitting || writeContract.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting Response...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Response
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Privacy Notice */}
                    <Alert>
                        <AlertDescription>
                            🔐 <strong>Privacy Notice:</strong> Your responses are encrypted using Fully Homomorphic Encryption (FHE)
                            before being submitted. Only aggregate statistics will be available to the survey creator,
                            ensuring your individual responses remain completely private.
                        </AlertDescription>
                    </Alert>
                </form>
            </Form>
        </Section>
    )
}
