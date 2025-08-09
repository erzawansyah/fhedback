"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Address } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";

interface SurveyCreationReceiptProps {
    txhash: Address;
    onError: (error: Error) => void;
    onSuccess: (contractAddress: Address) => void;
}

const SurveyCreationReceipt: React.FC<SurveyCreationReceiptProps> = ({ txhash, onError, onSuccess }) => {
    const [contractAddress, setContractAddress] = useState<Address | null>(null);
    const [loading, setLoading] = useState(true);
    const { data: receipt, status } = useWaitForTransactionReceipt({
        hash: txhash,

    });

    const handleError = useCallback((error: Error) => {
        setLoading(false);
        onError(error);
        toast.error(`Transaction failed: ${error.message}`);
    }, [onError]);

    const handleSuccess = useCallback((contractAddress: Address) => {
        setLoading(false);
        onSuccess(contractAddress);
        toast.success("Survey contract created successfully!");
    }, [onSuccess]);


    useEffect(() => {
        console.log(receipt);
        console.log("Transaction receipt status:", status);
        if (status === "error") {
            toast.error("Transaction failed. Please try again.")
            handleError(new Error("Transaction reverted"));
        }
        if (status === "success") {
            toast.success("Survey contract created successfully!");
            setContractAddress(receipt.contractAddress as Address);
        }
        setLoading(false);
    }, [receipt, status, handleError, handleSuccess]);


    useEffect(() => {
        if (contractAddress) {
            console.log("Survey contract created at:", contractAddress);
            handleSuccess(contractAddress);
        }
    }, [contractAddress, handleSuccess]);

    return (
        <>
            {
                loading && <div className="text-center text-subtle mt-4 italic font-bold">
                    <p>Transaction completed!</p >
                </div >
            }
        </>
    )
};

export default SurveyCreationReceipt;
