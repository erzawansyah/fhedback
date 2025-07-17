import { FC, useState, useCallback, useEffect } from "react";
import { Loader2, ShieldCheck, FileSignature, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateSignMessage } from "@/utils/signatureHandler";
import { Address } from "viem";
import { useSignMessage, useAccount } from 'wagmi';
import { verifySignature } from "@/utils/verifySignature";
import { toast } from "sonner";
import { CreateSurveyFormSchema } from "@/app/survey/create/page";
import { createSurvey } from "@/utils/createSurvey";


// Type
type StepsName = "idle" | "sign" | "encrypt" | "transaction" | "finalize";
type StepStatus = "pending" | "loading" | "success" | "error";

interface StepInterface {
    name: StepsName;
    title: string;
    description: string;
    status: StepStatus;
    hasButton: boolean;
    buttonText?: string;
    action: () => Promise<StepStatus>; // Action per step
    errorMessage?: string;
}

interface CreateSurveyHandlerState {
    signed: boolean
    txHash: `0x${string}` | null
    contractAddress: `0x${string}` | null
    setSigned: React.Dispatch<React.SetStateAction<boolean>>
    setTxHash: React.Dispatch<React.SetStateAction<`0x${string}` | null>>
    setContractAddress: React.Dispatch<React.SetStateAction<`0x${string}` | null>>
}

interface CreateSurveyHandlerProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    formValues: CreateSurveyFormSchema
    newSurveyState: CreateSurveyHandlerState
    onComplete?: () => void;
}

