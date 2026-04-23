import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

export function ClinicSpinner({
  label,
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      className={clsx('flex flex-col items-center justify-center gap-3 py-16', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="w-9 h-9 text-orange-500 animate-spin" aria-hidden />
      {label && <p className="text-sm text-gray-600">{label}</p>}
    </div>
  )
}
