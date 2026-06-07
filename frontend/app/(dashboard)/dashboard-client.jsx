'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useUIStore } from '@/store/uiStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useSocket } from '@/hooks/useSocket'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, Target, ListChecks, Megaphone, BarChart3, Activity, CalendarDays, Users, Settings, Sun, Moon, Trash2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import { CreateWorkspaceModal } from '@/components/dashboard/CreateWorkspaceModal'
import Link from 'next/link'

export function DashboardClient({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, setUser, loadUser } = useAuthStore()
  const { workspaces, activeWorkspace, setWorkspaces, setActiveWorkspace } = useWorkspaceStore()
  const { sidebarOpen, toggleSidebar, theme, toggleTheme } = useUIStore()
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore()
  const [mounted, setMounted] = useState(false)
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

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
    { icon: BookOpen, label: 'Audit', href: 'audit' },
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
      const savedUser = loadUser()
      if (!savedUser) {
        const savedAvatar = typeof window !== 'undefined' ? localStorage.getItem('profileAvatar') : null
        setUser({
          id: 'demo-user',
          email: 'demo@example.com',
          name: 'Demo User',
          avatarUrl: savedAvatar,
          role: 'ADMIN',
        })
      }
    }
  }, [user, setUser, loadUser, mounted])

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
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="w-72 bg-surface border-r border-border flex flex-col flex-shrink-0 lg:relative lg:translate-x-0 fixed inset-y-0 left-0 z-40 lg:z-0 overflow-y-auto"
          >
            {/* Logo Section */}
            <div className="p-6 border-b border-border">
              <h1 className="text-sm font-bold text-text-primary mb-1">
                <span className="text-accent">T</span>
                <span className="text-accent">H</span>
                <span className="text-text-muted ml-1">TEAM HUB</span>
              </h1>
              <p className="text-xs text-text-muted flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                CONNECTED · LIVE
              </p>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 p-4 space-y-6">
              {/* NAV Section */}
              <div>
                <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3 px-2">
                  § NAV · 01
                </p>
                <div className="space-y-1">
                  {navLinks.map((link, idx) => {
                    const Icon = link.icon
                    const active = isNavActive(link.href)
                    const href = link.href === 'dashboard' ? '/dashboard' : activeWorkspace ? `/workspace/${activeWorkspace.id}/${link.href}` : '#'
                    return (
                      <motion.div key={link.href} whileHover={{ x: 2 }} transition={{ duration: 0.1 }}>
                        <Link
                          href={href}
                          onClick={() => {
                            if (isMobile && sidebarOpen) {
                              toggleSidebar()
                            }
                          }}
                          className={`flex items-center gap-3 px-3 py-2 text-sm transition-all duration-150 ${active
                              ? 'text-text-primary font-medium border-l-2 border-accent -ml-px pl-[10px]'
                              : 'text-text-muted hover:text-text-primary'
                            }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span>{link.label}</span>
                          <span className="text-xs text-text-muted ml-auto">
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* INSIDE Section */}
              <div>
                <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3 px-2 flex items-center justify-between">
                  <span>§ INSIDE · 02</span>
                  <span className="text-text-muted">ADMIN</span>
                </p>
                <div className="px-2 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0"></div>
                    <p className="text-sm font-medium text-text-primary">{activeWorkspace?.name || 'Workspace'}</p>
                  </div>
                </div>
              </div>

              {/* Workspaces Section */}
              <div>
                <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3 px-2 flex items-center justify-between">
                  <span>§ WORKSPACES · 03</span>
                  <button onClick={() => setShowCreateWorkspaceModal(true)} className="text-accent text-lg leading-none hover:opacity-70">+</button>
                </p>
                <div className="space-y-1">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => setActiveWorkspace(ws)}
                      className={`w-full text-left px-3 py-2 text-sm transition-all duration-150 flex items-center gap-2 ${activeWorkspace?.id === ws.id
                          ? 'text-text-primary font-medium border-l-2 border-accent -ml-px pl-[10px]'
                          : 'text-text-muted hover:text-text-primary'
                        }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0"></span>
                      <span className="truncate">{ws.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-border space-y-3">
              {/* Theme Selector */}
              <div className="space-y-2">
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold px-2">THEME</p>
                <div className="flex gap-1">
                  {[
                    { label: 'DEFAULT', value: 'system' },
                    { label: 'LIGHT', value: 'light' },
                    { label: 'DARK', value: 'dark' }
                  ].map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => {
                        if (value === 'system') {
                          // Reset to system default
                          if (theme !== 'light') toggleTheme()
                        } else if (value === 'dark' && theme !== 'dark') {
                          toggleTheme()
                        } else if (value === 'light' && theme !== 'light') {
                          toggleTheme()
                        }
                      }}
                      className={`flex-1 px-2 py-1 text-xs uppercase font-semibold rounded transition-colors ${
                        (value === 'system' && theme === 'light') || (value === theme)
                          ? 'bg-text-primary text-white'
                          : 'bg-surface-2 text-text-primary hover:bg-border'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-full flex items-center gap-3 px-3 py-2 bg-white border border-border rounded-lg hover:bg-surface-2 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-text-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-semibold text-text-primary truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-border rounded-lg shadow-lg z-50"
                    >
                      <div className="p-3 border-b border-border">
                        <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                          SIGNED IN AS
                        </p>
                        <p className="text-sm font-semibold text-text-primary mt-1">
                          {user?.name || 'User'}
                        </p>
                      </div>
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            router.push('/profile')
                            setShowUserMenu(false)
                          }}
                          className="w-full text-left px-3 py-2 text-xs uppercase font-medium text-text-primary hover:bg-surface-2 rounded transition-colors"
                        >
                          Your profile
                        </button>
                        <button
                          onClick={() => {
                            setUser(null)
                            setShowUserMenu(false)
                            router.push('/login')
                          }}
                          className="w-full text-left px-3 py-2 text-xs uppercase font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateWorkspaceModal}
        onClose={() => setShowCreateWorkspaceModal(false)}
      />
    </div>
  )
}