const StepComponent: FC<Omit<StepInterface, 'action'> & { onButtonClick?: () => void }> = ({
    name,
    title,
    description,
    status,
    hasButton,
    buttonText = "Next",
    onButtonClick,
}) => {
    const getIcon = () => {
        switch (name) {
            case "sign":
                return <FileSignature className="w-8 h-8" />;
            case "encrypt":
                return <ShieldCheck className="w-8 h-8" />;
            case "transaction":
                return <ArrowRight className="w-8 h-8" />;
            case "finalize":
                return <CheckCircle2 className="w-8 h-8" />;
            default:
                return <Loader2 className="w-8 h-8" />;
        }
    };

    let statusClass = "";
    if (status === "success") statusClass = "text-green-600";
    else if (status === "error") statusClass = "text-red-600";
    else if (status === "loading") statusClass = "animate-spin text-blue-500";

    return (
        <div id={`step-${name}`} className="flex gap-4 items-start mb-4">
            <span className={statusClass}>{getIcon()}</span>
            <div className="grow">
                <h4 className="font-semibold">{title}</h4>
                <p className="text-subtle text-xs">{description}</p>
                {hasButton && (
                    <Button
                        onClick={onButtonClick}
                        size="sm"
                        className="mt-2"
                        disabled={status === "loading" || status === "success"}
                    >
                        {status === "loading" ? "Processing..." : buttonText}
                    </Button>
                )}
                {status === "error" && (
                    <div className="text-xs text-red-500 mt-1">Terjadi error.</div>
                )}
                {status === "success" && (
                    <div className="text-xs text-green-600 mt-1">Berhasil!</div>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export const CreateSurveyHandler: FC<CreateSurveyHandlerProps> = ({
    isOpen,
    setIsOpen,
    formValues,
    onComplete,
    newSurveyState: {
        signed, setSigned, txHash, setTxHash
    }
}) => {
    const [activeStep, setActiveStep] = useState(0);
    const [steps, setSteps] = useState<StepInterface[]>([]);
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const handleStepError = (stepIndex: number, value: string) => {
        setSteps((prev) =>
            prev.map((step, idx) =>
                idx === stepIndex
                    ? { ...step, errorMessage: value }
                    : step
            )
        );
    }



    // Step actions (simulasi, ganti dengan logic asli sesuai kebutuhanmu)
    const stepActions: (() => Promise<StepStatus>)[] = [
        // action for sign message
        async (): Promise<StepStatus> => {
            if (signed) {
                return "success"
            }
            const { messages } = generateSignMessage(address as Address, "Survey Contract Deployment")
            try {
                const signature = await signMessageAsync({
                    message: messages
                })
                const isSuccess = await verifySignature({
                    message: messages,
                    signature: signature,
                    expectedAddress: address!
                })
                await new Promise((r) => setTimeout(r, 700))

                if (isSuccess) {
                    setSigned(true)
                    toast.success("Authentication Success")
                    return "success"
                } else {
                    toast.error("Failed to verify wallet")
                    throw new Error("Wallet not verified")
                }
            } catch (error) {
                const errorMessage = error ? error.toString() : "Failed to verify wallet"
                toast.error(errorMessage)
                handleStepError(0, errorMessage)
                return "error"
            }
        },

        // action for encrypt form values
        async (): Promise<StepStatus> => {
            // This phase will use to encrypt form value using FHEVM Relayer SDK
            await new Promise((r) => setTimeout(r, 3000));
            return "success";
        },

        // action for submit transactions
        async (): Promise<StepStatus> => {
            const data = formValues
            try {
                const txHashResult = await createSurvey(
                    data.title,
                    data.scaleLimit,
                    data.totalQuestions,
                    data.respondentLimit
                )
                if (txHashResult) {
                    toast.success("Transaction Submitted", {
                        description: <p className="text-subtle text-xs">
                            `Your transaction has been submitted.<br />
                            <a href={`https://sepolia.etherscan.io/tx/${txHashResult}`} target="__blank">${txHashResult}</a>`
                        </p>
                    })
                    setTxHash(txHash)
                    return "success"
                } else {
                    throw new Error("Transaction failed to submit")
                }
            } catch (error) {
                toast.error(error ? error.toString() : "Your transaction failed to submit")
                return "error"
            }
        },

        // action for finalization (waiting tx status)
        async (): Promise<StepStatus> => {
            await new Promise((r) => setTimeout(r, 500));
            return "success";
        },
    ];

    // Handler utama: menjalankan action
    const handleStepAction = useCallback(async (stepIndex: number) => {
        setSteps((prev) =>
            prev.map((step, idx) =>
                idx === stepIndex
                    ? { ...step, status: "loading" }
                    : step
            )
        );
        const result = await steps[stepIndex].action();
        setSteps((prev) =>
            prev.map((step, idx) =>
                idx === stepIndex
                    ? { ...step, status: result }
                    : step
            )
        );
        if (result === "success") {
            // Lanjut step berikutnya jika masih ada
            if (stepIndex < steps.length - 1) {
                setActiveStep(stepIndex + 1);
            } else if (onComplete) {
                onComplete();
            }
        }
        // Jika error, tetap di step sekarang
    }, [steps, onComplete]);

    // Reset steps tiap buka
    useEffect(() => {
        if (isOpen) {
            setActiveStep(0);
            setSteps([
                {
                    name: "sign",
                    title: "Authenticate Your Wallet",
                    description: "Sign a unique message to securely verify your wallet ownership. This keeps your account safe and private.",
                    status: "pending",
                    hasButton: true,
                    buttonText: "Sign Message",
                    action: stepActions[0],
                },
                {
                    name: "encrypt",
                    title: "Encrypt Survey Data",
                    description: "Encrypt your survey data to ensure privacy and security before submitting it to the blockchain.",
                    status: "pending",
                    hasButton: false,
                    action: stepActions[1],
                },
                {
                    name: "transaction",
                    title: "Submit Transaction",
                    description: "Send the encrypted survey data to the blockchain. This step will require a transaction confirmation.",
                    status: "pending",
                    hasButton: true,
                    buttonText: "Submit Transaction",
                    action: stepActions[2],
                },
                {
                    name: "finalize",
                    title: "Finalize",
                    description: "Finalize the process and confirm your survey has been created successfully.",
                    status: "pending",
                    hasButton: false,
                    action: stepActions[3],
                }
            ]);
        }
        // eslint-disable-next-line
    }, [isOpen]);

    // Jalankan otomatis jika step tanpa button
    useEffect(() => {
        if (!isOpen) return;
        const step = steps[activeStep];
        if (!step) return;
        if (!step.hasButton && step.status === "pending") {
            handleStepAction(activeStep);
        }
        // eslint-disable-next-line
    }, [isOpen, activeStep, steps]);

    if (!isOpen) return null;

    return (
        <div className="p-6 rounded w-full max-w-lg">
            {steps.map((step, idx) => (
                <StepComponent
                    key={step.name}
                    {...step}
                    hasButton={step.hasButton && activeStep === idx}
                    onButtonClick={() => handleStepAction(idx)}
                />
            ))}
            <div className="flex gap-2 mt-4 justify-end">
                <Button
                    variant="neutral"
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                >
                    Cancel
                </Button>
                <Button
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};
