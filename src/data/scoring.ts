import { Category, CategoryScore, AssessmentResult, UserAnswer, Question } from "./types";
import { questions } from "./questions";

export function calculateResults(answers: Map<string, UserAnswer>): AssessmentResult {
  const scoredCategories: Category[] = [
    "Core Programming",
    "JavaScript & Runtime",
    "Frontend Concepts",
    "Backend Concepts",
    "Software Practices",
  ];

  const categoryScores: CategoryScore[] = scoredCategories.map((category) => {
    const categoryQuestions = questions.filter(
      (q) => q.category === category && q.type !== "open_ended"
    );

    let earned = 0;
    let max = 0;

    categoryQuestions.forEach((q) => {
      max += q.maxPoints;
      const answer = answers.get(q.id);
      if (!answer) return;

      if (q.type === "self_rating") {
        earned += answer.ratingValue ?? 0;
      } else if (q.type === "knowledge_check" && answer.selectedOptions) {
        answer.selectedOptions.forEach((idx) => {
          if (q.options && q.options[idx]) {
            earned += q.options[idx].points;
          }
        });
      }      
      // Add follow-up answer points
      if (q.followUpOptions && answer.followUpAnswer !== undefined) {
        const followUpOption = q.followUpOptions[answer.followUpAnswer];
        if (followUpOption) {
          earned += followUpOption.points;
          max += Math.max(...q.followUpOptions.map(opt => opt.points));
        }
      }      
      // Add follow-up answer points
      if (q.followUpOptions && answer.followUpAnswer !== undefined) {
        const followUpOption = q.followUpOptions[answer.followUpAnswer];
        if (followUpOption) {
          earned += followUpOption.points;
          max += Math.max(...q.followUpOptions.map(opt => opt.points));
        }
      }
    });

    const percentage = max > 0 ? Math.round((earned / max) * 100) : 0;
    const level: CategoryScore["level"] =
      percentage >= 80 ? "Strong" : percentage >= 50 ? "Moderate" : "Weak";

    return { category, earned, max, percentage, level };
  });

  const totalEarned = categoryScores.reduce((s, c) => s + c.earned, 0);
  const totalMax = categoryScores.reduce((s, c) => s + c.max, 0);
  const overallPercentage = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
  const overallLevel: CategoryScore["level"] =
    overallPercentage >= 80 ? "Strong" : overallPercentage >= 50 ? "Moderate" : "Weak";

  const openResponses = questions
    .filter((q) => q.type === "open_ended")
    .map((q) => ({
      question: q.question,
      answer: answers.get(q.id)?.openText ?? "",
    }))
    .filter((r) => r.answer.trim().length > 0);

  return { categoryScores, overallPercentage, overallLevel, openResponses };
}

export type Recommendation = {
  category: Category;
  level: CategoryScore["level"];
  suggestions: string[];
};

