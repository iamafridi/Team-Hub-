'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useActionStore } from '@/store/actionStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { Button, EmptyState, SkeletonCard, Modal } from '@/components/ui'
import { KanbanBoard } from '@/components/actions/KanbanBoard'
import { ListView } from '@/components/actions/ListView'
import { ActionModal } from '@/components/actions/ActionModal'
import { EntityCommentThread } from '@/components/comments/EntityCommentThread'
import { ListChecks, Plus, Layout, List } from 'lucide-react'
import toast from 'react-hot-toast'
import { mockActions } from '@/lib/mockData'

export default function ActionsPage() {
  const { id: workspaceId } = useParams()
  const { actions, setActions, addAction, updateAction, removeAction, reorderActions } = useActionStore()
  const { members } = useWorkspaceStore()
  const { user } = useAuthStore()
  const { openModal, closeModal, activeModal, modalData } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('kanban')
  const [editingAction, setEditingAction] = useState(null)
  const [commentTarget, setCommentTarget] = useState(null)

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const response = await api.get(`/workspaces/${workspaceId}/actions`)
        setActions(response.data.data)
      } catch (error) {
        // Use mock data as fallback for development (silent)
        setActions(mockActions)
      } finally {
        setLoading(false)
      }
    }

    if (workspaceId) {
      fetchActions()
    }
  }, [workspaceId, setActions])

  const handleCreateAction = async (formData) => {
    try {
      const response = await api.post(`/workspaces/${workspaceId}/actions`, {
        ...formData,
        goalId: modalData?.goalId || null,
      })
      addAction(response.data.data)
      toast.success(editingAction ? 'Action updated' : 'Action created')
    } catch (error) {
      // Use mock data for development
      const newAction = {
        id: `action-${Date.now()}`,
        ...formData,
        goalId: modalData?.goalId || null,
        status: formData.status || 'todo',
      }
      addAction(newAction)
      toast.success(editingAction ? 'Action updated (demo)' : 'Action created (demo)')
    } finally {
      closeModal()
      setEditingAction(null)
    }
  }

  const handleDeleteAction = async (actionId) => {
    if (!confirm('Delete this action?')) return
    try {
      await api.delete(`/workspaces/${workspaceId}/actions/${actionId}`)
      removeAction(actionId)
      toast.success('Action deleted')
    } catch (error) {
      toast.error('Failed to delete action')
    }
  }

  const handleReorder = async (actionId, fromStatus, toStatus) => {
    const action = actions.find((a) => a.id === actionId)
    if (!action) return

    const optimisticUpdate = {
      ...action,
      status: toStatus,
    }

    updateAction(actionId, optimisticUpdate)

    try {
      await api.patch(`/workspaces/${workspaceId}/actions/${actionId}`, {
        status: toStatus,
      })
      toast.success('Action moved')
    } catch (error) {
      updateAction(actionId, action)
      toast.error('Failed to move action')
    }
  }

  const handleEditAction = (action) => {
    setEditingAction(action)
    openModal('create-action')
  }

  const handleCommentClick = (action) => {
    setCommentTarget(action)
    openModal('entity-comment-action')
  }

  const handleProgressChange = async (actionId, newProgress) => {
    const action = actions.find((a) => a.id === actionId)
    if (!action) return

    const originalAction = { ...action }
    updateAction(actionId, { ...action, progress: newProgress })

    try {
      await api.patch(`/workspaces/${workspaceId}/actions/${actionId}`, {
        progress: newProgress,
      })
    } catch (error) {
      updateAction(actionId, originalAction)
      toast.error('Failed to update progress')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Actions</h1>
          <p className="text-sm sm:text-base text-text-secondary">Organize and track tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-surface rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Kanban view"
            >
              <Layout className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setEditingAction(null)
              openModal('create-action')
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Action
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : actions.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No actions yet"
          description="Create your first action to get started"
          action={() => openModal('create-action')}
          actionLabel="Create Action"
        />
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          actions={actions}
          onEdit={handleEditAction}
          onDelete={handleDeleteAction}
          onReorder={handleReorder}
          onCommentClick={handleCommentClick}
          onProgressChange={handleProgressChange}
        />
      ) : (
        <ListView
          actions={actions}
          onEdit={handleEditAction}
          onDelete={handleDeleteAction}
          onCommentClick={handleCommentClick}
          onProgressChange={handleProgressChange}
        />
      )}

      <ActionModal
        isOpen={activeModal === 'create-action'}
        onClose={() => {
          closeModal()
          setEditingAction(null)
        }}
        onSubmit={handleCreateAction}
        action={editingAction}
        workspaceMembers={members}
        goalId={modalData?.goalId}
      />

      <Modal
        isOpen={activeModal === 'entity-comment-action'}
        onClose={() => {
          closeModal()
          setCommentTarget(null)
        }}
        title="Comments"
      >
        {commentTarget && (
          <EntityCommentThread
            workspaceId={workspaceId}
            entityType="action"
            entityId={commentTarget.id}
            currentUserId={user?.id}
            workspaceMembers={members}
          />
        )}
      </Modal>
    </div>
  )
}
