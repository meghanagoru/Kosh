'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/',        label: 'Home' },
  { href: '/ledger',  label: 'Ledger' },
  { href: '/audit',   label: 'Audit' },
  { href: '/insights',label: 'Insights' },
]

interface KoshyaNavProps {
  dark?: boolean
  onDarkToggle?: () => void
  // Optional slot for upload panel
  showUpload?: boolean
  onUploadToggle?: () => void
  uploadPanel?: React.ReactNode
}

export default function KoshyaNav({
  dark,
  onDarkToggle,
  showUpload,
  onUploadToggle,
  uploadPanel,
}: KoshyaNavProps) {
  const pathname = usePathname()

  return (
    <header
      className="sticky top-0 z-50 bg-paper"
      style={{ borderBottom: '1px solid var(--color-rule)' }}
    >
      {/* ── Row 1: Wordmark + Actions ── */}
      <div
        className="k-container flex items-center justify-between"
        style={{ height: 'var(--nav-h)' }}
      >
        {/* Wordmark */}
        <Link href="/" className="no-underline flex items-center gap-0" style={{ lineHeight: 1 }}>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
              letterSpacing: '-0.02em',
              color: 'var(--color-ink)',
            }}
          >
            KOSH
          </span>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
              letterSpacing: '-0.02em',
              color: 'var(--color-leak)',
            }}
          >
            YA
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {onUploadToggle && (
            <button
              id="upload-mospi-btn"
              onClick={onUploadToggle}
              className="k-btn py-2 px-4"
              style={{ fontSize: '0.625rem', letterSpacing: '0.12em' }}
            >
              MOSPI CSV
            </button>
          )}
          {onDarkToggle && (
            <button
              id="theme-toggle"
              onClick={onDarkToggle}
              aria-label="Toggle theme"
              className="w-9 h-9 border flex items-center justify-center transition-colors"
              style={{ borderColor: 'var(--color-rule)', fontSize: '0.75rem', color: 'var(--color-muted)' }}
            >
              {dark ? '○' : '●'}
            </button>
          )}
        </div>
      </div>

      {/* ── Row 2: Full-width tabs ── */}
      <nav
        aria-label="Main navigation"
        style={{ borderTop: '1px solid var(--color-rule)' }}
      >
        <div className="k-container flex items-stretch" style={{ height: 'var(--tab-h)', gap: 0 }}>
          {TABS.map(tab => {
            const active = tab.href === '/'
              ? pathname === '/'
              : pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="no-underline flex items-center transition-colors relative"
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.7rem',
                  fontWeight: active ? 700 : 400,
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                  color: active ? 'var(--color-ink)' : 'var(--color-muted)',
                  padding: '0 clamp(1.25rem, 3vw, 2.5rem)',
                  borderRight: '1px solid var(--color-rule)',
                  borderBottom: active ? '2px solid var(--color-ink)' : '2px solid transparent',
                  marginBottom: '-1px',
                  background: active ? 'var(--color-surface)' : 'transparent',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ── Optional upload panel ── */}
      {showUpload && uploadPanel && (
        <div style={{ borderTop: '1px solid var(--color-rule)' }}>
          {uploadPanel}
        </div>
      )}
    </header>
  )
}
