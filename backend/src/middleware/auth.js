const admin = require('../firebase/admin')
const prisma = require('../prisma/client')

async function authMiddleware(req, res, next) {
  try {
    if (process.env.AUTH_DISABLED && process.env.AUTH_DISABLED !== 'false') {
      return next()
    }

    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      return next()
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
    next()
  }
}

module.exports = authMiddleware
