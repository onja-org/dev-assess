import { motion } from "framer-motion";
import { AssessmentResult, UserAnswer, Question, Category } from "@/data/types";
import { Recommendation } from "@/data/scoring";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis } from "recharts";
import { RotateCcw, TrendingUp, TrendingDown, Minus, MessageSquare, CheckCircle2, XCircle, CircleDot, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface ResultsScreenProps {
  result: AssessmentResult;
  recommendations: Recommendation[];
  answers: Map<string, UserAnswer>;
  questions: Question[];
  onRestart: () => void;
  selectedCategories?: Category[];
  onBackToHome?: () => void;
}

const levelConfig = {
  Strong: { color: "text-success", bg: "bg-success/10", border: "border-success/30", icon: TrendingUp, barColor: "bg-success" },
  Moderate: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/30", icon: Minus, barColor: "bg-warning" },
  Weak: { color: "text-danger", bg: "bg-danger/10", border: "border-danger/30", icon: TrendingDown, barColor: "bg-danger" },
};

export function ResultsScreen({ result, recommendations, answers, questions, onRestart, selectedCategories, onBackToHome }: ResultsScreenProps) {
  const radarData = result.categoryScores.map((s) => ({
    category: s.category.replace("Concepts", "").replace("Programming", "Prog.").replace("& Runtime", "/ RT").trim(),
    score: s.percentage,
    fullMark: 100,
  }));

  // Determine which categories have been tested (have answers)
  const testedCategories = new Set(
    Array.from(answers.values())
      .map((ans) => questions.find((q) => q.id === ans.questionId)?.category)
      .filter((cat): cat is Category => cat !== undefined)
  );

  const isPartialAssessment = selectedCategories && selectedCategories.length < 4;

  // Calculate overall score based only on tested categories
  const testedCategoryScores = result.categoryScores.filter(score => testedCategories.has(score.category));
  const actualOverallPercentage = testedCategoryScores.length > 0
    ? Math.round(testedCategoryScores.reduce((sum, score) => sum + score.percentage, 0) / testedCategoryScores.length)
    : result.overallPercentage;
  
  const actualOverallLevel = actualOverallPercentage >= 80 ? "Strong" : actualOverallPercentage >= 50 ? "Moderate" : "Weak";
  const overallConfig = levelConfig[actualOverallLevel];

  // Group questions by category for the review tab
  const categories = [...new Set(questions.map((q) => q.category))];

  return (
    <div className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <div className="flex gap-3 justify-center flex-wrap">
          {onBackToHome && (
            <Button
              onClick={onBackToHome}
              variant="outline"
              className="gap-2 font-display border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          )}
          <Button
            onClick={onRestart}
            variant="outline"
            className="gap-2 font-display border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Assessment
          </Button>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          Your Results
        </h1>
        {isPartialAssessment && (
          <p className="text-sm text-muted-foreground font-display mb-3">
            {selectedCategories.join(", ")}
          </p>
        )}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${overallConfig.bg} ${overallConfig.border}`}>
          <overallConfig.icon className={`w-4 h-4 ${overallConfig.color}`} />
          <span className={`font-display text-sm ${overallConfig.color}`}>
            {isPartialAssessment ? "Category" : "Overall"}: {actualOverallPercentage}% — {actualOverallLevel}
          </span>
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-8 bg-card border border-border">
          <TabsTrigger value="overview" className="font-display text-xs">Overview</TabsTrigger>
          <TabsTrigger value="review" className="font-display text-xs">Answer Review</TabsTrigger>
          <TabsTrigger value="recommendations" className="font-display text-xs">Recommendations</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview">
          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6 mb-8"
          >
            <h2 className="text-sm font-display text-muted-foreground mb-4 uppercase tracking-wider">
              Skill Overview
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220, 14%, 18%)" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11, fontFamily: "JetBrains Mono" }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(190, 95%, 55%)"
                  fill="hsl(190, 95%, 55%)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Bars */}
          <div className="space-y-4 mb-8">
            {result.categoryScores.map((score, i) => {
              const config = levelConfig[score.level];
              const hasBeenTested = testedCategories.has(score.category);
              
              if (!hasBeenTested) {
                return (
                  <motion.div
                    key={score.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="bg-card border border-border/50 rounded-xl p-5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display text-sm text-muted-foreground">{score.category}</span>
                    </div>
                    <p className="text-xs text-muted-foreground/70 italic">
                      Not assessed yet
                    </p>
                  </motion.div>
                );
              }
              
              return (
                <motion.div
                  key={score.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="bg-card border border-border rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display text-sm text-foreground">{score.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-display ${config.color}`}>{score.level}</span>
                      <span className="text-sm font-display text-foreground">{score.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score.percentage}%` }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${config.barColor}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Open Responses */}
          {result.openResponses.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-display text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Your Reflections
              </h2>
              <div className="space-y-4">
                {result.openResponses.map((r, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5">
                    <p className="text-xs text-muted-foreground font-display mb-2">{r.question}</p>
                    <p className="text-sm text-foreground/80">{r.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Answer Review Tab ── */}
        <TabsContent value="review">
          <div className="mb-6 p-4 rounded-lg bg-card/50 border border-border/50">
            <p className="text-xs text-muted-foreground font-display">
              {isPartialAssessment 
                ? `Showing answers for the ${selectedCategories?.length} selected ${selectedCategories?.length === 1 ? 'category' : 'categories'} you tested.`
                : "Showing all your answers from the assessment."}
              {" "}Green indicates correct answers, red shows mistakes, and yellow highlights missed correct options.
            </p>
          </div>
          <div className="space-y-8">
            {categories
              .filter((cat) => !isPartialAssessment || selectedCategories?.includes(cat))
              .map((cat) => {
              const catQuestions = questions
                .filter((q) => q.category === cat)
                .filter((q) => answers.has(q.id));
              
              if (catQuestions.length === 0) return null;
              
              return (
                <div key={cat}>
                  <h3 className="text-sm font-display text-primary uppercase tracking-wider mb-4">{cat}</h3>
                  <div className="space-y-4">
                    {catQuestions.map((q) => {
                      const answer = answers.get(q.id);
                      return (
                        <div key={q.id} className="bg-card border border-border rounded-xl p-5">
                          <p className="text-sm font-display text-foreground mb-3">{q.question}</p>

                          {q.type === "self_rating" && (
                            <div className="flex items-center gap-2">
                              <CircleDot className="w-4 h-4 text-primary" />
                              <span className="text-sm text-muted-foreground">
                                Your rating: <span className="text-foreground font-display">{answer?.ratingValue ?? "Not answered"}</span> / 5
                              </span>
                            </div>
                          )}

                          {q.type === "knowledge_check" && q.options && (
                            <div className="space-y-2">
                              {q.options.map((opt, idx) => {
                                const isCorrect = opt.points > 0;
                                const wasSelected = answer?.selectedOptions?.includes(idx) ?? false;
                                const isCorrectSelection = wasSelected && isCorrect;
                                const isWrongSelection = wasSelected && !isCorrect;
                                const isMissed = !wasSelected && isCorrect;

                                return (
                                  <div
                                    key={idx}
                                    className={`flex items-start gap-2 text-sm px-3 py-2 rounded-lg border ${
                                      isCorrectSelection
                                        ? "bg-success/10 border-success/30"
                                        : isWrongSelection
                                        ? "bg-danger/10 border-danger/30"
                                        : isMissed
                                        ? "bg-warning/10 border-warning/30"
                                        : "border-transparent"
                                    }`}
                                  >
                                    {isCorrectSelection && <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />}
                                    {isWrongSelection && <XCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" />}
                                    {isMissed && <CheckCircle2 className="w-4 h-4 text-warning mt-0.5 shrink-0" />}
                                    {!wasSelected && !isCorrect && <div className="w-4 h-4 shrink-0" />}
                                    <span className={`${wasSelected ? "text-foreground" : "text-muted-foreground"}`}>
                                      {opt.text}
                                    </span>
                                    {isMissed && <span className="text-xs text-warning ml-auto shrink-0">(correct)</span>}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {q.type === "open_ended" && (
                            <div className="text-sm text-muted-foreground italic">
                              {answer?.openText?.trim() ? `"${answer.openText}"` : "No response provided"}
                            </div>
                          )}
                          
                          {/* Follow-up Question Display */}
                          {q.followUpQuestion && q.followUpOptions && answer?.followUpAnswer !== undefined && (
                            <div className="mt-4 pt-4 border-t border-border/50">
                              <p className="text-xs font-display text-muted-foreground mb-2">{q.followUpQuestion}</p>
                              <div className="space-y-1">
                                {q.followUpOptions.map((opt, idx) => {
                                  const isSelected = answer.followUpAnswer === idx;
                                  const maxPoints = Math.max(...q.followUpOptions!.map(o => o.points));
                                  const isBestAnswer = opt.points === maxPoints && maxPoints > 0;
                                  
                                  return (
                                    <div
                                      key={idx}
                                      className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg border ${
                                        isSelected && isBestAnswer
                                          ? "bg-success/10 border-success/30"
                                          : isSelected && !isBestAnswer
                                          ? "bg-primary/10 border-primary/30"
                                          : isBestAnswer && !isSelected
                                          ? "bg-warning/10 border-warning/30"
                                          : "border-transparent"
                                      }`}
                                    >
                                      {isSelected && isBestAnswer && <CheckCircle2 className="w-3 h-3 text-success mt-0.5 shrink-0" />}
                                      {isSelected && !isBestAnswer && <CircleDot className="w-3 h-3 text-primary mt-0.5 shrink-0" />}
                                      {!isSelected && isBestAnswer && <CheckCircle2 className="w-3 h-3 text-warning mt-0.5 shrink-0" />}
                                      {!isSelected && !isBestAnswer && <div className="w-3 h-3 shrink-0" />}
                                      <span className={`${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                                        {opt.text}
                                      </span>
                                      {!isSelected && isBestAnswer && <span className="text-xs text-warning ml-auto shrink-0">(+{opt.points})</span>}
                                      {isSelected && opt.points > 0 && <span className="text-xs text-muted-foreground ml-auto shrink-0">(+{opt.points})</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Recommendations Tab ── */}
        <TabsContent value="recommendations">
          <div className="space-y-4">
            {recommendations
              .filter((rec) => !isPartialAssessment || selectedCategories?.includes(rec.category))
              .map((rec) => {
              const config = levelConfig[rec.level];
              const hasBeenTested = testedCategories.has(rec.category);
              
              if (!hasBeenTested) {
                return (
                  <div
                    key={rec.category}
                    className="border rounded-xl p-5 bg-muted/20 border-border/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-display text-sm text-muted-foreground">{rec.category}</span>
                    </div>
                    <p className="text-sm text-muted-foreground/70 italic">
                      Take the assessment for this category to see personalized recommendations.
                    </p>
                  </div>
                );
              }
              
              return (
                <div
                  key={rec.category}
                  className={`border rounded-xl p-5 ${config.bg} ${config.border}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <config.icon className={`w-4 h-4 ${config.color}`} />
                    <span className={`font-display text-sm ${config.color}`}>{rec.category}</span>
                    <span className={`ml-auto text-xs font-display ${config.color}`}>{rec.level}</span>
                  </div>
                  <ul className="space-y-2">
                    {rec.suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${config.barColor}`} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
