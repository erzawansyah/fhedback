import { 
  type SurveyGroup,
  type SurveyQuestion,
  type SurveySubmissionQuestion,
  type SurveyQuestions
} from "../types/survey.schema";

/**
 * Transforms submission questions into SurveyQuestions format
 * @param submissionQuestions Array of questions from form submission
 * @param name Survey name
 * @returns Properly formatted SurveyQuestions object
 */
export function transformToSurveyQuestions(
  submissionQuestions: SurveySubmissionQuestion[],
  name: string
): SurveyQuestions {
  // Create default group if none specified
  const defaultGroup: SurveyGroup = {
    id: 0,
    label: "General Questions",
    description: "Survey Questions"
  };

  // Transform questions
  const questions: SurveyQuestion[] = submissionQuestions.map((q, index) => {
    // Extract response properties
    const { text, helperText, ...responseProps } = q;

    return {
      id: index,           // Sequential ID
      groupId: 0,         // All questions go to default group for now
      text,
      helperText,
      response: responseProps  // All remaining props form the response object
    };
  });

  return {
    name,
    totalQuestions: questions.length,
    group: [defaultGroup],
    questions
  };
}

/**
 * Helper to validate the transformed data matches SurveyQuestions schema
 * @param questions The questions to validate
 * @returns true if valid
 */
export function validateSurveyQuestions(questions: SurveyQuestions): boolean {
  // Add validation logic here if needed
  return questions.totalQuestions === questions.questions.length;
}
