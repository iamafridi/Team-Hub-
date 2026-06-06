# FredoCloud 🚀

A production-ready team collaboration platform for goal tracking, task management, and real-time collaboration.

**Live Demo**: https://team-hub.up.railway.app/workspace/demo-workspace-1/members

## ✨ Key Features

- **Goal Management** - Track team objectives with milestones, progress tracking, and member assignment
- **Action Items** - Kanban board with drag-drop and list views, priority levels, and assignees
- **Announcements** - Real-time updates, emoji reactions, comment threads with editing capabilities
- **Analytics Dashboard** - Time-period filtered charts, progress modals, detailed item breakdowns, activity tracking
- **Activity Timeline** - Organized by time periods, clickable details modal, user filtering with statistics
- **Calendar** - Month and agenda views, event details modal, days until due indicator, upcoming events list
- **Real-Time Collaboration** - Instant notifications, Socket.io updates, live presence tracking
- **Team Management** - Role-based access, member invites, mobile responsive member list
- **Dark/Light Theme** - Persistent theme preference with smooth transitions
- **Security** - JWT auth, RBAC, audit logging, input validation, optimistic UI updates

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React, Zustand, Framer Motion, Tailwind CSS |
| **Backend** | Express.js, Node.js, Socket.io |
| **Database** | PostgreSQL, Prisma ORM |
| **Files** | Cloudinary |
| **Email** | Nodemailer |
| **Real-time** | Socket.io |
| **Build** | Turbo monorepo, npm workspaces |
| **Deployment** | Railway, Docker, Self-hosted |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### 1. Clone & Install
```bash
git clone <repo-url>
cd freducloud
npm install --legacy-peer-deps
```

### 2. Configure Environment
```bash
cp .env.example .env

# Edit .env with your values:
# - Generate JWT secrets: openssl rand -base64 32
# - Set DATABASE_URL (PostgreSQL connection)
# - Set CLIENT_URL (http://localhost:3000)
# - Optional: Cloudinary, email configuration
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

**Services will start on:**
- Frontend: http://localhost:3000
- Backend: http://localhost:4000  
- API Docs: http://localhost:4000/docs
- Database UI: `npx prisma studio`

**Demo Credentials:**
- Email: `demo@teamhub.com`
- Password: `demo123`

## 📊 Project Structure

```
freducloud/
├── backend/                    # Express backend (35+ endpoints)
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth, RBAC, error handling
│   │   ├── services/          # Cloudinary, email
│   │   └── utils/             # JWT, audit logging
│   ├── prisma/                # Database schema, migrations
│   ├── .env.example           # Backend config template
│   └── .env                   # Local dev config
│
├── frontend/                   # Next.js frontend
│   ├── app/
│   │   ├── (auth)/            # Sign in/up pages
│   │   └── (dashboard)/       # Main app features
│   ├── components/            # 26+ UI and feature components
│   ├── store/                 # 6 Zustand stores
│   ├── lib/                   # API client, hooks
│   ├── .env.example           # Frontend config template
│   └── .env.local             # Local dev config
│
├── packages/                  # Shared packages
│   ├── config/
│   │   ├── eslint-config
│   │   └── tailwind-config
│   └── shared/                # Shared types/utils
│
├── package.json               # Monorepo root
├── turbo.json                 # Turbo config
└── docs/                      # Documentation files
```

## 🔑 Core Features

### 🎯 Goals
- Create goals with descriptions and due dates
- Assign goals to team members
- Track progress with 0-100% completion
- Status: ON_TRACK, AT_RISK, BEHIND, COMPLETED
- Activity feed and real-time updates

### ✓ Actions (Tasks)
- **Kanban Board**: TODO → IN_PROGRESS → IN_REVIEW → DONE
- **List View**: Collapsible status groups
- Drag-drop reordering with optimistic UI
- Priority: LOW, MEDIUM, HIGH, URGENT
- Assignees and due dates

### 📢 Announcements
- Rich text editor (bold, italic, bullets)
- 8 emoji reactions: 👍 ❤️ 😂 🎉 🔥 😍 🤔 👏
- Comment threads with edit and delete capabilities
- @mention detection and real-time comment updates
- Pin important announcements
- Real-time reaction and comment notifications

### 📊 Analytics
- Animated stat cards with clickable modals
- Time-period filtering (1 day, 7 days, 1 month, 6 months, 1 year, all time)
- Progress visualization and tracking
- Edit progress directly from analytics modal
- Detailed item breakdown with member assignments
- Activity history and metrics

### 📅 Calendar
- Month view with clickable events
- Agenda view showing upcoming events
- Event detail modals with days until due
- Smart badges (Today, Soon, Future)
- Event type filtering (Goals, Actions, All)
- Responsive calendar grid with event indicators

### 📈 Activity Timeline
- Organized by time periods (Today, Yesterday, This Week, This Month, This Year, Older)
- User-based filtering with activity statistics
- Clickable activity items showing full change details
- JSON change tracking and visualization
- Actor information and timestamps

### 👥 Team Management
- Invite members via email with real-time notifications
- Role-based access (ADMIN/MEMBER)
- Member list with mobile responsive design
- Change roles and manage member status
- Assign members to goals and tasks
- Workspace settings per user

### 🌙 Theme
- Dark/light mode toggle
- Persistent preference with localStorage
- Smooth transitions across all UI

### 🔒 Security & Performance
- JWT authentication with httpOnly cookies
- Role-based access control (RBAC)
- Audit logging and activity tracking
- Optimistic UI updates with rollback
- Mobile responsive design across all pages
- Real-time Socket.io powered updates

---

## 👤 Author

**Afridi Akbar Ifty**

- **Portfolio**: [iamafrididev.netlify.app](https://iamafrididev.netlify.app)
- **GitHub**: [@iamafridi](https://github.com/iamafridi)

---

**Built for team collaboration and productivity 🚀**
