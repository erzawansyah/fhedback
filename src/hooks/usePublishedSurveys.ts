import { useReadContract, useReadContracts } from "wagmi";
import {
  QUESTIONNAIRE_ABIS as abis,
  QUESTIONNAIRE_FACTORY_ADDRESS as factoryContractAddress,
} from "@/lib/contracts";
import { Address, Abi } from "viem";
import { useEffect, useState } from "react";

const factoryAbi = abis.factory as Abi;

export type SurveyDetails = [Address, 0 | 1, Address, bigint];

export type Survey = {
  address: Address;
  type: 0 | 1;
  owner: Address;
  createdAt: bigint;
};

export type UsePublishedSurveysResult = {
  surveys: Survey[];
  isLoading: boolean;
};

export const usePublishedSurveys = (): UsePublishedSurveysResult => {
  const [filtered, setFiltered] = useState<Address[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const { data: addrs, isLoading: isAddrsLoading } = useReadContract({
    address: factoryContractAddress,
    abi: factoryAbi,
    functionName: "getLatestQuestionnaires",
    args: [20],
    query: {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  });

  const { data: statusData, isLoading: isStatusLoading } = useReadContracts({
    contracts: addresses.map((addr) => ({
      address: addr as Address,
      abi: abis.general as Abi,
      functionName: "status",
      args: [],
    })),
    query: {
      enabled: addresses.length > 0,
    },
  });

  const { data: details, isLoading: isLoadingDetails } = useReadContracts({
    contracts: filtered.map((addr) => ({
      address: factoryContractAddress as Address,
      abi: abis.factory as Abi,
      functionName: "getQuestionnaireDetailsByAddress",
      args: [addr],
    })),
    query: {
      enabled: addresses.length > 0 && filtered.length > 0,
    },
  });

  useEffect(() => {
    if (
      statusData &&
      Array.isArray(statusData) &&
      statusData.length > 0 &&
      !isStatusLoading
    ) {
      const publishedAddresses = addresses.filter((addr, index) => {
        const status = statusData[index];
        return status !== undefined && status.result === 2;
      });
      setFiltered(publishedAddresses);
    }
  }, [statusData, addresses, isStatusLoading]);

  useEffect(() => {
    if (addrs && Array.isArray(addrs) && addrs.length > 0) {
      setAddresses(addrs);
    }
  }, [addrs]);

  if (isAddrsLoading || isLoadingDetails || isStatusLoading) {
    return {
      surveys: [],
      isLoading: true,
    };
  }

  if (addresses.length > 0 && details && details?.length) {
    const filteredDetails = details.filter((detail) => !detail.error);
    return {
      surveys: filteredDetails.map((detail) => {
        const [address, type, owner, createdAt] =
          detail.result as SurveyDetails;
        return {
          address,
          type,
          owner,
          createdAt,
        };
      }),
      isLoading: false,
    };
  }

  return {
    surveys: [],
    isLoading: false,
  };
};
