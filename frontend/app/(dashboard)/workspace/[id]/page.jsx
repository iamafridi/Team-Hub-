'use client'

import { useWorkspaceStore } from '@/store/workspaceStore'

export default function WorkspacePage() {
  const { activeWorkspace } = useWorkspaceStore()

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">
        {activeWorkspace?.name}
      </h1>
      <p className="text-text-secondary">Workspace overview</p>
    </div>
  )
}
