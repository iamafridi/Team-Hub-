'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useFirebaseAuth } from './FirebaseProvider'

export function EmailPasswordForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const { signIn } = useFirebaseAuth()

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.replace('/dashboard')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      router.replace('/dashboard')
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.')
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

      {/* EMAIL FIELD */}
      <div>
        <div style={{ color: '#888' }} className="text-[10px] tracking-[0.2em] uppercase font-medium mb-2">
          01 &nbsp; EMAIL
        </div>
        <div className="flex items-center border-b" style={{ borderColor: '#ccc', paddingBottom: 6 }}>
          <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#999' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: '#1a1a1a' }}
          />
        </div>
      </div>

      {/* PASSWORD FIELD */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span style={{ color: '#888' }} className="text-[10px] tracking-[0.2em] uppercase font-medium">
            02 &nbsp; PASSWORD
          </span>
          <button type="button" style={{ color: '#999' }} className="text-[10px] tracking-[0.15em] uppercase hover:opacity-70">
            FORGOT
          </button>
        </div>
        <div className="flex items-center border-b" style={{ borderColor: '#ccc', paddingBottom: 6 }}>
          <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#999' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            style={{ color: '#1a1a1a' }}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-2 flex-shrink-0" style={{ color: '#999' }}>
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
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 6 }}
      >
        <span className="tracking-[0.2em] uppercase">CONTINUE</span>
        <span>Sign in &rarr;</span>
      </button>
    </form>
  )
}
