import type { Metadata } from 'next'
import NotFoundClient from './NotFoundClient'

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return <NotFoundClient />
}
