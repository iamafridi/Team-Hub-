'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { Button, EmptyState, SkeletonCard, Avatar } from '@/components/ui'
import { Target, ListChecks, Megaphone, Flag, MessageSquare, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { mockActivity } from '@/lib/mockData'

const entityIcons = {
  Goal: Target,
  ActionItem: ListChecks,
  Announcement: Megaphone,
  Milestone: Flag,
  Comment: MessageSquare,
}

const actionVerbs = {
  CREATE: 'created',
  UPDATE: 'updated',
  DELETE: 'deleted',
  REORDER: 'reordered',
}

function formatRelativeTime(date) {
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function ActivityItem({ log, isLast }) {
  const Icon = entityIcons[log.entityType] || Activity
  const verb = actionVerbs[log.action] || log.action.toLowerCase()
  const timeAgo = formatRelativeTime(log.createdAt)

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-4 relative"
    >
      {!isLast && (
        <div className="absolute left-[19px] top-10 w-px h-[calc(100%-8px)] bg-border" />
      )}

      <div className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center flex-shrink-0 z-10">
        <Icon className="w-4 h-4 text-accent" />
      </div>

      <div className="flex-1 bg-surface border border-border rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar
              src={log.actor?.avatarUrl}
              name={log.actor?.name}
              size="sm"
            />
            <span className="text-sm font-medium text-text-primary truncate">
              {log.actor?.name}
            </span>
            <span className="text-sm text-text-secondary truncate">
              {verb}
            </span>
            <span className="text-sm text-text-muted truncate">
              {log.entityType}
            </span>
          </div>
          <span className="text-xs text-text-muted flex-shrink-0 whitespace-nowrap">
            {timeAgo}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default function ActivityPage() {
  const { id: workspaceId } = useParams()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [nextCursor, setNextCursor] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    fetchActivity()
  }, [workspaceId])

  const fetchActivity = async (cursor = null) => {
    try {
      if (!cursor) setLoading(true)
      const response = await api.get(
        `/workspaces/${workspaceId}/activity${cursor ? `?cursor=${cursor}` : ''}`
      )
      if (cursor) {
        setLogs([...logs, ...response.data.data])
      } else {
        setLogs(response.data.data)
      }
      setNextCursor(response.data.nextCursor)
    } catch (error) {
      // Use mock data as fallback for development (silent)
      setLogs(mockActivity)
      setNextCursor(null)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLoadMore = async () => {
    if (nextCursor) {
      setLoadingMore(true)
      await fetchActivity(nextCursor)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Activity</h1>
        <p className="text-sm sm:text-base text-text-secondary">
          Recent changes across your workspace
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Actions will appear here as your team makes changes"
        />
      ) : (
        <>
          <div className="space-y-0">
            {logs.map((log, index) => (
              <ActivityItem
                key={log.id}
                log={log}
                isLast={index === logs.length - 1}
              />
            ))}
          </div>

          {nextCursor && !loading && (
            <div className="flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                variant="secondary"
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
