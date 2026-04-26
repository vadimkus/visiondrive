import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  pgRejectUnauthorized,
  postgresUrlForNodePgWhenRelaxedTls,
  postgresUrlNeedsTls,
} from '@/lib/db-tls'

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

describe('postgresUrlForNodePgWhenRelaxedTls', () => {
  const url = 'postgres://u:p@foo.tsdb.cloud.timescale.com:123/db?sslmode=require'

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('strips sslmode in development when TLS is relaxed', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('STRICT_SSL_VALIDATION', '')
    expect(postgresUrlForNodePgWhenRelaxedTls(url)).toBe(
      'postgres://u:p@foo.tsdb.cloud.timescale.com:123/db'
    )
  })

  it('does not strip when STRICT_SSL_VALIDATION', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('STRICT_SSL_VALIDATION', 'true')
    expect(postgresUrlForNodePgWhenRelaxedTls(url)).toBe(url)
  })

  it('is stable when sslmode already removed', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('STRICT_SSL_VALIDATION', '')
    const once = postgresUrlForNodePgWhenRelaxedTls(url)
    expect(postgresUrlForNodePgWhenRelaxedTls(once)).toBe(once)
  })
})
