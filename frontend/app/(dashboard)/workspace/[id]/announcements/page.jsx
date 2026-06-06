'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useUIStore } from '@/store/uiStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { Button, EmptyState, SkeletonCard, Modal } from '@/components/ui'
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard'
import { AnnouncementModal } from '@/components/announcements/AnnouncementModal'
import { CommentThread } from '@/components/announcements/CommentThread'
import { Megaphone, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { mockAnnouncements } from '@/lib/mockData'

export default function AnnouncementsPage() {
  const { id: workspaceId } = useParams()
  const { openModal, closeModal, activeModal, modalData } = useUIStore()
  const { members } = useWorkspaceStore()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState([])
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get(`/workspaces/${workspaceId}/announcements`)
        const sorted = response.data.data.sort((a, b) => {
          if (a.isPinned === b.isPinned) {
            return new Date(b.createdAt) - new Date(a.createdAt)
          }
          return b.isPinned - a.isPinned
        })
        setAnnouncements(sorted)
      } catch (error) {
        // Use mock data as fallback for development (silent)
        setAnnouncements(mockAnnouncements)
      } finally {
        setLoading(false)
      }
    }

    if (workspaceId) {
      fetchAnnouncements()
    }
  }, [workspaceId])

  const fetchComments = async (announcementId) => {
    setLoadingComments(true)
    try {
      const response = await api.get(`/workspaces/${workspaceId}/announcements/${announcementId}/comments`)
      setComments(response.data.data)
    } catch (error) {
      // Silently fail - use empty comments for development
      setComments([])
    } finally {
      setLoadingComments(false)
    }
  }

  const handleCreateAnnouncement = async (formData) => {
    try {
      const response = await api.post(`/workspaces/${workspaceId}/announcements`, formData)
      const newAnnouncement = response.data.data
      setAnnouncements([newAnnouncement, ...announcements])
      toast.success('Announcement posted')
      closeModal()
      setEditingAnnouncement(null)
    } catch (error) {
      toast.error('Failed to post announcement')
    }
  }

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!confirm('Delete this announcement?')) return
    try {
      await api.delete(`/workspaces/${workspaceId}/announcements/${announcementId}`)
      setAnnouncements(announcements.filter((a) => a.id !== announcementId))
      toast.success('Announcement deleted')
    } catch (error) {
      toast.error('Failed to delete announcement')
    }
  }

  const handlePinAnnouncement = async (announcementId) => {
    const announcement = announcements.find((a) => a.id === announcementId)
    if (!announcement) return

    try {
      const endpoint = announcement.isPinned ? 'unpin' : 'pin'
      await api.patch(`/workspaces/${workspaceId}/announcements/${announcementId}/${endpoint}`)

      const updated = announcements.map((a) =>
        a.id === announcementId ? { ...a, isPinned: !a.isPinned } : a
      )

      const sorted = updated.sort((a, b) => {
        if (a.isPinned === b.isPinned) {
          return new Date(b.createdAt) - new Date(a.createdAt)
        }
        return b.isPinned - a.isPinned
      })

      setAnnouncements(sorted)
      toast.success(announcement.isPinned ? 'Unpinned' : 'Pinned')
    } catch (error) {
      toast.error('Failed to update announcement')
    }
  }

  const handleReact = async (announcementId, emoji) => {
    try {
      const announcement = announcements.find((a) => a.id === announcementId)
      const hasReacted = announcement.reactions?.some(
        (r) => r.emoji === emoji && r.userId === user.id
      )

      if (hasReacted) {
        await api.delete(
          `/workspaces/${workspaceId}/announcements/${announcementId}/reactions/${emoji}`
        )
      } else {
        await api.post(`/workspaces/${workspaceId}/announcements/${announcementId}/reactions`, {
          emoji,
        })
      }

      const updated = announcements.map((a) => {
        if (a.id === announcementId) {
          if (hasReacted) {
            return {
              ...a,
              reactions: a.reactions.filter((r) => !(r.emoji === emoji && r.userId === user.id)),
            }
          } else {
            return {
              ...a,
              reactions: [...(a.reactions || []), { emoji, userId: user.id }],
            }
          }
        }
        return a
      })

      setAnnouncements(updated)
    } catch (error) {
      toast.error('Failed to add reaction')
    }
  }

  const handleAddComment = async (commentData) => {
    try {
      const response = await api.post(
        `/workspaces/${workspaceId}/announcements/${selectedAnnouncement.id}/comments`,
        {
          content: commentData.content,
        }
      )

      setComments([...comments, response.data.data])
      toast.success('Comment added')
    } catch (error) {
      toast.error('Failed to add comment')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    try {
      await api.delete(
        `/workspaces/${workspaceId}/announcements/${selectedAnnouncement.id}/comments/${commentId}`
      )
      setComments(comments.filter((c) => c.id !== commentId))
      toast.success('Comment deleted')
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement)
    openModal('create-announcement')
  }

  const handleCommentClick = async (announcement) => {
    setSelectedAnnouncement(announcement)
    await fetchComments(announcement.id)
    openModal('comment-thread')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Announcements</h1>
          <p className="text-text-secondary">Share updates with your team</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingAnnouncement(null)
            openModal('create-announcement')
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="Share your first announcement with the team"
          action={() => openModal('create-announcement')}
          actionLabel="Create Announcement"
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onEdit={handleEditAnnouncement}
              onDelete={handleDeleteAnnouncement}
              onPin={handlePinAnnouncement}
              onReact={handleReact}
              onCommentClick={handleCommentClick}
              currentUserId={user?.id}
              isPinned={announcement.isPinned}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Announcement Modal */}
      <AnnouncementModal
        isOpen={activeModal === 'create-announcement'}
        onClose={() => {
          closeModal()
          setEditingAnnouncement(null)
        }}
        onSubmit={handleCreateAnnouncement}
        announcement={editingAnnouncement}
      />

      {/* Comment Thread Modal */}
      <Modal
        isOpen={activeModal === 'comment-thread'}
        onClose={() => closeModal()}
        title={selectedAnnouncement ? 'Comments' : ''}
      >
        {loadingComments ? (
          <div className="text-center py-4 text-text-muted">Loading comments...</div>
        ) : (
          <CommentThread
            announcement={selectedAnnouncement}
            comments={comments}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            currentUserId={user?.id}
            workspaceMembers={members}
          />
        )}
      </Modal>
    </div>
  )
}
