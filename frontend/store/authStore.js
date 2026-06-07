'use client'

import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    }
    set({
      user,
      isAuthenticated: !!user,
    })
  },

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
    })
  },

  updateUser: (updates) =>
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...updates } : null
      if (typeof window !== 'undefined' && updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      return {
        user: updatedUser,
      }
    }),
}))
