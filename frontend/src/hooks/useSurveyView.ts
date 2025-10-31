import type { Abi, Address } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { useSurveyDataByAddress } from "./useSurveyData";
import { ABIS } from "../services/contracts";
import { useMemo } from "react";


const surveyAbi = ABIS.survey as Abi;

interface UseSurveyViewResult {
    account: ReturnType<typeof useAccount>;
    data: ReturnType<typeof useSurveyDataByAddress>;
    isOwner: boolean;
    isActive: boolean;
    hasResponded: boolean;
    totalRespondent: number;
}


/**
 * Page survey/view/$addr memiliki sejumlah kondisi dan logika yang kompleks, terkait dengan kepemilikan survey, akses pengguna, dan status survey.
 * Kondisi-kondisi tersebut antara lain, yang perlu dicek adalah:
 * - Apakah pengguna pemilik survey atau responden?
 * - Apakah survey masih aktif atau sudah ditutup?
 * - Apakah pengguna sudah menjawab survey atau belum?
 */
export const useSurveyView = (addr: Address): UseSurveyViewResult => {
    const account = useAccount();
    const data = useSurveyDataByAddress(addr);
    const { data: hasResponded} = useReadContract({
        address: addr,
        abi: surveyAbi,
        functionName: 'getHasResponded',
        args: [account.address],
        query: {
            enabled: !!account.address,
        }
    })
    const { data: currentRespondent} = useReadContract({
        address: addr,
        abi: surveyAbi,
        functionName: 'getTotalRespondents',
        query: {
            enabled: !!account.address,
        }
    })
    const isOwner = useMemo(() => {
        if (!data.config || !account.address) return false;
        return account.address.toLowerCase() === data.config.owner.toLowerCase();
    }, [data.config, account.address])
    const isActive = useMemo(() => {
        if (!data.config) return false;
        return data.config.status === 1
    }, [data.config])

    return {
        account,
        data,
        isOwner: !!isOwner,
        isActive: !!isActive,
        hasResponded: !!hasResponded,
        totalRespondent: Number(currentRespondent)
    } 
}
