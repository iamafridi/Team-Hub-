'use client'

import { motion } from 'framer-motion'
import { Card, Badge, Avatar } from '@/components/ui'
import { ProgressBar } from '@/components/ui'
import { MoreVertical, Trash2 } from 'lucide-react'
import { Dropdown, DropdownItem } from '@/components/ui'

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  onClick,
  className = '',
}) {
  const statusColors = {
    ON_TRACK: 'on-track',
    AT_RISK: 'at-risk',
    BEHIND: 'behind',
    COMPLETED: 'completed',
  }

  const avgProgress = goal.milestones?.length
    ? Math.round(
        goal.milestones.reduce((sum, m) => sum + m.progress, 0) / goal.milestones.length
      )
    : 0

  const formattedDue = goal.dueDate
    ? new Date(goal.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
    >
      <Card
        hover
        className={`cursor-pointer ${className}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <Avatar
              src={goal.owner?.avatarUrl}
              name={goal.owner?.name}
              size="sm"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary truncate">
                {goal.title}
              </h3>
              <p className="text-xs text-text-muted">
                {goal.owner?.name}
              </p>
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              trigger={<MoreVertical className="w-4 h-4" />}
              align="right"
            >
              <DropdownItem onClick={() => onEdit?.(goal)}>
                Edit
              </DropdownItem>
              <DropdownItem
                onClick={() => onDelete?.(goal.id)}
                className="text-red-600"
              >
                <Trash2 className="w-3 h-3 inline mr-2" />
                Delete
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant={statusColors[goal.status]}>
              {goal.status.replace(/_/g, ' ')}
            </Badge>
            {formattedDue && (
              <span className="text-xs text-text-muted">
                {formattedDue}
              </span>
            )}
          </div>

          <ProgressBar value={avgProgress} size="sm" />

          <div className="flex justify-between text-xs text-text-muted">
            <span>{avgProgress}% progress</span>
            <span>{goal._count?.actionItems || 0} actions</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
