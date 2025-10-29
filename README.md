# 📊 FinScore Analyzer - Complete Documentation

> **Production-Ready Financial Analysis SaaS Platform**  
> Built with Next.js 15, TypeScript, Supabase, and AI-powered analysis

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22.18.0 or higher
- npm 11.5.2 or higher
- Supabase account (free tier works)
- OpenAI API key (optional, for AI features)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd finscore-analyser

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev
```

The application will be available at **http://localhost:3000**

---

## 📁 Project Structure

```
finscore-analyser/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── api/               # API endpoints
│   │   ├── dashboard/         # Main dashboard
│   │   ├── my-reports/        # User reports
│   │   └── reports/[jobId]/   # Report viewer
│   ├── components/            # React components
│   │   ├── analytics/         # Charts & visualizations
│   │   ├── dashboard/         # Dashboard widgets
│   │   ├── ui/               # Reusable UI components
│   │   └── upload/           # File upload components
│   ├── lib/                   # Core business logic
│   │   ├── analysis/         # Analysis services (13+ modules)
│   │   ├── parsing/          # File parsers (PDF, CSV, Excel)
│   │   ├── services/         # Business services layer
│   │   └── monitoring/       # Sentry error tracking
│   ├── hooks/                # Custom React hooks
│   ├── contexts/             # React Context providers
│   └── types/                # TypeScript type definitions
├── sql/                      # Database schemas & migrations
├── e2e/                      # Playwright E2E tests
├── tests/                    # Unit & integration tests
└── public/                   # Static assets
```

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.5.3** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Chart.js** - Data visualizations
- **React Hot Toast** - Notifications
- **Heroicons** - Icon library

### Backend & Services
- **Supabase** - Authentication, Database (PostgreSQL), Storage
- **BullMQ + Redis** - Background job processing
- **WebSocket (ws)** - Real-time updates
- **OpenAI API** - AI-powered analysis
- **Tesseract.js** - OCR for scanned documents
- **pdf-parse, ExcelJS** - File parsing

### Development Tools
- **ESLint** - Code linting
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Sentry** - Error monitoring
- **Prettier** - Code formatting (configured)

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────┐
│          CLIENT (Browser)                   │
│  - Next.js Pages                            │
│  - React Components                         │
│  - Chart.js Visualizations                  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│     MIDDLEWARE (Edge Runtime)               │
│  - Authentication Check                     │
│  - Route Protection                         │
│  - Session Management                       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│        API LAYER (Route Handlers)           │
│  - /api/upload                              │
│  - /api/analysis-jobs                       │
│  - /api/reports                             │
│  - /api/auth                                │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│      BUSINESS SERVICES LAYER                │
│  - Job Queue Service (BullMQ)               │
│  - AI Service (OpenAI)                      │
│  - Payment Service (Stripe)                 │
│  - Email Service (Resend)                   │
│  - Report Export Service                    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│       ANALYSIS ENGINE (13+ Modules)         │
│  - Categorization Service                   │
│  - Risk Assessment Service                  │
│  - Fraud Detection Service                  │
│  - FOIR Calculation Service                 │
│  - Income Verification Service              │
│  - Banking Behavior Service                 │
│  - Monthly Summary Service                  │
│  - Trend Analysis Service                   │
│  - Red Alert Service                        │
│  └─ + 4 more specialized modules            │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│       DATA PARSING LAYER                    │
│  - Master Parser (Format Detection)         │
│  - PDF Parser (pdf-parse, Tesseract)        │
│  - CSV Parser                               │
│  - Excel Parser (ExcelJS)                   │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│       DATA LAYER (Supabase)                 │
│  - PostgreSQL Database                      │
│  - File Storage (S3-compatible)             │
│  - Row Level Security (RLS)                 │
│  - Real-time Subscriptions                  │
└─────────────────────────────────────────────┘
```

### Data Flow

#### 1. **Upload → Analysis Pipeline**

```
User Upload File
       ↓
/api/upload validates & saves to Supabase Storage
       ↓
Creates analysis_job record (status: 'pending')
       ↓
Adds job to BullMQ queue
       ↓
Worker picks up job:
   1. Downloads file from storage
   2. Bank format detection (HDFC, ICICI, SBI, etc.)
   3. Parses transactions
   4. Categorizes transactions (15+ categories)
   5. Calculates financial summary
   6. Assesses risk (0-100 score)
   7. Detects fraud patterns
   8. Calculates FOIR ratio
   9. Verifies income stability
  10. Analyzes banking behavior
  11. Generates monthly summaries
  12. Creates AI executive summary (optional)
  13. Saves all results to database
       ↓
Updates job status to 'completed'
       ↓
User views report at /reports/[jobId]
```

#### 2. **Authentication Flow**

```
User visits protected route (e.g., /dashboard)
       ↓
Middleware checks for session cookie
       ↓
No session? → Redirect to /login
       ↓
Has session? → Allow access
       ↓
API routes validate session for each request
       ↓
Supabase RLS enforces data access control
```

