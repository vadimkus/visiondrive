'use client'

import { useParams } from 'next/navigation'
import PatientRecordClient from './PatientRecordClient'

export default function PatientDetailPage() {
  const params = useParams()
  const id = String(params.id || '')
  if (!id) return null
  return <PatientRecordClient patientId={id} />
}
