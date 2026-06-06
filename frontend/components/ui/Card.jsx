'use client'

import { motion } from 'framer-motion'

export function Card({
  children,
  className = '',
  hover = false,
  ...props
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' } : {}}
      className={`
        bg-surface border border-border rounded-lg
        p-4 transition-all ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}
