# Loan Picks Dashboard

A Next.js web application that allows users to explore personalized loan products, ask questions from an AI chatbot, and view a comprehensive list of all loan products with their features.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Browser)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Dashboard  │  │ All Products │  │  AI Chat UI  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Middleware  │  │  API Routes  │  │  Auth (JWT)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   PostgreSQL Database     │  │   Google Gemini AI API   │
│  ┌──────────────────────┐ │  │  (Product Q&A Context)   │
│  │  products            │ │  └──────────────────────────┘
│  │  users               │ │
│  │  ai_chat_messages    │ │
│  └──────────────────────┘ │
└──────────────────────────┘
```

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode, no `any` types)
- **UI Library**: shadcn/ui with Tailwind CSS
- **Database**: PostgreSQL (with Drizzle ORM)
- **Validation**: Zod
- **Backend**: Next.js Route Handlers
- **AI**: Google Gemini API (free tier)
- **Authentication**: NextAuth.js with JWT
- **Deployment**: Vercel-ready

## Features

### 1. Dashboard (Top 5 Personalized Products)
- Displays the top 5 loan products sorted by APR
- Best Match card with highlighted features
- Product cards with dynamic badges
- "Ask About Product" button for each product

### 2. All Products Page
- Grid view of all loan products
- Advanced filtering:
  - Bank name search
  - APR range (min/max)
  - Minimum income
  - Minimum credit score
  - Loan type

### 3. AI Chat Assistant
- Context-aware chat for each product
- Grounded responses based on product data
- Conversation history support
- Real-time streaming UI

## Badge Logic

The application dynamically generates badges for each product based on the following criteria:

1. **Low APR**: APR < 10% → Green badge
2. **No Prepayment Charges**: `prepaymentAllowed === true` → Green badge
3. **Fast Disbursal**: `disbursalSpeed === "instant" | "fast"` → Default badge
4. **Flexible Tenure**: Tenure range ≥ 48 months → Secondary badge
5. **Low Documentation**: `docsLevel === "minimal"` → Green badge
6. **Salary Eligibility**: Min income ≤ ₹3L → Outline badge with amount
7. **Credit Score**: 
   - ≥ 750 → Green badge
   - ≥ 700 → Outline badge
8. **Limited-Time Offer**: Random (30% chance) → Warning badge
9. **Zero Processing Fee**: `processingFeePct === 0` → Green badge

Maximum 5 badges per product, prioritized by importance.

## AI Grounding Strategy

The AI chat is grounded to product-specific data using the following approach:

1. **Product Context Injection**: When a user asks a question, the system:
   - Fetches the complete product record from the database
   - Extracts all relevant fields (APR, income, credit score, tenure, etc.)
   - Includes FAQ and terms data
   - Formats this as structured context

2. **System Prompt**: The AI is instructed to:
   - Answer questions ONLY based on the provided product information
   - If information is not available, politely decline and suggest contacting the bank
   - Be concise, accurate, and helpful
   - Cite specific product attributes when relevant

3. **Conversation History**: The chat maintains context across messages:
   - Previous user questions and AI responses are included
   - Allows for follow-up questions
   - History is sent with each request to maintain coherence

4. **Error Handling**: 
   - If product not found → 404 error
   - If AI API fails → Graceful error message
   - If question is out of scope → AI responds with fallback message

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (local or hosted)
- Google AI API key (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd loan-picks-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/loan_picks
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_random_secret_here
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   # Or use the migration script:
   npx tsx scripts/migrate.ts
   ```

5. **Seed the database**
   ```bash
   npx tsx scripts/seed.ts
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

### Database Setup

#### Option 1: Local PostgreSQL

1. Install PostgreSQL
2. Create a database:
   ```sql
   CREATE DATABASE loan_picks;
   ```
3. Update `DATABASE_URL` in `.env`

#### Option 2: Supabase

1. Create a Supabase project
2. Get your connection string from project settings
3. Update `DATABASE_URL` in `.env`

### Authentication

The app uses NextAuth.js with JWT strategy. For demo purposes, any email/password combination will work (users are auto-created). In production, implement proper password hashing and validation.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth routes
│   │   ├── products/               # GET /api/products
│   │   └── ai/ask/                 # POST /api/ai/ask
│   ├── auth/signin/                # Sign in page
│   ├── products/                   # All products page
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Dashboard (home)
│   └── globals.css                 # Global styles
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── dashboard.tsx               # Dashboard component
│   ├── product-card.tsx            # Product card component
│   ├── best-match-card.tsx         # Best match card
│   ├── product-chat.tsx            # AI chat component
│   └── providers.tsx               # Session provider
├── lib/
│   ├── db/
│   │   ├── schema.ts               # Database schema
│   │   ├── index.ts                # DB connection
│   │   └── seed.ts                 # Seed data
│   ├── auth.ts                     # NextAuth config
│   ├── validations.ts              # Zod schemas
│   ├── badge-logic.ts              # Badge generation logic
│   └── utils.ts                    # Utility functions
├── scripts/
│   ├── migrate.ts                  # Database migration
│   └── seed.ts                     # Seed script
├── middleware.ts                    # Next.js middleware
└── types/
    └── next-auth.d.ts              # NextAuth type definitions
```

## API Routes

### GET /api/products

Fetch all products with optional filters.

**Query Parameters:**
- `bank` (string): Filter by bank name (partial match)
- `minApr` (number): Minimum APR
- `maxApr` (number): Maximum APR
- `minIncome` (number): Minimum income
- `minCreditScore` (number): Minimum credit score
- `type` (string): Loan type (personal, education, vehicle, home, credit_line, debt_consolidation)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Product Name",
    "bank": "Bank Name",
    "type": "personal",
    "rateApr": "10.5",
    ...
  }
]
```

### POST /api/ai/ask

Ask a question about a specific product.

**Request Body:**
```json
{
  "productId": "uuid",
  "message": "What is the minimum credit score?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:**
```json
{
  "answer": "The minimum credit score required is 750...",
  "productId": "uuid"
}
```

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

- `DATABASE_URL`: Production PostgreSQL connection string
- `NEXTAUTH_URL`: Your production URL
- `NEXTAUTH_SECRET`: Strong random secret
- `GOOGLE_AI_API_KEY`: Your Google AI API key

## Development

### Type Checking
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Database Commands
```bash
npm run db:generate  # Generate migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
```

## Testing

1. Sign in with any email/password
2. View dashboard with top 5 products
3. Click "Ask About Product" to test AI chat
4. Navigate to "All Products" and test filters
5. Verify badges appear correctly on products

## Future Enhancements

- [ ] User profile with income/credit score for better personalization
- [ ] Save favorite products
- [ ] Compare products side-by-side
- [ ] Email notifications for new matching products
- [ ] Advanced AI features (product recommendations, loan calculator)
- [ ] OAuth providers (Google, GitHub)
- [ ] Admin dashboard for managing products

## License

This project is created for the ClickPe Assignment.

## Contact

For questions or issues, please contact the development team.

