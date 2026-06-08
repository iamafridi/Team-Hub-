require('dotenv').config()
const Sentry = process.env.SENTRY_DSN ? require('@sentry/node') : null
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const { Server } = require('socket.io')
const http = require('http')

const prisma = require('./prisma/client')
const authMiddleware = require('./middleware/auth')
const errorHandler = require('./middleware/errorHandler')
const { initEmitter } = require('./socket/emitter')

const workspaceRoutes = require('./routes/workspaces')
const goalRoutes = require('./routes/goals')
const milestoneRoutes = require('./routes/milestones')
const actionRoutes = require('./routes/actions')
const announcementRoutes = require('./routes/announcements')
const notificationRoutes = require('./routes/notifications')
const analyticsRoutes = require('./routes/analytics')
const auditRoutes = require('./routes/audit')
const uploadRoutes = require('./routes/upload')
const commentRoutes = require('./routes/comments')
const searchRoutes = require('./routes/search')
const activityRoutes = require('./routes/activity')
const trashRoutes = require('./routes/trash')
const emailPreferencesRoutes = require('./routes/emailPreferences')
const { initDigestJob } = require('./jobs/digestJob')
const { initRecurrenceJob } = require('./jobs/recurrenceJob')

if (Sentry) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  })
}

const app = express()
app.set('trust proxy', 1)
const server = http.createServer(app)

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler())
}

const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'

const productionOrigins = [
  clientUrl,
  'https://team-hub.up.railway.app',
].filter(Boolean)

const developmentOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3006',
  'http://localhost:3007',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3006',
  'http://127.0.0.1:3007',
]

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? productionOrigins
  : [...productionOrigins, ...developmentOrigins]

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
})

initEmitter(io)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
})

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skip: (req) => !['POST', 'PATCH', 'DELETE'].includes(req.method),
})

app.use(helmet())
app.use(morgan('dev'))
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))
app.use(express.json())
app.use(limiter)

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Team Hub API',
      version: '1.0.0',
    },
    servers: [
      {
        url: '/api',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch (e) {
    res.status(503).json({ status: 'error', message: 'Database unreachable' })
  }
})

app.use('/workspaces', authMiddleware, workspaceRoutes)
app.use('/workspaces', authMiddleware, writeLimiter, goalRoutes)
app.use('/goals', authMiddleware, writeLimiter, milestoneRoutes)
app.use('/workspaces', authMiddleware, writeLimiter, actionRoutes)
app.use('/workspaces', authMiddleware, writeLimiter, announcementRoutes)
app.use('/notifications', authMiddleware, notificationRoutes)
app.use('/workspaces', authMiddleware, analyticsRoutes)
app.use('/workspaces', authMiddleware, auditRoutes)
app.use('/upload', authMiddleware, writeLimiter, uploadRoutes)
app.use('/workspaces', authMiddleware, writeLimiter, commentRoutes)
app.use('/workspaces', authMiddleware, searchRoutes)
app.use('/workspaces', authMiddleware, activityRoutes)
app.use('/workspaces', authMiddleware, writeLimiter, trashRoutes)
app.use('/email', emailPreferencesRoutes)

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    const admin = require('./firebase/admin')

    if (!token || !admin.isInitialized()) {
      if (process.env.ALLOW_DEV_AUTH === 'true') {
        socket.userId = 'dev-user'
        return next()
      }
      return next(new Error('Unauthorized'))
    }

    const decoded = await admin.auth().verifyIdToken(token)
    const user = await prisma.user.findUnique({ where: { clerkId: decoded.uid } })
    if (!user) {
      return next(new Error('User not found'))
    }

    socket.userId = user.id
    next()
  } catch (error) {
    next(new Error('Unauthorized'))
  }
})

io.on('connection', async (socket) => {
  try {
    const { workspaceId } = socket.handshake.query

    if (workspaceId) {
      // Verify user is a workspace member before joining
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: socket.userId,
            workspaceId,
          },
        },
      })

      if (!membership) {
        socket.emit('error', { message: 'Not a workspace member' })
        socket.disconnect(true)
        return
      }

      socket.join(`workspace:${workspaceId}`)
      socket.join(`user:${socket.userId}`)

      await prisma.workspaceMember.update({
        where: {
          userId_workspaceId: {
            userId: socket.userId,
            workspaceId,
          },
        },
        data: {
          isOnline: true,
          lastSeenAt: new Date(),
        },
      })

      const onlineUsers = await prisma.workspaceMember.findMany({
        where: { workspaceId, isOnline: true },
        select: { userId: true },
      })

      io.to(`workspace:${workspaceId}`).emit('presence:update', {
        onlineUserIds: onlineUsers.map(m => m.userId),
      })
    }

    socket.on('disconnect', async () => {
      try {
        if (workspaceId) {
          await prisma.workspaceMember.update({
            where: {
              userId_workspaceId: {
                userId: socket.userId,
                workspaceId,
              },
            },
            data: {
              isOnline: false,
            },
          })

          const onlineUsers = await prisma.workspaceMember.findMany({
            where: { workspaceId, isOnline: true },
            select: { userId: true },
          })

          io.to(`workspace:${workspaceId}`).emit('presence:update', {
            onlineUserIds: onlineUsers.map(m => m.userId),
          })
        }
      } catch (error) {
        console.error('Error on disconnect:', error)
      }
    })
  } catch (error) {
    console.error('Socket connection error:', error)
  }
})

app.use(errorHandler)

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler())
}

const PORT = process.env.PORT || 4000

server.listen(PORT, async () => {
  try {
    await prisma.$connect()
    console.log('✅ Database connected')
    initDigestJob()
    initRecurrenceJob()
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
    console.warn('⚠️  Server will start without database. Health check will report 503 until DB is available.')
  }
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📚 API docs: http://localhost:${PORT}/docs`)
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
