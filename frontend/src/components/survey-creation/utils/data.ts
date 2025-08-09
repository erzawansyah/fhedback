import {
  BookOpen,
  FileText,
  MessageSquare,
  Github,
  Video,
  Download,
  BarChart3,
  Users,
  Target,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Database,
  Lock,
  Zap,
} from "lucide-react";

import { QuickAction, BestPractice } from "../types";

/**
 * Quick Actions data organized by category
 */
export const QUICK_ACTIONS = {
  learn: [
    {
      icon: BookOpen,
      label: "Documentation",
      description: "Complete guide for creating surveys",
      href: "/docs",
      external: true,
    },
    {
      icon: Video,
      label: "Video Tutorials",
      description: "Step-by-step video guides",
      href: "https://youtube.com/@fhedback-tutorials",
      external: true,
    },
    {
      icon: Target,
      label: "Best Practices",
      description: "Tips for effective surveys",
      href: "/docs/best-practices",
      external: true,
    },
  ] as QuickAction[],

  resources: [
    {
      icon: FileText,
      label: "Blog",
      description: "Latest updates and case studies",
      href: "/blog",
      external: true,
    },
    {
      icon: Download,
      label: "Templates",
      description: "Pre-made survey templates",
      href: "/templates",
      external: true,
    },
  ] as QuickAction[],

  support: [
    {
      icon: MessageSquare,
      label: "Community",
      description: "Join our Discord community",
      href: "https://discord.gg/fhedback",
      external: true,
    },
    {
      icon: Github,
      label: "GitHub",
      description: "Source code and issues",
      href: "https://github.com/fhedback/platform",
      external: true,
    },
  ] as QuickAction[],

  tools: [
    {
      icon: BarChart3,
      label: "Analytics Dashboard",
      description: "View all your survey analytics",
      href: "/creator/analytics",
      external: true,
    },
    {
      icon: Users,
      label: "Survey Explorer",
      description: "Browse public surveys",
      href: "/explore",
      external: true,
    },
  ] as QuickAction[],
};

/**
 * Best Practices data organized by category and level
 */
export const BEST_PRACTICES = {
  planning: [
    {
      title: "Define Clear Objectives",
      description:
        "Start with specific, measurable goals for your survey to ensure meaningful results.",
      level: "beginner" as const,
      icon: Target,
    },
    {
      title: "Know Your Audience",
      description:
        "Understand your target respondents to tailor questions appropriately.",
      level: "beginner" as const,
      icon: Users,
    },
    {
      title: "Plan Question Flow",
      description:
        "Organize questions logically from general to specific topics.",
      level: "intermediate" as const,
      icon: CheckCircle,
    },
  ] as BestPractice[],

  design: [
    {
      title: "Keep Questions Clear",
      description:
        "Use simple, unambiguous language that all respondents can understand.",
      level: "beginner" as const,
      icon: Lightbulb,
    },
    {
      title: "Avoid Leading Questions",
      description:
        "Write neutral questions that don't influence respondent answers.",
      level: "intermediate" as const,
      icon: AlertTriangle,
    },
    {
      title: "Optimize Scale Length",
      description:
        "Use 5-7 point scales for balanced and meaningful responses.",
      level: "intermediate" as const,
      icon: BarChart3,
    },
  ] as BestPractice[],

  privacy: [
    {
      title: "Enable FHE Encryption",
      description:
        "Use fully homomorphic encryption to protect respondent privacy.",
      level: "beginner" as const,
      icon: Shield,
    },
    {
      title: "Minimize Data Collection",
      description:
        "Only collect data that's essential for your survey objectives.",
      level: "intermediate" as const,
      icon: Database,
    },
    {
      title: "Implement Access Controls",
      description:
        "Set appropriate permissions for survey data access and analysis.",
      level: "advanced" as const,
      icon: Lock,
    },
  ] as BestPractice[],

  distribution: [
    {
      title: "Set Realistic Timeline",
      description:
        "Allow sufficient time for quality responses without respondent fatigue.",
      level: "beginner" as const,
      icon: Clock,
    },
    {
      title: "Choose Right Channels",
      description:
        "Select distribution channels that reach your target audience effectively.",
      level: "intermediate" as const,
      icon: Zap,
    },
    {
      title: "Monitor Response Rates",
      description:
        "Track participation and adjust strategy if needed during collection.",
      level: "advanced" as const,
      icon: BarChart3,
    },
  ] as BestPractice[],
};

/**
 * Technical specifications for surveys
 */
export const TECHNICAL_SPECS = [
  {
    label: "Encryption",
    value: "FHE (Fully Homomorphic)",
    icon: Shield,
    description: "End-to-end encryption using ZAMA's FHE technology",
  },
  {
    label: "Blockchain",
    value: "Ethereum Compatible",
    icon: Database,
    description: "Smart contracts deployed on Ethereum-compatible networks",
  },
  {
    label: "Storage",
    value: "IPFS + Pinata",
    icon: FileText,
    description: "Decentralized storage with Pinata pinning service",
  },
  {
    label: "Privacy",
    value: "Zero Knowledge",
    icon: Lock,
    description: "Survey responses are never visible in plaintext",
  },
];

/**
 * Survey completion statistics helpers
 */
export const COMPLETION_STATS = {
  getCompletionRate: (completed: number, total: number): number => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  },

  getTimeEstimate: (questions: number): string => {
    const estimatedMinutes = Math.ceil(questions * 0.5); // 30 seconds per question
    return estimatedMinutes === 1 ? "1 minute" : `${estimatedMinutes} minutes`;
  },

  getDifficultyLevel: (
    questions: number,
    hasComplexQuestions: boolean
  ): string => {
    if (questions <= 5 && !hasComplexQuestions) return "Easy";
    if (questions <= 10 || hasComplexQuestions) return "Medium";
    return "Challenging";
  },
};
