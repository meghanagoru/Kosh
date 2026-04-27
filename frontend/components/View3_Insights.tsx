'use client'

import React, { useContext } from 'react'
import { Fn, FootnoteContext } from './FootnoteDrawer'

interface ShadowTaxData {
  safety_tax: { delta_rupees: number; budget_impact_pct: number }
  pink_tax: { delta_rupees: number; budget_impact_pct: number }
  total_hidden_cost_pct: number
}

interface Insight {
  title: string
  body: string
  recovery_rupees: number
}

interface Props {
  shadowTax: ShadowTaxData | null
  insights: Insight[]
  isLoading: boolean
  hasSubmitted: boolean
}

export default function View3Insights({
  shadowTax,
  insights,
  isLoading,
  hasSubmitted,
}: Props) {
  const fn = useContext(FootnoteContext)

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n)

  return (
    <section className="k-section" id="view-insights">
      <div className="k-container">
        {/* Section identifier */}
        <div className="flex items-center gap-4 mb-16">
          <span className="section-num">03</span>
          <div className="k-rule flex-1" />
          <span className="type-label text-muted">Hidden Costs & Sovereign Insights</span>
        </div>

        {!hasSubmitted ? (
          <UnsubmittedState />
        ) : (
          <>
            {/* Hidden Costs */}
            <div className="mb-20">
              <h2 className="type-heading text-ink mb-2">Hidden Costs</h2>
              <p className="type-body text-muted mb-10">
                These are value leaks invisible on your payslip but present in every transaction.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-rule">
                {/* Safety Tax */}
                <div className="p-8 md:border-r border-rule">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="type-label text-muted mb-1">Hidden Cost #01</p>
                      <div className="flex items-center gap-2">
                        <h3 className="type-subheading text-ink">Safety Tax</h3>
                        <Fn id="safety-tax" num={7} />
                      </div>
                    </div>
                    <div
                      className="px-2 py-1 type-label"
                      style={{
                        background: 'var(--color-leak)',
                        color: 'var(--color-paper)',
                        fontSize: '0.65rem',
                      }}
                    >
                      VALUE LEAK
                    </div>
                  </div>

                  {isLoading ? (
                    <LoadingPulse />
                  ) : shadowTax ? (
                    <>
                      <p
                        className="type-data mb-1"
                        style={{ fontFamily: 'var(--font-data)', color: 'var(--color-leak)', fontSize: '2.5rem' }}
                      >
                        ₹{fmt(shadowTax.safety_tax.delta_rupees)}
                      </p>
                      <p className="type-body text-muted mb-6">
                        premium over metro equivalent per month
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="type-label text-muted">Budget Impact</span>
                        <span
                          className="type-data-sm"
                          style={{ fontFamily: 'var(--font-data)', color: 'var(--color-leak)' }}
                        >
                          {fmt(shadowTax.safety_tax.budget_impact_pct)}% of total spend
                        </span>
                      </div>
                      <div className="leak-bar">
                        <div
                          className="leak-bar-fill pulse-leak"
                          style={{
                            width: `${Math.min(shadowTax.safety_tax.budget_impact_pct * 10, 100)}%`,
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <NullState text="No safety premium detected — commute data not provided." />
                  )}
                </div>

                {/* Pink Tax */}
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="type-label text-muted mb-1">Hidden Cost #02</p>
                      <div className="flex items-center gap-2">
                        <h3 className="type-subheading text-ink">Pink Tax</h3>
                        <Fn id="pink-tax" num={8} />
                      </div>
                    </div>
                    <div
                      className="px-2 py-1 type-label"
                      style={{
                        background: 'var(--color-leak)',
                        color: 'var(--color-paper)',
                        fontSize: '0.65rem',
                      }}
                    >
                      VALUE LEAK
                    </div>
                  </div>

                  {isLoading ? (
                    <LoadingPulse />
                  ) : shadowTax ? (
                    <>
                      <p
                        className="type-data mb-1"
                        style={{ fontFamily: 'var(--font-data)', color: 'var(--color-leak)', fontSize: '2.5rem' }}
                      >
                        ₹{fmt(shadowTax.pink_tax.delta_rupees)}
                      </p>
                      <p className="type-body text-muted mb-6">
                        gendered product premium per month
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="type-label text-muted">Budget Impact</span>
                        <span
                          className="type-data-sm"
                          style={{ fontFamily: 'var(--font-data)', color: 'var(--color-leak)' }}
                        >
                          {fmt(shadowTax.pink_tax.budget_impact_pct)}% of total spend
                        </span>
                      </div>
                      <div className="leak-bar">
                        <div
                          className="leak-bar-fill pulse-leak"
                          style={{
                            width: `${Math.min(shadowTax.pink_tax.budget_impact_pct * 10, 100)}%`,
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <NullState text="No gendered product premium detected." />
                  )}
                </div>
              </div>

              {/* Total Hidden Cost summary */}
              {shadowTax && !isLoading && (
                <div
                  className="border-l border-r border-b border-rule p-6 flex items-center justify-between"
                  style={{ borderColor: 'var(--color-rule)' }}
                >
                  <p className="type-label text-muted">Total Hidden Cost Impact</p>
                  <p
                    className="type-data"
                    style={{
                      fontFamily: 'var(--font-data)',
                      color: 'var(--color-leak)',
                      fontSize: '1.5rem',
                    }}
                  >
                    {fmt(shadowTax.total_hidden_cost_pct)}% of total budget
                  </p>
                </div>
              )}
            </div>

            {/* AI Insights */}
            <div>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="type-heading text-ink mb-2">Sovereign Insights</h2>
                  <p className="type-body text-muted">
                    3 data-driven actions to recover value from your specific financial pattern.
                  </p>
                </div>
                <span className="type-label text-dim hidden md:block">AI-generated</span>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-rule">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="insight-card md:border-r border-rule last:border-r-0">
                      <LoadingPulse />
                    </div>
                  ))}
                </div>
              ) : insights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-rule">
                  {insights.map((insight, i) => (
                    <InsightCard key={i} insight={insight} num={i + 1} />
                  ))}
                </div>
              ) : (
                <div className="border border-rule p-12 text-center">
                  <p className="type-body text-muted">
                    Submit the audit to generate insights.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InsightCard({ insight, num }: { insight: Insight; num: number }) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)

  return (
    <div className="insight-card md:border-r border-rule last:border-r-0 animate-in" style={{ animationDelay: `${num * 80}ms` }}>
      <div className="flex items-center justify-between mb-6">
        <span className="section-num">0{num}</span>
        <div className="flex items-center gap-2">
          <span className="type-label text-muted">Recover</span>
          <span
            className="insight-recovery"
            style={{ fontFamily: 'var(--font-data)', fontWeight: 700, fontSize: '1rem' }}
          >
            ₹{fmt(insight.recovery_rupees)}<span className="type-label text-muted">/mo</span>
          </span>
        </div>
      </div>

      <h3 className="type-subheading text-ink mb-4" style={{ fontSize: '1rem' }}>
        {insight.title}
      </h3>

      <p className="type-body text-muted" style={{ fontSize: '0.875rem', lineHeight: '1.7' }}>
        {insight.body}
      </p>

      {/* Recovery bar */}
      <div className="mt-6">
        <div className="leak-bar">
          <div
            className="leak-bar-fill"
            style={{
              width: `${Math.min((insight.recovery_rupees / 5000) * 100, 100)}%`,
              background: 'var(--color-ink)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

function UnsubmittedState() {
  return (
    <div className="border border-rule p-16 text-center">
      <p className="type-label text-dim mb-4">Complete The Audit First</p>
      <p className="type-body text-muted max-w-md mx-auto">
        Fill in the questionnaire above and submit to unlock your Hidden Cost analysis and
        personalised Sovereign Insights.
      </p>
    </div>
  )
}

function LoadingPulse() {
  return (
    <div className="space-y-3 py-4">
      {[80, 60, 90, 50].map((w, i) => (
        <div
          key={i}
          className="h-3 bg-surface animate-pulse"
          style={{ width: `${w}%`, animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  )
}

function NullState({ text }: { text: string }) {
  return (
    <p className="type-body text-dim italic">{text}</p>
  )
}
