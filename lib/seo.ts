import type { Metadata } from 'next'

export const siteUrl = 'https://visiondrive.ae'
export const siteName = 'VisionDrive'
export const legalName = 'VisionDrive Technologies FZ-LLC'
export const defaultLocale = 'en_AE'
export const publicLanguages = ['en', 'ru'] as const

export const corePositioning = {
  headline: 'A professional system for solo practitioners',
  productName: 'VisionDrive Practice OS',
  slogan: 'Practice operations, made clear',
  description:
    'VisionDrive Practice OS is a professional system for solo practitioners and independent clinics in the UAE: bookings, patient records, treatment notes, photos, inventory, payments, reminders, packages, and profitability reporting.',
  shortDescription:
    'A professional system for solo practitioners: bookings, records, notes, inventory, payments, reminders, and reporting from one private workspace.',
} as const

export const primaryKeywords = [
  'solo practitioner software UAE',
  'practice management software UAE',
  'professional system for solo practitioners',
  'clinic software Dubai',
  'independent clinic software UAE',
  'home visit practitioner software',
  'patient records software UAE',
  'appointment software Dubai',
  'treatment notes software',
  'before and after photo software',
  'clinic inventory payments software',
  'VisionDrive Practice OS',
] as const

export const ogImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'VisionDrive Practice OS — a professional system for solo practitioners',
} as const

export type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never'

export type PublicSeoRoute = {
  path: string
  title: string
  description: string
  keywords?: readonly string[]
  changeFrequency: ChangeFrequency
  priority: number
  sitemap?: boolean
}

