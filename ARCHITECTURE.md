# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Dashboard  │  │ All Products │  │  AI Chat UI  │      │
│  │  (Top 5)     │  │  (Filtered)  │  │  (Sheet)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Middleware Layer                          │   │
│  │  - Authentication check (JWT)                         │   │
│  │  - Route protection                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Routes                                │   │
│  │  - GET  /api/products (with filters)                  │   │
│  │  - POST /api/ai/ask (product Q&A)                     │   │
│  │  - POST /api/auth/[...nextauth] (authentication)      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Business Logic                            │   │
│  │  - Badge generation logic                              │   │
│  │  - Product filtering                                   │   │
│  │  - AI prompt construction                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   PostgreSQL Database     │  │   Google Gemini AI API   │
│  ┌──────────────────────┐ │  │                         │
│  │  products            │ │  │  - Product context      │
│  │  - id, name, bank    │ │  │  - FAQ data             │
│  │  - rate, income, etc │ │  │  - Terms & conditions   │
│  │                      │ │  │  - Conversation history  │
│  │  users               │ │  │                         │
│  │  - id, email, name   │ │  │  Returns:               │
│  │                      │ │  │  - Grounded answers      │
│  │  ai_chat_messages    │ │  │  - Product-specific     │
│  │  - user_id, product  │ │  │    responses            │
│  │  - role, content     │ │  │                         │
│  └──────────────────────┘ │  └──────────────────────────┘
└──────────────────────────┘
```

## Data Flow

### Dashboard Load Flow

1. User signs in → NextAuth creates JWT session
2. Dashboard component mounts
3. `useEffect` triggers API call to `/api/products`
4. API route queries database (no filters, gets all)
5. Client sorts by APR and takes top 5
6. Renders Best Match card + 4 other product cards
7. Each card shows dynamic badges based on product attributes

### AI Chat Flow

1. User clicks "Ask About Product" button
2. Sheet component opens with product context
3. User types question and sends
4. Client sends POST to `/api/ai/ask` with:
   - `productId`: UUID of the product
   - `message`: User's question
   - `history`: Previous messages in conversation
5. API route:
   - Validates request with Zod
   - Fetches product from database
   - Constructs AI prompt with product data + FAQs + terms
   - Sends to Google Gemini API
   - Returns grounded answer
6. Client displays answer in chat UI
7. Conversation history maintained for follow-up questions

### Product Filtering Flow

1. User navigates to `/products` page
2. Page loads all products initially
3. User applies filters (bank, APR range, income, credit score, type)
4. Client constructs query parameters
5. Sends GET request to `/api/products?bank=...&minApr=...`
6. API route:
   - Validates filters with Zod
   - Builds Drizzle ORM query with conditions
   - Executes filtered query
   - Returns matching products
7. Client renders filtered results in grid

## Component Hierarchy

```
app/
├── layout.tsx (Root layout with providers)
├── page.tsx (Dashboard - protected)
├── products/
│   └── page.tsx (All products - protected)
└── auth/
    └── signin/
        └── page.tsx (Public)

components/
├── dashboard.tsx
│   ├── BestMatchCard
│   └── ProductCard (x4)
│       └── ProductChat (Sheet)
├── product-card.tsx
│   └── ProductChat
├── best-match-card.tsx
│   └── ProductChat
└── product-chat.tsx
    └── Sheet (from shadcn/ui)
```

## Security

1. **Authentication**: NextAuth.js with JWT strategy
2. **Middleware**: Protects all routes except `/auth/*`
3. **API Routes**: Check for valid session
4. **Input Validation**: Zod schemas for all API inputs
5. **SQL Injection**: Prevented by Drizzle ORM (parameterized queries)
6. **XSS**: React automatically escapes content

## Performance Optimizations

1. **Server Components**: Dashboard and Products pages use client components only where needed
2. **Database Indexing**: UUID primary keys, indexed foreign keys
3. **API Caching**: Can add Next.js caching headers if needed
4. **Image Optimization**: Not applicable (no images)
5. **Code Splitting**: Automatic with Next.js App Router

## Scalability Considerations

1. **Database**: Can add indexes on frequently filtered columns (bank, type, rate_apr)
2. **AI API**: Google Gemini has rate limits; can implement queuing if needed
3. **Caching**: Can add Redis for product data caching
4. **CDN**: Static assets served via Vercel CDN
5. **Load Balancing**: Vercel handles automatically

## Error Handling

1. **API Errors**: Try-catch blocks with proper error responses
2. **Database Errors**: Caught and logged, user-friendly messages
3. **AI API Errors**: Graceful fallback messages
4. **Network Errors**: Client-side error states with retry options
5. **Validation Errors**: Zod provides detailed error messages

## Testing Strategy (Future)

1. **Unit Tests**: Badge logic, validation schemas
2. **Integration Tests**: API routes with test database
3. **E2E Tests**: User flows (sign in, view products, chat)
4. **AI Testing**: Mock AI responses for consistent testing

