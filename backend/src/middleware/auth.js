const admin = require('../firebase/admin')
const prisma = require('../prisma/client')

async function authMiddleware(req, res, next) {
  try {
    if (process.env.AUTH_DISABLED === 'true') {
      const bypassEmail = process.env.AUTH_BYPASS_EMAIL || 'admin@test.com'
      let user = await prisma.user.findUnique({ where: { email: bypassEmail } })
      if (!user) {
        user = await prisma.user.create({
          data: {
            clerkId: 'bypass-' + Date.now(),
            email: bypassEmail,
            name: 'Admin (Bypass)',
            role: 'ADMIN',
          }
        })
      }
      req.userId = user.id
      req.firebaseUid = user.clerkId
      return next()
    }

    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!admin.isInitialized()) {
      return res.status(503).json({ error: 'Authentication service unavailable' })
    }

    const token = authHeader.split(' ')[1]
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