export const publicSeoRoutes: readonly PublicSeoRoute[] = [
  {
    path: '/',
    title: 'A professional system for solo practitioners',
    description: corePositioning.description,
    keywords: primaryKeywords,
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    path: '/solutions',
    title: 'Practice OS solutions for solo practitioners',
    description:
      'Explore VisionDrive Practice OS workflows for UAE solo practitioners: booking, patient records, mobile notes, photos, payments, inventory, quotes, reminders, and follow-up.',
    keywords: [
      'Practice OS solutions',
      'solo practitioner software UAE',
      'clinic management UAE',
      'appointment scheduling software',
      'patient records software',
      'treatment notes software',
      'clinic payments software',
    ],
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  {
    path: '/technology',
    title: 'Practice OS technology and security',
    description:
      'Learn about VisionDrive Practice OS technology: private records, UAE data residency, authenticated workspaces, patient-safe sharing, payments, reminders, and analytics.',
    keywords: [
      'Practice OS technology',
      'UAE data residency software',
      'secure patient records software',
      'practitioner portal UAE',
      'private clinic software',
    ],
    changeFrequency: 'monthly',
    priority: 0.85,
  },
  {
    path: '/about',
    title: 'About VisionDrive Practice OS',
    description:
      'VisionDrive Technologies FZ-LLC builds Practice OS, a UAE-based professional system for solo practitioners and independent clinics.',
    keywords: [
      'VisionDrive',
      'VisionDrive Practice OS',
      'solo practitioner software UAE',
      'private practice software',
      'practice operations software',
    ],
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/contact',
    title: 'Contact VisionDrive for a Practice OS demo',
    description:
      'Contact VisionDrive for Practice OS demos, solo-practitioner onboarding, workflow review, and UAE practice operations software.',
    keywords: [
      'Practice OS demo',
      'contact VisionDrive',
      'solo practitioner software UAE',
      'private practice onboarding',
      'practice management software demo',
    ],
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/faq',
    title: 'FAQ for Practice OS',
    description:
      'Frequently asked questions about VisionDrive Practice OS: bookings, patient records, mobile practitioner mode, payments, patient portal, and UAE data residency.',
    keywords: [
      'VisionDrive FAQ',
      'Practice OS questions',
      'solo practitioner software UAE',
      'private practice software',
      'online booking software',
    ],
    changeFrequency: 'monthly',
    priority: 0.75,
  },
  {
    path: '/compliance',
    title: 'Practice OS security and UAE data residency',
    description:
      'VisionDrive Practice OS security and compliance posture for UAE data residency, private patient records, tenant isolation, patient-safe sharing, and privacy-aware practice operations.',
    keywords: [
      'Practice OS compliance',
      'UAE data residency',
      'patient records privacy',
      'patient data protection UAE',
      'secure clinic software UAE',
    ],
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    path: '/certificates',
    title: 'Practice OS security and compliance information',
    description:
      'Security, privacy, data-residency, and compliance information for VisionDrive Practice OS and UAE solo-practitioner workflows.',
    keywords: [
      'VisionDrive compliance',
      'Practice OS security',
      'patient data privacy',
      'UAE data residency',
      'clinic software compliance',
    ],
    changeFrequency: 'monthly',
    priority: 0.65,
  },
  {
    path: '/app',
    title: 'Practice OS mobile practitioner workspace',
    description:
      'VisionDrive Practice OS is a mobile-friendly practitioner workspace for appointments, patient records, visit notes, payments, reminders, and reporting.',
    keywords: [
      'Practice OS app',
      'mobile practitioner software',
      'clinic software app UAE',
      'patient records app',
      'appointment app UAE',
    ],
    changeFrequency: 'monthly',
    priority: 0.65,
  },
  {
    path: '/budget',
    title: 'Practice OS pricing inquiry',
    description:
      'Contact VisionDrive for Practice OS pilot pricing, onboarding, and implementation options for UAE solo practitioners and independent clinics.',
    keywords: [
      'Practice OS pricing',
      'solo practitioner software pricing',
      'clinic software UAE pricing',
      'VisionDrive pricing',
    ],
    changeFrequency: 'monthly',
    priority: 0.55,
  },
  {
    path: '/partners',
    title: 'VisionDrive Practice OS partners',
    description:
      'VisionDrive partners with UAE practitioners, independent clinics, and service providers to improve practice operations with Practice OS.',
    keywords: [
      'VisionDrive partners',
      'UAE practice software partners',
      'clinic software partnerships',
      'Practice OS',
    ],
    changeFrequency: 'monthly',
    priority: 0.5,
  },
  {
    path: '/mission',
    title: 'VisionDrive mission',
    description:
      'VisionDrive builds practice operations software for UAE solo practitioners: bookings, patient records, notes, payments, inventory, and business visibility.',
    keywords: [
      'VisionDrive mission',
      'Practice OS',
      'solo practitioners UAE',
      'clinic software',
      'practice management',
    ],
    changeFrequency: 'monthly',
    priority: 0.5,
  },
  {
    path: '/vision',
    title: 'VisionDrive vision for solo practitioners',
    description:
      'VisionDrive helps UAE solo practitioners manage bookings, records, payments, reminders, and practice reporting from one professional workspace.',
    keywords: [
      'VisionDrive vision',
      'solo practitioner software UAE',
      'Practice OS',
      'practice operations platform',
    ],
    changeFrequency: 'monthly',
    priority: 0.45,
  },
  {
    path: '/careers',
    title: 'Careers at VisionDrive',
    description:
      'Join VisionDrive and work on practice operations software for solo practitioners and independent clinics in the UAE.',
    keywords: [
      'VisionDrive careers',
      'software engineer jobs UAE',
      'practice management software jobs',
      'health tech careers UAE',
    ],
    changeFrequency: 'monthly',
    priority: 0.4,
  },
  {
    path: '/roadmap',
    title: 'VisionDrive Practice OS roadmap',
    description:
      'VisionDrive Practice OS roadmap and implementation timeline for UAE solo-practitioner workflows, private records, payments, automation, and analytics.',
    keywords: [
      'VisionDrive roadmap',
      'Practice OS roadmap',
      'clinic software plan',
      'practitioner portal',
    ],
    changeFrequency: 'monthly',
    priority: 0.4,
  },
  {
    path: '/privacy',
    title: 'Privacy policy',
    description:
      'VisionDrive privacy policy for Practice OS, practitioner workspaces, patient records, booking links, and UAE software services.',
    keywords: [
      'VisionDrive privacy',
      'Practice OS privacy',
      'patient data privacy UAE',
      'UAE data protection',
    ],
    changeFrequency: 'yearly',
    priority: 0.3,
  },
  {
    path: '/terms',
    title: 'Practice OS terms of service',
    description:
      'VisionDrive Practice OS terms of service for practitioner workspaces, patient portals, booking links, payments, AI-assisted workflows, and UAE software services.',
    keywords: [
      'Practice OS terms of service',
      'VisionDrive terms',
      'practitioner software terms',
      'patient portal terms',
      'UAE clinic software agreement',
    ],
    changeFrequency: 'yearly',
    priority: 0.3,
  },
] as const

export const indexedPublicPaths = publicSeoRoutes
  .filter((route) => route.sitemap !== false)
  .map((route) => route.path)

export const privateOrDuplicatePaths = [
  '/api/',
  '/portal/',
  '/clinic/',
  '/book/',
  '/patient-portal/',
  '/pay/',
  '/login',
  '/notes',
  '/profile/',
  '/roadmap2',
  '/sensor',
  '/municipalities',
  '/communities',
  '/data-analytics',
  '/download',
  '/app/download',
] as const

export function absoluteUrl(path = '/') {
  return new URL(path, siteUrl).toString()
}

export function getSeoRoute(path: string) {
  return publicSeoRoutes.find((route) => route.path === path)
}

export function createMarketingMetadata(path: string): Metadata {
  const route = getSeoRoute(path)

  if (!route) {
    throw new Error(`Missing SEO route definition for ${path}`)
  }

  const url = absoluteUrl(route.path)
  const title = route.title
  const description = route.description
  const keywords = Array.from(new Set([...(route.keywords ?? []), ...primaryKeywords]))

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: route.path,
    },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      type: 'website',
      url,
      siteName,
      locale: defaultLocale,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteName}`,
      description,
      images: [ogImage.url],
    },
  }
}

export function createNoIndexMetadata(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: absoluteUrl(path),
      siteName,
      locale: defaultLocale,
      images: [ogImage],
    },
  }
}
