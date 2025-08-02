// Re-export all types from different modules
export * from "./schemas";
export * from "./form.types";
export * from "./sidebar.types";

// Common shared types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}
