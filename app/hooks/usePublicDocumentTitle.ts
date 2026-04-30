'use client'

import { useEffect } from 'react'

export function usePublicDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}
