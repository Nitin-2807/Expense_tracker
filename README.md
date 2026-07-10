# Smart Expense Tracker

A full-stack personal finance tracking app with **Clerk authentication**, **multi-user support**, and a modern responsive UI.

![Tech Stack](https://img.shields.io/badge/Frontend-React_19_•_TypeScript_6_•_Tailwind_CSS_3-blue)
![Tech Stack](https://img.shields.io/badge/Backend-FastAPI_•_SQLAlchemy_•_SQLite-green)
![Auth](https://img.shields.io/badge/Auth-Clerk_•_JWT-purple)

---

## Features

- **Dashboard** — Balance overview, spending by category (pie chart), monthly trends (bar chart), recent transactions
- **Transactions** — Unified income + expense listing with search, filter, sort, and pagination
- **CRUD** — Add, edit, and delete expenses and income
- **Categories** — 8 default categories with emoji icons, customizable colors, and support for custom categories
- **Multi-user** — Clerk authentication with lazy user creation; each user sees only their own data
- **Fallback auth** — Legacy JWT cookie auth works when Clerk is not configured
- **Responsive** — Desktop sidebar + mobile bottom navigation
- **Dark mode** — Light / Dark / System theme with persisted preference
- **Rate limiting** — Signup and login endpoints are rate-limited
- **7 months of sample data** — Realistic Indian expenses and income (Jan–Jul 2026)

---

## Tech Stack

### Frontend

| Library | Version |
|---------|---------|
| React | 19 |
| TypeScript | 6 |
| Vite | 8 |
| Tailwind CSS | 3.4 |
| React Router | 7 |
| TanStack Query | 5 |
| React Hook Form | 7 |
| Zod | 4 |
| Zustand | 5 |
| Recharts | 3 |
| Clerk React SDK | 6 |
| Axios | 1 |
| Lucide React | 1 |
| date-fns | 4 |

### Backend

| Library | Version |
|---------|---------|
| FastAPI | 0.115 |
| SQLAlchemy | 2.0 |
| Pydantic | 2 |
| SQLite | — |
| Clerk Backend API | 6 |
| python-jose | 3 (JWT) |
| passlib | 1.7 (bcrypt) |
| SlowAPI | 0.1 (rate limiting) |

---

## Folder Structure

```
expense_tracker/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Environment config
│   │   ├── limiter.py           # Rate limiter
│   │   ├── database/
│   │   │   ├── database.py      # SQLAlchemy engine + session
│   │   │   └── migration.py     # Startup migration
│   │   ├── models/
│   │   │   └── models.py        # User, Category, Expense, Income
│   │   ├── schemas/
│   │   │   └── schemas.py       # Pydantic request/response models
│   │   └── routers/
│   │       ├── auth.py          # Clerk + legacy JWT auth
│   │       ├── categories.py    # Category CRUD
│   │       ├── dashboard.py     # Dashboard stats
│   │       ├── expenses.py      # Expense CRUD
│   │       ├── income.py        # Income CRUD
│   │       └── transactions.py  # Unified listing
│   ├── .env                     # Environment variables
│   ├── requirements.txt
│   └── seed_data.py             # Sample data seeder
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx             # App entry point with providers
│   │   ├── App.tsx              # Routes + auth guard
│   │   ├── types/index.ts       # TypeScript interfaces
│   │   ├── index.css            # Theme CSS variables
│   │   ├── lib/                 # API client, utils, validations
│   │   ├── stores/              # Zustand stores (theme, auth)
│   │   ├── hooks/               # TanStack Query hooks
│   │   ├── layouts/             # Sidebar, Header, BottomNav
│   │   ├── pages/               # Dashboard, Transactions, Categories, Profile
│   │   └── components/          # UI library + feature components
│   ├── .env                     # Clerk publishable key, API URL
│   └── package.json
└── .env.example                 # Environment variable template
```

---

## Quick Start

### 1. Clone & Install

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Copy `.env.example` and fill in your keys:

```bash
cp .env.example backend/.env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `CLERK_SECRET_KEY` | For Clerk auth | Secret key from [Clerk Dashboard](https://dashboard.clerk.com) |
| `VITE_CLERK_PUBLISHABLE_KEY` | For Clerk auth | Publishable key from Clerk Dashboard |
| `SECRET_KEY` | For legacy auth | Random key (min 32 chars) — only used if Clerk is not configured |

### 3. Run

```bash
# Terminal 1 — Backend (http://localhost:8000)
cd backend
uvicorn app.main:app --reload

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

### 4. Seed Data (Optional)

On first startup, categories and sample data are seeded automatically. You can also run manually:

```bash
cd backend
python seed_data.py
```

---

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/health` | GET | Status check |
| `/auth/login` | POST | Legacy login |
| `/auth/signup` | POST | Legacy signup |
| `/auth/logout` | POST | Clear session |
| `/auth/me` | GET | Current user |
| `/auth/me/profile` | GET | User profile with stats |
| `/auth/me` | PUT | Update name/avatar |
| `/auth/me/password` | PUT | Change password |
| `/auth/me` | DELETE | Soft-delete account |
| `/dashboard` | GET | Dashboard stats |
| `/dashboard/category/{name}` | GET | Category detail |
| `/categories` | GET / POST | List / create |
| `/categories/{id}` | PUT / DELETE | Update / delete |
| `/expenses` | GET / POST | List / create |
| `/expenses/{id}` | PUT / DELETE | Update / delete |
| `/income` | GET / POST | List / create |
| `/income/{id}` | PUT / DELETE | Update / delete |
| `/transactions` | GET | Unified list (paginated) |

Dashboard supports `?time_range=this_month|last_month|last_3_months|this_year|all_time`.

---

## Authentication

The app supports **dual authentication**:

1. **Clerk (recommended)** — Users sign in via Clerk's prebuilt UI. The session token is injected into every API request as a Bearer token. Backend verifies via Clerk SDK with JWKS caching. New Clerk users are auto-registered with a local profile.

2. **Legacy JWT (fallback)** — Custom bcrypt + HS256 JWT stored in an httponly cookie. Works when Clerk is not configured. Includes token versioning for session invalidation.

---

## Sample Data

The seed script creates realistic data for January–July 2026:

- **8 default categories**: Food 🍕, Shopping 🛒, Travel ✈️, Bills 📄, Education 📚, Entertainment 🎬, Medical 🏥, Others 📁
- **140 expense records** (~20/month) with descriptions like rent, groceries, fuel, dining out, shopping
- **17 income records** — ₹50,000/month salary + freelance income and cashback
- **Total**: ~₹3.5L income, ~₹2.3L expenses

---

## Screenshots

_Add screenshots here: Dashboard, Transactions list, Category management, Profile page_

---

## License

MIT
