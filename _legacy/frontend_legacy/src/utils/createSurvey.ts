import { abi, bytecode } from "@/lib/contracts/LikertMultiItemQuestionnaire";
import { config } from "@/lib/wagmi/config";
import { deployContract } from "@wagmi/core";

export const createSurvey = async (
  title: string,
  scaleLimit: number,
  questionLimit: number,
  respondentLimit: number
) => {
  const result = await deployContract(config, {
    abi,
    bytecode,
    args: [title, scaleLimit, questionLimit, respondentLimit],
  });

  try {
    return result;
  } catch (error) {
    console.error("Gagal membuat survei:", error);
    return null;
  }
};
