'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { EmailPasswordForm } from '@/components/auth/EmailPasswordForm'

export default function LoginPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && user) router.replace('/dashboard')
  }, [mounted, user, router])

  if (!mounted) return null
  if (user) return null

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
      {/* LEFT COLUMN — Marketing */}
      <div
        className="hidden lg:flex flex-col justify-between w-[60%] relative"
        style={{ backgroundColor: '#f2ede3' }}
      >
        {/* Top nav */}
        <div className="flex items-center justify-between px-10 pt-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-wider" style={{ color: '#1a1a1a' }}>T·H</span>
            <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color: '#888' }}>THE TEAM HUB</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] tracking-[0.2em]" style={{ color: '#888' }}>
              VOL. 26 / ISSUE 02
            </span>
            <span className="text-[10px] tracking-[0.15em] flex items-center gap-1" style={{ color: '#d4431a' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#d4431a' }} />
              LIVE
            </span>
            <button style={{ color: '#888' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="px-10">
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#1a1a1a' }} className="leading-[0.95]">
            <div className="text-[4.5rem] font-light tracking-tight">Where</div>
            <div className="text-[4.5rem] italic font-light tracking-tight">
              teams.<span style={{ color: '#d4431a' }}>.</span>
            </div>
            <div className="text-[4.5rem] font-bold tracking-tight relative inline-block">
              ship together
              <span className="absolute -bottom-2 left-0 w-full h-1" style={{ backgroundColor: '#d4431a' }} />
            </div>
          </h1>

          <p className="mt-8 text-sm leading-relaxed max-w-md" style={{ color: '#666' }}>
            Goals, action items, announcements, and an immutable audit trail — one workspace your team will actually open every day. No flair you don't need; every pixel earns its place.
          </p>

          {/* Features */}
          <div className="mt-12 space-y-6 max-w-md">
            {[
              ['01', 'Goals that don\'t slip', 'Milestone-tracked OKRs with progress sliders and an activity feed every owner actually reads.'],
              ['02', 'Real-time, not real-noisy', 'Live presence, instant updates, and @mentions that route to the right inbox — over WebSockets.'],
              ['03', 'Audit-ready by default', 'Every mutation is captured immutably. Filter by actor, export to CSV, and pass review boards in minutes.'],
            ].map(([num, title, desc]) => (
              <div key={num}>
                <div className="border-t border-dashed" style={{ borderColor: '#d4cfc5' }} />
                <div className="flex gap-4 pt-4">
                  <span className="text-sm font-mono font-bold" style={{ color: '#d4431a', width: 28 }}>{num}</span>
                  <div>
                    <p className="text-sm italic font-medium" style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#1a1a1a' }}>{title}</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: '#888' }}>{desc}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t border-dashed" style={{ borderColor: '#d4cfc5' }} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-10 pb-6 text-[11px] font-mono" style={{ color: '#888' }}>
          <span>
            &nbsp;NOW @<span style={{ color: '#d4431a' }}>grace.h</span> closed{' '}
            <span style={{ color: '#d4431a' }}>ITEM-093</span> &middot; done
          </span>
          <span>UTC</span>
        </div>
      </div>

      {/* RIGHT COLUMN — Auth Form */}
      <div
        className="w-full lg:w-[40%] flex flex-col justify-center px-8 sm:px-14 lg:px-16 relative"
        style={{ backgroundColor: '#ede8df' }}
      >
        {/* Vertical divider */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px" style={{ backgroundColor: '#d4cfc5' }} />

        {/* Step label */}
        <div className="flex items-center gap-2 mb-10">
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: '#999' }}>
            &mdash; STEP 01 / SIGN IN
          </span>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#d4431a' }} />
          <span className="text-[10px] tracking-[0.15em]" style={{ color: '#aaa' }}>
            EVENING DESK &middot; 18:18
          </span>
        </div>

        {/* Heading */}
        <h2
          className="text-4xl leading-tight mb-2"
          style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#1a1a1a' }}
        >
          Welcome <span className="italic">back.</span>
        </h2>
        <p className="text-sm mb-8" style={{ color: '#888' }}>
          New to the workbench?{' '}
          <a href="#" className="underline" style={{ color: '#1a1a1a' }}>Open an account &rarr;</a>
        </p>

        {/* Form */}
        <EmailPasswordForm />

        {/* Footer */}
        <p className="mt-10 text-center text-[9px] tracking-[0.3em] uppercase" style={{ color: '#aaa' }}>
          ENCRYPTED IN TRANSIT &middot; NEVER RESOLD
        </p>
      </div>
    </div>
  )
}
