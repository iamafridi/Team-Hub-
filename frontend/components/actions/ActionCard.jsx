'use client'

import { motion } from 'framer-motion'
import { Card, Badge, Avatar } from '@/components/ui'
import { MoreVertical, Trash2, Pencil } from 'lucide-react'
import { Dropdown, DropdownItem } from '@/components/ui'

export function ActionCard({
  action,
  onEdit,
  onDelete,
  onClick,
  isDragging = false,
  className = '',
}) {
  const priorityColors = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  }

  const statusColors = {
    TODO: 'todo',
    IN_PROGRESS: 'in-progress',
    IN_REVIEW: 'in-review',
    DONE: 'done',
  }

  const formattedDue = action.dueDate
    ? new Date(action.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <motion.div
      whileHover={{ y: -2 }}
      layout
      transition={{ duration: 0.2 }}
    >
      <Card
        hover
        className={`cursor-pointer ${isDragging ? 'opacity-50' : ''} ${className}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary truncate line-clamp-2">
              {action.title}
            </h3>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              trigger={<MoreVertical className="w-4 h-4 flex-shrink-0" />}
              align="right"
            >
              <DropdownItem onClick={() => onEdit?.(action)}>
                <Pencil className="w-3 h-3 inline mr-2" />
                Edit
              </DropdownItem>
              <DropdownItem
                onClick={() => onDelete?.(action.id)}
                className="text-red-600"
              >
                <Trash2 className="w-3 h-3 inline mr-2" />
                Delete
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        {action.description && (
          <p className="text-xs text-text-muted mb-3 line-clamp-2">
            {action.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={priorityColors[action.priority] || 'medium'} size="sm">
              {action.priority}
            </Badge>
            {formattedDue && (
              <span className="text-xs text-text-muted">
                {formattedDue}
              </span>
            )}
          </div>

          {action.assignee && (
            <div className="flex items-center gap-2">
              <Avatar
                src={action.assignee.avatarUrl}
                name={action.assignee.name}
                size="xs"
              />
              <span className="text-xs text-text-muted">{action.assignee.name}</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
