'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type BarcodeDetectorCtor = new (opts: { formats: string[] }) => {
  detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>
}

function getBarcodeDetector(): BarcodeDetectorCtor | null {
  if (typeof window === 'undefined') return null
  return (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector ?? null
}

export function ClinicBarcodeField({
  value,
  onChange,
  disabled,
  id,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  id?: string
}) {
  const { t } = useClinicLocale()
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)

  const stopScan = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    streamRef.current?.getTracks().forEach((tr) => tr.stop())
    streamRef.current = null
    setScanning(false)
  }, [])

  const startScan = useCallback(async () => {
    setScanError('')
    const BD = getBarcodeDetector()
    if (!BD) {
      setScanError(t.scanNotSupported)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current
      if (!video) {
        stream.getTracks().forEach((tr) => tr.stop())
        return
      }
      video.srcObject = stream
      await video.play()
      setScanning(true)
      const detector = new BD({
        formats: [
          'qr_code',
          'code_128',
          'ean_13',
          'ean_8',
          'code_39',
          'upc_a',
          'upc_e',
          'itf',
        ],
      })
      const tick = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          rafRef.current = requestAnimationFrame(() => void tick())
          return
        }
        try {
          const codes = await detector.detect(videoRef.current)
          if (codes.length > 0 && codes[0].rawValue) {
            onChange(codes[0].rawValue.trim())
            stopScan()
            return
          }
        } catch {
          /* ignore frame errors */
        }
        rafRef.current = requestAnimationFrame(() => void tick())
      }
      void tick()
    } catch {
      setScanError(t.scanPermissionDenied)
      stopScan()
    }
  }, [onChange, stopScan, t.scanNotSupported, t.scanPermissionDenied])

  useEffect(() => stopScan, [stopScan])

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          id={id}
          className="flex-1 min-w-[12rem] rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={() => (scanning ? stopScan() : void startScan())}
          disabled={disabled}
          className="min-h-11 px-4 rounded-xl border border-gray-200 font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
        >
          {scanning ? t.scanningBarcode : t.scanBarcode}
        </button>
      </div>
      {scanError && <p className="text-xs text-amber-800">{scanError}</p>}
      {scanning && (
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-black max-w-md">
          <video ref={videoRef} className="w-full h-auto max-h-64 object-cover" muted playsInline />
        </div>
      )}
    </div>
  )
}
