'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react'
import { mockAnalytics, mockGoals, mockActions } from '@/lib/mockData'

export default function AnalyticsPage() {
  const { id: workspaceId } = useParams()

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
    },
    {
      label: 'Actions Completed',
      value: mockAnalytics.actionsCompleted,
      total: mockAnalytics.totalActions,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Team Members',
      value: mockAnalytics.teamMembers,
      total: mockAnalytics.teamMembers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Overall Progress',
      value: `${mockAnalytics.overallProgress}%`,
      total: '100%',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600',
    },
  ]

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-blue-500 bg-clip-text text-transparent mb-2">
          Analytics
        </h1>
        <p className="text-text-secondary text-lg">
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
            >
              <div className={`bg-gradient-to-br ${stat.color} p-0.5 rounded-xl`}>
                <div className="bg-surface p-6 rounded-[10px]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-text-muted uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} opacity-10`}>
                      <Icon className="w-5 h-5 text-white" />
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
                      className={`bg-gradient-to-r ${stat.color} h-2 rounded-full`}
                      style={{
                        width: `${(stat.value / parseInt(stat.total)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts Section */}
      <motion.div variants={itemVariants}>
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold text-text-primary mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {mockGoals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
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