export function getRecommendations(scores: CategoryScore[]): Recommendation[] {
  const recs: Record<Category, Record<CategoryScore["level"], string[]>> = {
    "Core Programming": {
      Weak: [
        "Start with easy algorithm challenges on LeetCode or HackerRank (aim for 2-3 per week)",
        "Review fundamental data structures: understand when to use arrays vs maps vs sets",
        "Learn Big-O notation basics and practice analyzing simple algorithms",
        "Take a structured course on data structures and algorithms (Coursera, freeCodeCamp)",
        "Focus on understanding recursion through simple examples (factorial, fibonacci)",
      ],
      Moderate: [
        "Solve 3-5 medium-difficulty algorithm problems weekly to build confidence",
        "Study common design patterns and implement them in small projects",
        "Practice explaining your code's time/space complexity to others",
        "Refactor existing code to use more appropriate data structures",
        "Participate in code reviews to see different problem-solving approaches",
      ],
      Strong: [
        "Mentor junior developers on algorithmic thinking and best practices",
        "Contribute to open-source projects that require complex algorithms",
        "Optimize performance-critical sections of production codebases",
        "Write technical blog posts explaining advanced concepts you've mastered",
        "Prepare for system design interviews and architect scalable solutions",
      ],
    },
    "JavaScript & Runtime": {
      Weak: [
        "Master the fundamentals: var/let/const, hoisting, and scope rules",
        "Study the event loop through interactive visualizations (like Loupe by Philip Roberts)",
        "Practice writing and debugging async code with Promises and async/await",
        "Complete JavaScript30 or similar hands-on tutorial series",
        "Read 'You Don't Know JS' book series for deep understanding",
      ],
      Moderate: [
        "Build projects that use advanced async patterns (Promise.all, Promise.race)",
        "Learn Node.js internals: streams, buffers, and the event emitter pattern",
        "Explore modern ES6+ features: destructuring, generators, proxies",
        "Debug memory leaks and understand garbage collection",
        "Contribute to JS tooling projects (linters, bundlers) to see patterns",
      ],
      Strong: [
        "Contribute to JavaScript runtime internals or tooling (Babel, ESLint plugins)",
        "Write performance benchmarks and optimize V8-specific patterns",
        "Teach workshops or create content on advanced JavaScript concepts",
        "Explore cutting-edge proposals (TC39) and experiment with new features",
        "Build libraries or frameworks that require deep JS knowledge",
      ],
    },
    "Frontend Concepts": {
      Weak: [
        "Learn semantic HTML5 tags and when to use each (article, section, nav, etc.)",
        "Master CSS Flexbox and Grid through interactive games (Flexbox Froggy, Grid Garden)",
        "Study WCAG 2.1 accessibility guidelines and test with screen readers",
        "Build 3-5 responsive layouts from scratch without frameworks",
        "Learn React or Vue fundamentals through their official tutorials",
      ],
      Moderate: [
        "Build a reusable component library following atomic design principles",
        "Learn performance profiling with Chrome DevTools (Lighthouse, Performance tab)",
        "Explore state management patterns (Context API, Zustand, Redux)",
        "Implement advanced CSS techniques (CSS custom properties, animations)",
        "Practice mobile-first responsive design and cross-browser testing",
      ],
      Strong: [
        "Lead UI/UX architecture decisions and establish design systems",
        "Implement performance budgets and monitoring (Core Web Vitals)",
        "Explore micro-frontends or module federation for large applications",
        "Contribute to major frontend frameworks or popular component libraries",
        "Mentor team members on frontend best practices and modern patterns",
      ],
    },
    "Backend Concepts": {
      Weak: [
        "Learn RESTful API design principles and HTTP methods (GET, POST, PUT, DELETE)",
        "Practice SQL basics: SELECT, JOIN, WHERE clauses, and basic normalization",
        "Study authentication fundamentals (JWT, sessions, OAuth2 flows)",
        "Build a simple CRUD API using Express.js or FastAPI",
        "Understand the request-response cycle and middleware patterns",
      ],
      Moderate: [
        "Build full-stack projects integrating APIs with database operations",
        "Learn database indexing, query optimization, and explain plans",
        "Explore caching strategies (Redis, in-memory caching) and their trade-offs",
        "Implement proper error handling and logging in your APIs",
        "Study API security: rate limiting, input validation, CORS",
      ],
      Strong: [
        "Design scalable system architectures using microservices or serverless",
        "Lead API design reviews and establish REST/GraphQL best practices",
        "Explore event-driven architectures with message queues (RabbitMQ, Kafka)",
        "Implement distributed systems patterns (circuit breakers, retries)",
        "Optimize database performance for high-traffic applications",
      ],
    },
    "Software Practices": {
      Weak: [
        "Learn Git basics and common workflows (feature branches, pull requests)",
        "Start writing unit tests for new code using Jest or Vitest",
        "Practice giving constructive code review feedback on pull requests",
        "Set up a linter (ESLint) and formatter (Prettier) in your projects",
        "Learn to read and understand error messages and stack traces",
      ],
      Moderate: [
        "Set up CI/CD pipelines using GitHub Actions or GitLab CI",
        "Adopt test-driven development (TDD) for critical features",
        "Write comprehensive documentation for your projects (README, API docs)",
        "Learn Docker basics and containerize your applications",
        "Document architectural decisions using ADRs (Architecture Decision Records)",
      ],
      Strong: [
        "Champion engineering excellence and best practices across your organization",
        "Lead initiatives to reduce technical debt and improve code quality",
        "Establish testing strategies, quality gates, and review standards",
        "Mentor team members on Git workflows, testing, and DevOps practices",
        "Implement observability: logging, monitoring, and alerting systems",
      ],
    },
    "Self-Reflection": {
      Weak: [],
      Moderate: [],
      Strong: [],
    },
  };

  return scores
    .filter((s) => s.category !== "Self-Reflection")
    .map((s) => ({
      category: s.category,
      level: s.level,
      suggestions: recs[s.category]?.[s.level] ?? [],
    }));
}
