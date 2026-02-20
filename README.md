# Dev::assess - Developer Skills Assessment

A comprehensive, interactive skills assessment platform for developers to evaluate their technical knowledge across multiple engineering disciplines.

## Features

- **Multi-Category Assessment**: Test your skills in Core Programming, JavaScript & Runtime, Frontend Concepts, Backend Concepts, and Software Practices
- **Flexible Testing**: Choose to take the full assessment or select specific categories
- **Interactive Question Types**: 
  - Self-rating questions with follow-up insights
  - Knowledge check questions with multiple correct answers
  - Open-ended reflection questions
- **Smart Follow-up Questions**: Contextual follow-ups that assess practical application and real-world decision-making
- **Auto-Save Progress**: Automatically saves your answers to localStorage - resume anytime
- **Comprehensive Results**: 
  - Visual radar charts showing skill distribution
  - Detailed answer review with correct/incorrect feedback
  - Personalized recommendations based on your performance level
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Getting Started

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Technologies

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI framework with hooks
- **Framer Motion** - Animation library
- **Recharts** - Data visualization for radar charts
- **shadcn/ui** - Accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## Project Structure

```
src/
├── components/
│   ├── assessment/
│   │   ├── LandingScreen.tsx    # Category selection and start screen
│   │   ├── QuestionCard.tsx     # Question display with follow-ups
│   │   ├── ResultsScreen.tsx    # Results, charts, and recommendations
│   │   └── ProgressBar.tsx      # Progress indicator
│   └── ui/                      # shadcn/ui components
├── data/
│   ├── questions.ts             # All assessment questions
│   ├── scoring.ts               # Scoring logic and recommendations
│   └── types.ts                 # TypeScript interfaces
├── pages/
│   └── Index.tsx                # Main app orchestration
└── lib/
    └── utils.ts                 # Utility functions
```

## Key Features Implementation

### LocalStorage Persistence
All user progress is automatically saved to browser localStorage:
- Answers (including follow-up responses)
- Current question index
- Selected categories
- Assessment completion status

### Scoring System
- Questions are weighted based on difficulty
- Follow-up questions add bonus points for better practices
- Results categorized into: Strong (80%+), Moderate (50-79%), Weak (<50%)
- Personalized recommendations for each skill level

### Category-Based Testing
Users can choose to:
- Take the full assessment (all categories)
- Select specific categories (e.g., just Frontend + Backend)
- Resume partial assessments
- View results for completed assessments

## Development Tips

### Adding New Questions
1. Open `src/data/questions.ts`
2. Add questions following the existing structure
3. Include `followUpQuestion` and `followUpOptions` for deeper insights
4. Questions support three types: `self_rating`, `knowledge_check`, `open_ended`

### Customizing Recommendations
Edit `src/data/scoring.ts` to modify recommendations for each:
- Category (Core Programming, JavaScript, Frontend, Backend, Software Practices)
- Skill level (Weak, Moderate, Strong)

### Styling
- Global styles: `src/index.css`
- Theme colors: `src/index.css` (CSS variables)
- Component styles: Tailwind utility classes

## License

MIT

