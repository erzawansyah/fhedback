import { SurveySettingsData } from "@/components/survey-creation";
import { wagmiConfig } from "@/lib/wagmi/config";
import { writeContract } from "@wagmi/core";
import { Address } from "viem";
import {
  QUESTIONNAIRE_ABIS,
  QUESTIONNAIRE_FACTORY_ADDRESS,
} from "../contracts";

const abis = QUESTIONNAIRE_ABIS;
const factoryAddress = QUESTIONNAIRE_FACTORY_ADDRESS;

export const createSurvey = async (data: SurveySettingsData) => {
  const { title, limitScale, totalQuestions, respondentLimit, disableFHE } =
    data;
  const surveyType = disableFHE ? 0 : 1; // 0 for non-FHE, 1 for FHE

  try {
    const result = await writeContract(wagmiConfig, {
      address: factoryAddress as Address,
      abi: abis.factory,
      functionName: "createQuestionnaire",
      args: [surveyType, title, limitScale, totalQuestions, respondentLimit],
    });
    return result;
  } catch (error) {
    console.error("Error creating survey:", error);
  }
};
