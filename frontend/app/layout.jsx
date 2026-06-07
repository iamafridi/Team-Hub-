// Global layout with error tracking
import { Fraunces, Inter_Tight } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import { ClerkSync } from '@/components/auth/ClerkSync'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', style: ['normal', 'italic'] })
const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight' })

export const metadata = {
  title: 'Team Hub',
  description: 'Collaborative team workspace',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const stored = localStorage.getItem('theme')
                    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                    document.documentElement.classList.add(stored || system)
                  } catch(e) {}
                })()
              `,
            }}
          />
        </head>
        <body className={`${fraunces.variable} ${interTight.variable}`}>
          <ClerkSync />
          {children}
          <Toaster position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  )
}
