const { createClerkClient } = require('@clerk/backend')
const prisma = require('../prisma/client')

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      // In development/non-production, allow demo user for testing
      const isDevelopment = process.env.NODE_ENV !== 'production'

      if (isDevelopment) {
        try {
          // Try to find demo user - prefer demo@example.com (matches frontend)
          let demoUser = await prisma.user.findUnique({
            where: { email: 'demo@example.com' }
          })

          if (!demoUser) {
            // Fallback to demo@teamhub.com
            demoUser = await prisma.user.findUnique({
              where: { email: 'demo@teamhub.com' }
            })
          }

          if (demoUser) {
            req.userId = demoUser.id
            req.clerkId = demoUser.clerkId || 'demo-clerk-id'
            return next()
          }

          // If no demo user exists, create one
          demoUser = await prisma.user.create({
            data: {
              clerkId: 'demo-clerk-id',
              email: 'demo@example.com',
              name: 'Demo User',
              avatarUrl: null,
            }
          })

          req.userId = demoUser.id
          req.clerkId = demoUser.clerkId
          return next()
        } catch (devError) {
          // In development, allow request even if auth fails
          req.userId = 'dev-user-error-fallback'
          req.clerkId = 'dev-clerk-fallback'
          return next()
        }
      }
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.split(' ')[1]
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
    const payload = await clerk.verifyToken(token)

    // Find or create user in DB
    let user = await prisma.user.findUnique({ where: { clerkId: payload.sub } })
    if (!user) {
      const clerkUser = await clerk.users.getUser(payload.sub)
      user = await prisma.user.create({
        data: {
          clerkId: payload.sub,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
          avatarUrl: clerkUser.imageUrl || null,
        }
      })
    }

    req.userId = user.id
    req.clerkId = payload.sub
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

module.exports = authMiddleware
