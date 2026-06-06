'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Settings, Lock, Bell, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'

export default function SettingsPage() {
  const { id: workspaceId } = useParams()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  }

  const settingsSections = [
    {
      title: 'Workspace Settings',
      icon: Settings,
      items: [
        {
          label: 'Workspace Name',
          description: 'Change your workspace name',
          value: 'Demo Workspace',
        },
        {
          label: 'Description',
          description: 'Add a description for your workspace',
          value: 'Development workspace',
        },
      ],
    },
    {
      title: 'Privacy & Security',
      icon: Lock,
      items: [
        {
          label: 'Visibility',
          description: 'Control who can see your workspace',
          value: 'Private',
        },
        {
          label: 'Invite Links',
          description: 'Manage workspace invite links',
          value: 'Enabled',
        },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Email Notifications',
          description: 'Receive updates via email',
          value: 'Enabled',
        },
        {
          label: 'Goal Updates',
          description: 'Get notified when goals are updated',
          value: 'Enabled',
        },
      ],
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
          Settings
        </h1>
        <p className="text-text-secondary text-lg">
          Manage your workspace configuration and preferences
        </p>
      </motion.div>

      {/* Settings Sections */}
      <motion.div className="space-y-6" variants={containerVariants}>
        {settingsSections.map((section) => {
          const Icon = section.icon
          return (
            <motion.div
              key={section.title}
              variants={itemVariants}
              className="bg-surface border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-bold text-text-primary">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-4">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-4 bg-surface-2 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-text-primary">
                        {item.label}
                      </h3>
                      <p className="text-sm text-text-muted">
                        {item.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                        {item.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        variants={itemVariants}
        className="bg-red-500/10 border border-red-500/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-red-500/20">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
        </div>
        <p className="text-sm text-red-600/80 mb-4">
          Irreversible actions. Proceed with caution.
        </p>
        <Button variant="destructive">Delete Workspace</Button>
      </motion.div>
    </motion.div>
  )
}
