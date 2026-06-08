const admin = require('../firebase/admin')
const prisma = require('../prisma/client')

async function useDevAuth(req) {
  let demoUser = await prisma.user.findUnique({
    where: { email: 'demo@example.com' }
  })
  if (!demoUser) {
    demoUser = await prisma.user.findUnique({
      where: { email: 'demo@teamhub.com' }
    })
  }
  if (demoUser) {
    req.userId = demoUser.id
    req.firebaseUid = demoUser.clerkId || 'demo-uid'
    return true
  }
  demoUser = await prisma.user.create({
    data: {
      clerkId: 'demo-uid',
      email: 'demo@example.com',
      name: 'Demo User',
      avatarUrl: null,
    }
  })
  req.userId = demoUser.id
  req.firebaseUid = demoUser.clerkId
  return true
}

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    const canDevAuth = process.env.ALLOW_DEV_AUTH === 'true' || !admin.isInitialized()

    if (!authHeader?.startsWith('Bearer ')) {
      if (canDevAuth) {
        try { await useDevAuth(req); return next() }
        catch { req.userId = 'dev-user-error-fallback'; req.firebaseUid = 'dev-fallback'; return next() }
      }
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!admin.isInitialized()) {
      if (canDevAuth) {
        try { await useDevAuth(req); return next() }
        catch { req.userId = 'dev-user-error-fallback'; req.firebaseUid = 'dev-fallback'; return next() }
      }
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.split(' ')[1]
    if (!token && canDevAuth) {
      try { await useDevAuth(req); return next() }
      catch { req.userId = 'dev-user-error-fallback'; req.firebaseUid = 'dev-fallback'; return next() }
    }
    const decoded = await admin.auth().verifyIdToken(token)

    let user = await prisma.user.findUnique({ where: { clerkId: decoded.uid } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: decoded.uid,
          email: decoded.email || '',
          name: decoded.name || decoded.email?.split('@')[0] || 'User',
          avatarUrl: decoded.picture || null,
        }
      })
    }

    req.userId = user.id
    req.firebaseUid = decoded.uid
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

module.exports = authMiddleware
