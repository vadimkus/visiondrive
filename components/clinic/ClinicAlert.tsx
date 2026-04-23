import clsx from 'clsx'

type Variant = 'error' | 'warning' | 'success'

const styles: Record<Variant, string> = {
  error: 'bg-red-50 text-red-800 border-red-100',
  warning: 'bg-amber-50 text-amber-900 border-amber-100',
  success: 'bg-emerald-50 text-emerald-900 border-emerald-100',
}

export function ClinicAlert({
  variant,
  children,
  role = 'alert',
  className,
}: {
  variant: Variant
  children: React.ReactNode
  role?: 'alert' | 'status'
  className?: string
}) {
  return (
    <div
      role={role}
      className={clsx('p-4 rounded-xl border text-sm', styles[variant], className)}
    >
      {children}
    </div>
  )
}
