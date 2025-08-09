import factoryAbi from "./abi/FactoryAbi.json";
import standardQuestionnaireAbi from "./abi/QuestionnaireAbi.json";
import fheQuestionnaireAbi from "./abi/FHEQuestionnaireAbi.json";

export const QUESTIONNAIRE_FACTORY_ADDRESS =
  "0x4F8e940DdE65f95F3896E983240a3Be674Ad1854";
export const QUESTIONNAIRE_FACTORY_ABI = factoryAbi;

export const STANDARD_QUESTIONNAIRE_ADDRESS =
  "0x6f14f236474b711ea62c03c02bcfdcb5baa1e9e1";
export const STANDARD_QUESTIONNAIRE_ABI = standardQuestionnaireAbi;

export const FHE_QUESTIONNAIRE_ADDRESS =
  "0x4d7c43ed897a884ba7375458489da532fe2e3250";
export const FHE_QUESTIONNAIRE_ABI = fheQuestionnaireAbi;

export const QUESTIONNAIRE_ABIS = {
  standard: {
    address: STANDARD_QUESTIONNAIRE_ADDRESS,
    abi: STANDARD_QUESTIONNAIRE_ABI,
  },
  fhe: {
    address: FHE_QUESTIONNAIRE_ADDRESS,
    abi: FHE_QUESTIONNAIRE_ABI,
  },
};
