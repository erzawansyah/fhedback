import { FieldValues, Control } from "react-hook-form";
import { SurveyCreationStatus } from "@/types/survey-creation";
import {
  SurveySettingsType,
  SurveyMetadataType,
  SurveyQuestionsType,
} from "./schemas";

// Base form field props interface
export interface BaseFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: keyof T;
  label: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

// Text field specific props
export interface TextFieldProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {
  type?: "text" | "email" | "number";
  maxLength?: number;
  minLength?: number;
}

// Number field specific props
export interface NumberFieldProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {
  min?: number;
  max?: number;
  step?: number;
}

// Textarea field specific props
export interface TextareaFieldProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {
  rows?: number;
  maxLength?: number;
  minLength?: number;
}

// Select field specific props
export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {
  options: SelectOption[];
  placeholder?: string;
}

// Form section layout props
export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

// Form grid layout props
export interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

// Survey form component props
export interface SurveyMetadataFormProps {
  className?: string;
  isLoading?: boolean;
  loadingMessage?: string;
  onSubmit: (data: SurveyMetadataType) => void;
  status: SurveyCreationStatus | null;
  temporaryValue: SurveyMetadataType | null;
}

export interface SurveySettingsFormProps {
  className?: string;
  onSubmit: (data: SurveySettingsType) => void;
  status: SurveyCreationStatus | null;
}

export interface SurveyQuestionsFormProps {
  className?: string;
  onSubmit: (data: SurveyQuestionsType) => void;
  status: SurveyCreationStatus | null;
}

// Question-specific component props
export interface QuestionItemProps {
  index: number;
  control: Control<SurveyQuestionsType>;
  onRemove: (index: number) => void;
}

export interface QuestionsSummaryProps {
  questionsCount: number;
  className?: string;
}
