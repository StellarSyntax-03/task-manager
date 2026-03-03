# ARCHITECTURE.md — TaskFlow

## 1. System Overview

TaskFlow is a three-tier full-stack web application for task management. The **Next.js frontend** communicates with the **NestJS REST API** over HTTP, using JWT tokens for authentication. The API persists data in **MongoDB** via Mongoose ODM. Users can create, update, delete, and filter tasks. Two roles exist — Admin (sees all tasks) and Member (sees only their own) — enforced at the API layer, not just the UI.

```
┌────────────────────────┐         HTTP/REST         ┌────────────────────────┐
│   Next.js Frontend     │  ────────────────────────▶ │   NestJS Backend       │
│   (port 3000)          │  ◀────────────────────────  │   (port 3001)          │
│   App Router + TS      │     Bearer JWT token        │   Guards + Validation  │
└────────────────────────┘                             └──────────┬─────────────┘
                                                                  │ Mongoose
                                                                  ▼
                                                       ┌────────────────────────┐
                                                       │   MongoDB              │
                                                       │   (port 27017)         │
                                                       │   Collections:         │
                                                       │   users, tasks         │
                                                       └────────────────────────┘
```

---

## 2. Folder Structure

### Backend (`/backend/src`)

```
src/
├── auth/
│   ├── dto/auth.dto.ts           # RegisterDto, LoginDto — class-validator rules
│   ├── guards/
│   │   ├── jwt-auth.guard.ts     # Extends AuthGuard('jwt') from passport
│   │   └── roles.guard.ts        # Custom RBAC guard using Reflector
│   ├── strategies/
│   │   └── jwt.strategy.ts       # Passport JWT strategy — validates token
│   ├── decorators/
│   │   └── roles.decorator.ts    # @Roles() metadata setter
│   ├── auth.controller.ts        # POST /auth/register, /auth/login, GET /auth/me
│   ├── auth.service.ts           # Business logic: hashing, token signing
│   └── auth.module.ts
│
├── tasks/
│   ├── dto/task.dto.ts           # CreateTaskDto, UpdateTaskDto, FilterTaskDto
│   ├── schemas/task.schema.ts    # Mongoose Task schema
│   ├── tasks.controller.ts       # REST endpoints, applies JwtAuthGuard
│   ├── tasks.service.ts          # CRUD + RBAC logic
│   └── tasks.module.ts
│
├── users/
│   ├── schemas/user.schema.ts    # Mongoose User schema with role field
│   ├── users.service.ts          # create, findByEmail, findById, findAll
│   └── users.module.ts
│
├── app.module.ts                 # Root module — imports MongooseModule + feature modules
├── main.ts                       # Bootstrap — CORS, ValidationPipe, global prefix
└── seed.ts                       # Script to populate DB with test data
```

**Why this structure?** NestJS's module system encourages feature-based folders. Each domain (auth, tasks, users) owns its schema, DTOs, service, and controller. This makes the codebase easy to navigate and each module independently testable.

### Frontend (`/frontend/src`)

```
src/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx                # Root layout — AuthProvider, Toaster
│   ├── page.tsx                  # Redirects to /dashboard or /login
│   ├── login/page.tsx            # Login form with demo account shortcuts
│   ├── register/page.tsx         # Registration with role selection
│   └── dashboard/
│       ├── layout.tsx            # Auth guard — redirects unauthenticated users
│       └── page.tsx              # Main task view — list/grid, filters, stats
│
├── components/
│   └── tasks/TaskModal.tsx       # Create/Edit task modal
│
├── context/
│   └── AuthContext.tsx           # React context — user, token, login(), logout()
│
├── lib/
│   └── api.ts                    # Axios instance with auth interceptor
│
└── types/index.ts                # TypeScript interfaces (Task, User, TaskStats)
```

**Why App Router?** Next.js 14's App Router gives server components, better layouts, and simpler nested routing. Dashboard layout handles auth guarding once, all child pages inherit protection.

---

## 3. Database Schema

### User Schema

