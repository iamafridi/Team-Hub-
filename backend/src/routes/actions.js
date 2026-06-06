const express = require('express')
const { z } = require('zod')
const prisma = require('../prisma/client')
const { logAction } = require('../utils/auditLog')
const { emitToWorkspace } = require('../socket/emitter')
const { sendAssignmentEmail } = require('../services/emailService')

const router = express.Router()

const createActionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().optional(),
  goalId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
})

const updateActionSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
})

router.get('/:workspaceId/actions', async (req, res) => {
  try {
    const { status, assigneeId, goalId } = req.query
    const where = { workspaceId: req.params.workspaceId, deletedAt: null }
    if (status) where.status = status
    if (assigneeId) where.assigneeId = assigneeId
    if (goalId) where.goalId = goalId

    const actions = await prisma.actionItem.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        goal: { select: { id: true, title: true } },
      },
      orderBy: [{ status: 'asc' }, { position: 'asc' }],
    })
    res.json({ data: actions, message: 'Actions fetched' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/:workspaceId/actions', async (req, res) => {
  try {
    const { title, description, priority, assigneeId, goalId, dueDate } = createActionSchema.parse(req.body)
    const action = await prisma.actionItem.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        assigneeId,
        goalId,
        dueDate: dueDate ? new Date(dueDate) : null,
        workspaceId: req.params.workspaceId,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        goal: { select: { id: true, title: true } },
      },
    })

    if (assigneeId) {
      const assigner = await prisma.user.findUnique({ where: { id: req.userId } })
      const workspace = await prisma.workspace.findUnique({ where: { id: req.params.workspaceId } })

      await prisma.notification.create({
        data: {
          userId: assigneeId,
          type: 'ACTION_ASSIGNED',
          message: `${assigner?.name || 'Team member'} assigned you to "${action.title}"`,
          link: `/workspace/${req.params.workspaceId}/actions`,
        },
      })

      if (action.assignee?.email) {
        const actionLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/workspace/${req.params.workspaceId}/actions`
        await sendAssignmentEmail(
          action.assignee.email,
          assigner?.name || 'Team member',
          action.title,
          workspace?.name || 'Workspace',
          actionLink
        )
      }
    }

    logAction(req.userId, req.params.workspaceId, 'CREATE', 'ActionItem', action.id)
    emitToWorkspace(req.params.workspaceId, 'action:created', { action })
    res.status(201).json({ data: action, message: 'Action created' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' })
    }
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.patch('/:workspaceId/actions/:actionId', async (req, res) => {
  try {
    const { title, description, priority, status, progress, assigneeId, dueDate } = updateActionSchema.parse(req.body)

    const existingAction = await prisma.actionItem.findUnique({
      where: { id: req.params.actionId },
      include: { assignee: true },
    })

    const action = await prisma.actionItem.update({
      where: { id: req.params.actionId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(progress !== undefined && { progress }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        goal: { select: { id: true, title: true } },
      },
    })

    if (assigneeId !== undefined && assigneeId !== existingAction.assigneeId && assigneeId) {
      const assigner = await prisma.user.findUnique({ where: { id: req.userId } })
      const workspace = await prisma.workspace.findUnique({ where: { id: req.params.workspaceId } })

      await prisma.notification.create({
        data: {
          userId: assigneeId,
          type: 'ACTION_ASSIGNED',
          message: `${assigner?.name || 'Team member'} assigned you to "${action.title}"`,
          link: `/workspace/${req.params.workspaceId}/actions`,
        },
      })

      if (action.assignee?.email) {
        const actionLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/workspace/${req.params.workspaceId}/actions`
        await sendAssignmentEmail(
          action.assignee.email,
          assigner?.name || 'Team member',
          action.title,
          workspace?.name || 'Workspace',
          actionLink
        )
      }

      emitToWorkspace(req.params.workspaceId, 'action:assigned', {
        actionId: action.id,
        assigneeId: assigneeId,
        actionTitle: action.title,
      })
    }

    logAction(req.userId, req.params.workspaceId, 'UPDATE', 'ActionItem', req.params.actionId)
    emitToWorkspace(req.params.workspaceId, 'action:updated', { action })
    res.json({ data: action, message: 'Action updated' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' })
    }
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/:workspaceId/actions/:actionId', async (req, res) => {
  try {
    await prisma.actionItem.update({
      where: { id: req.params.actionId },
      data: { deletedAt: new Date() }
    })
    logAction(req.userId, req.params.workspaceId, 'DELETE', 'ActionItem', req.params.actionId)
    emitToWorkspace(req.params.workspaceId, 'action:deleted', { actionId: req.params.actionId })
    res.json({ message: 'Action deleted' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.patch('/:workspaceId/actions/:actionId/restore', async (req, res) => {
  try {
    const action = await prisma.actionItem.update({
      where: { id: req.params.actionId },
      data: { deletedAt: null },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        goal: { select: { id: true, title: true } },
      },
    })
    logAction(req.userId, req.params.workspaceId, 'RESTORE', 'ActionItem', req.params.actionId)
    emitToWorkspace(req.params.workspaceId, 'action:restored', { action })
    res.json({ data: action, message: 'Action restored' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/:workspaceId/actions/reorder', async (req, res) => {
  try {
    const { updates } = z.object({
      updates: z.array(z.object({
        id: z.string(),
        status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
        position: z.number().optional(),
      }))
    }).parse(req.body)

    const results = await Promise.all(
      updates.map(update =>
        prisma.actionItem.update({
          where: { id: update.id },
          data: {
            ...(update.status && { status: update.status }),
            ...(update.position !== undefined && { position: update.position }),
          },
          include: {
            assignee: { select: { id: true, name: true, avatarUrl: true } },
          },
        })
      )
    )

    logAction(req.userId, req.params.workspaceId, 'REORDER', 'ActionItem', 'batch')
    emitToWorkspace(req.params.workspaceId, 'action:moved', { actions: results })
    res.json({ data: results, message: 'Actions reordered' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' })
    }
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
