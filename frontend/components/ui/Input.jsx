'use client'

import { forwardRef } from 'react'

export const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  iconPosition = 'left',
  type = 'text',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type={type}
          className={`
            w-full px-4 py-2 rounded-lg
            bg-surface border border-border
            text-text-primary placeholder-text-muted
            focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
            transition-all
            ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${Icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {Icon && (
          <Icon
            className={`
              absolute top-1/2 transform -translate-y-1/2
              w-4 h-4 text-text-muted
              ${iconPosition === 'left' ? 'left-3' : 'right-3'}
            `}
          />
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
