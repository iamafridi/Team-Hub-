'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useGoalStore } from '@/store/goalStore'
import { useUIStore } from '@/store/uiStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import api from '@/lib/api'
import { Button, Badge, EmptyState, SkeletonCard, Modal, Input } from '@/components/ui'
import { GoalCard } from '@/components/goals/GoalCard'
import { Target, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { mockGoals } from '@/lib/mockData'

const statusFilters = ['All', 'ON_TRACK', 'AT_RISK', 'BEHIND', 'COMPLETED']

export default function GoalsPage() {
  const { id: workspaceId } = useParams()
  const { goals, setGoals, addGoal, removeGoal, updateGoal } = useGoalStore()
  const { openModal, closeModal, activeModal } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [formData, setFormData] = useState({ title: '', description: '', dueDate: '' })
  const [editingGoal, setEditingGoal] = useState(null)

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await api.get(`/workspaces/${workspaceId}/goals`)
        setGoals(response.data.data)
      } catch (error) {
        // Use mock data as fallback for development (silent)
        setGoals(mockGoals)
      } finally {
        setLoading(false)
      }
    }

    if (workspaceId) {
      fetchGoals()
    }
  }, [workspaceId, setGoals])

  const filtered = goals.filter((g) =>
    filter === 'All' ? true : g.status === filter
  )

  const handleEditGoal = (goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description || '',
      dueDate: goal.dueDate ? goal.dueDate.split('T')[0] : '',
    })
    openModal('create-goal')
  }

  const handleCreateGoal = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Please enter a goal title')
      return
    }

    if (editingGoal) {
      // Update existing goal
      try {
        await api.put(`/workspaces/${workspaceId}/goals/${editingGoal.id}`, formData)
        updateGoal(editingGoal.id, {
          ...editingGoal,
          ...formData,
        })
        toast.success('Goal updated')
      } catch (error) {
        // Use mock update for development
        updateGoal(editingGoal.id, {
          ...editingGoal,
          ...formData,
        })
        toast.success('Goal updated (demo)')
      }
    } else {
      // Create new goal
      try {
        const response = await api.post(`/workspaces/${workspaceId}/goals`, formData)
        addGoal(response.data.data)
        toast.success('Goal created')
      } catch (error) {
        // Use mock data for development
        const newGoal = {
          id: `goal-${Date.now()}`,
          ...formData,
          status: 'in_progress',
          progress: 0,
          owner: { id: 'user-1', name: 'Demo User' },
        }
        addGoal(newGoal)
        toast.success('Goal created (demo)')
      }
    }

    closeModal()
    setFormData({ title: '', description: '', dueDate: '' })
    setEditingGoal(null)
  }

  const handleDeleteGoal = async (goalId) => {
    if (!confirm('Delete this goal?')) return
    try {
      await api.delete(`/workspaces/${workspaceId}/goals/${goalId}`)
      removeGoal(goalId)
      toast.success('Goal deleted')
    } catch (error) {
      toast.error('Failed to delete goal')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Goals</h1>
          <p className="text-text-secondary">Track team objectives and milestones</p>
        </div>
        <Button
          variant="primary"
          onClick={() => openModal('create-goal')}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusFilters.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-accent text-white'
                : 'bg-surface-2 text-text-primary hover:bg-surface'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Create your first goal to get started"
          action={() => openModal('create-goal')}
          actionLabel="Create Goal"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={handleDeleteGoal}
              onEdit={handleEditGoal}
              onClick={() => handleEditGoal(goal)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={activeModal === 'create-goal'}
        onClose={() => {
          closeModal()
          setFormData({ title: '', description: '', dueDate: '' })
          setEditingGoal(null)
        }}
        title={editingGoal ? 'Edit Goal' : 'Create Goal'}
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Launch v2.0"
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What needs to be accomplished?"
          />
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1">
              {editingGoal ? 'Save Changes' : 'Create'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                closeModal()
                setFormData({ title: '', description: '', dueDate: '' })
                setEditingGoal(null)
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