```typescript
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;                         // Display name

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;                        // Unique identifier, normalized to lowercase

  @Prop({ required: true, select: false })
  password: string;                     // Bcrypt hash (select: false = never returned by default)

  @Prop({ type: String, enum: UserRole, default: UserRole.MEMBER })
  role: UserRole;                       // 'admin' | 'member' — controls data visibility
}
// Auto-fields: _id (ObjectId), createdAt, updatedAt
```

### Task Schema

```typescript
@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, trim: true })
  title: string;                        // Task name (1-200 chars)

  @Prop({ trim: true, default: '' })
  description: string;                  // Optional details (up to 2000 chars)

  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;                   // 'todo' | 'in_progress' | 'done'

  @Prop({ type: String, enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;               // 'low' | 'medium' | 'high'

  @Prop({ type: Date, default: null })
  dueDate: Date;                        // Optional deadline

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;                // Creator of the task — always set

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedTo: Types.ObjectId;           // Optional assignee (useful for admins)
}
// Auto-fields: _id (ObjectId), createdAt, updatedAt
```

**Schema design choices:**
- `select: false` on `password` means it's never accidentally returned in API responses. We explicitly re-select it only in `findByEmail` for login.
- `owner` is required; `assignedTo` is nullable, supporting both personal tasks and delegated work.
- Using `Types.ObjectId` references with `.populate()` lets us return full user objects in task responses without duplication.

---

## 4. API Endpoints

### Auth Endpoints

| Method | Path | Auth Required | Request Body | Response |
|--------|------|--------------|-------------|----------|
| POST | /api/auth/register | No | `{ name, email, password, role? }` | `{ access_token, user }` |
| POST | /api/auth/login | No | `{ email, password }` | `{ access_token, user }` |
| GET | /api/auth/me | Yes (JWT) | — | `{ id, name, email, role }` |

### Task Endpoints

All task endpoints require a valid JWT in the `Authorization: Bearer <token>` header.

| Method | Path | Auth | Description | Request Body |
|--------|------|------|-------------|-------------|
| GET | /api/tasks | JWT | List tasks (filtered/sorted) | Query: `status, priority, sortBy, sortOrder` |
| POST | /api/tasks | JWT | Create task | `{ title, description?, status?, priority?, dueDate?, assignedTo? }` |
| GET | /api/tasks/stats | JWT | Dashboard statistics | — |
| GET | /api/tasks/:id | JWT | Get single task | — |
| PUT | /api/tasks/:id | JWT | Update task | Same as POST body, all optional |
| DELETE | /api/tasks/:id | JWT | Delete task | — |

### Response Shapes

**POST /api/auth/login — Success (200)**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "65f4b2a0c8d2e3f4a5b6c7d8",
    "name": "Admin User",
    "email": "admin@taskflow.com",
    "role": "admin"
  }
}
```

**GET /api/tasks — Success (200)**
```json
[
  {
    "_id": "65f4b2a0c8d2e3f4a5b6c7d9",
    "title": "Build auth flow",
    "description": "JWT-based authentication",
    "status": "in_progress",
    "priority": "high",
    "dueDate": "2025-02-01T00:00:00.000Z",
    "owner": { "_id": "...", "name": "Alice", "email": "alice@taskflow.com", "role": "member" },
    "assignedTo": null,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-20T14:30:00.000Z"
  }
]
```

**Error Responses**
- `400 Bad Request` — Validation failure (class-validator errors)
- `401 Unauthorized` — Missing or invalid JWT
- `403 Forbidden` — Valid JWT but insufficient role/ownership
- `404 Not Found` — Task ID doesn't exist

---

## 5. Auth Flow

```
REGISTER
─────────────────────────────────────────────────
  Client          API              DB
    │  POST /auth/register          │
    │──────────────────────────────▶│
    │              │  bcrypt.hash(password, 12)
    │              │  userModel.create(...)
    │              │◀─────────────── User document
    │              │  jwtService.sign({ sub, email, role })
    │◀─────────────│  { access_token, user }
    │  Store token in localStorage  │

