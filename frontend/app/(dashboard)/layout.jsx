'use client'

import dynamic from 'next/dynamic'

const DashboardClient = dynamic(() => import('./dashboard-client').then(mod => ({ default: mod.DashboardClient })), {
  loading: () => (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="animate-spin text-2xl">⟳</div>
    </div>
  ),
  ssr: false,
})

export default function DashboardLayout({ children }) {
  return <DashboardClient>{children}</DashboardClient>
}
