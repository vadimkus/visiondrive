import { describe, expect, it, vi, afterEach } from 'vitest'
import { pgRejectUnauthorized, postgresUrlNeedsTls } from '@/lib/db-tls'

describe('postgresUrlNeedsTls', () => {
  it('is true for Timescale host', () => {
    expect(
      postgresUrlNeedsTls(
        'postgres://u:p@foo.tsdb.cloud.timescale.com:123/db'
      )
    ).toBe(true)
  })
})

describe('pgRejectUnauthorized', () => {
  const url = 'postgres://u:p@foo.tsdb.cloud.timescale.com:123/db'

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is false in development by default', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('STRICT_SSL_VALIDATION', '')
    expect(pgRejectUnauthorized(url)).toBe(false)
  })

  it('is true in development when STRICT_SSL_VALIDATION', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('STRICT_SSL_VALIDATION', 'true')
    expect(pgRejectUnauthorized(url)).toBe(true)
  })

  it('is false for managed host in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('STRICT_SSL_VALIDATION', '')
    expect(pgRejectUnauthorized(url)).toBe(false)
  })
})