LOGIN
─────────────────────────────────────────────────
  Client          API              DB
    │  POST /auth/login             │
    │──────────────────────────────▶│
    │              │  findOne({ email }).select('+password')
    │              │◀─────────────── User + hashed password
    │              │  bcrypt.compare(plain, hash)
    │              │  jwtService.sign({ sub, email, role })
    │◀─────────────│  { access_token, user }

PROTECTED REQUEST
─────────────────────────────────────────────────
  Client          Guard           Strategy         DB
    │  GET /tasks                   │              │
    │  Authorization: Bearer <jwt>  │              │
    │──────────────────────────────▶│              │
    │              │  JwtStrategy.validate(payload) │
    │              │────────────────────────────────▶
    │              │                │  findById(payload.sub)
    │              │◀────────────────────────────────
    │              │  req.user = { id, email, role, name }
    │              │  → TasksController.findAll(req)
    │◀─────────────│  tasks[]
```

**JWT Payload Structure:**
```json
{
  "sub": "65f4b2a0c8d2e3f4a5b6c7d8",  // User MongoDB _id
  "email": "admin@taskflow.com",
  "role": "admin",
  "iat": 1704067200,
  "exp": 1704672000
}
```

The token is signed with `JWT_SECRET` using HS256. Expiry is configurable via `JWT_EXPIRES_IN` (default: 7 days). The frontend stores the token in `localStorage` and attaches it via an Axios request interceptor on every API call.

---

## 6. AI Tools Used

| Tool | Used For | What I Reviewed / Changed |
|------|----------|--------------------------|
| Claude (Anthropic) | Initial NestJS module scaffolding, Mongoose schema drafts | Reviewed all generated code, fixed the `select: false` handling in `findByEmail`, adjusted RBAC logic to use `$or` query for members (owner OR assignedTo) |
| Claude | Tailwind CSS component styling, dark theme color system | Stripped generic purple gradients, rebuilt color palette with CSS variables, added noise texture and glassmorphism effects |
| Claude | ARCHITECTURE.md structure | Rewrote explanations in my own words, added the sequence diagrams |

**My contributions beyond AI output:**
- Decided to use `$or` for member task visibility (owner OR assignedTo) rather than just owner
- Added `stats` endpoint separately to avoid over-fetching
- Chose Syne + DM Sans font pairing deliberately over the AI's initial Inter suggestion
- Added the overdue task detection logic (client-side, using `date-fns`)
- Structured the sidebar progress bar to reflect live stats

---

## 7. Decisions & Trade-offs

### JWT in localStorage vs HttpOnly Cookies
I chose localStorage for simplicity in this timeframe. HttpOnly cookies are more secure (immune to XSS token theft) and would be my first improvement in production. The trade-off is that this approach is faster to implement but less hardened.

### No Refresh Tokens
JWTs have a 7-day expiry. A production system would implement refresh tokens so sessions can be invalidated without requiring re-login every week. Skipped here to keep scope focused.

### RBAC via Decorator + Guard vs Database Permissions
I used the `@Roles()` + `RolesGuard` approach because it's clean, co-located with the controller, and the role is already in the JWT so no extra DB call is needed per request. A more complex system might use a permissions table in the DB, but for two roles this is the right call.

### Client-Side Search vs API Search
The search bar filters already-fetched tasks client-side (JavaScript filter). For large datasets, a MongoDB text index + server-side search would be necessary. I chose client-side because it's instant (no network latency) for small task lists.

### Separate Stats Endpoint
Rather than computing stats on the client from the task list, I added `GET /tasks/stats` which uses MongoDB's `countDocuments` — much faster than fetching all tasks and counting in JS, especially at scale.

### What I'd Improve With More Time
1. **Refresh tokens** + HttpOnly cookie auth
2. **WebSocket gateway** (Bonus A) for real-time task sync across browser tabs
3. **Unit tests** for TasksService covering RBAC edge cases
4. **Pagination** for task list (`GET /tasks?page=1&limit=20`)
5. **File attachments** on tasks via S3/Cloudflare R2
6. **Notifications** when a task is assigned to you
7. **Activity log** per task (who changed what and when)
8. **User management** admin panel — invite, deactivate, change roles
