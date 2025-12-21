export default function PortalLayout({ children }: { children: React.ReactNode }) {
  // Global offset for the fixed header so portal navigation/buttons are never hidden.
  return <div className="pt-24 sm:pt-28 md:pt-32">{children}</div>
}


