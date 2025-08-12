import { createQuestions } from "../services/firebase/create_questions";
import { getQuestionByCid } from "../services/firebase/get_questions";
import type { SurveyQuestions } from "../types/survey.schema";

/**
 * Questions management
 * Currently using firebase services for data storage and retrieval.
 * TODO: Implement ipfs or other decentralized storage solutions when going production.
 */
export class Questions {
    async create(jsonObj: SurveyQuestions) {
        // TODO: validate input before sending to Firebase
        const result = await createQuestions(jsonObj);
        return result.cid;
    }
    async get(cid: string): Promise<SurveyQuestions | null> {
        const question = await getQuestionByCid(cid);
        if (!question) {
            return null;
        }

        // TODO: Validate Firestore data against SurveyQuestions type
        const mappedQuestion = {
            cid: question.cid as string,
            content: question.content as SurveyQuestions,
            createdAt: question.createdAt,
        };

        return mappedQuestion.content
    }
}
