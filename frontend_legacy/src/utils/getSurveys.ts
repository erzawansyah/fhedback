import { QuestionnaireMetadata } from "@/lib/interfaces/questionnaire";
import { SurveyMockup } from "@/lib/mockups/surveyData";

// Mockup for Get Surveys
export const getSurveys = (
  count: number,
  offset: number = 0
): QuestionnaireMetadata[] => {
  const surveys = SurveyMockup;
  // Ambil survei mulai dari offset sebanyak 'count'
  const limitedSurveys = surveys.slice(offset, offset + count);

  return limitedSurveys;
};
