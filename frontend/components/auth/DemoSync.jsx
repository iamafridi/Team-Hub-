'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export function DemoSync() {
  const { setUser, loadUser, setSignOut } = useAuthStore()

  useEffect(() => {
    const stored = loadUser()
    if (stored) return

    const params = new URLSearchParams(window.location.search)
    const autoLogin = params.get('demo') === 'true'
    if (autoLogin) {
      setUser({
        id: 'demo-user-id',
        email: 'demo@example.com',
        name: 'Demo User',
        avatarUrl: null,
        role: 'ADMIN',
        token: null,
      })
    }
  }, [setUser, loadUser])

  useEffect(() => {
    setSignOut(() => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    })
    return () => setSignOut(null)
  }, [setSignOut])

  return null
}
