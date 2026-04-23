import { ClinicLocaleProvider } from '@/lib/clinic/clinic-locale'
import ClinicShell from './ClinicShell'

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClinicLocaleProvider>
      <ClinicShell>{children}</ClinicShell>
    </ClinicLocaleProvider>
  )
}
