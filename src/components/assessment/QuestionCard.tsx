import { Question, UserAnswer } from "@/data/types";
import { Textarea } from "@/components/ui/textarea";

interface QuestionCardProps {
  question: Question;
  answer?: UserAnswer;
  onAnswer: (answer: UserAnswer) => void;
}

export function QuestionCard({ question, answer, onAnswer }: QuestionCardProps) {
  const { id, type, question: text, options, maxPoints } = question;

  if (type === "self_rating") {
    const current = answer?.ratingValue ?? 0;
    const hasRating = current > 0;
    const showFollowUp = question.followUpOptions && question.followUpQuestion && hasRating;
    
    return (
      <div>
        <h2 className="text-xl md:text-2xl font-display text-foreground mb-8 leading-relaxed">
          {text}
        </h2>
        <div className="flex gap-3 flex-wrap">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              onClick={() =>
                onAnswer({ questionId: id, ratingValue: v, followUpAnswer: answer?.followUpAnswer })
              }
              className={`w-14 h-14 rounded-lg border font-display text-lg transition-all duration-200 ${
                current === v
                  ? "border-primary bg-primary/15 text-primary glow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-xs text-muted-foreground font-body">
          <span>Not confident</span>
          <span>Very confident</span>
        </div>
        
        {showFollowUp && (
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-lg font-display text-foreground mb-4 leading-relaxed">
              {question.followUpQuestion}
            </h3>
            <div className="space-y-3">
              {question.followUpOptions!.map((opt, idx) => {
                const isSelected = answer?.followUpAnswer === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onAnswer({ questionId: id, ratingValue: current, followUpAnswer: idx });
                    }}
                    className={`w-full text-left px-4 py-3.5 rounded-lg border transition-all duration-200 font-body text-sm ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </span>
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === "knowledge_check" && options) {
    const selected = answer?.selectedOptions ?? [];
    const hasSelection = selected.length > 0;
    const showFollowUp = question.followUpOptions && question.followUpQuestion && hasSelection;
    
    return (
      <div>
        <h2 className="text-xl md:text-2xl font-display text-foreground mb-2 leading-relaxed">
          {text}
        </h2>
        <p className="text-xs text-muted-foreground mb-6 font-body">
          Select all that apply
        </p>
        <div className="space-y-3">
          {options.map((opt, idx) => {
            const isSelected = selected.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => {
                  const next = isSelected
                    ? selected.filter((i) => i !== idx)
                    : [...selected, idx];
                  onAnswer({ questionId: id, selectedOptions: next, followUpAnswer: answer?.followUpAnswer });
                }}
                className={`w-full text-left px-4 py-3.5 rounded-lg border transition-all duration-200 font-body text-sm ${
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>
        
        {showFollowUp && (
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-lg font-display text-foreground mb-4 leading-relaxed">
              {question.followUpQuestion}
            </h3>
            <div className="space-y-3">
              {question.followUpOptions!.map((opt, idx) => {
                const isSelected = answer?.followUpAnswer === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onAnswer({ questionId: id, selectedOptions: selected, followUpAnswer: idx });
                    }}
                    className={`w-full text-left px-4 py-3.5 rounded-lg border transition-all duration-200 font-body text-sm ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </span>
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === "open_ended") {
    const hasText = answer?.openText && answer.openText.trim().length > 0;
    const showFollowUp = question.followUpOptions && question.followUpQuestion && hasText;
    
    return (
      <div>
        <h2 className="text-xl md:text-2xl font-display text-foreground mb-6 leading-relaxed">
          {text}
        </h2>
        <Textarea
          placeholder="Share your thoughts..."
          value={answer?.openText ?? ""}
          onChange={(e) =>
            onAnswer({ questionId: id, openText: e.target.value, followUpAnswer: answer?.followUpAnswer })
          }
          className="min-h-[150px] bg-card border-border text-foreground placeholder:text-muted-foreground/50 font-body resize-none focus:border-primary/50"
        />
        <p className="text-xs text-muted-foreground mt-2 font-body">
          This is for your reflection — no scoring applied.
        </p>
        
        {showFollowUp && (
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-lg font-display text-foreground mb-4 leading-relaxed">
              {question.followUpQuestion}
            </h3>
            <div className="space-y-3">
              {question.followUpOptions!.map((opt, idx) => {
                const isSelected = answer?.followUpAnswer === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onAnswer({ questionId: id, openText: answer.openText!, followUpAnswer: idx });
                    }}
                    className={`w-full text-left px-4 py-3.5 rounded-lg border transition-all duration-200 font-body text-sm ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </span>
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
