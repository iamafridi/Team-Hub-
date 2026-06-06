'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useNotificationStore } from '@/store/notificationStore'
import api from '@/lib/api'
import { motion } from 'framer-motion'
import { Zap, Target, Users, Bell } from 'lucide-react'
import { mockGoals, mockMembers, mockActions } from '@/lib/mockData'
import {
  DashboardGoalsModal,
  DashboardMembersModal,
  DashboardNotificationsModal,
  DashboardWorkspacesModal,
} from '@/components/dashboard/DashboardModals'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { workspaces, activeWorkspace } = useWorkspaceStore()
  const { notifications } = useNotificationStore()
  const [openModal, setOpenModal] = useState(null)
  const [stats, setStats] = useState([
    { label: 'Total Workspaces', value: '—', icon: Zap },
    { label: 'Active Goals', value: '—', icon: Target },
    { label: 'Team Members', value: '—', icon: Users },
    { label: 'Notifications', value: '—', icon: Bell },
  ])

  useEffect(() => {
    if (!activeWorkspace?.id) return

    const fetchStats = async () => {
      try {
        const [goalsRes, membersRes] = await Promise.all([
          api.get(`/workspaces/${activeWorkspace.id}/goals`),
          api.get(`/workspaces/${activeWorkspace.id}/members`),
        ])

        const activeGoals = goalsRes.data.data.filter((g) => g.status !== 'COMPLETED').length
        const memberCount = membersRes.data.data.length

        setStats([
          { label: 'Total Workspaces', value: workspaces.length.toString(), icon: Zap },
          { label: 'Active Goals', value: activeGoals.toString(), icon: Target },
          { label: 'Team Members', value: memberCount.toString(), icon: Users },
          { label: 'Notifications', value: notifications.length.toString(), icon: Bell },
        ])
      } catch (error) {
        // Use mock data as fallback for development (silent)
        const activeGoals = mockGoals.filter((g) => g.status !== 'COMPLETED').length
        const memberCount = mockMembers.length

        setStats([
          { label: 'Total Workspaces', value: workspaces.length.toString(), icon: Zap },
          { label: 'Active Goals', value: activeGoals.toString(), icon: Target },
          { label: 'Team Members', value: memberCount.toString(), icon: Users },
          { label: 'Notifications', value: notifications.length.toString(), icon: Bell },
        ])
      }
    }

    fetchStats()
  }, [activeWorkspace?.id, workspaces.length, notifications.length])

  const cardModalMap = {
    'Total Workspaces': 'workspaces',
    'Active Goals': 'goals',
    'Team Members': 'members',
    'Notifications': 'notifications',
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

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="pt-2">
        <h1 className="text-4xl font-bold text-text-primary mb-2">
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
              className="group cursor-pointer"
              onClick={() => setOpenModal(cardModalMap[stat.label])}
            >
              <div className="bg-white border border-border rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-text-muted uppercase tracking-wider">
                    {stat.label}
                  </div>
                  <div className="p-2 rounded-lg bg-surface">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-text-primary">
                  {stat.value}
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-text-muted">+0 this week</p>
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

      {/* Modals */}
      {openModal === 'goals' && (
        <DashboardGoalsModal
          workspaceId={activeWorkspace?.id}
          isOpen
          onClose={() => setOpenModal(null)}
          currentUser={user}
        />
      )}
      {openModal === 'members' && (
        <DashboardMembersModal
          workspaceId={activeWorkspace?.id}
          isOpen
          onClose={() => setOpenModal(null)}
          currentUser={user}
        />
      )}
      {openModal === 'notifications' && (
        <DashboardNotificationsModal
          isOpen
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === 'workspaces' && (
        <DashboardWorkspacesModal
          isOpen
          onClose={() => setOpenModal(null)}
          currentUser={user}
        />
      )}
    </motion.div>
  )
}
