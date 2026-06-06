'use client'

import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'
import { Zap, Target, Users, Bell } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuthStore()

  const stats = [
    { label: 'Total Workspaces', value: '1', icon: Zap, color: 'from-blue-500 to-blue-600' },
    { label: 'Active Goals', value: '0', icon: Target, color: 'from-purple-500 to-purple-600' },
    { label: 'Team Members', value: '0', icon: Users, color: 'from-green-500 to-green-600' },
    { label: 'Notifications', value: '0', icon: Bell, color: 'from-orange-500 to-orange-600' },
  ]

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

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="pt-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-blue-500 bg-clip-text text-transparent mb-2">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-text-secondary text-lg">
          Here's what's happening in your workspace today
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
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className={`bg-gradient-to-br ${stat.color} p-0.5 rounded-xl`}>
                <div className="bg-surface p-6 rounded-[10px] hover:bg-surface-2 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium text-text-muted uppercase tracking-wider">
                      {stat.label}
                    </div>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-20 transition-opacity`}>
                      <Icon className={`w-5 h-5 text-${stat.color.split('-')[1]}-500`} />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-text-primary">
                    {stat.value}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-text-muted">+0 this week</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold text-text-primary mb-6">Recent Activity</h2>
          <div className="flex items-center justify-center py-12 text-center">
            <div>
              <div className="text-text-muted text-lg mb-2">No activity yet</div>
              <p className="text-text-secondary text-sm">
                Start by creating a goal or inviting team members
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
