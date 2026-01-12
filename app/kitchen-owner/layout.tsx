import { ReactNode } from 'react'

export const metadata = {
  title: "Abdul's Kitchen - VisionDrive Smart Kitchen",
  description: 'Temperature monitoring and food safety compliance dashboard',
}

export default function KitchenOwnerLayout({ children }: { children: ReactNode }) {
  // Owner portal has its own full-screen layout, completely standalone
  // No navbar, no footer - just the owner dashboard content
  return <>{children}</>
}
