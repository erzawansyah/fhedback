/**
 * Common TypeScript types used across the application
 */

// Re-export schema types
export type { CreateSurveyFormSchema } from "../schemas";

// Base types
export type Theme = "light" | "dark";

export type Status = "idle" | "loading" | "success" | "error";

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LayoutProps extends BaseComponentProps {
  children: React.ReactNode;
}

// API response types
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Form types
export interface FormState {
  isSubmitting: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Navigation types
export interface NavigationItem {
  label: string;
  path: string;
  icon: React.ComponentType;
  external?: boolean;
}

// Event types
export type ButtonClickEvent = React.MouseEvent<HTMLButtonElement>;
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type FormSubmitEvent = React.FormEvent<HTMLFormElement>;

// Utility types
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
