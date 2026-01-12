import { ReactNode } from 'react'

export default function OwnerLayout({ children }: { children: ReactNode }) {
  // Owner portal has its own full-screen layout, no sidebar
  return <>{children}</>
}
