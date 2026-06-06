const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Delete in correct order to avoid foreign key constraints
  await prisma.mention.deleteMany()
  await prisma.reaction.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.goalUpdate.deleteMany()
  await prisma.milestone.deleteMany()
  await prisma.actionItem.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.workspaceInvite.deleteMany()
  await prisma.workspaceMember.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.workspace.deleteMany()
  await prisma.user.deleteMany()

  // Create demo user for frontend auth store
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Demo User',
    },
  })

  const user1 = await prisma.user.create({
    data: {
      email: 'demo@teamhub.com',
      name: 'Alex Demo',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'jordan@teamhub.com',
      name: 'Jordan Smith',
    },
  })

  const workspace = await prisma.workspace.create({
    data: {
      id: 'demo-workspace-1',
      name: 'Acme Corp',
      description: 'Demo workspace',
      accentColor: '#6366F1',
    },
  })

  await prisma.workspaceMember.createMany({
    data: [
      { userId: demoUser.id, workspaceId: workspace.id, role: 'ADMIN' },
      { userId: user1.id, workspaceId: workspace.id, role: 'ADMIN' },
      { userId: user2.id, workspaceId: workspace.id, role: 'MEMBER' },
    ],
  })

  const goal1 = await prisma.goal.create({
    data: {
      title: 'Launch v2.0',
      description: 'Release new product version with improved features',
      status: 'ON_TRACK',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ownerId: user1.id,
      workspaceId: workspace.id,
    },
  })

  const goal2 = await prisma.goal.create({
    data: {
      title: 'Improve Performance',
      description: 'Optimize database queries and reduce load times',
      status: 'AT_RISK',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      ownerId: user2.id,
      workspaceId: workspace.id,
    },
  })

  const goal3 = await prisma.goal.create({
    data: {
      title: 'Q3 Marketing Push',
      description: 'Execute marketing campaign for Q3',
      status: 'COMPLETED',
      dueDate: new Date(),
      ownerId: user1.id,
      workspaceId: workspace.id,
    },
  })

  await prisma.milestone.createMany({
    data: [
      { title: 'Design phase', progress: 100, completed: true, goalId: goal1.id },
      { title: 'Development', progress: 60, completed: false, goalId: goal1.id },
      { title: 'Testing', progress: 30, completed: false, goalId: goal1.id },
      { title: 'Query optimization', progress: 45, completed: false, goalId: goal2.id },
      { title: 'Caching implementation', progress: 20, completed: false, goalId: goal2.id },
      { title: 'Campaign completed', progress: 100, completed: true, goalId: goal3.id },
    ],
  })

  await prisma.actionItem.createMany({
    data: [
      {
        title: 'Review design mockups',
        priority: 'HIGH',
        status: 'TODO',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        assigneeId: user1.id,
        goalId: goal1.id,
        workspaceId: workspace.id,
        position: 0,
      },
      {
        title: 'Write API documentation',
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        assigneeId: user2.id,
        goalId: goal1.id,
        workspaceId: workspace.id,
        position: 1,
      },
      {
        title: 'Implement authentication',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        assigneeId: user1.id,
        goalId: goal1.id,
        workspaceId: workspace.id,
        position: 0,
      },
      {
        title: 'Code review for performance module',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        assigneeId: user2.id,
        goalId: goal2.id,
        workspaceId: workspace.id,
        position: 1,
      },
      {
        title: 'Fix database indexing',
        priority: 'MEDIUM',
        status: 'IN_REVIEW',
        dueDate: new Date(),
        assigneeId: user1.id,
        goalId: goal2.id,
        workspaceId: workspace.id,
        position: 0,
      },
      {
        title: 'Publish Q3 results',
        priority: 'LOW',
        status: 'DONE',
        dueDate: new Date(),
        assigneeId: user2.id,
        goalId: goal3.id,
        workspaceId: workspace.id,
        position: 0,
      },
    ],
  })

  const announcement1 = await prisma.announcement.create({
    data: {
      title: 'Welcome to Acme Corp!',
      content: 'Excited to have everyone on board. Let\'s build something great together!',
      isPinned: true,
      authorId: user1.id,
      workspaceId: workspace.id,
    },
  })

  const announcement2 = await prisma.announcement.create({
    data: {
      title: 'Q3 Planning Kickoff',
      content: 'Join us for the quarterly planning session next Monday. All hands meeting at 10am.',
      isPinned: false,
      authorId: user1.id,
      workspaceId: workspace.id,
    },
  })

  const comment1 = await prisma.comment.create({
    data: {
      content: 'Great initiative! Looking forward to this.',
      authorId: user2.id,
      announcementId: announcement1.id,
    },
  })

  const comment2 = await prisma.comment.create({
    data: {
      content: '@jordan will handle the preparations',
      authorId: user1.id,
      announcementId: announcement1.id,
    },
  })

  await prisma.mention.createMany({
    data: [
      { userId: user2.id, commentId: comment2.id },
    ],
  })

  await prisma.reaction.createMany({
    data: [
      { emoji: '👍', userId: user1.id, announcementId: announcement1.id },
      { emoji: '❤️', userId: user2.id, announcementId: announcement1.id },
      { emoji: '🎉', userId: user1.id, announcementId: announcement1.id },
    ],
  })

  await prisma.goalUpdate.createMany({
    data: [
      {
        content: 'Completed design phase on schedule. Moving to development next week.',
        goalId: goal1.id,
        authorId: user1.id,
      },
      {
        content: 'Development is 60% complete. On track for milestone delivery.',
        goalId: goal1.id,
        authorId: user1.id,
      },
    ],
  })

  console.log('✅ Seeding completed successfully!')
  console.log('Demo credentials:')
  console.log('  Email: demo@teamhub.com')
  console.log('  Email: jordan@teamhub.com')
  console.log('  Password: demo123')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
