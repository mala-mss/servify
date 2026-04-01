# Family Care Backend

Express.js + TypeScript + Sequelize backend for the Family Care application.

## Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Application entry point
│   ├── config/                # Configuration files
│   │   ├── database.ts        # Database connection
│   │   └── auth.config.ts     # JWT & bcrypt config
│   ├── models/                # Sequelize models (MVC - Model)
│   │   ├── User.ts
│   │   ├── Service.ts
│   │   ├── Booking.ts
│   │   ├── Job.ts
│   │   ├── Review.ts
│   │   ├── Transaction.ts
│   │   ├── Schedule.ts
│   │   ├── Notification.ts
│   │   └── index.ts           # Model associations
│   ├── controllers/           # Business logic (MVC - Controller)
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── service.controller.ts
│   │   ├── booking.controller.ts
│   │   ├── job.controller.ts
│   │   ├── review.controller.ts
│   │   ├── transaction.controller.ts
│   │   ├── schedule.controller.ts
│   │   └── notification.controller.ts
│   ├── routes/                # API routes (MVC - View layer for API)
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── service.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── job.routes.ts
│   │   ├── review.routes.ts
│   │   ├── transaction.routes.ts
│   │   ├── schedule.routes.ts
│   │   └── notification.routes.ts
│   └── middleware/            # Express middleware
│       ├── auth.ts            # JWT authentication
│       ├── errorHandler.ts    # Error handling
│       └── validation.ts      # Request validation
├── package.json
├── tsconfig.json
└── .env.example
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/:id` - Get user profile
- `PUT /api/auth/:id` - Update user profile

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/me` - Get current user
- `GET /api/users/:id` - Get user by ID

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `GET /api/services/provider/:providerId` - Get provider services
- `POST /api/services` - Create service (provider only)
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `GET /api/bookings/client/:clientId` - Get client bookings
- `GET /api/bookings/provider/:providerId` - Get provider bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID
- `GET /api/jobs/provider/:providerId` - Get provider jobs
- `GET /api/jobs/client/:clientId` - Get client jobs
- `POST /api/jobs` - Create job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job (admin only)

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/:id` - Get review by ID
- `GET /api/reviews/provider/:providerId` - Get provider reviews
- `GET /api/reviews/stats/:providerId` - Get review statistics
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `GET /api/transactions/user/:userId` - Get user transactions
- `GET /api/transactions/summary/:userId/:type?` - Get transaction summary
- `POST /api/transactions` - Create transaction (admin only)
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction (admin only)

### Schedules
- `GET /api/schedules` - Get all schedules
- `GET /api/schedules/:id` - Get schedule by ID
- `GET /api/schedules/provider/:providerId` - Get provider schedule
- `GET /api/schedules/check-availability` - Check availability
- `POST /api/schedules` - Create schedule
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/:id` - Get notification by ID
- `GET /api/notifications/user/:userId` - Get user notifications
- `GET /api/notifications/unread/:userId` - Get unread count
- `POST /api/notifications` - Create notification (admin only)
- `PUT /api/notifications/:id/mark-as-read` - Mark as read
- `PUT /api/notifications/:userId/mark-all-as-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Setup

### 1. Create PostgreSQL Database

Open PostgreSQL (psql or pgAdmin) and run:
```sql
CREATE DATABASE family_care;
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy `.env.example` to `.env` and edit with your PostgreSQL credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_NAME=family_care
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432
```

### 4. Run Migrations (Create Tables)

```bash
npm run db:migrate
```

This automatically creates all tables based on the models.

### 5. Seed Database (Optional - Sample Data)

```bash
npm run db:seed
```

This creates sample users:
- **Client**: `client@example.com` / `password123`
- **Provider**: `provider@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

### 6. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 7. Build for Production

```bash
npm run build
npm start
```
