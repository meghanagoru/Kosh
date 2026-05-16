'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import KoshyaNav from '@/components/KoshyaNav'

const STATS = [
  { label: 'Govt. Avg. CPI', value: '5.1%', sub: 'All India 2024' },
  { label: 'Urban personal range', value: '6–9%', sub: 'Weighted basket estimate' },
  { label: 'Hidden cost average', value: '₹4,500', sub: 'Safety + Pink Tax p/m' },
]

const STAGES = [
  {
    href: '/ledger',
    title: 'The Ledger',
    body: 'Set your spending weights across food, housing, and fuel. See your personal inflation rate — weighted to your actual basket, not the government\'s generic average.',
    cta: 'Open Ledger →',
  },
  {
    href: '/audit',
    title: 'The Audit',
    body: 'A precise 3-section questionnaire covering commute, purchasing habits, and product choices. This is what unlocks your hidden cost analysis.',
    cta: 'Begin Audit →',
  },
  {
    href: '/insights',
    title: 'Insights',
    body: 'Three rupee-denominated recovery strategies from your audit data — covering food, housing, and hidden costs. Specific numbers, not generic advice.',
    cta: 'View Insights →',
  },
]

export default function HomePage() {
  const [dark, setDark] = useState(false)

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="bg-paper text-ink min-h-screen">
        <KoshyaNav dark={dark} onDarkToggle={() => setDark(v => !v)} />

        {/* ── Hero ── */}
        <section
          className="k-container"
          style={{
            paddingTop: 'clamp(5rem, 12vw, 9rem)',
            paddingBottom: 'clamp(3rem, 6vw, 5rem)',
            borderBottom: '1px solid var(--color-rule)',
          }}
        >
          <h1
            className="text-ink"
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 'clamp(4rem, 11vw, 10rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.045em',
              marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
              maxWidth: '14ch',
            }}
          >
            Your Real<br />Inflation Rate.<br />
            <span style={{ color: 'var(--color-leak)' }}>Not Theirs.</span>
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              lineHeight: 1.85,
              color: 'var(--color-muted)',
              maxWidth: '56ch',
              marginBottom: 'clamp(2rem, 4vw, 3rem)',
            }}
          >
            The government reports 5.1%. Your rent, cab rides, grocery bill, and
            gendered-product premium tell a different story. KOSHYA computes your
            personal inflation using MOSPI data and surfaces the value leaks hiding
            in every transaction.
          </p>

          <div className="flex flex-wrap gap-0">
            <Link href="/ledger" id="hero-cta-ledger" className="k-btn k-btn-primary no-underline" style={{ padding: '1.1rem 2.5rem' }}>
              Start with the Ledger →
            </Link>
            <Link href="/audit" id="hero-cta-audit" className="k-btn no-underline border-l-0" style={{ padding: '1.1rem 2rem' }}>
              Go straight to Audit
            </Link>
          </div>
        </section>

        {/* ── Govt Data Bar — horizontal, tight to hero ── */}
        <section style={{ borderBottom: '1px solid var(--color-rule)' }}>
          <div className="k-container grid grid-cols-3 gap-0">
            {STATS.map((s, i) => (
              <div
                key={i}
                className="py-7"
                style={{
                  borderRight: i < 2 ? '1px solid var(--color-rule)' : 'none',
                  paddingRight: i < 2 ? 'clamp(1.5rem, 3vw, 3rem)' : 0,
                  paddingLeft: i > 0 ? 'clamp(1.5rem, 3vw, 3rem)' : 0,
                }}
              >
                <p
                  className="type-label text-muted"
                  style={{ marginBottom: '0.5rem' }}
                >
                  {s.label}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: 'clamp(1.25rem, 2.5vw, 2rem)',
                    fontWeight: 700,
                    lineHeight: 1,
                    color: 'var(--color-ink)',
                    marginBottom: '0.375rem',
                  }}
                >
                  {s.value}
                </p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-dim)' }}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ₹100 Manifesto strip ── */}
        <section
          style={{
            background: 'var(--color-ink)',
            color: 'var(--color-paper)',
            borderBottom: '1px solid var(--color-rule)',
          }}
        >
          <div className="k-container py-16 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
              <p
                className="type-label"
                style={{ color: '#555', marginBottom: '1.5rem', letterSpacing: '0.14em' }}
              >
                The adjusted rupee
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 900,
                  fontSize: 'clamp(2rem, 5vw, 4rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.035em',
                  color: 'var(--color-paper)',
                }}
              >
                ₹100 today is<br />actually worth
                {' '}
                <span style={{ color: 'var(--color-leak)' }}>₹87.24</span><br />
                to you.
              </p>
            </div>
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '1rem',
                  lineHeight: 1.9,
                  color: '#8A8A8A',
                }}
              >
                After your personal inflation rate and the hidden costs embedded in your
                commute and product choices, every ₹100 of purchasing power is quietly
                eroded. KOSHYA makes that number exact — specific to your salary, your
                neighbourhood, your product choices.
              </p>
              <Link
                href="/ledger"
                className="no-underline mt-8 inline-flex k-btn"
                style={{ borderColor: '#444', color: 'var(--color-paper)', fontSize: '0.75rem' }}
              >
                Calculate Yours →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Three Stages ── */}
        <section
          className="k-container"
          style={{
            paddingTop: 'var(--section-pad)',
            paddingBottom: 'var(--section-pad)',
          }}
        >
          <div className="mb-14">
            <p className="type-label text-muted mb-4">Three stages of clarity</p>
            <h2
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 900,
                fontSize: 'clamp(1.75rem, 4vw, 3.25rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
              }}
            >
              From numbers to<br />actionable truth.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0" style={{ border: '1px solid var(--color-rule)' }}>
            {STAGES.map((stage, i) => (
              <div
                key={i}
                className="group"
                style={{
                  padding: 'clamp(2rem, 4vw, 3.5rem)',
                  borderLeft: i > 0 ? '1px solid var(--color-rule)' : 'none',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 900,
                    fontSize: '1.5rem',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.2,
                    marginBottom: '1.25rem',
                    color: 'var(--color-ink)',
                  }}
                >
                  {stage.title}
                </h3>

                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.85,
                    color: 'var(--color-muted)',
                    marginBottom: '2.5rem',
                  }}
                >
                  {stage.body}
                </p>

                <Link
                  href={stage.href}
                  className="k-btn no-underline"
                  style={{ fontSize: '0.6875rem' }}
                >
                  {stage.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ borderTop: '1px solid var(--color-rule)' }}>
          <div className="k-container py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: '0.9375rem', letterSpacing: '-0.01em', marginBottom: '1rem' }}>KOSHYA</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', lineHeight: 1.85, color: 'var(--color-muted)' }}>
                Personal inflation intelligence for Indian urban professionals.
              </p>
            </div>
            <div>
              <p className="type-label text-muted" style={{ marginBottom: '0.875rem' }}>Data Source</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', lineHeight: 1.85, color: 'var(--color-muted)' }}>
                Ministry of Statistics and Programme Implementation (MOSPI). CPI releases. Seeded: 2024 annual averages.
              </p>
            </div>
            <div>
              <p className="type-label text-muted" style={{ marginBottom: '0.875rem' }}>Privacy</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', lineHeight: 1.85, color: 'var(--color-muted)' }}>
                Your Koshya session is stored under an anonymous id on your own MongoDB (via the API). Calculation and insight requests go to your backend when you run it locally.
              </p>
            </div>
          </div>
          <div
            className="k-container py-4 flex items-center justify-between flex-wrap gap-2"
            style={{ borderTop: '1px solid var(--color-rule)' }}
          >
            <p className="type-label text-dim">© 2025 KOSHYA</p>
            <p className="type-label text-dim">MOSPI CPI Base: 2012=100</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
