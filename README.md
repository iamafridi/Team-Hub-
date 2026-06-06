# FredoCloud 🚀

A production-ready team collaboration platform for goal tracking, task management, and real-time collaboration.

**Live Demo**: Coming soon  
**Documentation**: See guides below

## ✨ Key Features

- **Goal Management** - Track team objectives with milestones and progress
- **Action Items** - Kanban board with drag-drop and list views
- **Announcements** - Rich text with emoji reactions and comment threads with @mentions
- **Real-Time Collaboration** - Live presence tracking, instant notifications, Socket.io updates
- **Analytics Dashboard** - Goal status, action completion, member activity, CSV export
- **Team Management** - Role-based access, member invites via email or link
- **Dark/Light Theme** - Persistent theme preference
- **Security** - JWT auth, RBAC, audit logging, input validation

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React, Zustand, Framer Motion, Tailwind CSS |
| **Backend** | Express.js, Node.js, Socket.io |
| **Database** | PostgreSQL, Prisma ORM |
| **Files** | Cloudinary |
| **Email** | Nodemailer |
| **Build** | Turbo monorepo, npm workspaces |
| **Deployment** | Railway, Docker, Self-hosted |

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md) | Full system overview, architecture, development workflow |
| [BACKEND_SETUP.md](./BACKEND_SETUP.md) | Backend installation, configuration, database, API details |
| [API_REFERENCE.md](./API_REFERENCE.md) | Complete API documentation with examples (35+ endpoints) |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Production deployment on Railway, Docker, self-hosted |

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
- Track with milestones (0-100% progress)
- Status: ON_TRACK, AT_RISK, BEHIND, COMPLETED
- Activity feed and goal updates

### ✓ Actions (Tasks)
- **Kanban Board**: TODO → IN_PROGRESS → IN_REVIEW → DONE
- **List View**: Collapsible status groups
- Drag-drop reordering with optimistic UI
- Priority: LOW, MEDIUM, HIGH, URGENT
- Assignees and due dates

### 📢 Announcements
- Rich text editor (bold, italic, bullets)
- 8 emoji reactions: 👍 ❤️ 😂 🎉 🔥 😍 🤔 👏
- Comment threads with @mention detection
- Pin important announcements
- Real-time updates

### 📊 Analytics
- Animated stat cards
- Goal status distribution
- Action completion progress
- Member activity ranking
- CSV export

### 🔔 Real-Time
- Online/offline presence tracking
- Instant notifications (mentions, invites)
- Notification bell with unread count
- Socket.io powered updates

### 👥 Teams
- Invite members via email or invite link
- Role-based access (ADMIN/MEMBER)
- Workspace settings
- Member management

### 🌙 Theme
- Dark/light mode toggle
- Persistent preference
- Smooth transitions

## 📡 API Overview

**35+ REST Endpoints** with real-time Socket.io support:

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/auth` | POST | Register, login, refresh, logout |
| `/workspaces` | GET, POST, PATCH, DELETE | CRUD + members, invites |
| `/goals` | GET, POST, PATCH, DELETE | Goal management with updates |
| `/actions` | GET, POST, PATCH, DELETE | Task/action items + reorder |
| `/announcements` | GET, POST, PATCH, DELETE | Announcements + reactions, comments |
| `/notifications` | GET, PATCH | Mark read, list |
| `/analytics` | GET | Stats, CSV export |
| `/audit` | GET | Audit logs (admin) |
| `/upload` | POST | Avatar upload |

See [API_REFERENCE.md](./API_REFERENCE.md) for complete documentation with examples.

## 🗄️ Database

**16 Models** including:
- User, Workspace, WorkspaceMember
- Goal, Milestone, GoalUpdate, ActionItem
- Announcement, Comment, Reaction, Mention
- Notification, AuditLog, RefreshToken, WorkspaceInvite

## 🔐 Security Features

- **Authentication**: JWT with httpOnly cookies, 15m access + 7d refresh
- **Authorization**: Role-based access control (RBAC)
- **Validation**: Zod schemas on all inputs
- **Hashing**: Bcryptjs password hashing (12 rounds)
- **Audit**: Immutable action trail for compliance
- **CORS**: Configured to CLIENT_URL
- **Headers**: Helmet security headers
- **Rate Limiting**: 100 req/15min per IP

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage
npm run test -- --coverage
```

## 📈 Performance

- Next.js code splitting & optimization
- Database indexes on common queries
- Connection pooling (Prisma)
- Socket.io room broadcasting
- Cursor pagination for logs
- Client-side caching with localStorage
- Optimistic UI updates

## 🚀 Deployment

### One-Click Deployment (Recommended)
```bash
# Railway: Pre-configured in railway.toml
# 1. Push to GitHub
# 2. Connect repository in Railway dashboard
# 3. Configure environment variables
# 4. Auto-deploys on git push
```

### Docker
```bash
docker-compose up -d
# Starts API, Web, PostgreSQL
```

### Self-Hosted
```bash
# See DEPLOYMENT_GUIDE.md for:
# - Ubuntu server setup
# - Nginx reverse proxy
# - PM2 process management
# - Let's Encrypt SSL
# - Database backups
```

## 📋 Development Workflow

```bash
# Start all services
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Database commands
npx prisma migrate dev --name feature_name
npx prisma migrate deploy
npx prisma studio

# Monorepo commands
npm --workspace=@team-hub/api run dev
npm --workspace=@team-hub/web run dev
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in package.json scripts
# Or kill process: lsof -i :4000 | grep LISTEN | awk '{print $2}' | xargs kill
```

### Database Connection Error
```bash
# Verify DATABASE_URL
psql $DATABASE_URL -c "SELECT NOW();"

# Run migrations
npx prisma migrate dev
```

### JWT/Token Issues
```bash
# Regenerate secrets
openssl rand -base64 32

# Update .env files
JWT_ACCESS_SECRET=<new>
JWT_REFRESH_SECRET=<new>
```

### Socket.io Not Connecting
- Verify CLIENT_URL matches your frontend domain
- Check port 4000 is accessible
- Confirm auth token is valid

See [COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md) for more troubleshooting.

## 📞 Support

- **Setup Issues**: See [BACKEND_SETUP.md](./BACKEND_SETUP.md)
- **API Documentation**: See [API_REFERENCE.md](./API_REFERENCE.md)
- **Deployment**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Architecture**: See [COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md)
- **API Testing**: Visit `http://localhost:4000/docs` (Swagger UI)

## 🚀 Advanced Features Implemented

**Choice #2: Optimistic UI** - Actions reflect instantly before server confirmation with graceful rollback on error
**Choice #5: Audit Log** - Immutable log of all workspace changes with filterable timeline UI and CSV export

## 🎯 Roadmap

- [x] Core goals & action items
- [x] Team collaboration features
- [x] Real-time updates
- [x] Analytics dashboard
- [x] Dark/light theme
- [x] Production deployment
- [x] Audit logging
- [x] Optimistic UI updates
- [ ] Mobile app (React Native)
- [ ] Real-time collaborative editing
- [ ] Offline support
- [ ] Integrations (Slack, GitHub, etc)

## 📝 License

MIT License - See LICENSE file

## 🙏 Credits

Built with:
- React & Next.js
- Express.js
- PostgreSQL & Prisma
- Socket.io
- Framer Motion
- Tailwind CSS
- Zustand

---

**Ready to get started?**

1. Follow [Quick Start](#-quick-start) above
2. Read [COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md) for overview
3. Check [API_REFERENCE.md](./API_REFERENCE.md) for API details
4. Deploy with [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

**Happy building! 🚀**
