'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui'

const mockAuditLog = [
  {
    id: '001',
    timestamp: new Date('2026-05-06T14:23:00'),
    actor: 'asafa',
    action: 'INVITE.CREATE',
    description: 'INVITE · CROTTGEF801...',
    details: 'Invited member to workspace',
  },
  {
    id: '002',
    timestamp: new Date('2026-05-06T10:15:00'),
    actor: 'asafa',
    action: 'WORKSPACE.CREATE',
    description: 'WORKSPACE · CROTTFMBE801...',
    details: 'Created new workspace',
  },
  {
    id: '003',
    timestamp: new Date('2026-05-05T09:42:00'),
    actor: 'admin',
    action: 'GOAL.CREATE',
    description: 'Goal created: Q3 Planning',
    details: 'New goal created by admin',
  },
  {
    id: '004',
    timestamp: new Date('2026-05-05T08:30:00'),
    actor: 'asafa',
    action: 'MEMBER.ROLE_CHANGE',
    description: 'Changed role to ADMIN',
    details: 'Updated member permissions',
  },
  {
    id: '005',
    timestamp: new Date('2026-05-04T16:20:00'),
    actor: 'system',
    action: 'WORKSPACE.UPDATED',
    description: 'Workspace settings updated',
    details: 'Automatic update',
  },
]

export default function AuditPage() {
  const { id: workspaceId } = useParams()
  const [actor, setActor] = useState('')
  const [action, setAction] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const filteredLogs = useMemo(() => {
    return mockAuditLog.filter((log) => {
      const actorMatch = !actor || log.actor.toLowerCase().includes(actor.toLowerCase())
      const actionMatch = !action || log.action.toLowerCase().includes(action.toLowerCase())
      const fromMatch = !fromDate || new Date(log.timestamp) >= new Date(fromDate)
      const toMatch = !toDate || new Date(log.timestamp) <= new Date(toDate)
      return actorMatch && actionMatch && fromMatch && toMatch
    })
  }, [actor, action, fromDate, toDate])

  const downloadCSV = () => {
    const headers = ['Timestamp', 'Actor', 'Action', 'Description']
    const rows = filteredLogs.map((log) => [
      log.timestamp.toLocaleString(),
      log.actor,
      log.action,
      log.details,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-5xl font-serif text-text-primary mb-2"><span className="italic">Audit</span></h1>
        <p className="text-text-secondary">
          Immutable timeline of workspace activity — filterable by actor, action, and date.
        </p>
      </motion.div>

      {/* Action Bar */}
      <motion.div
        className="flex items-center justify-between gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-sm text-text-muted font-medium">
          {filteredLogs.length} ENTRIES
        </div>
        <Button
          onClick={downloadCSV}
          variant="primary"
          size="md"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          DOWNLOAD CSV
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="bg-white border border-border rounded-xl p-6 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
          § FILTERS · 01
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
              Actor
            </label>
            <input
              type="text"
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              placeholder="Name or email..."
              className="w-full px-3 py-2 border-b border-border bg-transparent text-text-primary placeholder-text-muted outline-none transition-colors hover:border-text-secondary focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
              Action
            </label>
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. goal.create"
              className="w-full px-3 py-2 border-b border-border bg-transparent text-text-primary placeholder-text-muted outline-none transition-colors hover:border-text-secondary focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border-b border-border bg-transparent text-text-primary outline-none transition-colors hover:border-text-secondary focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
              To
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border-b border-border bg-transparent text-text-primary outline-none transition-colors hover:border-text-secondary focus:border-accent"
            />
          </div>
        </div>
      </motion.div>

      {/* Entries */}
      <motion.div
        className="bg-white border border-border rounded-xl p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-6">
          § ENTRIES · {filteredLogs.length.toString().padStart(2, '0')}
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted">No audit entries match your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="border-b border-border pb-4 last:border-b-0"
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-2">
                  <div>
                    <p className="text-xs text-text-muted uppercase">Timestamp</p>
                    <p className="text-sm font-medium text-text-primary">
                      {log.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase">Actor</p>
                    <p className="text-sm font-medium text-text-primary">{log.actor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase">Action</p>
                    <p className="text-sm font-medium text-text-primary">{log.action}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase">Description</p>
                    <p className="text-sm font-medium text-text-primary">{log.details}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Footer */}
      <motion.div
        className="text-xs text-text-muted text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        END OF RECORD · PAGE 01 OF 01
      </motion.div>
    </motion.div>
  )
}
