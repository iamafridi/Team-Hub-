'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useUIStore } from '@/store/uiStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useSocket } from '@/hooks/useSocket'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, Target, ListChecks, Megaphone, BarChart3, Activity, CalendarDays, Users, Settings, Sun, Moon, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import Link from 'next/link'

export function DashboardClient({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, setUser } = useAuthStore()
  const { workspaces, activeWorkspace, setWorkspaces, setActiveWorkspace } = useWorkspaceStore()
  const { sidebarOpen, toggleSidebar, theme, toggleTheme } = useUIStore()
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore()
  const [mounted, setMounted] = useState(false)

  const navLinks = [
    { icon: Home, label: 'Dashboard', href: 'dashboard' },
    { icon: Target, label: 'Goals', href: 'goals' },
    { icon: ListChecks, label: 'Actions', href: 'actions' },
    { icon: Megaphone, label: 'Announcements', href: 'announcements' },
    { icon: BarChart3, label: 'Analytics', href: 'analytics' },
    { icon: Activity, label: 'Activity', href: 'activity' },
    { icon: CalendarDays, label: 'Calendar', href: 'calendar' },
    { icon: Users, label: 'Members', href: 'members' },
    { icon: Trash2, label: 'Trash', href: 'trash' },
    { icon: Settings, label: 'Settings', href: 'settings' },
  ]

  const isNavActive = (href) => {
    return pathname.includes(`/${href}`)
  }

  const isMobile = mounted && typeof window !== 'undefined' && window.innerWidth < 1024

  useSocket()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme, mounted])

  useEffect(() => {
    if (!mounted) return
    if (!user) {
      setUser({
        id: 'demo-user',
        email: 'demo@example.com',
        name: 'Demo User',
        avatarUrl: null,
        role: 'ADMIN',
      })
    }
  }, [user, setUser, mounted])

  useEffect(() => {
    if (!mounted) return
    if (!activeWorkspace) {
      const mockWorkspace = {
        id: 'demo-workspace-1',
        name: 'Demo Workspace',
        description: 'Development workspace',
      }
      setWorkspaces([mockWorkspace])
      setActiveWorkspace(mockWorkspace)
    }
  }, [activeWorkspace, setWorkspaces, setActiveWorkspace, mounted])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin text-2xl">⟳</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-bg">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => toggleSidebar()}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="w-60 bg-surface border-r border-border flex flex-col flex-shrink-0 lg:relative lg:translate-x-0 fixed inset-y-0 left-0 z-40 lg:z-0"
          >
            <div className="h-16 px-6 border-b border-border flex items-center">
              <h1 className="text-xl font-bold text-accent">
                Team Hub
              </h1>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 px-3">
                {activeWorkspace?.name || 'Select workspace'}
              </p>
              {navLinks.map((link) => {
                const Icon = link.icon
                const active = isNavActive(link.href)
                const href = link.href === 'dashboard' ? '/dashboard' : activeWorkspace ? `/workspace/${activeWorkspace.id}/${link.href}` : '#'
                return (
                  <motion.div key={link.href} whileHover={{ x: 4 }} transition={{ duration: 0.1 }}>
                    <Link
                      href={href}
                      onClick={() => {
                        if (isMobile && sidebarOpen) {
                          toggleSidebar()
                        }
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                        active
                          ? 'bg-accent text-white'
                          : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{link.label}</span>
                      {active && (
                        <motion.div
                          className="ml-auto w-2 h-2 rounded-full bg-white"
                          layoutId="activeIndicator"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-surface-2">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="min-h-16 bg-surface border-b border-border flex items-center justify-between flex-wrap px-4 sm:px-6 gap-2 sm:gap-4 flex-shrink-0">
          <Button
            onClick={toggleSidebar}
            variant="ghost"
            size="sm"
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          <div className="hidden sm:flex flex-1" />

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block w-full sm:w-64 max-w-xs">
              <GlobalSearch workspaceId={activeWorkspace?.id} />
            </div>

            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkRead={markRead}
              onMarkAllRead={markAllRead}
            />

            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className="p-2"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="p-6 md:p-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
