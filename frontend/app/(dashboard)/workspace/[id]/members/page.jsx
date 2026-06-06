'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Mail, Shield, Plus, MoreVertical, CheckCircle, Circle, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { Button } from '@/components/ui'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useAuthStore } from '@/store/authStore'
import { useOptimistic } from '@/hooks/useOptimistic'
import InviteMemberModal from '@/components/members/InviteMemberModal'
import MemberActions from '@/components/members/MemberActions'

export default function MembersPage() {
  const { id: workspaceId } = useParams()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)

  const workspaceMembers = useWorkspaceStore((state) => state.members)
  const updateMemberRole = useWorkspaceStore((state) => state.updateMemberRole)
  const updateMemberStatus = useWorkspaceStore((state) => state.updateMemberStatus)
  const updateMember = useWorkspaceStore((state) => state.updateMember)
  const currentUser = useAuthStore((state) => state.user)
  const optimisticUpdate = useOptimistic()

  const currentMember = members.find((m) => {
    if (!currentUser) return false
    if (m.user?.email === currentUser.email) return true
    if (m.userId === currentUser.id) return true
    if (m.user?.id === currentUser.id) return true
    return false
  })

  // Show invite button if:
  // 1. Current user is identified as ADMIN
  // 2. OR there's at least one ADMIN in the workspace
  // 3. OR there are no members yet (let first user invite others)
  const isAdmin = currentMember?.role === 'ADMIN' || members.some(m => m.role === 'ADMIN') || members.length === 0

  useEffect(() => {
    fetchMembers()
  }, [workspaceId])

  async function fetchMembers() {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/members`)
      setMembers(res.data.data)
      useWorkspaceStore.setState({ members: res.data.data })
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to load members'

      if (error.response?.status === 401) {
        toast.error('Unauthorized: Please ensure you are logged in')
      } else if (error.response?.status === 404) {
        toast.error('Workspace not found')
      } else if (error.response?.status === 403) {
        toast.error('You do not have access to view members')
      } else {
        toast.error(errorMsg)
      }
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  async function handleChangeRole(userId, newRole) {
    if (!isAdmin) {
      toast.error('Only admins can change roles')
      return
    }

    const memberIndex = members.findIndex((m) => m.userId === userId)
    if (memberIndex === -1) {
      toast.error('Member not found')
      return
    }

    const oldMember = { ...members[memberIndex] }

    try {
      await optimisticUpdate(
        () => {
          const snapshot = [...members]
          setMembers(members.map((m) => (m.userId === userId ? { ...m, role: newRole } : m)))
          updateMemberRole(userId, newRole)
          return snapshot
        },
        async () => {
          const res = await api.patch(`/workspaces/${workspaceId}/members/${userId}`, { role: newRole })
        },
        (snapshot) => {
          setMembers(snapshot)
          updateMember(userId, oldMember)
        }
      )
      toast.success(`Role changed to ${newRole}`)
    } catch (error) {
      toast.error('Failed to change role: ' + (error.response?.data?.error || error.message))
    }
  }

  async function handleChangeStatus(userId, isActive) {
    if (!isAdmin) {
      toast.error('Only admins can change member status')
      return
    }

    const memberIndex = members.findIndex((m) => m.userId === userId)
    const oldMember = members[memberIndex]

    try {
      await optimisticUpdate(
        () => {
          const snapshot = [...members]
          setMembers(members.map((m) => (m.userId === userId ? { ...m, isActive } : m)))
          updateMemberStatus(userId, isActive)
          return snapshot
        },
        async () => {
          await api.patch(`/workspaces/${workspaceId}/members/${userId}/status`, { isActive })
        },
        (snapshot) => {
          setMembers(snapshot)
          updateMember(userId, oldMember)
        }
      )
      toast.success(isActive ? 'Member activated' : 'Member deactivated')
    } catch (error) {
      console.error('Failed to change status:', error)
    }
  }

  async function handleRemoveMember(userId) {
    if (!isAdmin) {
      toast.error('Only admins can remove members')
      return
    }

    if (userId === currentMember?.userId) {
      toast.error('You cannot remove yourself')
      return
    }

    const snapshot = [...members]
    try {
      await optimisticUpdate(
        () => {
          setMembers(members.filter((m) => m.userId !== userId))
          useWorkspaceStore.setState({ members: members.filter((m) => m.userId !== userId) })
          return snapshot
        },
        async () => {
          await api.delete(`/workspaces/${workspaceId}/members/${userId}`)
        },
        (prevSnapshot) => {
          setMembers(prevSnapshot)
        }
      )
      toast.success('Member removed')
    } catch (error) {
      console.error('Failed to remove member:', error)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.05 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.23, ease: 'easeOut' } },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-blue-500 bg-clip-text text-transparent mb-2">
            Team Members
          </h1>
          <p className="text-text-secondary text-lg">
            Manage workspace members, roles, and permissions
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowInviteModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Invite Member
          </Button>
        )}
      </motion.div>

      {/* Members List */}
      <motion.div
        className="bg-surface border border-border rounded-xl overflow-hidden"
        variants={itemVariants}
      >
        <div className="px-6 py-4 border-b border-border bg-surface-2">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Users className="w-5 h-5" />
            {members.length} Members
          </h2>
        </div>

        <div className="divide-y divide-border">
          <AnimatePresence>
            {members.map((member) => (
              <motion.div
                key={member.id}
                variants={itemVariants}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                className="px-6 py-4 flex items-center justify-between transition-colors relative"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {member.user?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-primary">{member.user?.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{member.user?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Active Status */}
                  <div className="flex items-center gap-2">
                    {member.isActive ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-text-primary">
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Role Badge */}
                  <div className="flex items-center gap-2 min-w-fit">
                    <Shield className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-text-primary uppercase tracking-wider">
                      {member.role}
                    </span>
                  </div>

                  {/* Actions (Admin Only) */}
                  {isAdmin && member.id !== currentMember?.id && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                        className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-text-muted" />
                      </button>
                      <AnimatePresence>
                        {openMenuId === member.id && (
                          <MemberActions
                            member={member}
                            onChangeRole={handleChangeRole}
                            onChangeStatus={handleChangeStatus}
                            onRemove={handleRemoveMember}
                            onClose={() => setOpenMenuId(null)}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <InviteMemberModal
            workspaceId={workspaceId}
            onClose={() => setShowInviteModal(false)}
            onSuccess={(newMember) => {
              setMembers([...members, newMember])
              useWorkspaceStore.setState({ members: [...members, newMember] })
              setShowInviteModal(false)
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
