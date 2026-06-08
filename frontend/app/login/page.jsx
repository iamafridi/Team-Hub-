'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { EmailPasswordForm } from '@/components/auth/EmailPasswordForm'

const c = {
  light: {
    bgLeft: '#f2ede3', bgRight: '#ede8df', border: '#d4cfc5',
    textPrimary: '#1a1a1a', textSecondary: '#888', textMuted: '#999',
    textMuted2: '#aaa', textDesc: '#666', inputBorder: '#ccc', btnBg: '#1a1a1a',
  },
  dark: {
    bgLeft: '#1a1510', bgRight: '#221d18', border: '#3a3530',
    textPrimary: '#e8e0d5', textSecondary: '#a09888', textMuted: '#80786a',
    textMuted2: '#706858', textDesc: '#908878', inputBorder: '#444', btnBg: '#e8e0d5',
  },
}

function useBDClock() {
  const [clock, setClock] = useState({ time: '00:00:00', period: 'NIGHT', label: '' })
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      })
      const t = fmt.format(now)
      const h = parseInt(t.split(':')[0])
      let period, label
      if (h >= 5 && h < 12) { period = 'MORNING'; label = 'MORNING DESK' }
      else if (h >= 12 && h < 17) { period = 'AFTERNOON'; label = 'AFTERNOON BRIEF' }
      else if (h >= 17 && h < 20) { period = 'EVENING'; label = 'EVENING DESK' }
      else { period = 'NIGHT'; label = 'NIGHT OPS' }
      setClock({ time: t, period, label })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return clock
}

function useGitHubData() {
  const [stats, setStats] = useState({ vol: 68, issue: 68 })
  const [commits, setCommits] = useState([])
  const [commitIndex, setCommitIndex] = useState(0)

  const fetchStats = useCallback(async () => {
    try {
      const [volRes, issueRes] = await Promise.all([
        fetch('https://api.github.com/repos/iamafridi/FredoCloud/commits?per_page=1'),
        fetch('https://api.github.com/repos/iamafridi/FredoCloud/commits?per_page=1&since=2026-01-01T00:00:00Z'),
      ])
      const volLink = volRes.headers.get('Link')
      const issueLink = issueRes.headers.get('Link')
      const vol = volLink ? parseInt(volLink.match(/page=(\d+)>; rel="last"/)?.[1] || 68) : 68
      const issue = issueLink ? parseInt(issueLink.match(/page=(\d+)>; rel="last"/)?.[1] || 68) : 68
      setStats({ vol, issue })
    } catch { setStats({ vol: 68, issue: 68 }) }
  }, [])

  const fetchCommits = useCallback(async () => {
    try {
      const res = await fetch('https://api.github.com/repos/iamafridi/FredoCloud/commits?per_page=5')
      const data = await res.json()
      if (Array.isArray(data)) setCommits(data)
    } catch {}
  }, [])

  useEffect(() => { fetchStats(); fetchCommits() }, [fetchStats, fetchCommits])
  useEffect(() => { const id = setInterval(fetchStats, 120000); return () => clearInterval(id) }, [fetchStats])
  useEffect(() => { const id = setInterval(fetchCommits, 30000); return () => clearInterval(id) }, [fetchCommits])
  useEffect(() => {
    if (commits.length < 2) return
    const id = setInterval(() => setCommitIndex((i) => (i + 1) % commits.length), 5000)
    return () => clearInterval(id)
  }, [commits.length])

  return { stats, currentCommit: commits[commitIndex] || null, commits }
}

