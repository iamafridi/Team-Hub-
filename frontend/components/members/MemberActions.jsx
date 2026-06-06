'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Power, Trash2, Check } from 'lucide-react'

const ROLES = ['ADMIN', 'MODERATOR', 'MEMBER']

export default function MemberActions({
  member,
  onChangeRole,
  onChangeStatus,
  onRemove,
  onClose,
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="absolute right-0 top-full mt-2 bg-surface border border-border rounded-lg shadow-xl z-40 min-w-56 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="divide-y divide-border">
        {/* Status Toggle */}
        <button
          onClick={() => {
            onChangeStatus(member.userId, !member.isActive)
            onClose()
          }}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-2 transition-colors text-text-primary text-left text-sm font-medium"
        >
          <Power className="w-4 h-4 flex-shrink-0" />
          <span>{member.isActive ? 'Deactivate' : 'Activate'}</span>
        </button>

        {/* Change Role */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-2 transition-colors text-text-primary text-left text-sm font-medium group"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span>Change Role</span>
            </div>
            <span className="text-text-muted group-hover:text-text-primary transition-colors">→</span>
          </button>

          {/* Role Submenu */}
          {showRoleMenu && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute left-full top-0 ml-1 bg-surface border border-border rounded-lg shadow-xl min-w-44"
            >
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onChangeRole(member.userId, role)
                    setShowRoleMenu(false)
                    onClose()
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-2 transition-colors text-text-primary text-left text-sm first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                    {role === member.role && <Check className="w-4 h-4 text-accent" />}
                  </div>
                  <span className={role === member.role ? 'font-semibold text-accent' : ''}>{role}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Remove Member */}
        {!confirmRemove ? (
          <button
            onClick={() => setConfirmRemove(true)}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-500/10 transition-colors text-red-400 text-left text-sm font-medium"
          >
            <Trash2 className="w-4 h-4 flex-shrink-0" />
            <span>Remove Member</span>
          </button>
        ) : (
          <div className="px-4 py-3 space-y-3">
            <div className="text-sm text-text-primary font-medium">Remove {member.user?.name}?</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setConfirmRemove(false)
                }}
                className="flex-1 px-3 py-2 text-xs bg-surface-2 hover:bg-surface-3 rounded transition-colors text-text-primary font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRemove(member.userId)
                  setConfirmRemove(false)
                  onClose()
                }}
                className="flex-1 px-3 py-2 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
