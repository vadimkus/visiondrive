import { permanentRedirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function PublicPractitionerProfilePage() {
  // Solo-practitioner identity is private. Booking links remain
  // practitioner-controlled, but public profile pages are not exposed.
  permanentRedirect('/')
}
