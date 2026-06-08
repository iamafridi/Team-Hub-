'use client'

import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  signOut: null,
  authInitialized: false,

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        const { token, ...safeUser } = user
        localStorage.setItem('user', JSON.stringify(safeUser))
      } else {
        localStorage.removeItem('user')
      }
    }
    set({
      user,
      isAuthenticated: !!user,
      token: user?.token || null,
      authInitialized: true,
    })
  },

  setSignOut: (fn) => set({ signOut: fn }),

  loadUser: () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          set({
            user,
            isAuthenticated: !!user,
          })
          return user
        } catch (e) {
          console.error('Failed to load user from localStorage', e)
        }
      }
    }
    return null
  },

  clearUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
    set({
      user: null,
      isAuthenticated: false,
      token: null,
      authInitialized: true,
    })
  },

  updateUser: (updates) =>
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...updates } : null
      if (typeof window !== 'undefined' && updatedUser) {
        const { token, ...safeUser } = updatedUser
        localStorage.setItem('user', JSON.stringify(safeUser))
      }
      return {
        user: updatedUser,
        token: updatedUser?.token || state.token,
      }
    }),
}))
