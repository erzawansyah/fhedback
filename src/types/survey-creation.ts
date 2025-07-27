import { Address } from "viem";

export type SurveyCreationStatus =
  | "idle"
  | "loading"
  | "signing"
  | "verifying"
  | "success"
  | "error";

export type SurveyStatus =
  | "initialized"
  | "draft"
  | "published"
  | "closed"
  | "trashed";

export interface SurveyCreationStep {
  step1: boolean; // Survey Settings
  step2: boolean; // Survey Metadata
  step3: boolean; // Survey Questions
}

export interface SurveyCreationConfig {
  address: Address | null;
  status?: SurveyStatus;
  title?: string;
  limitScale?: number;
  totalQuestions?: number;
  respondentLimit?: number;
  encrypted?: boolean;
}

export interface SurveyCreationMetadata {
  metadataCid: string | null;
  title?: string;
  description?: string;
  categories?: string;
  minLabel?: string;
  maxLabel?: string;
  tags?: string[];
}

export type SurveyCreationQuestions = string[];
