# TaskFlow — Full Stack Task Management App

A full-stack task management application built with **Next.js**, **NestJS**, and **MongoDB**. Features JWT authentication, role-based access control, full CRUD for tasks, and a polished dark-themed UI.

## 🖥️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | NestJS 10, TypeScript, Passport.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (JSON Web Tokens) |
| Containerization | Docker + Docker Compose |

---

## 🚀 Quick Start (Docker — Recommended)

The easiest way to run everything with one command:

```bash
# Clone the repo
git clone <your-repo-url> taskflow
cd taskflow

# Start all services (MongoDB, Backend, Frontend)
docker-compose up -d

# Seed the database with test users and tasks
docker-compose run --rm seeder
```

Visit **http://localhost:3000** in your browser.

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js v20+
- MongoDB running locally (or MongoDB Atlas URI)
- npm or yarn

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start in development mode (hot reload)
npm run start:dev
```

Backend runs on **http://localhost:3001**

### 2. Seed the Database

```bash
cd backend
npm run seed
```

This creates test accounts:
| Account | Email | Password | Role |
|---------|-------|----------|------|
| Admin | admin@taskflow.com | admin123 | Admin |
| Alice | alice@taskflow.com | member123 | Member |
| Bob | bob@taskflow.com | member123 | Member |

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# The default points to http://localhost:3001/api

# Start development server
npm run dev
```

Frontend runs on **http://localhost:3000**

---

## 🗺️ API Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login & get JWT |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/tasks | Yes | List tasks (filtered) |
| POST | /api/tasks | Yes | Create a task |
| GET | /api/tasks/stats | Yes | Dashboard stats |
| GET | /api/tasks/:id | Yes | Get single task |
| PUT | /api/tasks/:id | Yes | Update task |
| DELETE | /api/tasks/:id | Yes | Delete task |

### Query Parameters for GET /api/tasks

```
status    = todo | in_progress | done
priority  = low | medium | high
sortBy    = createdAt | dueDate | priority
sortOrder = asc | desc
```

---

## 🔐 Test Accounts

After seeding, use these accounts in the login page (or click the demo buttons):

- **Admin** → `admin@taskflow.com` / `admin123` — sees all tasks, full control
- **Alice** → `alice@taskflow.com` / `member123` — sees only her tasks
- **Bob** → `bob@taskflow.com` / `member123` — sees only his tasks

---

## ✨ Features

### Core
- [x] User registration & login with JWT
- [x] Full CRUD for tasks (Create, Read, Update, Delete)
- [x] Task fields: title, description, status, due date, priority
- [x] Filter tasks by status and priority
- [x] Sort by created date, due date, or priority
- [x] Route guards (NestJS & Next.js)
- [x] Input validation with class-validator

### Frontend
- [x] Login & Register pages
- [x] Task dashboard with list & grid views
- [x] Inline create/edit modal
- [x] Filter and sort controls
- [x] Protected routes (redirect if not authenticated)
- [x] Responsive design with collapsible sidebar
- [x] Real-time search across tasks
- [x] Progress stats in sidebar
- [x] Overdue task highlighting

### Bonus B — RBAC
- [x] Two roles: `admin` and `member`
- [x] `@Roles()` decorator + `RolesGuard` in NestJS
- [x] Role embedded in JWT payload
- [x] Admin: sees all tasks, edits/deletes any task
- [x] Member: sees only their own or assigned tasks
- [x] 403 Forbidden on unauthorized access (not 404)
- [x] Seeded DB with 1 Admin + 2 Members

---

## 📁 Project Structure

```
taskflow/
├── backend/                  NestJS application
│   ├── src/
│   │   ├── auth/             JWT auth, guards, strategies, decorators
│   │   ├── tasks/            Task CRUD module
│   │   ├── users/            User module
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   └── seed.ts           Database seeder
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                 Next.js application
│   ├── src/
│   │   ├── app/              App Router pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── dashboard/
│   │   ├── components/       Reusable UI components
│   │   ├── context/          Auth context
│   │   ├── lib/              API client (axios)
│   │   └── types/            TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml        One-command startup
├── ARCHITECTURE.md           Architecture documentation
├── AI_LOG.md                 AI tools usage log
└── README.md
```

---

## 🌍 Environment Variables

### Backend (`backend/.env`)
```env
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🧪 Running Tests

```bash
cd backend
npm run test          # Unit tests
npm run test:cov      # With coverage
```
