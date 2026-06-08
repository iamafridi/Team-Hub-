import { Fraunces, Inter_Tight } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { FirebaseProvider } from '@/components/auth/FirebaseProvider'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', style: ['normal', 'italic'] })
const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight' })

export const metadata = {
  title: 'Team Hub',
  description: 'Collaborative team workspace',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎯</text></svg>" />
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
        <FirebaseProvider>
          {children}
        </FirebaseProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
