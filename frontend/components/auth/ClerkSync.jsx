'use client'

import { useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { useAuthStore } from '@/store/authStore'

export function ClerkSync() {
  const { isSignedIn, user } = useUser()
  const { getToken, signOut, isLoaded } = useAuth()
  const { setUser, clearUser, setSignOut } = useAuthStore()

  useEffect(() => {
    if (!isLoaded) return

    if (isSignedIn && user) {
      getToken().then(token => {
        setUser({
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          name: user.fullName || user.username || 'User',
          avatarUrl: user.imageUrl,
          role: 'ADMIN',
          token,
        })
      })
    } else {
      clearUser()
    }
  }, [isSignedIn, user, isLoaded, getToken, setUser, clearUser])

  useEffect(() => {
    setSignOut(() => {
      signOut()
      clearUser()
    })
    return () => setSignOut(null)
  }, [signOut, setSignOut, clearUser])

  return null
}