---

## 📊 Key Features

### ✅ **Implemented & Working**

1. **File Upload & Parsing**
   - ✅ PDF bank statements (OCR support)
   - ✅ CSV files
   - ✅ Excel spreadsheets
   - ✅ Automatic bank format detection (10+ banks)

2. **Financial Analysis**
   - ✅ Transaction categorization (15+ categories)
   - ✅ Income vs. Expense tracking
   - ✅ Net cash flow calculation
   - ✅ Savings rate analysis
   - ✅ Monthly summaries with trends

3. **Risk Assessment**
   - ✅ Overall risk score (0-100)
   - ✅ FOIR (Fixed Obligation to Income Ratio)
   - ✅ Fraud detection (gambling, bounced payments, etc.)
   - ✅ Red alerts (critical issues flagging)
   - ✅ Income verification
   - ✅ Banking behavior score

4. **Reporting & Export**
   - ✅ Interactive dashboard
   - ✅ Detailed report viewer (9 tabs)
   - ✅ PDF export
   - ✅ Excel export
   - ✅ Chart visualizations (Line, Doughnut, Bar)

5. **User Management**
   - ✅ Authentication (Supabase Auth)
   - ✅ Session management
   - ✅ Protected routes
   - ✅ User profile management

6. **Performance & Monitoring**
   - ✅ Background job processing (BullMQ)
   - ✅ Error tracking (Sentry)
   - ✅ Progress tracking for long jobs

### 🔧 **Partially Implemented**

7. **Real-time Updates**
   - ⚠️ WebSocket server configured
   - ⚠️ Broadcasts disabled (circular dependency issue)
   - 📝 **TODO**: Extract WebSocket service to standalone module

8. **Multi-Statement Analysis**
   - ⚠️ Service created but not exposed via API
   - 📝 **TODO**: Create `/api/consolidated-analysis/[jobId]` endpoint

9. **Credit Bureau Integration**
   - ⚠️ Service scaffolded
   - 📝 **TODO**: Create `/api/credit-bureau/[userId]` endpoint
   - 📝 **TODO**: Integrate with Experian/CIBIL API

### 🚧 **Planned Features**

10. **Enhanced Security**
    - 📝 Add Zod input validation across all API routes
    - 📝 Implement rate limiting
    - 📝 Add CSRF protection
    - 📝 Request size limits

11. **Testing & Quality**
    - 📝 Increase unit test coverage to 70%+
    - 📝 Add integration tests for critical flows
    - 📝 Expand E2E test suite

12. **Scalability**
    - 📝 Horizontal worker scaling
    - 📝 Redis cluster setup
    - 📝 CDN for static assets
    - 📝 Database connection pooling optimization

---

## 🗄️ Database Schema

### Core Tables

#### `users` (Supabase Auth)
- Managed by Supabase
- Contains: id, email, created_at, metadata

#### `analysis_jobs`
```sql
- id (uuid, primary key)
- user_id (uuid, references users)
- report_name (text)
- reference_id (text, unique)
- status (text: 'pending' | 'processing' | 'completed' | 'failed')
- file_url (text)
- file_type (text)
- progress (integer, 0-100)
- results (jsonb) -- All analysis results stored here
- created_at (timestamp)
- updated_at (timestamp)
```

#### `bank_transactions`
```sql
- id (uuid, primary key)
- job_id (uuid, references analysis_jobs)
- user_id (uuid, references users)
- date (date)
- description (text)
- debit (numeric)
- credit (numeric)
- balance (numeric)
- category (text)
- subcategory (text)
- created_at (timestamp)
```

#### `analysis_results`
```sql
- id (uuid, primary key)
- job_id (uuid, references analysis_jobs)
- user_id (uuid, references users)
- result_type (text)
- result_data (jsonb)
- created_at (timestamp)
```

#### `statement_groups`
```sql
- id (uuid, primary key)
- user_id (uuid, references users)
- name (text)
- description (text)
- created_at (timestamp)
```

#### `statement_group_members`
```sql
- id (uuid, primary key)
- group_id (uuid, references statement_groups)
- job_id (uuid, references analysis_jobs)
- created_at (timestamp)
```

### Row Level Security (RLS)

All tables have RLS enabled with policies:
- Users can only read/write their own data
- Based on `auth.uid() = user_id`

---

## 🔐 Environment Variables

Create `.env.local` with the following:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI (Optional - for AI analysis)
OPENAI_API_KEY=your_openai_api_key

# Stripe (Optional - for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Resend Email (Optional)
RESEND_API_KEY=your_resend_api_key

# Redis (for BullMQ - production only)
REDIS_URL=your_redis_url

# Sentry (Optional - for error tracking)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests (requires server running)
npm run test:e2e

# All tests
npm run test:all

