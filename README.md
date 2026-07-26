# ScholarHive - SaaS Scholarship Platform

A production-ready SaaS scholarship platform for international students with advanced filtering, application tracking, Stripe subscription system, and admin moderation.

## Tech Stack

### Frontend
- **React 18** + TypeScript + Vite
- **TailwindCSS v4** (dark glassmorphism theme)
- **React Router v6** (client-side routing)
- **React Query** (server state management)
- **Zustand** (client state management)
- **Lucide React** (icons)

### Backend
- **Node.js** + Express
- **MongoDB** + Mongoose (database)
- **JWT** + refresh tokens (authentication)
- **bcryptjs** (password hashing)
- **Stripe** (subscriptions & payments)
- **Cloudinary** (file uploads)
- **Nodemailer** (email notifications)
- **Winston** (logging)
- **Zod** (validation)

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` in the server directory and fill in your values:
```bash
cd server
cp .env.example .env
```

**Required**: Only `MONGODB_URI` is required. All other services (Stripe, Cloudinary, Email) are optional.

### 3. Seed Database

```bash
cd server
npm run seed
```

Ensures the admin account exists, removes mock demo students/providers, and restores known real student data. It does **not** wipe real registrations or the scholarship catalogue.

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@afriroar.com | admin@123 |

### 4. Run Development Servers

From the project root (starts API + frontend together):

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

Or run them separately:

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

## Features

### 🔐 Authentication
- JWT access + refresh tokens
- Role-based access (student, provider, admin)
- Password hashing with bcrypt
- Protected routes & middleware
- Auto token refresh

### 🎓 Scholarships
- Full CRUD operations
- Advanced search & filtering (country, level, field, funding type)
- Keyword search with text indexing
- Sorting & pagination
- Featured scholarships
- Soft delete support
- Moderation workflow (pending → approved/rejected)

### 📝 Applications
- Multi-step application form
- File uploads (PDF, DOC)
- Save draft functionality
- Status tracking (draft → submitted → accepted/rejected)
- Duplicate prevention
- Free-tier application limits

### 🤖 Smart Matching
- Profile-based scholarship recommendations
- Scoring algorithm based on country, level, interests
- Match percentage display

### 💳 Stripe Subscriptions
- Free, Premium Monthly, Premium Yearly plans
- Checkout sessions
- Webhook handling (payment success/failure, renewals, cancellation)
- Premium feature gates

### 📊 Dashboards
- **Student**: Profile completion, applications, saved scholarships, recommendations
- **Provider**: Listings management, applicant views
- **Admin**: User stats, scholarship stats, revenue overview, audit logs

### 🛡️ Security
- Helmet (HTTP headers)
- Rate limiting (100 req/15min, 20 for auth)
- CORS configuration
- MongoDB injection prevention
- Input validation (Zod)
- XSS protection (HPP)

### 📧 Notifications
- Email notifications (welcome, application status)
- In-app notifications
- Read/unread tracking

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh token |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get profile |
| PATCH | /api/auth/profile | Update profile |

### Scholarships
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/scholarships | List (with filters) |
| GET | /api/scholarships/featured | Featured |
| GET | /api/scholarships/:id | Get by ID |
| GET | /api/scholarships/slug/:slug | Get by slug |
| POST | /api/scholarships | Create (provider) |
| PUT | /api/scholarships/:id | Update (provider) |
| DELETE | /api/scholarships/:id | Soft delete |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/applications | My applications |
| POST | /api/applications | Create |
| PATCH | /api/applications/:id | Update (draft) |
| POST | /api/applications/:id/submit | Submit |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/users | List users |
| GET | /api/admin/analytics | Dashboard stats |
| GET | /api/admin/audit-logs | Audit logs |
| PATCH | /api/admin/scholarships/:id/approve | Approve |

## Project Structure

```
SCHOLARSHIP/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── auth/           # Auth components
│   │   │   ├── layout/         # Navbar, Footer, Layout
│   │   │   └── scholarships/   # Scholarship components
│   │   ├── lib/                # API client, utilities
│   │   ├── pages/              # Route pages
│   │   ├── stores/             # Zustand stores
│   │   └── types/              # TypeScript types
│   └── index.html
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/             # DB, env configuration
│   │   ├── controllers/        # Route handlers
│   │   ├── middlewares/        # Auth, validation, upload
│   │   ├── models/             # Mongoose models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Helpers, email, logging
│   │   └── seeds/              # Seed data
│   └── .env
└── README.md
```

## Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Deploy dist/ to Vercel
```

### Backend → Render/Railway
- Set all environment variables
- Start command: `npm start`
- Node.js 18+ runtime

### Database → MongoDB Atlas
- Create free cluster
- Update MONGODB_URI in .env

## License
MIT
# AfriRoar
