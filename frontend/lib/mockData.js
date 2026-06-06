// Mock data for development - replace with real API calls later

export const mockGoals = [
  {
    id: 'goal-1',
    title: 'Q1 Revenue Target',
    description: 'Increase revenue by 25%',
    status: 'in_progress',
    progress: 65,
    dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    owner: { id: 'user-1', name: 'Demo User', avatar: null },
  },
  {
    id: 'goal-2',
    title: 'Product Launch',
    description: 'Launch new product features',
    status: 'in_progress',
    progress: 40,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    owner: { id: 'user-1', name: 'Demo User', avatar: null },
  },
]

export const mockActions = [
  {
    id: 'action-1',
    title: 'Review Q1 metrics',
    status: 'completed',
    assignee: { id: 'user-1', name: 'Demo User' },
    dueDate: new Date().toISOString(),
    goalId: 'goal-1',
  },
  {
    id: 'action-2',
    title: 'Schedule stakeholder meeting',
    status: 'in_progress',
    assignee: { id: 'user-1', name: 'Demo User' },
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    goalId: 'goal-1',
  },
  {
    id: 'action-3',
    title: 'Prepare demo materials',
    status: 'todo',
    assignee: { id: 'user-1', name: 'Demo User' },
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    goalId: 'goal-2',
  },
]

export const mockMembers = [
  {
    id: 'user-1',
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'admin',
    avatar: null,
    status: 'active',
  },
  {
    id: 'user-2',
    name: 'Team Member',
    email: 'member@example.com',
    role: 'member',
    avatar: null,
    status: 'active',
  },
]

export const mockAnnouncements = [
  {
    id: 'announce-1',
    title: 'Welcome to Demo Workspace',
    content: 'This is a demonstration workspace for exploring Team Hub features.',
    author: { id: 'user-1', name: 'Demo User' },
    createdAt: new Date().toISOString(),
    reactions: [],
    comments: [],
  },
]

export const mockAnalytics = {
  goalsCompleted: 2,
  totalGoals: 3,
  actionsCompleted: 1,
  totalActions: 3,
  teamMembers: 2,
  overallProgress: 45,
}
