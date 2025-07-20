import { PublishedSurvey } from "./SurveyList";

// Mock data untuk surveys yang dipublikasikan
export const mockPublishedSurveys: PublishedSurvey[] = [
  {
    id: "survey_1",
    title: "AI Technology Adoption in Workplace",
    description:
      "Help us understand how artificial intelligence is being adopted in modern workplaces and its impact on productivity.",
    category: "technology",
    creator: "TechResearch Inc",
    createdAt: "2025-01-15T08:00:00Z",
    totalQuestions: 12,
    respondentCount: 156,
    maxRespondents: 200,
    rewardAmount: 25,
    averageRating: 4.6,
    estimatedTime: 8,
    tags: ["AI", "workplace", "productivity", "automation"],
    isActive: true,
    hasAnswered: false,
  },
  {
    id: "survey_2",
    title: "Healthcare Digital Transformation Survey",
    description:
      "Share your experience with digital health solutions and telemedicine platforms.",
    category: "healthcare",
    creator: "HealthTech Solutions",
    createdAt: "2025-01-14T10:30:00Z",
    totalQuestions: 15,
    respondentCount: 89,
    maxRespondents: 150,
    rewardAmount: 30,
    averageRating: 4.3,
    estimatedTime: 10,
    tags: ["healthcare", "digital", "telemedicine"],
    isActive: true,
    hasAnswered: false,
  },
  {
    id: "survey_3",
    title: "Online Learning Effectiveness Study",
    description:
      "Evaluate the effectiveness of online learning platforms compared to traditional classroom education.",
    category: "education",
    creator: "EduResearch Foundation",
    createdAt: "2025-01-13T14:15:00Z",
    totalQuestions: 18,
    respondentCount: 234,
    maxRespondents: 300,
    rewardAmount: 20,
    averageRating: 4.1,
    estimatedTime: 12,
    tags: ["education", "online learning", "e-learning"],
    isActive: true,
    hasAnswered: true,
  },
  {
    id: "survey_4",
    title: "Cryptocurrency Investment Behavior",
    description:
      "Research on investment patterns and risk management in cryptocurrency markets.",
    category: "finance",
    creator: "FinanceAnalytics Co",
    createdAt: "2025-01-12T16:45:00Z",
    totalQuestions: 20,
    respondentCount: 445,
    maxRespondents: 500,
    rewardAmount: 50,
    averageRating: 4.8,
    estimatedTime: 15,
    tags: ["crypto", "investment", "finance", "blockchain"],
    isActive: true,
    hasAnswered: false,
  },
  {
    id: "survey_5",
    title: "Streaming Platform Preferences",
    description:
      "Understanding user preferences and viewing habits across different streaming platforms.",
    category: "entertainment",
    creator: "MediaInsights Ltd",
    createdAt: "2025-01-11T12:20:00Z",
    totalQuestions: 10,
    respondentCount: 324,
    maxRespondents: 400,
    rewardAmount: 15,
    averageRating: 3.9,
    estimatedTime: 6,
    tags: ["streaming", "entertainment", "media consumption"],
    isActive: true,
    hasAnswered: false,
  },
  {
    id: "survey_6",
    title: "Remote Work Productivity Assessment",
    description:
      "Assess productivity levels and challenges faced while working remotely.",
    category: "business",
    creator: "WorkLife Research",
    createdAt: "2025-01-10T09:10:00Z",
    totalQuestions: 14,
    respondentCount: 178,
    maxRespondents: 250,
    rewardAmount: 35,
    averageRating: 4.4,
    estimatedTime: 9,
    tags: ["remote work", "productivity", "work-life balance"],
    isActive: true,
    hasAnswered: false,
  },
  {
    id: "survey_7",
    title: "Sustainable Living Habits Survey",
    description:
      "Explore how people are adopting sustainable practices in their daily lives.",
    category: "lifestyle",
    creator: "GreenLiving Initiative",
    createdAt: "2025-01-09T11:30:00Z",
    totalQuestions: 16,
    respondentCount: 267,
    maxRespondents: 300,
    rewardAmount: 18,
    averageRating: 4.2,
    estimatedTime: 11,
    tags: ["sustainability", "environment", "lifestyle"],
    isActive: true,
    hasAnswered: false,
  },
  {
    id: "survey_8",
    title: "Mobile App User Experience Study",
    description:
      "Help improve mobile app interfaces by sharing your user experience insights.",
    category: "technology",
    creator: "UX Research Team",
    createdAt: "2025-01-08T15:45:00Z",
    totalQuestions: 8,
    respondentCount: 412,
    maxRespondents: 500,
    rewardAmount: 12,
    averageRating: 3.8,
    estimatedTime: 5,
    tags: ["mobile apps", "UX", "user interface"],
    isActive: true,
    hasAnswered: false,
  },
  {
    id: "survey_9",
    title: "Food Delivery Service Satisfaction",
    description:
      "Rate your experience with various food delivery services and suggest improvements.",
    category: "lifestyle",
    creator: "Food Industry Analysis",
    createdAt: "2025-01-07T13:15:00Z",
    totalQuestions: 12,
    respondentCount: 356,
    maxRespondents: 400,
    rewardAmount: 22,
    averageRating: 4.0,
    estimatedTime: 7,
    tags: ["food delivery", "customer satisfaction", "service quality"],
    isActive: true,
    hasAnswered: false,
  },
  {
    id: "survey_10",
    title: "Electric Vehicle Adoption Survey",
    description:
      "Understanding factors influencing electric vehicle purchase decisions and usage patterns.",
    category: "technology",
    creator: "Auto Industry Research",
    createdAt: "2025-01-06T10:00:00Z",
    totalQuestions: 22,
    respondentCount: 189,
    maxRespondents: 300,
    rewardAmount: 40,
    averageRating: 4.5,
    estimatedTime: 14,
    tags: ["electric vehicles", "automotive", "sustainability"],
    isActive: true,
    hasAnswered: false,
  },
];

// Mock function untuk mengambil survey data
export const fetchPublishedSurveys = async (): Promise<PublishedSurvey[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return mockPublishedSurveys;
};

// Mock function untuk memulai survey
export const startSurvey = async (
  surveyId: string
): Promise<{ success: boolean; redirectUrl?: string }> => {
  console.log("Mock: Starting survey", surveyId);

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    redirectUrl: `/survey/${surveyId}/take`,
  };
};
