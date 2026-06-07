'use client'

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-surface border border-border shadow-none',
            headerTitle: 'text-text-primary font-serif',
            headerSubtitle: 'text-text-secondary',
            socialButtonsBlockButton:
              'bg-white border-border text-text-primary hover:bg-surface-2',
            dividerLine: 'bg-border',
            dividerText: 'text-text-muted',
            formFieldLabel: 'text-text-primary',
            formFieldInput:
              'bg-white border-border text-text-primary',
            footerActionText: 'text-text-secondary',
            footerActionLink: 'text-accent hover:text-accent/80',
          },
        }}
      />
    </div>
  )
}
