'use client'

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'destructive'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'amme-primary',
  secondary: 'amme-secondary',
  ghost: 'amme-ghost',
  success: 'amme-success',
  destructive: 'amme-danger-btn',
}

export function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  loading?: boolean
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${variantClass[variant]} ${loading ? 'amme-btn-loading' : ''} ${className}`.trim()}
    >
      {children}
    </button>
  )
}

export function Card({
  children,
  className = '',
  interactive = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      {...props}
      className={`amme-card ${interactive ? 'amme-card-interactive' : ''} ${className}`.trim()}
    >
      {children}
    </div>
  )
}

export function KpiCard({
  label,
  value,
  suffix,
  icon,
  tone = 'gold',
}: {
  label: string
  value: ReactNode
  suffix?: ReactNode
  icon?: ReactNode
  tone?: 'gold' | 'sage' | 'terracotta' | 'neutral'
}) {
  return (
    <div className={`amme-kpi amme-kpi-${tone}`}>
      {icon ? <span className="amme-kpi-icon">{icon}</span> : null}
      <div className="kl">{label}</div>
      <div className="kv">
        {value}
        {suffix ? <small>{suffix}</small> : null}
      </div>
    </div>
  )
}

export function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'gold' | 'success' | 'warning' | 'danger'
}) {
  return <span className={`amme-status amme-status-${tone}`}>{children}</span>
}
