'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/sign-in')
  }, [router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Redirecting...</h1>
      </div>
    </main>
  )
}
