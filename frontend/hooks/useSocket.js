'use client'

import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useGoalStore } from '@/store/goalStore'
import { useActionStore } from '@/store/actionStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'

let socket = null

export function useSocket() {
  // Socket connection disabled for now - will be implemented with backend
  return null
}