export default function LoginPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)
  const [mounted, setMounted] = useState(false)
  const s = c[theme]
  const clock = useBDClock()
  const { stats, currentCommit } = useGitHubData()

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (mounted && user) router.replace('/dashboard')
  }, [mounted, user, router])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  if (!mounted) return null
  if (user) return null

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
      <div className="hidden lg:flex flex-col justify-between w-[60%] relative" style={{ backgroundColor: s.bgLeft }}>
        <div className="flex items-center justify-between px-10 pt-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-wider" style={{ color: s.textPrimary }}>T·H</span>
            <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color: s.textSecondary }}>THE TEAM HUB</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] tracking-[0.2em]" style={{ color: s.textSecondary }}>
              VOL. {stats.vol} / ISSUE {stats.issue}
            </span>
            <span className="text-[10px] tracking-[0.15em] flex items-center gap-1" style={{ color: '#d4431a' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#d4431a' }} />
              LIVE
            </span>
            <button style={{ color: s.textSecondary }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-10">
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", color: s.textPrimary }} className="leading-[0.95]">
            <div className="text-[4.5rem] font-light tracking-tight">Where</div>
            <div className="text-[4.5rem] italic font-light tracking-tight">focus.<span style={{ color: '#d4431a' }}>.</span></div>
            <div className="text-[4.5rem] font-bold tracking-tight relative inline-block">
              drives action
              <span className="absolute -bottom-2 left-0 w-full h-1" style={{ backgroundColor: '#d4431a' }} />
            </div>
          </h1>

          <p className="mt-8 text-sm leading-relaxed max-w-md" style={{ color: s.textDesc }}>
            Goals, actions, announcements, and an immutable audit trail — a workspace your team will actually open every day. No clutter, no noise, just the tools your workflow demands.
          </p>

          <div className="mt-12 space-y-6 max-w-md">
            {[
              ['01', 'Ship with purpose', 'Milestone-tracked OKRs with progress sliders and live updates every owner actually sees.'],
              ['02', 'Real-time, not real-noisy', 'Live presence, instant WebSocket updates, and @mentions that route to the right inbox.'],
              ['03', 'Audit-ready by default', 'Every change is captured immutably. Filter by actor, export to CSV, and breeze through reviews.'],
            ].map(([num, title, desc]) => (
              <div key={num}>
                <div className="border-t border-dashed" style={{ borderColor: s.border }} />
                <div className="flex gap-4 pt-4">
                  <span className="text-sm font-mono font-bold" style={{ color: '#d4431a', width: 28 }}>{num}</span>
                  <div>
                    <p className="text-sm italic font-medium" style={{ fontFamily: "'Fraunces', Georgia, serif", color: s.textPrimary }}>{title}</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: s.textSecondary }}>{desc}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t border-dashed" style={{ borderColor: s.border }} />
          </div>
        </div>

        <div className="flex items-center justify-between px-10 pb-6 text-[11px] font-mono" style={{ color: s.textSecondary }}>
          <span className="truncate max-w-[80%]">
            {currentCommit ? (
              <>
                NOW @<span style={{ color: '#d4431a' }}>{currentCommit.author?.login || 'unknown'}</span>{' '}
                {currentCommit.commit?.message?.split('\n')[0]?.substring(0, 60)}
                {currentCommit.commit?.message?.split('\n')[0]?.length > 60 ? '…' : ''}
              </>
            ) : (
              'Loading live feed…'
            )}
          </span>
          <span className="flex-shrink-0">{clock.label} &middot; {clock.time} BDT</span>
        </div>
      </div>

      <div className="w-full lg:w-[40%] flex flex-col justify-center px-8 sm:px-14 lg:px-16 relative" style={{ backgroundColor: s.bgRight }}>
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px" style={{ backgroundColor: s.border }} />

        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: s.textMuted }}>
              &mdash; STEP 01 / SIGN IN
            </span>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#d4431a' }} />
            <span className="text-[10px] tracking-[0.15em]" style={{ color: s.textMuted2 }}>
              {clock.label} &middot; {clock.time}
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
            style={{ color: s.textMuted2, border: `1px solid ${s.border}` }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        <h2 className="text-4xl leading-tight mb-2" style={{ fontFamily: "'Fraunces', Georgia, serif", color: s.textPrimary }}>
          Welcome <span className="italic">back.</span>
        </h2>
        <p className="text-sm mb-8" style={{ color: s.textSecondary }}>
          New to the workbench?{' '}
          <a href="/register" className="underline" style={{ color: s.textPrimary }}>Open an account &rarr;</a>
        </p>

        <EmailPasswordForm />

        <p className="mt-10 text-center text-[9px] tracking-[0.3em] uppercase" style={{ color: s.textMuted2 }}>
          ENCRYPTED IN TRANSIT &middot; NEVER RESOLD
        </p>
      </div>
    </div>
  )
}