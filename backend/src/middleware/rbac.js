const prisma = require('../prisma/client')

function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      // Get workspace ID from either :id or :workspaceId parameter
      const workspaceId = req.params.id || req.params.workspaceId

      if (!workspaceId) {
        return res.status(400).json({ error: 'Workspace ID required' })
      }

      let member = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: req.userId,
            workspaceId,
          },
        },
      })

      if (!member) {
        // In development, auto-add user as ADMIN if they're not a member
        if (process.env.NODE_ENV !== 'production') {
          try {
            // First, check if user exists
            let user = await prisma.user.findUnique({
              where: { id: req.userId }
            })

            if (!user) {
              // User doesn't exist, create a demo user
              user = await prisma.user.create({
                data: {
                  id: req.userId,
                  email: `user-${req.userId}@dev.local`,
                  name: 'Demo User',
                  clerkId: req.clerkId || 'dev-clerk-id'
                }
              })
            }

            member = await prisma.workspaceMember.create({
              data: {
                userId: req.userId,
                workspaceId,
                role: 'ADMIN',
              },
            })
          } catch (createError) {
            return res.status(403).json({ error: 'Forbidden' })
          }
        } else {
          return res.status(403).json({ error: 'Forbidden' })
        }
      } else if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      req.memberRole = member.role
      next()
    } catch (error) {
      return res.status(500).json({ error: 'Server error' })
    }
  }
}

module.exports = { requireRole }