# Coverage report
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/               # Unit tests
│   └── lib/
│       └── analysis/
│           └── foir-service.test.ts
├── integration/        # Integration tests
│   └── api/
│       └── upload.test.ts
└── e2e/               # E2E tests (Playwright)
    ├── auth-smoke.spec.ts
    ├── smoke-tests.spec.ts
    └── example.spec.ts
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Important:**
- Add all environment variables in Vercel dashboard
- Configure Redis add-on for BullMQ
- Set up Supabase production database

### Docker (Alternative)

```dockerfile
# Dockerfile included in project
docker build -t finscore-analyzer .
docker run -p 3000:3000 finscore-analyzer
```

---

## 📝 Development Workflow

### 1. **Create a New Feature**

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# ... code ...

# Test locally
npm run dev
npm run test

# Commit
git add .
git commit -m "feat: your feature description"

# Push
git push origin feature/your-feature-name

# Create Pull Request
```

### 2. **Add a New Analysis Service**

```typescript
// src/lib/analysis/your-service.ts
import { CategorizedTransaction } from './categorization-service';

export interface YourAnalysisResult {
  // Define your result structure
  score: number;
  status: string;
}

export function analyzeYourFeature(
  transactions: CategorizedTransaction[]
): YourAnalysisResult {
  // Your analysis logic
  return {
    score: 85,
    status: 'Good'
  };
}
```

Then integrate in `src/lib/services/index.ts`:

```typescript
import { analyzeYourFeature } from '../analysis/your-service';

// In the analysis workflow:
const yourResult = analyzeYourFeature(categorizedTransactions);
```

### 3. **Add a New API Endpoint**

```typescript
// src/app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: async () => cookieStore });
  
  // Validate authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Your logic here
  return NextResponse.json({ message: 'Success' });
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Port 3000 already in use**

```powershell
# Kill process on Windows
netstat -ano | findstr ":3000"
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

#### 2. **Supabase connection errors**

- Verify environment variables in `.env.local`
- Check Supabase project URL and keys
- Ensure RLS policies are configured
- Run `node test-supabase-connection.js` to verify

#### 3. **Build errors**

```bash
# Clear cache
rm -rf .next
npm run build
```

#### 4. **TypeScript errors**

```bash
# Type check only
npx tsc --noEmit

# With verbose output
npx tsc --noEmit --pretty
```

#### 5. **WebSocket connection fails**

- WebSocket server runs on port 8080
- Check if another process is using the port
- Currently, broadcasts are disabled (see INTEGRATION_ANALYSIS.md)

---

## 🔧 Configuration Files

### `next.config.js`
- Webpack caching optimized for dev speed
- Security headers configured
- Image domains whitelisted
- TypeScript strict mode enabled

### `tailwind.config.js`
- Custom color palette
- Extended spacing utilities
- Custom font families
- Animation configurations

### `tsconfig.json`
- Strict type checking enabled
- Path aliases configured (`@/` → `src/`)
- Next.js 15 compatibility

### `server.js`
- Custom Node.js server for WebSocket support
- HTTP server wraps Next.js handler
- WebSocket server on `/api/websocket` path

---

## 📚 API Documentation

### Authentication Endpoints

#### `POST /api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### `POST /api/auth/signup`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Analysis Endpoints

#### `POST /api/upload`
Upload a bank statement file
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (File)
- **Response**: `{ jobId, status }`

#### `GET /api/analysis-jobs/:jobId`
Get analysis job status and results
- **Auth**: Required
- **Response**: Full job details + analysis results

#### `GET /api/reports/:jobId/export?format=pdf`
Export report as PDF or Excel
- **Auth**: Required
- **Query**: `format` (pdf | excel)
- **Response**: Binary file download

---

## 🤝 Contributing

### Code Style

- Use TypeScript for all new files
- Follow existing folder structure
- Add types for all functions
- Write tests for new features
- Use meaningful commit messages

### Commit Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code formatting
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks
```

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🆘 Support

For issues, questions, or feature requests:
1. Check this documentation
2. Review `INTEGRATION_ANALYSIS.md` for architecture details
3. Check GitHub Issues
4. Contact development team

---

## 📊 Performance Benchmarks

- **Average upload processing**: 5-15 seconds for 100 transactions
- **Report generation**: < 2 seconds
- **PDF export**: 3-5 seconds
- **Excel export**: 2-4 seconds
- **Page load time**: < 1 second (cached)

---

## 🎯 Roadmap (2025)

### Q1 2025
- ✅ Core platform MVP
- ✅ Basic analysis features
- ✅ Report generation

### Q2 2025
- 🔄 Multi-statement consolidation API
- 🔄 Credit bureau integration
- 🔄 Enhanced fraud detection
- 🔄 Test coverage to 70%+

### Q3 2025
- 📝 Mobile app (React Native)
- 📝 Advanced AI insights
- 📝 Custom report builder
- 📝 API for third-party integrations

### Q4 2025
- 📝 Enterprise features
- 📝 White-label solution
- 📝 Advanced analytics dashboard
- 📝 Machine learning models

---

**Built with ❤️ by the FinScore Team**  
Last Updated: January 2025
