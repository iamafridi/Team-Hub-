# Team Hub 🚀

A production-ready team collaboration platform for goal tracking, task management, real-time collaboration, and team analytics.

**Live Demo**: [team-hub.up.railway.app](https://team-hub.up.railway.app/workspace/demo-workspace-1/members)
**Vercel Mirror**: [teamhub-by-afridi.vercel.app](https://teamhub-by-afridi.vercel.app)

---

## ✨ Features

### 🎯 Goal Management
- Create goals with descriptions, due dates, and owner assignment
- Track progress with 0-100% completion slider
- Status tracking: ON_TRACK, AT_RISK, BEHIND, COMPLETED
- Nested milestones within goals
- Goal updates/activity feed
- Recurring goals (DAILY, WEEKLY, MONTHLY)

### ✅ Action Items (Tasks)
- **Kanban Board**: Drag-and-drop across TODO → IN_PROGRESS → IN_REVIEW → DONE
- **List View**: Collapsible status groups with bulk selection
- Priority levels: LOW, MEDIUM, HIGH, URGENT
- Assignees, due dates, progress tracking
- Drag-drop reordering with optimistic UI rollback
- Bulk actions with selection UI
- Recurring tasks

### 📢 Announcements
- Rich text editor (Tiptap: bold, italic, bullet lists)
- 8 emoji reactions: 👍 ❤️ 😂 🎉 🔥 😍 🤔 👏
- Comment threads with edit and delete
- @mention detection and real-time updates
- Pin important announcements

### 📊 Analytics Dashboard
- Animated stat cards with clickable detail modals
- Time-period filtering (1 day, 7 days, 1 month, 6 months, 1 year, all time)
- Goal status breakdown chart (Recharts)
- Action completion trends
- Member activity metrics
- Edit progress directly from analytics modal

### 📅 Calendar
- Month view with clickable event indicators
- Agenda view showing upcoming events
- Smart badges: Today, Soon, Future
- Event type filtering (Goals, Actions, All)
- Days-until-due indicators

### 📈 Activity Timeline
- Organized by time periods (Today, Yesterday, This Week, This Month, This Year, Older)
- User-based filtering with per-user statistics
- Clickable items showing full JSON change details
- Actor information and timestamps

### 👥 Team Management
- Invite members via email with real-time notifications
- Role-based access: ADMIN, MODERATOR, MEMBER
- 20+ granular permissions across 6 categories (via `@team-hub/shared`)
- Role-based data visibility filtering (ADMIN/MOD sees all, MEMBER sees own)
- Mobile responsive member list
- Workspace settings per user

### 🔔 Real-Time Collaboration
- Socket.io instant notifications
- Live presence tracking (online/offline indicators)
- Real-time comment and reaction updates
- Instant notification delivery

### 🌙 Theme
- Dark/light mode toggle with smooth CSS transitions
- Persistent preference via localStorage
- Full coverage across all UI components

### 🔒 Security
- Firebase authentication with httpOnly cookies (optional dev bypass)
- Role-based access control (RBAC) middleware
- Permission-based access control
- Data visibility scoping per role
- Rate limiting (300 req/15min)
- XSS protection (isomorphic-dompurify)
- Helmet security headers
- CORS with environment-aware configuration
- Audit logging for all entity changes
- Soft delete (trash) with recovery
- Input validation (Zod)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, Zustand, Framer Motion, Tailwind CSS |
| **Backend** | Express.js, Node.js 22, Socket.io |
| **Database** | PostgreSQL, Prisma ORM |
| **Auth** | Firebase Admin SDK (client + server) |
| **Real-time** | Socket.io (presence, notifications, live updates) |
| **Rich Text** | Tiptap (announcements, comments) |
| **Charts** | Recharts |
| **File Upload** | Cloudinary (multer) |
| **Email** | Nodemailer (digests, invites, notifications) |
| **API Docs** | Swagger (swagger-jsdoc + swagger-ui-express) |
| **Cron Jobs** | node-cron (digest, recurrence) |
| **Build** | Turborepo (monorepo orchestration) |
| **Deployment** | Railway, Docker, self-hosted |
| **Monitoring** | Sentry (optional) |

---

## 🏛️ Architecture

```
                    ┌──────────────────────────────────┐
                    │         Next.js Frontend          │
                    │   (App Router + Zustand Store)    │
                    └──────┬──────────────┬─────────────┘
                           │  HTTP/REST   │  WebSocket
                    ┌──────▼──────────────▼─────────────┐
                    │       Express.js Backend          │
                    │   (Middleware → Routes → Prisma)  │
                    └──────┬────────────────────────────┘
                           │         SQL
                    ┌──────▼────────────────────────────┐
                    │         PostgreSQL                 │
                    │   (Prisma ORM - 12+ models)        │
                    └───────────────────────────────────┘
```

### Monorepo Structure (`npm workspaces` + Turborepo)

| Package | Location | Description |
|---------|----------|-------------|
| `@team-hub/api` | `backend/` | Express server, routes, middleware, Prisma |
| `@team-hub/web` | `frontend/` | Next.js client application |
| `@team-hub/shared` | `packages/shared/` | Shared permission system |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18 (v22.5.0 recommended)
- **PostgreSQL** >= 12
- **npm** (v9+)

### 1. Clone & Install
```bash
git clone https://github.com/iamafridi/Team-Hub-.git
cd Team-Hub-
npm install --legacy-peer-deps
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your values:
# - Generate JWT secrets: openssl rand -base64 32
# - Set DATABASE_URL (PostgreSQL connection string)
# - Set CLIENT_URL (http://localhost:3000)
# - Optional: Cloudinary, email, Slack webhook config
```

### 3. Setup Database
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

### 4. Start Development
```bash
npm run dev
```

### Services
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:4000 |
| API Docs | http://localhost:4000/docs |
| Database UI | `npx prisma studio` |

### Demo Credentials
| Field | Value |
|-------|-------|
| Email | `demo@teamhub.com` |
| Password | `demo123` |

---

## 📁 Project Structure

```
team-hub/
├── backend/                          # Express.js API server
│   ├── src/
│   │   ├── routes/                   # 15 route modules
│   │   │   ├── workspaces.js         # Workspace CRUD + membership
│   │   │   ├── goals.js              # Goals + milestones
│   │   │   ├── actions.js            # Action items + Kanban
│   │   │   ├── announcements.js      # Announcements + pinning
│   │   │   ├── comments.js           # Polymorphic comments
│   │   │   ├── analytics.js          # Dashboard stats/charts
│   │   │   ├── activity.js           # Activity timeline
│   │   │   ├── notifications.js      # Notification CRUD
│   │   │   ├── audit.js              # Audit log retrieval
│   │   │   ├── calendar.js           # Calendar data
│   │   │   ├── search.js             # Global search
│   │   │   ├── trash.js              # Soft-delete management
│   │   │   ├── upload.js             # Cloudinary file upload
│   │   │   └── emailPreferences.js   # Email digest prefs
│   │   ├── middleware/
│   │   │   ├── auth.js               # Firebase token verification
│   │   │   ├── rbac.js               # Role-based access control
│   │   │   ├── permissions.js        # Granular permission checks
│   │   │   ├── visibility.js         # Role-based data scoping
│   │   │   └── errorHandler.js       # Global error handler
│   │   ├── services/
│   │   │   ├── cloudinaryService.js  # Media upload
│   │   │   ├── emailService.js       # Nodemailer
│   │   │   └── slackService.js       # Slack webhooks
│   │   ├── jobs/
│   │   │   ├── digestJob.js          # Email digest cron
│   │   │   └── recurrenceJob.js      # Recurring items cron
│   │   ├── socket/
│   │   │   └── emitter.js            # Socket.io event bus
│   │   ├── utils/
│   │   │   └── auditLog.js           # Audit logging helper
│   │   ├── prisma/
│   │   │   ├── client.js             # Prisma singleton
│   │   │   └── schema.prisma         # Database schema (12 models)
│   │   ├── firebase/
│   │   │   └── admin.js              # Firebase Admin init
│   │   └── index.js                  # Express entry point
│   ├── prisma/
│   │   ├── schema.prisma             # Source of truth
│   │   ├── migrations/               # Migration history
│   │   └── seed.js                   # Demo data seeder
│   └── tests/                        # Jest + Supertest
│
├── frontend/                         # Next.js 14 client
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.jsx
│   │   │   └── register/page.jsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.jsx            # Sidebar + topbar shell
│   │   │   ├── dashboard/page.jsx    # Workspace overview
│   │   │   ├── profile/page.jsx
│   │   │   └── workspace/[id]/
│   │   │       ├── page.jsx          # Workspace hub
│   │   │       ├── goals/page.jsx
│   │   │       ├── actions/page.jsx
│   │   │       ├── announcements/page.jsx
│   │   │       ├── members/page.jsx
│   │   │       ├── settings/page.jsx
│   │   │       ├── analytics/page.jsx
│   │   │       ├── activity/page.jsx
│   │   │       ├── audit/page.jsx
│   │   │       ├── calendar/page.jsx
│   │   │       └── trash/page.jsx
│   │   ├── accept-invite/[token]/page.jsx
│   │   └── middleware.js
│   ├── components/
│   │   ├── ui/                       # Avatar, Badge, Button, Card, Dropdown, Modal, etc.
│   │   ├── auth/                     # FirebaseProvider, EmailPasswordForm, RegisterForm
│   │   ├── actions/                  # ActionCard, ActionModal, KanbanBoard, ListView
│   │   ├── analytics/               # StatCard, GoalStatusChart, ActionCompletionChart
│   │   ├── announcements/            # AnnouncementCard, AnnouncementModal, CommentThread
│   │   ├── comments/                 # EntityCommentThread
│   │   ├── dashboard/                # CreateWorkspaceModal, DashboardModals
│   │   ├── goals/                    # GoalCard
│   │   ├── members/                  # InviteMemberModal, MemberActions
│   │   ├── notifications/            # NotificationBell
│   │   ├── presence/                 # PresenceIndicator
│   │   ├── profile/                  # ProfilePhotoModal
│   │   └── search/                   # GlobalSearch
│   ├── store/                        # Zustand state
│   │   ├── authStore.js
│   │   ├── workspaceStore.js
│   │   ├── goalStore.js
│   │   ├── actionStore.js
│   │   ├── notificationStore.js
│   │   └── uiStore.js
│   ├── hooks/                        # useOptimistic, usePermission, useSocket
│   └── lib/                          # api.js (Axios), firebase.js, theme.js
│
├── packages/
│   ├── shared/                       # @team-hub/shared
│   │   └── permissions.js            # Permission enums + helpers
│   └── config/                       # (placeholder) eslint-config, tailwind-config
│
├── turbo.json                        # Turborepo pipeline
├── railway.toml                      # Railway deployment config
├── .env.example                      # Environment template
└── package.json                      # Monorepo root
```

---

## 🔑 Core Features Deep Dive

### 🎯 Goal Management
- Full CRUD with status transitions
- Milestone sub-items with individual progress
- Goal updates/activity feed per goal
- Recurrence support (DAILY/WEEKLY/MONTHLY)
- Soft delete with trash recovery
- Real-time updates via Socket.io

### ✅ Kanban Board
- Drag-and-drop between TODO / IN_PROGRESS / IN_REVIEW / DONE
- Optimistic UI updates with automatic rollback on failure
- Collapsible list view alternative
- Bulk selection and actions
- Priority color coding

### 📢 Announcements System
- Tiptap rich text editor
- Emoji reactions with toggle support
- Nested comment threads
- Real-time updates (new comments, reactions)
- Pin to top functionality

### 📊 Analytics
- Aggregated workspace metrics
- Time-period filtering
- Goal completion trends
- Action item velocity
- Member contribution breakdown
- Export-ready data

### 🔐 Permission System
- 20+ granular permissions across 6 categories
- Dual enforcement: backend middleware + frontend hooks
- Roles: ADMIN (full access), MODERATOR (elevated), MEMBER (restricted)
- Visibility scoping: ADMIN/MOD sees all, MEMBER sees own items

### 🔄 Real-Time
- Socket.io with workspace-scoped rooms
- Live presence (online/offline indicators)
- Instant notifications (mention, invite, assignment)
- Real-time comment and reaction updates

---

## 🛠️ Scripts

### Root
| Script | Description |
|--------|-------------|
| `npm run dev` | Start all packages in dev mode (Turborepo) |
| `npm run build` | Build all packages |
| `npm run lint` | Lint all packages |
| `npm run test` | Run all tests |

### Backend (`backend/`)
| Script | Description |
|--------|-------------|
| `npm run start` | prisma db push + start server |
| `npm run dev` | Nodemon hot-reload |
| `npm run seed` | Seed demo data |
| `npm run migrate` | Run Prisma migrations |

### Frontend (`frontend/`)
| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Production server |

---

## 🚢 Deployment

### Railway (Primary)
The project includes a `railway.toml` with two services:
- **`api`** — Express backend (port 4000, health-checked)
- **`web`** — Next.js frontend (port 3000)

### Docker
```bash
docker build -f backend/Dockerfile -t team-hub-api .
docker build -f frontend/Dockerfile -t team-hub-web .
```

### Environment Variables
See `.env.example` for all required and optional variables:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_API_URL` — Backend URL for frontend
- `NEXT_PUBLIC_FIREBASE_*` — Firebase config
- `CLOUDINARY_*` — Cloudinary credentials (optional)
- `SMTP_*` — Email configuration (optional)
- `SLACK_WEBHOOK_URL` — Slack integration (optional)
- `SENTRY_*` — Error tracking (optional)

---

## 👤 Author

**Afridi Akbar Ifty**

- **Portfolio**: [iamafrididev.netlify.app](https://iamafrididev.netlify.app)
- **GitHub**: [@iamafridi](https://github.com/iamafridi)

---

## 📄 License

This project is private. All rights reserved.

---

**Built for team collaboration and productivity** 🚀
