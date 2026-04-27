'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import KoshyaNav from '@/components/KoshyaNav'
import { Fn, FootnoteDrawer, FootnoteContext, useFootnote } from '@/components/FootnoteDrawer'
import { useKoshyaStore } from '@/hooks/useKoshyaStore'

export default function InsightsPage() {
  const { shadowTax, insights, hasSubmittedAudit } = useKoshyaStore()
  const { activeFootnote, openFootnote, closeFootnote } = useFootnote()
  const [dark, setDark] = useState(false)
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n)

  return (
    <FootnoteContext.Provider value={{ open: openFootnote }}>
      <div className={dark ? 'dark' : ''}>
        <div className="bg-paper text-ink min-h-screen">
          <KoshyaNav dark={dark} onDarkToggle={() => setDark(v => !v)} />

          {/* Header */}
          <div className="k-container border-b" style={{ borderColor: 'var(--color-rule)', paddingTop: 'clamp(3rem, 6vw, 5rem)', paddingBottom: 'clamp(2rem, 4vw, 3.5rem)' }}>
            <p className="type-label text-muted mb-5">Hidden Costs & Insights</p>
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <h1 style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 'clamp(2.25rem, 5vw, 4.5rem)', lineHeight: 0.97, letterSpacing: '-0.035em' }}>
                What Inflation<br />Isn't Telling You
              </h1>
              {!hasSubmittedAudit && (
                <Link href="/audit" className="k-btn k-btn-primary no-underline" style={{ fontSize: '0.6875rem', flexShrink: 0 }}>
                  Complete Audit First →
                </Link>
              )}
            </div>
          </div>

          {!hasSubmittedAudit ? (
            <div className="k-container" style={{ paddingTop: 'var(--section-pad)', paddingBottom: 'var(--section-pad)' }}>
              <div className="border border-rule p-16 text-center">
                <p className="type-label text-dim mb-5">Audit Required</p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '1rem', lineHeight: 1.75, color: 'var(--color-muted)', maxWidth: 420, margin: '0 auto 2rem' }}>
                  Complete The Questionnaire to unlock your Hidden Cost analysis and personalised
                  Personalised Insights. The audit takes under 2 minutes.
                </p>
                <Link href="/audit" className="k-btn k-btn-primary no-underline" style={{ fontSize: '0.6875rem' }}>
                  Go to The Audit →
                </Link>
              </div>
            </div>
          ) : (
            <main className="k-container" style={{ paddingTop: 'var(--section-pad)', paddingBottom: 'var(--section-pad)' }}>

              {/* ── Hidden Costs ── */}
              <div className="mb-24">
                <div className="mb-12">
                  <h2 style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
                    Hidden Costs
                  </h2>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--color-muted)' }}>
                    Value leaks invisible on your payslip but present in every transaction.
                    Expressed as absolute ₹ and as a percentage of your total monthly budget.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-rule">
                  {/* Safety Tax */}
                  <div className="p-10 md:border-r border-rule">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <p className="type-label text-muted mb-3">Safety Premium</p>
                        <div className="flex items-center gap-2">
                          <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: '1.375rem', letterSpacing: '-0.02em' }}>Safety Tax</h3>
                          <Fn id="safety-tax" num={7} />
                        </div>
                      </div>
                      <span className="px-2 py-1 type-label" style={{ background: 'var(--color-leak)', color: 'var(--color-paper)', fontSize: '0.6rem', letterSpacing: '0.12em' }}>VALUE LEAK</span>
                    </div>

                    {shadowTax ? (
                      <>
                        <p style={{ fontFamily: 'var(--font-data)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--color-leak)', marginBottom: '0.5rem', lineHeight: 1 }}>
                          ₹{fmt(shadowTax.safety_tax.delta_rupees)}
                        </p>
                        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--color-muted)', marginBottom: '2rem' }}>
                          premium over metro equivalent per month
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="type-label text-muted">Budget Impact</span>
                          <span style={{ fontFamily: 'var(--font-data)', fontSize: '0.875rem', color: 'var(--color-leak)', fontWeight: 700 }}>
                            {fmt(shadowTax.safety_tax.budget_impact_pct)}% of total spend
                          </span>
                        </div>
                        <div className="leak-bar"><div className="leak-bar-fill pulse-leak" style={{ width: `${Math.min(shadowTax.safety_tax.budget_impact_pct * 10, 100)}%` }} /></div>
                      </>
                    ) : <p style={{ color: 'var(--color-dim)', fontStyle: 'italic', fontSize: '0.875rem' }}>No safety premium detected — commute data not provided.</p>}
                  </div>

                  {/* Pink Tax */}
                  <div className="p-10">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <p className="type-label text-muted mb-3">Gendered Premium</p>
                        <div className="flex items-center gap-2">
                          <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: '1.375rem', letterSpacing: '-0.02em' }}>Pink Tax</h3>
                          <Fn id="pink-tax" num={8} />
                        </div>
                      </div>
                      <span className="px-2 py-1 type-label" style={{ background: 'var(--color-leak)', color: 'var(--color-paper)', fontSize: '0.6rem', letterSpacing: '0.12em' }}>VALUE LEAK</span>
                    </div>

                    {shadowTax ? (
                      <>
                        <p style={{ fontFamily: 'var(--font-data)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--color-leak)', marginBottom: '0.5rem', lineHeight: 1 }}>
                          ₹{fmt(shadowTax.pink_tax.delta_rupees)}
                        </p>
                        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--color-muted)', marginBottom: '2rem' }}>
                          gendered product premium per month
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="type-label text-muted">Budget Impact</span>
                          <span style={{ fontFamily: 'var(--font-data)', fontSize: '0.875rem', color: 'var(--color-leak)', fontWeight: 700 }}>
                            {fmt(shadowTax.pink_tax.budget_impact_pct)}% of total spend
                          </span>
                        </div>
                        <div className="leak-bar"><div className="leak-bar-fill pulse-leak" style={{ width: `${Math.min(shadowTax.pink_tax.budget_impact_pct * 10, 100)}%` }} /></div>
                      </>
                    ) : <p style={{ color: 'var(--color-dim)', fontStyle: 'italic', fontSize: '0.875rem' }}>No gendered product premium detected.</p>}
                  </div>
                </div>

                {/* Total impact footer */}
                {shadowTax && (
                  <div className="border-l border-r border-b border-rule p-6 flex items-center justify-between" style={{ borderColor: 'var(--color-rule)' }}>
                    <p className="type-label text-muted">Total Hidden Cost Impact</p>
                    <p style={{ fontFamily: 'var(--font-data)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-leak)' }}>
                      {fmt(shadowTax.total_hidden_cost_pct)}% of total budget
                    </p>
                  </div>
                )}
              </div>

              {/* ── Sovereign Insights ── */}
              <div>
                <div className="mb-12">
                  <h2 style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
                    Your Insights
                  </h2>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--color-muted)' }}>
                    Three data-driven actions to recover value from your specific financial pattern.
                    Amounts are monthly estimates based on your audit data.
                  </p>
                </div>

                {insights.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-rule">
                    {insights.map((ins, i) => (
                      <div key={i} className={`insight-card ${i > 0 ? 'border-t md:border-t-0 md:border-l' : ''} animate-in`}
                        style={{ borderColor: 'var(--color-rule)', animationDelay: `${i * 80}ms` }}>
                        <div className="flex items-center justify-between mb-8">
                          <span style={{ fontFamily: 'var(--font-data)', fontSize: '0.75rem', color: 'var(--color-dim)', letterSpacing: '0.08em' }}>0{i + 1}</span>
                          <div className="flex items-center gap-2">
                            <span className="type-label text-muted">Recover</span>
                            <span style={{ fontFamily: 'var(--font-data)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                              ₹{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(ins.recovery_rupees)}
                              <span className="type-label text-muted" style={{ marginLeft: 2 }}>/mo</span>
                            </span>
                          </div>
                        </div>

                        <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '1rem', lineHeight: 1.4, letterSpacing: '-0.01em', marginBottom: '1rem' }}>
                          {ins.title}
                        </h3>
                        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', lineHeight: 1.8, color: 'var(--color-muted)' }}>
                          {ins.body}
                        </p>

                        <div className="mt-8">
                          <div className="leak-bar">
                            <div className="leak-bar-fill" style={{ width: `${Math.min((ins.recovery_rupees / 5000) * 100, 100)}%`, background: 'var(--color-ink)' }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-rule p-12 text-center">
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', lineHeight: 1.75, color: 'var(--color-muted)' }}>
                      No insights available. Complete the Audit to generate your personalised Insights.
                    </p>
                  </div>
                )}
              </div>

              {/* Nav back */}
              <div className="mt-16 pt-10 border-t flex items-center justify-between gap-6 flex-wrap" style={{ borderColor: 'var(--color-rule)' }}>
                <Link href="/audit" className="k-btn no-underline" style={{ fontSize: '0.6875rem' }}>
                  ← Re-run Audit
                </Link>
                <Link href="/ledger" className="k-btn no-underline" style={{ fontSize: '0.6875rem' }}>
                  ← Back to Ledger
                </Link>
              </div>
            </main>
          )}

          <FootnoteDrawer footnote={activeFootnote} onClose={closeFootnote} />
        </div>
      </div>
    </FootnoteContext.Provider>
  )
}
