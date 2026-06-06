const express = require('express')
const { z } = require('zod')
const prisma = require('../prisma/client')
const { requireRole } = require('../middleware/rbac')
const { logAction } = require('../utils/auditLog')
const { emitToWorkspace } = require('../socket/emitter')

const router = express.Router()

// Debug endpoint
router.get('/debug/info', async (req, res) => {
  try {
    const userCount = await prisma.user.count()
    const workspaceCount = await prisma.workspace.count()
    const memberCount = await prisma.workspaceMember.count()

    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId }
    })

    res.json({
      userId: req.userId,
      currentUser: currentUser ? { id: currentUser.id, email: currentUser.email, name: currentUser.name } : null,
      stats: {
        users: userCount,
        workspaces: workspaceCount,
        members: memberCount
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const createWorkspaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
})

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
})

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MODERATOR', 'MEMBER']).optional(),
})

router.get('/', async (req, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: { some: { userId: req.userId } },
      },
      include: {
        _count: { select: { members: true } },
      },
    })
    res.json({ data: workspaces, message: 'Workspaces fetched' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, description, accentColor } = createWorkspaceSchema.parse(req.body)
    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        accentColor: accentColor || '#6366F1',
        members: {
          create: { userId: req.userId, role: 'ADMIN' },
        },
      },
      include: { members: true },
    })
    logAction(req.userId, workspace.id, 'CREATE', 'Workspace', workspace.id)
    res.status(201).json({ data: workspace, message: 'Workspace created' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' })
    }
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
        _count: { select: { goals: true, actionItems: true } },
      },
    })
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' })
    }
    const hasMembership = workspace.members.some(m => m.userId === req.userId)
    if (!hasMembership) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    res.json({ data: workspace, message: 'Workspace fetched' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.patch('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, description, accentColor } = updateWorkspaceSchema.parse(req.body)
    const workspace = await prisma.workspace.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(accentColor && { accentColor }),
      },
    })
    logAction(req.userId, workspace.id, 'UPDATE', 'Workspace', workspace.id)
    emitToWorkspace(workspace.id, 'workspace:updated', { workspace })
    res.json({ data: workspace, message: 'Workspace updated' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' })
    }
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.workspace.delete({ where: { id: req.params.id } })
    logAction(req.userId, req.params.id, 'DELETE', 'Workspace', req.params.id)
    res.json({ message: 'Workspace deleted' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/:id/members', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Workspace ID required' })
    }

    let workspace = null
    try {
      workspace = await prisma.workspace.findUnique({
        where: { id: req.params.id },
        include: { members: { select: { userId: true } } },
      })
    } catch (dbError) {
      // Silently continue, workspace will be null
    }

    if (!workspace) {
      // In development, return empty members list (don't create workspace, just return empty)
      if (process.env.NODE_ENV !== 'production') {
        return res.json({ data: [], message: 'Members fetched' })
      }
      return res.status(404).json({ error: 'Workspace not found' })
    }

    const isMember = workspace.members && workspace.members.some(m => m.userId === req.userId)

    if (!isMember) {
      // In development, allow access anyway
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Forbidden' })
      }
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    }).catch(() => [])

    res.json({ data: members || [], message: 'Members fetched' })
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message })
  }
})

router.patch('/:id/members/:userId', requireRole('ADMIN'), async (req, res) => {
  try {
    const { role } = z.object({ role: z.enum(['ADMIN', 'MODERATOR', 'MEMBER']) }).parse(req.body)
    const member = await prisma.workspaceMember.update({
      where: {
        userId_workspaceId: { userId: req.params.userId, workspaceId: req.params.id },
      },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    })
    logAction(req.userId, req.params.id, 'UPDATE', 'WorkspaceMember', member.id)
    emitToWorkspace(req.params.id, 'member:role-changed', { userId: req.params.userId, role })
    res.json({ data: member, message: 'Role updated' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' })
    }
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.patch('/:id/members/:userId/status', requireRole('ADMIN'), async (req, res) => {
  try {
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body)
    const member = await prisma.workspaceMember.update({
      where: {
        userId_workspaceId: { userId: req.params.userId, workspaceId: req.params.id },
      },
      data: { isActive },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    })
    logAction(req.userId, req.params.id, 'UPDATE', 'WorkspaceMember', member.id)
    emitToWorkspace(req.params.id, 'member:status-changed', { userId: req.params.userId, isActive })
    res.json({ data: member, message: 'Member status updated' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' })
    }
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/:id/members/:userId', requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.workspaceMember.delete({
      where: {
        userId_workspaceId: { userId: req.params.userId, workspaceId: req.params.id },
      },
    })
    logAction(req.userId, req.params.id, 'DELETE', 'WorkspaceMember', req.params.userId)
    emitToWorkspace(req.params.id, 'member:removed', { userId: req.params.userId })
    res.json({ message: 'Member removed' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/:id/invite', requireRole('ADMIN'), async (req, res) => {
  try {
    const { email, role } = inviteSchema.parse(req.body)

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      const existingMember = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: { userId: existingUser.id, workspaceId: req.params.id },
        },
      })
      if (existingMember) {
        return res.status(400).json({ error: 'User already in workspace' })
      }
    }

    const invite = await prisma.workspaceInvite.create({
      data: {
        email,
        role: role || 'MEMBER',
        workspaceId: req.params.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    logAction(req.userId, req.params.id, 'CREATE', 'WorkspaceInvite', invite.id)

    const workspace = await prisma.workspace.findUnique({
      where: { id: req.params.id },
      select: { name: true },
    })

    const inviter = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { name: true },
    })

    if (workspace && inviter) {
      const inviteLink = `${process.env.CLIENT_URL}/accept-invite/${invite.token}`
      try {
        const { sendInviteEmail } = require('../services/emailService')
        await sendInviteEmail(email, workspace.name, inviteLink, inviter.name)
      } catch (emailError) {
        console.error('Failed to send invite email:', emailError)
      }
    }

    res.status(201).json({ data: invite, message: 'Invite sent' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    res.status(500).json({ error: 'Server error', details: error.message })
  }
})

router.post('/join/:token', async (req, res) => {
  try {
    const invite = await prisma.workspaceInvite.findUnique({
      where: { token: req.params.token },
    })
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' })
    }
    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invite expired' })
    }
    const member = await prisma.workspaceMember.create({
      data: {
        userId: req.userId,
        workspaceId: invite.workspaceId,
        role: invite.role,
      },
    })
    await prisma.workspaceInvite.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED' },
    })
    logAction(req.userId, invite.workspaceId, 'CREATE', 'WorkspaceMember', member.id)
    emitToWorkspace(invite.workspaceId, 'member:joined', { userId: req.userId })
    res.json({ data: member, message: 'Workspace joined' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/:id/members/generate-invite', requireRole('ADMIN'), async (req, res) => {
  try {
    const invite = await prisma.workspaceInvite.create({
      data: {
        email: `invite-${Date.now()}@invited.local`,
        role: 'MEMBER',
        workspaceId: req.params.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
    const inviteLink = `${process.env.CLIENT_URL}/accept-invite/${invite.token}`
    logAction(req.userId, req.params.id, 'CREATE', 'InviteLink', invite.id)
    res.json({ inviteLink, message: 'Invite link generated' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
