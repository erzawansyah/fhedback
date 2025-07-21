import factoryAbi from "./abi/FactoryAbi.json";
import standardQuestionnaireAbi from "./abi/StandardQuestionnaireAbi.json";
import fheQuestionnaireAbi from "./abi/FHEQuestionnaireAbi.json";
import generalQuestionnaireAbi from "./abi/GeneralQuestionnaireAbi.json";
import { Address } from "viem";

export const QUESTIONNAIRE_FACTORY_ADDRESS =
  "0x411E6Ed15706e6873fD2410974CEdcF10fc5C19a";

export const QUESTIONNAIRE_FACTORY_ABI = factoryAbi;
export const GENERAL_QUESTIONNAIRE_ABI = generalQuestionnaireAbi;
export const STANDARD_QUESTIONNAIRE_ABI = standardQuestionnaireAbi;
export const FHE_QUESTIONNAIRE_ABI = fheQuestionnaireAbi;

export const QUESTIONNAIRE_ABIS = {
  factory: QUESTIONNAIRE_FACTORY_ABI,
  general: GENERAL_QUESTIONNAIRE_ABI,
  standard: STANDARD_QUESTIONNAIRE_ABI,
  fhe: FHE_QUESTIONNAIRE_ABI,
};

export const getAbiByType = (type: 0 | 1) => {
  switch (type) {
    case 0:
      return QUESTIONNAIRE_FACTORY_ABI;
    case 1:
      return GENERAL_QUESTIONNAIRE_ABI;
    default:
      throw new Error("Invalid questionnaire type");
  }
};

export const factoryContract = {
  address: QUESTIONNAIRE_FACTORY_ADDRESS,
  abi: QUESTIONNAIRE_FACTORY_ABI,
};

export const generalQuestionnaireContract = (address: Address) => ({
  address: address,
  abi: GENERAL_QUESTIONNAIRE_ABI,
});
