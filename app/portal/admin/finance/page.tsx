import { Suspense } from 'react'
import FinanceClient from './FinanceClient'

export default function FinancePage() {
  return (
    <Suspense fallback={<div className="pt-32 pb-12 text-center text-gray-600">Loading finance…</div>}>
      <FinanceClient />
    </Suspense>
  )
}



