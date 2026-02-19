export type QuestionType = "self_rating" | "knowledge_check" | "open_ended";

export type Category =
  | "Core Programming"
  | "JavaScript & Runtime"
  | "Frontend Concepts"
  | "Backend Concepts"
  | "Software Practices"
  | "Self-Reflection";

export interface QuestionOption {
  text: string;
  points: number;
}

export interface Question {
  id: string;
  category: Category;
  type: QuestionType;
  question: string;
  options?: QuestionOption[];
  maxPoints: number;
  followUpQuestion?: string;
  followUpOptions?: QuestionOption[];
}

export interface UserAnswer {
  questionId: string;
  selectedOptions?: number[];
  ratingValue?: number;
  openText?: string;
  followUpAnswer?: number;
}

export interface CategoryScore {
  category: Category;
  earned: number;
  max: number;
  percentage: number;
  level: "Strong" | "Moderate" | "Weak";
}

export interface AssessmentResult {
  categoryScores: CategoryScore[];
  overallPercentage: number;
  overallLevel: "Strong" | "Moderate" | "Weak";
  openResponses: { question: string; answer: string }[];
}
