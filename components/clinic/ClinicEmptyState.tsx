import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

export function ClinicEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center px-6 py-12 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50',
        className
      )}
    >
      {Icon && <Icon className="w-10 h-10 text-gray-300 mb-3" aria-hidden />}
      <p className="text-base font-medium text-gray-800">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-2 max-w-sm">{description}</p>}
      {action && <div className="mt-5 w-full max-w-xs">{action}</div>}
    </div>
  )
}
