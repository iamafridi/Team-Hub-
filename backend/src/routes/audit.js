const express = require('express')
const { requireRole } = require('../middleware/rbac')
const prisma = require('../prisma/client')

const router = express.Router()

router.get('/:workspaceId/audit', requireRole('ADMIN'), async (req, res) => {
  try {
    const { entityType, actorId, from, to, limit = 50, cursor } = req.query

    const where = { workspaceId: req.params.workspaceId }

    if (entityType) where.entityType = entityType
    if (actorId) where.actorId = actorId
    if (from) where.createdAt = { gte: new Date(from) }
    if (to) {
      if (!where.createdAt) where.createdAt = {}
      where.createdAt.lte = new Date(to)
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(parseInt(limit) || 50, 100),
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
    })

    const nextCursor = logs.length === parseInt(limit) ? logs[logs.length - 1].id : null

    res.json({
      data: logs,
      nextCursor,
      message: 'Audit logs fetched',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
