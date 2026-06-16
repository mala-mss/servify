# Family Care

Family Care is a full-stack web application that connects families with care service providers. The platform supports three roles — **Client**, **Service Provider**, and **Admin** — each with a dedicated dashboard and workflow for booking, delivering, and managing care services.

## Features

- **Authentication & roles** — JWT-based login with role-based routing for clients, providers, and admins
- **Service marketplace** — clients can browse, search, and filter care services and providers
- **Booking flow** — request, accept, schedule, track, and pay for bookings
- **Provider tools** — manage services, schedule, earnings, reviews, jobs, and documents
- **Admin dashboard** — manage users, services, categories, bookings, approvals, reports, and analytics
- **Real-time chat** — messaging between clients and providers
- **Notifications** — in-app alerts for bookings, messages, and status changes
- **Dependants & authorized persons** — clients can manage profiles of those they book care for
- **Reports & feedback** — leave reviews and report issues

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- React Router 7
- Framer Motion (animations)
- Recharts (analytics)
- Axios, Zod

**Backend**
- Node.js + Express
- TypeScript
- Sequelize ORM + PostgreSQL
- JWT authentication
- bcrypt for password hashing

## Project Structure

```
Family_Care/
├── backend/          # Express + Sequelize API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── scripts/
│   └── database.sql
├── src/              # React frontend
│   ├── views/
│   │   ├── pages/    # client / provider / admin / auth / chat
│   │   └── components/
│   ├── controllers/  # React contexts (Auth, Booking, Theme)
│   ├── routes/
│   └── models/
├── index.html
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Family_Care
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the following variables:

```env
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/family_care
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

Set up the database:

```bash
npm run db:migrate
npm run db:seed
```

Start the development server:

```bash
npm run dev
```

The API will run on `http://localhost:3000`.

### 3. Frontend setup

```bash
cd ..
npm install
npm run dev
```

The app will run on `http://localhost:5173`.

## Available Scripts

### Frontend (root)
| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

### Backend (`backend/`)
| Command | Description |
| --- | --- |
| `npm run dev` | Start API with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run the compiled API |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed the database with sample data |

## API Overview

The backend exposes REST endpoints under `/api`, including:

- `/api/auth` — register, login
- `/api/users` — user profile management
- `/api/services` — service catalog
- `/api/providers` — provider directory and profiles
- `/api/bookings` — booking lifecycle
- `/api/payments` — payment processing
- `/api/chat` — messaging
- `/api/notifications` — notifications
- `/api/reports` — user reports
- `/api/feedback` — reviews and ratings
- `/api/admin` — admin-only operations
- `/api/monitoring` — dependant activity monitoring

## License

ISC
