import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { questions } from "@/data/questions";
import { Category, UserAnswer, Question } from "@/data/types";
import { calculateResults, getRecommendations } from "@/data/scoring";
import { LandingScreen } from "@/components/assessment/LandingScreen";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { ResultsScreen } from "@/components/assessment/ResultsScreen";
import { ProgressBar } from "@/components/assessment/ProgressBar";
import { ChevronLeft, ChevronRight, Send, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

type Screen = "landing" | "assessment" | "results";

const scoredCategories: Category[] = [
  "Core Programming",
  "JavaScript & Runtime",
  "Frontend Concepts",
  "Backend Concepts",
  "Software Practices",
  "Self-Reflection",
];

const STORAGE_KEY = "know-shine-answers";
const STORAGE_INDEX_KEY = "know-shine-current-index";
const STORAGE_SCREEN_KEY = "know-shine-screen";
const STORAGE_COMPLETED_KEY = "know-shine-completed";
const STORAGE_CATEGORIES_KEY = "know-shine-selected-categories";

// Helper functions for localStorage
const saveToLocalStorage = (answers: Map<string, UserAnswer>, currentIndex: number, screen: Screen, isCompleted?: boolean, selectedCategories?: Category[]) => {
  try {
    const answersArray = Array.from(answers.entries());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answersArray));
    localStorage.setItem(STORAGE_INDEX_KEY, String(currentIndex));
    localStorage.setItem(STORAGE_SCREEN_KEY, screen);
    if (isCompleted !== undefined) {
      localStorage.setItem(STORAGE_COMPLETED_KEY, String(isCompleted));
    }
    if (selectedCategories) {
      localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(selectedCategories));
    }
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
};

const loadFromLocalStorage = (): { answers: Map<string, UserAnswer>; currentIndex: number; screen: Screen; isCompleted: boolean; selectedCategories: Category[] | null } => {
  try {
    const savedAnswers = localStorage.getItem(STORAGE_KEY);
    const savedIndex = localStorage.getItem(STORAGE_INDEX_KEY);
    const savedScreen = localStorage.getItem(STORAGE_SCREEN_KEY);
    const savedCompleted = localStorage.getItem(STORAGE_COMPLETED_KEY);
    const savedCategories = localStorage.getItem(STORAGE_CATEGORIES_KEY);

    const answers = savedAnswers
      ? new Map(JSON.parse(savedAnswers) as [string, UserAnswer][])
      : new Map();
    const currentIndex = savedIndex ? parseInt(savedIndex, 10) : 0;
    const screen = (savedScreen as Screen) || "landing";
    const isCompleted = savedCompleted === "true";
    const selectedCategories = savedCategories ? JSON.parse(savedCategories) as Category[] : null;

    return { answers, currentIndex, screen, isCompleted, selectedCategories };
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return { answers: new Map(), currentIndex: 0, screen: "landing", isCompleted: false, selectedCategories: null };
  }
};

const clearLocalStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_INDEX_KEY);
    localStorage.removeItem(STORAGE_SCREEN_KEY);
    localStorage.removeItem(STORAGE_COMPLETED_KEY);
    localStorage.removeItem(STORAGE_CATEGORIES_KEY);
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
};

const Index = () => {
  const [screen, setScreen] = useState<Screen>("landing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, UserAnswer>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Category[] | null>(null);

  // Filter questions based on selected categories
  const filteredQuestions = selectedCategories 
    ? questions.filter(q => selectedCategories.includes(q.category))
    : questions;

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved.answers.size > 0 || saved.currentIndex > 0 || saved.screen !== "landing") {
      setAnswers(saved.answers);
      setCurrentIndex(saved.currentIndex);
      setScreen(saved.screen);
    }
    setHasCompletedAssessment(saved.isCompleted);
    setSelectedCategories(saved.selectedCategories);
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever answers, currentIndex, or screen changes
  useEffect(() => {
    if (isInitialized) {
      saveToLocalStorage(answers, currentIndex, screen, undefined, selectedCategories || undefined);
    }
  }, [answers, currentIndex, screen, isInitialized, selectedCategories]);

  const currentQuestion = filteredQuestions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === filteredQuestions.length - 1;

  const currentCategory = currentQuestion?.category;
  const categoryIndex = scoredCategories.indexOf(currentCategory);

  const updateAnswer = (answer: UserAnswer) => {
    setAnswers((prev) => new Map(prev).set(answer.questionId, answer));
  };

  const handleSubmit = () => {
    const result = calculateResults(answers);
    const recommendations = getRecommendations(result.categoryScores);
    setScreen("results");
    setHasCompletedAssessment(true);
    saveToLocalStorage(answers, currentIndex, "results", true, selectedCategories || undefined);
  };

  const handleRestart = () => {
    setAnswers(new Map());
    setCurrentIndex(0);
    setScreen("landing");
    setHasCompletedAssessment(false);
    setSelectedCategories(null);
    clearLocalStorage();
  };

  const handleStartFresh = () => {
    setAnswers(new Map());
    setCurrentIndex(0);
    setHasCompletedAssessment(false);
    setSelectedCategories(null);
    clearLocalStorage();
    setScreen("assessment");
  };

  const handleStartAssessment = (categories?: Category[]) => {
    if (categories) {
      setSelectedCategories(categories);
    } else {
      setSelectedCategories(null);
    }
    setScreen("assessment");
  };

  const handleViewResults = () => {
    setScreen("results");
  };

  const handleBackToHome = () => {
    setScreen("landing");
  };

  const hasSavedProgress = answers.size > 0 && screen === "landing";

  const result = screen === "results" ? calculateResults(answers) : null;
  const recommendations = result ? getRecommendations(result.categoryScores) : [];

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <LandingScreen 
              onStart={handleStartAssessment} 
              hasSavedProgress={hasSavedProgress}
              onClearProgress={handleStartFresh}
              hasCompletedAssessment={hasCompletedAssessment}
              onViewResults={handleViewResults}
            />
          </motion.div>
        )}

        {screen === "assessment" && (
          <motion.div
            key="assessment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col"
          >
            <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="max-w-3xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setScreen("landing")}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Home className="w-3 h-3" />
                      <span className="hidden sm:inline text-xs">Home</span>
                    </Button>
                    <span className="text-xs font-display text-primary uppercase tracking-wider">
                      {currentCategory}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-display">
                    {currentIndex + 1} / {filteredQuestions.length}
                  </span>
                </div>
                <ProgressBar
                  current={currentIndex + 1}
                  total={filteredQuestions.length}
                />
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 py-8">
              <div className="w-full max-w-3xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    <QuestionCard
                      question={currentQuestion}
                      answer={answers.get(currentQuestion.id)}
                      onAnswer={updateAnswer}
                    />
                  </motion.div>
                </AnimatePresence>
                
                <div className="mt-8 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentIndex((i) => i - 1)}
                    disabled={isFirst}
                    className="gap-2 text-muted-foreground"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>

                  {isLast ? (
                    <Button
                      onClick={handleSubmit}
                      className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Send className="w-4 h-4" />
                      See Results
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentIndex((i) => i + 1)}
                      className="gap-2 text-muted-foreground"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {screen === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ResultsScreen
              result={result}
              recommendations={recommendations}
              answers={answers}
              questions={filteredQuestions}
              onRestart={handleRestart}
              selectedCategories={selectedCategories || undefined}
              onBackToHome={handleBackToHome}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
