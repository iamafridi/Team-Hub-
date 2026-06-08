'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useUIStore } from '@/store/uiStore'

function getStrength(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++
  return score
}

const strengthLabels = ['', 'WEAK', 'MEDIUM', 'STRONG', 'VERY STRONG']
const strengthColors = ['', '#d4431a', '#d4a017', '#2e7d32', '#1b5e20']

export function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const theme = useUIStore((s) => s.theme)
  const isDark = theme === 'dark'

  const c = {
    textSecondary: isDark ? '#a09888' : '#888',
    textMuted: isDark ? '#80786a' : '#999',
    textMuted2: isDark ? '#706858' : '#aaa',
    textPrimary: isDark ? '#e8e0d5' : '#1a1a1a',
    border: isDark ? '#444' : '#ccc',
    barBg: isDark ? '#3a3530' : '#d4cfc5',
  }

  const strength = getStrength(password)

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.replace('/dashboard')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-up failed. Please try again.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (strength < 1) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      router.replace('/dashboard')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists')
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div style={{ color: '#d4431a' }} className="text-xs tracking-wide uppercase text-center">
          {error}
        </div>
      )}

      <div>
        <div style={{ color: c.textSecondary }} className="text-[10px] tracking-[0.2em] uppercase font-medium mb-2">
          01 &nbsp; FULL NAME
        </div>
        <div className="flex items-center border-b" style={{ borderColor: c.border, paddingBottom: 6 }}>
          <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: c.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            required
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: c.textPrimary }}
          />
        </div>
      </div>

      <div>
        <div style={{ color: c.textSecondary }} className="text-[10px] tracking-[0.2em] uppercase font-medium mb-2">
          02 &nbsp; WORK EMAIL
        </div>
        <div className="flex items-center border-b" style={{ borderColor: c.border, paddingBottom: 6 }}>
          <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: c.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ada@company.com"
            required
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: c.textPrimary }}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span style={{ color: c.textSecondary }} className="text-[10px] tracking-[0.2em] uppercase font-medium">
            03 &nbsp; PASSWORD
          </span>
          <span style={{ color: c.textMuted2 }} className="text-[9px] tracking-[0.15em] uppercase">
            8+ chars, mixed case &amp; a number
          </span>
        </div>
        <div className="flex items-center border-b" style={{ borderColor: c.border, paddingBottom: 6 }}>
          <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: c.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: c.textPrimary }}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-2 flex-shrink-0" style={{ color: c.textMuted }}>
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {password.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-0.5 rounded-full" style={{ backgroundColor: c.barBg }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(strength / 4) * 100}%`,
                  backgroundColor: strengthColors[strength],
                }}
              />
            </div>
            <span className="text-[9px] tracking-[0.15em] uppercase flex-shrink-0" style={{ color: c.textMuted2 }}>
              STRENGTH &middot; {strengthLabels[strength]}
            </span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: isDark ? '#e8e0d5' : '#3a3530', color: isDark ? '#1a1a1a' : '#fff', borderRadius: 6 }}
      >
        <span className="tracking-[0.2em] uppercase">CONTINUE</span>
        <span>Open account &rarr;</span>
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: c.border }} />
        </div>
        <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em]">
          <span style={{ color: c.textMuted, backgroundColor: 'transparent', padding: '0 8px' }}>or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 px-5 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ border: `1px solid ${c.border}`, color: c.textPrimary, borderRadius: 6 }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span>{googleLoading ? 'Signing up...' : 'Continue with Google'}</span>
      </button>

      <p className="text-center text-[9px] tracking-[0.3em] uppercase" style={{ color: c.textMuted2 }}>
        BY CONTINUING, YOU AGREE TO OUR TERMS &middot; PRIVACY POLICY
      </p>
    </form>
  )
}
