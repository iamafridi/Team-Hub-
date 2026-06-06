'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, TrendingUp, Users, Target, X, Edit2, Trash2 } from 'lucide-react'
import { Button, Modal } from '@/components/ui'
import { mockAnalytics, mockGoals, mockActions } from '@/lib/mockData'
import toast from 'react-hot-toast'

export default function AnalyticsPage() {
  const { id: workspaceId } = useParams()
  const [selectedStat, setSelectedStat] = useState(null)
  const [timePeriod, setTimePeriod] = useState('all')
  const [editingItem, setEditingItem] = useState(null)
  const [editProgress, setEditProgress] = useState(0)
  const [editTitle, setEditTitle] = useState('')

  const getTimePeriodLabel = (period) => {
    const labels = {
      '1d': 'Last 24 Hours',
      '7d': 'Last 7 Days',
      '1m': 'Last Month',
      '6m': 'Last 6 Months',
      '1y': 'Last Year',
      all: 'All Time',
    }
    return labels[period] || period
  }

  const filterItemsByTimePeriod = (items, period) => {
    const now = new Date()
    return items.filter((item) => {
      const itemDate = new Date(item.createdAt)
      const diffTime = now - itemDate
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (period === '1d') return diffDays <= 1
      if (period === '7d') return diffDays <= 7
      if (period === '1m') return diffDays <= 30
      if (period === '6m') return diffDays <= 180
      if (period === '1y') return diffDays <= 365
      return true
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: 'easeOut',
      },
    },
  }

  const stats = [
    {
      label: 'Goals Completed',
      value: mockAnalytics.goalsCompleted,
      total: mockAnalytics.totalGoals,
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      key: 'goals',
      items: mockGoals,
    },
    {
      label: 'Actions Completed',
      value: mockAnalytics.actionsCompleted,
      total: mockAnalytics.totalActions,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      key: 'actions',
      items: mockActions,
    },
    {
      label: 'Team Members',
      value: mockAnalytics.teamMembers,
      total: mockAnalytics.teamMembers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      key: 'members',
      items: [],
    },
    {
      label: 'Overall Progress',
      value: `${mockAnalytics.overallProgress}%`,
      total: '100%',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600',
      key: 'progress',
      items: [...mockGoals, ...mockActions],
    },
  ]

  const currentStat = stats.find((s) => s.key === selectedStat)
  const filteredItems = currentStat ? filterItemsByTimePeriod(currentStat.items, timePeriod) : []

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-accent to-blue-500 bg-clip-text text-transparent mb-2">
          Analytics
        </h1>
        <p className="text-sm sm:text-lg text-text-secondary">
          Track your workspace performance and progress
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
              onClick={() => setSelectedStat(stat.key)}
              className="cursor-pointer"
            >
              <div className="bg-white border border-border rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-text-muted uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div className="p-2 rounded-lg bg-surface">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-text-primary">
                    {stat.value}
                  </span>
                  <span className="text-sm text-text-muted">
                    / {stat.total}
                  </span>
                </div>
                <div className="mt-4 w-full bg-surface-2 rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{
                      width: `${(stat.value / parseInt(stat.total)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedStat && currentStat && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-surface">
                    {currentStat.icon && <currentStat.icon className="w-6 h-6 text-accent" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary">{currentStat.label}</h2>
                    <p className="text-sm text-text-muted">
                      {currentStat.value} of {currentStat.total}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedStat(null)
                    setEditingItem(null)
                  }}
                  className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-text-muted" />
                </button>
              </div>

              {/* Time Period Filter */}
              <div className="border-b border-border p-6">
                <p className="text-sm font-medium text-text-muted mb-3">Filter by time period:</p>
                <div className="flex gap-2 flex-wrap">
                  {['1d', '7d', '1m', '6m', '1y', 'all'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setTimePeriod(period)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        timePeriod === period
                          ? 'bg-accent text-white'
                          : 'bg-surface-2 text-text-primary hover:bg-surface border border-border'
                      }`}
                    >
                      {getTimePeriodLabel(period)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="p-6">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-text-muted">No items in this time period</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-surface-2 rounded-lg border border-border hover:border-accent transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {editingItem?.id === item.id ? (
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                                  placeholder="Title"
                                />
                                <div>
                                  <label className="text-sm text-text-muted">
                                    Progress: {editProgress}%
                                  </label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={editProgress}
                                    onChange={(e) => setEditProgress(parseInt(e.target.value))}
                                    className="w-full"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      toast.success('Changes saved')
                                      setEditingItem(null)
                                    }}
                                    className="px-3 py-1 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingItem(null)}
                                    className="px-3 py-1 bg-surface border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-surface-2"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <h3 className="font-medium text-text-primary truncate">{item.title}</h3>
                                <p className="text-sm text-text-muted mt-1">
                                  Progress: {item.progress || 0}%
                                </p>
                                <p className="text-xs text-text-muted mt-2">
                                  Created: {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                              </>
                            )}
                          </div>

                          {editingItem?.id !== item.id && (
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => {
                                  setEditingItem(item)
                                  setEditTitle(item.title)
                                  setEditProgress(item.progress || 0)
                                }}
                                className="p-2 hover:bg-surface rounded-lg transition-colors text-accent"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  toast.success('Item moved to trash')
                                }}
                                className="p-2 hover:bg-surface rounded-lg transition-colors text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {!editingItem && (
                          <div className="mt-3 w-full bg-surface-2 rounded-full h-2">
                            <div
                              className="bg-accent h-2 rounded-full transition-all"
                              style={{ width: `${item.progress || 0}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recent Activity Section */}
      <motion.div variants={itemVariants}>
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold text-text-primary mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {mockGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center justify-between p-4 bg-surface-2 rounded-lg hover:border-accent border border-transparent transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedStat('goals')
                  setTimePeriod('all')
                }}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-text-primary">{goal.title}</h3>
                  <p className="text-sm text-text-muted">{goal.progress}% complete</p>
                </div>
                <div className="w-32 bg-surface rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-accent to-blue-500 h-2 rounded-full"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
