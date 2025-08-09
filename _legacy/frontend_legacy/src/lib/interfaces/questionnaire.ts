export interface QuestionnaireMetadata {
  id: number;
  owner: string;
  title: string;
  description?: string;
  createdAt: Date;
  scaleLimit: number;
  questionLimit: number;
  respondentLimit: number;
  published: boolean;
  closed: boolean;
  totalQuestions: number;
  totalRespondents: number;
}

export interface QuestionItem {
  id: number;
  questionId: number;
  text: string;
  minScore: number;
  maxScore: number;
  totalScore: number;
  sumSquares: number;
}

export interface RespondentStatus {
  id: number;
  address: string;
  hasResponded: boolean;
}

export interface UserResponses {
  id: number;
  address: string;
  responses: number[]; // Index sesuai urutan pertanyaan (questionId - 1)
}

export interface QuestionStatistics {
  questionId: number;
  average: number;
  min: number;
  max: number;
  standardDeviation: number;
}

export interface QuestionnaireStatistics {
  respondents: number;
  questionsCount: number;
  isPublished: boolean;
  isClosed: boolean;
  slotsRemaining: number;
}

export type QuestionnaireEventType =
  | "QuestionnaireCreated"
  | "QuestionnairePublished"
  | "QuestionnaireClosed"
  | "QuestionAdded"
  | "ResponseSubmitted";

export interface QuestionnaireEvent {
  event: QuestionnaireEventType;
  timestamp: number;
  data?: Record<string, unknown>; // Tambahkan struktur detail sesuai kebutuhan event log
}

export interface LikertQuestionnaireFull {
  metadata: QuestionnaireMetadata;
  questions: QuestionItem[];
  statistics: QuestionnaireStatistics;
  userResponses?: UserResponses;
  events?: QuestionnaireEvent[];
}
