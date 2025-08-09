import React from "react";

// Status-related types
export type StatusType =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "loading"
  | "pending";

// Status component props
export interface StatusIndicatorProps {
  status: StatusType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
}

export interface StatusAlertProps {
  type: StatusType;
  title?: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

// Contract address component props
export interface ContractAddressProps {
  address: string;
  label?: string;
  showCopy?: boolean;
  showExplorer?: boolean;
  className?: string;
}

// Progress step props
export interface ProgressStepProps {
  steps: {
    label: string;
    completed: boolean;
    current?: boolean;
  }[];
  className?: string;
}

// Loading and error state props
export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

// Quick Actions types
export interface QuickAction {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  external: boolean;
}

export interface ActionSectionProps {
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  actions: QuickAction[];
}

// Best Practices types
export interface BestPractice {
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  icon: React.ElementType;
}

export interface SectionProps {
  title: string;
  icon: React.ElementType;
  practices: BestPractice[];
  isOpen: boolean;
  onToggle: () => void;
}

// Technical Info types
export interface TechnicalSpec {
  label: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}
