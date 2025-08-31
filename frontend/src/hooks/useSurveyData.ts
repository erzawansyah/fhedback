import { useReadContract } from "wagmi";
import { ABIS, FACTORY_ADDRESS } from "../services/contracts";
import { useEffect, useMemo, useRef, useState } from "react";
import { type SurveyMetadata, type SurveyQuestion } from "../types/survey.schema";
import type { Abi, Address } from "viem";
import { getDb } from "../services/firebase/dbStore";

type SurveyConfig = {
  owner: Address;
  symbol: string;
  totalQuestions: number;
  respondentLimit: number;
  createdAt: Date;
  status: number;
};

type SurveyDataRaw = readonly [
  Address,   // owner
  string,    // symbol
  string,    // metadataCID
  string,    // questionsCID
  bigint,    // totalQuestions
  bigint,    // respondentLimit
  bigint,    // createdAt (unix seconds)
  bigint     // status
];

const factoryAbi = ABIS.factory as Abi;
const surveyAbi = ABIS.survey as Abi;

export const useSurveyDataById = (surveyId: number | bigint | string) => {
  const [error, setError] = useState<string[]>([]);
  const [config, setConfig] = useState<SurveyConfig | null>(null);
  const [metadata, setMetadata] = useState<SurveyMetadata | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[] | null>(null);

  // Pastikan argumen untuk contract adalah bigint
  const surveyIdBig = useMemo(() => {
    try {
      // Jika sudah bigint, gunakan langsung
      if (typeof surveyId === "bigint") return surveyId;
      
      // Handle hex string input
      if (typeof surveyId === "string") {
        if (surveyId.startsWith("0x")) {
          return BigInt(surveyId);
        }
        // Handle string number
        if (surveyId.match(/^\d+$/)) {
          return BigInt(surveyId);
        }
        throw new Error("Invalid string format");
      }
      
      // Handle number input (termasuk 0)
      if (typeof surveyId === "number") {
        if (isNaN(surveyId)) throw new Error("surveyId is NaN");
        return BigInt(surveyId);
      }

      throw new Error(`Unsupported surveyId type: ${typeof surveyId}`);
    } catch (e) {
      console.error("Failed to convert surveyId to BigInt:", { surveyId, error: e });
      return null;
    }
  }, [surveyId]);

  // 1) Ambil address survey dari factory
  const {
    data: surveyAddress,
    isPending: surveyAddressPending,
    isError: surveyAddressIsError,
    error: surveyAddressErrObj,
  } = useReadContract({
    address: FACTORY_ADDRESS as Address,
    abi: factoryAbi,
    functionName: "surveys",
    // Selalu kirim array dengan surveyIdBig jika enabled
    args: [surveyIdBig],
    query: { 
      enabled: surveyIdBig !== null && surveyIdBig !== undefined,
      retry: 2,
      gcTime: 5 * 60 * 1000 // 5 minutes cache
    },
  }) as {
    data: Address | undefined;
    isPending: boolean;
    isError: boolean;
    error: unknown;
  };

  // 2) Ambil data survey dari kontrak survey
  const {
    data: surveyData,
    isPending: surveyDataPending,
    isError: surveyDataIsError,
    error: surveyDataErrObj,
  } = useReadContract({
    address: surveyAddress,
    abi: surveyAbi,
    functionName: "survey",
    args: [],
    query: { 
      enabled: !!surveyAddress,
      retry: 2,
      gcTime: 5 * 60 * 1000, // 5 minutes cache
      staleTime: 30 * 1000 // Consider data stale after 30 seconds
    },
  }) as {
    data: SurveyDataRaw | undefined;
    isPending: boolean;
    isError: boolean;
    error: unknown;
  };

  const loading = surveyAddressPending || surveyDataPending;

  // Kumpulkan error satu kali, tanpa duplikasi dan tanpa setState berulang
  useEffect(() => {
    const next: string[] = [];
    if (surveyIdBig === null || surveyIdBig === undefined) {
      next.push(`surveyId tidak valid: ${surveyId} (type: ${typeof surveyId})`);
    }
    if (surveyAddressIsError) {
      next.push(`Gagal mengambil survey address untuk ID: ${surveyId}`);
      if (surveyAddressErrObj) next.push(`Detail: ${String(surveyAddressErrObj)}`);
    }
    if (surveyDataIsError) {
      next.push(`Gagal mengambil survey data untuk ID: ${surveyId}`);
      if (surveyDataErrObj) next.push(`Detail: ${String(surveyDataErrObj)}`);
    }
    
    if (next.length > 0) {
      console.error("Survey data errors:", { 
        surveyId, 
        surveyIdType: typeof surveyId,
        surveyIdBig,
        errors: next,
        addressError: surveyAddressErrObj,
        dataError: surveyDataErrObj
      });
      setError(prev => {
        const set = new Set([...prev, ...next]);
        return Array.from(set);
      });
    }
  }, [surveyId, surveyIdBig, surveyAddressIsError, surveyDataIsError, surveyAddressErrObj, surveyDataErrObj]);

  // Abort controller sederhana untuk cegah race saat fetch metadata dan questions
  const fetchTokenRef = useRef(0);

  useEffect(() => {
    if (!surveyData) return;

    const token = ++fetchTokenRef.current;
    let metadataCid = '';
    let questionsCid = '';

    try {
      const [
        ownerRaw,
        symbolRaw,
        metadataCID,
        questionsCID,
        totalQuestionsRaw,
        respondentLimitRaw,
        createdAtRaw,
        statusRaw,
      ] = surveyData;

      // Validasi dan normalisasi data
      if (!ownerRaw || typeof ownerRaw !== 'string') throw new Error('Invalid owner address');
      if (!symbolRaw || typeof symbolRaw !== 'string') throw new Error('Invalid symbol');
      
      // Save CIDs for later use
      metadataCid = metadataCID || '';
      questionsCid = questionsCID || '';
      
      // Normalisasi angka dan tanggal dengan validasi
      const totalQuestions = Number(totalQuestionsRaw);
      const respondentLimit = Number(respondentLimitRaw);
      const createdAtTimestamp = Number(createdAtRaw) * 1000;
      const statusNum = Number(statusRaw);
      
      if (isNaN(totalQuestions)) throw new Error('Invalid total questions');
      if (isNaN(respondentLimit)) throw new Error('Invalid respondent limit');
      if (isNaN(createdAtTimestamp)) throw new Error('Invalid creation date');
      if (isNaN(statusNum)) throw new Error('Invalid status');
      
      const createdAt = new Date(createdAtTimestamp);
      
      setConfig({
        owner: ownerRaw as Address,
        symbol: symbolRaw,
        totalQuestions,
        respondentLimit,
        createdAt,
        status: statusNum
      });

    } catch (e) {
      setError(prev => [...prev, `Error parsing survey data: ${e instanceof Error ? e.message : String(e)}`]);
      return;
    }

    // Fetch metadata dan questions terpisah supaya partial data bisa tampil
    const run = async () => {
      try {
        if (metadataCid && metadataCid.length > 0) {
          console.log("Fetching metadata with CID:", metadataCid);
          const response = await getDb("metadata", metadataCid);
          console.log("Received metadata:", response);
          
          if (fetchTokenRef.current === token) {
            if (!response || !response.content) {
              console.warn("Invalid metadata format:", response);
              setError(prev => [...prev, "Metadata tidak lengkap atau rusak"]);
              setMetadata(null);
              return;
            }
            
            // Gunakan content yang berisi metadata sebenarnya
            setMetadata(response.content as SurveyMetadata);
          }
        } else {
          console.log("No metadata CID available");
          setMetadata(null);
        }
      } catch (e) {
        console.error("Metadata fetch error:", e);
        setError(prev => [...prev, `Gagal mengambil metadata: ${String(e)}`]);
      }

      try {
        if (questionsCid && questionsCid.length > 0) {
          const response = await getDb("questions", questionsCid);
          if (fetchTokenRef.current === token) {
            if (!response || !response.content) {
              console.warn("Invalid questions format:", response);
              setError(prev => [...prev, "Data pertanyaan tidak lengkap atau rusak"]);
              setQuestions(null);
              return;
            }
            setQuestions(response.content as SurveyQuestion[]);
          }
        } else {
          setQuestions(null);
        }
      } catch (e) {
        console.error("Questions fetch error:", e);
        setError(prev => [...prev, `Gagal mengambil pertanyaan: ${String(e)}`]);
      }
    };

    run();

    // cleanup untuk membatalkan set state saat token berubah
    return () => {
      // cukup biarkan token berubah. efek cek token di atas mencegah set state basi
    };
  }, [surveyData]);

  return {
    loading,
    error,
    address: surveyAddress ?? null,
    config,
    metadata,
    questions,
  };
};
