# AI_LOG.md — TaskFlow

## Tools Used

| Tool | Version/Model | Usage Area |
|------|--------------|-----------|
| Claude (Anthropic) | Claude Sonnet | Architecture planning, code scaffolding, documentation |
| GitHub Copilot | GPT-4 based | Inline autocomplete during development |

---

## Detailed Usage Log

### Backend

**NestJS Module Scaffolding**
- AI generated: Initial module/service/controller structure for auth and tasks
- What I reviewed: Ensured the JWT strategy correctly fetches the user from DB on each request (not just trusting the payload blindly), fixed `select: false` handling for password field
- What I changed: Added `$or` query logic in `TasksService.findAll()` for members to see tasks they're assigned to (not just ones they own), which the AI's initial draft missed

**Mongoose Schemas**
- AI generated: Initial schema field definitions
- What I reviewed: Verified enum values matched across frontend/backend, confirmed `ref: 'User'` references were correct, checked that `select: false` on password field was correctly bypassed in the `findByEmail` method
- What I changed: Added `assignedTo` field to support admin task delegation, added `select('+password')` explicitly in `findByEmail`

**RBAC (RolesGuard + @Roles decorator)**
- AI generated: Decorator and guard pattern
- What I reviewed: Verified `Reflector.getAllAndOverride` correctly checks both handler and class metadata
- What I changed: Returns `403 Forbidden` (not `404`) for unauthorized access, as per spec

**Input Validation**
- AI generated: class-validator decorator list for DTOs
- What I reviewed: Confirmed `@IsMongoId()` for assignedTo, `@IsDateString()` for dueDate, length constraints

### Frontend

**Next.js App Router Structure**
- AI generated: Initial page skeleton and AuthContext
- What I reviewed: Ensured the auth redirect logic in `dashboard/layout.tsx` correctly handles the loading state (prevents flash of login page)
- What I changed: Added Axios interceptor for 401 responses to auto-redirect to login

**UI Design System**
- AI suggested: Generic Inter font, purple gradient scheme
- What I changed entirely: Switched to Syne (display) + DM Sans (body) font pairing, built a dark base palette with `--bg-primary` through `--bg-card` CSS variables, added glassmorphism cards with subtle border glow on hover, added noise texture via SVG filter

**Dashboard Page**
- AI generated: Basic task list structure
- What I reviewed: Ensured filter state is passed correctly as query params to the API, not filtered client-side (except for search)
- What I added: Overdue detection using `date-fns/isPast`, sidebar progress bar, list/grid view toggle, stats sidebar

**TaskModal Component**
- AI generated: Form structure
- What I reviewed: Validated that edit mode pre-populates all fields correctly, confirmed date format handling (`dueDate.split('T')[0]` to strip time component for `<input type="date">`)

### Documentation

**ARCHITECTURE.md**
- AI generated: Section headings and initial content
- What I rewrote: All technical explanations in my own words, created the ASCII flow diagrams myself, added my personal rationale in the Decisions section

---

## Honesty Note

I used AI to write first drafts and scaffolding. I read and understood every line before including it. The RBAC logic, the `$or` member query, the UI design choices, the font selection, the stats endpoint design, and the overdue detection were either my own ideas or AI suggestions I deliberately modified. I can explain every part of this codebase in a live interview.
