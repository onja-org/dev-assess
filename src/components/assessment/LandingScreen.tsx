import { motion } from "framer-motion";
import { ArrowRight, Code2, Brain, Layers, Settings2, RotateCcw, BarChart3, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Category } from "@/data/types";
import { useState } from "react";

interface LandingScreenProps {
  onStart: (categories?: Category[]) => void;
  hasSavedProgress?: boolean;
  onClearProgress?: () => void;
  hasCompletedAssessment?: boolean;
  onViewResults?: () => void;
}

const features: Array<{ icon: any; label: Category; desc: string }> = [
  { icon: Code2, label: "Core Programming", desc: "Data structures, algorithms & fundamentals" },
  { icon: Layers, label: "Frontend Concepts", desc: "UI patterns, performance & accessibility" },
  { icon: Settings2, label: "Backend Concepts", desc: "APIs, databases & system design" },
  { icon: Brain, label: "Software Practices", desc: "Testing, version control & code quality" },
];

export function LandingScreen({ onStart, hasSavedProgress, onClearProgress, hasCompletedAssessment, onViewResults }: LandingScreenProps) {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleStartSelected = () => {
    if (selectedCategories.length > 0) {
      onStart(selectedCategories);
    }
  };

  const handleStartAll = () => {
    setSelectedCategories([]);
    onStart();
  };

  const hasSelection = selectedCategories.length > 0;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-xs font-display text-muted-foreground">
            35 questions · ~10 minutes
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight mb-4">
          <span className="text-gradient">dev</span>
          <span className="text-foreground">::assess</span>
        </h1>

        <p className="text-lg text-muted-foreground mb-12 max-w-lg mx-auto leading-relaxed">
          Identify your strengths and skill gaps across core engineering
          disciplines. Get instant, actionable feedback.
        </p>

        {hasCompletedAssessment && !hasSavedProgress && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-lg border border-success/30 bg-success/10"
          >
            <p className="text-sm text-success font-display mb-3">
              You've completed the assessment! View your results or start a new one.
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              {onViewResults && (
                <Button
                  onClick={onViewResults}
                  size="sm"
                  className="gap-2 bg-success text-success-foreground hover:bg-success/90 font-display"
                >
                  <BarChart3 className="w-3 h-3" />
                  View Results
                </Button>
              )}
              <Button
                onClick={onStart}
                size="sm"
                variant="outline"
                className="gap-2 border-primary/30 text-primary hover:bg-primary/10 font-display"
              >
                <ArrowRight className="w-3 h-3" />
                Take Again
              </Button>
            </div>
          </motion.div>
        )}

        {hasSavedProgress && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-lg border border-warning/30 bg-warning/10"
          >
            <p className="text-sm text-warning font-display mb-3">
              You have saved progress! Continue where you left off.
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button
                onClick={onStart}
                size="sm"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-display"
              >
                <ArrowRight className="w-3 h-3" />
                Continue
              </Button>
              {onClearProgress && (
                <Button
                  onClick={onClearProgress}
                  size="sm"
                  variant="outline"
                  className="gap-2 border-warning/30 text-warning hover:bg-warning/10 font-display"
                >
                  <RotateCcw className="w-3 h-3" />
                  Start Fresh
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {!hasSavedProgress && !hasCompletedAssessment && (
          <div className="space-y-4">
            <Button
              onClick={handleStartAll}
              size="lg"
              className="gap-3 bg-primary text-primary-foreground hover:bg-primary/90 glow-sm font-display text-sm px-8 py-6 w-full sm:w-auto"
            >
              Take Full Assessment
              <ArrowRight className="w-4 h-4" />
            </Button>
            {hasSelection && (
              <Button
                onClick={handleStartSelected}
                size="lg"
                variant="outline"
                className="gap-3 border-primary/50 text-primary hover:bg-primary/10 font-display text-sm px-8 py-6 w-full sm:w-auto ml-0 sm:ml-3"
              >
                Start Selected ({selectedCategories.length})
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            <p className="text-xs text-muted-foreground font-display mt-3">
              {hasSelection ? "Click categories below to adjust selection" : "Or click categories below to choose specific areas"}
            </p>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-16 max-w-2xl w-full relative z-10"
      >
        {features.map((f, i) => {
          const isSelected = selectedCategories.includes(f.label);
          return (
            <motion.button
              key={f.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
              onClick={() => toggleCategory(f.label)}
              className={`flex items-start gap-3 p-4 rounded-lg border transition-all text-left ${
                isSelected
                  ? "border-primary bg-primary/10 card-hover"
                  : "border-border bg-card/50 card-hover"
              }`}
            >
              <div className="relative">
                <f.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                {isSelected && (
                  <CheckCircle2 className="w-3 h-3 text-primary absolute -top-1 -right-1 bg-background rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-display text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
