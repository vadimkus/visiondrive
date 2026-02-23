import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <span className="text-8xl font-bold text-orange-500">404</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go to Homepage
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Contact Us
          </Link>
        </div>

        <nav className="mt-12 text-sm text-gray-500" aria-label="Helpful links">
          <p className="mb-3 font-medium text-gray-700">Helpful pages:</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <Link href="/solutions" className="text-orange-500 hover:text-orange-600 hover:underline">Solutions</Link>
            <Link href="/technology" className="text-orange-500 hover:text-orange-600 hover:underline">Technology</Link>
            <Link href="/about" className="text-orange-500 hover:text-orange-600 hover:underline">About Us</Link>
            <Link href="/faq" className="text-orange-500 hover:text-orange-600 hover:underline">FAQ</Link>
          </div>
        </nav>
      </div>
    </div>
  )
}
